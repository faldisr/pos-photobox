import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") ?? ""

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ]
    }

    const promos = await prisma.promo.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(promos)
  } catch (error) {
    console.error("Error fetching promos:", error)
    return NextResponse.json({ error: "Gagal mengambil data promo" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, type, value, minPurchase, usageLimit } = body

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Kode promo harus diisi" }, { status: 400 })
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama promo harus diisi" }, { status: 400 })
    }
    if (!type || !["PERCENTAGE", "FIXED_AMOUNT"].includes(type)) {
      return NextResponse.json({ error: "Tipe promo tidak valid" }, { status: 400 })
    }
    if (value === undefined || value === null || Number(value) <= 0) {
      return NextResponse.json({ error: "Nilai promo harus lebih dari 0" }, { status: 400 })
    }
    if (type === "PERCENTAGE" && Number(value) > 100) {
      return NextResponse.json({ error: "Persentase tidak boleh lebih dari 100" }, { status: 400 })
    }

    const existing = await prisma.promo.findUnique({
      where: { code: code.trim().toUpperCase() },
    })
    if (existing) {
      return NextResponse.json({ error: "Kode promo sudah digunakan" }, { status: 400 })
    }

    const promo = await prisma.promo.create({
      data: {
        code:        code.trim().toUpperCase(),
        name:        name.trim(),
        type,
        value:       Number(value),
        minPurchase: minPurchase ? Number(minPurchase) : null,
        usageLimit:  usageLimit  ? Number(usageLimit)  : null,
        isActive:    true,
        usageCount:  0,
      },
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.error("Error creating promo:", error)
    return NextResponse.json({ error: "Gagal membuat promo" }, { status: 500 })
  }
}