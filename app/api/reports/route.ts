import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type      = searchParams.get("type")      ?? "transaction"
    const dateFrom  = searchParams.get("dateFrom")  ?? ""
    const dateTo    = searchParams.get("dateTo")    ?? ""
    const cashierId = searchParams.get("cashierId") ?? ""
    const branchId  = searchParams.get("branchId")  ?? ""
    const page      = parseInt(searchParams.get("page")  ?? "1")
    const limit     = parseInt(searchParams.get("limit") ?? "50")
    const skip      = (page - 1) * limit

    const where: Record<string, unknown> = {
      status: "COMPLETED",
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo   ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) } : {}),
      }
    }

    if (cashierId) where.cashierId = cashierId
    if (branchId)  where.branchId  = branchId

    // ─── Laporan Transaksi ─────────────────────────────────────────────────
    if (type === "transaction") {
      // Where untuk semua transaksi (COMPLETED + CANCELLED/refund)
      const whereAll: Record<string, unknown> = {
        status: { in: ["COMPLETED", "CANCELLED"] },
      }
      if (dateFrom || dateTo) whereAll.createdAt = where.createdAt
      if (cashierId) whereAll.cashierId = cashierId
      if (branchId)  whereAll.branchId  = branchId

      const [transactions, total, refundCount] = await Promise.all([
        prisma.transaction.findMany({
          where: whereAll,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            cashier:  { select: { name: true } },
            customer: { select: { name: true, phone: true } },
            items:    true,
          },
        }),
        prisma.transaction.count({ where: whereAll }),
        prisma.transaction.count({
          where: {
            ...whereAll,
            paymentStatus: "REFUNDED",
          },
        }),
      ])

      return NextResponse.json({
        data: transactions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          refundCount,
        },
      })
    }

    // ─── Laporan Pendapatan ────────────────────────────────────────────────
    if (type === "revenue") {
      const transactions = await prisma.transaction.findMany({
        where,
        select: {
          total:         true,
          createdAt:     true,
          paymentMethod: true,
        },
        orderBy: { createdAt: "asc" },
      })

      const revenueMap: Record<string, { date: string; total: number; count: number }> = {}
      for (const trx of transactions) {
        const date = trx.createdAt.toISOString().split("T")[0]
        if (!revenueMap[date]) revenueMap[date] = { date, total: 0, count: 0 }
        revenueMap[date].total += Number(trx.total)
        revenueMap[date].count += 1
      }

      const paymentSummary: Record<string, number> = {}
      for (const trx of transactions) {
        const m = trx.paymentMethod
        paymentSummary[m] = (paymentSummary[m] ?? 0) + Number(trx.total)
      }

      return NextResponse.json({
        chartData:    Object.values(revenueMap),
        paymentSummary,
        totalRevenue: transactions.reduce((s, t) => s + Number(t.total), 0),
        totalTrx:     transactions.length,
      })
    }

    // ─── Laporan Pelanggan ─────────────────────────────────────────────────
    if (type === "customer") {
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          orderBy: { totalSpent: "desc" },
          skip,
          take: limit,
          select: {
            id:          true,
            name:        true,
            phone:       true,
            totalVisits: true,
            totalSpent:  true,
            lastVisit:   true,
          },
        }),
        prisma.customer.count(),
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
    }

    // ─── Laporan Produk Terlaris ───────────────────────────────────────────
    if (type === "product") {
      const items = await prisma.transactionItem.findMany({
        where: { transaction: where },
        select: {
          itemName: true,
          itemType: true,
          quantity: true,
          subtotal: true,
        },
      })

      const productMap: Record<string, {
        itemName: string
        itemType: string
        totalQty: number
        totalRevenue: number
      }> = {}

      for (const item of items) {
        if (!productMap[item.itemName]) {
          productMap[item.itemName] = {
            itemName:     item.itemName,
            itemType:     item.itemType,
            totalQty:     0,
            totalRevenue: 0,
          }
        }
        productMap[item.itemName].totalQty     += item.quantity
        productMap[item.itemName].totalRevenue += Number(item.subtotal)
      }

      const sorted = Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty)
      return NextResponse.json({ data: sorted })
    }

    return NextResponse.json({ error: "Tipe laporan tidak valid" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}