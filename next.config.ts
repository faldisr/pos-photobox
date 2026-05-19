/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Wajib untuk static export ke shared hosting
  images: {
    unoptimized: true, // Wajib diaktifkan jika menggunakan static export
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
}

module.exports = nextConfig
