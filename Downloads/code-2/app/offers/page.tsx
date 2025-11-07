"use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import Link from "next/link"
import { useEffect, useState } from "react"

const discountedProducts = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1001,
  name: `Discounted Product ${i + 1}`,
  originalPrice: Math.floor(Math.random() * 200) + 100,
  discountedPrice: Math.floor(Math.random() * 100) + 30,
  discount: Math.floor(Math.random() * 50) + 15,
  rating: Math.floor(Math.random() * 5) + 1,
  reviews: Math.floor(Math.random() * 500) + 20,
  image: `/placeholder.svg?height=250&width=250&query=discount product ${i + 1}`,
  badge: i % 3 === 0 ? "HOT DEAL" : i % 3 === 1 ? "FLASH SALE" : "LIMITED",
  endTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
}))

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = endTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("ENDED")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return <div className="text-xs font-semibold text-white bg-red-600 px-2 py-1 rounded">{timeLeft || "Loading..."}</div>
}

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-12 mb-12 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">LITE OFFERS</h1>
          <p className="text-lg">Save up to 70% on selected products</p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {discountedProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {product.discount}% OFF
                </div>
                <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  {product.badge}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <CountdownTimer endTime={product.endTime} />
                </div>
              </div>
              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-cyan-600 transition">
                {product.name}
              </h3>
              <div className="flex items-center gap-1 my-1">
                <div className="flex gap-0.5">
                  {Array(product.rating)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">
                        ★
                      </span>
                    ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-red-600 font-bold">${product.discountedPrice}</p>
                <p className="text-gray-400 line-through text-sm">${product.originalPrice}</p>
              </div>
              <button className="mt-3 w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition text-sm font-semibold">
                Add to Cart
              </button>
            </Link>
          ))}
        </div>
      </div>

      <LiteFooter />
    </main>
  )
}
