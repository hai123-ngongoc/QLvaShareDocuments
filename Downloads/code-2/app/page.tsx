"use client"

import { TopBanner } from "@/components/top-banner"
import { Header } from "@/components/lite-header"
import { HeroCarousel } from "@/components/hero-carousel"
import { InfoCards } from "@/components/info-cards"
import { ShopByBrands } from "@/components/shop-by-brands"
import { DealsOfDay } from "@/components/deals-of-day"
import { Categories } from "@/components/categories"
import { FashionBrands } from "@/components/fashion-brands"
import { FrequentlyBought } from "@/components/frequently-bought"
import { LiteFooter } from "@/components/lite-footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <HeroCarousel />
      <InfoCards />
      <ShopByBrands />
      <DealsOfDay />
      <Categories />
      <FashionBrands />
      <FrequentlyBought />
      <LiteFooter />
    </main>
  )
}
