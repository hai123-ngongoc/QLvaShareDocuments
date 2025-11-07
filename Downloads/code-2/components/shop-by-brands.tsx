"use client"

import Link from "next/link"

export function ShopByBrands() {
  const brands = [
    { name: "ZARA", slug: "zara" },
    { name: "D&G", slug: "dg" },
    { name: "H&M", slug: "hm" },
    { name: "CHANEL", slug: "chanel" },
    { name: "PRADA", slug: "prada" },
    { name: "BIBA", slug: "biba" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">SHOP BY BRANDS</h2>
        <Link
          href="/brands"
          className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-yellow-500 transition"
        >
          VIEW ALL
        </Link>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brand/${brand.slug}`}
            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:shadow-lg transition cursor-pointer group"
          >
            <span className="font-bold text-center text-gray-800 group-hover:scale-110 transition">{brand.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
