"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFirebase } from "@/components/firebase-provider"
import { Eye, EyeOff, Lock } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signIn, db } = useFirebase()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Sign in with Firebase Auth
      const userCredential = await signIn(email, password);
      
      if (!userCredential?.user) {
        throw new Error("Authentication failed");
      }

      // Step 2: Check admin status with delay to ensure auth is propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const adminRef = doc(db, "admins", userCredential.user.uid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        throw new Error("Not authorized as admin");
      }

      const adminData = adminDoc.data();
      if (!adminData?.isAdmin) {
        throw new Error("Admin privileges not granted");
      }

      // Success - redirect to admin panel
      console.log("✅ Admin access verified");
      router.push("/admin");

    } catch (error: any) {
      console.error("❌ Login error:", error);
      setError(
        error.message === "Not authorized as admin" || 
        error.message === "Admin privileges not granted"
          ? "You do not have admin access"
          : "Invalid email or password"
      );
      
      // Redirect non-admins to home after delay
      if (error.message.includes("admin")) {
        setTimeout(() => router.push("/"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-12">
      <div className="text-center mb-8">
        <Image src="/Images/logo.png" alt="Sen Jewels Logo" width={100} height={100} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-teal-800">Admin Login</h1>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-100 p-3 rounded-full">
            <Lock className="h-6 w-6 text-teal-600" />
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Admin Panel"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">This area is restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  )
}

