/// <reference types="web-bluetooth" />

// ─── Types ───────────────────────────────────────────────────────────────────

type ReceiptItem = {
  name: string
  quantity: number
  price: number
}

type BranchInfo = {
  name: string
  address?: string | null
  phone?: string | null
  city?: string | null
}

type PrintReceiptParams = {
  transactionNo: string
  transactionDate: Date | null
  customerName: string
  customerPhone: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  paidAmount: number
  change: number
  promoCode: string
  notes: string
  branch?: BranchInfo | null
  isPrinted?: boolean
  queueNumber?: string | null
  onAfterPrint?: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  DEBIT_CARD: "Debit/Kartu",
  TRANSFER: "Transfer Bank",
}

/**
 * UUID Service & Characteristic untuk printer EPPOS RPP02N via BLE.
 * Diverifikasi langsung dari nRF Connect (CONNECTED -> CLIENT):
 *   Service        : Unknown Service  UUID 0x18F0  -> 000018f0-0000-1000-8000-00805f9b34fb
 *   Characteristic : Unknown Char     UUID 0x2AF1  -> 00002af1-0000-1000-8000-00805f9b34fb
 *                    Properties: WRITE, WRITE NO RESPONSE
 */
const BT_SERVICE_UUID        = "000018f0-0000-1000-8000-00805f9b34fb"
const BT_CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb"

/** Lebar kertas 58mm ≈ 32 karakter monospace */
const PAPER_WIDTH = 32

// ─── ESC/POS Command Helpers ──────────────────────────────────────────────────

/** Gabungkan beberapa Uint8Array menjadi satu */
function mergeBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

/** Encode string ke bytes (Latin-1 / ASCII) */
function enc(text: string): Uint8Array {
  // Ganti karakter non-ASCII umum agar tidak jadi kotak di printer
  const cleaned = text
    .replace(/Rp/g, "Rp")
    .replace(/[^\x00-\xFF]/g, "?")
  return new Uint8Array([...cleaned].map((c) => c.charCodeAt(0) & 0xff))
}

/** Baris baru */
function newline(n = 1): Uint8Array {
  return new Uint8Array(Array(n).fill(0x0a))
}

/** ESC @ — reset printer ke default */
const CMD_RESET      = new Uint8Array([0x1b, 0x40])
/** ESC a 0 — align left */
const CMD_ALIGN_LEFT   = new Uint8Array([0x1b, 0x61, 0x00])
/** ESC a 1 — align center */
const CMD_ALIGN_CENTER = new Uint8Array([0x1b, 0x61, 0x01])
/** ESC E 1 — bold on */
const CMD_BOLD_ON    = new Uint8Array([0x1b, 0x45, 0x01])
/** ESC E 0 — bold off */
const CMD_BOLD_OFF   = new Uint8Array([0x1b, 0x45, 0x00])
/** GS ! 0x11 — double width + double height (2x) */
const CMD_SIZE_2X    = new Uint8Array([0x1d, 0x21, 0x11])
/** GS ! 0x00 — ukuran normal */
const CMD_SIZE_NORMAL = new Uint8Array([0x1d, 0x21, 0x00])
/** GS V 0 — full cut */
const CMD_CUT        = new Uint8Array([0x1d, 0x56, 0x00])
/** ESC d 3 — feed 3 baris sebelum cut */
const CMD_FEED       = new Uint8Array([0x1b, 0x64, 0x03])

/** Garis putus-putus 32 karakter */
function divider(): Uint8Array {
  return enc("-".repeat(PAPER_WIDTH))
}

/** Pad string kiri & kanan hingga totalWidth, untuk format 2 kolom */
function padRow(left: string, right: string, totalWidth = PAPER_WIDTH): Uint8Array {
  const maxLeft = totalWidth - right.length - 1
  const truncLeft = left.length > maxLeft ? left.slice(0, maxLeft) : left
  const spaces = totalWidth - truncLeft.length - right.length
  return enc(truncLeft + " ".repeat(Math.max(spaces, 1)) + right)
}

/** Format rupiah ringkas: 75000 → "Rp75.000" */
function fmtCurrency(amount: number): string {
  return "Rp" + new Intl.NumberFormat("id-ID").format(amount)
}

/** Format tanggal: "21 Jun 2026 16:30" */
function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// ─── Queue Number (localStorage fallback) ────────────────────────────────────

/**
 * Generate nomor antrian harian (fallback jika queueNumber tidak dikirim server).
 * Format: 001, 002, dst — reset tiap hari.
 */
export function generateQueueNumber(): string {
  const today = new Date().toISOString().slice(0, 10)
  const storedDate = localStorage.getItem("queue_date")
  let counter = 1

  if (storedDate === today) {
    counter = parseInt(localStorage.getItem("queue_number") ?? "0", 10) + 1
  }

  localStorage.setItem("queue_date", today)
  localStorage.setItem("queue_number", String(counter))

  return String(counter).padStart(3, "0")
}

// ─── ESC/POS Receipt Builder ──────────────────────────────────────────────────

function buildReceiptBytes(
  params: PrintReceiptParams & { resolvedQueueNumber: string }
): Uint8Array {
  const chunks: Uint8Array[] = []

  const push = (...bytes: Uint8Array[]) => chunks.push(...bytes)
  const line = (text: string) => push(enc(text), newline())

  // ── Reset ──────────────────────────────────────────────────────────────────
  push(CMD_RESET)

  // ── Header: Nama Toko ──────────────────────────────────────────────────────
  push(CMD_ALIGN_CENTER)
  push(CMD_BOLD_ON, CMD_SIZE_2X)
  push(enc(params.branch?.name ?? "PHOTOBOX POS"), newline())
  push(CMD_SIZE_NORMAL, CMD_BOLD_OFF)

  if (params.branch?.city)    push(enc(params.branch.city), newline())
  if (params.branch?.address) push(enc(params.branch.address), newline())
  if (params.branch?.phone)   push(enc("Telp: " + params.branch.phone), newline())

  push(newline())
  push(CMD_ALIGN_LEFT)
  push(divider(), newline())

  // ── Nomor Antrian ──────────────────────────────────────────────────────────
  push(CMD_ALIGN_CENTER)
  line("NO. ANTRIAN")
  push(CMD_BOLD_ON, CMD_SIZE_2X)
  push(enc(params.resolvedQueueNumber), newline())
  push(CMD_SIZE_NORMAL, CMD_BOLD_OFF)
  push(newline())

  push(CMD_ALIGN_LEFT)
  push(divider(), newline())

  // ── Info Transaksi ─────────────────────────────────────────────────────────
  push(padRow("No. Transaksi", params.transactionNo), newline())
  push(
    padRow("Tanggal", params.transactionDate ? fmtDate(params.transactionDate) : "-"),
    newline()
  )
  if (params.customerName)
    push(padRow("Pelanggan", params.customerName), newline())
  if (params.customerPhone)
    push(padRow("No. HP", params.customerPhone), newline())

  push(divider(), newline())

  // ── Item ───────────────────────────────────────────────────────────────────
  for (const item of params.items) {
    const itemTotal = fmtCurrency(item.price * item.quantity)
    const qtyLabel  = `${item.quantity}x`
    // Baris 1: nama item (bisa wrap)
    const maxNameWidth = PAPER_WIDTH - qtyLabel.length - itemTotal.length - 2
    const namePart = item.name.slice(0, maxNameWidth)
    push(enc(namePart.padEnd(maxNameWidth) + " " + qtyLabel + " " + itemTotal), newline())
  }

  push(divider(), newline())

  // ── Subtotal & Diskon ──────────────────────────────────────────────────────
  push(padRow("Subtotal", fmtCurrency(params.subtotal)), newline())

  if (params.discount > 0) {
    const discLabel = params.promoCode
      ? `Diskon (${params.promoCode})`
      : "Diskon"
    push(padRow(discLabel, "- " + fmtCurrency(params.discount)), newline())
  }

  push(divider(), newline())

  // ── Total ──────────────────────────────────────────────────────────────────
  push(CMD_BOLD_ON)
  push(padRow("TOTAL", fmtCurrency(params.total)), newline())
  push(CMD_BOLD_OFF)

  push(padRow("Pembayaran", PAYMENT_METHOD_LABEL[params.paymentMethod] ?? params.paymentMethod), newline())

  if (params.paymentMethod === "CASH") {
    push(padRow("Bayar", fmtCurrency(params.paidAmount)), newline())
    push(padRow("Kembalian", fmtCurrency(params.change)), newline())
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (params.notes) {
    push(divider(), newline())
    push(enc("ID Foto: " + params.notes), newline())
  }

  // ── Watermark cetak ulang ──────────────────────────────────────────────────
  if (params.isPrinted) {
    push(divider(), newline())
    push(CMD_ALIGN_CENTER)
    push(enc("*** CETAK ULANG ***"), newline())
    push(CMD_ALIGN_LEFT)
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  push(divider(), newline())
  push(CMD_ALIGN_CENTER)
  line("Terima kasih atas kunjungan Anda!")
  line("Simpan struk ini sebagai bukti")
  line("pembayaran.")
  push(newline())
  line("Instagram: @orijinselfphoto")
  push(newline())

  // ── Feed + Cut ─────────────────────────────────────────────────────────────
  push(CMD_FEED)
  push(CMD_CUT)

  return mergeBytes(...chunks)
}

// ─── Bluetooth Printer ────────────────────────────────────────────────────────

/**
 * Key untuk menyimpan device ID di sessionStorage agar tidak perlu
 * pilih ulang printer setiap transaksi (dalam satu sesi browser).
 */
const BT_SESSION_KEY = "bt_printer_id"

/** Kirim bytes ke printer via Web Bluetooth, maks 512 byte per chunk */
async function sendToPrinter(data: Uint8Array): Promise<void> {
  if (!("bluetooth" in navigator)) {
    throw new Error("WEB_BT_NOT_SUPPORTED")
  }

  let device: BluetoothDevice | null = null

  try {
    // Coba pakai device dari session jika tersedia
    const savedId = sessionStorage.getItem(BT_SESSION_KEY)
    if (savedId) {
      const devices = await navigator.bluetooth.getDevices()
      device = devices.find((d) => d.id === savedId) ?? null
    }
  } catch {
    // getDevices() mungkin tidak support di semua browser, abaikan
  }

  if (!device) {
    // Tampilkan picker ke user
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [BT_SERVICE_UUID] }],
      optionalServices: [BT_SERVICE_UUID],
    })
    try {
      sessionStorage.setItem(BT_SESSION_KEY, device.id)
    } catch {
      // sessionStorage tidak tersedia, abaikan
    }
  }

  const server = await device.gatt?.connect()
  if (!server) throw new Error("BT_CONNECT_FAILED")

  const service        = await server.getPrimaryService(BT_SERVICE_UUID)
  const characteristic = await service.getCharacteristic(BT_CHARACTERISTIC_UUID)

  // Kirim data dalam chunk 512 byte
  const CHUNK = 512
  for (let i = 0; i < data.length; i += CHUNK) {
    await characteristic.writeValueWithoutResponse(data.slice(i, i + CHUNK))
    // Delay kecil agar buffer printer tidak penuh
    await new Promise((r) => setTimeout(r, 30))
  }

  server.disconnect()
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Cetak struk ke printer thermal Bluetooth.
 * Signature sama persis dengan versi sebelumnya — tidak perlu ubah code lain.
 *
 * @throws "WEB_BT_NOT_SUPPORTED" — browser tidak support Web Bluetooth
 * @throws "BT_CONNECT_FAILED"    — gagal konek ke printer
 * @throws Error lain dari Web Bluetooth API (user cancel, dll)
 */
export async function printReceipt(params: PrintReceiptParams): Promise<void> {
  const resolvedQueueNumber = params.queueNumber ?? generateQueueNumber()
  const bytes = buildReceiptBytes({ ...params, resolvedQueueNumber })

  await sendToPrinter(bytes)

  params.onAfterPrint?.()
}