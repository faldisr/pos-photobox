import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTransactionNo } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page     = parseInt(searchParams.get("page") ?? "1")
    const limit    = parseInt(searchParams.get("limit") ?? "20")
    const search   = searchParams.get("search") ?? ""
    const method   = searchParams.get("method") ?? ""
    const dateFrom = searchParams.get("dateFrom") ?? ""
    const dateTo   = searchParams.get("dateTo") ?? ""
    const branchId = searchParams.get("branchId") ?? ""

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (branchId) where.branchId = branchId

    if (search) {
      where.OR = [
        { transactionNo: { contains: search } },
        { customer: { name: { contains: search } } },
      ]
    }

    if (method) where.paymentMethod = method

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo   ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) } : {}),
      }
    }

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

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Tidak ada item transaksi" }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: "Metode pembayaran harus dipilih" }, { status: 400 })
    }

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      select: { branchId: true, cashierId: true },
    })

    if (!shift) {
      return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 })
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

    // Generate nomor antrian harian dari DB
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    const countToday = await prisma.transaction.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    })
    const queueNumber = String(countToday + 1).padStart(3, "0")

    let customerId: string | null = null
    if (customerPhone) {
      const customer = await prisma.customer.upsert({
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

    const transaction = await prisma.$transaction(async (tx) => {
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

      return trx
    })

    await prisma.shift.update({
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

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}