"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { collection, addDoc, serverTimestamp, Firestore, doc, setDoc } from "firebase/firestore"
import { ShoppingBag, CreditCard, Check } from "lucide-react"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { sendOrderConfirmationEmail } from "@/lib/email-service"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

async function storeOrder(db: Firestore, orderId: string, orderData: Record<string, any>) {
  await setDoc(doc(db, 'orders', orderId), {
    customerName: orderData.customerName,
    customerEmail: orderData.customerEmail,
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
    items: orderData.items,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    total: orderData.total,
    createdAt: serverTimestamp()
  });
}

export default function CheckoutPage() {
  const { user, cart, dispatch, db } = useFirebase()
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    phone: "",
    specialInstructions: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.items.length === 0) {
      setError("Your cart is empty")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create order in Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user?.uid,
        userEmail: user?.email,
        items: cart.items,
        total: cart.total,
        shippingDetails: formData,
        status: "pending",
        paymentMethod,
        createdAt: serverTimestamp(),
      })

      // Store order details
      await storeOrder(db, orderRef.id, {
        customerName: formData.fullName,
        customerEmail: formData.email,
        shippingAddress: formData.address,
        paymentMethod: paymentMethod,
        items: cart.items,
        subtotal: cart.total,
        shipping: 0, // Assuming free shipping for now
        total: cart.total
      })

      // Send email notification to store owner
      await sendOrderConfirmationEmail({
        to: formData.email,
        orderDetails: {
          orderId: orderRef.id,
          customerName: formData.fullName,
          items: cart.items,
          total: cart.total,
          orderDate: new Date().toLocaleString(),
        },
      })

      // If payment method is card, redirect to Stripe
      if (paymentMethod === "card") {
        // In a real implementation, you would create a Stripe checkout session here
        // and redirect the user to Stripe's checkout page

        // For demo purposes, we'll just simulate a successful payment
        setTimeout(() => {
          // Clear cart
          dispatch({ type: "CLEAR_CART" })

          // Show success message
          setSuccess(true)

          // Redirect to order confirmation
          setTimeout(() => {
            router.push(`/checkout/success?orderId=${orderRef.id}`)
          }, 2000)
        }, 1500)
      } else {
        // For bank transfer, just show success and clear cart
        dispatch({ type: "CLEAR_CART" })
        setSuccess(true)

        // Redirect to order confirmation
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderRef.id}`)
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-teal-800 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">Thank you for your order. We'll process it right away.</p>
          <p className="text-sm text-gray-500">Redirecting to order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold text-teal-800 mb-8 text-center">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-6">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any special requests or delivery instructions"
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <h2 className="text-xl font-semibold text-teal-800 mb-6">Payment Method</h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="payment-card"
                      name="payment-method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="h-4 w-4 text-teal-600"
                    />
                    <Label htmlFor="payment-card" className="flex items-center">
                      <CreditCard className="h-5 w-5 text-teal-600 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="payment-bank"
                      name="payment-method"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                      className="h-4 w-4 text-teal-600"
                    />
                    <Label htmlFor="payment-bank">Bank Transfer</Label>
                  </div>
                </div>

                {paymentMethod === "bank" && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 mb-2">Please transfer the total amount to:</p>
                    <p className="text-sm font-medium">Bank: Barclays Bank</p>
                    <p className="text-sm font-medium">Account Name: Sen Jewels</p>
                    <p className="text-sm font-medium">Account Number: 12345678</p>
                    <p className="text-sm font-medium">Sort Code: 12-34-56</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please include your order number in the reference field.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={loading || cart.items.length === 0}
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Delivery time depends on your location and how long it takes to make your custom jewelry. We'll
                    contact you with an estimated delivery date after your order is confirmed.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-teal-800 mb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Order Summary
            </h2>

            {cart.items.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                <div className="divide-y space-y-4 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex py-2">
                      <div className="relative h-16 w-16 rounded overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg?height=100&width=100"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>£{cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>£{cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

