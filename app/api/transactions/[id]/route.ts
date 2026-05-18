import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // ── Handler: mark as printed ──────────────────────────────────────────
    if (body.isPrinted === true) {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
      })

      if (!transaction) {
        return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: { isPrinted: true },
      })

      return NextResponse.json(updated)
    }

    // ── Handler: refund ───────────────────────────────────────────────────
    // Hanya SUPER_ADMIN yang boleh refund
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { refundReason } = body

    if (!refundReason || !refundReason.trim()) {
      return NextResponse.json({ error: "Alasan refund harus diisi" }, { status: 400 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
    }

    if (transaction.status === "CANCELLED") {
      return NextResponse.json({ error: "Transaksi sudah di-refund atau dibatalkan" }, { status: 400 })
    }

    if (transaction.status !== "COMPLETED") {
      return NextResponse.json({ error: "Hanya transaksi dengan status Selesai yang bisa di-refund" }, { status: 400 })
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
        refundReason: refundReason.trim(),
        refundedAt: new Date(),
        cancelledBy: session.user.id,
        cancelledAt: new Date(),
      },
      include: {
        cashier:  { select: { name: true } },
        customer: { select: { name: true, phone: true } },
        items:    true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 500 })
  }
}