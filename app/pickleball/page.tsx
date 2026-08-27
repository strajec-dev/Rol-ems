'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PickleballBookingForm from '@/components/booking/pickleball-form'

export default function PickleballPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#F3F0EC] text-[#222222]">
      <header className="border-b border-[#222222]/10 bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <a href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
            ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          </a>
          <a href="/" className="border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336]">
            Back to home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
        <button
          onClick={() => router.push('/#facilities')}
          className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]"
        >
          <ArrowLeft size={14} /> Back to Stay & play
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball</p>
        <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-6xl">
          Book a court, hit the open line.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#6B756B]">
          Reserve a pickleball court by the hour, or join the live open play queue at Rebar.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-16">
        <PickleballBookingForm onDone={() => router.push('/#facilities')} />
      </section>
    </main>
  )
}
