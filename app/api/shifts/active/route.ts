import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const shift = await prisma.shift.findFirst({
      where: {
        cashierId: session.user.id,
        endTime: null,
      },
      include: {
        cashier: { select: { name: true } },
      },
      orderBy: { startTime: "desc" },
    })

    if (!shift) {
      return NextResponse.json({ error: "Tidak ada shift aktif" }, { status: 404 })
    }

    return NextResponse.json(shift)
  } catch (error) {
    console.error("Error fetching active shift:", error)
    return NextResponse.json({ error: "Failed to fetch active shift" }, { status: 500 })
  }
}