import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET() {
  try {
    const guard = await requireRole(["SUPER_ADMIN"])
    if (guard.error) return guard.error

    const cashiers = await prisma.user.findMany({
      where: { role: { in: ["CASHIER","SUPER_ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(cashiers)
  } catch (error) {
    console.error("Error fetching cashiers:", error)
    return NextResponse.json({ error: "Failed to fetch cashiers" }, { status: 500 })
  }
}