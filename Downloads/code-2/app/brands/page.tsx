"use client"

import Link from "next/link"
import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"

const allBrands = [
  { name: "Adidas", slug: "adidas", productCount: 50 },
  { name: "Nike", slug: "nike", productCount: 65 },
  { name: "Dior", slug: "dior", productCount: 35 },
  { name: "Gucci", slug: "gucci", productCount: 45 },
  { name: "Chanel", slug: "chanel", productCount: 30 },
  { name: "Prada", slug: "prada", productCount: 28 },
  { name: "Balenciaga", slug: "balenciaga", productCount: 22 },
  { name: "Rolex", slug: "rolex", productCount: 40 },
]

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">TOP FASHION BRANDS</h1>
        <p className="text-gray-600 mb-8">Explore products from all our premium brands</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allBrands.map((brand) => (
            <Link key={brand.slug} href={`/brand/${brand.slug}`} className="group">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg aspect-square mb-3 overflow-hidden flex items-center justify-center relative">
                <span className="text-3xl font-bold text-cyan-600 group-hover:scale-110 transition">
                  {brand.name[0]}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-cyan-600 transition">{brand.name}</h3>
              <p className="text-sm text-gray-600">{brand.productCount} products</p>
              <button className="mt-3 w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition text-sm font-semibold">
                View Collection
              </button>
            </Link>
          ))}
        </div>
      </div>

      <LiteFooter />
    </main>
  )
}
