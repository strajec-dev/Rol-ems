'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { Tournament, BracketMatch, TournamentPair, TournamentFormat, getPairDisplayName } from '@/lib/data'
import { Trophy, Plus, ArrowLeft, Calendar, MapPin, Edit, Award, UserPlus, Users, Play, CheckCircle2, Shield, Zap, Sparkles, Layers } from 'lucide-react'

export default function AdminTournamentsPage() {
  const {
    tournaments,
    bracketMatches,
    createTournament,
    addPairToTournament,
    updatePair,
    removePairFromTournament,
    updateMatchTeams,
    updateMatchScore,
    updateMatchSchedule,
    generateBracketFromPairs,
    declareChampion,
  } = usePickleball()

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('tourn-001')
  const [activeTab, setActiveTab] = useState<'pairs' | 'bracket' | 'create'>('bracket')

  // Add Pair / Team Modal
  const [isAddPairModalOpen, setIsAddPairModalOpen] = useState(false)
  const [pairName, setPairName] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [extraPlayersText, setExtraPlayersText] = useState('')

  // Edit / Customize Pair Modal
  const [editingPair, setEditingPair] = useState<TournamentPair | null>(null)
  const [editPairName, setEditPairName] = useState('')
  const [editPlayer1, setEditPlayer1] = useState('')
  const [editPlayer2, setEditPlayer2] = useState('')
  const [editExtraPlayersText, setEditExtraPlayersText] = useState('')
  const [editSeed, setEditSeed] = useState<number>(1)

  // Edit Match Teams Modal (Bracket direct customization)
  const [customizingMatch, setCustomizingMatch] = useState<BracketMatch | null>(null)
  const [matchTeam1, setMatchTeam1] = useState('')
  const [matchTeam2, setMatchTeam2] = useState('')
  const [matchTeam1P1, setMatchTeam1P1] = useState('')
  const [matchTeam1P2, setMatchTeam1P2] = useState('')
  const [matchTeam2P1, setMatchTeam2P1] = useState('')
  const [matchTeam2P2, setMatchTeam2P2] = useState('')

  // Score Entry Modal
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null)
  const [score1, setScore1] = useState<number>(0)
  const [score2, setScore2] = useState<number>(0)
  const [winnerName, setWinnerName] = useState<string>('')

  // Match Schedule Modal
  const [schedulingMatch, setSchedulingMatch] = useState<BracketMatch | null>(null)
  const [scheduleCourt, setScheduleCourt] = useState('Court 1')
  const [scheduleDate, setScheduleDate] = useState('2026-08-30')
  const [scheduleTime, setScheduleTime] = useState('8:00 AM')

  // Create Tournament Form
  const [newTournName, setNewTournName] = useState('')
  const [newTournFormat, setNewTournFormat] = useState<TournamentFormat>('pairing')
  const [newTournType, setNewTournType] = useState('Open Category')
  const [newTournDate, setNewTournDate] = useState('2026-09-01')
  const [newTournFee, setNewTournFee] = useState(500)
  const [newTournLocation, setNewTournLocation] = useState('ROL-EMS Resort – Courts 1 & 2')

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0]
  const currentMatches = bracketMatches.filter((m) => !m.tournamentId || m.tournamentId === currentTournament?.id)
  const isTeamEvent = currentTournament?.format === 'team-event'

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1.trim() || !player2.trim()) return

    const extras = extraPlayersText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    addPairToTournament(currentTournament.id, player1, player2, pairName, extras)
    setPairName('')
    setPlayer1('')
    setPlayer2('')
    setExtraPlayersText('')
    setIsAddPairModalOpen(false)
  }

  const handleOpenEditPair = (pair: TournamentPair) => {
    setEditingPair(pair)
    setEditPairName(pair.pairName || '')
    setEditPlayer1(pair.player1)
    setEditPlayer2(pair.player2)
    setEditExtraPlayersText((pair.extraPlayers || []).join(', '))
    setEditSeed(pair.seed || 1)
  }

  const handleSavePairEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPair || !editPlayer1.trim() || !editPlayer2.trim()) return

    const extras = editExtraPlayersText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    updatePair(currentTournament.id, editingPair.id, editPlayer1, editPlayer2, editPairName, editSeed, extras)
    setEditingPair(null)
  }

  const handleOpenCustomizeMatch = (match: BracketMatch) => {
    setCustomizingMatch(match)
    setMatchTeam1(match.team1)
    setMatchTeam2(match.team2)
    setMatchTeam1P1(match.team1Players?.[0] || '')
    setMatchTeam1P2(match.team1Players?.[1] || '')
    setMatchTeam2P1(match.team2Players?.[0] || '')
    setMatchTeam2P2(match.team2Players?.[1] || '')
  }

  const handleSaveCustomizedMatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customizingMatch) return

    updateMatchTeams(
      customizingMatch.id,
      matchTeam1,
      matchTeam2,
      [matchTeam1P1, matchTeam1P2].filter(Boolean),
      [matchTeam2P1, matchTeam2P2].filter(Boolean)
    )
    setCustomizingMatch(null)
  }

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatch || !winnerName) return

    updateMatchScore(selectedMatch.id, score1, score2, winnerName)
    setSelectedMatch(null)
  }

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedulingMatch) return

    updateMatchSchedule(schedulingMatch.id, scheduleCourt, scheduleDate, scheduleTime)
    setSchedulingMatch(null)
  }

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTournName.trim()) return

    const t = createTournament({
      name: newTournName,
      type: newTournType,
      format: newTournFormat,
      date: newTournDate,
      time: '8:00 AM',
      location: newTournLocation,
      registrationFee: newTournFee,
      maxTeams: 8,
      registrationDeadline: newTournDate,
      status: 'registration-open',
      description:
        newTournFormat === 'team-event'
          ? 'Official Team Event Tournament (Club Squads) at ROL-EMS Resort.'
          : 'Official Pairing Tournament (2-Player Pairs) at ROL-EMS Resort.',
      bannerColor: newTournFormat === 'team-event' ? '#E1A728' : '#1E5336',
      published: true,
    })

    setSelectedTournamentId(t.id)
    setActiveTab('pairs')
    setNewTournName('')
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Tournament Control Center</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">
                {isTeamEvent ? 'Team Event Tournament Admin' : 'Pairing Tournament Admin'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/tournaments/bracket"
                className="bg-[#E1A728] text-black font-bold px-4 py-2 text-xs uppercase tracking-wider hover:bg-amber-400 transition"
              >
                View Live Player Bracket →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tournament Selector & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-[#FDFBF7] p-4 border border-[#222222]/15 shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy className="text-[#1E5336]" size={24} />
            <div>
              <span className="text-[10px] text-[#6B756B] uppercase font-bold">Selected Tournament</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="block font-serif text-xl text-[#1E5336] bg-transparent border-b border-[#1E5336] focus:outline-none cursor-pointer"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.format === 'team-event' ? 'Team Event' : 'Pairing'})
                    </option>
                  ))}
                </select>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                  isTeamEvent ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {isTeamEvent ? 'Team Event (Club)' : 'Pairing (Doubles)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generateBracketFromPairs(currentTournament.id)}
              className="bg-[#1E5336] text-white font-bold px-3 py-2 text-xs uppercase tracking-wider hover:bg-[#153b26] transition flex items-center gap-1.5 shadow-sm"
              title="Build bracket matches automatically using all registered teams/pairs"
            >
              <Zap size={14} className="text-[#E1A728]" /> Generate Bracket Matchups
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                activeTab === 'bracket' ? 'bg-[#1E5336] text-white' : 'bg-stone-200 text-[#222222]'
              }`}
            >
              Bracket & Scores
            </button>
            <button
              onClick={() => setActiveTab('pairs')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                activeTab === 'pairs' ? 'bg-[#1E5336] text-white' : 'bg-stone-200 text-[#222222]'
              }`}
            >
              {isTeamEvent ? 'Team / Squad Management' : 'Pair & Player Management'}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                activeTab === 'create' ? 'bg-[#1E5336] text-white' : 'bg-stone-200 text-[#222222]'
              }`}
            >
              + Create Tournament
            </button>
          </div>
        </div>

        {/* BRACKET TAB */}
        {activeTab === 'bracket' && (
          <div className="space-y-6">
            {/* Champion Banner if declared */}
            {currentTournament?.championPairName && (
              <div className="bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border-2 border-[#E1A728] p-6 text-center shadow-md rounded-xl">
                <Award size={40} className="mx-auto text-[#E1A728] mb-1 animate-bounce" />
                <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#b8850f]">Tournament Champion Declared!</p>
                <h2 className="font-serif text-3xl font-bold text-[#111] mt-1">{currentTournament.championPairName}</h2>
                <p className="text-xs text-[#555] mt-1 font-semibold">
                  Players: {currentTournament.championPlayers?.join(' & ') || 'Maria Santos & Juan Rivera'}
                </p>
              </div>
            )}

            <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-[#1E5336]">Matchups & Bracket Control</h2>
                  <p className="text-xs text-[#6B756B]">
                    {isTeamEvent ? 'Schedule club matches, customize squad names, and enter tie scores.' : 'Schedule pairing matches, customize team/player names, and enter scores.'}
                  </p>
                </div>
              </div>

              {/* Match Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3">Match #</th>
                      <th className="p-3">Round</th>
                      <th className="p-3">{isTeamEvent ? 'Club Team 1 vs. Club Team 2' : 'Pair 1 vs. Pair 2 (Players)'}</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Court / Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]/10">
                    {currentMatches.map((m) => (
                      <tr key={m.id} className="hover:bg-amber-50/30">
                        <td className="p-3 font-mono font-bold text-[#1E5336]">Match #{m.matchNumber}</td>
                        <td className="p-3 font-bold text-[#222222]">{m.round}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className={`flex items-center gap-2 ${m.winner === m.team1 ? 'font-bold text-[#1E5336]' : ''}`}>
                              <span>{m.team1}</span>
                              {m.team1Players && m.team1Players.length > 0 && (
                                <span className="text-[10px] text-[#6B756B]">({m.team1Players.join(' & ')})</span>
                              )}
                              {m.winner === m.team1 && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Winner ✓</span>}
                            </div>
                            <div className="text-[10px] text-gray-400">vs</div>
                            <div className={`flex items-center gap-2 ${m.winner === m.team2 ? 'font-bold text-[#1E5336]' : ''}`}>
                              <span>{m.team2}</span>
                              {m.team2Players && m.team2Players.length > 0 && (
                                <span className="text-[10px] text-[#6B756B]">({m.team2Players.join(' & ')})</span>
                              )}
                              {m.winner === m.team2 && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Winner ✓</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-sm text-[#1E5336]">
                          {m.score1 !== undefined ? `${m.score1} – ${m.score2}` : '—'}
                        </td>
                        <td className="p-3 text-[#6B756B]">
                          <span className="font-bold text-[#222222] block">{m.court || 'Court Unassigned'}</span>
                          {m.date && m.time ? `${m.date} · ${m.time}` : 'TBD'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            m.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenCustomizeMatch(m)}
                            className="border border-[#1E5336] text-[#1E5336] px-2 py-1 text-[10px] font-bold uppercase hover:bg-[#1E5336] hover:text-white transition"
                            title="Edit names directly for this match"
                          >
                            Edit Names
                          </button>
                          <button
                            onClick={() => {
                              setSchedulingMatch(m)
                              setScheduleCourt(m.court || 'Court 1')
                              setScheduleDate(m.date || '2026-08-30')
                              setScheduleTime(m.time || '8:00 AM')
                            }}
                            className="border border-[#222222]/20 px-2 py-1 text-[10px] font-bold uppercase hover:bg-stone-100"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMatch(m)
                              setScore1(m.score1 || 0)
                              setScore2(m.score2 || 0)
                              setWinnerName(m.winner || m.team1)
                            }}
                            className="bg-[#1E5336] text-white px-2.5 py-1 text-[10px] font-bold uppercase hover:bg-[#153b26]"
                          >
                            Enter Score
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAIRS / TEAMS MANAGEMENT TAB */}
        {activeTab === 'pairs' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl text-[#1E5336]">
                  {isTeamEvent ? 'Registered Club Teams & Squads' : 'Registered Pairs & Players'}
                </h2>
                <p className="text-xs text-[#6B756B]">
                  Team Names are <strong>OPTIONAL</strong>. If left blank, the system automatically uses <strong>Player 1 & Player 2</strong> as display names!
                </p>
              </div>
              <button
                onClick={() => setIsAddPairModalOpen(true)}
                className="bg-[#1E5336] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <UserPlus size={15} /> {isTeamEvent ? 'Add New Team Squad' : 'Add New Pair'}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(currentTournament?.pairs || []).map((pair) => {
                const displayName = getPairDisplayName(pair)
                const hasCustomTeamName = !!pair.pairName

                return (
                  <div
                    key={pair.id}
                    className="border border-[#222222]/15 bg-white p-4 flex flex-col justify-between hover:border-[#1E5336] transition shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2 mb-3">
                        <div>
                          <span className="font-serif font-bold text-lg text-[#1E5336] block">{displayName}</span>
                          {hasCustomTeamName && (
                            <span className="text-[10px] text-[#6B756B] block">Team Name set</span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                          pair.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pair.status === 'champion'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pair.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-[#222222]">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-[#E1A728]" />
                          <span className="font-bold">Player 1:</span> {pair.player1}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-[#E1A728]" />
                          <span className="font-bold">Player 2:</span> {pair.player2}
                        </div>
                        {pair.extraPlayers && pair.extraPlayers.length > 0 && (
                          <div className="mt-2 pt-1 border-t border-gray-100 text-[11px] text-[#6B756B]">
                            <span className="font-bold block">Squad Members:</span>
                            <span>{pair.extraPlayers.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#222222]/10 flex justify-between items-center text-[10px]">
                      <span className="text-[#6B756B]">Seed #{pair.seed || 'Unseeded'}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditPair(pair)}
                          className="text-[#1E5336] font-bold uppercase hover:underline flex items-center gap-0.5"
                        >
                          <Edit size={11} /> Edit
                        </button>
                        <button
                          onClick={() => removePairFromTournament(currentTournament.id, pair.id)}
                          className="text-rose-600 font-bold uppercase hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CREATE TOURNAMENT TAB WITH FORMAT CHOICES */}
        {activeTab === 'create' && (
          <div className="max-w-2xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm mx-auto">
            <h2 className="font-serif text-2xl text-[#1E5336] border-b border-[#222222]/10 pb-3 mb-4">
              Create New Tournament
            </h2>

            <form onSubmit={handleCreateTournament} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Tournament Title *</label>
                <input
                  type="text"
                  required
                  value={newTournName}
                  onChange={(e) => setNewTournName(e.target.value)}
                  placeholder="e.g. Autumn Pickleball Clash 2026"
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                />
              </div>

              {/* Tournament Format Selector (Required Choice) */}
              <div className="bg-amber-50/70 border border-amber-300 p-4 rounded space-y-2">
                <label className="block font-bold uppercase text-[#1E5336] text-xs">
                  Select Tournament Format *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTournFormat('pairing')}
                    className={`p-3 border text-left transition rounded ${
                      newTournFormat === 'pairing'
                        ? 'border-[#1E5336] bg-[#1E5336] text-white shadow-sm font-bold'
                        : 'border-[#222222]/20 bg-white text-[#222222]'
                    }`}
                  >
                    <span className="block text-sm font-serif">Pairing Tournament</span>
                    <span className="text-[10px] block opacity-80 mt-0.5">Doubles / 2 Players per pair. Team Name optional.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTournFormat('team-event')}
                    className={`p-3 border text-left transition rounded ${
                      newTournFormat === 'team-event'
                        ? 'border-[#1E5336] bg-[#1E5336] text-white shadow-sm font-bold'
                        : 'border-[#222222]/20 bg-white text-[#222222]'
                    }`}
                  >
                    <span className="block text-sm font-serif">Team Event Tournament</span>
                    <span className="text-[10px] block opacity-80 mt-0.5">Club / Multi-player squad event.</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Category / Level</label>
                  <select
                    value={newTournType}
                    onChange={(e) => setNewTournType(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  >
                    <option value="Open Category">Open Category</option>
                    <option value="Members Only">Members Only</option>
                    <option value="Club Championship">Club Championship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Tournament Date</label>
                  <input
                    type="date"
                    value={newTournDate}
                    onChange={(e) => setNewTournDate(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Entry Fee per Entry (₱)</label>
                  <input
                    type="number"
                    value={newTournFee}
                    onChange={(e) => setNewTournFee(Number(e.target.value))}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Location</label>
                  <input
                    type="text"
                    value={newTournLocation}
                    onChange={(e) => setNewTournLocation(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#1E5336] text-[#FDFBF7] px-6 py-2.5 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Create & Launch Tournament
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Pair / Team Modal */}
      {isAddPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">
                {isTeamEvent ? 'Add Club Team Squad' : 'Add Pair Registration'}
              </h3>
              <button onClick={() => setIsAddPairModalOpen(false)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleAddPair} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">
                  Team / Pair Name <span className="font-normal text-gray-400 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={pairName}
                  onChange={(e) => setPairName(e.target.value)}
                  placeholder="Optional e.g. Smash Duo (Leaves as Player 1 & Player 2 if blank)"
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Player 1 Name *</label>
                <input
                  type="text"
                  required
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Player 2 Name *</label>
                <input
                  type="text"
                  required
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="e.g. Juan Rivera"
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                />
              </div>

              {isTeamEvent && (
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">
                    Additional Squad Players <span className="font-normal text-gray-400 lowercase">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={extraPlayersText}
                    onChange={(e) => setExtraPlayersText(e.target.value)}
                    placeholder="e.g. Pedro Cruz, Ana Lopez, Mike Tan"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPairModalOpen(false)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pair & Player Names Modal */}
      {editingPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">Customize Entry & Player Names</h3>
              <button onClick={() => setEditingPair(null)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSavePairEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">
                  Team / Pair Name <span className="font-normal text-gray-400 lowercase">(optional - leave blank to use Player 1 & 2)</span>
                </label>
                <input
                  type="text"
                  value={editPairName}
                  onChange={(e) => setEditPairName(e.target.value)}
                  placeholder="Optional e.g. Team Alpha"
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Player 1 Name *</label>
                  <input
                    type="text"
                    required
                    value={editPlayer1}
                    onChange={(e) => setEditPlayer1(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Player 2 Name *</label>
                  <input
                    type="text"
                    required
                    value={editPlayer2}
                    onChange={(e) => setEditPlayer2(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              {isTeamEvent && (
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">
                    Squad Players <span className="font-normal text-gray-400 lowercase">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editExtraPlayersText}
                    onChange={(e) => setEditExtraPlayersText(e.target.value)}
                    placeholder="e.g. Pedro Cruz, Ana Lopez"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Seed Rank Number</label>
                <input
                  type="number"
                  value={editSeed}
                  onChange={(e) => setEditSeed(Number(e.target.value))}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none font-bold"
                />
              </div>

              <p className="text-[11px] text-[#6B756B] italic">
                * Saving automatically updates bracket matches and live player views.
              </p>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPair(null)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save & Sync Bracket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customize Match Teams & Players Modal (Direct Match Edit) */}
      {customizingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">
                Match #{customizingMatch.matchNumber} ({customizingMatch.round}) Team Customization
              </h3>
              <button onClick={() => setCustomizingMatch(null)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSaveCustomizedMatch} className="space-y-4 text-xs">
              {/* Team 1 Section */}
              <div className="bg-stone-50 p-3 rounded border border-[#222222]/10 space-y-2">
                <span className="font-bold text-[#1E5336] block uppercase">Team / Pair 1 Configuration</span>
                <div>
                  <label className="block text-[10px] text-[#6B756B] font-bold">Team 1 Display Name</label>
                  <input
                    type="text"
                    value={matchTeam1}
                    onChange={(e) => setMatchTeam1(e.target.value)}
                    className="w-full border p-2 bg-white font-bold text-[#1E5336]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#6B756B]">Player 1</label>
                    <input
                      type="text"
                      value={matchTeam1P1}
                      onChange={(e) => setMatchTeam1P1(e.target.value)}
                      placeholder="Player 1 Name"
                      className="w-full border p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6B756B]">Player 2</label>
                    <input
                      type="text"
                      value={matchTeam1P2}
                      onChange={(e) => setMatchTeam1P2(e.target.value)}
                      placeholder="Player 2 Name"
                      className="w-full border p-2 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Team 2 Section */}
              <div className="bg-stone-50 p-3 rounded border border-[#222222]/10 space-y-2">
                <span className="font-bold text-[#1E5336] block uppercase">Team / Pair 2 Configuration</span>
                <div>
                  <label className="block text-[10px] text-[#6B756B] font-bold">Team 2 Display Name</label>
                  <input
                    type="text"
                    value={matchTeam2}
                    onChange={(e) => setMatchTeam2(e.target.value)}
                    className="w-full border p-2 bg-white font-bold text-[#1E5336]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#6B756B]">Player 1</label>
                    <input
                      type="text"
                      value={matchTeam2P1}
                      onChange={(e) => setMatchTeam2P1(e.target.value)}
                      placeholder="Player 1 Name"
                      className="w-full border p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6B756B]">Player 2</label>
                    <input
                      type="text"
                      value={matchTeam2P2}
                      onChange={(e) => setMatchTeam2P2(e.target.value)}
                      placeholder="Player 2 Name"
                      className="w-full border p-2 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomizingMatch(null)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save Customizations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Match Score Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">Match #{selectedMatch.matchNumber} Score Entry</h3>
              <button onClick={() => setSelectedMatch(null)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4 text-xs">
              <div className="bg-[#F3F0EC] p-3 rounded font-bold text-center text-[#1E5336]">
                {selectedMatch.round} Match: {selectedMatch.team1} vs. {selectedMatch.team2}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">{selectedMatch.team1} Score</label>
                  <input
                    type="number"
                    min="0"
                    value={score1}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setScore1(val)
                      if (val > score2) setWinnerName(selectedMatch.team1)
                      else if (score2 > val) setWinnerName(selectedMatch.team2)
                    }}
                    className="w-full border border-[#222222]/20 p-3 bg-white text-[#222222] font-mono text-xl font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">{selectedMatch.team2} Score</label>
                  <input
                    type="number"
                    min="0"
                    value={score2}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setScore2(val)
                      if (val > score1) setWinnerName(selectedMatch.team2)
                      else if (score1 > val) setWinnerName(selectedMatch.team1)
                    }}
                    className="w-full border border-[#222222]/20 p-3 bg-white text-[#222222] font-mono text-xl font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Winning Pair / Winner</label>
                <select
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#1E5336] font-bold outline-none"
                >
                  <option value={selectedMatch.team1}>{selectedMatch.team1}</option>
                  <option value={selectedMatch.team2}>{selectedMatch.team2}</option>
                </select>
              </div>

              <p className="text-[11px] text-[#6B756B] italic">
                * Submitting score will automatically mark match as completed and advance winning pair to next round bracket slot.
              </p>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save Score & Advance Winner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Schedule Modal */}
      {schedulingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">Schedule Match #{schedulingMatch.matchNumber}</h3>
              <button onClick={() => setSchedulingMatch(null)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Assign Court</label>
                <select
                  value={scheduleCourt}
                  onChange={(e) => setScheduleCourt(e.target.value)}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                >
                  <option value="Court 1">Court 1</option>
                  <option value="Court 2">Court 2</option>
                  <option value="Court 3">Court 3</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Match Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Match Time</label>
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingMatch(null)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
