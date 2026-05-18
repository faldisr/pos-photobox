import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - List all templates
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

// POST - Create new template
export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!name || !code || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.template.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Kode template sudah digunakan" },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: {
        name,
        code,
        category,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        isActive: isActive ?? true,
        isPopular: isPopular ?? false,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}