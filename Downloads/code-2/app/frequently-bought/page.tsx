"use client"

import Link from "next/link"
import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"

interface Product {
  id: number
  name: string
  image: string
  price: string
  badge?: string
}

const allProducts: Product[] = [
  {
    id: 1,
    name: "BALENCIAGA WOMENS 150 ML BAG YELLOW & FRONT CLIP",
    image: "/balenciaga-bag.jpg",
    price: "SAR 1200",
    badge: "SALE",
  },
  {
    id: 2,
    name: "GUCCI SLING WOMEN WITH 100+ GOLD CHAIN BELT",
    image: "/gucci-chain-belt.jpg",
    price: "SAR 5800",
  },
  {
    id: 3,
    name: "DIOR WOMENS WOMEN WITH 100 GULL CHAIN BELT",
    image: "/dior-womens-belt.jpg",
    price: "SAR 3400",
    badge: "ON SALE",
  },
  {
    id: 4,
    name: "GUCCI SLING CLUTCH WOMEN WITH CHAIN",
    image: "/gucci-clutch.jpg",
    price: "SAR 6200",
  },
  {
    id: 5,
    name: "NIKE AIR FORCE 1 LOW",
    image: "/nike-air-force-sneakers.jpg",
    price: "SAR 850",
  },
  {
    id: 6,
    name: "DIOR CHIC SADDLE WITH ENAMEL",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 2800",
  },
  {
    id: 7,
    name: "GUCCI GG BAG DOUBLE WITH BAG",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 4900",
  },
  {
    id: 8,
    name: "NIKE AIR JORDAN 1 LOW",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 1200",
  },
  {
    id: 9,
    name: "GUCCI GG MARMONT LEATHER QUILTED JACKET",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 8900",
  },
  {
    id: 10,
    name: "DIOR BAG SADDLE QUILTED",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 5200",
  },
  {
    id: 11,
    name: "ADIDAS ULTRABOOST 22",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 950",
    badge: "HOT",
  },
  {
    id: 12,
    name: "NIKE CORTEZ VINTAGE",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 720",
  },
  {
    id: 13,
    name: "PRADA LEATHER CROSSBODY",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 7200",
  },
  {
    id: 14,
    name: "CHANEL CLASSIC FLAP BAG",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 12000",
  },
  {
    id: 15,
    name: "ROLEX SUBMARINER",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 45000",
  },
  {
    id: 16,
    name: "ADIDAS STAN SMITH",
    image: "/placeholder.svg?height=250&width=250",
    price: "SAR 650",
  },
]

export default function FrequentlyBoughtPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">FREQUENTLY BOUGHT TOGETHER</h1>
        <p className="text-gray-600 mb-8">See what other customers are buying most</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden relative">
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded">
                    {product.badge}
                  </span>
                )}
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="font-bold text-xs text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
              <p className="text-sm font-bold text-cyan-600 mb-3">{product.price}</p>
              <button className="w-full bg-cyan-500 text-white py-1.5 rounded hover:bg-cyan-600 transition text-xs font-semibold">
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
