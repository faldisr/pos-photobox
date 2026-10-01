"use client"

import { useState, useEffect, useRef } from "react"
import { StopCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RupiahInput } from "@/components/kasir/rupiah-input"
import { rupiahError } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type ShiftDetail = {
  id: string
  shiftNo: string
  startTime: string
  openingBalance: number
  totalTransactions: number
  totalSales: number
  cashSales: number
  qrisSales: number
  cardSales: number
  otherSales: number
  cashier: { name: string }
}

type ShiftEndDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shiftId: string
  onShiftEnded: () => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const formatDateTime = (dateStr: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))

export function ShiftEndDialog({
  open,
  onOpenChange,
  shiftId,
  onShiftEnded,
}: ShiftEndDialogProps) {
  const [shiftDetail, setShiftDetail] = useState<ShiftDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [closingBalance, setClosingBalance] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  // Penjaga klik ganda yang langsung berlaku (state loading baru terbaca setelah render ulang)
  const submitting = useRef(false)

  useEffect(() => {
    if (!open) return

    const fetchShiftDetail = async () => {
      setLoadingDetail(true)
      try {
        const res = await fetch(`/api/shifts/${shiftId}`)
        if (res.ok) {
          const data = await res.json()
          setShiftDetail(data)
        } else {
          toast.error("Gagal memuat data shift")
        }
      } catch {
        toast.error("Terjadi kesalahan, coba lagi")
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchShiftDetail()
  }, [open, shiftId])

  const reset = () => {
    setClosingBalance("")
    setNotes("")
    setShiftDetail(null)
    onOpenChange(false)
  }

  // Selama shift sedang ditutup, dialog tidak bisa ditutup (Esc/klik luar)
  const handleClose = () => {
    if (!loading) reset()
  }

  const handleEndShift = async () => {
    if (submitting.current) return
    const invalid = closingBalance === ""
      ? "Isi uang disetor (tulis 0 kalau tidak ada)"
      : rupiahError(Number(closingBalance), "Uang disetor")
    if (invalid) {
      toast.error(invalid)
      return
    }

    submitting.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          closingBalance: Number(closingBalance),
          notes: notes.trim() || null,
        }),
      })

      if (res.ok) {
        toast.success("Shift berhasil ditutup")
        reset()
        onShiftEnded()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menutup shift")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* Bisa digulir: di layar pendek tombol Tutup Shift jangan sampai terpotong */}
      <DialogContent className="w-[95vw] max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tutup Shift</DialogTitle>
          <DialogDescription>
            Pastikan semua transaksi sudah selesai sebelum menutup shift.
          </DialogDescription>
        </DialogHeader>

        {loadingDetail ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Memuat data shift...
          </div>
        ) : shiftDetail ? (
          <div className="space-y-4">
            {/* Info Shift */}
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Shift</span>
                <span className="font-mono font-medium">{shiftDetail.shiftNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kasir</span>
                <span>{shiftDetail.cashier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mulai</span>
                <span>{formatDateTime(shiftDetail.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo Awal</span>
                <span>{formatCurrency(Number(shiftDetail.openingBalance))}</span>
              </div>
            </div>

            {/* Ringkasan Penjualan */}
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <p className="font-medium">Ringkasan Penjualan</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Transaksi</span>
                <span>{shiftDetail.totalTransactions} transaksi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Penjualan</span>
                <span className="font-medium">{formatCurrency(Number(shiftDetail.totalSales))}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tunai</span>
                <span>{formatCurrency(Number(shiftDetail.cashSales))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">QRIS</span>
                <span>{formatCurrency(Number(shiftDetail.qrisSales))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Debit/Kartu</span>
                <span>{formatCurrency(Number(shiftDetail.cardSales))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lainnya</span>
                <span>{formatCurrency(Number(shiftDetail.otherSales))}</span>
              </div>
            </div>

            {/* Uang disetor */}
            <div className="space-y-2">
              <Label htmlFor="closingBalance">Uang Disetor</Label>
              <RupiahInput id="closingBalance" label="Uang disetor" value={closingBalance} onChange={setClosingBalance} />
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Catatan penutupan shift..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
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
                onClick={handleEndShift}
                disabled={loading}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                {loading ? "Menutup..." : "Tutup Shift"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}