"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

interface Product {
  id: number
  name: string
  image: string
  price: number
  originalPrice: number
}

const products: Product[] = [
  {
    id: 1,
    name: "LONG-SLEEVED BLOUSE",
    image: "/long-sleeved-blouse.jpg",
    price: 1500,
    originalPrice: 3000,
  },
  {
    id: 2,
    name: "MAXI SIZE HOBO BAG",
    image: "/hobo-bag-leather.jpg",
    price: 2500,
    originalPrice: 5000,
  },
  {
    id: 3,
    name: "DIOR-Apres-Ski-Boot",
    image: "/dior-ski-boot.jpg",
    price: 4500,
    originalPrice: 9000,
  },
  {
    id: 4,
    name: "ROLEX-Day-Date-40",
    image: "/rolex-daydate-watch.jpg",
    price: 15000,
    originalPrice: 30000,
  },
]

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface ProductTimer {
  [key: number]: TimeLeft
}

export function DealsOfDay() {
  const [globalTime, setGlobalTime] = useState<TimeLeft>({
    days: 5,
    hours: 23,
    minutes: 57,
    seconds: 23,
  })

  const [productTimers, setProductTimers] = useState<ProductTimer>({
    1: { days: 2, hours: 15, minutes: 30, seconds: 45 },
    2: { days: 1, hours: 8, minutes: 20, seconds: 10 },
    3: { days: 3, hours: 12, minutes: 45, seconds: 55 },
    4: { days: 0, hours: 6, minutes: 5, seconds: 30 },
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTime((prev) => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
          if (minutes < 0) {
            minutes = 59
            hours--
            if (hours < 0) {
              hours = 23
              days--
              if (days < 0) {
                days = 5
              }
            }
          }
        }
        return { days, hours, minutes, seconds }
      })

      setProductTimers((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((key) => {
          const id = Number(key)
          let { days, hours, minutes, seconds } = updated[id]
          seconds--
          if (seconds < 0) {
            seconds = 59
            minutes--
            if (minutes < 0) {
              minutes = 59
              hours--
              if (hours < 0) {
                hours = 23
                days--
              }
            }
          }
          updated[id] = { days, hours, minutes, seconds }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">TODAY'S DEALS OF THE DAY</h2>
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
            <span>{String(globalTime.days).padStart(2, "0")}d</span>
            <span className="mx-1">:</span>
            <span>{String(globalTime.hours).padStart(2, "0")}h</span>
            <span className="mx-1">:</span>
            <span>{String(globalTime.minutes).padStart(2, "0")}m</span>
            <span className="mx-1">:</span>
            <span>{String(globalTime.seconds).padStart(2, "0")}s</span>
          </div>
          <Link
            href="/deals"
            className="bg-amber-400 text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-amber-500 transition"
          >
            VIEW ALL
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="relative aspect-square bg-gray-200 overflow-hidden">
              <span className="absolute top-2 left-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded">
                SALE
              </span>
              {productTimers[product.id] && (
                <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {String(productTimers[product.id].hours).padStart(2, "0")}h{" "}
                  {String(productTimers[product.id].minutes).padStart(2, "0")}m
                </div>
              )}
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{product.name}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-red-600 font-bold text-sm">SAR {product.price}</span>
                <span className="text-gray-400 line-through text-xs">SAR {product.originalPrice}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link
                  href={`/product/${product.id}`}
                  className="w-full bg-cyan-500 text-white py-1.5 rounded-full font-bold text-xs hover:bg-cyan-600 transition text-center"
                >
                  BUY NOW
                </Link>
                <button className="w-full border border-blue-500 text-blue-600 py-1.5 rounded-full font-bold text-xs hover:bg-blue-50 transition flex items-center justify-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  ADD
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
