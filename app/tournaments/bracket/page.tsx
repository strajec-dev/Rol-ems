'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { BracketMatch } from '@/lib/data'
import { Trophy, ArrowLeft, Award, Clock, MapPin, Users, Disc, Shield } from 'lucide-react'

export default function TournamentBracketPage() {
  const { tournaments, bracketMatches } = usePickleball()
  const activeTournament = tournaments[0] || tournaments[0]
  const isTeamEvent = activeTournament?.format === 'team-event'

  const matches = bracketMatches.filter((m) => !m.tournamentId || m.tournamentId === activeTournament?.id)

  const qfMatches = matches.filter((m) => m.round === 'QF' || m.round === 'R1')
  const sfMatches = matches.filter((m) => m.round === 'SF')
  const finalMatch = matches.find((m) => m.round === 'Final')

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Header */}
      <div className="bg-[#1E5336] px-4 py-10 sm:px-6 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#E1A728] hover:underline mb-4"
          >
            <ArrowLeft size={14} /> Tournaments Overview
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E1A728]">
                  Official Live Bracket
                </span>
                <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 uppercase rounded">
                  {isTeamEvent ? 'Team Event (Club)' : 'Pairing Tournament'}
                </span>
              </div>
              <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
                {activeTournament?.name}
              </h1>
              <p className="mt-1 text-sm text-white/70">
                {isTeamEvent ? 'Club Squads Tournament · Live Scores & Standings' : 'Pairing Knockout Stage · Live Scores & Court Schedules'}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white border border-white/20">
              <Trophy size={16} className="text-[#E1A728]" />
              <span>{activeTournament?.registeredTeams || 8} {isTeamEvent ? 'Teams' : 'Pairs'} Registered · ₱{activeTournament?.registrationFee || 500} Fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Canvas Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-[#FDFBF7] p-4 border border-[#222222]/15 shadow-sm">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-blue-800">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" /> Live / In Progress
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Scheduled
            </span>
          </div>
          <span className="text-xs text-[#6B756B]">Scroll horizontally to view all rounds →</span>
        </div>

        {/* Live Champion Banner */}
        {activeTournament?.championPairName && (
          <div className="mb-8 border-2 border-[#E1A728] bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 p-6 text-center shadow-md rounded-2xl">
            <Award size={44} className="mx-auto text-[#E1A728] mb-1 animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8850f] block">
              2026 Pickleball Champion
            </span>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[#111]">{activeTournament.championPairName}</h2>
            <p className="mt-1 text-xs font-semibold text-[#555]">
              Players: {activeTournament.championPlayers?.join(' & ') || 'Maria Santos & Juan Rivera'}
            </p>
          </div>
        )}

        <div className="overflow-x-auto pb-8 pt-4">
          <div className="min-w-[950px] flex items-start justify-between gap-8 px-2">
            {/* QUARTERFINALS */}
            <div className="flex-1 space-y-6">
              <h3 className="text-center text-xs font-bold uppercase tracking-wider text-[#1E5336] bg-white py-2.5 rounded-lg border border-[rgba(17,17,17,0.08)] shadow-sm">
                Quarterfinals ({isTeamEvent ? 'Team vs. Team' : 'Pair vs. Pair'})
              </h3>
              <div className="space-y-6">
                {qfMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>

            {/* SEMIFINALS */}
            <div className="flex-1 space-y-6">
              <h3 className="text-center text-xs font-bold uppercase tracking-wider text-[#1E5336] bg-white py-2.5 rounded-lg border border-[rgba(17,17,17,0.08)] shadow-sm">
                Semifinals
              </h3>
              <div className="space-y-16 py-8">
                {sfMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>

            {/* FINALS & CHAMPION */}
            <div className="flex-1 space-y-6">
              <h3 className="text-center text-xs font-bold uppercase tracking-wider text-[#E1A728] bg-[#1E5336] text-white py-2.5 rounded-lg shadow-sm">
                Finals
              </h3>
              <div className="py-16 space-y-8">
                {finalMatch && <MatchCard match={finalMatch} isFinal />}
                {!activeTournament?.championPairName && (
                  <div className="rounded-2xl border-2 border-dashed border-[#E1A728] bg-amber-50/50 p-5 text-center shadow-sm">
                    <Award size={32} className="mx-auto text-[#E1A728]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8850f] block mt-1">
                      Tournament Champion
                    </span>
                    <p className="mt-1 font-serif text-lg font-bold text-[#111]">TBD</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, isFinal }: { match: BracketMatch; isFinal?: boolean }) {
  const isCompleted = match.status === 'completed'
  const isInProgress = match.status === 'in-progress'

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white border-2 shadow-sm transition-all ${
        isInProgress
          ? 'border-blue-400 ring-2 ring-blue-100'
          : isFinal
          ? 'border-[#E1A728]'
          : 'border-[rgba(17,17,17,0.1)]'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between bg-[#F3F0EC]/80 px-3.5 py-2 text-[10px] font-semibold text-[#6B756B] border-b border-[#222222]/5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#1E5336]">Match #{match.matchNumber}</span>
          {match.court && <span>· {match.court}</span>}
          {match.time && <span>· {match.time}</span>}
        </div>
        <span
          className={`rounded-full px-2 py-0.2 font-bold uppercase ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800'
              : isInProgress
              ? 'bg-blue-100 text-blue-800'
              : 'bg-stone-200 text-stone-700'
          }`}
        >
          {isCompleted ? 'Finished' : isInProgress ? 'Live' : 'Scheduled'}
        </span>
      </div>

      {/* Team / Pair Details */}
      <div className="p-3.5 space-y-2.5 text-xs">
        {/* Team 1 */}
        <div
          className={`rounded-lg p-2.5 transition ${
            match.winner === match.team1
              ? 'bg-emerald-50 border border-emerald-200 font-bold text-[#1E5336]'
              : 'bg-stone-50/60 text-[#444]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#1E5336]">{match.team1}</span>
            <span className="font-mono text-base font-bold">{match.score1 ?? '-'}</span>
          </div>
          {match.team1Players && match.team1Players.length > 0 && (
            <p className="text-[10px] text-[#6B756B] mt-0.5 font-normal">
              Players: {match.team1Players.join(' & ')}
            </p>
          )}
        </div>

        <div className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-widest my-1">
          VS
        </div>

        {/* Team 2 */}
        <div
          className={`rounded-lg p-2.5 transition ${
            match.winner === match.team2
              ? 'bg-emerald-50 border border-emerald-200 font-bold text-[#1E5336]'
              : 'bg-stone-50/60 text-[#444]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#1E5336]">{match.team2}</span>
            <span className="font-mono text-base font-bold">{match.score2 ?? '-'}</span>
          </div>
          {match.team2Players && match.team2Players.length > 0 && (
            <p className="text-[10px] text-[#6B756B] mt-0.5 font-normal">
              Players: {match.team2Players.join(' & ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
