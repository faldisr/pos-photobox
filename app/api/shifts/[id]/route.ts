import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    return NextResponse.json(shift)
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
    const { closingBalance, notes } = body

    if (closingBalance === undefined || closingBalance < 0) {
      return NextResponse.json({ error: "Saldo penutup tidak valid" }, { status: 400 })
    }

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

    const expectedBalance = Number(shift.openingBalance) + Number(shift.cashSales)
    const difference = closingBalance - expectedBalance

    const updated = await prisma.shift.update({
      where: { id },
      data: {
        endTime: new Date(),
        closingBalance,
        expectedBalance,
        difference,
        notes: notes || null,
      },
      include: { cashier: { select: { name: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error closing shift:", error)
    return NextResponse.json({ error: "Failed to close shift" }, { status: 500 })
  }
}