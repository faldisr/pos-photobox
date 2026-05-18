"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
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
import { AddOnForm } from "./addon-form"
import { toast } from "sonner"

type AddOn = {
  id: string
  name: string
  code: string
  type: string
  price: number
  isActive: boolean
}

export function AddOnList() {
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null)

  const fetchAddOns = useCallback(async () => {
    try {
      const res = await fetch("/api/products/addons")
      const data = await res.json()
      setAddOns(data)
    } catch {
      toast.error("Gagal memuat data add-on")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAddOns()
  }, [fetchAddOns])

  const handleDelete = async () => {
    if (!selectedAddOn) return

    try {
      const res = await fetch(`/api/products/addons/${selectedAddOn.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Add-on berhasil dihapus")
        fetchAddOns()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menghapus add-on")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedAddOn(null)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EXTRA_PRINT: "Cetak Tambahan",
      FRAME: "Frame",
      DIGITAL_FILE: "File Digital",
      PROPS: "Props",
      OTHER: "Lainnya",
    }
    return labels[type] || type
  }

  const filteredAddOns = addOns.filter((addon) =>
    addon.name.toLowerCase().includes(search.toLowerCase()) ||
    addon.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari add-on..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setSelectedAddOn(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Add-On
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">Kode</TableHead>
              <TableHead className="min-w-[140px]">Nama Add-On</TableHead>
              <TableHead className="min-w-[120px]">Tipe</TableHead>
              <TableHead className="min-w-[100px] text-right">Harga</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[80px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredAddOns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filteredAddOns.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium">{addon.code}</TableCell>
                  <TableCell>{addon.name}</TableCell>
                  <TableCell>{getTypeLabel(addon.type)}</TableCell>
                  <TableCell className="text-right">
                    Rp {addon.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={addon.isActive ? "default" : "secondary"}>
                      {addon.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAddOn(addon)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAddOn(addon)
                          setDeleteDialogOpen(true)
                        }}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedAddOn ? "Edit Add-On" : "Tambah Add-On"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto pr-4">
            <AddOnForm
              addOn={selectedAddOn ?? undefined}
              onSuccess={() => {
                setDialogOpen(false)
                setSelectedAddOn(null)
                fetchAddOns()
              }}
              onCancel={() => {
                setDialogOpen(false)
                setSelectedAddOn(null)
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Add-On</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus add-on &quot;{selectedAddOn?.name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}