"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { downloadOrderPDF } from "@/lib/pdf-generator"
import type { CartItem } from "@/types/cart"
import Image from "next/image"

type OrderConfirmationProps = {
  orderId: string
  orderDate: Date | string
  customerName: string
  customerEmail: string
  shippingAddress?: string // Make this optional
  paymentMethod: string
  items: CartItem[]
  subtotal: number
  shipping?: number // Make this optional
  total: number
}

export default function OrderConfirmation({
  orderId,
  orderDate,
  customerName,
  customerEmail,
  shippingAddress,
  paymentMethod,
  items = [], // Default to empty array
  subtotal = 0, // Default to 0 
  shipping = 0,
  total = 0, // Default to 0
}: OrderConfirmationProps) {
  const [downloading, setDownloading] = useState(false)

  // Format date
  const formattedDate =
    typeof orderDate === "string"
      ? new Date(orderDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : orderDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })

  const handleDownload = () => {
    setDownloading(true)

    try {
      downloadOrderPDF({
        orderId,
        orderDate,
        customerName,
        customerEmail,
        shippingAddress: shippingAddress || 'No shipping address provided',
        paymentMethod,
        items,
        subtotal,
        shipping,
        total,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Format shipping address with fallback
  const addressLines = shippingAddress ? shippingAddress.split(", ") : []

  // Calculate subtotal if not provided
  const calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Format numbers safely
  const formatPrice = (price: number) => {
    return Number(price).toFixed(2)
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 print:shadow-none print:p-0">
      <div className="flex justify-between items-start mb-6 print:mb-4">
        <div>
          <h2 className="text-2xl font-bold text-teal-800 print:text-black">Order Confirmation</h2>
          <p className="text-gray-600">Thank you for your purchase!</p>
        </div>
        <div className="hidden md:flex space-x-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="md:hidden flex justify-center space-x-2 mb-6 print:hidden">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Downloading..." : "Download"}
        </Button>
        <Button variant="outline" size="sm" className="flex items-center" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div className="border-t border-b py-4 mb-6 print:border-black">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 print:text-gray-700">Order Number</p>
            <p className="font-medium">{orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 print:text-gray-700">Order Date</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2 print:text-black">Customer Information</h3>
          {customerName || customerEmail ? (
            <>
              {customerName && <p className="text-gray-700">{customerName}</p>}
              {customerEmail && <p className="text-gray-600">{customerEmail}</p>}
            </>
          ) : (
            <p className="text-gray-500">No customer information available</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2 print:text-black">Shipping Address</h3>
          {addressLines.length > 0 ? (
            addressLines.map((line, index) => (
              <p key={index} className="text-gray-700">{line}</p>
            ))
          ) : (
            <p className="text-gray-500">No shipping address provided</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2 print:text-black">Payment Method</h3>
        <p>{paymentMethod === "card" ? "Credit/Debit Card" : "Bank Transfer"}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-4 print:text-black">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 print:bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 print:text-black">Item</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 print:text-black">Price</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 print:text-black">Qty</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 print:text-black">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 rounded overflow-hidden mr-3 print:hidden">
                        <Image
                          src={item.image || "/placeholder.svg?height=40&width=40"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">£{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right">£{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t pt-4 print:border-black">
        <div className="flex justify-end">
          <div className="w-full md:w-64">
            <div className="flex justify-between py-1">
              <span className="text-gray-600 print:text-gray-700">Subtotal</span>
              <span>£{formatPrice(calculatedSubtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600 print:text-gray-700">Shipping</span>
              <span>{shipping === 0 ? "Free" : `£${formatPrice(shipping)}`}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-semibold border-t mt-2 print:border-black">
              <span>Total</span>
              <span>£{formatPrice(total || calculatedSubtotal + shipping)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 print:text-gray-700">
        <p>Thank you for shopping with Sen Jewels!</p>
        <p className="text-sm mt-1">If you have any questions, please contact us at contact@senjewels.com</p>
      </div>
    </div>
  )
}

// Example order document structure
interface OrderDetails {
  orderId: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
}

