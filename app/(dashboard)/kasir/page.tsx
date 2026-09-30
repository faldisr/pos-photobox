"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { startOfWibDay, wibHour } from "@/lib/wib"
import { ProductPanel } from "@/components/kasir/product-panel"
import { CartPanel } from "@/components/kasir/cart-panel"
import { ShiftGuard } from "@/components/kasir/shift-guard"
import { ShiftEndDialog } from "@/components/kasir/shift-end-dialog"
import { PrinterManagerDialog } from "@/components/kasir/printer-manager-dialog"
import { ShoppingCart, StopCircle, Printer, AlarmClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export type CartItem = {
  id: string
  type: "package" | "template" | "addon"
  name: string
  code: string
  price: number
  quantity: number
  packageId?: string
  templateId?: string
  addOnId?: string
}

export type ActiveShift = {
  id: string
  shiftNo: string
  branchId: string
  cashier: { name: string }
  startTime: string
}

export type BranchInfo = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  city?: string | null
}

export default function KasirPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null)
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null)
  const [loadingShift, setLoadingShift] = useState(true)
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [printerManagerOpen, setPrinterManagerOpen] = useState(false)

  // Jam sekarang, diperbarui tiap 30 detik — untuk pengingat tutup shift & shift kemarin
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  // Pukul 21.00 WIB ke atas: ingatkan kasir menutup shift sebelum pulang
  const closeReminder = !!activeShift && wibHour(now) >= 21
  const remindedShift = useRef<string | null>(null)
  useEffect(() => {
    if (!closeReminder || !activeShift || remindedShift.current === activeShift.id) return
    // Ditunda sebentar: toast yang dipanggil bersamaan dengan "Shift berhasil dibuka"
    // (saat layar berganti) bisa hilang tidak tampil di sonner
    const timer = setTimeout(() => {
      remindedShift.current = activeShift.id
      toast.warning("Sudah pukul 21.00 — jangan lupa tutup shift sebelum pulang.", { duration: 15000 })
    }, 800)
    return () => clearTimeout(timer)
  }, [closeReminder, activeShift])

  // Shift yang dibuka kemarin (atau sebelumnya) harus ditutup dulu sebelum bertransaksi
  const staleShift = !!activeShift && startOfWibDay(new Date(activeShift.startTime)) < startOfWibDay(now)

  const fetchActiveShift = useCallback(async () => {
    try {
      const res = await fetch("/api/shifts/active")
      if (res.ok) {
        const data = await res.json()
        setActiveShift(data)
      } else {
        setActiveShift(null)
      }
    } catch {
      setActiveShift(null)
    } finally {
      setLoadingShift(false)
    }
  }, [])

  useEffect(() => {
    fetchActiveShift()
  }, [fetchActiveShift])

  useEffect(() => {
    if (!activeShift?.branchId) return
    const fetchBranch = async () => {
      try {
        const res = await fetch(`/api/settings/branches/${activeShift.branchId}`)
        if (res.ok) {
          const data = await res.json()
          setBranchInfo(data)
        }
      } catch {
        // silent
      }
    }
    fetchBranch()
  }, [activeShift?.branchId])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id))
    } else {
      setCart((prev) =>
        prev.map((c) => (c.id === id ? { ...c, quantity } : c))
      )
    }
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const clearCart = () => setCart([])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (loadingShift) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Memuat data shift...</p>
      </div>
    )
  }

  if (!activeShift) {
    return (
      <ShiftGuard onShiftStarted={(shift) => setActiveShift(shift)} />
    )
  }

  const endDialog = (
    <ShiftEndDialog
      open={endDialogOpen}
      onOpenChange={setEndDialogOpen}
      shiftId={activeShift.id}
      onShiftEnded={() => {
        setActiveShift(null)
        setCart([])
      }}
    />
  )

  if (staleShift) {
    const tanggal = new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta",
    }).format(new Date(activeShift.startTime))
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlarmClock className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Shift kemarin belum ditutup</h2>
            <p className="text-sm text-muted-foreground">
              Shift <span className="font-mono">{activeShift.shiftNo}</span> dibuka {tanggal}.
              Tutup dulu dengan hitungan kas, lalu buka shift baru untuk hari ini.
            </p>
          </div>
          <Button className="w-full" size="lg" variant="destructive" onClick={() => setEndDialogOpen(true)}>
            <StopCircle className="mr-2 h-5 w-5" />
            Tutup Shift Sekarang
          </Button>
        </div>
        {endDialog}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Bar info shift + tombol tutup shift */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground">
          Shift <span className="font-mono font-medium text-foreground">{activeShift.shiftNo}</span>
          {" · "}
          <span className="font-medium text-foreground">{activeShift.cashier.name}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPrinterManagerOpen(true)}
          >
            <Printer className="mr-1 h-3.5 w-3.5" />
            Printer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
            onClick={() => setEndDialogOpen(true)}
          >
            <StopCircle className="mr-1 h-3.5 w-3.5" />
            Tutup Shift
          </Button>
        </div>
      </div>

      {closeReminder && (
        <button
          type="button"
          onClick={() => setEndDialogOpen(true)}
          className="flex w-full items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
        >
          <AlarmClock className="h-4 w-4 shrink-0" />
          Sudah pukul 21.00 WIB — jangan lupa tutup shift sebelum pulang.
          <span className="underline">Tutup shift</span>
        </button>
      )}

      {/* Konten kasir */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel Kiri: Produk */}
        <div className="flex-1 overflow-hidden md:border-r">
          <ProductPanel onAddToCart={addToCart} cart={cart} branchId={activeShift.branchId} />
        </div>

        {/* Panel Kanan: Keranjang */}
        <div className="hidden md:block md:w-[360px] lg:w-[400px] shrink-0 overflow-hidden">
          <CartPanel
            cart={cart}
            activeShift={activeShift}
            branchInfo={branchInfo}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClearCart={clearCart}
          />
        </div>
      </div>

      {/* Floating Cart Button: hanya tampil di mobile/tablet */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg relative">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm p-0">
            <CartPanel
              cart={cart}
              activeShift={activeShift}
              branchInfo={branchInfo}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClearCart={clearCart}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialog Tutup Shift */}
      {endDialog}

      <PrinterManagerDialog
        open={printerManagerOpen}
        onOpenChange={setPrinterManagerOpen}
      />
    </div>
  )
}