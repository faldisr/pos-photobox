"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  totalVisits: number
  totalSpent: number
  lastVisit: string | null
  createdAt: string
}

type TransactionItem = {
  id: string
  itemName: string
  quantity: number
  price: number
  subtotal: number
}

type Transaction = {
  id: string
  transactionNo: string
  total: number
  paymentMethod: string
  status: string
  createdAt: string
  cashier: { name: string }
  items: TransactionItem[]
}

type CustomerDetail = Customer & {
  address: string | null
  notes: string | null
  transactions: Transaction[]
}

type Meta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_VARIANTS: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  COMPLETED:  "success",
  PENDING:    "warning",
  PROCESSING: "secondary",
  CANCELLED:  "destructive",
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED:  "Selesai",
  PENDING:    "Menunggu",
  PROCESSING: "Diproses",
  CANCELLED:  "Dibatalkan",
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [name,    setName]    = useState("")
  const [phone,   setPhone]   = useState("")
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) {
      setName(customer.name   ?? "")
      setPhone(customer.phone ?? "")
      setEmail(customer.email ?? "")
    }
  }, [customer])

  const handleSave = async () => {
    if (!customer) return
    setLoading(true)
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, name, phone, email }),
      })

      if (res.ok) {
        toast.success("Data pelanggan berhasil diperbarui")
        onSuccess()
        onOpenChange(false)
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal memperbarui data pelanggan")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pelanggan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama pelanggan"
            />
          </div>
          <div className="space-y-1.5">
            <Label>No. HP</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nomor HP"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opsional)"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function CustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
}: {
  customerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [detail,  setDetail]  = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!customerId || !open) return

    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/customers?id=${customerId}`)
        const data = await res.json()
        setDetail(data)
      } catch {
        toast.error("Gagal memuat detail pelanggan")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [customerId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detail Pelanggan</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Memuat data...
          </div>
        ) : !detail ? null : (
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-4 pr-1">

              {/* Info pelanggan */}
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{detail.name ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. HP</span>
                  <span>{detail.phone ?? "-"}</span>
                </div>
                {detail.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{detail.email}</span>
                  </div>
                )}
                {detail.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alamat</span>
                    <span className="text-right max-w-[60%]">{detail.address}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Kunjungan</span>
                  <span className="font-medium">{detail.totalVisits}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Belanja</span>
                  <span className="font-medium">{formatCurrency(Number(detail.totalSpent))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kunjungan Terakhir</span>
                  <span>{formatDate(detail.lastVisit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terdaftar</span>
                  <span>{formatDate(detail.createdAt)}</span>
                </div>
              </div>

              {/* Riwayat transaksi */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium">
                  Riwayat Transaksi{" "}
                  <span className="text-muted-foreground font-normal">
                    ({detail.transactions.length} terakhir)
                  </span>
                </p>
                {detail.transactions.length === 0 ? (
                  <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                    Belum ada transaksi
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No. Transaksi</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Tanggal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.transactions.map((trx) => (
                          <TableRow key={trx.id}>
                            <TableCell className="font-mono text-xs">
                              {trx.transactionNo}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={STATUS_VARIANTS[trx.status]}>
                                {STATUS_LABELS[trx.status] ?? trx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {formatCurrency(Number(trx.total))}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {formatDateTime(trx.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [meta,      setMeta]      = useState<Meta>({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [page,      setPage]      = useState(1)

  // Detail dialog
  const [detailId,   setDetailId]   = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Customer | null>(null)
  const [editOpen,   setEditOpen]   = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page",  String(page))
      params.set("limit", String(LIMIT))
      if (search) params.set("search", search)

      const res = await fetch(`/api/customers?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setCustomers(json.data)
        setMeta(json.meta)
      }
    } catch {
      toast.error("Gagal memuat data pelanggan")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/customers?id=${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Pelanggan berhasil dihapus")
        fetchCustomers()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menghapus pelanggan")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const endItem   = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pelanggan</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Daftar pelanggan yang terdaftar dari transaksi kasir
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau no. HP..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-muted-foreground w-fit"
            onClick={() => handleSearchChange("")}
          >
            <X className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Tabel */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Nama</TableHead>
              <TableHead className="min-w-[120px]">No. HP</TableHead>
              <TableHead className="min-w-[100px] text-center">Kunjungan</TableHead>
              <TableHead className="min-w-[130px] text-center">Total Belanja</TableHead>
              <TableHead className="min-w-[130px] text-center">Kunjungan Terakhir</TableHead>
              <TableHead className="min-w-[80px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Tidak ada pelanggan ditemukan
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => { setDetailId(customer.id); setDetailOpen(true) }}
                >
                  <TableCell className="text-sm font-medium">
                    {customer.name ?? <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {customer.phone ?? <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    {customer.totalVisits}x
                  </TableCell>
                  <TableCell className="text-sm text-center font-medium">
                    {formatCurrency(Number(customer.totalSpent))}
                  </TableCell>
                  <TableCell className="text-sm text-center text-muted-foreground">
                    {formatDate(customer.lastVisit)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setDetailId(customer.id); setDetailOpen(true) }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditTarget(customer); setEditOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setDeleteTarget(customer); setDeleteOpen(true) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              {startItem} – {endItem} dari {meta.total} data
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="h-8 w-8 p-0"
                title="Ke halaman pertama"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="h-8 w-8 p-0"
                title="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers(page, meta.totalPages).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages}
                className="h-8 w-8 p-0"
                title="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.totalPages)}
                disabled={page >= meta.totalPages}
                className="h-8 w-8 p-0"
                title="Ke halaman terakhir"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <CustomerDetailDialog
        customerId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Edit Dialog */}
      <EditCustomerDialog
        customer={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchCustomers}
      />

      {/* Delete AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelanggan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pelanggan{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name ?? deleteTarget?.phone ?? "ini"}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}