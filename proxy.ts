import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const CASHIER_ALLOWED = ["/dashboard", "/kasir", "/transactions"]

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const { pathname } = request.nextUrl

  if (token.role === "CASHIER") {
    const isAllowed = CASHIER_ALLOWED.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/403", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kasir/:path*",
    "/products/:path*",
    "/transactions/:path*",
    "/customers/:path*",
    "/inventory/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
}