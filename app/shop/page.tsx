"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useFirebase } from "@/components/firebase-provider"
import { collection, getDocs, query, where } from "firebase/firestore"
import { ShoppingCart } from "lucide-react"

export default function ShopPage() {
  const { db } = useFirebase()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!db) return

    const fetchProducts = async () => {
      try {
        let productsQuery

        if (filter === "all") {
          productsQuery = query(collection(db, "products"))
        } else {
          productsQuery = query(collection(db, "products"), where("category", "==", filter))
        }

        const productsSnapshot = await getDocs(productsQuery)
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
        // Set empty array on error to avoid undefined
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [db, filter])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-4">Shop Our Collection</h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Browse our handcrafted jewelry pieces, from elegant gemstone creations to colorful glass bead bracelets.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          className={
            filter === "all" ? "bg-teal-600 hover:bg-teal-700" : "border-teal-600 text-teal-600 hover:bg-teal-50"
          }
          onClick={() => setFilter("all")}
        >
          All Products
        </Button>
        <Button
          variant={filter === "gemstone" ? "default" : "outline"}
          className={
            filter === "gemstone" ? "bg-teal-600 hover:bg-teal-700" : "border-teal-600 text-teal-600 hover:bg-teal-50"
          }
          onClick={() => setFilter("gemstone")}
        >
          Gemstone Collection
        </Button>
        <Button
          variant={filter === "glass" ? "default" : "outline"}
          className={
            filter === "glass" ? "bg-teal-600 hover:bg-teal-700" : "border-teal-600 text-teal-600 hover:bg-teal-50"
          }
          onClick={() => setFilter("glass")}
        >
          Glass Bead Collection
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No products found</p>
          <Button
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
            onClick={() => setFilter("all")}
          >
            View All Products
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

function ProductCard({ product }: { product: any }) {
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
        <h3 className="text-xl font-semibold text-teal-700 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-teal-800">£{product.price?.toFixed(2) || "0.00"}</span>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
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

