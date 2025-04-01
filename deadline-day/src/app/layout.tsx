import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Deadline Day",
  description: "Football player statistics and market valuations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <header className="w-full border-b">
              <div className="container flex items-center justify-between py-4">
                <Link href="/" className="font-bold text-xl">
                  Deadline Day
                </Link>
                <nav className="flex items-center space-x-6">
                  <Link href="/players" className="text-sm font-medium hover:text-primary">
                    Players
                  </Link>
                  <Link href="/teams" className="text-sm font-medium hover:text-primary">
                    Teams
                  </Link>
                  <Link href="/leagues" className="text-sm font-medium hover:text-primary">
                    Leagues
                  </Link>
                  <Link href="/valuation-predictor" className="text-sm font-medium hover:text-primary">
                    Valuation Predictor
                  </Link>
                  <ModeToggle />
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

