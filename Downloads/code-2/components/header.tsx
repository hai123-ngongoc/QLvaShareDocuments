import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              S
            </div>
            <span className="text-xl font-bold text-foreground">StreamLine</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>

          {/* CTA Button */}
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
        </div>
      </div>
    </header>
  )
}
