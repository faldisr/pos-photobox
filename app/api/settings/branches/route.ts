import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - List all branches
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(branches)
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    )
  }
}

// POST - Create new branch
export async function POST(request: Request) {
  try {
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

    if (!name || !code) {
      return NextResponse.json(
        { error: "Nama dan kode cabang harus diisi" },
        { status: 400 }
      )
    }

    const existing = await prisma.branch.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Kode cabang sudah digunakan" },
        { status: 400 }
      )
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        code,
        phone: phone || null,
        address: address || null,
        email: email || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        isActive: isActive ?? true,
        operationalHours: operationalHours || null,
      },
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    console.error("Error creating branch:", error)
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    )
  }
}