import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-secondary/50 py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
                S
              </div>
              <span className="font-bold text-foreground">StreamLine</span>
            </div>
            <p className="text-sm text-foreground/60">Streamline your workflow and boost productivity.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60">© 2025 StreamLine. All rights reserved.</p>

          {/* Social Links */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors" aria-label="Twitter">
              𝕏
            </Link>
            <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors" aria-label="LinkedIn">
              in
            </Link>
            <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors" aria-label="GitHub">
              ◢
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
