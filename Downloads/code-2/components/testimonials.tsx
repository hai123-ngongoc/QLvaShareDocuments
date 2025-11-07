export function Testimonials() {
  const testimonials = [
    {
      quote:
        "StreamLine has transformed how our team works. We've cut manual processes by 60% and couldn't imagine going back.",
      author: "Sarah Chen",
      title: "Operations Director at TechFlow",
      avatar: "👩‍💼",
    },
    {
      quote: "The automation capabilities are incredible. What used to take our team days now takes hours.",
      author: "Marcus Rodriguez",
      title: "VP of Engineering at DataSync",
      avatar: "👨‍💼",
    },
    {
      quote: "Best investment we've made for our productivity. The ROI was clear within the first month.",
      author: "Emily Watson",
      title: "Founder at CreativeStudio",
      avatar: "👩‍🔬",
    },
  ]

  return (
    <section id="testimonials" className="w-full py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Loved by Teams Worldwide</h2>
          <p className="mt-4 text-lg text-foreground/60">See what our customers have to say</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-lg border border-border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-foreground/80 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-foreground/60">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
