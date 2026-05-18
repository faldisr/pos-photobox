"use client"

import { BranchList } from "@/components/settings/branch-list"

export default function BranchesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Cabang</h1>
        <p className="text-muted-foreground">
          Kelola data cabang
        </p>
      </div>

      <BranchList />
    </div>
  )
}