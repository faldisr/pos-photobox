import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "today" // today | week | month | all
    const isCashier = session.user.role === "CASHIER"

    // Kasir hanya bisa lihat cabangnya sendiri
    const branchId = isCashier
      ? (session.user.branchId ?? undefined)
      : (searchParams.get("branchId") ?? undefined)

    // Hitung rentang waktu berdasarkan period
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let rangeStart: Date | undefined
    if (period === "today") {
      rangeStart = today
    } else if (period === "week") {
      rangeStart = new Date(today)
      rangeStart.setDate(rangeStart.getDate() - 6)
    } else if (period === "month") {
      rangeStart = new Date(today)
      rangeStart.setDate(rangeStart.getDate() - 29)
    }
    // period === "all" -> rangeStart = undefined (tidak ada filter tanggal)

    const baseWhere = {
      status: "COMPLETED" as const,
      ...(rangeStart ? { createdAt: { gte: rangeStart, lt: tomorrow } } : {}),
      ...(branchId ? { branchId } : {}),
    }

    // where untuk stats card tetap hari ini
    const todayWhere = {
      status: "COMPLETED" as const,
      createdAt: { gte: today, lt: tomorrow },
      ...(branchId ? { branchId } : {}),
    }

    const [transactions, totalRevenue, newCustomers, chartTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: todayWhere,
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          cashier: { select: { name: true } },
          customer: { select: { name: true } },
        },
      }),
      prisma.transaction.aggregate({
        where: todayWhere,
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.customer.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.transaction.findMany({
        where: baseWhere,
        select: { createdAt: true, total: true },
        orderBy: { createdAt: "asc" },
      }),
    ])

    const paymentSummary = await prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: todayWhere,
      _sum: { total: true },
    })

    // Build chart data sesuai period
    let salesChart: { date: string; total: number }[]

    if (period === "today") {
      // Per jam 00:00 - 23:00
      const hourMap: Record<string, number> = {}
      for (let h = 0; h < 24; h++) {
        hourMap[`${String(h).padStart(2, "0")}:00`] = 0
      }
      for (const t of chartTransactions) {
        const hour = new Date(t.createdAt).getHours()
        const key = `${String(hour).padStart(2, "0")}:00`
        hourMap[key] += Number(t.total)
      }
      salesChart = Object.entries(hourMap).map(([date, total]) => ({ date, total }))
    } else if (period === "week") {
      // Per hari 7 hari terakhir
      const dayMap: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dayMap[d.toISOString().slice(0, 10)] = 0
      }
      for (const t of chartTransactions) {
        const key = new Date(t.createdAt).toISOString().slice(0, 10)
        if (key in dayMap) dayMap[key] += Number(t.total)
      }
      salesChart = Object.entries(dayMap).map(([date, total]) => ({ date, total }))
    } else if (period === "month") {
      // Per hari 30 hari terakhir
      const dayMap: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dayMap[d.toISOString().slice(0, 10)] = 0
      }
      for (const t of chartTransactions) {
        const key = new Date(t.createdAt).toISOString().slice(0, 10)
        if (key in dayMap) dayMap[key] += Number(t.total)
      }
      salesChart = Object.entries(dayMap).map(([date, total]) => ({ date, total }))
    } else {
      // all: per bulan
      const monthMap: Record<string, number> = {}
      for (const t of chartTransactions) {
        const d = new Date(t.createdAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        monthMap[key] = (monthMap[key] ?? 0) + Number(t.total)
      }
      salesChart = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, total]) => ({ date, total }))
    }

    return NextResponse.json({
      todayRevenue: Number(totalRevenue._sum.total ?? 0),
      todayTransactions: totalRevenue._count.id,
      newCustomers,
      salesChart,
      period,
      paymentSummary: paymentSummary.map((p) => ({
        method: p.paymentMethod,
        total: Number(p._sum.total ?? 0),
      })),
      recentTransactions: transactions.map((t) => ({
        id: t.id,
        transactionNo: t.transactionNo,
        customerName: t.customer?.name ?? "",
        total: Number(t.total),
        status: t.status,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}