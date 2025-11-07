// KHÔNG có "use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { LiteFooter } from "@/components/lite-footer"
import Link from "next/link"

type Product = {
  id: number; name: string; price: number; image: string; rating: number; reviews: number
}

const brandProducts: Record<string, Product[]> = {
  adidas: Array.from({ length: 12 }, (_, i) => ({
    id: 2001 + i,
    name: `Adidas ${["Samba","Stan Smith","Ultra Boost","NMD"][i % 4]} ${i}`,
    price: Math.floor(Math.random() * 150) + 50,
    image: `/placeholder.svg?height=250&width=250&query=adidas shoes ${i}`,
    rating: Math.floor(Math.random() * 5) + 1,
    reviews: Math.floor(Math.random() * 500) + 20,
  })),
  nike: Array.from({ length: 12 }, (_, i) => ({
    id: 3001 + i,
    name: `Nike ${["Air Force 1","Jordan 1","Dunk","Air Max"][i % 4]} ${i}`,
    price: Math.floor(Math.random() * 150) + 60,
    image: `/placeholder.svg?height=250&width=250&query=nike shoes ${i}`,
    rating: Math.floor(Math.random() * 5) + 1,
    reviews: Math.floor(Math.random() * 500) + 20,
  })),
  dior: Array.from({ length: 12 }, (_, i) => ({
    id: 4001 + i,
    name: `Dior ${["Saddle","Book Tote","Caro","Bobby"][i % 4]} ${i}`,
    price: Math.floor(Math.random() * 300) + 200,
    image: `/placeholder.svg?height=250&width=250&query=dior luxury ${i}`,
    rating: Math.floor(Math.random() * 5) + 1,
    reviews: Math.floor(Math.random() * 300) + 10,
  })),
};

export default async function BrandPage(
  { params }: { params: Promise<{ name: string }> }   // 👈 params là Promise
) {
  const { name } = await params                        // 👈 GIẢI PROMISE Ở ĐÂY
  const key = name.toLowerCase()
  const products = brandProducts[key] ?? []
  const brandName = key.toUpperCase()

  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">{brandName}</h1>
        <p className="text-gray-600 mb-8">Explore our exclusive {brandName} collection</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group">
              <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden">
                <img src={p.image || "/placeholder.svg"} alt={p.name}
                     className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-cyan-600 transition line-clamp-2">
                {p.name}
              </h3>
              <div className="flex items-center gap-1 my-1">
                <div className="flex gap-0.5">
                  {Array(Math.max(0, Math.min(5, p.rating))).fill(0).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xs">★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">({p.reviews})</span>
              </div>
              <p className="text-red-600 font-bold">${p.price}</p>
            </Link>
          ))}
        </div>
      </div>
      <LiteFooter />
    </main>
  )
}
