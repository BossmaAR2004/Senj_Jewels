"use client"
import { useEffect, useState } from "react"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl bg-white border-2 border-teal-600 rounded-lg shadow-xl px-6 py-5">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold text-gray-900">We Value Your Privacy</h2>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>
      </div>

      <p className="text-sm text-gray-700 mt-2">
        We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking <strong>"Accept All"</strong>, you consent to our use of cookies.
      </p>

      <a
        href="/cookiePolicy"
        className="text-teal-600 font-semibold underline mt-2 inline-block hover:text-teal-700"
      >
        Read More About Our Cookie Policy
      </a>

      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={handleDecline}
          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 text-sm bg-teal-600 text-white font-semibold rounded hover:bg-teal-700"
        >
          Accept All
        </button>
      </div>
    </div>
  )
}
