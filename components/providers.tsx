"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

function SessionWatcher() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    if (pathname === "/login") return

    if (status === "unauthenticated" || !session?.user) {
      signOut({ redirect: false }).then(() => {
        router.push("/login")
      })
    }
  }, [session, status, router, pathname])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}>
      <SessionWatcher />
      {children}
      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}