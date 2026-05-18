import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get branch by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const branch = await prisma.branch.findUnique({
      where: { id },
    })

    if (!branch) {
      return NextResponse.json({ error: "Cabang tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(branch)
  } catch (error) {
    console.error("Error fetching branch:", error)
    return NextResponse.json({ error: "Failed to fetch branch" }, { status: 500 })
  }
}

// PUT - Update branch
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
      phone,
      address,
      email,
      city,
      province,
      postalCode,
      isActive,
      operationalHours,
    } = body

    const existing = await prisma.branch.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Cabang tidak ditemukan" }, { status: 404 })
    }

    if (code !== existing.code) {
      const codeExists = await prisma.branch.findUnique({
        where: { code },
      })

      if (codeExists) {
        return NextResponse.json(
          { error: "Kode cabang sudah digunakan" },
          { status: 400 }
        )
      }
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name,
        code,
        phone: phone || null,
        address: address || null,
        email: email || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        isActive,
        operationalHours: operationalHours || null,
      },
    })

    return NextResponse.json(branch)
  } catch (error) {
    console.error("Error updating branch:", error)
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 })
  }
}

// DELETE - Delete branch
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.branch.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Cabang tidak ditemukan" }, { status: 404 })
    }

    await prisma.branch.delete({ where: { id } })

    return NextResponse.json({ message: "Branch deleted successfully" })
  } catch (error) {
    console.error("Error deleting branch:", error)
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 })
  }
}