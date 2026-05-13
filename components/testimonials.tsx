type Testimonial = {
  quote: string
  name: string
  role: string
}

// TODO: add real quotes once collected. Component returns null while empty.
export const TESTIMONIALS: Testimonial[] = []

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null

  return (
    <section className="bg-white px-6 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#297134]">
            From founders
          </p>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            What founders are saying
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(t => (
            <figure
              key={`${t.name}-${t.role}`}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <blockquote className="text-base text-gray-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-gray-900">{t.name}</span>
                <span className="text-gray-500">, {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
