import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ─── GET: Daftar inventory per cabang atau semua cabang ───────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId") ?? ""

    const inventories = await prisma.inventory.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        item: true,
        ...(branchId ? {} : { branch: { select: { name: true } } }),
      },
      orderBy: { item: { name: "asc" } },
    })

    const data = inventories.map((inv) => ({
      id: inv.id,
      quantity: inv.quantity,
      lastRestockDate: inv.lastRestockDate,
      branchName: "branch" in inv ? (inv.branch as { name: string })?.name ?? null : null,
      item: {
        id: inv.item.id,
        name: inv.item.name,
        code: inv.item.code,
        category: inv.item.category,
        unit: inv.item.unit,
        minStock: inv.item.minStock,
        unitCost: inv.item.unitCost ? Number(inv.item.unitCost) : null,
      },
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Gagal memuat data inventory" }, { status: 500 })
  }
}

// ─── POST: Tambah item baru + stok awal ───────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branchId, name, code, category, unit, minStock, quantity, unitCost } = body

    if (!branchId || !name || !code || !category || !unit) {
      return NextResponse.json(
        { error: "branchId, nama, kode, kategori, dan satuan harus diisi" },
        { status: 400 }
      )
    }

    const existing = await prisma.inventoryItem.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: "Kode item sudah digunakan" }, { status: 400 })
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } })
    if (!branch) {
      return NextResponse.json({ error: "Cabang tidak ditemukan" }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.create({
        data: {
          name,
          code,
          category,
          unit,
          minStock: minStock ?? 10,
          unitCost: unitCost ?? null,
          isActive: true,
        },
      })

      const inventory = await tx.inventory.create({
        data: {
          branchId,
          itemId: item.id,
          quantity: quantity ?? 0,
          lastRestockDate: quantity > 0 ? new Date() : null,
        },
      })

      return { item, inventory }
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Gagal menambah item inventory" }, { status: 500 })
  }
}