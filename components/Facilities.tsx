'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { facilities, facilityFilters, type Facility } from '@/lib/data'

const shortName: Record<Facility['establishment'], string> = {
  'ROL-EMS Resort': 'Resort',
  'Rebar Sports Center': 'Rebar Sports',
}

export default function Facilities() {
  const [filter, setFilter] = useState<string>('All')
  const visible = filter === 'All' ? facilities : facilities.filter((item: Facility) => item.establishment === filter)

  return (
    <section data-reveal id="facilities" className="reveal bg-[#F3F0EC] px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Stay & play</p>
            <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-7xl">
              Choose your<br />kind of good time.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#6B756B]">Reserve a stay, a court, or simply join the next open game.</p>
        </div>
        <div className="my-12 flex gap-2 overflow-x-auto pb-2">
          {facilityFilters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap border px-4 py-2 text-[10px] uppercase tracking-[0.14em] ${filter === item ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]' : 'border-[#222222]/20 text-[#6B756B]'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => {
            const href = item.title === 'Cottage & Event' ? '/cottage' : item.title === 'Pickleball' ? '/pickleball' : null

            const card = (
              <article key={item.title} className="group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${item.image})` }} />
                  <span className="absolute left-4 top-4 bg-[#FDFBF7] px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-[#1E5336]">{item.status}</span>
                </div>
                <div className="pt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">{item.category}</p>
                    <span className="border border-[#1E5336]/20 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#6B756B]">{shortName[item.establishment]}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl text-[#1E5336]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#6B756B]">{item.detail}</p>
                  <div className="mt-5 flex justify-between border-t border-[#222222]/15 pt-4 text-sm">
                    <span>{item.price}</span>
                    <ArrowUpRight size={16} className="text-[#1E5336]" />
                  </div>
                </div>
              </article>
            )

            return href ? (
              <Link key={item.title} href={href} className="block w-full cursor-pointer text-left">
                {card}
              </Link>
            ) : (
              card
            )
          })}
        </div>
      </div>
    </section>
  )
}
