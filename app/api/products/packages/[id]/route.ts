import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get package by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const package_ = await prisma.package.findUnique({
      where: { id },
    })

    if (!package_) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json(package_)
  } catch (error) {
    console.error("Error fetching package:", error)
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 })
  }
}

// PUT - Update package
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
      description,
      imageUrl,
      basePrice,
      photoCount,
      isActive,
    } = body

    // Check if package exists
    const existing = await prisma.package.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Check if code is being changed and already exists
    if (code !== existing.code) {
      const codeExists = await prisma.package.findUnique({
        where: { code },
      })

      if (codeExists) {
        return NextResponse.json({ error: "Kode paket sudah digunakan" }, { status: 400 })
      }
    }

    const package_ = await prisma.package.update({
      where: { id },
      data: {
        name,
        code,
        description: description || null,
        imageUrl: imageUrl || null,
        basePrice,
        photoCount,
        isActive,
      },
    })

    return NextResponse.json(package_)
  } catch (error) {
    console.error("Error updating package:", error)
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
  }
}

// DELETE - Delete package
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.package.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    const transactionCount = await prisma.transactionItem.count({
      where: { packageId: id },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus paket yang sudah digunakan dalam transaksi" },
        { status: 400 }
      )
    }

    await prisma.package.delete({ where: { id } })

    return NextResponse.json({ message: "Package deleted successfully" })
  } catch (error) {
    console.error("Error deleting package:", error)
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
  }
}