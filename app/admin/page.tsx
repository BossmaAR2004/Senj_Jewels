"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { Package, Users, ShoppingBag, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { DeliveryTrackingDialog } from '@/components/delivery-tracking-dialog'
import { sendOrderStatusEmail } from '@/lib/email-service'
import { downloadOrderPDF } from '@/lib/pdf-generator'

export interface TrackingInfo {
  carrier: string
  trackingNumber: string
  trackingUrl: string | null
}

export interface Order {
  id: string
  customerEmail: string
  customerName: string
  status: 'pending' | 'processing' | 'completed'
  trackingInfo?: TrackingInfo
  // ...other order fields...
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, db } = useFirebase()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  
  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, isAdmin, loading, router])
  
  // Fetch data
  useEffect(() => {
    if (!db || !isAdmin) return;
    
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const ordersSnapshot = await getDocs(ordersQuery)
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data()

          return {
            id: doc.id,
            customerEmail: data.customerEmail || data.email, // Check both possible fields
            customerName: data.customerName || data.name, // Check both possible fields
            status: data.status || 'pending',
            createdAt: data.createdAt, // Keep the raw timestamp
            total: data.total,
            items: data.items || [],
            ...data
          }
        })
        console.log('Fetched orders:', ordersData) // Debug log
        setOrders(ordersData)
        
        // Fetch products
        const productsQuery = query(collection(db, 'products'))
        const productsSnapshot = await getDocs(productsQuery)
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty arrays on error to avoid undefined
        setOrders([])
        setProducts([])
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [db, isAdmin])
  
  const updateOrderStatus = async (orderId: string, status: string, trackingInfo?: any) => {
    if (!db) return;
    
    try {
      // Find the order to get customer details
      const orderDoc = orders.find(o => o.id === orderId)
      if (!orderDoc) {
        console.error('Order not found:', orderId)
        return
      }

      // Get customer email from order details
      const customerEmail = orderDoc.customerEmail || orderDoc.email
      const customerName = orderDoc.customerName || orderDoc.name

      if (!customerEmail) {
        console.error(`No customer email found for order: ${orderId}`)
        return
      }

      // Create update object with clean tracking info
      const updateData: any = { status }
      
      if (trackingInfo) {
        updateData.trackingInfo = {
          carrier: trackingInfo.carrier,
          trackingNumber: trackingInfo.trackingNumber,
          trackingUrl: trackingInfo.trackingUrl || null
        }
      }
      
      // Update Firestore
      await updateDoc(doc(db, 'orders', orderId), updateData)
      
      try {
        // Send email notification
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            customerEmail,
            customerName,
            status,
            trackingInfo
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('Email sent status:', result)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Continue with order update even if email fails
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status, trackingInfo: updateData.trackingInfo }
          : order
      ))
      
      setShowTrackingDialog(false)
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    if (status === 'completed') {
      setSelectedOrder(orders.find(o => o.id === orderId))
      setShowTrackingDialog(true)
    } else {
      await updateOrderStatus(orderId, status)
    }
  }

  const handleTrackingSubmit = async (trackingInfo: any) => {
    if (selectedOrder) {
      await updateOrderStatus(selectedOrder.id, 'completed', trackingInfo)
      setSelectedOrder(null)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!db) return;
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId))
        
        // Update local state
        setProducts(products.filter(product => product.id !== productId))
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleDownloadPDF = async (order: any) => {
    const pdfData = {
      orderId: order.id,
      orderDate: order.createdAt.toDate(),
      customerName: order.customerName || order.name,
      customerEmail: order.customerEmail || order.email,
      shippingAddress: order.shippingDetails?.address || 
        `${order.shippingDetails?.address || ''}\n${order.shippingDetails?.city || ''}\n${order.shippingDetails?.postalCode || ''}\n${order.shippingDetails?.country || ''}`,
      paymentMethod: order.paymentMethod || 'card',
      items: order.items.map((item: any) => ({
        ...item,
        description: item.description || '',
        image: item.image || null
      })) || [],
      subtotal: order.subtotal || order.total,
      shipping: order.shipping || 0,
      total: order.total
    }
    
    await downloadOrderPDF(pdfData)
  }
  
  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold text-teal-800 mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="orders">
        <TabsList className="mb-8">
          <TabsTrigger value="orders" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-teal-800">Recent Orders</h2>
            </div>
            
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{order.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm">{order.customerEmail || 'No email provided'}</td>
                        <td className="px-4 py-3 text-sm">{order.createdAt.toDate().toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                        <td className="px-4 py-3 text-sm">£{order.total?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'processing')}
                              disabled={order.status === 'processing'}
                            >
                              Process
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'completed')}
                              disabled={order.status === 'completed'}
                            >
                              Complete
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPDF(order)}
                            >
                              Download PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-teal-800">Products</h2>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/admin/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
            
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{product.name}</td>
                        <td className="px-4 py-3 text-sm">{product.category}</td>
                        <td className="px-4 py-3 text-sm">£{product.price?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <Link href={`/admin/products/${product.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="customers">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Customer management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
      <DeliveryTrackingDialog
        open={showTrackingDialog}
        onCloseAction={() => setShowTrackingDialog(false)}
        onSubmitAction={handleTrackingSubmit}
      />
    </div>
  )
}

