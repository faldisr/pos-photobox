"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  User,
  Tag,
  FileText,
  CreditCard,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaymentDialog } from "@/components/kasir/payment-dialog"
import type { CartItem, ActiveShift, BranchInfo } from "@/app/(dashboard)/kasir/page"

type CartPanelProps = {
  cart: CartItem[]
  activeShift: ActiveShift
  branchInfo: BranchInfo | null
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onClearCart: () => void
}

type InventoryOption = {
  id: string        // inventory.id
  itemId: string    // inventoryItem.id
  name: string
  quantity: number
  unit: string
}

type RawInventoryItem = {
  id: string
  quantity: number
  item: {
    id: string
    name: string
    category: string
    unit: string
  }
}

export function CartPanel({
  cart,
  activeShift,
  branchInfo,
  onUpdateQuantity,
  onRemove,
  onClearCart,
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLoading, setPromoLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [openCustomer, setOpenCustomer] = useState(false)
  const [openPromo, setOpenPromo] = useState(false)
  const [openNotes, setOpenNotes] = useState(false)
  const [openPaper, setOpenPaper] = useState(false)

  // ── Inventory / kertas ─────────────────────────────────────────────────────
  const [paperOptions, setPaperOptions] = useState<InventoryOption[]>([])
  const [selectedPaperId, setSelectedPaperId] = useState<string>("")   // itemId
  const [printQty, setPrintQty] = useState<string>("")

  const fetchPaperOptions = useCallback(async () => {
    if (!activeShift?.branchId) return
    try {
      const res = await fetch(`/api/inventory?branchId=${activeShift.branchId}`)
      if (!res.ok) return
      const json = await res.json()

      // Hanya tampilkan item kategori PAPER yang masih ada stok
      const papers: InventoryOption[] = (json.data ?? [] as RawInventoryItem[])
        .filter((inv: RawInventoryItem) => inv.item.category === "PAPER" && inv.quantity > 0)
        .map((inv: RawInventoryItem) => ({
          id: inv.id,
          itemId: inv.item.id,
          name: inv.item.name,
          quantity: inv.quantity,
          unit: inv.item.unit,
        }))

      setPaperOptions(papers)
    } catch {
      // silent — fitur inventory optional, tidak gagalkan kasir
    }
  }, [activeShift.branchId])

  useEffect(() => {
    fetchPaperOptions()
  }, [fetchPaperOptions])

  const selectedPaper = paperOptions.find((p) => p.itemId === selectedPaperId)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = promoDiscount
  const total = Math.max(0, subtotal - discount)

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    try {
      const res = await fetch(`/api/promos/validate?code=${promoCode}&subtotal=${subtotal}`)
      if (res.ok) {
        const data = await res.json()
        setPromoDiscount(data.discountAmount)
      } else {
        const err = await res.json()
        setPromoDiscount(0)
        alert(err?.error ?? "Kode promo tidak valid")
      }
    } catch {
      setPromoDiscount(0)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode("")
    setPromoDiscount(0)
  }

  const typeLabel = (type: CartItem["type"]) => {
    if (type === "package") return "Paket"
    if (type === "template") return "Template"
    return "Add-On"
  }

  const typeBadgeVariant = (type: CartItem["type"]) => {
    if (type === "package") return "default" as const
    if (type === "template") return "secondary" as const
    return "outline" as const
  }

  return (
    <div className="flex h-full flex-col bg-muted/20 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Keranjang</h2>
          {cart.length > 0 && (
            <Badge variant="secondary">{cart.length} item</Badge>
          )}
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={onClearCart}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Kosongkan
          </Button>
        )}
      </div>

      {/* Shift info */}
      <div className="border-b bg-background px-4 py-2">
        <p className="text-xs text-muted-foreground">
          Shift <span className="font-mono font-medium text-foreground">{activeShift.shiftNo}</span>
          {" · "}
          <span className="font-medium text-foreground">{activeShift.cashier.name}</span>
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-3 p-4">
          {/* Cart items */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Keranjang kosong</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih produk dari panel sebelah kiri
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border bg-background p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Badge
                            variant={typeBadgeVariant(item.type)}
                            className="text-xs px-1.5 py-0 h-4"
                          >
                            {typeLabel(item.type)}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.code}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pilih Kertas (Inventory) */}
          {paperOptions.length > 0 && (
            <Collapsible open={openPaper} onOpenChange={setOpenPaper}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-9 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedPaper ? selectedPaper.name : "Pilih Kertas"}
                    </span>
                  </div>
                  {selectedPaper && (
                    <Badge variant="secondary" className="text-xs">
                      Stok: {selectedPaper.quantity} {selectedPaper.unit}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2 rounded-lg border bg-background p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Jenis Kertas</Label>
                  <Select
                    value={selectedPaperId}
                    onValueChange={setSelectedPaperId}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Pilih kertas" />
                    </SelectTrigger>
                    <SelectContent>
                      {paperOptions.map((p) => (
                        <SelectItem key={p.itemId} value={p.itemId}>
                          {p.name}{" "}
                          <span className="text-muted-foreground">
                            (stok: {p.quantity} {p.unit})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Jumlah Cetak (lembar)</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={printQty}
                    onChange={(e) => setPrintQty(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                {selectedPaper && printQty && Number(printQty) > selectedPaper.quantity && (
                  <p className="text-xs text-destructive">
                    Stok tidak cukup. Tersedia: {selectedPaper.quantity} {selectedPaper.unit}
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Customer */}
          <Collapsible open={openCustomer} onOpenChange={setOpenCustomer}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-9 text-sm"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {customerName ? customerName : "Tambah Info Customer"}
                  </span>
                </div>
                {customerName && (
                  <Badge variant="secondary" className="text-xs">Terisi</Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 rounded-lg border bg-background p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Customer</Label>
                <Input
                  placeholder="Nama lengkap"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor HP</Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Promo */}
          <Collapsible open={openPromo} onOpenChange={setOpenPromo}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-9 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {promoDiscount > 0
                      ? `Promo: -Rp ${promoDiscount.toLocaleString("id-ID")}`
                      : "Kode Promo"}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <Badge variant="secondary" className="text-xs text-green-600">Aktif</Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-lg border bg-background p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="h-8 text-sm font-mono"
                  disabled={promoDiscount > 0}
                />
                {promoDiscount > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={handleRemovePromo}
                  >
                    Hapus
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                  >
                    {promoLoading ? "..." : "Pakai"}
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes */}
          <Collapsible open={openNotes} onOpenChange={setOpenNotes}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-9 text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{notes ? "Catatan ditambahkan" : "Tambah Catatan"}</span>
                </div>
                {notes && (
                  <Badge variant="secondary" className="text-xs">Terisi</Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-lg border bg-background p-3">
              <Textarea
                placeholder="Catatan untuk transaksi ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm resize-none"
                rows={3}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Summary & Bayar */}
      <div className="border-t bg-background p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diskon Promo</span>
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

        <Button
          className="w-full"
          size="lg"
          disabled={cart.length === 0}
          onClick={() => setPaymentOpen(true)}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Proses Pembayaran
        </Button>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        cart={cart}
        subtotal={subtotal}
        discount={discount}
        total={total}
        customerName={customerName}
        customerPhone={customerPhone}
        promoCode={promoDiscount > 0 ? promoCode : ""}
        promoDiscount={promoDiscount}
        notes={notes}
        shiftId={activeShift.id}
        branch={branchInfo}
        paperId={selectedPaperId || undefined}
        printQty={printQty ? parseInt(printQty) : undefined}
        onSuccess={() => {
          setPaymentOpen(false)
          onClearCart()
          setCustomerName("")
          setCustomerPhone("")
          setPromoCode("")
          setPromoDiscount(0)
          setNotes("")
          setSelectedPaperId("")
          setPrintQty("")
          setOpenCustomer(false)
          setOpenPromo(false)
          setOpenNotes(false)
          setOpenPaper(false)
          // Refresh stok setelah transaksi
          fetchPaperOptions()
        }}
      />
    </div>
  )
}
