// Semua cabang berada di Jawa (WIB, UTC+7, tanpa DST). Batas "hari" untuk laporan,
// dashboard, dan nomor antrian selalu dihitung di WIB — tidak bergantung pada zona
// waktu server (server produksi WIB, laptop/CI bisa berbeda).
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** 00:00 WIB dari hari yang memuat `date` */
export function startOfWibDay(date = new Date()): Date {
  return new Date(Math.floor((date.getTime() + WIB_OFFSET_MS) / DAY_MS) * DAY_MS - WIB_OFFSET_MS)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

/** "YYYY-MM-DD" menurut kalender WIB */
export function wibDateKey(date: Date): string {
  return new Date(date.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10)
}

/** Jam 0–23 menurut WIB */
export function wibHour(date: Date): number {
  return new Date(date.getTime() + WIB_OFFSET_MS).getUTCHours()
}

/** 00:00 WIB dari tanggal "YYYY-MM-DD"; null kalau formatnya salah atau tanggalnya tidak ada */
function wibDayStart(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null
  const utcMidnight = new Date(`${ymd}T00:00:00Z`)
  if (Number.isNaN(utcMidnight.getTime()) || utcMidnight.toISOString().slice(0, 10) !== ymd) return null
  return new Date(utcMidnight.getTime() - WIB_OFFSET_MS)
}

/**
 * Filter `createdAt` untuk parameter dateFrom/dateTo ("YYYY-MM-DD", inklusif):
 * hari WIB penuh, 00:00–23:59:59.999. `error` terisi kalau parameternya tidak valid.
 */
export function wibDateRange(dateFrom: string, dateTo: string): { range?: { gte?: Date; lt?: Date }; error?: string } {
  if (!dateFrom && !dateTo) return {}
  const from = dateFrom ? wibDayStart(dateFrom) : undefined
  const to   = dateTo   ? wibDayStart(dateTo)   : undefined
  if (from === null || to === null) return { error: "Format tanggal tidak valid (harus YYYY-MM-DD)" }
  if (from && to && from > to) return { error: "Tanggal awal tidak boleh setelah tanggal akhir" }
  return { range: { ...(from ? { gte: from } : {}), ...(to ? { lt: addDays(to, 1) } : {}) } }
}
