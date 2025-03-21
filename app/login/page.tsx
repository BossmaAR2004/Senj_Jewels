"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirebase } from "@/components/firebase-provider";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signInWithGoogle } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push(redirect);
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirect);
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="text-center mb-8">
        <Image
          src="/Images/logo.png"
          alt="Sen Jewels Logo"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-teal-800">Sign In to Sen Jewels</h1>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

 



        {/* Sign-in Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
                  {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Sign in with Google button */}
               {/* Sign in with Google button */}
               <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-2 mb-4"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <title>Google Logo</title>
              <clipPath id="g">
                <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              </clipPath>
              <g className="colors" clipPath="url(#g)">
                <path fill="#FBBC05" d="M0 37V11l17 13z"/>
                <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/>
                <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/>
                <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/>
              </g>
            </svg>
            Sign in with Google
          </Button>
        </div>
        </form>

        {/* Sign-up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-teal-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
