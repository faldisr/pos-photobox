import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code      = searchParams.get("code")     ?? ""
    const totalStr  = searchParams.get("subtotal") ?? "0"
    const total     = parseFloat(totalStr) || 0

    if (!code.trim()) {
      return NextResponse.json({ error: "Kode promo harus diisi" }, { status: 400 })
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.trim().toUpperCase() },
    })

    if (!promo) {
      return NextResponse.json({ error: "Kode promo tidak ditemukan" }, { status: 404 })
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "Kode promo tidak aktif" }, { status: 400 })
    }

    if (promo.minPurchase && total < Number(promo.minPurchase)) {
      return NextResponse.json(
        {
          error: `Minimum pembelian untuk promo ini adalah Rp ${Number(promo.minPurchase).toLocaleString("id-ID")}`,
        },
        { status: 400 }
      )
    }

    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ error: "Kuota promo sudah habis" }, { status: 400 })
    }

    let discountAmount = 0
    if (promo.type === "PERCENTAGE") {
      discountAmount = Math.floor((total * Number(promo.value)) / 100)
    } else {
      discountAmount = Math.min(Number(promo.value), total)
    }

    return NextResponse.json({
      id:             promo.id,
      code:           promo.code,
      name:           promo.name,
      type:           promo.type,
      value:          Number(promo.value),
      discountAmount,
    })
  } catch (error) {
    console.error("Error validating promo:", error)
    return NextResponse.json({ error: "Gagal memvalidasi promo" }, { status: 500 })
  }
}