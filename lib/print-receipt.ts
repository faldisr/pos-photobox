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

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  DEBIT_CARD: "Debit/Kartu",
  TRANSFER: "Transfer Bank",
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * Generate nomor antrian harian.
 * Format: 3 digit angka, reset setiap hari (001, 002, dst).
 * Disimpan di localStorage dengan key: queue_date & queue_number.
 * Digunakan sebagai fallback jika queueNumber tidak dikirim dari server.
 */
export function generateQueueNumber(): string {
  const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
  const storedDate = localStorage.getItem("queue_date")
  let counter = 1

  if (storedDate === today) {
    counter = parseInt(localStorage.getItem("queue_number") ?? "0", 10) + 1
  }

  localStorage.setItem("queue_date", today)
  localStorage.setItem("queue_number", String(counter))

  return String(counter).padStart(3, "0")
}

function generateReceiptHtml(params: PrintReceiptParams & { resolvedQueueNumber: string }): string {
  const {
    transactionNo,
    transactionDate,
    customerName,
    customerPhone,
    items,
    subtotal,
    discount,
    total,
    paymentMethod,
    paidAmount,
    change,
    promoCode,
    notes,
    resolvedQueueNumber,
    branch,
    isPrinted,
  } = params

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td class="item-name">${item.name}</td>
        <td class="item-qty">${item.quantity}x</td>
        <td class="item-price">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("")

  const customerHtml = [
    customerName ? `<tr><td>Pelanggan</td><td class="text-right">${customerName}</td></tr>` : "",
    customerPhone ? `<tr><td>No. HP</td><td class="text-right">${customerPhone}</td></tr>` : "",
  ]
    .filter(Boolean)
    .join("")

  const discountHtml =
    discount > 0
      ? `<tr>
          <td>Diskon${promoCode ? ` (${promoCode})` : ""}</td>
          <td class="text-right">- ${formatCurrency(discount)}</td>
        </tr>`
      : ""

  const cashHtml =
    paymentMethod === "CASH"
      ? `<tr>
          <td>Bayar</td>
          <td class="text-right">${formatCurrency(paidAmount)}</td>
        </tr>
        <tr>
          <td>Kembalian</td>
          <td class="text-right">${formatCurrency(change)}</td>
        </tr>`
      : ""

  const notesHtml = notes
    ? `<div class="divider"></div>
       <div class="notes">ID Foto Pelanggan: ${notes}</div>`
    : ""

  const branchSubHtml = branch
    ? [
        branch.city ? `<div class="store-sub">${branch.city}</div>` : "",
        branch.address ? `<div class="store-sub">${branch.address}</div>` : "",
        branch.phone ? `<div class="store-sub">Telp: ${branch.phone}</div>` : "",
      ]
        .filter(Boolean)
        .join("")
    : ""

  const watermarkStyle = isPrinted
    ? `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' transform='rotate(-35 90 90)' font-family='Arial, sans-serif' font-size='18' font-weight='100' fill='rgba(0,0,0,0.08)' letter-spacing='4'%3ECETAK ULANG%3C/text%3E%3C/svg%3E");
      background-repeat: repeat;`
    : ""

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Struk - ${transactionNo}</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 4mm 4mm;
          }

          @media print {
            html, body {
              width: 58mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            font-weight: 400;
            width: 58mm;
            color: #000;
            background: #fff;
            ${watermarkStyle}
          }

          .center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }

          .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 5px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            vertical-align: top;
            font-size: 11px;
            font-weight: 400;
            padding: 1px 0;
          }

          .item-name { width: 55%; word-break: break-word; }
          .item-qty  { width: 10%; text-align: center; }
          .item-price { width: 35%; text-align: right; white-space: nowrap; }

          .total-row td {
            font-weight: 800;
            font-size: 12px;
            padding-top: 3px;
          }

          .notes {
            font-size: 10px;
            font-weight: 400;
            word-break: break-word;
          }

          .footer {
            margin-top: 8px;
            text-align: center;
            font-size: 10px;
            font-weight: 400;
            line-height: 1.5;
          }

          .store-name {
            font-size: 13px;
            font-weight: 800;
            text-align: center;
          }

          .store-sub {
            font-size: 10px;
            font-weight: 400;
            text-align: center;
            margin-top: 2px;
          }

          .queue-box {
            text-align: center;
            margin: 6px 0 2px;
          }

          .queue-label {
            font-size: 10px;
            font-weight: 400;
          }

          .queue-number {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 4px;
            line-height: 1.2;
          }

          .instagram {
            font-size: 10px;
            font-weight: 400;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="store-name">${branch?.name ?? "PHOTOBOX POS"}</div>
        ${branchSubHtml}
        <div class="divider"></div>

        <div class="queue-box">
          <div class="queue-label">NO. ANTRIAN</div>
          <div class="queue-number">${resolvedQueueNumber}</div>
        </div>

        <div class="divider"></div>

        <table>
          <tr>
            <td>No. Transaksi</td>
            <td class="text-right">${transactionNo}</td>
          </tr>
          <tr>
            <td>Tanggal</td>
            <td class="text-right">${transactionDate ? formatDate(transactionDate) : "-"}</td>
          </tr>
          ${customerHtml}
        </table>

        <div class="divider"></div>

        <table>${itemsHtml}</table>

        <div class="divider"></div>

        <table>
          <tr>
            <td>Subtotal</td>
            <td class="text-right">${formatCurrency(subtotal)}</td>
          </tr>
          ${discountHtml}
        </table>

        <div class="divider"></div>

        <table>
          <tr class="total-row">
            <td>TOTAL</td>
            <td class="text-right">${formatCurrency(total)}</td>
          </tr>
          <tr>
            <td>Pembayaran</td>
            <td class="text-right">${PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}</td>
          </tr>
          ${cashHtml}
        </table>

        ${notesHtml}

        <div class="divider"></div>
        <div class="footer">
          <div>Terima kasih atas kunjungan Anda!</div>
          <div>Simpan struk ini sebagai bukti pembayaran.</div>
          <div class="instagram">Instagram: @orijinselfphoto</div>
        </div>
      </body>
    </html>
  `
}

export function printReceipt(params: PrintReceiptParams): void {
  // Gunakan queueNumber dari server jika ada, fallback ke localStorage
  const resolvedQueueNumber = params.queueNumber ?? generateQueueNumber()
  const html = generateReceiptHtml({ ...params, resolvedQueueNumber })
  const printWindow = window.open("", "_blank", "width=400,height=600")

  if (!printWindow) {
    throw new Error("POPUP_BLOCKED")
  }

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()

  const handleAfterPrint = () => {
    printWindow.removeEventListener("afterprint", handleAfterPrint)
    window.removeEventListener("afterprint", handleAfterPrint)
    printWindow.close()
    params.onAfterPrint?.()
  }

  printWindow.addEventListener("afterprint", handleAfterPrint)
  window.addEventListener("afterprint", handleAfterPrint)

  printWindow.print()
}