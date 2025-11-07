"use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import { useState } from "react"
import Link from "next/link"
import { Share2, ChevronRight, ShoppingCart } from "lucide-react"
import { LoginModal } from "@/components/login-modal"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedColor, setSelectedColor] = useState("white")
  const [selectedSize, setSelectedSize] = useState("42")
  const [quantity, setQuantity] = useState(1)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [actionType, setActionType] = useState<"add-to-cart" | "buy-now" | null>(null)

  const product = {
    id: params.id,
    name: "ADIDAS SAMBA OG SHOES",
    price: 89,
    originalPrice: 129,
    discount: 31,
    rating: 4.5,
    reviews: 1250,
    image: "/adidas-samba-white-shoes.jpg",
    colors: ["white", "black", "gray", "navy"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description:
      "The classic Adidas Samba OG returns with its iconic silhouette. Featuring premium materials, superior comfort, and timeless style that works for any occasion.",
  }

  const relatedProducts = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Related Product ${i + 1}`,
    price: Math.floor(Math.random() * 150) + 50,
    image: `/placeholder.svg?height=200&width=200&query=shoes ${i + 1}`,
  }))

  const handleAddToCart = () => {
    setActionType("add-to-cart")
    setShowLoginModal(true)
  }

  const handleBuyNow = () => {
    setActionType("buy-now")
    setShowLoginModal(true)
  }

  const handleLoginConfirm = () => {
    setShowLoginModal(false)
    if (actionType === "buy-now") {
      window.location.href = "/checkout"
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={handleLoginConfirm}
        actionType={actionType}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-cyan-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/categories" className="hover:text-cyan-600">
            Categories
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="bg-gray-100 rounded-lg aspect-square mb-6 overflow-hidden">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-lg aspect-square overflow-hidden cursor-pointer hover:ring-2 ring-cyan-500"
                >
                  <img
                    src={`/shoes-view-.jpg?height=100&width=100&query=shoes view ${i}`}
                    alt={`View ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-0.5">
                  {Array(Math.floor(product.rating))
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-red-600">${product.price}</span>
                <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {product.discount}% OFF
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8">{product.description}</p>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-3">COLOR</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color ? "border-cyan-500" : "border-gray-300 hover:border-gray-400"
                    } bg-gray-200`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-3">SIZE</h3>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded border-2 font-semibold transition ${
                      selectedSize === size
                        ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and CTA */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100">
                  +
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-cyan-500 text-white py-3 rounded-full font-bold hover:bg-cyan-600 transition flex items-center justify-center gap-2"
                >
                  BUY NOW - ${product.price}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full border-2 border-blue-500 text-blue-600 py-3 rounded-full font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>ADD</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition">
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <div key={prod.id} className="group">
                <Link href={`/product/${prod.id}`} className="block">
                  <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden">
                    <img
                      src={prod.image || "/placeholder.svg"}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-cyan-600">{prod.name}</h3>
                  <p className="text-red-600 font-bold">${prod.price}</p>
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    href={`/product/${prod.id}?action=buy`}
                    className="text-xs bg-cyan-500 text-white py-1.5 rounded-full font-bold hover:bg-cyan-600 transition text-center"
                  >
                    BUY
                  </Link>
                  <button className="text-xs border border-blue-500 text-blue-600 py-1.5 rounded-full font-bold hover:bg-blue-50 transition flex items-center justify-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    ADD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LiteFooter />
    </main>
  )
}