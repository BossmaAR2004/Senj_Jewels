"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFirebase } from '@/components/firebase-provider'
import OrderConfirmation from '@/components/order-confirmation'
import { doc, getDoc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore'
import { useEffect, useState } from 'react'

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


function OrderDetails() {
  const { db } = useFirebase()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      if (!db || !orderId) {
        setError('Invalid order')
        setLoading(false)
        return
      }

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId))
        if (orderDoc.exists()) {
          const data = orderDoc.data()
          console.log('Order Data:', data) // Add this to debug
          
          setOrderData({
            orderId: orderDoc.id,
            orderDate: data.createdAt?.toDate() || new Date(),
            customerName: data.customerName || data.customer?.name || '',
            customerEmail: data.customerEmail || data.customer?.email || '',
            shippingAddress: data.shippingAddress || data.customer?.address || '',
            paymentMethod: data.paymentMethod || 'card',
            items: data.items || [],
            subtotal: Number(data.subtotal) || 0,
            shipping: Number(data.shipping) || 0,
            total: Number(data.total) || 0
          })
        } else {
          setError('Order not found')
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [db, orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">
          {error || 'Something went wrong'}
        </h2>
        <p className="text-gray-500 mt-2">
          Please check your order ID or contact customer support.
        </p>
      </div>
    )
  }

  return <OrderConfirmation {...orderData} />
}

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        }
      >
        <OrderDetails />
      </Suspense>
    </div>
  )
}

