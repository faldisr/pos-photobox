// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Named export untuk compatibility
export { prisma }

/**
 * Jalankan `fn`, dan ulangi kalau gagal karena nilai UNIQUE bentrok (Prisma P2002)
 * pada kolom `field` — misalnya nomor transaksi/shift acak yang kebetulan sudah
 * dipakai. Error lain dilempar apa adanya, tanpa diulang.
 */
export async function retryOnUniqueConflict<T>(
  fn: () => Promise<T>,
  field: string,
  attempts = 5
): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (error) {
      const e = error as { code?: string; meta?: { target?: unknown }; message?: string }
      // MySQL mengisi target dengan nama index ("transactions_transactionNo_key"),
      // DB lain dengan daftar kolom; pesan error dipakai sebagai cadangan.
      const detail = `${String(e.meta?.target ?? '')} ${e.message ?? ''}`
      const isConflict = e.code === 'P2002' && detail.includes(field)
      if (!isConflict || i >= attempts) throw error
    }
  }
}