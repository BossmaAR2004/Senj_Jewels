"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProductForm() {
  const { user, isAdmin, loading, db, storage } = useFirebase()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const isNewProduct = productId === "new"

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "gemstone",
    stock: "",
    image: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(!isNewProduct)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")

  // 🔐 Redirect unauthorized users
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [user, isAdmin, loading, router])

  // 🔍 Fetch product only if admin and editing
  useEffect(() => {
    if (!db || !productId || isNewProduct || !isAdmin) {
      setLoadingData(false)
      return
    }

    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", productId))
        if (productDoc.exists()) {
          const productData = productDoc.data()
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price?.toString() || "",
            category: productData.category || "gemstone",
            stock: productData.stock?.toString() || "",
            image: productData.image || "",
          })
          if (productData.image) setImagePreview(productData.image)
        } else {
          setError("Product not found")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("Failed to load product")
      } finally {
        setLoadingData(false)
      }
    }

    fetchProduct()
  }, [db, productId, isNewProduct, isAdmin])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File) => {
    if (!storage) throw new Error("Storage not initialized")
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        }
      )
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      setError("You do not have permission to add or update products.")
      return
    }

    if (!db || !storage) {
      setError("Firebase not initialized")
      return
    }

    setError("")
    setSubmitting(true)

    try {
      if (!formData.name || !formData.price || !formData.stock) {
        throw new Error("Please fill in all required fields")
      }

      let imageUrl = formData.image
      if (imageFile) imageUrl = await uploadImage(imageFile)

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        image: imageUrl,
        updatedAt: new Date(),
      }

      if (isNewProduct) {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        })
      } else {
        await updateDoc(doc(db, "products", productId), productData)
      }

      router.push("/admin")
    } catch (error: any) {
      console.error("Save error:", error)
      setError(error.message || "Failed to save product")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || (loadingData && !isNewProduct)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-teal-600 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-teal-800 mb-8">{isNewProduct ? "Add New Product" : "Edit Product"}</h1>

      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (£) *</Label>
              <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemstone">Gemstone</SelectItem>
                <SelectItem value="glass">Glass Beads</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center space-x-4">
              <Button type="button" variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <span className="text-sm text-gray-500">{imageFile ? imageFile.name : "No file selected"}</span>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Uploading: {Math.round(uploadProgress)}%</p>
              </div>
            )}

            {imagePreview && (
              <div className="mt-4 relative h-48 w-48 border rounded-md overflow-hidden">
                <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="pt-4 flex space-x-4">
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={submitting}>
              {submitting ? "Saving..." : isNewProduct ? "Add Product" : "Update Product"}
            </Button>

            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
