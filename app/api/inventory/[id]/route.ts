import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ─── PATCH: Update stok (restock / koreksi / return) ─────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { quantityChange, type, note } = body

    if (quantityChange === undefined || quantityChange === null) {
      return NextResponse.json({ error: "quantityChange harus diisi" }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: "Jenis perubahan harus dipilih" }, { status: 400 })
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: { item: true },
    })

    if (!inventory) {
      return NextResponse.json({ error: "Inventory tidak ditemukan" }, { status: 404 })
    }

    const newQuantity = inventory.quantity + quantityChange

    if (newQuantity < 0) {
      return NextResponse.json(
        {
          error: `Stok tidak cukup. Stok tersedia: ${inventory.quantity} ${inventory.item.unit}`,
        },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.update({
        where: { id },
        data: {
          quantity: newQuantity,
          lastRestockDate: quantityChange > 0 ? new Date() : undefined,
        },
      })

      await tx.inventoryLog.create({
        data: {
          itemId: inventory.itemId,
          type,
          quantity: quantityChange,
          quantityBefore: inventory.quantity,
          quantityAfter: newQuantity,
          note: note || null,
          createdBy: "system",
        },
      })

      return inv
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ error: "Gagal memperbarui stok" }, { status: 500 })
  }
}

// ─── DELETE: Hapus inventory + nonaktifkan item ───────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const inventory = await prisma.inventory.findUnique({
      where: { id },
    })

    if (!inventory) {
      return NextResponse.json({ error: "Inventory tidak ditemukan" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.inventory.delete({ where: { id } }),
      prisma.inventoryItem.update({
        where: { id: inventory.itemId },
        data: { isActive: false },
      }),
    ])

    return NextResponse.json({ message: "Item berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting inventory:", error)
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 })
  }
}