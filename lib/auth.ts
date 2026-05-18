import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"
import { randomUUID } from "crypto"

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

        // Deteksi: jika mengandung "@" cari by email, selainnya by username
        const isEmail = identifier.includes("@")

        const user = await prisma.user.findUnique({
          where: isEmail
            ? { email: identifier }
            : { username: identifier },
          include: { branch: true },
        })

        if (!user) {
          throw new Error("Email/username atau password salah")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
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