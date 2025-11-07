"use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import { useState } from "react"
import Link from "next/link"

const categoryData: Record<
  string,
  { name: string; products: Array<{ id: number; name: string; price: number; rating: number; reviews: number }> }
> = {
  "t-shirt": {
    name: "T-Shirt",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `T-Shirt ${i + 1}`,
      price: Math.floor(Math.random() * 50) + 20,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
  jacket: {
    name: "Jacket",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 101,
      name: `Jacket ${i + 1}`,
      price: Math.floor(Math.random() * 200) + 80,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
  pants: {
    name: "Pants",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 201,
      name: `Pants ${i + 1}`,
      price: Math.floor(Math.random() * 100) + 40,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
  shoes: {
    name: "Shoes",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 301,
      name: `Shoes ${i + 1}`,
      price: Math.floor(Math.random() * 150) + 60,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
  watches: {
    name: "Watches",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 401,
      name: `Watch ${i + 1}`,
      price: Math.floor(Math.random() * 300) + 100,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
  bag: {
    name: "Bag",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 501,
      name: `Bag ${i + 1}`,
      price: Math.floor(Math.random() * 150) + 50,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
  accessories: {
    name: "Accessories",
    products: Array.from({ length: 12 }, (_, i) => ({
      id: i + 601,
      name: `Accessory ${i + 1}`,
      price: Math.floor(Math.random() * 80) + 15,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 300) + 10,
    })),
  },
}

export default function CategoryPage({ params }: { params: { type: string } }) {
  const category = categoryData[params.type.toLowerCase()]
  const [sortBy, setSortBy] = useState("newest")

  if (!category) {
    return (
      <main className="min-h-screen bg-white">
        <TopBanner />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Category Not Found</h1>
        </div>
        <LiteFooter />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 uppercase">{category.name}</h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing: <strong>{category.products.length} Products</strong>
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

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden relative">
                <img
                  src={`/.jpg?height=250&width=250&query=${category.name} ${product.name}`}
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
                      <span key={i} className="text-yellow-400 text-xs">
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

      <LiteFooter />
    </main>
  )
}
