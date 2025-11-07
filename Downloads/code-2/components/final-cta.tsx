import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="w-full py-20 md:py-32 bg-primary">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground text-balance">
          Ready to Transform Your Workflow?
        </h2>
        <p className="mt-6 text-lg text-primary-foreground/90 text-balance max-w-2xl mx-auto">
          Join thousands of teams already using StreamLine to work smarter, not harder. Start your free trial today—no
          credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary">
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            Schedule Demo
          </Button>
        </div>

        <p className="mt-6 text-sm text-primary-foreground/70">
          14-day free trial. Cancel anytime. No credit card required.
        </p>
      </div>
    </section>
  )
}
