'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePickleball } from '@/context/PickleballContext'
import { getPairDisplayName } from '@/lib/data'
import { Trophy, Calendar, MapPin, Users, Tag, ArrowLeft, CheckCircle, CircleCheck, AlertCircle } from 'lucide-react'

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const defaultRegistering = searchParams.get('action') === 'register'
  const { tournaments, addPairToTournament } = usePickleball()

  const tournament = tournaments.find((t) => t.id === resolvedParams.id) || tournaments[0]
  const pairs = tournament?.pairs || []
  const isTeamEvent = tournament?.format === 'team-event'

  const [isRegistering, setIsRegistering] = useState(defaultRegistering)
  const [pairName, setPairName] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isRegOpen = tournament.status === 'registration-open' || tournament.status === 'upcoming'

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1 || !player2) return

    addPairToTournament(tournament.id, player1, player2, pairName)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC]">
      {/* Header */}
      <div className="bg-[#1E5336] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/tournaments" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#E1A728] hover:underline mb-4">
            <ArrowLeft size={14} /> Back to Tournaments
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-[#E1A728]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E1A728]">
                  {tournament.type}
                </span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 uppercase rounded">
                  {isTeamEvent ? 'Team Event (Club)' : 'Pairing Tournament'}
                </span>
              </div>
              <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{tournament.name}</h1>
            </div>
            {isRegOpen && !isRegistering && (
              <button
                onClick={() => setIsRegistering(true)}
                className="rounded-xl bg-[#E1A728] px-6 py-3 text-sm font-bold text-[#111] hover:bg-[#c9901f] transition-all shrink-0"
              >
                {isTeamEvent ? 'Register Club Team' : 'Register Pair'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {submitted ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm max-w-lg mx-auto">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CircleCheck size={36} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1E5336]">
              {isTeamEvent ? 'Team Squad Registered!' : 'Pair Registered Successfully!'}
            </h2>
            <p className="mt-2 text-sm text-[#6B756B]">
              <strong>{pairName || `${player1} & ${player2}`}</strong> has been registered for {tournament.name}. Please pay the registration fee of ₱{tournament.registrationFee} at the venue prior to match start.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setSubmitted(false)} className="flex-1 rounded-xl border border-[#1E5336] py-2.5 text-sm font-bold text-[#1E5336]">
                Register Another Entry
              </button>
              <Link href="/tournaments/bracket" className="flex-1 rounded-xl bg-[#1E5336] py-2.5 text-center text-sm font-bold text-white">
                View Tournament Bracket
              </Link>
            </div>
          </div>
        ) : isRegistering ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm max-w-xl mx-auto sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#111]">
                {isTeamEvent ? 'Club Team Squad Registration' : 'Doubles Pair Registration Form'}
              </h2>
              <button onClick={() => setIsRegistering(false)} className="text-xs font-semibold text-[#6B756B] hover:underline">
                Cancel
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#6B756B]">
                  Team / Pair Name <span className="font-normal text-gray-400 lowercase">(optional - defaults to Player 1 & 2)</span>
                </label>
                <input
                  type="text"
                  value={pairName}
                  onChange={(e) => setPairName(e.target.value)}
                  placeholder="Optional e.g. Smash Duo"
                  className="mt-1 w-full rounded-xl border border-[rgba(17,17,17,0.15)] bg-[#F3F0EC] px-4 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#6B756B]">Player 1 Name *</label>
                <input
                  type="text"
                  required
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="mt-1 w-full rounded-xl border border-[rgba(17,17,17,0.15)] bg-[#F3F0EC] px-4 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#6B756B]">Player 2 Name *</label>
                <input
                  type="text"
                  required
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="e.g. Juan Rivera"
                  className="mt-1 w-full rounded-xl border border-[rgba(17,17,17,0.15)] bg-[#F3F0EC] px-4 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </div>

              <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800 space-y-1">
                <p className="font-bold">Entry Fee: ₱{tournament.registrationFee} per entry</p>
                <p>Registration deadline: {tournament.registrationDeadline}</p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1E5336] py-3 text-sm font-bold text-white hover:bg-[#153d27] transition-all"
              >
                Complete Registration
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Info Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-[#111]">About the Tournament</h2>
                <p className="mt-3 text-sm leading-7 text-[#444]">{tournament.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[rgba(17,17,17,0.08)] pt-6 text-sm">
                  <div>
                    <span className="text-xs text-[#6B756B]">Date & Time</span>
                    <p className="font-semibold text-[#111]">{tournament.date} at {tournament.time}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B756B]">Location</span>
                    <p className="font-semibold text-[#111]">{tournament.location}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B756B]">Registration Fee</span>
                    <p className="font-semibold text-[#1E5336]">₱{tournament.registrationFee} / entry</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B756B]">Registration Deadline</span>
                    <p className="font-semibold text-[#111]">{tournament.registrationDeadline}</p>
                  </div>
                </div>
              </div>

              {/* Registered Entries */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#111] mb-4">
                  Registered {isTeamEvent ? 'Teams' : 'Pairs'} ({pairs.length}/{tournament.maxTeams})
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {pairs.map((p, idx) => {
                    const label = getPairDisplayName(p)

                    return (
                      <div key={p.id} className="flex items-center justify-between rounded-xl bg-[#F3F0EC]/60 p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1E5336]">#{idx + 1}</span>
                          <div>
                            <p className="font-bold text-[#111]">{label}</p>
                            <p className="text-[#6B756B]">{p.player1} & {p.player2}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Side Card */}
            <div>
              <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4 sticky top-20">
                <h3 className="font-bold text-[#111]">Event Overview</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[rgba(17,17,17,0.06)]">
                    <span className="text-[#6B756B]">Format</span>
                    <span className="font-bold text-[#111]">{isTeamEvent ? 'Team Event Tournament' : 'Pairing Tournament'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[rgba(17,17,17,0.06)]">
                    <span className="text-[#6B756B]">Courts Assigned</span>
                    <span className="font-bold text-[#111]">Court 1, 2, 3</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[rgba(17,17,17,0.06)]">
                    <span className="text-[#6B756B]">Max Capacity</span>
                    <span className="font-bold text-[#111]">{tournament.maxTeams} Entries</span>
                  </div>
                </div>

                <Link
                  href="/tournaments/bracket"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E5336] py-3 text-sm font-bold text-white hover:bg-[#153d27] transition-all"
                >
                  View Tournament Bracket
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
