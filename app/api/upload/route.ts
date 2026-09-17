import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { requireRole } from "@/lib/auth"

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireRole(["SUPER_ADMIN"])
    if (guard.error) return guard.error

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    const ext = ALLOWED_MIME_TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, atau WEBP" },
        { status: 400 }
      )
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 2MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const uploadDir = join(process.cwd(), "uploads", "products")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, fileName), buffer)

    const url = `/api/images/${fileName}`
    return NextResponse.json({ url }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 })
  }
}