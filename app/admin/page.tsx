'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import type { BookingRecord } from '@/lib/bookings'

type Tab = 'upcoming' | 'today' | 'pending' | 'all'

const statusStyle: Record<string, string> = {
  confirmed: 'bg-[#1E5336] text-[#FDFBF7]',
  pending: 'bg-[#E1A728] text-[#1E5336]',
  completed: 'bg-[#222222]/10 text-[#6B756B]',
  expired: 'bg-[#222222]/10 text-[#6B756B]',
  cancelled: 'bg-[#222222]/10 text-[#6B756B]',
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'today', label: 'Today' },
  { key: 'pending', label: 'Needs attention' },
  { key: 'all', label: 'All' },
]

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    setBookings(null)
    try {
      const res = await fetch('/api/bookings', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setBookings([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const todayIso = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const setStatus = async (reference: string, status: string) => {
    setBusy(reference)
    try {
      await fetch(`/api/bookings/${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await load()
    } finally {
      setBusy(null)
    }
  }

  const filtered = useMemo(() => {
    const rows = bookings || []
    switch (tab) {
      case 'pending':
        return rows.filter((b) => b.status === 'pending')
      case 'today':
        return rows.filter((b) => b.date === todayIso)
      case 'upcoming':
        return rows.filter((b) => b.date >= todayIso && b.status !== 'expired' && b.status !== 'cancelled')
      default:
        return rows
    }
  }, [bookings, tab, todayIso])

  return (
    <main className="min-h-screen bg-[#F3F0EC] text-[#222222]">
      <header className="border-b border-[#222222]/10 bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <p className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
            ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          </p>
          <a href="/" className="flex items-center gap-2 border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336]">
            <ArrowLeft size={14} /> Back to home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Staff · Bookings</p>
            <h1 className="mt-3 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#1E5336]">
              Reservations.
            </h1>
          </div>
          <button onClick={load} className="flex items-center gap-2 border border-[#1E5336]/30 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]">
            <RefreshCw size={14} className={bookings ? '' : 'animate-spin'} /> Refresh
          </button>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap border px-4 py-2 text-[10px] uppercase tracking-[0.14em] ${tab === t.key ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]' : 'border-[#222222]/20 text-[#6B756B]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {bookings === null ? (
          <p className="mt-10 text-sm text-[#6B756B]">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-10 border border-[#222222]/15 bg-[#FDFBF7] p-6 text-sm text-[#6B756B]">No bookings here yet.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((b) => (
              <div key={b.reference} className="flex flex-wrap items-center justify-between gap-4 border border-[#222222]/15 bg-[#FDFBF7] p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#1E5336]">{b.reference}</span>
                    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] ${statusStyle[b.status] || statusStyle.pending}`}>{b.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#222222]">{b.itemName}</p>
                  <p className="mt-0.5 text-[11px] text-[#6B756B]">
                    {b.date} · {b.time} · {b.guests} guest{b.guests > 1 ? 's' : ''} · {b.name || '—'} {b.contact ? `· ${b.contact}` : ''} · {b.payment === 'online' ? 'Online' : 'Cash'} · ₱{b.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => setStatus(b.reference, 'confirmed')} disabled={busy === b.reference} className="border border-[#1E5336] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]">
                        Confirm
                      </button>
                      <button onClick={() => setStatus(b.reference, 'expired')} disabled={busy === b.reference} className="border border-[#222222]/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#6B756B] hover:border-red-600 hover:text-red-600">
                        Expire
                      </button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => setStatus(b.reference, 'completed')} disabled={busy === b.reference} className="border border-[#1E5336] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]">
                      Completed
                    </button>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed' || b.status === 'completed') && (
                    <button onClick={() => setStatus(b.reference, 'cancelled')} disabled={busy === b.reference} className="border border-[#222222]/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#6B756B] hover:border-red-600 hover:text-red-600">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}