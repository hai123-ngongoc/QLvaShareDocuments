export function Features() {
  const features = [
    {
      title: "Intelligent Automation",
      description: "Let AI handle routine tasks while you focus on strategic decisions. Save hours every week.",
      icon: "⚙️",
    },
    {
      title: "Real-time Collaboration",
      description: "Work together seamlessly with your team. See changes instantly and never miss a beat.",
      icon: "👥",
    },
    {
      title: "Advanced Analytics",
      description: "Gain deep insights into your workflow. Data-driven decisions made simple.",
      icon: "📊",
    },
    {
      title: "Enterprise Security",
      description: "Your data is protected with industry-leading encryption and compliance standards.",
      icon: "🔒",
    },
  ]

  return (
    <section id="features" className="w-full py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Powerful Features for Modern Teams
          </h2>
          <p className="mt-4 text-lg text-foreground/60">
            Everything you need to streamline operations and boost productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-foreground/60 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
