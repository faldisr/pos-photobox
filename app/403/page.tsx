import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <ShieldX className="h-16 w-16 text-destructive" />
      <h1 className="text-3xl font-bold">Akses Ditolak</h1>
      <p className="text-muted-foreground max-w-sm">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Button asChild>
        <Link href="/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  )
}