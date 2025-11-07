import { Mail, Facebook, Twitter, Instagram } from "lucide-react"

export function LiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">●</span>
              </div>
              <span className="text-white font-bold text-lg">LITE</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted online shopping destination for premium brands and products.
            </p>
            <div className="space-y-1">
              <p className="text-sm">📞 +1-800-123-4567</p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@lite.com
              </p>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold mb-4">SHOP</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Sale Items
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  All Products
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-bold mb-4">HELP & POLICY</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Returns & Exchange
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Download */}
          <div>
            <h3 className="text-white font-bold mb-4">FOLLOW US</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500">Download our app for exclusive deals</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 flex justify-between items-center text-xs text-gray-500">
          <p>© 2025 LITE. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
