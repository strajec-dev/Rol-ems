'use client'

import Link from 'next/link'
import { courts, openPlaySessions, tournaments } from '@/lib/data'
import { CalendarCheck, Users, Trophy, ChevronRight, Clock } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const statusConfig = {
  available: { label: 'AVAILABLE', badge: 'badge-available' },
  reserved: { label: 'RESERVED', badge: 'badge-reserved' },
  occupied: { label: 'IN USE / OCCUPIED', badge: 'badge-occupied' },
  'open-play': { label: 'OPEN PLAY', badge: 'badge-open-play' },
}

export default function PickleballHub() {
  const availableCourts = courts.filter((c) => c.status === 'available').length
  const activeSessions = openPlaySessions.filter((s) => s.status === 'open' || s.status === 'full').length
  const totalQueue = openPlaySessions.reduce((sum, s) => sum + s.queue.length, 0)
  const upcomingTournaments = tournaments.filter((t) => t.published && t.status !== 'completed').length

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222]">
      <Navbar />
      {/* ── HERO BANNER ────────────────────────────────────────────────────── */}
      <section className="border-b border-[#222222]/10 bg-[#FDFBF7] px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Sports Center</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-6xl lg:text-7xl">
            Book a court,<br />hit the open line.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#6B756B]">
            Reserve a pickleball court by the hour, check live availability, join open play sessions, or enter upcoming tournaments at ROL-EMS Resort.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="flex items-center gap-2 bg-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] transition hover:bg-[#153d27]"
            >
              <CalendarCheck size={14} />
              Book a Court
            </Link>
            <Link
              href="/open-play"
              className="flex items-center gap-2 border border-[#222222]/20 bg-transparent px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#222222] transition hover:border-[#1E5336] hover:text-[#1E5336]"
            >
              <Users size={14} />
              Join Open Play
            </Link>
            <Link
              href="/tournaments"
              className="flex items-center gap-2 border border-[#222222]/20 bg-transparent px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#222222] transition hover:border-[#1E5336] hover:text-[#1E5336]"
            >
              <Trophy size={14} />
              Tournaments
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="mt-12 grid grid-cols-2 gap-4 divide-x divide-[#222222]/10 border-t border-[#222222]/10 pt-6 sm:grid-cols-4">
            <div className="pr-4">
              <p className="font-serif text-3xl text-[#1E5336]">{availableCourts} / 3</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Available Courts</p>
            </div>
            <div className="px-4">
              <p className="font-serif text-3xl text-[#1E5336]">{activeSessions}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Open Play Sessions</p>
            </div>
            <div className="px-4">
              <p className="font-serif text-3xl text-[#E1A728]">{totalQueue}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Players in Queue</p>
            </div>
            <div className="pl-4">
              <p className="font-serif text-3xl text-[#1E5336]">{upcomingTournaments}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Tournaments</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT SECTIONS ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* 1. COURTS OVERVIEW */}
        <section className="mb-14">
          <div className="mb-6 flex items-baseline justify-between border-b border-[#222222]/10 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Facility Status</p>
              <h2 className="font-serif text-3xl text-[#1E5336]">Court Availability</h2>
            </div>
            <Link href="/booking" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[#1E5336] hover:underline">
              View All Slots <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {courts.map((court) => {
              const cfg = statusConfig[court.status]
              return (
                <div
                  key={court.id}
                  className="border border-[#222222]/15 bg-[#FDFBF7] p-6 transition hover:border-[#1E5336]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-2xl text-[#1E5336]">{court.name}</p>
                    <span className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] font-bold ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#6B756B]">{court.detail}</p>

                  {court.currentReservation && (
                    <div className="mt-4 border-l-2 border-[#E1A728] bg-[#F3F0EC] p-3 text-xs">
                      <p className="font-bold text-[#1E5336]">{court.currentReservation.name}</p>
                      <p className="text-[11px] text-[#6B756B]">{court.currentReservation.time} – {court.currentReservation.endTime}</p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t border-[#222222]/10 pt-4">
                    <span className="text-sm font-bold text-[#1E5336]">{court.price}</span>
                    <Link
                      href="/booking"
                      className="border border-[#1E5336] px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7] transition"
                    >
                      Reserve
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 2. OPEN PLAY SESSIONS */}
        <section className="mb-14">
          <div className="mb-6 flex items-baseline justify-between border-b border-[#222222]/10 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Shared Playing Sessions</p>
              <h2 className="font-serif text-3xl text-[#1E5336]">Pickleball Open Play</h2>
            </div>
            <Link href="/open-play" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[#1E5336] hover:underline">
              Open Play Queues <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {openPlaySessions.map((session) => {
              const filled = session.players.length
              const isFull = session.status === 'full'

              return (
                <div key={session.id} className="border border-[#222222]/15 bg-[#FDFBF7] p-6">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em] font-bold ${isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isFull ? 'SESSION FULL — JOIN QUEUE' : 'OPEN FOR PLAYERS'}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-2xl text-[#1E5336]">{session.court}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#6B756B]">
                    <Clock size={12} /> {session.startTime} – {session.endTime}
                  </p>

                  <div className="mt-4 border-t border-[#222222]/10 pt-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[#6B756B]">Players Capacity</span>
                      <span className="font-bold text-[#1E5336]">{filled} / {session.maxPlayers}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F3F0EC]">
                      <div className="h-full bg-[#1E5336]" style={{ width: `${(filled / session.maxPlayers) * 100}%` }} />
                    </div>
                    {session.queue.length > 0 && (
                      <p className="mt-2 text-xs font-bold text-[#E1A728]">{session.queue.length} waiting in queue</p>
                    )}
                  </div>

                  <Link
                    href="/open-play"
                    className={`mt-6 flex w-full items-center justify-center gap-2 py-2.5 text-[10px] uppercase tracking-[0.16em] transition ${
                      isFull
                        ? 'border border-[#E1A728] bg-[#E1A728]/10 text-[#222222] hover:bg-[#E1A728] hover:text-[#1E5336]'
                        : 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]'
                    }`}
                  >
                    {isFull ? 'Join Queue' : 'Join Open Play'}
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. TOURNAMENTS PREVIEW */}
        <section className="border border-[#222222]/15 bg-[#FDFBF7] p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Competitive Events</p>
              <h2 className="mt-2 font-serif text-4xl text-[#1E5336]">Pickleball Summer Smash 2026</h2>
              <p className="mt-2 max-w-xl text-sm text-[#6B756B]">
                Open Category · 32 Teams · Single Elimination · Registration Fee: ₱500 / Team. Compete for trophies, medals, and sponsor prizes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tournaments"
                className="bg-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] hover:bg-[#153d27] transition"
              >
                View Tournament
              </Link>
              <Link
                href="/tournaments/bracket"
                className="border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7] transition"
              >
                View Bracket
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}