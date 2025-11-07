"use client"

import { X } from "lucide-react"
import Link from "next/link"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  actionType: "add-to-cart" | "buy-now" | null
}

export function LoginModal({ isOpen, onClose, onConfirm, actionType }: LoginModalProps) {
  if (!isOpen) return null

  const actionText = actionType === "buy-now" ? "purchase" : "add items to cart"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Please Login</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-8">You need to login to {actionText}.</p>

        <div className="space-y-3">
          <Link
            href="/login"
            onClick={onConfirm}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition block text-center"
          >
            Yes, Login
          </Link>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            No, Continue Browsing
          </button>
        </div>
      </div>
    </div>
  )
}
