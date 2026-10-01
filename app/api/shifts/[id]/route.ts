import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { computeShiftTotals } from "@/lib/shift"
import { rupiahError } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const shift = await prisma.shift.findUnique({
      where: { id },
      include: { cashier: { select: { name: true } } },
    })

    if (!shift) {
      return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 })
    }

    if (shift.cashierId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Ringkasan dihitung dari transaksi (refund tidak dihitung), bukan dari penghitung berjalan
    return NextResponse.json({ ...shift, ...(await computeShiftTotals(prisma, id)) })
  } catch (error) {
    console.error("Error fetching shift:", error)
    return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const notes = typeof body.notes === "string" ? body.notes.trim() : ""

    // Satu angka: uang yang disetor kasir (disimpan di closingBalance seperti versi lama)
    const invalid = rupiahError(body.closingBalance, "Uang disetor")
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 })
    }
    const closingBalance = Number(body.closingBalance)

    const shift = await prisma.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 })
    }

    if (shift.cashierId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (shift.endTime !== null) {
      return NextResponse.json({ error: "Shift sudah ditutup" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Antre dengan penyimpanan transaksi di cabang yang sama, supaya tidak ada
      // pembayaran yang masuk di antara penghitungan total & penutupan shift
      await tx.$queryRaw`SELECT id FROM branches WHERE id = ${shift.branchId} FOR UPDATE`

      const totals = await computeShiftTotals(tx, id)
      // Kas seharusnya & selisih tetap dicatat seperti versi lama, tapi tidak ditampilkan
      const expectedBalance = Number(shift.openingBalance) + totals.cashSales

      // Bersyarat endTime null: dua permintaan tutup bersamaan hanya satu yang lolos
      const { count } = await tx.shift.updateMany({
        where: { id, endTime: null },
        data: {
          ...totals,
          endTime: new Date(),
          closingBalance,
          expectedBalance,
          difference: closingBalance - expectedBalance,
          notes: notes || null,
        },
      })
      return count
    })

    if (result === 0) {
      return NextResponse.json({ error: "Shift sudah ditutup" }, { status: 400 })
    }

    const updated = await prisma.shift.findUnique({
      where: { id },
      include: { cashier: { select: { name: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error closing shift:", error)
    return NextResponse.json({ error: "Failed to close shift" }, { status: 500 })
  }
}
