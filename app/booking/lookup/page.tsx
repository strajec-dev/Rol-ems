'use client'

import { useState } from 'react'
import { ArrowLeft, Search, SearchX } from 'lucide-react'
import type { BookingRecord } from '@/lib/bookings'

const statusStyle: Record<string, string> = {
  confirmed: 'bg-[#1E5336] text-[#FDFBF7]',
  pending: 'bg-[#E1A728] text-[#1E5336]',
  completed: 'bg-[#222222]/10 text-[#6B756B]',
  expired: 'bg-[#222222]/10 text-[#6B756B]',
  cancelled: 'bg-[#222222]/10 text-[#6B756B]',
}

export default function BookingLookupPage() {
  const [reference, setReference] = useState('')
  const [booking, setBooking] = useState<BookingRecord | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'notfound' | 'error'>('idle')

  const search = async () => {
    const ref = reference.trim()
    if (!ref) return
    setState('loading')
    setBooking(null)
    try {
      const res = await fetch(`/api/bookings?reference=${encodeURIComponent(ref)}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const found = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (found) {
        setBooking(found)
        setState('found')
      } else {
        setState('notfound')
      }
    } catch {
      setState('error')
    }
  }

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
        <a href="/#facilities" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]">
          <ArrowLeft size={14} /> Back to Stay & play
        </a>
        <p className="mt-8 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Booking lookup</p>
        <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#1E5336]">
          Check your reservation.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#6B756B]">
          Enter the reference from your confirmation (e.g. ROL-123456) to see the details and status of your booking.
        </p>

        <div className="mt-8 flex gap-2">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="e.g. ROL-123456"
            className="w-full border border-[#222222]/20 bg-[#FDFBF7] px-4 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-[#6B756B]/50 focus:border-[#1E5336]"
          />
          <button
            onClick={search}
            disabled={state === 'loading' || !reference.trim()}
            className="flex items-center gap-2 bg-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] disabled:cursor-not-allowed disabled:bg-[#222222]/10 disabled:text-[#6B756B]"
          >
            {state === 'loading' ? 'Checking…' : (<><Search size={14} /> Look up</>)}
          </button>
        </div>

        <div className="mt-8">
          {state === 'notfound' && (
            <div className="flex flex-col items-start gap-2 border border-[#222222]/15 bg-[#FDFBF7] p-6 text-sm">
              <span className="flex items-center gap-2 font-bold text-[#222222]"><SearchX size={16} className="text-red-600" /> No booking found</span>
              <span className="text-[#6B756B]">Double-check the reference you entered. It should look like ROL-123456.</span>
            </div>
          )}
          {state === 'error' && (
            <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 text-sm text-red-600">Something went wrong. Please try again.</div>
          )}
          {booking && (
            <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Reference</span>
                <span className={`px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${statusStyle[booking.status] || statusStyle.pending}`}>{booking.status}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Booking</span><span className="text-right">{booking.itemName}</span></div>
              <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Date & time</span><span>{booking.date} · {booking.time}</span></div>
              {booking.nights ? (
                <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Nights</span><span>{booking.nights}</span></div>
              ) : booking.hours ? (
                <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Hours</span><span>{booking.hours}</span></div>
              ) : null}
              <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Guests</span><span>{booking.guests}</span></div>
              <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Guest</span><span>{booking.name || '—'}</span></div>
              <div className="flex justify-between border-t border-[#222222]/10 pt-2"><span className="text-[#6B756B]">Total</span><span className="font-bold text-[#1E5336]">₱{booking.amount.toLocaleString()}</span></div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}