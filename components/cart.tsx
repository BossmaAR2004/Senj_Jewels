"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFirebase } from "./firebase-provider"
import Link from "next/link"
import Image from "next/image"
import clsx from "clsx"

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false)
  const { cart, dispatch, user } = useFirebase()

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <div className="relative z-40">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
        aria-label="Shopping Cart"
      >
        <div className="relative w-6 h-6">
          <Image src="/Images/shopping-cart.png" alt="Cart" width={24} height={24} className="w-6 h-6" />
          {cart.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-medium">Shopping Cart</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Image
                  src="/cart-icon.png"
                  alt="Empty Cart"
                  width={64}
                  height={64}
                  className="mb-4 w-16 h-16 opacity-50"
                />
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setIsOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex border rounded-lg p-3">
                    <div className="relative h-20 w-20 rounded overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg?height=100&width=100"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-teal-600 font-medium">£{item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-3 w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t px-4 py-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>£{cart.total.toFixed(2)}</span>
              </div>

              {user ? (
                <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                    <Link href="/login?redirect=checkout">Login to Checkout</Link>
                  </Button>
                  <p className="text-sm text-center text-gray-500">
                    You need to be logged in to complete your purchase
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
