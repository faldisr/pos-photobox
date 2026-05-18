"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ChartBarInteractive } from "@/components/dashboard/chart-bar-interactive"
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Period = "today" | "week" | "month" | "all"

type PaymentSummary = {
  method: string
  total: number
}

type RecentTransaction = {
  id: string
  transactionNo: string
  customerName: string
  total: number
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
  paymentMethod: string
  createdAt: Date
}

type DashboardData = {
  todayRevenue: number
  todayTransactions: number
  newCustomers: number
  salesChart: { date: string; total: number }[]
  period: Period
  paymentSummary: PaymentSummary[]
  recentTransactions: RecentTransaction[]
}

type Branch = {
  id: string
  name: string
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  DEBIT_CARD: "Debit/Kartu",
  CREDIT_CARD: "Kartu Kredit",
  TRANSFER: "Transfer",
  E_WALLET: "E-Wallet",
}

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "bg-blue-500",
  QRIS: "bg-green-500",
  DEBIT_CARD: "bg-purple-500",
  CREDIT_CARD: "bg-pink-500",
  TRANSFER: "bg-yellow-500",
  E_WALLET: "bg-orange-500",
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "7 Hari Terakhir" },
  { value: "month", label: "30 Hari Terakhir" },
  { value: "all", label: "Semua Transaksi" },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>("today")
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all")

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
  const isCashier = session?.user?.role === "CASHIER"

  // Fetch daftar cabang hanya untuk superadmin
  useEffect(() => {
    if (!isSuperAdmin) return
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/settings/branches")
        if (res.ok) {
          const json = await res.json()
          setBranches(json)
        }
      } catch {
        // silent
      }
    }
    fetchBranches()
  }, [isSuperAdmin])

  const fetchDashboard = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("period", period)

      if (isCashier && session.user.branchId) {
        params.set("branchId", session.user.branchId)
      } else if (isSuperAdmin && selectedBranchId !== "all") {
        params.set("branchId", selectedBranchId)
      }

      const res = await fetch(`/api/dashboard?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [session, period, selectedBranchId, isCashier, isSuperAdmin])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Ringkasan aktivitas hari ini
          </p>
        </div>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Memuat data...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Ringkasan aktivitas transaksi
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && branches.length > 0 && (
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Semua Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.todayRevenue ?? 0)}
          subtitle="Revenue dari transaksi hari ini"
          icon={DollarSign}
        />
        <StatsCard
          title="Transaksi Hari Ini"
          value={data?.todayTransactions ?? 0}
          subtitle="Total transaksi yang telah selesai"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Pelanggan Baru"
          value={data?.newCustomers ?? 0}
          subtitle="Pelanggan baru yang terdaftar"
          icon={Users}
        />
        <StatsCard
          title="Metode Bayar"
          value={(data?.paymentSummary ?? []).length}
          subtitle="Jenis pembayaran hari ini"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-7 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ChartBarInteractive
            data={data?.salesChart ?? []}
            period={data?.period ?? period}
          />
        </div>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pembayaran Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.paymentSummary ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada transaksi hari ini
                </p>
              ) : (
                (data?.paymentSummary ?? []).map((p) => (
                  <div key={p.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${PAYMENT_COLORS[p.method] ?? "bg-gray-500"}`} />
                      <span className="text-sm">{PAYMENT_LABELS[p.method] ?? p.method}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(p.total)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentTransactions transactions={data?.recentTransactions ?? []} />
    </div>
  )
}