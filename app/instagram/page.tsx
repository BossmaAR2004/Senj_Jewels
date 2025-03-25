"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"
import Script from "next/script"

export default function InstagramPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* ✅ Elfsight Script */}
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="afterInteractive"
        async
      />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-4">Follow Us on Instagram</h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Stay updated with our latest designs, special offers, and behind-the-scenes content by following us on
          Instagram.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
        <Instagram className="w-20 h-20 text-pink-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-teal-800 mb-4">@_senjewels_</h2>
        <p className="text-gray-700 mb-6">
          Follow us for exclusive content, new product announcements, and special promotions!
        </p>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Link
            href="https://www.instagram.com/_senjewels_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="w-5 h-5 mr-2" />
            Follow on Instagram
          </Link>
        </Button>
      </div>

      {/* ✅ Elfsight Embed */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-teal-800 mb-6 text-center">Our Instagram Feed</h3>
        <div
          className="elfsight-app-de155dbc-f274-48b7-bb55-49ecf239690b"
          data-elfsight-app-lazy
        ></div>
      </div>
    </div>
  )
}
