import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { code, name, type, value, minPurchase, usageLimit, isActive } = body

    const existing = await prisma.promo.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Promo tidak ditemukan" }, { status: 404 })
    }

    // Jika kode diubah, cek duplikat
    if (code && code.trim().toUpperCase() !== existing.code) {
      const duplicate = await prisma.promo.findUnique({
        where: { code: code.trim().toUpperCase() },
      })
      if (duplicate) {
        return NextResponse.json({ error: "Kode promo sudah digunakan" }, { status: 400 })
      }
    }

    if (type && !["PERCENTAGE", "FIXED_AMOUNT"].includes(type)) {
      return NextResponse.json({ error: "Tipe promo tidak valid" }, { status: 400 })
    }
    if (value !== undefined && value !== null && Number(value) <= 0) {
      return NextResponse.json({ error: "Nilai promo harus lebih dari 0" }, { status: 400 })
    }
    const resolvedType = type ?? existing.type
    const resolvedValue = value !== undefined ? Number(value) : Number(existing.value)
    if (resolvedType === "PERCENTAGE" && resolvedValue > 100) {
      return NextResponse.json({ error: "Persentase tidak boleh lebih dari 100" }, { status: 400 })
    }

    const updated = await prisma.promo.update({
      where: { id },
      data: {
        ...(code        !== undefined && { code:        code.trim().toUpperCase() }),
        ...(name        !== undefined && { name:        name.trim() }),
        ...(type        !== undefined && { type }),
        ...(value       !== undefined && { value:       Number(value) }),
        ...(minPurchase !== undefined && { minPurchase: minPurchase ? Number(minPurchase) : null }),
        ...(usageLimit  !== undefined && { usageLimit:  usageLimit  ? Number(usageLimit)  : null }),
        ...(isActive    !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating promo:", error)
    return NextResponse.json({ error: "Gagal mengupdate promo" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.promo.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Promo tidak ditemukan" }, { status: 404 })
    }

    await prisma.promo.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo:", error)
    return NextResponse.json({ error: "Gagal menghapus promo" }, { status: 500 })
  }
}