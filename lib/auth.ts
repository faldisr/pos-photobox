import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"
import { randomUUID } from "crypto"

// Batas percobaan login per identifier (email/username)
const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000

// ponytail: rate limit in-memory, cukup untuk server standalone 1 proses.
// Kalau nanti di-scale multi-instance (PM2 cluster / beberapa VPS), pindah ke Redis/tabel DB.
const loginAttempts = new Map<string, { count: number; firstAt: number }>()

// Hash dummy supaya waktu respons login tetap sama saat user tidak ada
// (mencegah enumerasi email/username lewat selisih waktu)
const DUMMY_HASH = "$2b$10$VrWQcFMyQwXcAy1xKFPCeebLNhsft/CXuOptbB1Ggw6PupoWX7m2i"

function getLoginBlock(key: string): number | null {
  const entry = loginAttempts.get(key)
  if (!entry) return null

  if (Date.now() - entry.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key)
    return null
  }

  if (entry.count < LOGIN_MAX_ATTEMPTS) return null

  const remainingMs = LOGIN_WINDOW_MS - (Date.now() - entry.firstAt)
  return Math.max(1, Math.ceil(remainingMs / 60000))
}

function recordLoginFailure(key: string) {
  // Bersihkan entri kedaluwarsa supaya map tidak tumbuh terus
  // kalau ada serangan dengan banyak username berbeda
  if (loginAttempts.size > 10000) {
    const now = Date.now()
    for (const [k, v] of loginAttempts) {
      if (now - v.firstAt > LOGIN_WINDOW_MS) loginAttempts.delete(k)
    }
  }

  const entry = loginAttempts.get(key)
  if (!entry || Date.now() - entry.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAt: Date.now() })
    return
  }
  entry.count += 1
}

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email / Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email/username dan password harus diisi")
        }

        const identifier = credentials.email.trim()
        const rateKey = identifier.toLowerCase()

        const blockedMinutes = getLoginBlock(rateKey)
        if (blockedMinutes !== null) {
          throw new Error(
            `Terlalu banyak percobaan login. Coba lagi dalam ${blockedMinutes} menit`
          )
        }

        // Deteksi: jika mengandung "@" cari by email, selainnya by username
        const isEmail = identifier.includes("@")

        const user = await prisma.user.findUnique({
          where: isEmail
            ? { email: identifier }
            : { username: identifier },
          include: { branch: true },
        })

        // Selalu jalankan bcrypt.compare (pakai hash dummy kalau user tidak ada)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user?.password ?? DUMMY_HASH
        )

        if (!user || !isPasswordValid) {
          recordLoginFailure(rateKey)
          throw new Error("Email/username atau password salah")
        }

        // Validasi role sesuai pilihan di halaman login
        const selectedRole = credentials.role
        if (selectedRole === "ADMIN" && user.role !== "SUPER_ADMIN") {
          throw new Error("Akun ini tidak memiliki akses sebagai Admin")
        }
        if (selectedRole === "CASHIER" && user.role !== "CASHIER") {
          throw new Error("Akun ini tidak memiliki akses sebagai Kasir")
        }

        loginAttempts.delete(rateKey)

        // Generate token session baru — session lama otomatis tidak valid
        const newSessionToken = randomUUID()
        await prisma.user.update({
          where: { id: user.id },
          data: {
            activeSessionToken: newSessionToken,
            sessionTokenVersion: { increment: 1 },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          branchId: user.branchId || undefined,
          activeSessionToken: newSessionToken,
          sessionTokenVersion: user.sessionTokenVersion + 1,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.branchId = user.branchId
        token.activeSessionToken = user.activeSessionToken
        token.sessionTokenVersion = user.sessionTokenVersion
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = token.role
        session.user.branchId = token.branchId

        // Validasi session token — cek apakah session masih aktif
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            activeSessionToken: true,
            sessionTokenVersion: true,
          },
        })

        // Jika token tidak cocok, session dianggap tidak valid
        if (
          !user ||
          user.activeSessionToken !== token.activeSessionToken ||
          user.sessionTokenVersion !== token.sessionTokenVersion
        ) {
          return { ...session, user: undefined }
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,      // 1 jam — session expired setelah 1 jam
    updateAge: 60 * 15,   // Refresh token setiap 15 menit jika aktif
  },
  secret: process.env.NEXTAUTH_SECRET,
}

/**
 * Guard untuk API route handler.
 * - tanpa argumen: cukup harus login (role apa saja)
 * - dengan argumen: role user harus termasuk daftar `roles`
 *
 * Pakai:
 *   const guard = await requireRole(["SUPER_ADMIN"])
 *   if (guard.error) return guard.error
 *   // guard.session dijamin ada di sini
 */
export async function requireRole(roles?: UserRole[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    }
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    }
  }

  return { error: null, session }
}