import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small teams",
      features: ["Up to 5 team members", "5GB storage", "Basic automation", "Email support"],
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$79",
      description: "For growing businesses",
      features: [
        "Up to 25 team members",
        "500GB storage",
        "Advanced automation",
        "Priority support",
        "Custom integrations",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited team members",
        "Unlimited storage",
        "Full automation suite",
        "24/7 phone support",
        "Dedicated account manager",
      ],
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-foreground/60">Choose the perfect plan for your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-lg border transition-all ${
                plan.highlighted
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 md:scale-105"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-foreground/60 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-foreground/60">/month</span>}
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/50 text-primary hover:bg-primary/5"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex gap-3 items-start">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
