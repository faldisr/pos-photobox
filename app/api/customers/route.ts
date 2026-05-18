import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ─── GET: Daftar pelanggan dengan filter, search, pagination ─────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page   = parseInt(searchParams.get("page")  ?? "1")
    const limit  = parseInt(searchParams.get("limit") ?? "20")
    const search = searchParams.get("search") ?? ""
    const id     = searchParams.get("id") ?? ""

    // Detail satu pelanggan + riwayat transaksinya
    if (id) {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              items: true,
              cashier: { select: { name: true } },
            },
          },
        },
      })

      if (!customer) {
        return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 })
      }

      return NextResponse.json(customer)
    }

    // Daftar pelanggan
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name:  { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { lastVisit: "desc" },
        skip,
        take: limit,
        select: {
          id:          true,
          name:        true,
          phone:       true,
          email:       true,
          totalVisits: true,
          totalSpent:  true,
          lastVisit:   true,
          createdAt:   true,
        },
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

// ─── PATCH: Edit pelanggan ────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, phone, email, address, notes } = body

    if (!id) {
      return NextResponse.json({ error: "ID pelanggan diperlukan" }, { status: 400 })
    }

    const existing = await prisma.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 })
    }

    // Cek duplikat phone jika diubah
    if (phone && phone !== existing.phone) {
      const duplicate = await prisma.customer.findUnique({ where: { phone } })
      if (duplicate) {
        return NextResponse.json({ error: "Nomor HP sudah digunakan pelanggan lain" }, { status: 400 })
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name:    name    ?? existing.name,
        phone:   phone   ?? existing.phone,
        email:   email   ?? existing.email,
        address: address ?? existing.address,
        notes:   notes   ?? existing.notes,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

// ─── DELETE: Hapus pelanggan ──────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID pelanggan diperlukan" }, { status: 400 })
    }

    const existing = await prisma.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 })
    }

    await prisma.customer.delete({ where: { id } })

    return NextResponse.json({ message: "Pelanggan berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}