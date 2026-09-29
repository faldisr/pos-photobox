import { NextRequest, NextResponse } from "next/server"
import { prisma, retryOnUniqueConflict } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateTransactionNo } from "@/lib/utils"

function generateShiftNo() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, "")
  const rand = Math.floor(Math.random() * 900) + 100
  return `SHF-${date}-${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { openingBalance } = body

    if (openingBalance === undefined || openingBalance < 0) {
      return NextResponse.json({ error: "Saldo awal tidak valid" }, { status: 400 })
    }

    if (!session.user.branchId) {
      return NextResponse.json(
        { error: "User belum terdaftar di cabang manapun" },
        { status: 400 }
      )
    }

    const { branchId, id: cashierId } = session.user

    // Cabang yang dinonaktifkan admin tidak boleh beroperasi (shift baru ditolak)
    const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { isActive: true } })
    if (!branch?.isActive) {
      return NextResponse.json(
        { error: "Cabang Anda sedang dinonaktifkan. Hubungi admin." },
        { status: 400 }
      )
    }

    // Cek "sudah ada shift aktif" dan pembuatan shift harus satu langkah atomik.
    // Tanpa kunci, dua request yang datang bersamaan (klik ganda, Enter dua kali,
    // dua tab) sama-sama lolos pengecekan lalu sama-sama membuat shift. Baris user
    // dikunci dulu, jadi request kedua menunggu request pertama selesai — lalu
    // melihat shift yang baru dibuat dan ditolak.
    const openShift = () => prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${cashierId} FOR UPDATE`

      const existingShift = await tx.shift.findFirst({
        where: { cashierId, endTime: null },
      })
      if (existingShift) return null

      return tx.shift.create({
        data: {
          shiftNo: generateShiftNo(),
          branchId,
          cashierId,
          startTime: new Date(),
          openingBalance,
        },
        include: {
          cashier: { select: { name: true } },
        },
      })
    })

    // shiftNo acak bisa bentrok (UNIQUE) — kalau terjadi, dibuat ulang dengan nomor baru
    const shift = await retryOnUniqueConflict(openShift, "shiftNo")

    if (!shift) {
      return NextResponse.json(
        { error: "Sudah ada shift aktif untuk akun ini" },
        { status: 400 }
      )
    }

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error("Error creating shift:", error)
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 })
  }
}

export { generateTransactionNo }