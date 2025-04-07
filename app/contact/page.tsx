"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Instagram, MapPin, Send } from "lucide-react" // Note: Now importing Instagram here
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useFirebase } from "@/components/firebase-provider"

export default function ContactPage() {
  const { db } = useFirebase()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Add the form data to Firestore
      await addDoc(collection(db, "contactUs"), {
        ...formData,
        createdAt: serverTimestamp(),
      })

      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Firebase submission error:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 5000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-4">Contact Us</h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Have questions about our products or want to place a custom order? Get in touch with us!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-teal-800 mb-6">Send Us a Message</h2>

          {submitStatus === "success" && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              There was an error sending your message. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-teal-800 mb-6">Contact Information</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-teal-600 mt-1 mr-3" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">senjutibiswas05@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start">
              {/* Updated icon to Instagram */}
              <Instagram className="h-5 w-5 text-teal-600 mt-1 mr-3" />
              <div>
                <h3 className="font-medium">Instagram</h3>
                <a
                  href="https://www.instagram.com/_senjewels_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  @_senjewels_
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-teal-600 mt-1 mr-3" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-gray-600">London, United Kingdom</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
