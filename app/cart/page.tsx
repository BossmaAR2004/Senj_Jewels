"use client"

import { X, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFirebase } from "@/components/firebase-provider"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { cart, dispatch, user } = useFirebase()

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-teal-800 mb-8">Shopping Cart</h1>
      {!user ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Image
            src="/Images/shopping-cart-1-svgrepo-com.svg"
            alt="Empty Cart"
            width={64}
            height={64}
            className="mb-4 w-16 h-16 opacity-50"
          />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Link href="/login">Login</Link>
          </Button>
          <p className="text-sm text-center text-gray-500 mt-4">
            Don’t have an account? <Link href="/signup" className="text-teal-600 hover:underline">Sign up</Link>
          </p>
          <p className="text-sm text-center text-gray-500 mt-2">
            Faster checkout and easy order tracking.
          </p>
        </div>
      ) : (
        <>
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Image
                src="/Images/shopping-cart-1-svgrepo-com.svg"
                alt="Empty Cart"
                width={64}
                height={64}
                className="mb-4 w-16 h-16 opacity-50"
              />
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Link href="/">Continue Shopping</Link>
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
          {cart.items.length > 0 && (
            <div className="border-t px-4 py-4 mt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>£{cart.total.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}