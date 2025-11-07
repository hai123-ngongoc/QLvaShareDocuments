"use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function OrderSuccessPage() {
  const orderNumber = Math.random().toString(36).substring(2, 11).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-8">Thank you for your purchase</p>

          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-lg p-8 mb-8 border border-gray-200">
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Order Number</p>
                <p className="text-2xl font-bold text-cyan-600">{orderNumber}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-600 text-sm mb-1">Estimated Delivery</p>
                <p className="text-lg font-semibold text-gray-800">{estimatedDelivery}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> A confirmation email has been sent to your registered email address with order
                  details and tracking information.
                </p>
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-gray-700">ADIDAS SAMBA OG Shoes x 1</span>
                <span className="font-semibold">$89.00</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-gray-700">Nike Air Force 1 x 1</span>
                <span className="font-semibold">$120.00</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">Subtotal:</span>
                <span>$209.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Tax:</span>
                <span>$20.90</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total:</span>
                <span className="text-2xl font-bold text-red-600">$239.90</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition inline-block"
            >
              Continue Shopping
            </Link>
            <Link
              href="/offers"
              className="border-2 border-cyan-500 text-cyan-600 px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition inline-block"
            >
              View Lite Offers
            </Link>
          </div>
        </div>
      </div>

      <LiteFooter />
    </main>
  )
}
