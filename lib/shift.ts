import type { Prisma } from "@prisma/client"

// Pemetaan metode bayar → kolom total shift (sama dengan saat transaksi disimpan)
const METHOD_FIELD = {
  CASH:       "cashSales",
  DEBIT_CARD: "cardSales",
  QRIS:       "qrisSales",
  TRANSFER:   "otherSales",
} as const

/**
 * Total shift dihitung langsung dari transaksinya yang SELESAI. Transaksi yang
 * di-refund tidak dihitung: di lapangan refund = koreksi salah input ("Double",
 * "Salah input", "Tambah orang"), uangnya tidak pernah masuk laci shift itu.
 */
export async function computeShiftTotals(db: Prisma.TransactionClient, shiftId: string) {
  const rows = await db.transaction.groupBy({
    by: ["paymentMethod"],
    where: { shiftId, status: "COMPLETED" },
    _sum: { total: true },
    _count: { _all: true },
  })
  const totals = { totalTransactions: 0, totalSales: 0, cashSales: 0, cardSales: 0, qrisSales: 0, otherSales: 0 }
  for (const r of rows) {
    const sum = Number(r._sum.total ?? 0)
    totals.totalTransactions += r._count._all
    totals.totalSales += sum
    const field = METHOD_FIELD[r.paymentMethod as keyof typeof METHOD_FIELD]
    if (field) totals[field] += sum
  }
  return totals
}

/**
 * Hitung ulang & simpan total shift (dipakai saat refund). Kalau shift sudah
 * ditutup dengan hitungan kas, kas seharusnya & selisihnya ikut diperbarui —
 * uang yang dihitung kasir (closingBalance) tidak diubah.
 */
export async function recalcShiftTotals(db: Prisma.TransactionClient, shiftId: string) {
  const [totals, shift] = await Promise.all([
    computeShiftTotals(db, shiftId),
    db.shift.findUniqueOrThrow({ where: { id: shiftId }, select: { openingBalance: true, closingBalance: true } }),
  ])
  const expectedBalance = Number(shift.openingBalance) + totals.cashSales
  return db.shift.update({
    where: { id: shiftId },
    data: {
      ...totals,
      ...(shift.closingBalance !== null && {
        expectedBalance,
        difference: Number(shift.closingBalance) - expectedBalance,
      }),
    },
  })
}
