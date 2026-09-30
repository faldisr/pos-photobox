"use client"

import { useRef, useState } from "react"
import { Clock, PlayCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RupiahInput } from "@/components/kasir/rupiah-input"
import { rupiahError } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ActiveShift } from "@/app/(dashboard)/kasir/page"

type ShiftGuardProps = {
  onShiftStarted: (shift: ActiveShift) => void
}

export function ShiftGuard({ onShiftStarted }: ShiftGuardProps) {
  const [openingBalance, setOpeningBalance] = useState("")
  const [loading, setLoading] = useState(false)
  // Penjaga yang langsung berlaku: `loading` baru terbaca setelah render ulang,
  // sehingga Enter yang ditekan dua kali (atau Enter + klik) bisa lolos keduanya.
  const submitting = useRef(false)

  const handleStartShift = async () => {
    if (submitting.current) return

    const invalid = openingBalance === "" ? "Masukkan saldo awal" : rupiahError(Number(openingBalance), "Saldo awal")
    if (invalid) {
      toast.error(invalid)
      return
    }

    submitting.current = true
    setLoading(true)
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingBalance: Number(openingBalance) }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Shift berhasil dibuka")
        onShiftStarted(data)
      } else {
        const err = await res.json()
        toast.error(err?.error ?? "Gagal membuka shift")
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi")
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Buka Shift Kasir</CardTitle>
          <CardDescription>
            Tidak ada shift aktif. Buka shift terlebih dahulu untuk mulai melayani transaksi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openingBalance">Saldo Awal Kas</Label>
            <RupiahInput
              id="openingBalance"
              label="Saldo awal"
              value={openingBalance}
              onChange={setOpeningBalance}
              onEnter={handleStartShift}
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleStartShift}
            disabled={loading}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {loading ? "Membuka shift..." : "Mulai Shift"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}