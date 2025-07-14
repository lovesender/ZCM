import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AdminSidebar from "@/components/admin-sidebar"
import ClientProviders from "@/components/client-providers"
import Footer from "@/components/footer"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ZCM - 차량 관리 시스템",
  description: "ZCM 차량 등록 및 관리 시스템",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZCM",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <AdminSidebar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <ClientProviders />
      </body>
    </html>
  )
}
