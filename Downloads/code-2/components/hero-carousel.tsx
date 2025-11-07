"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    title: "LATEST NIKE SHOES",
    subtitle: "UP TO 80% OFF",
    description: "Best Deals Online for Genuine Products",
    image: "/white-nike-shoes.jpg",
  },
  {
    title: "ADIDAS COLLECTION",
    subtitle: "UP TO 70% OFF",
    description: "Premium Sports Gear at Unbeatable Prices",
    image: "/adidas-samba-white-shoes.jpg",
  },
  {
    title: "DIOR LUXURY",
    subtitle: "UP TO 60% OFF",
    description: "Exclusive Designer Items",
    image: "/dior-fashion-brand.jpg",
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((current + 1) % slides.length)
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl overflow-hidden h-52 flex items-center">
        {/* Left Button */}
        <button onClick={prev} className="absolute left-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        {/* Content */}
        <div className="w-full px-12 z-5">
          <p className="text-white text-sm font-medium mb-2">{slides[current].description}</p>
          <h2 className="text-white text-4xl font-bold mb-1">{slides[current].title}</h2>
          <p className="text-white text-lg font-bold mb-4">{slides[current].subtitle}</p>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition ${i === current ? "w-6 bg-white" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
        </div>

        {/* Image */}
        <img
          src={slides[current].image || "/placeholder.svg"}
          alt={slides[current].title}
          className="absolute right-8 h-48 w-auto object-contain"
        />

        {/* Right Button */}
        <button onClick={next} className="absolute right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition">
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </div>
  )
}
