"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  discount: number
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState("discount-high")

  useEffect(() => {
    // Generate products with different discount levels
    const generatedProducts: Product[] = Array.from({ length: 24 }, (_, i) => {
      const originalPrice = Math.floor(Math.random() * 300) + 100
      const discount = Math.floor(Math.random() * 70) + 10
      const price = Math.floor(originalPrice * (1 - discount / 100))
      return {
        id: i + 1,
        name: `Product ${i + 1}`,
        price,
        originalPrice,
        discount,
      }
    })

    // Sort based on selection
    if (sortBy === "discount-high") {
      generatedProducts.sort((a, b) => b.discount - a.discount)
    } else if (sortBy === "price-low") {
      generatedProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      generatedProducts.sort((a, b) => b.price - a.price)
    }

    setProducts(generatedProducts)
  }, [sortBy])

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">ALL DEALS</h1>
        <p className="text-gray-600 mb-8">Browse all our amazing deals and discounts</p>

        <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-gray-600">Showing {products.length} products</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          >
            <option value="discount-high">Highest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden relative">
                <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  -{product.discount}%
                </span>
                <img
                  src={`/product-deal-.jpg?height=250&width=250&query=product deal ${product.id}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-cyan-600 transition line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 my-2">
                <span className="text-red-600 font-bold">${product.price}</span>
                <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
              </div>
              <button className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition text-sm font-semibold">
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
