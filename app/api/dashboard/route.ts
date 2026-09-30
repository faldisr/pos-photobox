import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addDays, startOfWibDay, wibDateKey, wibHour } from "@/lib/wib"

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

    // Hitung rentang waktu berdasarkan period — "hari" selalu hari WIB, apa pun
    // zona waktu server (dulu: server WIB → grafik 7/30 hari kehilangan penjualan
    // hari ini; server UTC → grafik per jam bergeser 7 jam)
    const today = startOfWibDay()
    const tomorrow = addDays(today, 1)

    let rangeStart: Date | undefined
    if (period === "today") {
      rangeStart = today
    } else if (period === "week") {
      rangeStart = addDays(today, -6)
    } else if (period === "month") {
      rangeStart = addDays(today, -29)
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
      // Pelanggan baru hari ini — untuk kasir, hanya yang bertransaksi di cabangnya
      prisma.customer.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          ...(branchId ? { transactions: { some: { branchId } } } : {}),
        },
      }),
      // "all" tidak butuh transaksi satu per satu — dijumlahkan per bulan di database (di bawah)
      period === "all" ? [] : prisma.transaction.findMany({
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
        const key = `${String(wibHour(t.createdAt)).padStart(2, "0")}:00`
        hourMap[key] += Number(t.total)
      }
      salesChart = Object.entries(hourMap).map(([date, total]) => ({ date, total }))
    } else if (period === "week") {
      // Per hari 7 hari terakhir
      const dayMap: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) dayMap[wibDateKey(addDays(today, -i))] = 0
      for (const t of chartTransactions) {
        const key = wibDateKey(t.createdAt)
        if (key in dayMap) dayMap[key] += Number(t.total)
      }
      salesChart = Object.entries(dayMap).map(([date, total]) => ({ date, total }))
    } else if (period === "month") {
      // Per hari 30 hari terakhir
      const dayMap: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) dayMap[wibDateKey(addDays(today, -i))] = 0
      for (const t of chartTransactions) {
        const key = wibDateKey(t.createdAt)
        if (key in dayMap) dayMap[key] += Number(t.total)
      }
      salesChart = Object.entries(dayMap).map(([date, total]) => ({ date, total }))
    } else {
      // all: per bulan WIB (createdAt disimpan UTC → +7 jam), dijumlahkan di database —
      // data "semua" terus bertambah, jangan diambil satu per satu
      const months = await prisma.$queryRaw<{ bulan: string; total: Prisma.Decimal }[]>`
        SELECT DATE_FORMAT(createdAt + INTERVAL 7 HOUR, '%Y-%m') AS bulan, SUM(total) AS total
        FROM transactions
        WHERE status = 'COMPLETED' ${branchId ? Prisma.sql`AND branchId = ${branchId}` : Prisma.empty}
        GROUP BY bulan ORDER BY bulan`
      salesChart = months.map((m) => ({ date: m.bulan, total: Number(m.total) }))
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