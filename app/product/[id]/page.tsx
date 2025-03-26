"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { Minus, Plus, ShoppingCart, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image: string
  material?: string
  dimensions?: string
  createdAt?: Date
  updatedAt?: Date
}

function ProductDetailContent() {
  const { db, dispatch, user, cart } = useFirebase()
  const params = useParams<{ id: string }>()
  const productId = params?.id ?? null
  const [showSuccess, setShowSuccess] = useState(false)

  if (!productId) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-teal-800 mb-4">Invalid Product</h1>
          <p className="text-gray-600 mb-6">Product ID is missing</p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (!db || !productId) return

    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", productId))

        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data(),
          } as Product)
        } else {
          setError("Product not found")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [db, productId])

  const updateQuantity = (value: number) => {
    if (value < 1) return
    if (product && product.stock && value > product.stock) return
    setQuantity(value)
  }

  const addToCart = () => {
    if (!product) return

    setAddingToCart(true)

    try {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || "/placeholder.svg?height=300&width=300",
          quantity,
        },
      })

      // Reset quantity
      setQuantity(1)
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-teal-800 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error || "Product not found"}</p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <span>Added {quantity} {quantity === 1 ? 'item' : 'items'} to cart</span>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg?height=500&width=500"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-teal-800 mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold text-teal-600">£{product.price?.toFixed(2) || "0.00"}</span>

            <div className="ml-4">
              {product.stock > 0 ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="prose mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="border-t border-b py-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="mr-4">Quantity:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1 || product.stock <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= product.stock || product.stock <= 0}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Cart Items: {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>

            {product.category === "gemstone" && !user && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  Please{" "}
                  <Link href="/login" className="text-teal-600 hover:underline">
                    sign in
                  </Link>{" "}
                  to purchase gemstone products.
                </p>
              </div>
            )}

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center"
              onClick={addToCart}
              disabled={addingToCart || product.stock <= 0 || (product.category === "gemstone" && !user)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {addingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Product Details:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Category: {product.category === "gemstone" ? "Gemstone Jewelry" : 
                            product.category === "bubble-tea-earrings" ? "Bubble Tea Earrings" : 
                            "Glass Bead Jewelry"}</li>
              {product.material && <li>Material: {product.material}</li>}
              {product.dimensions && <li>Dimensions: {product.dimensions}</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dynamically import the component with no SSR
const ProductDetail = dynamic(() => Promise.resolve(ProductDetailContent), {
  ssr: false
})

export default ProductDetail

