import { ArrowUpRight } from 'lucide-react'

export default function PoolHouse() {
  return (
    <section data-reveal className="reveal mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-36">
      <div
        data-parallax
        className="parallax-media min-h-[540px] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85')" }}
      />
      <div className="flex flex-col justify-between py-4">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.18em] text-[#E1A728]">The pool house</p>
          <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-7xl">
            The long way<br />around.
          </h2>
          <p className="mt-8 max-w-sm text-sm leading-6 text-[#6B756B]">A day by the water, a table full of snacks, and nowhere else you need to be.</p>
        </div>
        <a href="#facilities" className="mt-16 inline-flex items-center gap-3 self-start border-b border-[#1E5336] pb-2 text-[10px] uppercase tracking-[0.16em] text-[#1E5336]">
          See the pool house <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  )
}
