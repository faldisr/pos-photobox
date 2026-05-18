"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type SalesChartItem = {
  date: string
  total: number
}

type Period = "today" | "week" | "month" | "all"

type ChartBarInteractiveProps = {
  data: SalesChartItem[]
  period: Period
}

const chartConfig = {
  total: {
    label: "Penjualan",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const PERIOD_LABEL: Record<Period, string> = {
  today: "Per jam hari ini",
  week: "7 hari terakhir",
  month: "30 hari terakhir",
  all: "Semua transaksi (per bulan)",
}

export function ChartBarInteractive({ data, period }: ChartBarInteractiveProps) {
  const total = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.total, 0),
    [data]
  )

  const tickFormatter = (value: string) => {
    if (period === "today") return value // "08:00"
    if (period === "all") {
      const [year, month] = value.split("-")
      return new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      })
    }
    return new Date(value).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    })
  }

  const tooltipLabelFormatter = (value: string) => {
    if (period === "today") return `Pukul ${value}`
    if (period === "all") {
      const [year, month] = value.split("-")
      return new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    }
    return new Date(value).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Overview Penjualan</CardTitle>
          <CardDescription>{PERIOD_LABEL[period]}</CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={period === "today" ? 16 : 32}
              tickFormatter={tickFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value === 0 ? "0" : `${(value / 1000).toFixed(0)}rb`
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[190px]"
                  nameKey="total"
                  labelFormatter={tooltipLabelFormatter}
                  formatter={(value) => [formatCurrency(Number(value)), "Penjualan"]}
                />
              }
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}