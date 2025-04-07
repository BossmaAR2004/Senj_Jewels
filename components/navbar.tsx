"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, ShoppingCart } from "lucide-react"
import { useFirebase } from "./firebase-provider"
import Cart from "./cart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAdmin, signOut, cart } = useFirebase()
  const [scrolled, setScrolled] = useState(false)

  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-10 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image src="/Images/logo.png" alt="Sen Jewels Logo" width={50} height={50} className="mr-2" />
            <span className="text-xl font-semibold text-teal-700">Sen Jewels</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/gemstone">Gemstone</NavLink>
             <NavLink href="/Bubble-Tea-Earring">Bubble Tea Earring</NavLink>
            <NavLink href="/glass-beads">Glass Beads</NavLink>
            <NavLink href="/instagram">Instagram</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* User menu and cart */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <div className="relative">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/shop" onClick={() => setIsMenuOpen(false)}>
              Shop
            </MobileNavLink>
            <MobileNavLink href="/gemstone" onClick={() => setIsMenuOpen(false)}>
              Gemstone
            </MobileNavLink>
            <MobileNavLink href="/Bubble-Tea-Earring" onClick={() => setIsMenuOpen(false)}>
              Bubble Tea Earring
            </MobileNavLink>
            <MobileNavLink href="/glass-beads" onClick={() => setIsMenuOpen(false)}>
              Glass Beads
            </MobileNavLink>
            <MobileNavLink href="/instagram" onClick={() => setIsMenuOpen(false)}>
              Instagram
            </MobileNavLink>
            <MobileNavLink href="/contact" onClick={() => setIsMenuOpen(false)}>
              Contact
            </MobileNavLink>

            {isAdmin && (
              <MobileNavLink href="/admin" onClick={() => setIsMenuOpen(false)}>
                Admin Dashboard
              </MobileNavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-md"
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
