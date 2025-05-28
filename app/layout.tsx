import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/lib/store"
import { AuthProvider } from "@/lib/auth"
import ProtectedRoute from "@/components/protected-route"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Tell-Tale",
  description: "A platform for sharing stories and creative writing",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ProtectedRoute>
              <StoreProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <div className="flex-1">{children}</div>
                  <footer className="border-t py-6">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                      &copy; {new Date().getFullYear()} Tell-Tale. All rights reserved.
                    </div>
                  </footer>
                </div>
              </StoreProvider>
            </ProtectedRoute>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
