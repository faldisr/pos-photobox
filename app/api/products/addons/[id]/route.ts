import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get add-on by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const addOn = await prisma.addOn.findUnique({
      where: { id },
    })

    if (!addOn) {
      return NextResponse.json({ error: "Add-on not found" }, { status: 404 })
    }

    return NextResponse.json(addOn)
  } catch (error) {
    console.error("Error fetching add-on:", error)
    return NextResponse.json({ error: "Failed to fetch add-on" }, { status: 500 })
  }
}

// PUT - Update add-on
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      code,
      type,
      price,
      description,
      imageUrl,
      isActive,
    } = body

    const existing = await prisma.addOn.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Add-on not found" }, { status: 404 })
    }

    const validTypes = ["EXTRA_PRINT", "FRAME", "DIGITAL_FILE", "PROPS", "OTHER"]
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid add-on type" }, { status: 400 })
    }

    if (code !== existing.code) {
      const codeExists = await prisma.addOn.findUnique({
        where: { code },
      })

      if (codeExists) {
        return NextResponse.json({ error: "Kode add-on sudah digunakan" }, { status: 400 })
      }
    }

    const addOn = await prisma.addOn.update({
      where: { id },
      data: {
        name,
        code,
        type,
        price,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive,
      },
    })

    return NextResponse.json(addOn)
  } catch (error) {
    console.error("Error updating add-on:", error)
    return NextResponse.json({ error: "Failed to update add-on" }, { status: 500 })
  }
}

// DELETE - Delete add-on
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.addOn.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Add-on not found" }, { status: 404 })
    }

    const transactionCount = await prisma.transactionItem.count({
      where: { addOnId: id },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus add-on yang sudah digunakan dalam transaksi" },
        { status: 400 }
      )
    }

    await prisma.addOn.delete({ where: { id } })

    return NextResponse.json({ message: "Add-on deleted successfully" })
  } catch (error) {
    console.error("Error deleting add-on:", error)
    return NextResponse.json({ error: "Failed to delete add-on" }, { status: 500 })
  }
}