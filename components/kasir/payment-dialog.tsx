"use client"

import { useState } from "react"
import {
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { printReceipt } from "@/lib/print-receipt"
import type { CartItem, BranchInfo } from "@/app/(dashboard)/kasir/page"

type PaymentMethod = "CASH" | "QRIS" | "DEBIT_CARD" | "TRANSFER"

type PaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  subtotal: number
  discount: number
  total: number
  customerName: string
  customerPhone: string
  promoCode: string
  promoDiscount: number
  notes: string
  shiftId: string
  branch?: BranchInfo | null
  paperId?: string
  printQty?: number
  onSuccess: () => void
}

const PAYMENT_METHODS: {
  value: PaymentMethod
  label: string
  icon: React.ReactNode
  description: string
}[] = [
  {
    value: "CASH",
    label: "Tunai",
    icon: <Banknote className="h-5 w-5" />,
    description: "Bayar dengan uang tunai",
  },
  {
    value: "QRIS",
    label: "QRIS",
    icon: <QrCode className="h-5 w-5" />,
    description: "Scan QR untuk bayar",
  },
  {
    value: "DEBIT_CARD",
    label: "Debit/Kartu",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Kartu debit atau kredit",
  },
  {
    value: "TRANSFER",
    label: "Transfer Bank",
    icon: <Building2 className="h-5 w-5" />,
    description: "Transfer rekening bank",
  },
]

export function PaymentDialog({
  open,
  onOpenChange,
  cart,
  subtotal,
  discount,
  total,
  customerName,
  customerPhone,
  promoCode,
  promoDiscount,
  notes,
  shiftId,
  branch,
  paperId,
  printQty,
  onSuccess,
}: PaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("CASH")
  const [paidAmount, setPaidAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [transactionNo, setTransactionNo] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [transactionDate, setTransactionDate] = useState<Date | null>(null)
  const [queueNumber, setQueueNumber] = useState<string | null>(null)

  const paid = parseFloat(paidAmount) || 0
  const change = method === "CASH" ? Math.max(0, paid - total) : 0
  const cashValid = method !== "CASH" || paid >= total

  const quickAmounts = [
    total,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3)

  const handlePayment = async () => {
    if (!cashValid) {
      toast.error("Jumlah bayar kurang dari total")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftId,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          items: cart.map((item) => ({
            packageId:  item.packageId,
            templateId: item.templateId,
            addOnId:    item.addOnId,
            itemName:   item.name,
            itemType:   item.type,
            quantity:   item.quantity,
            price:      item.price,
            subtotal:   item.price * item.quantity,
          })),
          subtotal,
          discount,
          total,
          paymentMethod:  method,
          paidAmount:     method === "CASH" ? paid : total,
          changeAmount:   change,
          promoCode:      promoCode || null,
          promoDiscount,
          notes:          notes || null,
          paperId:        paperId || null,
          printQty:       printQty || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTransactionNo(data.transactionNo)
        setTransactionId(data.id)
        setTransactionDate(new Date())
        setQueueNumber(data.queueNumber ?? null)
        setSuccess(true)
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal memproses pembayaran")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    setPrinting(true)
    try {
      await printReceipt({
        transactionNo,
        transactionDate,
        customerName,
        customerPhone,
        items: cart.map((item) => ({
          name:     item.name,
          quantity: item.quantity,
          price:    item.price,
        })),
        subtotal,
        discount,
        total,
        paymentMethod: method,
        paidAmount:    paid,
        change,
        promoCode,
        notes,
        branch:      branch ?? null,
        isPrinted:   false,
        queueNumber,
        onAfterPrint: async () => {
          try {
            await fetch(`/api/transactions/${transactionId}`, {
              method:  "PATCH",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ isPrinted: true }),
            })
          } catch {
            // silent — tidak gagalkan flow print
          }
        },
      })
      toast.success("Struk berhasil dicetak")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === "WEB_BT_NOT_SUPPORTED") {
        toast.error("Browser tidak mendukung Bluetooth. Gunakan Chrome Android.")
      } else if (msg.includes("User cancelled") || msg.includes("cancelled")) {
        // User menutup picker — tidak perlu toast
      } else if (msg === "BT_CONNECT_FAILED") {
        toast.error("Gagal konek ke printer. Pastikan printer menyala dan tidak tersambung ke perangkat lain.")
      } else {
        toast.error("Gagal mencetak struk. Pastikan printer menyala dan Bluetooth aktif.")
      }
    } finally {
      setPrinting(false)
    }
  }

  const handleClose = () => {
    if (success) {
      onSuccess()
      setSuccess(false)
      setTransactionNo("")
      setTransactionId("")
      setTransactionDate(null)
      setQueueNumber(null)
    }
    setPaidAmount("")
    setMethod("CASH")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Pembayaran Berhasil!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No. Transaksi:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {transactionNo}
                </span>
              </p>
            </div>
            {method === "CASH" && change > 0 && (
              <div className="w-full rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-700">Kembalian</p>
                <p className="text-2xl font-bold text-green-700">
                  Rp {change.toLocaleString("id-ID")}
                </p>
              </div>
            )}
            <div className="flex w-full gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrint}
                disabled={printing}
              >
                <Printer className="mr-2 h-4 w-4" />
                {printing ? "Mencetak..." : "Cetak Struk"}
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Transaksi Baru
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Proses Pembayaran</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Ringkasan */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="text-green-600">
                      - Rp {discount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Metode pembayaran */}
              <div className="space-y-2">
                <Label className="text-sm">Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setMethod(m.value)
                        setPaidAmount("")
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all",
                        method === m.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          method === m.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {m.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-none">{m.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-none">
                          {m.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input bayar (hanya untuk cash) */}
              {method === "CASH" && (
                <div className="space-y-2">
                  <Label className="text-sm">Jumlah Bayar</Label>
                  <Input
                    type="number"
                    placeholder="Masukkan jumlah uang"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="text-base font-medium"
                  />
                  <div className="flex gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-7"
                        onClick={() => setPaidAmount(amount.toString())}
                      >
                        {(amount / 1000).toFixed(0)}rb
                      </Button>
                    ))}
                  </div>
                  {paid > 0 && (
                    <div
                      className={cn(
                        "rounded-lg p-2.5 text-sm",
                        cashValid
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      )}
                    >
                      <div className="flex justify-between">
                        <span className={cashValid ? "text-green-700" : "text-red-700"}>
                          {cashValid ? "Kembalian" : "Kurang"}
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            cashValid ? "text-green-700" : "text-red-700"
                          )}
                        >
                          Rp{" "}
                          {cashValid
                            ? change.toLocaleString("id-ID")
                            : (total - paid).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={
                  loading ||
                  (method === "CASH" && (!paidAmount || !cashValid))
                }
              >
                {loading
                  ? "Memproses..."
                  : `Bayar Rp ${total.toLocaleString("id-ID")}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}