import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Instrument_Serif } from "next/font/google"
import Providers from "@/components/providers"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
  weight: "400",
})

export const metadata: Metadata = {
  title: "Startup Hub",
  description: "A social space for startups and builders",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} antialiased`}>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-black min-h-screen`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
