"use client"

import { Shirt, Pocket as Jacket, Footprints, Watch, Briefcase, Syringe as Ring } from "lucide-react"
import Link from "next/link"

const categories = [
  { name: "T-Shirt", icon: Shirt, slug: "t-shirt" },
  { name: "Jacket", icon: Jacket, slug: "jacket" },
  { name: "Pants", icon: Shirt, slug: "pants" },
  { name: "Shoes", icon: Footprints, slug: "shoes" },
  { name: "Watches", icon: Watch, slug: "watches" },
  { name: "Bag", icon: Briefcase, slug: "bag" },
  { name: "Accessories", icon: Ring, slug: "accessories" },
]

export function Categories() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">SHOP FROM TOP CATEGORIES</h2>
      <div className="grid grid-cols-7 gap-4">
        {categories.map((category, i) => {
          const Icon = category.icon
          return (
            <Link
              key={i}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:shadow-md transition group border border-gray-200"
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition">
                <Icon className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-xs font-medium text-center text-gray-700">{category.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
