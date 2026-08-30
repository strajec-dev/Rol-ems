'use client'

import { useState } from 'react'
import { ArrowUpRight, Clock3, Trophy } from 'lucide-react'
import { queues, queueOrder } from '@/lib/data'

export default function Queue() {
  const [active, setActive] = useState<string>('Pickleball')
  const [joined, setJoined] = useState(false)
  const current = queues[active]

  return (
    <section data-reveal id="queue" className="reveal bg-[#1E5336] px-6 py-24 text-[#FDFBF7] lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Live at Rebar</p>
            <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.05em] sm:text-7xl">
              The next game<br />starts here.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#FDFBF7]/65">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#E1A728]" /> Updated just now
          </div>
        </div>
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="flex gap-2 border-b border-[#FDFBF7]/20 pb-5">
              {queueOrder.map((tab) => (
                <button key={tab} onClick={() => setActive(tab)} className={`px-3 py-2 text-xs ${active === tab ? 'bg-[#E1A728] text-[#1E5336]' : 'text-[#FDFBF7]/60'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-6 border border-[#FDFBF7]/20 p-6 sm:p-8">
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">{current[0]} · In play</p>
                  <p className="mt-4 font-serif text-2xl">{current[1]}</p>
                </div>
                <Trophy className="text-[#E1A728]" size={21} />
              </div>
              <div className="mt-10 flex items-end justify-between border-t border-[#FDFBF7]/15 pt-6">
                <p className="text-6xl font-light tracking-[-0.06em] text-[#E1A728]">{current[2]}</p>
                <span className="text-xs uppercase tracking-[0.14em] text-[#FDFBF7]/55">Live score</span>
              </div>
            </div>
          </div>
          <div className="border-t border-[#FDFBF7]/20 pt-6 lg:border-l lg:border-t-0 lg:pl-12">
            <div className="flex justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-[#E1A728]">Waiting queue</p>
              <Clock3 size={17} />
            </div>
            <p className="mt-8 font-serif text-6xl">{current[3]}</p>
            <p className="mt-2 text-sm text-[#FDFBF7]/60">estimated wait</p>
            <button onClick={() => setJoined(!joined)} className="mt-10 w-full border border-[#E1A728] px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728] hover:bg-[#E1A728] hover:text-[#1E5336]">
              {joined ? 'You are on the list' : 'Join the queue'} <ArrowUpRight size={15} className="ml-2 inline" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
