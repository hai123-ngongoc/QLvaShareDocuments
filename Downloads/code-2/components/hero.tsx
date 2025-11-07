import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative w-full py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
            Streamline Your Workflow
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/70 text-balance max-w-3xl mx-auto">
            Automate repetitive tasks, collaborate seamlessly, and focus on what matters most. Transform your
            productivity today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/5 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative h-96 md:h-[500px] rounded-xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-foreground/50">Interactive dashboard preview</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
