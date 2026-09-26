"use client"

import { SessionProvider, signOut } from "next-auth/react"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const SESSION_CHECK_INTERVAL_MS = 60 * 1000

// Cek sesi langsung ke server tiap menit, saat tab kembali aktif, dan saat
// internet kembali. Panggilan ini sekaligus memperpanjang cookie sesi.
// Logout HANYA kalau server menjawab sesi tidak berlaku — gagal jaringan atau
// server sibuk diabaikan dan dicek lagi nanti. (Polling bawaan next-auth
// menganggap gagal jaringan sama dengan "tidak login", sehingga kasir ter-logout
// setiap kali sinyal putus sesaat.)
function SessionWatcher() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/login") return
    let stopped = false

    const check = async () => {
      let body: { user?: unknown; expires?: string }
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" })
        if (!res.ok) return
        body = await res.json()
      } catch {
        return
      }
      if (stopped || body?.user) return
      stopped = true

      // Ada `expires` tanpa `user` = sesi ditolak karena akun login di perangkat
      // lain (lihat callback session di lib/auth.ts); kosong = sesi habis.
      const reason = body?.expires ? "elsewhere" : "expired"
      await signOut({ redirect: false }).catch(() => {})
      router.push(`/login?reason=${reason}`)
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") check()
    }

    check()
    const timer = setInterval(check, SESSION_CHECK_INTERVAL_MS)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("online", check)
    return () => {
      stopped = true
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("online", check)
    }
  }, [pathname, router])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SessionWatcher />
      {children}
      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
