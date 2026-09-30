// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency ke Rupiah
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Format date ke format Indonesia
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }
  
  const options = optionsMap[format]
  
  return new Intl.DateTimeFormat('id-ID', options).format(d)
}

/**
 * Format datetime
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Generate transaction number
 */
export function generateTransactionNo(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  
  return `TRX-${year}${month}${day}-${random}`
}

/** Selisih kas (Rp) yang mewajibkan kasir mengisi alasan saat tutup shift */
export const SELISIH_WAJIB_ALASAN = 10_000

/**
 * Validasi nominal kas yang diketik kasir. Kasir terbiasa menyingkat ribuan
 * ("300" untuk Rp300.000), jadi 1–999 ditolak — nominal harus ditulis lengkap.
 * 0 tetap boleh (mis. tidak ada uang yang disetor). null = valid.
 */
export function rupiahError(value: unknown, label: string): string | null {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) return `${label} tidak valid`
  if (n > 0 && n < 1000) return `${label} harus ditulis lengkap, contoh 300.000 (bukan 300)`
  if (n > 99_999_999) return `${label} terlalu besar`
  return null
}

const MAX_PAGE_LIMIT = 100

/**
 * Baca & validasi page/limit dari query string. `error` terisi kalau tidak valid
 * (bukan bilangan bulat, page < 1, atau limit di luar 1–100) — supaya request
 * aneh ditolak 400, bukan membuat query error (500) atau mengambil data tanpa batas.
 */
export function parsePagination(searchParams: URLSearchParams, defaultLimit: number) {
  const page  = Number(searchParams.get("page")  ?? 1)
  const limit = Number(searchParams.get("limit") ?? defaultLimit)
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    return { page: 1, limit: defaultLimit, skip: 0, error: `Parameter halaman tidak valid (page minimal 1, limit 1–${MAX_PAGE_LIMIT})` }
  }
  return { page, limit, skip: (page - 1) * limit }
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CASH: 'Tunai',
    DEBIT_CARD: 'Kartu Debit',
    CREDIT_CARD: 'Kartu Kredit',
    QRIS: 'QRIS',
    TRANSFER: 'Transfer Bank',
    E_WALLET: 'E-Wallet',
  }
  return labels[method] || method
}