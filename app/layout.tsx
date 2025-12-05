import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "iGaming Rat",
  description: "Dashboard de acompanhamento de mentoria empresarial",
  generator: "v0.app",
  icons: {
    icon: "/images/479525054-490080317229788-8300258980710746971-n.jpeg",
    shortcut: "/images/479525054-490080317229788-8300258980710746971-n.jpeg",
    apple: "/images/479525054-490080317229788-8300258980710746971-n.jpeg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
