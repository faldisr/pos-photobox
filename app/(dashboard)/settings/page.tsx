"use client"

import { UserList } from "@/components/settings/user-list"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengguna dan hak akses sistem
        </p>
      </div>

      <UserList />
    </div>
  )
}