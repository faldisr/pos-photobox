import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - List all add-ons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")

    const addOns = await prisma.addOn.findMany({
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

    return NextResponse.json(addOns)
  } catch (error) {
    console.error("Error fetching add-ons:", error)
    return NextResponse.json(
      { error: "Failed to fetch add-ons" },
      { status: 500 }
    )
  }
}

// POST - Create new add-on
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      code,
      type,
      price,
      description,
      imageUrl,
      isActive,
      branchIds,
    } = body

    // Validate required fields
    if (!name || !code || !type || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate type enum
    const validTypes = ["EXTRA_PRINT", "FRAME", "DIGITAL_FILE", "PROPS", "OTHER"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid add-on type" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.addOn.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Kode add-on sudah digunakan" },
        { status: 400 }
      )
    }

    const addOn = await prisma.addOn.create({
      data: {
        name,
        code,
        type,
        price,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
        branches:
          Array.isArray(branchIds) && branchIds.length > 0
            ? { connect: branchIds.map((id: string) => ({ id })) }
            : undefined,
      },
    })

    return NextResponse.json(addOn, { status: 201 })
  } catch (error) {
    console.error("Error creating add-on:", error)
    return NextResponse.json(
      { error: "Failed to create add-on" },
      { status: 500 }
    )
  }
}