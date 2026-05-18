"use client"

import { InventoryList } from "@/components/inventory/inventory-list"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Kelola stok kertas foto dan perlengkapan cetak
        </p>
      </div>

      <InventoryList />
    </div>
  )
}