"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { User, Mail, Phone, MapPin, Save } from "lucide-react"

// Add email to UserProfile type
type UserProfile = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

export default function AccountPage() {
  const { user, loading, db } = useFirebase()
  const router = useRouter()

  // Update initial state
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account")
    }
  }, [user, loading, router])

  // Modify the useEffect for fetching user profile
  useEffect(() => {
    if (!db || !user) return

    const fetchUserProfile = async () => {
      try {
        const userProfileDoc = await getDoc(doc(db, "userProfiles", user.uid))

        if (userProfileDoc.exists()) {
          // Pre-fill with existing data from Firestore
          setProfile(userProfileDoc.data() as UserProfile)
        } else {
          // For new Google sign-in users, pre-fill with Google account data
          setProfile({
            fullName: user.displayName || '',
            email: user.email || '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'United Kingdom',
          })

          // Create initial profile document for Google users
          await setDoc(doc(db, "userProfiles", user.uid), {
            fullName: user.displayName || '',
            email: user.email || '',
            country: 'United Kingdom',
          }, { merge: true })
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setMessage({
          type: "error",
          text: "Failed to load profile information. Please refresh the page."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [db, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!db || !user) return

    setIsSaving(true)
    setMessage(null)

    try {
      // Update or create user profile
      await setDoc(doc(db, "userProfiles", user.uid), profile, { merge: true })

      setMessage({
        type: "success",
        text: "Your profile has been updated successfully!",
      })

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({
        type: "error",
        text: "Failed to update your profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold text-teal-800 mb-8">My Account</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-teal-800">{profile.fullName || user.email?.split("@")[0]}</h2>
              <p className="text-gray-600 mt-1">{user.email}</p>

              <div className="w-full mt-6 pt-6 border-t">
                <div className="flex items-center text-gray-600 mb-3">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center text-gray-600 mb-3">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="text-sm">
                      {profile.address}, {profile.city}, {profile.postalCode}, {profile.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-teal-800 mb-6">Profile Information</h2>

            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded ${
                  message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    placeholder="Your street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={profile.city} onChange={handleChange} placeholder="Your city" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={profile.postalCode}
                      onChange={handleChange}
                      placeholder="Your postal code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={profile.country}
                    onChange={handleChange}
                    placeholder="Your country"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 flex items-center" disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

