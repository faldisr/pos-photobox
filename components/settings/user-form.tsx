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
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.string().min(1, "Role harus dipilih"),
  branchId: z.string().optional(),
})

const editSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().min(1, "Email harus diisi").email("Format email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter").optional(),
  password: z.string().optional(),
  role: z.string().min(1, "Role harus dipilih"),
  branchId: z.string().optional(),
})

type AddFormValues = z.infer<typeof addSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = AddFormValues | EditFormValues

type UserData = {
  id?: string
  name?: string
  email?: string
  username?: string
  role?: string
  branchId?: string | null
}

type Branch = {
  id: string
  name: string
}

type UserFormProps = {
  user?: UserData
  onSuccess: () => void
  onCancel: () => void
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_MANAGER: "Branch Manager",
  CASHIER: "Kasir",
  INVENTORY_STAFF: "Staff Inventory",
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const isEdit = !!user?.id

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/settings/branches")
        if (!res.ok) return
        const data = await res.json()
        setBranches(Array.isArray(data) ? data : [])
      } catch {
        // silent
      }
    }
    fetchBranches()
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : addSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
      password: "",
      role: user?.role ?? "",
      branchId: user?.branchId ?? "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (!isEdit && !data.password) return
    setLoading(true)
    try {
      const url = isEdit
        ? `/api/settings/users/${user!.id}`
        : "/api/settings/users"

      const payload: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        role: data.role,
        branchId: data.branchId || null,
      }

      // Saat tambah: selalu kirim username
      // Saat edit: hanya kirim kalau diisi
      if (!isEdit || (data.username && data.username.trim() !== "")) {
        payload.username = data.username
      }

      // Saat tambah: selalu kirim password
      // Saat edit: hanya kirim kalau diisi
      if (!isEdit || (data.password && data.password.trim() !== "")) {
        payload.password = data.password
      }

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isEdit ? "User berhasil diupdate" : "User berhasil ditambahkan")
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Nama lengkap" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="nama@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username{isEdit && " (opsional)"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Contoh: john_doe"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password{isEdit && " (opsional)"}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cabang</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? ""}
                >
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