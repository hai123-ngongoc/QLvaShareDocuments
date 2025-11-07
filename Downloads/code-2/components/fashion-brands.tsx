"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const brands = [
  {
    name: "DIOR",
    image: "/dior-fashion-brand.jpg",
    slug: "dior",
  },
  {
    name: "NIKE",
    image: "/gucci-fashion-models.jpg",
    slug: "nike",
  },
  {
    name: "ADIDAS",
    image: "/chanel-luxury-fashion.jpg",
    slug: "adidas",
  },
  {
    name: "GUCCI",
    image: "/balenciaga-discount-sale.jpg",
    slug: "gucci",
  },
  {
    name: "CHANEL",
    image: "/ysl-fashion-collection.jpg",
    slug: "chanel",
  },
]

export function FashionBrands() {
  const [scrollPosition, setScrollPosition] = useState(0)

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("fashion-brands-scroll")
    if (container) {
      const scrollAmount = 300
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
        setScrollPosition(Math.max(0, scrollPosition - scrollAmount))
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
        setScrollPosition(scrollPosition + scrollAmount)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">TOP FASHION BRANDS</h2>
        <Link
          href="/brands"
          className="bg-amber-400 text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-amber-500 transition"
        >
          VIEW ALL
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div
          id="fashion-brands-scroll"
          className="grid grid-cols-5 gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group flex-shrink-0"
            >
              <img
                src={brand.image || "/placeholder.svg"}
                alt={brand.name}
                className="w-full h-full object-cover group-hover:scale-110 transition"
              />
              <div className="absolute inset-0 bg-black/30 flex items-end justify-start p-3 group-hover:bg-black/40 transition">
                <span className="text-white font-bold text-sm">{brand.name}</span>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {brands.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition ${i === 0 ? "bg-cyan-600" : "bg-gray-300 hover:bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  )
}
