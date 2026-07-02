import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - List all packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")

    const packages = await prisma.package.findMany({
      where: branchId
        ? {
            OR: [
              { branches: { none: {} } },
              { branches: { some: { id: branchId } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { branches: { select: { id: true } } },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    )
  }
}

// POST - Create new package
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      code,
      description,
      imageUrl,
      basePrice,
      photoCount,
      isActive,
      branchIds,
    } = body

    // Validate required fields
    if (!name || !code || !basePrice || !photoCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.package.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Kode paket sudah digunakan" },
        { status: 400 }
      )
    }

    const package_ = await prisma.package.create({
      data: {
        name,
        code,
        description: description || null,
        imageUrl: imageUrl || null,
        basePrice,
        photoCount,
        isActive: isActive ?? true,
        branches:
          Array.isArray(branchIds) && branchIds.length > 0
            ? { connect: branchIds.map((id: string) => ({ id })) }
            : undefined,
      },
    })

    return NextResponse.json(package_, { status: 201 })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    )
  }
}