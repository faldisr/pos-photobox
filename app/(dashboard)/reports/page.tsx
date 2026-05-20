"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarIcon,
  ChevronDownIcon,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

// ─── Types ─────────────────────────────────────────────────────────────────

type Cashier = { id: string; name: string }

type TransactionItem = {
  id: string
  itemName: string
  quantity: number
  price: number
  subtotal: number
}

type TransactionRow = {
  id: string
  transactionNo: string
  createdAt: string
  cashier: { name: string }
  customer: { name: string | null; phone: string | null } | null
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  promoCode: string | null
  promoDiscount: number
  items: TransactionItem[]
}

type RevenueData = {
  chartData: { date: string; total: number; count: number }[]
  paymentSummary: Record<string, number>
  totalRevenue: number
  totalTrx: number
}

type CustomerRow = {
  id: string
  name: string | null
  phone: string | null
  totalVisits: number
  totalSpent: number
  lastVisit: string | null
}

type ProductRow = {
  itemName: string
  itemType: string
  totalQty: number
  totalRevenue: number
}

type Meta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Menunggu",
  PROCESSING: "Diproses",
  COMPLETED:  "Selesai",
  CANCELLED:  "Dibatalkan",
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING:    "warning",
  PROCESSING: "info",
  COMPLETED:  "success",
  CANCELLED:  "destructive",
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH:        "Tunai",
  QRIS:        "QRIS",
  DEBIT_CARD:  "Debit/Kartu",
  CREDIT_CARD: "Kartu Kredit",
  TRANSFER:    "Transfer",
  E_WALLET:    "E-Wallet",
}

const chartConfig = {
  total: {
    label: "Pendapatan",
    color: "var(--chart-1)",
  },
  count: {
    label: "Transaksi",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const LIMIT = 20

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style:                 "currency",
    currency:              "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  }).format(new Date(dateStr))
}

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

function formatDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages: number[] = []
  const max = 5
  if (totalPages <= max) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else if (currentPage <= 3) {
    for (let i = 1; i <= max; i++) pages.push(i)
  } else if (currentPage >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
  } else {
    for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
  }
  return pages
}

// ─── Pagination Component ────────────────────────────────────────────────────

function PaginationBar({
  page,
  meta,
  onPageChange,
}: {
  page: number
  meta: Meta
  onPageChange: (p: number) => void
}) {
  if (meta.totalPages <= 1) return null
  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const endItem   = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t bg-gray-50">
      <div className="text-sm text-gray-700">
        {startItem} – {endItem} dari {meta.total} data
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(1)}
          disabled={page <= 1} className="h-8 w-8 p-0" title="Ke halaman pertama">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)}
          disabled={page <= 1} className="h-8 w-8 p-0" title="Halaman sebelumnya">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers(page, meta.totalPages).map((pageNum) => (
          <Button key={pageNum}
            variant={page === pageNum ? "default" : "outline"}
            size="sm" onClick={() => onPageChange(pageNum)} className="h-8 w-8 p-0">
            {pageNum}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)}
          disabled={page >= meta.totalPages} className="h-8 w-8 p-0" title="Halaman berikutnya">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(meta.totalPages)}
          disabled={page >= meta.totalPages} className="h-8 w-8 p-0" title="Ke halaman terakhir">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab,  setActiveTab]  = useState("transaction")
  const [dateRange,  setDateRange]  = useState<DateRange | undefined>(undefined)
  const [cashierId,  setCashierId]  = useState("ALL")
  const [cashiers,   setCashiers]   = useState<Cashier[]>([])
  const [search,     setSearch]     = useState("")
  const [loading,    setLoading]    = useState(false)

  // Pagination per tab
  const [trxPage,      setTrxPage]      = useState(1)
  const [customerPage, setCustomerPage] = useState(1)
  // Perubahan 1 — Tambah refundCount di tipe Meta tab transaksi
  const [trxMeta,      setTrxMeta]      = useState<Meta & { refundCount?: number }>({ total: 0, page: 1, limit: LIMIT, totalPages: 1, refundCount: 0 })
  const [customerMeta, setCustomerMeta] = useState<Meta>({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })

  // Data per tab
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [revenueData,  setRevenueData]  = useState<RevenueData | null>(null)
  const [customers,    setCustomers]    = useState<CustomerRow[]>([])
  const [products,     setProducts]     = useState<ProductRow[]>([])

  // ── Fetch cashiers untuk dropdown ─────────────────────────────────────────
  useEffect(() => {
    fetch("/api/reports/cashiers")
      .then((r) => r.json())
      .then((data) => setCashiers(data))
      .catch(() => toast.error("Gagal memuat daftar kasir"))
  }, [])

  // ── Build params ───────────────────────────────────────────────────────────
  const buildParams = useCallback((page: number) => {
    const params = new URLSearchParams()
    params.set("type",  activeTab)
    params.set("page",  String(page))
    params.set("limit", String(LIMIT))
    if (cashierId !== "ALL") params.set("cashierId", cashierId)
    if (search && activeTab === "transaction") params.set("search", search)
    if (dateRange?.from) {
      params.set("dateFrom", formatDateKey(dateRange.from))
      params.set("dateTo",   formatDateKey(dateRange.to || dateRange.from))
    }
    return params
  }, [activeTab, cashierId, dateRange, search])

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/reports?${buildParams(page).toString()}`)
      const json = await res.json()

      if (activeTab === "transaction") {
        setTransactions(json.data ?? [])
        setTrxMeta(json.meta ?? { total: 0, page: 1, limit: LIMIT, totalPages: 1, refundCount: 0 })
      }
      if (activeTab === "revenue")  setRevenueData(json)
      if (activeTab === "customer") {
        setCustomers(json.data ?? [])
        setCustomerMeta(json.meta ?? { total: 0, page: 1, limit: LIMIT, totalPages: 1 })
      }
      if (activeTab === "product")  setProducts(json.data ?? [])
    } catch {
      toast.error("Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }, [activeTab, buildParams])

  // Reset page dan fetch ulang saat filter berubah
  useEffect(() => {
    setTrxPage(1)
    setCustomerPage(1)
    fetchData(1)
  }, [activeTab, cashierId, dateRange, fetchData])

  // Fetch saat page berubah
  useEffect(() => {
    if (activeTab === "transaction") fetchData(trxPage)
  }, [trxPage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "customer") fetchData(customerPage)
  }, [customerPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Search transaksi — debounce reset page
  useEffect(() => {
    if (activeTab !== "transaction") return
    const timer = setTimeout(() => {
      setTrxPage(1)
      fetchData(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF()
    const title = {
      transaction: "Laporan Transaksi",
      revenue:     "Laporan Pendapatan",
      customer:    "Laporan Pelanggan",
      product:     "Laporan Produk Terlaris",
    }[activeTab] ?? "Laporan"

    doc.setFontSize(14)
    doc.text(title, 14, 16)
    doc.setFontSize(9)
    doc.text(`Dicetak: ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date())}`, 14, 22)

    if (activeTab === "transaction") {
      autoTable(doc, {
        startY:  28,
        head: [["No. Transaksi", "Pelanggan", "Kasir", "Metode", "Kode Promo", "Total", "Status", "Waktu"]],
        body: transactions.map((t) => [
          t.transactionNo,
          t.customer?.name ?? "-",
          t.cashier.name,
          PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod,
          t.promoCode ?? "-",
          formatCurrency(Number(t.total)),
          STATUS_LABELS[t.status] ?? t.status,
          formatDateTime(t.createdAt),
        ]),
        styles:     { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 30] },
      })
    }

    if (activeTab === "revenue" && revenueData) {
      autoTable(doc, {
        startY:  28,
        head:    [["Tanggal", "Pendapatan", "Jumlah Transaksi"]],
        body:    revenueData.chartData.map((d) => [
          formatDate(d.date),
          formatCurrency(d.total),
          String(d.count),
        ]),
        styles:     { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 30] },
      })
    }

    if (activeTab === "customer") {
      autoTable(doc, {
        startY:  28,
        head:    [["Nama", "No. HP", "Kunjungan", "Total Belanja", "Terakhir"]],
        body:    customers.map((c) => [
          c.name ?? "-",
          c.phone ?? "-",
          String(c.totalVisits),
          formatCurrency(Number(c.totalSpent)),
          formatDate(c.lastVisit),
        ]),
        styles:     { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 30] },
      })
    }

    if (activeTab === "product") {
      autoTable(doc, {
        startY:  28,
        head:    [["Produk", "Tipe", "Total Terjual", "Total Pendapatan"]],
        body:    products.map((p) => [
          p.itemName,
          p.itemType,
          String(p.totalQty),
          formatCurrency(p.totalRevenue),
        ]),
        styles:     { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 30] },
      })
    }

    doc.save(`${title.replace(/ /g, "_")}.pdf`)
    toast.success("PDF berhasil diexport")
  }

  // ── Export Excel ───────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    let rows: unknown[][] = []
    let sheetName = "Laporan"

    if (activeTab === "transaction") {
      sheetName = "Transaksi"
      rows = [
        ["No. Transaksi", "Pelanggan", "Kasir", "Metode Pembayaran", "Kode Promo", "Total", "Status", "Waktu"],
        ...transactions.map((t) => [
          t.transactionNo,
          t.customer?.name ?? "-",
          t.cashier.name,
          PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod,
          t.promoCode ?? "-",
          Number(t.total),
          STATUS_LABELS[t.status] ?? t.status,
          formatDateTime(t.createdAt),
        ]),
      ]
    }

    if (activeTab === "revenue" && revenueData) {
      sheetName = "Pendapatan"
      rows = [
        ["Tanggal", "Pendapatan", "Jumlah Transaksi"],
        ...revenueData.chartData.map((d) => [
          formatDate(d.date),
          d.total,
          d.count,
        ]),
      ]
    }

    if (activeTab === "customer") {
      sheetName = "Pelanggan"
      rows = [
        ["Nama", "No. HP", "Total Kunjungan", "Total Belanja", "Kunjungan Terakhir"],
        ...customers.map((c) => [
          c.name ?? "-",
          c.phone ?? "-",
          c.totalVisits,
          Number(c.totalSpent),
          formatDate(c.lastVisit),
        ]),
      ]
    }

    if (activeTab === "product") {
      sheetName = "Produk Terlaris"
      rows = [
        ["Produk", "Tipe", "Total Terjual", "Total Pendapatan"],
        ...products.map((p) => [
          p.itemName,
          p.itemType,
          p.totalQty,
          p.totalRevenue,
        ]),
      ]
    }

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${sheetName}.xlsx`)
    toast.success("Excel berhasil diexport")
  }

  // ── Filter area (shared) ───────────────────────────────────────────────────
  const FilterArea = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-54 justify-start text-center font-normal border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {dateRange?.from ? (
              dateRange.to ? (
                `${dateRange.from.toLocaleDateString("id-ID")} - ${dateRange.to.toLocaleDateString("id-ID")}`
              ) : (
                dateRange.from.toLocaleDateString("id-ID")
              )
            ) : (
              "Pilih Tanggal"
            )}
            <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            captionLayout="dropdown"
            onSelect={(range) => { setDateRange(range) }}
            className="rounded-md border"
          />
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setDateRange(undefined) }}
              className="w-full"
            >
              Reset Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Select value={cashierId} onValueChange={(v) => { setCashierId(v) }}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Semua Kasir" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Kasir</SelectItem>
          {cashiers.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(dateRange || cashierId !== "ALL") && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground w-fit"
          onClick={() => { setDateRange(undefined); setCashierId("ALL") }}
        >
          <X className="mr-1 h-3 w-3" />
          Reset
        </Button>
      )}

      <div className="flex gap-2 sm:ml-auto">
        <Button variant="outline" size="sm" onClick={handleExportExcel}>
          <Download className="mr-2 h-4 w-4" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Laporan</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Laporan transaksi, pendapatan, pelanggan, dan produk terlaris
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch("") }}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="transaction">Transaksi</TabsTrigger>
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="customer">Pelanggan</TabsTrigger>
          <TabsTrigger value="product">Produk</TabsTrigger>
        </TabsList>

        {/* ── Tab Transaksi ─────────────────────────────────────────────── */}
        <TabsContent value="transaction" className="mt-4 space-y-4">
          {FilterArea}

          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari no. transaksi, pelanggan, kasir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Perubahan 2 — Tampilkan summary refund di atas tabel transaksi */}
          {(trxMeta.refundCount ?? 0) > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>
                <strong>{trxMeta.refundCount} transaksi</strong> di-refund dalam periode ini.
              </span>
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px] text-center">No. Transaksi</TableHead>
                  <TableHead className="min-w-[120px] text-center">Pelanggan</TableHead>
                  <TableHead className="min-w-[100px] text-center">Kasir</TableHead>
                  <TableHead className="min-w-[110px] text-center">Total</TableHead>
                  <TableHead className="min-w-[100px] text-center">Pembayaran</TableHead>
                  {/* Kolom Kode Promo */}
                  <TableHead className="min-w-[110px] text-center">Kode Promo</TableHead>
                  {/* Perubahan 3 — Kolom Status */}
                  <TableHead className="min-w-[90px] text-center">Status</TableHead>
                  <TableHead className="min-w-[140px] text-center">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Tidak ada data transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell className="font-mono text-sm font-medium text-center">
                        {trx.transactionNo}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {trx.customer?.name ?? <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {trx.cashier.name}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-center">
                        {formatCurrency(Number(trx.total))}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {PAYMENT_LABELS[trx.paymentMethod] ?? trx.paymentMethod}
                      </TableCell>
                      {/* Cell Kode Promo */}
                      <TableCell className="text-center">
                        {trx.promoCode ? (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200 font-mono">
                            {trx.promoCode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      {/* Perubahan 3 — Cell Status sama persis dengan transactions/page.tsx */}
                      <TableCell className="text-center">
                        <Badge variant={STATUS_VARIANTS[trx.status]}>
                          {STATUS_LABELS[trx.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">
                        {formatDateTime(trx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationBar
              page={trxPage}
              meta={trxMeta}
              onPageChange={setTrxPage}
            />
          </div>
        </TabsContent>

        {/* ── Tab Pendapatan ────────────────────────────────────────────── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {FilterArea}

          {loading ? (
            <div className="rounded-md border p-12 text-center text-muted-foreground text-sm">
              Memuat data...
            </div>
          ) : !revenueData ? null : (
            <>
              <div className="grid gap-3 grid-cols-2">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Pendapatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(revenueData.totalRevenue)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Transaksi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{revenueData.totalTrx}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                  <div className="grid flex-1 gap-1">
                    <CardTitle>Grafik Pendapatan</CardTitle>
                    <CardDescription>Pendapatan per hari dalam periode yang dipilih</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                  {revenueData.chartData.length === 0 ? (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                      Tidak ada data untuk periode ini
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                      <AreaChart data={revenueData.chartData}>
                        <defs>
                          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--color-total)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={32}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("id-ID", {
                              month: "short",
                              day:   "numeric",
                            })
                          }
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("id-ID", {
                              notation:       "compact",
                              compactDisplay: "short",
                            }).format(value)
                          }
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) =>
                                new Date(value).toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  month:   "short",
                                  day:     "numeric",
                                })
                              }
                              formatter={(value) => [formatCurrency(Number(value)), "Pendapatan"]}
                              indicator="dot"
                            />
                          }
                        />
                        <Area
                          dataKey="total"
                          type="natural"
                          fill="url(#fillTotal)"
                          stroke="var(--color-total)"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metode Pembayaran</TableHead>
                      <TableHead className="text-right">Total Pendapatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(revenueData.paymentSummary).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.entries(revenueData.paymentSummary).map(([method, total]) => (
                        <TableRow key={method}>
                          <TableCell className="text-sm">
                            {PAYMENT_LABELS[method] ?? method}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-right">
                            {formatCurrency(total)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Tab Pelanggan ─────────────────────────────────────────────── */}
        <TabsContent value="customer" className="mt-4 space-y-4">
          {FilterArea}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Nama</TableHead>
                  <TableHead className="min-w-[120px]">No. HP</TableHead>
                  <TableHead className="min-w-[100px] text-center">Kunjungan</TableHead>
                  <TableHead className="min-w-[130px] text-center">Total Belanja</TableHead>
                  <TableHead className="min-w-[130px] text-center">Kunjungan Terakhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada data pelanggan
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm font-medium">
                        {c.name ?? <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.phone ?? <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-sm text-center">{c.totalVisits}x</TableCell>
                      <TableCell className="text-sm font-medium text-center">
                        {formatCurrency(Number(c.totalSpent))}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center">
                        {formatDate(c.lastVisit)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationBar
              page={customerPage}
              meta={customerMeta}
              onPageChange={setCustomerPage}
            />
          </div>
        </TabsContent>

        {/* ── Tab Produk Terlaris ───────────────────────────────────────── */}
        <TabsContent value="product" className="mt-4 space-y-4">
          {FilterArea}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Produk</TableHead>
                  <TableHead className="min-w-[100px] text-center">Tipe</TableHead>
                  <TableHead className="min-w-[100px] text-center">Total Terjual</TableHead>
                  <TableHead className="min-w-[130px] text-center">Total Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Tidak ada data produk
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p, index) => (
                    <TableRow key={`${p.itemName}-${index}`}>
                      <TableCell className="text-sm font-medium">{p.itemName}</TableCell>
                      <TableCell className="text-sm text-center">
                        <Badge variant="secondary">{p.itemType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-center">{p.totalQty}x</TableCell>
                      <TableCell className="text-sm font-medium text-center">
                        {formatCurrency(p.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}