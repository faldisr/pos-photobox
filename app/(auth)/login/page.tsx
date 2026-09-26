"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type RoleType = "ADMIN" | "CASHIER" | null

// Alasan logout otomatis, dikirim lewat ?reason= oleh SessionWatcher (components/providers.tsx)
const LOGOUT_MESSAGES: Record<string, string> = {
  elsewhere: "Anda keluar karena akun ini login di perangkat lain.",
  expired:   "Sesi Anda sudah berakhir. Silakan login kembali.",
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleType>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    const message = LOGOUT_MESSAGES[new URLSearchParams(window.location.search).get("reason") ?? ""]
    if (!message) return
    toast.warning(message, { duration: 10000 })
    window.history.replaceState(null, "", "/login")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Login berhasil!")
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">ORIJIN</CardTitle>
            <CardDescription>
              Pilih tipe login untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              className="w-full h-16 text-lg"
              onClick={() => setSelectedRole("ADMIN")}
            >
              Admin
            </Button>
            <Button
              className="w-full h-16 text-lg"
              variant="outline"
              onClick={() => setSelectedRole("CASHIER")}
            >
              Kasir
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ORIJIN</CardTitle>
          <CardDescription>
            Login sebagai {selectedRole === "ADMIN" ? "Admin" : "Kasir"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email / Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="nama@example.com atau username"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setSelectedRole(null)
                setFormData({ email: "", password: "" })
              }}
              disabled={isLoading}
            >
              Kembali
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}