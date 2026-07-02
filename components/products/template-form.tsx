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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ui/image-upload"

const formSchema = z.object({
  name: z.string().min(1, "Nama template harus diisi"),
  code: z.string().min(1, "Kode template harus diisi"),
  category: z.string().min(1, "Kategori harus dipilih"),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

type Branch = {
  id: string
  name: string
  code: string
  isActive: boolean
}

type TemplateData = {
  id?: string
  name?: string
  code?: string
  category?: string
  description?: string
  thumbnailUrl?: string
  isActive?: boolean
  isPopular?: boolean
  branches?: { id: string }[]
}

type TemplateFormProps = {
  template?: TemplateData
  onSuccess: () => void
  onCancel: () => void
}

export function TemplateForm({ template, onSuccess, onCancel }: TemplateFormProps) {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(
    template?.branches?.map((b) => b.id) ?? []
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
      name: template?.name ?? "",
      code: template?.code ?? "",
      category: template?.category ?? "",
      description: template?.description ?? "",
      thumbnailUrl: template?.thumbnailUrl ?? "",
      isActive: template?.isActive ?? true,
      isPopular: template?.isPopular ?? false,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const url = template?.id
        ? `/api/products/templates/${template.id}`
        : "/api/products/templates"

      const res = await fetch(url, {
        method: template?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          branchIds: selectedBranchIds,
        }),
      })

      if (res.ok) {
        toast.success(template?.id ? "Template berhasil diupdate" : "Template berhasil ditambahkan")
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
                <FormLabel>Kode Template</FormLabel>
                <FormControl>
                  <Input placeholder="TPL001" {...field} />
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
                <FormLabel>Nama Template</FormLabel>
                <FormControl>
                  <Input placeholder="Birthday Party" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
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
                  <SelectItem value="Birthday">Birthday</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Graduation">Graduation</SelectItem>
                  <SelectItem value="Pre-Wedding">Pre-Wedding</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi template..."
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
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gambar Contoh Template</FormLabel>
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Status Aktif</FormLabel>
                  <FormDescription>
                    Template aktif akan muncul di menu kasir
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

          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Template Populer</FormLabel>
                  <FormDescription>
                    Tampilkan sebagai template populer
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
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-none">Cabang yang Menampilkan Template Ini</p>
            <p className="text-sm text-muted-foreground">
              Jika tidak ada cabang dipilih, template akan tampil di semua cabang.
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