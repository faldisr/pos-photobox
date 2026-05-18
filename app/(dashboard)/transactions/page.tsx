"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
  Eye,
  X,
  CalendarIcon,
  ChevronDownIcon,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { printReceipt } from "@/lib/print-receipt"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionItem = {
  id: string
  itemName: string
  itemType: string
  quantity: number
  price: number
  subtotal: number
}

type Transaction = {
  id: string
  transactionNo: string
  branchId: string
  queueNumber: string | null
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discount: number
  total: number
  paidAmount: number
  changeAmount: number
  promoCode: string | null
  promoDiscount: number
  notes: string | null
  refundReason: string | null
  refundedAt: string | null
  isPrinted: boolean
  createdAt: string
  cashier: { name: string }
  customer: { name: string | null; phone: string | null } | null
  items: TransactionItem[]
}

type Meta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

type Branch = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  city?: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const LIMIT = 20

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages: number[] = []
  const maxPagesToShow = 5
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else if (currentPage <= 3) {
    for (let i = 1; i <= maxPagesToShow; i++) pages.push(i)
  } else if (currentPage >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
  } else {
    for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
  }
  return pages
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

function buildPrintParams(trx: Transaction, branch?: Branch | null) {
  return {
    transactionNo:   trx.transactionNo,
    transactionDate: new Date(trx.createdAt),
    customerName:    trx.customer?.name  ?? "",
    customerPhone:   trx.customer?.phone ?? "",
    items: trx.items.map((i) => ({
      name:     i.itemName,
      quantity: i.quantity,
      price:    Number(i.price),
    })),
    subtotal:      Number(trx.subtotal),
    discount:      Number(trx.discount),
    total:         Number(trx.total),
    paymentMethod: trx.paymentMethod,
    paidAmount:    Number(trx.paidAmount),
    change:        Number(trx.changeAmount),
    promoCode:     trx.promoCode ?? "",
    notes:         trx.notes    ?? "",
    branch:        branch ?? null,
    isPrinted:     trx.isPrinted,
    queueNumber:   trx.queueNumber ?? null,
  }
}

// ─── Refund Dialog ────────────────────────────────────────────────────────────

function RefundDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [refundReason, setRefundReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setRefundReason("")
    onOpenChange(false)
  }

  const handleRefund = async () => {
    if (!transaction) return
    if (!refundReason.trim()) {
      toast.error("Alasan refund harus diisi")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundReason }),
      })

      if (res.ok) {
        toast.success("Transaksi berhasil di-refund")
        handleClose()
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal memproses refund")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Refund</DialogTitle>
          <DialogDescription>
            Transaksi <span className="font-mono font-medium">{transaction.transactionNo}</span> akan
            di-refund dan statusnya berubah menjadi Dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Ringkasan transaksi */}
          <div className="rounded-lg border p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pelanggan</span>
              <span>{transaction.customer?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatCurrency(Number(transaction.total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Bayar</span>
              <span>{PAYMENT_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span>{formatDate(transaction.createdAt)}</span>
            </div>
          </div>

          {/* Alasan refund */}
          <div className="space-y-1.5">
            <Label htmlFor="refundReason">Alasan Refund</Label>
            <Textarea
              id="refundReason"
              placeholder="Masukkan alasan refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleRefund}
            disabled={loading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {loading ? "Memproses..." : "Proses Refund"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  branchCache,
  onPrinted,
}: {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  branchCache: Record<string, Branch>
  onPrinted: (id: string) => void
}) {
  if (!transaction) return null

  const branch = branchCache[transaction.branchId] ?? null

  const handlePrint = () => {
    try {
      printReceipt({
        ...buildPrintParams(transaction, branch),
        onAfterPrint: () => onPrinted(transaction.id),
      })
    } catch {
      toast.error("Popup diblokir browser. Izinkan popup untuk mencetak struk.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-4 pr-1">
            {/* Nomor antrian di bagian atas */}
            {transaction.queueNumber && (
              <div className="w-full rounded-lg border py-3 text-center">
                <p className="text-xs text-muted-foreground">NO. ANTRIAN</p>
                <p className="text-4xl font-bold tracking-widest">{transaction.queueNumber}</p>
              </div>
            )}

            {/* Landmark sudah dicetak */}
            {transaction.isPrinted && (
              <div className="w-full border border-orange-200 bg-orange-50 py-1.5 text-center text-xs text-orange-500">
                Struk sudah pernah dicetak
              </div>
            )}

            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={STATUS_VARIANTS[transaction.status]}>
                  {STATUS_LABELS[transaction.status]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Transaksi</span>
                <span className="font-mono font-medium text-xs">{transaction.transactionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kasir</span>
                <span>{transaction.cashier.name}</span>
              </div>
              {transaction.customer && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pelanggan</span>
                    <span>{transaction.customer.name ?? "-"}</span>
                  </div>
                  {transaction.customer.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. HP</span>
                      <span>{transaction.customer.phone}</span>
                    </div>
                  )}
                </>
              )}
              {/* Tampilkan info refund jika ada */}
              {transaction.refundReason && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alasan Refund</span>
                    <span className="text-right max-w-[60%] text-destructive">
                      {transaction.refundReason}
                    </span>
                  </div>
                  {transaction.refundedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Refund</span>
                      <span>{formatDate(transaction.refundedAt)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Item Pembelian</p>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center w-12">Qty</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">
                          <div>{item.itemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(Number(item.price))} / item
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(Number(item.subtotal))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(transaction.subtotal))}</span>
              </div>
              {Number(transaction.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Diskon{transaction.promoCode ? ` (${transaction.promoCode})` : ""}
                  </span>
                  <span className="text-green-600">
                    - {formatCurrency(Number(transaction.discount))}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(Number(transaction.total))}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Bayar</span>
                <span>{PAYMENT_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}</span>
              </div>
              {transaction.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dibayar</span>
                    <span>{formatCurrency(Number(transaction.paidAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span>{formatCurrency(Number(transaction.changeAmount))}</span>
                  </div>
                </>
              )}
            </div>

            {transaction.notes && (
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground text-xs mb-1">Catatan</p>
                <p>{transaction.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-3 border-t">
          <Button className="w-full" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Struk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
  const canRefund = session?.user?.role === "SUPER_ADMIN"

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchCache, setBranchCache] = useState<Record<string, Branch>>({})
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL")

  const [search,    setSearch]    = useState("")
  const [method,    setMethod]    = useState("ALL")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [page,      setPage]      = useState(1)

  const [selected,     setSelected]     = useState<Transaction | null>(null)
  const [detailOpen,   setDetailOpen]   = useState(false)
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null)
  const [refundOpen,   setRefundOpen]   = useState(false)

  // Fetch semua cabang — untuk filter (SUPER_ADMIN) dan cache data print
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/settings/branches")
        if (res.ok) {
          const data: Branch[] = await res.json()
          const list = Array.isArray(data) ? data : []
          setBranches(list)
          const cache: Record<string, Branch> = {}
          list.forEach((b) => { cache[b.id] = b })
          setBranchCache(cache)
        }
      } catch {
        // silent
      }
    }
    fetchBranches()
  }, [])

  const fetchTransactions = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page",  String(page))
      params.set("limit", String(LIMIT))
      if (search)           params.set("search",   search)
      if (method !== "ALL") params.set("method",   method)

      if (!isSuperAdmin && session.user.branchId) {
        params.set("branchId", session.user.branchId)
      }
      if (isSuperAdmin && selectedBranch !== "ALL") {
        params.set("branchId", selectedBranch)
      }

      if (dateRange?.from) {
        const fmt = (date: Date) => {
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, "0")
          const d = String(date.getDate()).padStart(2, "0")
          return `${y}-${m}-${d}`
        }
        params.set("dateFrom", fmt(dateRange.from))
        params.set("dateTo",   fmt(dateRange.to || dateRange.from))
      }

      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setTransactions(json.data)
        setMeta(json.meta)
      }
    } catch {
      toast.error("Gagal memuat data transaksi")
    } finally {
      setLoading(false)
    }
  }, [page, search, method, dateRange, session, isSuperAdmin, selectedBranch])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Tandai isPrinted di state lokal + kirim ke API
  const handlePrinted = useCallback(async (id: string) => {
    setTransactions((prev) =>
      prev.map((trx) => trx.id === id ? { ...trx, isPrinted: true } : trx)
    )
    setSelected((prev) =>
      prev?.id === id ? { ...prev, isPrinted: true } : prev
    )

    try {
      await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrinted: true }),
      })
    } catch {
      // silent
    }
  }, [])

  const handleFilterChange = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const hasActiveFilter = search || method !== "ALL" || dateRange !== undefined ||
    (isSuperAdmin && selectedBranch !== "ALL")

  const handleClearFilter = () => {
    setSearch("")
    setMethod("ALL")
    setDateRange(undefined)
    setSelectedBranch("ALL")
    setPage(1)
  }

  const handlePrint = (trx: Transaction) => {
    try {
      const branch = branchCache[trx.branchId] ?? null
      printReceipt({
        ...buildPrintParams(trx, branch),
        onAfterPrint: () => handlePrinted(trx.id),
      })
    } catch {
      toast.error("Popup diblokir browser. Izinkan popup untuk mencetak.")
    }
  }

  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const endItem   = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Riwayat Transaksi</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Daftar seluruh transaksi yang telah dilakukan
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari no. transaksi atau nama pelanggan..."
              value={search}
              onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {isSuperAdmin && (
              <Select
                value={selectedBranch}
                onValueChange={(v) => handleFilterChange(() => setSelectedBranch(v))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={method} onValueChange={(v) => handleFilterChange(() => setMethod(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Metode</SelectItem>
                <SelectItem value="CASH">Tunai</SelectItem>
                <SelectItem value="QRIS">QRIS</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit/Kartu</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="E_WALLET">E-Wallet</SelectItem>
              </SelectContent>
            </Select>

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
                  onSelect={(range) => handleFilterChange(() => setDateRange(range))}
                  className="rounded-md border"
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange(() => setDateRange(undefined))}
                    className="w-full"
                  >
                    Reset Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground"
                onClick={handleClearFilter}
              >
                <X className="mr-1 h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px] text-center">No. Transaksi</TableHead>
              <TableHead className="min-w-[120px] text-center">Pelanggan</TableHead>
              <TableHead className="min-w-[100px] text-center">Kasir</TableHead>
              <TableHead className="min-w-[110px] text-center">Total</TableHead>
              <TableHead className="min-w-[100px] text-center">Pembayaran</TableHead>
              <TableHead className="min-w-[90px] text-center">Status</TableHead>
              <TableHead className="min-w-[140px] text-center">Waktu</TableHead>
              <TableHead className="min-w-[80px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Tidak ada transaksi ditemukan
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((trx) => (
                <TableRow
                  key={trx.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => { setSelected(trx); setDetailOpen(true) }}
                >
                  <TableCell className="font-mono text-sm font-medium">
                    <div>{trx.transactionNo}</div>
                    {trx.isPrinted && (
                      <div className="mt-0.5 w-full border-t border-orange-200 pt-0.5 text-[10px] text-orange-400">
                        Sudah dicetak
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {trx.customer?.name ?? (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-center">{trx.cashier.name}</TableCell>
                  <TableCell className="text-sm font-medium text-center">
                    {formatCurrency(Number(trx.total))}
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    {PAYMENT_LABELS[trx.paymentMethod] ?? trx.paymentMethod}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANTS[trx.status]}>
                      {STATUS_LABELS[trx.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground text-center">
                    {formatDate(trx.createdAt)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelected(trx); setDetailOpen(true) }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrint(trx)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {/* Tombol refund hanya untuk SUPER_ADMIN dan transaksi COMPLETED */}
                      {canRefund && trx.status === "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { setRefundTarget(trx); setRefundOpen(true) }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              {startItem} – {endItem} dari {meta.total} data
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)}
                disabled={page <= 1} className="h-8 w-8 p-0" title="Ke halaman pertama">
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1} className="h-8 w-8 p-0" title="Halaman sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers(page, meta.totalPages).map((pageNum) => (
                <Button key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm" onClick={() => setPage(pageNum)} className="h-8 w-8 p-0">
                  {pageNum}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages} className="h-8 w-8 p-0" title="Halaman berikutnya">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(meta.totalPages)}
                disabled={page >= meta.totalPages} className="h-8 w-8 p-0" title="Ke halaman terakhir">
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TransactionDetailDialog
        transaction={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        branchCache={branchCache}
        onPrinted={handlePrinted}
      />

      <RefundDialog
        transaction={refundTarget}
        open={refundOpen}
        onOpenChange={setRefundOpen}
        onSuccess={fetchTransactions}
      />
    </div>
  )
}