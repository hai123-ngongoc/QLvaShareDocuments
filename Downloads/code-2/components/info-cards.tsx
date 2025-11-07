import { Truck, RotateCcw, DollarSign, Headphones } from "lucide-react"

const cards = [
  {
    icon: Truck,
    title: "FAST DELIVERY",
    subtitle: "Dispatch within 24 hours",
  },
  {
    icon: RotateCcw,
    title: "24-HOURS RETURN",
    subtitle: "100% money-back guarantee",
  },
  {
    icon: DollarSign,
    title: "DOLLAR PAYMENT",
    subtitle: "Safe secure & trusted",
  },
  {
    icon: Headphones,
    title: "SUPPORT 24/7",
    subtitle: "Call us anytime 24/7",
  },
]

export function InfoCards() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <Icon className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-sm text-gray-900">{card.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{card.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
