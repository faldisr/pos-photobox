"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, Pencil, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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

// ─── Types ────────────────────────────────────────────────────────────────────

type Promo = {
  id: string
  code: string
  name: string
  type: "PERCENTAGE" | "FIXED_AMOUNT"
  value: number
  minPurchase: number | null
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  createdAt: string
}

type PromoFormData = {
  code: string
  name: string
  type: "PERCENTAGE" | "FIXED_AMOUNT"
  value: string
  minPurchase: string
  usageLimit: string
}

const EMPTY_FORM: PromoFormData = {
  code:        "",
  name:        "",
  type:        "FIXED_AMOUNT",
  value:       "",
  minPurchase: "",
  usageLimit:  "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style:                 "currency",
    currency:              "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  }).format(new Date(dateStr))
}

// ─── Promo Form Dialog ────────────────────────────────────────────────────────

function PromoFormDialog({
  open,
  onOpenChange,
  editTarget,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Promo | null
  onSuccess: () => void
}) {
  const [form, setForm] = useState<PromoFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editTarget) {
      setForm({
        code:        editTarget.code,
        name:        editTarget.name,
        type:        editTarget.type,
        value:       String(editTarget.value),
        minPurchase: editTarget.minPurchase !== null ? String(editTarget.minPurchase) : "",
        usageLimit:  editTarget.usageLimit  !== null ? String(editTarget.usageLimit)  : "",
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editTarget, open])

  const handleClose = () => {
    setForm(EMPTY_FORM)
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error("Kode promo harus diisi")
      return
    }
    if (!form.name.trim()) {
      toast.error("Nama promo harus diisi")
      return
    }
    if (!form.value || Number(form.value) <= 0) {
      toast.error("Nilai promo harus lebih dari 0")
      return
    }
    if (form.type === "PERCENTAGE" && Number(form.value) > 100) {
      toast.error("Persentase tidak boleh lebih dari 100")
      return
    }

    setLoading(true)
    try {
      const payload = {
        code:        form.code.trim().toUpperCase(),
        name:        form.name.trim(),
        type:        form.type,
        value:       Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : null,
        usageLimit:  form.usageLimit  ? Number(form.usageLimit)  : null,
      }

      const res = editTarget
        ? await fetch(`/api/promos/${editTarget.id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload),
          })
        : await fetch("/api/promos", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload),
          })

      if (res.ok) {
        toast.success(editTarget ? "Promo berhasil diupdate" : "Promo berhasil dibuat")
        handleClose()
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menyimpan promo")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>{editTarget ? "Edit Promo" : "Buat Promo Baru"}</DialogTitle>
          <DialogDescription>
            {editTarget ? "Ubah data promo yang sudah ada." : "Isi detail promo baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="promoCode">Kode Promo</Label>
            <Input
              id="promoCode"
              placeholder="Contoh: DISKON5000"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="promoName">Nama / Deskripsi</Label>
            <Input
              id="promoName"
              placeholder="Contoh: Potongan 5000 rupiah"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="promoType">Tipe Diskon</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as "PERCENTAGE" | "FIXED_AMOUNT" }))}
            >
              <SelectTrigger id="promoType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_AMOUNT">Nominal (Rp)</SelectItem>
                <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="promoValue">
              Nilai Diskon {form.type === "PERCENTAGE" ? "(%)" : "(Rp)"}
            </Label>
            <Input
              id="promoValue"
              type="number"
              min="1"
              max={form.type === "PERCENTAGE" ? "100" : undefined}
              placeholder={form.type === "PERCENTAGE" ? "Contoh: 10" : "Contoh: 5000"}
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="promoMinPurchase">Minimum Pembelian (Rp) <span className="text-muted-foreground text-xs">— opsional</span></Label>
            <Input
              id="promoMinPurchase"
              type="number"
              min="0"
              placeholder="Kosongkan jika tidak ada minimum"
              value={form.minPurchase}
              onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="promoUsageLimit">Batas Pemakaian <span className="text-muted-foreground text-xs">— opsional</span></Label>
            <Input
              id="promoUsageLimit"
              type="number"
              min="1"
              placeholder="Kosongkan jika tidak terbatas"
              value={form.usageLimit}
              onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Buat Promo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PromosPage() {
  const [promos,       setPromos]       = useState<Promo[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [formOpen,     setFormOpen]     = useState(false)
  const [editTarget,   setEditTarget]   = useState<Promo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null)
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [togglingId,   setTogglingId]   = useState<string | null>(null)

  const fetchPromos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/promos?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPromos(data)
      }
    } catch {
      toast.error("Gagal memuat data promo")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPromos()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchPromos])

  const handleToggleActive = async (promo: Promo) => {
    setTogglingId(promo.id)
    try {
      const res = await fetch(`/api/promos/${promo.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !promo.isActive }),
      })
      if (res.ok) {
        setPromos((prev) =>
          prev.map((p) => p.id === promo.id ? { ...p, isActive: !promo.isActive } : p)
        )
        toast.success(promo.isActive ? "Promo dinonaktifkan" : "Promo diaktifkan")
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal mengubah status promo")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/promos/${deleteTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Promo berhasil dihapus")
        setDeleteOpen(false)
        setDeleteTarget(null)
        fetchPromos()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menghapus promo")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manajemen Promo</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Kelola kode promo yang dapat digunakan oleh kasir
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama promo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          {search && (
            <button
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          className="sm:ml-auto"
          onClick={() => { setEditTarget(null); setFormOpen(true) }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Promo
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Kode</TableHead>
              <TableHead className="min-w-[160px]">Nama</TableHead>
              <TableHead className="min-w-[100px] text-center">Tipe</TableHead>
              <TableHead className="min-w-[110px] text-center">Nilai</TableHead>
              <TableHead className="min-w-[130px] text-center">Min. Pembelian</TableHead>
              <TableHead className="min-w-[120px] text-center">Pemakaian</TableHead>
              <TableHead className="min-w-[80px] text-center">Aktif</TableHead>
              <TableHead className="min-w-[100px] text-center">Dibuat</TableHead>
              <TableHead className="min-w-[80px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : promos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Tidak ada promo ditemukan
                </TableCell>
              </TableRow>
            ) : (
              promos.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {promo.code}
                  </TableCell>
                  <TableCell className="text-sm">{promo.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {promo.type === "PERCENTAGE" ? "%" : "Rp"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-center font-medium">
                    {promo.type === "PERCENTAGE"
                      ? `${promo.value}%`
                      : formatCurrency(promo.value)}
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    {promo.minPurchase !== null
                      ? formatCurrency(promo.minPurchase)
                      : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    {promo.usageLimit !== null
                      ? `${promo.usageCount} / ${promo.usageLimit}`
                      : `${promo.usageCount} / ∞`}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={promo.isActive}
                      disabled={togglingId === promo.id}
                      onCheckedChange={() => handleToggleActive(promo)}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground text-center">
                    {formatDate(promo.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditTarget(promo); setFormOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteTarget(promo); setDeleteOpen(true) }}
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
      </div>

      <PromoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editTarget={editTarget}
        onSuccess={fetchPromos}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Promo</AlertDialogTitle>
            <AlertDialogDescription>
              Promo <span className="font-mono font-medium">{deleteTarget?.code}</span> akan dihapus permanen.
              Transaksi yang sudah menggunakan promo ini tidak terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}