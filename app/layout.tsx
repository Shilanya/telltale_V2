import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/lib/store"

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
          <StoreProvider>
            <div className="min-h-screen flex flex-col">
              <header className="border-b">
                <div className="container mx-auto py-4 px-4">
                  <nav className="flex justify-between items-center">
                    <a href="/" className="text-xl font-bold">
                      Tell-Tale
                    </a>
                    <div className="flex gap-4">
                      <a href="/" className="hover:underline">
                        Stories
                      </a>
                      <a href="/characters" className="hover:underline">
                        Characters
                      </a>
                      <a href="/create" className="hover:underline">
                        Create Story
                      </a>
                      <a href="/characters/create" className="hover:underline">
                        Create Character
                      </a>
                    </div>
                  </nav>
                </div>
              </header>
              <div className="flex-1">{children}</div>
              <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} Tell-Tale. All rights reserved.
                </div>
              </footer>
            </div>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
