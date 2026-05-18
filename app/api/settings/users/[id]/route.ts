import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { UserRole } from "@prisma/client"

// GET - Get user by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        branchId: true,
        branch: { select: { name: true } },
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, branchId, username } = body

    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    // Cek duplikasi email (jika email berubah)
    if (email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 400 }
        )
      }
    }

    // Cek duplikasi username (jika username berubah)
    if (username && username !== existing.username) {
      const usernameExists = await prisma.user.findUnique({ where: { username } })
      if (usernameExists) {
        return NextResponse.json(
          { error: "Username sudah digunakan" },
          { status: 400 }
        )
      }
    }

    const updateData: {
      name: string
      email: string
      username?: string
      role: UserRole
      branchId: string | null
      password?: string
    } = {
      name,
      email,
      role: role as UserRole,
      branchId: branchId || null,
    }

    // Hanya update username kalau diisi
    if (username && username.trim() !== "") {
      updateData.username = username
    }

    // Hanya hash dan update password kalau diisi
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        branchId: true,
        branch: { select: { name: true } },
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}