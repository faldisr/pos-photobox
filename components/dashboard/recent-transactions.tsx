import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge, type BadgeVariant } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  id: string
  transactionNo: string
  customerName: string
  total: number
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
  paymentMethod: string
  createdAt: Date
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const statusVariants: Record<Transaction["status"], BadgeVariant> = {
  PENDING: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  CANCELLED: "destructive",
}

const statusLabels: Record<Transaction["status"], string> = {
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        {/* Wrapper overflow-x-auto agar tabel bisa scroll horizontal di mobile/tablet */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">No. Transaksi</TableHead>
                <TableHead className="min-w-[120px]">Pelanggan</TableHead>
                <TableHead className="min-w-[110px]">Total</TableHead>
                <TableHead className="min-w-[100px]">Pembayaran</TableHead>
                <TableHead className="min-w-[90px]">Status</TableHead>
                <TableHead className="min-w-[130px]">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium text-xs md:text-sm">
                      {transaction.transactionNo}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {transaction.customerName || "-"}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {formatCurrency(transaction.total)}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[transaction.status]}>
                        {statusLabels[transaction.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs md:text-sm">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}