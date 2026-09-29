import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

// GET - Get branch by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireRole()
    if (guard.error) return guard.error

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
    const guard = await requireRole(["SUPER_ADMIN"])
    if (guard.error) return guard.error

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
    const guard = await requireRole(["SUPER_ADMIN"])
    if (guard.error) return guard.error

    const { id } = await params

    const existing = await prisma.branch.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Cabang tidak ditemukan" }, { status: 404 })
    }

    // Cabang yang sudah punya riwayat atau masih dipakai tidak boleh dihapus.
    // Riwayat (transaksi/shift/stok) sebenarnya sudah dilindungi foreign key di DB,
    // tapi kasir TIDAK — tanpa cek ini kasirnya diam-diam kehilangan cabang.
    const [transaksi, shift, stok, user] = await Promise.all([
      prisma.transaction.count({ where: { branchId: id } }),
      prisma.shift.count({ where: { branchId: id } }),
      prisma.inventory.count({ where: { branchId: id } }),
      prisma.user.count({ where: { branchId: id } }),
    ])
    const dipakai = [
      transaksi && `${transaksi.toLocaleString("id-ID")} transaksi`,
      shift     && `${shift.toLocaleString("id-ID")} shift`,
      stok      && `${stok} data stok`,
      user      && `${user} user/kasir`,
    ].filter(Boolean)
    if (dipakai.length > 0) {
      return NextResponse.json({
        error: `Cabang tidak bisa dihapus karena sudah memiliki ${dipakai.join(", ")}. ` +
          (transaksi || shift || stok
            ? "Data yang sudah punya riwayat tidak boleh dihapus — nonaktifkan cabang ini sebagai gantinya."
            : "Pindahkan user/kasir ke cabang lain terlebih dahulu."),
      }, { status: 409 })
    }

    await prisma.branch.delete({ where: { id } })

    return NextResponse.json({ message: "Branch deleted successfully" })
  } catch (error) {
    // Transaksi baru bisa masuk di antara pengecekan & penghapusan — foreign key
    // di DB tetap menolaknya (P2003); balas dengan pesan yang sama jelasnya.
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json({ error: "Cabang tidak bisa dihapus karena masih memiliki data terkait. Nonaktifkan cabang ini sebagai gantinya." }, { status: 409 })
    }
    console.error("Error deleting branch:", error)
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 })
  }
}