import { ArrowUpRight } from 'lucide-react'

export default function CTA() {
  return (
    <section data-reveal className="reveal mx-auto max-w-7xl px-6 py-24 text-center lg:px-10 lg:py-36">
      <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Make a day of it</p>
      <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.055em] text-[#1E5336] sm:text-8xl">
        Good days are<br />worth making.
      </h2>
      <a href="#facilities" className="mt-10 inline-flex items-center gap-3 border border-[#1E5336] px-6 py-4 text-[10px] uppercase tracking-[0.16em] text-[#1E5336]">
        Plan your visit <ArrowUpRight size={15} />
      </a>
    </section>
  )
}
