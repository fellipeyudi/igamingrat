import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "iGaming Rat",
  description: "Dashboard de acompanhamento de mentoria empresarial",
  generator: "v0.app",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/479525054_490080317229788_8300258980710746971_n.jpg-wQxUcq6FuaVImuzCpquKwKlSfLxcIw.jpeg",
    shortcut:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/479525054_490080317229788_8300258980710746971_n.jpg-wQxUcq6FuaVImuzCpquKwKlSfLxcIw.jpeg",
    apple:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/479525054_490080317229788_8300258980710746971_n.jpg-wQxUcq6FuaVImuzCpquKwKlSfLxcIw.jpeg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
