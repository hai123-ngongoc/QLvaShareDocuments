"use client"

import { Search, User, ShoppingCart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const pathname = usePathname()

  const products = [
    { name: "ADIDAS SAMBA OG", id: "1" },
    { name: "Nike Air Force 1", id: "2" },
    { name: "Long-sleeved Blouse", id: "3" },
    { name: "Maxi Size Hobo Bag", id: "4" },
    { name: "Black Rolex Watch", id: "5" },
    { name: "Pink Leather Jacket", id: "6" },
    { name: "Dior Diorshow Shoes", id: "7" },
  ]

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/offers", label: "OFFERS" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Logo and Search */}
        <div className="flex items-center justify-between gap-8 mb-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">●</span>
            </div>
            <span className="text-2xl font-bold tracking-wide text-cyan-600">LITE</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(e.target.value.length > 0)
                }}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="bg-transparent border-0 outline-none px-2 py-1 w-full text-sm"
              />
            </div>
            {showSearchResults && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition">
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                isActive(item.href) ? "bg-black text-white" : "text-gray-800 hover:text-red-600"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="relative group">
            <button className="text-sm font-medium hover:text-red-600 transition flex items-center gap-1">
              CATEGORIES <span className="text-xs">▼</span>
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
              <Link href="/category/t-shirt" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                T-Shirt
              </Link>
              <Link href="/category/jacket" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Jacket
              </Link>
              <Link href="/category/pants" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Pants
              </Link>
              <Link href="/category/shoes" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Shoes
              </Link>
              <Link href="/category/watches" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Watches
              </Link>
              <Link href="/category/bag" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Bag
              </Link>
              <Link href="/category/accessories" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Accessories
              </Link>
            </div>
          </div>

          <div className="relative group">
            <button className="text-sm font-medium hover:text-red-600 transition flex items-center gap-1">
              BRANDS <span className="text-xs">▼</span>
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
              <Link href="/brand/zara" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Zara
              </Link>
              <Link href="/brand/dg" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                D&G
              </Link>
              <Link href="/brand/hm" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                H&M
              </Link>
              <Link href="/brand/chanel" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Chanel
              </Link>
              <Link href="/brand/prada" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Prada
              </Link>
              <Link href="/brand/adidas" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Adidas
              </Link>
              <Link href="/brand/nike" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Nike
              </Link>
              <Link href="/brand/dior" className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                Dior
              </Link>
              <Link
                href="/brands"
                className="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm font-bold border-t border-gray-200"
              >
                All Brands
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
