"use client"

import { useState, useEffect } from "react"
import { Printer, Plus, Trash2, Check } from "lucide-react"
import { toast } from "sonner"
import { setCachedDevice } from "@/lib/print-receipt"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const BT_SERVICE_UUID  = "000018f0-0000-1000-8000-00805f9b34fb"
const LS_PRINTERS_KEY  = "bt_printers"
const LS_ACTIVE_KEY    = "bt_active_printer_id"
const MAX_PRINTERS     = 5

type SavedPrinter = {
  id: string
  name: string
}

type PrinterManagerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrinterManagerDialog({ open, onOpenChange }: PrinterManagerDialogProps) {
  const [printers, setPrinters] = useState<SavedPrinter[]>([])
  const [activePrinterId, setActivePrinterId] = useState<string>("")
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!open) return
    try {
      const saved = localStorage.getItem(LS_PRINTERS_KEY)
      setPrinters(saved ? JSON.parse(saved) : [])
      setActivePrinterId(localStorage.getItem(LS_ACTIVE_KEY) ?? "")
    } catch {
      setPrinters([])
      setActivePrinterId("")
    }
  }, [open])

  const savePrinters = (list: SavedPrinter[]) => {
    setPrinters(list)
    localStorage.setItem(LS_PRINTERS_KEY, JSON.stringify(list))
  }

  const handleAddPrinter = async () => {
    if (!("bluetooth" in navigator)) {
      toast.error("Browser tidak mendukung Bluetooth. Gunakan Chrome.")
      return
    }
    if (printers.length >= MAX_PRINTERS) {
      toast.error(`Maksimal ${MAX_PRINTERS} printer.`)
      return
    }
    setAdding(true)
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BT_SERVICE_UUID] }],
        optionalServices: [BT_SERVICE_UUID],
      })
      // Cache device object di memory agar print langsung bisa tanpa picker
      setCachedDevice(device)

      const already = printers.find((p) => p.id === device.id)
      if (already) {
        toast.error("Printer sudah ditambahkan.")
        return
      }
      const newPrinter: SavedPrinter = {
        id: device.id,
        name: device.name ?? `Printer ${printers.length + 1}`,
      }
      const updated = [...printers, newPrinter]
      savePrinters(updated)
      if (!activePrinterId) {
        setActivePrinterId(newPrinter.id)
        localStorage.setItem(LS_ACTIVE_KEY, newPrinter.id)
      }
      toast.success(`Printer "${newPrinter.name}" ditambahkan.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes("cancelled") && !msg.includes("User cancelled")) {
        toast.error("Gagal menambahkan printer.")
      }
    } finally {
      setAdding(false)
    }
  }

  const handleSetActive = (id: string) => {
    setActivePrinterId(id)
    localStorage.setItem(LS_ACTIVE_KEY, id)
    // Coba cache device object agar print langsung bisa tanpa picker
    navigator.bluetooth?.getDevices?.()
      .then((devices) => {
        const found = devices.find((d) => d.id === id)
        if (found) setCachedDevice(found)
      })
      .catch(() => { /* silent */ })
  }

  const handleDelete = (id: string) => {
    const updated = printers.filter((p) => p.id !== id)
    savePrinters(updated)
    if (activePrinterId === id) {
      const newActive = updated[0]?.id ?? ""
      setActivePrinterId(newActive)
      localStorage.setItem(LS_ACTIVE_KEY, newActive)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Printer Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {printers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Printer className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Belum ada printer tersimpan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 min-w-0"
                    onClick={() => handleSetActive(printer.id)}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        activePrinterId === printer.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {activePrinterId === printer.id && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{printer.name}</p>
                      {activePrinterId === printer.id && (
                        <p className="text-xs text-primary">Aktif</p>
                      )}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(printer.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddPrinter}
            disabled={adding || printers.length >= MAX_PRINTERS}
          >
            <Plus className="mr-2 h-4 w-4" />
            {adding ? "Memilih printer..." : "Tambah Printer"}
          </Button>

          {printers.length >= MAX_PRINTERS && (
            <p className="text-xs text-muted-foreground text-center">
              Maksimal {MAX_PRINTERS} printer tercapai.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}