"use client"

import Link from "next/link"

export default function PaymentUnsuccessful() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment Unsuccessful
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We couldn't process your payment. This could be due to:
          </p>
          <ul className="mt-4 text-left text-sm text-gray-600 space-y-2">
            <li>• Payment was cancelled</li>
            <li>• Insufficient funds</li>
            <li>• Card details were incorrect</li>
            <li>• Technical issues</li>
          </ul>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href="/checkout"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Try Again
          </Link>
          <Link
            href="/cart"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Return to Cart
          </Link>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a
              href="mailto:senjutibiswas05@gmail.com"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              senjutibiswas05@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 