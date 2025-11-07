"use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import { useState } from "react"
import Link from "next/link"

const categories = ["T-Shirt", "Jacket", "Pants", "Shoes", "Watches", "Bag", "Accessories"]

const products = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 50,
  image: `/placeholder.svg?height=250&width=250&query=product ${i + 1}`,
  rating: Math.floor(Math.random() * 5) + 1,
  reviews: Math.floor(Math.random() * 500) + 10,
}))

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Products")
  const [sortBy, setSortBy] = useState("newest")

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">ALL CATEGORIES</h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing: <strong>{selectedCategory}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">CATEGORIES</h3>
              <div className="space-y-2">
                {["All Products", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      selectedCategory === cat
                        ? "bg-cyan-500 text-white font-semibold"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-bold mb-4">PRICE RANGE</h3>
                <input type="range" min="0" max="500" className="w-full" />
                <div className="flex gap-2 mt-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group">
                  <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-cyan-600 transition">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 my-1">
                    <div className="flex gap-0.5">
                      {Array(product.rating)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  <p className="text-red-600 font-bold">${product.price}</p>
                  <button className="mt-3 w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition text-sm font-semibold">
                    Add to Cart
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LiteFooter />
    </main>
  )
}
