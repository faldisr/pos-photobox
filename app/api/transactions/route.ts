import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma, retryOnUniqueConflict } from "@/lib/prisma"
import { generateTransactionNo, parsePagination } from "@/lib/utils"
import { requireRole } from "@/lib/auth"
import { startOfWibDay, wibDateRange } from "@/lib/wib"

export const dynamic = "force-dynamic"

// Transaksi yang sudah tersimpan dengan kunci bayar ini — hanya milik kasir yang sama
async function findByPaymentKey(db: Prisma.TransactionClient, key: string | null, cashierId: string | undefined) {
  if (!key) return null
  const trx = await db.transaction.findUnique({ where: { idempotencyKey: key } })
  return trx && trx.cashierId === cashierId ? trx : null
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireRole()
    if (guard.error) return guard.error

    const { searchParams } = new URL(request.url)
    const search   = searchParams.get("search") ?? ""
    const method   = searchParams.get("method") ?? ""
    const dateFrom = searchParams.get("dateFrom") ?? ""
    const dateTo   = searchParams.get("dateTo") ?? ""
    // Kasir HANYA boleh melihat transaksi cabangnya sendiri — jangan percaya
    // parameter branchId dari browser (tanpa ini, kasir bisa membaca transaksi
    // & data pelanggan semua cabang dengan memanggil API langsung).
    const isCashier = guard.session.user?.role === "CASHIER"
    const branchId = isCashier
      ? (guard.session.user?.branchId ?? "__tanpa_cabang__")
      : (searchParams.get("branchId") ?? "")

    const { page, limit, skip, error: pageError } = parsePagination(searchParams, 20)
    const { range, error: dateError } = wibDateRange(dateFrom, dateTo)
    if (pageError || dateError) {
      return NextResponse.json({ error: pageError ?? dateError }, { status: 400 })
    }

    const where: Record<string, unknown> = {}

    if (branchId) where.branchId = branchId

    if (search) {
      where.OR = [
        { transactionNo: { contains: search } },
        { customer: { name: { contains: search } } },
      ]
    }

    if (method) where.paymentMethod = method

    if (range) where.createdAt = range

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          cashier:  { select: { name: true } },
          customer: { select: { name: true, phone: true } },
          items:    true,
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireRole()
    if (guard.error) return guard.error

    const body = await request.json()
    const {
      shiftId,
      customerName,
      customerPhone,
      items,
      subtotal,
      discount,
      total,
      paymentMethod,
      paidAmount,
      changeAmount,
      promoCode,
      promoDiscount,
      notes,
      paperId,
      printQty,
    } = body
    // Kunci unik per percobaan bayar dari kasir. Halaman kasir versi lama tidak mengirimnya.
    const paymentKey = typeof body.idempotencyKey === "string" && body.idempotencyKey.length > 0 && body.idempotencyKey.length <= 100
      ? body.idempotencyKey as string
      : null

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Tidak ada item transaksi" }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: "Metode pembayaran harus dipilih" }, { status: 400 })
    }

    // Bayar dikirim ulang (koneksi putus lalu kasir menekan Bayar lagi) dan yang
    // pertama ternyata sudah tersimpan: kembalikan transaksi itu, jangan catat dua kali
    const saved = await findByPaymentKey(prisma, paymentKey, guard.session.user?.id)
    if (saved) return NextResponse.json({ ...saved, replayed: true })

    const shift = typeof shiftId === "string" ? await prisma.shift.findUnique({
      where: { id: shiftId },
      select: { branchId: true, cashierId: true, startTime: true, endTime: true },
    }) : null

    if (!shift) {
      return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 })
    }

    // Transaksi hanya boleh masuk ke shift milik akun yang login, yang masih terbuka,
    // dan dibuka hari ini (WIB) — shift kemarin harus ditutup dulu dengan hitungan kas
    if (shift.cashierId !== guard.session.user?.id) {
      return NextResponse.json({ error: "Shift ini bukan milik akun Anda" }, { status: 403 })
    }
    if (shift.endTime) {
      return NextResponse.json({ error: "Shift sudah ditutup. Muat ulang halaman lalu buka shift baru." }, { status: 400 })
    }
    if (shift.startTime < startOfWibDay()) {
      const tanggal = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(shift.startTime)
      return NextResponse.json(
        { error: `Shift tanggal ${tanggal} belum ditutup. Tutup shift itu dulu, lalu buka shift baru.` },
        { status: 400 }
      )
    }

    if (paperId && printQty) {
      const stock = await prisma.inventory.findUnique({
        where: { branchId_itemId: { branchId: shift.branchId, itemId: paperId } },
        include: { item: true },
      })

      if (!stock) {
        return NextResponse.json(
          { error: "Item kertas tidak ditemukan di inventory cabang ini" },
          { status: 400 }
        )
      }

      if (stock.quantity < printQty) {
        return NextResponse.json(
          {
            error: `Stok kertas tidak cukup. Tersedia: ${stock.quantity} ${stock.item.unit}, dibutuhkan: ${printQty}`,
          },
          { status: 400 }
        )
      }
    }

    // Validasi promo sebelum transaksi dibuat
    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode },
      })

      if (!promo || !promo.isActive) {
        return NextResponse.json({ error: "Kode promo tidak valid" }, { status: 400 })
      }

      if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
        return NextResponse.json({ error: "Kuota promo sudah habis" }, { status: 400 })
      }
    }

    // Nomor antrian direset tiap tengah malam WIB — tidak bergantung zona waktu server
    const startOfDay = startOfWibDay()

    // Semua langkah simpan berjalan dalam satu transaksi database: kalau satu
    // gagal, semuanya batal — statistik pelanggan & total shift tidak ikut
    // bertambah untuk transaksi yang tidak tersimpan. Nomor transaksi acak bisa
    // bentrok (UNIQUE); kalau terjadi, seluruh langkah diulang dengan nomor baru.
    const saveTransaction = () => prisma.$transaction(async (tx) => {
      // Penyimpanan di satu cabang diantrekan lewat kunci baris cabang, sebelum
      // membaca atau menulis apa pun. Tanpa ini, dua pembayaran bersamaan bisa
      // mendapat nomor antrian yang sama, saling deadlock di baris shift, atau
      // saling menimpa potongan stok kertas.
      await tx.$queryRaw`SELECT id FROM branches WHERE id = ${shift.branchId} FOR UPDATE`

      // Dua kiriman dengan kunci bayar sama yang datang bersamaan: yang kedua
      // menunggu kunci cabang di atas, lalu mendapati yang pertama sudah tersimpan
      const sameKey = await findByPaymentKey(tx, paymentKey, shift.cashierId)
      if (sameKey) return { trx: sameKey, replayed: true }

      // Cek ulang di dalam kunci: shift bisa saja baru ditutup sejak pengecekan di atas
      const stillOpen = await tx.shift.count({ where: { id: shiftId, endTime: null } })
      if (!stillOpen) return null

      const countToday = await tx.transaction.count({
        where: { branchId: shift.branchId, createdAt: { gte: startOfDay } },
      })
      const queueNumber = String(countToday + 1).padStart(3, "0")

      let customerId: string | null = null
      if (customerPhone) {
        const customer = await tx.customer.upsert({
          where: { phone: customerPhone },
          update: {
            name: customerName || undefined,
            lastVisit: new Date(),
            totalVisits: { increment: 1 },
            totalSpent: { increment: total },
          },
          create: {
            name: customerName || null,
            phone: customerPhone,
            lastVisit: new Date(),
            totalVisits: 1,
            totalSpent: total,
          },
        })
        customerId = customer.id
      }

      const trx = await tx.transaction.create({
        data: {
          transactionNo: generateTransactionNo(),
          queueNumber,
          branchId: shift.branchId,
          cashierId: shift.cashierId,
          customerId,
          shiftId,
          subtotal,
          discount: discount ?? 0,
          tax: 0,
          total,
          paymentMethod,
          paymentStatus: "PAID",
          paidAmount,
          changeAmount: changeAmount ?? 0,
          status: "COMPLETED",
          promoCode: promoCode || null,
          promoDiscount: promoDiscount ?? 0,
          notes: notes || null,
          idempotencyKey: paymentKey,
          items: {
            create: items.map((item: {
              packageId?: string
              templateId?: string
              addOnId?: string
              itemName: string
              itemType: string
              quantity: number
              price: number
              subtotal: number
            }) => ({
              packageId:  item.packageId  || null,
              templateId: item.templateId || null,
              addOnId:    item.addOnId    || null,
              itemName:   item.itemName,
              itemType:   item.itemType,
              quantity:   item.quantity,
              price:      item.price,
              subtotal:   item.subtotal,
            })),
          },
        },
      })

      if (paperId && printQty) {
        const currentStock = await tx.inventory.findUnique({
          where: { branchId_itemId: { branchId: shift.branchId, itemId: paperId } },
        })

        if (currentStock) {
          const newQty = currentStock.quantity - printQty

          await tx.inventory.update({
            where: { id: currentStock.id },
            data: { quantity: newQty },
          })

          await tx.inventoryLog.create({
            data: {
              itemId: paperId,
              transactionId: trx.id,
              type: "SALE",
              quantity: -printQty,
              quantityBefore: currentStock.quantity,
              quantityAfter: newQty,
              note: `Order ${trx.transactionNo}`,
              createdBy: shift.cashierId,
            },
          })
        }
      }

      // Increment usageCount promo jika ada kode promo
      if (promoCode) {
        await tx.promo.update({
          where: { code: promoCode },
          data: { usageCount: { increment: 1 } },
        })
      }

      await tx.shift.update({
        where: { id: shiftId },
        data: {
          totalTransactions: { increment: 1 },
          totalSales:        { increment: total },
          ...(paymentMethod === "CASH"       && { cashSales:  { increment: total } }),
          ...(paymentMethod === "QRIS"       && { qrisSales:  { increment: total } }),
          ...(paymentMethod === "DEBIT_CARD" && { cardSales:  { increment: total } }),
          ...(paymentMethod === "TRANSFER"   && { otherSales: { increment: total } }),
        },
      })

      return { trx, replayed: false }
    }, { timeout: 10000 })

    const result = await retryOnUniqueConflict(saveTransaction, "transactionNo")
    if (!result) {
      return NextResponse.json({ error: "Shift sudah ditutup. Muat ulang halaman lalu buka shift baru." }, { status: 400 })
    }
    if (result.replayed) return NextResponse.json({ ...result.trx, replayed: true })

    return NextResponse.json(result.trx, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}