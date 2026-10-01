import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { parsePagination } from "@/lib/utils"
import { wibDateRange } from "@/lib/wib"

// Batas baris per sekali export (all=1) — melindungi memori server kalau
// "Semua" dipilih tanpa filter tanggal setelah data menumpuk bertahun-tahun.
const EXPORT_MAX_ROWS = 50_000

const tooManyRows = (count: number, hint: string) =>
  NextResponse.json(
    { error: `Data terlalu banyak untuk diexport sekaligus (${count.toLocaleString("id-ID")} baris). ${hint}` },
    { status: 400 }
  )

export async function GET(request: NextRequest) {
  try {
    const guard = await requireRole(["SUPER_ADMIN"])
    if (guard.error) return guard.error

    const { searchParams } = new URL(request.url)
    const type      = searchParams.get("type")      ?? "transaction"
    const dateFrom  = searchParams.get("dateFrom")  ?? ""
    const dateTo    = searchParams.get("dateTo")    ?? ""
    const cashierId = searchParams.get("cashierId") ?? ""
    const branchId  = searchParams.get("branchId")  ?? ""
    const search    = (searchParams.get("search") ?? "").trim()
    // all=1: dipakai tombol Excel/PDF — semua baris sesuai filter, tanpa halaman
    const exportAll = searchParams.get("all") === "1"

    const { page, limit, skip, error: pageError } = parsePagination(searchParams, 50)
    // Tanggal = hari WIB penuh (00:00–23:59), bukan jam 07:00 atau zona waktu server
    const { range, error: dateError } = wibDateRange(dateFrom, dateTo)
    if (pageError || dateError) {
      return NextResponse.json({ error: pageError ?? dateError }, { status: 400 })
    }

    const where: Record<string, unknown> = {
      status: "COMPLETED",
    }

    if (range) where.createdAt = range

    if (cashierId) where.cashierId = cashierId
    if (branchId)  where.branchId  = branchId

    // ─── Laporan Transaksi ─────────────────────────────────────────────────
    if (type === "transaction") {
      // Where untuk semua transaksi (COMPLETED + CANCELLED/refund)
      const whereAll: Record<string, unknown> = {
        status: { in: ["COMPLETED", "CANCELLED"] },
      }
      if (range)     whereAll.createdAt = range
      if (cashierId) whereAll.cashierId = cashierId
      if (branchId)  whereAll.branchId  = branchId
      // Kotak pencarian: no. transaksi, nama/HP pelanggan, atau nama kasir
      if (search) {
        whereAll.OR = [
          { transactionNo: { contains: search } },
          { customer: { name:  { contains: search } } },
          { customer: { phone: { contains: search } } },
          { cashier:  { name:  { contains: search } } },
        ]
      }

      if (exportAll) {
        const count = await prisma.transaction.count({ where: whereAll })
        if (count > EXPORT_MAX_ROWS) return tooManyRows(count, "Persempit rentang tanggal lalu coba lagi.")

        // Hanya kolom yang dicetak di file: ±4x lebih kecil & 2x lebih cepat
        // dibanding mengambil semua kolom (diukur pada 12.000 transaksi/bulan).
        const data = await prisma.transaction.findMany({
          where: whereAll,
          orderBy: { createdAt: "desc" },
          select: {
            transactionNo: true,
            createdAt:     true,
            total:         true,
            paymentMethod: true,
            promoCode:     true,
            status:        true,
            cashier:  { select: { name: true } },
            customer: { select: { name: true } },
            items:    { select: { itemName: true, quantity: true } },
          },
        })
        return NextResponse.json({ data })
      }

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
      // Dijumlahkan di database per hari WIB (createdAt disimpan UTC → +7 jam),
      // bukan mengambil semua transaksi ke server lalu dijumlahkan satu per satu
      const conds = [Prisma.sql`status = 'COMPLETED'`]
      if (range?.gte) conds.push(Prisma.sql`createdAt >= ${range.gte}`)
      if (range?.lt)  conds.push(Prisma.sql`createdAt < ${range.lt}`)
      if (cashierId)  conds.push(Prisma.sql`cashierId = ${cashierId}`)
      if (branchId)   conds.push(Prisma.sql`branchId = ${branchId}`)

      const [days, methods] = await Promise.all([
        prisma.$queryRaw<{ hari: string; total: Prisma.Decimal; n: bigint }[]>`
          SELECT DATE_FORMAT(createdAt + INTERVAL 7 HOUR, '%Y-%m-%d') AS hari, SUM(total) AS total, COUNT(*) AS n
          FROM transactions WHERE ${Prisma.join(conds, " AND ")}
          GROUP BY hari ORDER BY hari`,
        prisma.transaction.groupBy({
          by: ["paymentMethod"],
          where,
          _sum: { total: true },
          _min: { createdAt: true },
          orderBy: { _min: { createdAt: "asc" } }, // urutan metode = urutan pertama kali dipakai
        }),
      ])

      const chartData = days.map((d) => ({ date: d.hari, total: Number(d.total), count: Number(d.n) }))
      return NextResponse.json({
        chartData,
        paymentSummary: Object.fromEntries(methods.map((m) => [m.paymentMethod, Number(m._sum.total ?? 0)])),
        totalRevenue:   chartData.reduce((s, d) => s + d.total, 0),
        totalTrx:       chartData.reduce((s, d) => s + d.count, 0),
      })
    }

    // ─── Laporan Pelanggan ─────────────────────────────────────────────────
    if (type === "customer") {
      const customerSelect = {
        id:          true,
        name:        true,
        phone:       true,
        totalVisits: true,
        totalSpent:  true,
        lastVisit:   true,
      }

      if (exportAll) {
        const count = await prisma.customer.count()
        if (count > EXPORT_MAX_ROWS) return tooManyRows(count, "Hubungi admin sistem.")
        const data = await prisma.customer.findMany({ orderBy: { totalSpent: "desc" }, select: customerSelect })
        return NextResponse.json({ data })
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          orderBy: { totalSpent: "desc" },
          skip,
          take: limit,
          select: customerSelect,
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
      // Dijumlahkan di database per nama + tipe; beberapa baris per produk saja
      const groups = await prisma.transactionItem.groupBy({
        by: ["itemName", "itemType"],
        where: { transaction: where },
        _sum: { quantity: true, subtotal: true },
        orderBy: [{ itemName: "asc" }, { itemType: "asc" }],
      })

      const productMap: Record<string, {
        itemName: string
        itemType: string
        totalQty: number
        totalRevenue: number
      }> = {}

      for (const g of groups) {
        const p = productMap[g.itemName]
        if (!p) {
          productMap[g.itemName] = {
            itemName:     g.itemName,
            itemType:     g.itemType,
            totalQty:     g._sum.quantity ?? 0,
            totalRevenue: Number(g._sum.subtotal ?? 0),
          }
          continue
        }
        // Nama sama dengan tipe berbeda (mis. KOSTUM sebagai paket & add-on): satu baris, kedua tipe ditulis
        p.itemType     += ` / ${g.itemType}`
        p.totalQty     += g._sum.quantity ?? 0
        p.totalRevenue += Number(g._sum.subtotal ?? 0)
      }

      const sorted = Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty)
      return NextResponse.json({ data: sorted })
    }

    // ─── Laporan Shift (hasil hitungan kas per shift) ──────────────────────
    if (type === "shift") {
      const whereShift: Record<string, unknown> = {}
      if (range)     whereShift.startTime = range // periode = tanggal shift dibuka
      if (cashierId) whereShift.cashierId = cashierId
      if (branchId)  whereShift.branchId  = branchId

      // Hanya kolom yang ditampilkan; kas seharusnya & selisih sengaja tidak dikirim
      const shiftSelect = {
        id: true, shiftNo: true, startTime: true, endTime: true,
        openingBalance: true, totalTransactions: true, totalSales: true, cashSales: true,
        closingBalance: true, notes: true,
        cashier: { select: { name: true } },
        branch:  { select: { name: true } },
      }

      if (exportAll) {
        const count = await prisma.shift.count({ where: whereShift })
        if (count > EXPORT_MAX_ROWS) return tooManyRows(count, "Persempit rentang tanggal lalu coba lagi.")
        const data = await prisma.shift.findMany({ where: whereShift, orderBy: { startTime: "desc" }, select: shiftSelect })
        return NextResponse.json({ data })
      }

      const [shifts, total] = await Promise.all([
        prisma.shift.findMany({ where: whereShift, orderBy: { startTime: "desc" }, skip, take: limit, select: shiftSelect }),
        prisma.shift.count({ where: whereShift }),
      ])
      return NextResponse.json({
        data: shifts,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      })
    }

    return NextResponse.json({ error: "Tipe laporan tidak valid" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}