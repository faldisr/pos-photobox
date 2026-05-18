"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { InventoryForm } from "./inventory-form"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

type InventoryItem = {
  id: string
  quantity: number
  lastRestockDate: string | null
  branchName: string | null
  item: {
    id: string
    name: string
    code: string
    category: string
    unit: string
    minStock: number
    unitCost: number | null
  }
}

type ActiveShiftResponse = {
  branchId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  PAPER: "Kertas",
  INK: "Tinta",
  FRAME: "Frame",
  PROPS: "Props",
  OTHER: "Lainnya",
}

export function InventoryList() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const [branchId, setBranchId] = useState<string | null>(null)
  const [inventories, setInventories] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    if (!session?.user) return

    if (isSuperAdmin) {
      // SUPER_ADMIN & BRANCH_MANAGER tidak perlu branchId dari shift
      setBranchId("")
      return
    }

    // CASHIER ambil branchId dari shift aktif
    const fetchBranchId = async () => {
      try {
        const res = await fetch("/api/shifts/active")
        if (!res.ok) return
        const data: ActiveShiftResponse = await res.json()
        if (data.branchId) setBranchId(data.branchId)
      } catch {
        // silent
      }
    }
    fetchBranchId()
  }, [session, isSuperAdmin])

  const fetchInventories = useCallback(async () => {
    if (branchId === null) return
    try {
      const url = branchId
        ? `/api/inventory?branchId=${branchId}`
        : `/api/inventory`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal memuat data")
      setInventories(data.data)
    } catch {
      toast.error("Gagal memuat data inventory")
    } finally {
      setLoading(false)
    }
  }, [branchId])

  useEffect(() => {
    fetchInventories()
  }, [fetchInventories])

  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Item berhasil dihapus")
        fetchInventories()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menghapus item")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedItem(null)
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return { label: "Habis", variant: "destructive" as const }
    if (quantity <= minStock) return { label: "Hampir Habis", variant: "warning" as const }
    return { label: "Aman", variant: "success" as const }
  }

  const filteredInventories = inventories.filter(
    (inv) =>
      inv.item.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.item.code.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = inventories.filter(
    (inv) => inv.quantity > 0 && inv.quantity <= inv.item.minStock
  ).length
  const outOfStockCount = inventories.filter((inv) => inv.quantity <= 0).length

  return (
    <div className="space-y-4">
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {outOfStockCount > 0 && (
              <><strong>{outOfStockCount} item</strong> stok habis. </>
            )}
            {lowStockCount > 0 && (
              <><strong>{lowStockCount} item</strong> hampir habis.</>
            )}
            {" "}Segera lakukan restock.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setSelectedItem(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Item
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">Kode</TableHead>
              <TableHead className="min-w-[160px]">Nama Item</TableHead>
              <TableHead className="min-w-[100px]">Kategori</TableHead>
              {isSuperAdmin && (
                <TableHead className="min-w-[120px]">Cabang</TableHead>
              )}
              <TableHead className="min-w-[100px] text-right">Stok</TableHead>
              <TableHead className="min-w-[100px] text-right">Min. Stok</TableHead>
              <TableHead className="min-w-[110px] text-right">Harga Satuan</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[80px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 9 : 8} className="text-center py-8">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredInventories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 9 : 8} className="text-center py-8">
                  {search ? "Tidak ada item yang cocok" : "Belum ada data inventory"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInventories.map((inv) => {
                const status = getStockStatus(inv.quantity, inv.item.minStock)
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.item.code}</TableCell>
                    <TableCell>{inv.item.name}</TableCell>
                    <TableCell>
                      {CATEGORY_LABELS[inv.item.category] ?? inv.item.category}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>{inv.branchName ?? "-"}</TableCell>
                    )}
                    <TableCell className="text-right">
                      {inv.quantity.toLocaleString("id-ID")} {inv.item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.item.minStock.toLocaleString("id-ID")} {inv.item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.item.unitCost != null
                        ? formatCurrency(inv.item.unitCost)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(inv)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(inv)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Update Stok" : "Tambah Item Inventory"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto pr-4">
            <InventoryForm
              inventory={selectedItem ?? undefined}
              branchId={branchId ?? ""}
              isSuperAdmin={isSuperAdmin}
              onSuccess={() => {
                setDialogOpen(false)
                setSelectedItem(null)
                fetchInventories()
              }}
              onCancel={() => {
                setDialogOpen(false)
                setSelectedItem(null)
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Item Inventory</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item &quot;{selectedItem?.item.name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}