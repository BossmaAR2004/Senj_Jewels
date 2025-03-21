import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { FirebaseProvider } from "@/components/firebase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sen Jewels | Handcrafted Jewelry",
  description: "Exquisite handcrafted jewelry featuring glass beads and precious gemstones.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} bg-[#b5e8e0] min-h-screen relative`}>
        <FirebaseProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
            <footer className="bg-white/80 py-6">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-700">© {new Date().getFullYear()} Sen Jewels. All rights reserved.</p>
                <p className="text-gray-500 text-sm mt-2">Handcrafted with love by Senjuti Biswas</p>
              </div>
            </footer>
          </div>
        </FirebaseProvider>
      </body>
    </html>
  )
}