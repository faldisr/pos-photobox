import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")

    const templates = await prisma.template.findMany({
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
      branchIds,
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
        branches:
          Array.isArray(branchIds) && branchIds.length > 0
            ? { connect: branchIds.map((id: string) => ({ id })) }
            : undefined,
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