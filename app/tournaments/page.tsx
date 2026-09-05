'use client'

import Link from 'next/link'
import { tournaments } from '@/lib/data'
import { Trophy, Calendar, MapPin, Users, Tag, ChevronRight, TrendingUp } from 'lucide-react'

export default function TournamentsPage() {
  const publishedTournaments = tournaments.filter((t) => t.published)

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Header */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Events</p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Tournaments & Events</h1>
              <p className="mt-2 text-sm text-[#6B756B]">View official competitive pickleball tournaments and register teams.</p>
            </div>
            <Link
              href="/tournaments/bracket"
              className="inline-flex items-center gap-2 border border-[#1E5336] bg-[#1E5336] px-5 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition shrink-0"
            >
              <TrendingUp size={14} />
              View Tournament Bracket
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#1E5336]">Upcoming Events</h2>
          <span className="text-xs text-[#6B756B]">{publishedTournaments.length} Active Events</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {publishedTournaments.map((t) => {
            const isRegOpen = t.status === 'registration-open'
            const spotsLeft = t.maxTeams - t.registeredTeams

            return (
              <div key={t.id} className="border border-[#222222]/15 bg-[#FDFBF7] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728] font-bold">{t.type}</span>
                    <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em] font-bold ${
                      isRegOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F3F0EC] text-[#6B756B]'
                    }`}>
                      {isRegOpen ? 'REGISTRATION OPEN' : t.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl text-[#1E5336]">{t.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#6B756B]">{t.description}</p>

                  <div className="mt-6 border-t border-[#222222]/10 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-[#6B756B]">Date & Time</span><span className="font-bold text-[#222222]">{t.date} · {t.time}</span></div>
                    <div className="flex justify-between"><span className="text-[#6B756B]">Location</span><span>{t.location}</span></div>
                    <div className="flex justify-between"><span className="text-[#6B756B]">Registration Fee</span><span className="font-bold text-[#1E5336]">₱{t.registrationFee} / Team</span></div>
                    <div className="flex justify-between"><span className="text-[#6B756B]">Capacity</span><span>{t.registeredTeams} / {t.maxTeams} Teams ({spotsLeft} spots left)</span></div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#222222]/10 pt-4 flex gap-3">
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="flex-1 border border-[#1E5336] py-2.5 text-center text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7] transition"
                  >
                    View Details
                  </Link>
                  {isRegOpen && (
                    <Link
                      href={`/tournaments/${t.id}?action=register`}
                      className="flex-1 bg-[#E1A728] py-2.5 text-center text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336] hover:bg-[#c48e1a] transition"
                    >
                      Register Now
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
