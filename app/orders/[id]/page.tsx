"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { Package, ArrowLeft, Truck, Clock, CheckCircle, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import OrderConfirmation from "@/components/order-confirmation"

export default function OrderDetailPage() {
  const { user, loading, db } = useFirebase()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/orders")
    }
  }, [user, loading, router])

  // Fetch order details
  useEffect(() => {
    if (!db || !user || !orderId) return

    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId))

        if (orderDoc.exists()) {
          const orderData = orderDoc.data()

          // Check if this order belongs to the current user
          if (orderData.userId !== user.uid) {
            setError("You do not have permission to view this order")
            return
          }

          setOrder({
            id: orderDoc.id,
            ...orderData,
            createdAt: orderData.createdAt?.toDate?.() || new Date(),
          })
        } else {
          setError("Order not found")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("Failed to load order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [db, user, orderId])

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">{error || "Order not found"}</h2>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href="/orders">Back to My Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex items-center text-teal-600 hover:text-teal-800"
            onClick={() => setShowConfirmation(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Details
          </Button>
        </div>

        <OrderConfirmation
          orderId={order.id}
          orderDate={order.createdAt}
          customerName={order.shippingDetails.fullName}
          customerEmail={order.userEmail}
          shippingAddress={`${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}, ${order.shippingDetails.country}`}
          paymentMethod={order.paymentMethod}
          items={order.items}
          subtotal={order.total}
          shipping={0}
          total={order.total}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="mb-6">
        <Link href="/orders" className="flex items-center text-teal-600 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-teal-800">Order #{order.id.slice(0, 8)}</h1>
        <div className="flex items-center mt-2 sm:mt-0">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-3 ${
              order.status === "completed"
                ? "bg-green-100 text-green-800"
                : order.status === "processing"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <Button variant="outline" size="sm" className="flex items-center" onClick={() => setShowConfirmation(true)}>
            <Download className="h-4 w-4 mr-2" />
            Receipt
          </Button>
        </div>
      </div>

      {/* Order progress */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Order Status</h2>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

          <div className="relative z-10 flex mb-6">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                order.status === "pending" || order.status === "processing" || order.status === "completed"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <Package className="h-4 w-4" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium">Order Placed</h3>
              <p className="text-sm text-gray-500">
                {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex mb-6">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                order.status === "processing" || order.status === "completed"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <Clock className="h-4 w-4" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium">Processing</h3>
              <p className="text-sm text-gray-500">
                {order.status === "processing" || order.status === "completed"
                  ? "Your order is being prepared"
                  : "Waiting to be processed"}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                order.status === "completed" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium">Completed</h3>
              <p className="text-sm text-gray-500">
                {order.status === "completed" ? "Your order has been completed" : "Waiting to be completed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Order items */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-teal-800">Order Items</h2>
            </div>

            <div className="divide-y">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-4 flex">
                  <div className="relative h-20 w-20 rounded overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg?height=100&width=100"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Price per item:</span>
                      <span className="font-medium">£{item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-4">Shipping Information</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{order.shippingDetails.fullName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.userEmail}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.shippingDetails.phone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.postalCode},{" "}
                  {order.shippingDetails.country}
                </p>
              </div>

              {order.shippingDetails.specialInstructions && (
                <div>
                  <p className="text-sm text-gray-500">Special Instructions</p>
                  <p>{order.shippingDetails.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Order summary */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-teal-800 mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>£{order.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                <span>Total</span>
                <span>£{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="text-gray-600">{order.paymentMethod === "card" ? "Credit/Debit Card" : "Bank Transfer"}</p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center text-gray-600">
                <Truck className="h-5 w-5 mr-2 text-teal-600" />
                <div>
                  <p className="font-medium">Delivery Information</p>
                  <p className="text-sm mt-1">
                    Delivery time depends on your location and how long it takes to make your custom jewelry.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 mb-3" onClick={() => setShowConfirmation(true)}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">Contact Us About This Order</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

