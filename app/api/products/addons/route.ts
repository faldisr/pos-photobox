import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - List all add-ons
export async function GET() {
  try {
    const addOns = await prisma.addOn.findMany({
      orderBy: { createdAt: "desc" },
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