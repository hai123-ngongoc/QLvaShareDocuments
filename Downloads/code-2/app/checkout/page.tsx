"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import { useState } from "react"

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })

  const cartItems: CheckoutItem[] = [
    { id: "1", name: "ADIDAS SAMBA OG Shoes", price: 89, quantity: 1 },
    { id: "2", name: "Nike Air Force 1", price: 120, quantity: 1 },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 10
  const tax = Math.round(subtotal * 0.1 * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = () => {
    router.push("/order-success")
  }

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">CHECKOUT</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Steps */}
            <div className="flex gap-4 mb-8">
              {(["shipping", "payment", "confirm"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      step === s ||
                      (step === "payment" && s === "shipping") ||
                      (step === "confirm" && (s === "shipping" || s === "payment"))
                        ? "bg-cyan-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold text-gray-600 capitalize">{s}</span>
                  {i < 2 && <div className="w-8 h-0.5 bg-gray-300" />}
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            {step === "shipping" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <button
                  onClick={() => setStep("payment")}
                  className="w-full bg-cyan-500 text-white py-3 rounded-lg font-bold hover:bg-cyan-600 transition"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Info */}
            {step === "payment" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 border border-cyan-500 rounded-lg p-4 cursor-pointer bg-cyan-50">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                    <span className="font-semibold">Credit Card</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <span className="font-semibold">Debit Card</span>
                  </label>
                  <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <span className="font-semibold">PayPal</span>
                  </label>
                </div>
                <div className="pt-4 space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className="border border-gray-300 rounded-lg px-4 py-2" />
                    <input type="text" placeholder="CVV" className="border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep("shipping")}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    className="flex-1 bg-cyan-500 text-white py-3 rounded-lg font-bold hover:bg-cyan-600 transition"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Order Confirmation */}
            {step === "confirm" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✓ Order Ready to Submit</p>
                </div>
                <div className="space-y-3">
                  <p>
                    <strong>Name:</strong> {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Address:</strong> {formData.address}, {formData.city} {formData.postalCode}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">ORDER SUMMARY</h2>
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-red-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LiteFooter />
    </main>
  )
}
