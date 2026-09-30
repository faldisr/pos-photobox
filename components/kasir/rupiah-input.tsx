"use client"

import { Input } from "@/components/ui/input"
import { rupiahError } from "@/lib/utils"

type RupiahInputProps = {
  id: string
  label: string
  value: string // hanya digit, mis. "300000"
  onChange: (digits: string) => void
  placeholder?: string
  onEnter?: () => void
  autoFocus?: boolean
}

/**
 * Kolom nominal rupiah: tampil bertitik ribuan saat diketik (300.000), dan
 * menolak nominal singkatan 1–999 ("300" untuk 300 ribu) dengan pesan di bawahnya.
 */
export function RupiahInput({ id, label, value, onChange, placeholder = "Contoh: 300.000", onEnter, autoFocus }: RupiahInputProps) {
  const error = value ? rupiahError(Number(value), label) : null
  return (
    <div className="space-y-1">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value ? Number(value).toLocaleString("id-ID") : ""}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9))}
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
          aria-invalid={!!error}
          className="pl-9 text-base font-medium"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
