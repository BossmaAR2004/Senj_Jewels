"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { Minus, Plus, ShoppingCart, Check, Heart, Share2, Star, Shield, Truck, RotateCcw, ArrowLeft, Sparkles } from "lucide-react"
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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!productId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Invalid Product</h1>
          <p className="text-slate-600 mb-8">Product ID is missing</p>
          <Button asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg rounded-full px-8 py-3 transition-all duration-300 transform hover:scale-105">
            <Link href="/shop" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
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

      setQuantity(1)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setAddingToCart(false)
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-teal-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Oops!</h1>
          <p className="text-slate-600 mb-8">{error || "Product not found"}</p>
          <Button asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg rounded-full px-8 py-3 transition-all duration-300 transform hover:scale-105">
            <Link href="/shop" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-green-200 text-green-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">Added to Cart!</p>
              <p className="text-sm text-green-600">{quantity} {quantity === 1 ? 'item' : 'items'} added successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="rounded-full p-2 hover:bg-white/60">
              <Link href="/shop">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="rounded-full p-2 hover:bg-white/60">
                <Share2 className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Button variant="ghost" className="rounded-full p-2 hover:bg-white/60">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                {cart.items.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl">
              <Image
                src={product.image || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-700 ${imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              
              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white"
              >
                <Heart className={`h-5 w-5 transition-colors duration-300 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
              </button>

              {/* Stock Badge */}
              <div className="absolute top-6 left-6">
                {product.stock > 0 ? (
                  <div className="bg-green-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
                  </div>
                ) : (
                  <div className="bg-red-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center">
                <Shield className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Secure Payment</p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center">
                <Truck className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Fast Delivery</p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center">
                <RotateCcw className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">(4.9) 127 reviews</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  £{product.price?.toFixed(2) || "0.00"}
                </span>
                <span className="text-lg text-slate-500 line-through">£{((product.price || 0) * 1.3).toFixed(2)}</span>
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Save 23%
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/60 backdrop-blur rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Authentication Notice */}
            {product.category === "gemstone" && !user && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">Authentication Required</p>
                    <p className="text-sm text-amber-700">
                      Please{" "}
                      <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                        sign in
                      </Link>{" "}
                      to purchase premium gemstone products.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900">Quantity:</span>
                  <div className="flex items-center bg-slate-100 rounded-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-slate-200"
                      onClick={() => updateQuantity(quantity - 1)}
                      disabled={quantity <= 1 || product.stock <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-16 text-center">
                      <span className="text-lg font-bold text-slate-900">{quantity}</span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-slate-200"
                      onClick={() => updateQuantity(quantity + 1)}
                      disabled={quantity >= product.stock || product.stock <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl rounded-2xl py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={addToCart}
                disabled={addingToCart || product.stock <= 0 || (product.category === "gemstone" && !user)}
              >
                <div className="flex items-center justify-center gap-3">
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6" />
                      Add to Cart - £{((product.price || 0) * quantity).toFixed(2)}
                    </>
                  )}
                </div>
              </Button>
            </div>

            {/* Product Details */}
            <div className="bg-white/60 backdrop-blur rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                  <span className="text-slate-600">Category</span>
                  <span className="font-semibold text-slate-900">
                    {product.category === "gemstone" ? "Gemstone Jewelry" : 
                     product.category === "bubble-tea-earrings" ? "Bubble Tea Earrings" : 
                     "Glass Bead Jewelry"}
                  </span>
                </div>
                {product.material && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                    <span className="text-slate-600">Material</span>
                    <span className="font-semibold text-slate-900">{product.material}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                    <span className="text-slate-600">Dimensions</span>
                    <span className="font-semibold text-slate-900">{product.dimensions}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Stock</span>
                  <span className="font-semibold text-slate-900">{product.stock} available</span>
                </div>
              </div>
            </div>
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
