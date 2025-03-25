"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useFirebase } from "@/components/firebase-provider"
import { collection, getDocs, query, where } from "firebase/firestore"
import { ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image: string
  createdAt?: Date
  updatedAt?: Date
}

export default function BubbleTeaEarringsPage() {
  const { db } = useFirebase()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!db) return

    const fetchProducts = async () => {
      try {
        const earringsQuery = query(
          collection(db, "products"),
          where("category", "==", "bubble-tea-earrings")
        )

        const snapshot = await getDocs(earringsQuery)
        const earringsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        setProducts(earringsData)
      } catch (error) {
        console.error("Error fetching bubble tea earrings:", error)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [db])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-rose-800 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild className="bg-rose-600 hover:bg-rose-700">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-rose-700 mb-4">Bubble Tea Earrings</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sip in style! Explore our adorable bubble tea earring collection—perfect for lovers of kawaii fashion and handcrafted charm.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No bubble tea earrings found</p>
          <Button asChild className="bg-rose-600 hover:bg-rose-700">
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.id}`} className="block relative h-64">
        <Image
          src={product.image || "/placeholder.svg?height=300&width=300"}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Sold Out</span>
          </div>
        )}
      </Link>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-rose-700 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-rose-800">£{product.price.toFixed(2)}</span>
          <Button asChild className="bg-rose-600 hover:bg-rose-700">
            <Link href={`/product/${product.id}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
