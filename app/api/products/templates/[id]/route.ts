import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get template by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

// PUT - Update template
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
      category,
      description,
      thumbnailUrl,
      isActive,
      isPopular,
    } = body

    const existing = await prisma.template.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (code !== existing.code) {
      const codeExists = await prisma.template.findUnique({
        where: { code },
      })

      if (codeExists) {
        return NextResponse.json({ error: "Kode template sudah digunakan" }, { status: 400 })
      }
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name,
        code,
        category,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        isActive,
        isPopular,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

// DELETE - Delete template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.template.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    const transactionCount = await prisma.transactionItem.count({
      where: { templateId: id },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus template yang sudah digunakan dalam transaksi" },
        { status: 400 }
      )
    }

    await prisma.template.delete({ where: { id } })

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}