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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ui/image-upload"

const formSchema = z.object({
  name: z.string().min(1, "Nama paket harus diisi"),
  code: z.string().min(1, "Kode paket harus diisi"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  basePrice: z.string().min(1, "Harga harus diisi"),
  photoCount: z.string().min(1, "Jumlah foto harus diisi"),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

type Branch = {
  id: string
  name: string
  code: string
  isActive: boolean
}

type PackageData = {
  id?: string
  name?: string
  code?: string
  description?: string
  imageUrl?: string
  basePrice?: number | string
  photoCount?: number | string
  isActive?: boolean
  branches?: { id: string }[]
}

type PackageFormProps = {
  package?: PackageData
  onSuccess: () => void
  onCancel: () => void
}

export function PackageForm({ package: pkg, onSuccess, onCancel }: PackageFormProps) {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(
    pkg?.branches?.map((b) => b.id) ?? []
  )

  useEffect(() => {
    fetch("/api/settings/branches")
      .then((res) => res.json())
      .then((data: Branch[]) => setBranches(data.filter((b) => b.isActive)))
      .catch(() => {})
  }, [])

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]
    )
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: pkg?.name ?? "",
      code: pkg?.code ?? "",
      description: pkg?.description ?? "",
      imageUrl: pkg?.imageUrl ?? "",
      basePrice: pkg?.basePrice?.toString() ?? "",
      photoCount: pkg?.photoCount?.toString() ?? "",
      isActive: pkg?.isActive ?? true,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const url = pkg?.id
        ? `/api/products/packages/${pkg.id}`
        : "/api/products/packages"

      const res = await fetch(url, {
        method: pkg?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          basePrice: parseFloat(data.basePrice),
          photoCount: parseInt(data.photoCount),
          branchIds: selectedBranchIds,
        }),
      })

      if (res.ok) {
        toast.success(pkg?.id ? "Paket berhasil diupdate" : "Paket berhasil ditambahkan")
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Paket</FormLabel>
                <FormControl>
                  <Input placeholder="PKG001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Paket</FormLabel>
                <FormControl>
                  <Input placeholder="Paket Standard" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi paket..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gambar Contoh Paket</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={() => field.onChange("")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photoCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Foto</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="4" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <FormDescription>
                  Paket aktif akan muncul di menu kasir
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="rounded-lg border p-4 space-y-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-none">Cabang yang Menampilkan Paket Ini</p>
            <p className="text-sm text-muted-foreground">
              Jika tidak ada cabang dipilih, paket akan tampil di semua cabang.
            </p>
          </div>
          {branches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Memuat daftar cabang...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {branches.map((branch) => (
                <label key={branch.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedBranchIds.includes(branch.id)}
                    onCheckedChange={() => toggleBranch(branch.id)}
                  />
                  {branch.name}
                </label>
              ))}
            </div>
          )}
        </div>

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