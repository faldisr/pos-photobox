"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const addSchema = z.object({
  name: z.string().min(1, "Nama item harus diisi"),
  code: z.string().min(1, "Kode item harus diisi"),
  category: z.string().min(1, "Kategori harus dipilih"),
  unit: z.string().min(1, "Satuan harus diisi"),
  minStock: z.string().min(1, "Minimum stok harus diisi"),
  quantity: z.string().min(1, "Stok awal harus diisi"),
  unitCost: z.string().optional(),
  selectedBranchId: z.string().optional(),
})

const editSchema = z.object({
  quantityChange: z.string().min(1, "Jumlah perubahan harus diisi"),
  type: z.string().min(1, "Jenis perubahan harus dipilih"),
  note: z.string().optional(),
})

type AddFormValues = z.infer<typeof addSchema>
type EditFormValues = z.infer<typeof editSchema>

type InventoryItem = {
  id: string
  quantity: number
  lastRestockDate: string | null
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

type Branch = {
  id: string
  name: string
}

type InventoryFormProps = {
  inventory?: InventoryItem
  branchId: string
  isSuperAdmin?: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function InventoryForm({
  inventory,
  branchId,
  isSuperAdmin,
  onSuccess,
  onCancel,
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const isEdit = !!inventory

  useEffect(() => {
    if (!isSuperAdmin || isEdit) return
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/settings/branches")
        if (res.ok) {
          const data = await res.json()
          setBranches(Array.isArray(data) ? data : [])
        }
      } catch {
        // silent
      }
    }
    fetchBranches()
  }, [isSuperAdmin, isEdit])

  const addForm = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "PAPER",
      unit: "lembar",
      minStock: "10",
      quantity: "0",
      unitCost: "",
      selectedBranchId: "",
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      quantityChange: "",
      type: "RESTOCK",
      note: "",
    },
  })

  const quantityChangeValue = editForm.watch("quantityChange")
  const previewQty = inventory
    ? inventory.quantity + (parseInt(quantityChangeValue) || 0)
    : 0

  const onSubmitAdd = async (data: AddFormValues) => {
    const targetBranchId = isSuperAdmin ? data.selectedBranchId : branchId

    if (!targetBranchId) {
      toast.error("Pilih cabang terlebih dahulu")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: targetBranchId,
          name: data.name,
          code: data.code,
          category: data.category,
          unit: data.unit,
          minStock: parseInt(data.minStock),
          quantity: parseInt(data.quantity),
          unitCost: data.unitCost ? parseFloat(data.unitCost) : undefined,
        }),
      })

      if (res.ok) {
        toast.success("Item berhasil ditambahkan")
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal menyimpan data")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const onSubmitEdit = async (data: EditFormValues) => {
    if (!inventory) return
    setLoading(true)
    try {
      const res = await fetch(`/api/inventory/${inventory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantityChange: parseInt(data.quantityChange),
          type: data.type,
          note: data.note || undefined,
        }),
      })

      if (res.ok) {
        toast.success("Stok berhasil diperbarui")
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal memperbarui stok")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  // ─── Render Edit Form ──────────────────────────────────────────────────────

  if (isEdit) {
    return (
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/40 space-y-1">
            <p className="text-sm font-medium">{inventory.item.name}</p>
            <p className="text-xs text-muted-foreground">
              Stok saat ini:{" "}
              <span className="font-semibold text-foreground">
                {inventory.quantity} {inventory.item.unit}
              </span>
            </p>
          </div>

          <FormField
            control={editForm.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Perubahan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis perubahan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="RESTOCK">Restock (Tambah stok)</SelectItem>
                    <SelectItem value="ADJUSTMENT">Koreksi Stok</SelectItem>
                    <SelectItem value="RETURN">Return / Pengembalian</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="quantityChange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Perubahan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Masukkan angka (negatif untuk mengurangi)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Gunakan angka negatif untuk mengurangi stok secara manual
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan (opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Restock dari supplier, koreksi fisik, dll." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {quantityChangeValue && (
            <div className="rounded-lg border p-3 text-sm">
              Stok setelah update:{" "}
              <span className={`font-semibold ${previewQty < 0 ? "text-destructive" : ""}`}>
                {previewQty} {inventory.item.unit}
              </span>
              {previewQty < 0 && (
                <span className="ml-2 text-destructive text-xs">
                  (tidak boleh negatif)
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || previewQty < 0}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  // ─── Render Add Form ───────────────────────────────────────────────────────

  return (
    <Form {...addForm}>
      <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">

        {/* Dropdown cabang — hanya untuk SUPER_ADMIN */}
        {isSuperAdmin && (
          <FormField
            control={addForm.control}
            name="selectedBranchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cabang</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={addForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Item</FormLabel>
                <FormControl>
                  <Input placeholder="KRT-4R-GL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Item</FormLabel>
                <FormControl>
                  <Input placeholder="Kertas 4R Glossy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={addForm.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PAPER">Kertas</SelectItem>
                    <SelectItem value="INK">Tinta</SelectItem>
                    <SelectItem value="FRAME">Frame</SelectItem>
                    <SelectItem value="PROPS">Props</SelectItem>
                    <SelectItem value="OTHER">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addForm.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan</FormLabel>
                <FormControl>
                  <Input placeholder="lembar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={addForm.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Awal</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addForm.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stok</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="10" {...field} />
                </FormControl>
                <FormDescription>Batas peringatan stok rendah</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={addForm.control}
          name="unitCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Satuan (Rp) — opsional</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}