import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

    const existingShift = await prisma.shift.findFirst({
      where: {
        cashierId: session.user.id,
        endTime: null,
      },
    })

    if (existingShift) {
      return NextResponse.json(
        { error: "Sudah ada shift aktif untuk akun ini" },
        { status: 400 }
      )
    }

    const shift = await prisma.shift.create({
      data: {
        shiftNo: generateShiftNo(),
        branchId: session.user.branchId,
        cashierId: session.user.id,
        startTime: new Date(),
        openingBalance,
      },
      include: {
        cashier: { select: { name: true } },
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error("Error creating shift:", error)
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 })
  }
}

export { generateTransactionNo }