'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { OpenPlaySession } from '@/lib/data'
import { Users, Disc, CheckCircle2, AlertCircle, Clock, Calendar, ShieldCheck, ChevronRight, UserPlus } from 'lucide-react'

export default function OpenPlayPage() {
  const { openPlaySessions, paddles, joinOpenPlaySession, leaveOpenPlaySession, rentPaddle } = usePickleball()

  const [selectedSession, setSelectedSession] = useState<OpenPlaySession | null>(null)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [wantPaddleRental, setWantPaddleRental] = useState(false)
  const [selectedPaddleId, setSelectedPaddleId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Pay at Counter'>('GCash')

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    title: string
    message: string
    queuePosition?: number
  } | null>(null)

  const handleOpenJoinModal = (session: OpenPlaySession) => {
    setSelectedSession(session)
    setFeedback(null)
    setPlayerName('')
    setWantPaddleRental(false)
    setSelectedPaddleId('')
    setIsJoinModalOpen(true)
  }

  const handleConfirmJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession || !playerName.trim()) return

    const result = joinOpenPlaySession(selectedSession.id, playerName)

    if (result.joined) {
      if (wantPaddleRental && selectedPaddleId) {
        const paddleObj = paddles.find((p) => p.id === selectedPaddleId)
        if (paddleObj) {
          rentPaddle({
            paddleId: paddleObj.id,
            paddleName: paddleObj.name,
            renterName: playerName,
            attachedToType: 'Open Play',
            attachedToId: selectedSession.id,
            courtOrSession: `${selectedSession.court} (${selectedSession.startTime} - ${selectedSession.endTime})`,
            date: selectedSession.date,
            time: selectedSession.startTime,
            duration: 'Open Play Session',
            totalPrice: paddleObj.price,
            paymentMethod,
            paymentStatus: paymentMethod === 'Pay at Counter' ? 'pending' : 'paid',
            status: paymentMethod === 'Pay at Counter' ? 'Reserved' : 'Active',
          })
        }
      }

      setFeedback({
        type: 'success',
        title: 'Registration Successful!',
        message: `You are confirmed for ${selectedSession.court} Open Play session.`,
      })
    } else if (result.inQueue) {
      setFeedback({
        type: 'warning',
        title: 'SESSION FULL — JOIN QUEUE',
        message: `Maximum capacity (12/12) reached. You automatically entered the queue.`,
        queuePosition: result.queuePosition,
      })
    } else {
      setFeedback({
        type: 'error',
        title: 'Registration Alert',
        message: result.message,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Header Banner */}
      <section className="bg-[#1E5336] text-[#FDFBF7] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#E1A728] font-bold">
                Shared Court Play & Queueing
              </p>
              <h1 className="mt-1 font-serif text-4xl sm:text-5xl font-bold">Open Play Sessions</h1>
              <p className="mt-2 text-sm text-white/80 max-w-2xl">
                Join active open play court sessions with up to <strong className="text-[#E1A728]">12 players per court</strong>.
                If full (12/12), players automatically enter the queue with live position updates.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 border border-white/20 rounded-xl">
              <Users size={36} className="text-[#E1A728]" />
              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest">Court Capacity</p>
                <p className="font-serif text-2xl font-bold text-white">
                  12 Players <span className="text-xs font-sans font-normal text-white/70">/ court max</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Open Play Sessions Grid */}
        <h2 className="font-serif text-2xl text-[#1E5336] mb-6">Active Open Play Schedule</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {openPlaySessions.map((session) => {
            const currentPlayersCount = session.players.length
            const maxCap = session.maxPlayers || 12
            const availableSlots = Math.max(0, maxCap - currentPlayersCount)
            const isFull = currentPlayersCount >= maxCap

            return (
              <div
                key={session.id}
                className={`border-2 bg-[#FDFBF7] p-6 shadow-sm flex flex-col justify-between transition ${
                  isFull ? 'border-amber-400 bg-amber-50/20' : 'border-[#1E5336]'
                }`}
              >
                <div>
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
                    <span className="font-serif font-bold text-xl text-[#1E5336]">
                      {session.court} — Open Play
                    </span>
                    {isFull ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-500 text-black animate-pulse rounded">
                        SESSION FULL — JOIN QUEUE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {availableSlots} Slots Available
                      </span>
                    )}
                  </div>

                  {/* Day & Time */}
                  <div className="space-y-1.5 text-xs text-[#6B756B] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#1E5336]" />
                      <span className="font-bold text-[#222222]">{session.dayOfWeek || 'Monday'}</span> · {session.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#1E5336]" />
                      <span className="font-bold text-[#222222]">{session.startTime} – {session.endTime}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-4 bg-[#F3F0EC] p-3 rounded space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#1E5336]">Current Players:</span>
                      <span className={isFull ? 'text-amber-700' : 'text-emerald-700'}>
                        {currentPlayersCount} / {maxCap} Players {isFull ? '(FULL)' : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isFull ? 'bg-amber-500' : 'bg-emerald-600'}`}
                        style={{ width: `${Math.min(100, (currentPlayersCount / maxCap) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#6B756B]">
                      <span>Available Slots: <strong>{availableSlots}</strong></span>
                      <span>Queue Count: <strong className="text-amber-700">{session.queue.length}</strong></span>
                    </div>
                  </div>

                  {/* Players Roster */}
                  <div className="mb-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#6B756B] tracking-wider block">
                      Registered Players Roster:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {session.players.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] bg-white border border-[#222222]/10 text-[#222222] font-semibold rounded">
                          #{idx + 1} {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Queue Roster if any */}
                  {session.queue.length > 0 && (
                    <div className="mb-4 space-y-1.5 bg-amber-50 p-2.5 rounded border border-amber-200">
                      <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider block">
                        Waiting Queue ({session.queue.length} players):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {session.queue.map((q, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] bg-amber-200 text-amber-950 font-bold rounded">
                            Pos #{idx + 1}: {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#222222]/10">
                  <button
                    disabled={!session.isRegistrationOpen}
                    onClick={() => handleOpenJoinModal(session)}
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition flex items-center justify-center gap-1.5 ${
                      session.isRegistrationOpen
                        ? isFull
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-[#1E5336] text-white hover:bg-[#153b26]'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus size={15} />
                    {session.isRegistrationOpen
                      ? isFull
                        ? 'Session Full — Join Queue'
                        : 'Join Open Play Court'
                      : 'Registration Closed'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Join / Queue Modal */}
      {isJoinModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#E1A728]">Open Play Registration</p>
                <h3 className="font-serif text-2xl text-[#1E5336]">{selectedSession.court} Open Play</h3>
              </div>
              <button onClick={() => setIsJoinModalOpen(false)} className="font-bold text-gray-500 text-lg">✕</button>
            </div>

            {feedback ? (
              <div className="py-6 text-center space-y-4">
                {feedback.type === 'success' ? (
                  <CheckCircle2 size={48} className="mx-auto text-emerald-600 animate-bounce" />
                ) : (
                  <AlertCircle size={48} className="mx-auto text-amber-600 animate-bounce" />
                )}
                <h4 className="font-serif text-xl font-bold text-[#1E5336]">{feedback.title}</h4>
                <p className="text-xs text-[#6B756B]">{feedback.message}</p>

                {feedback.queuePosition && (
                  <div className="bg-amber-100 p-4 border border-amber-300 rounded-lg font-bold text-amber-900">
                    Your Queue Position: #{feedback.queuePosition}
                  </div>
                )}

                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className="bg-[#1E5336] text-white px-6 py-2 text-xs font-bold uppercase tracking-wider mt-4"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmJoin} className="space-y-4 text-xs">
                <div className="bg-[#F3F0EC] p-3 rounded space-y-1">
                  <p className="font-bold text-[#1E5336]">
                    {selectedSession.dayOfWeek} · {selectedSession.startTime} – {selectedSession.endTime}
                  </p>
                  <p className="text-[#6B756B]">
                    Status: {selectedSession.players.length >= 12 ? 'FULL (12/12) — Automatic Queue Entry' : `${12 - selectedSession.players.length} slots remaining`}
                  </p>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Alex Santos"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                {/* Optional Paddle Rental Integration */}
                <div className="border border-[#222222]/15 bg-white p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="paddleRent"
                      checked={wantPaddleRental}
                      onChange={(e) => setWantPaddleRental(e.target.checked)}
                      className="h-4 w-4 text-[#1E5336]"
                    />
                    <label htmlFor="paddleRent" className="font-bold text-[#1E5336] cursor-pointer">
                      Add a Paddle Rental for this Open Play Session?
                    </label>
                  </div>

                  {wantPaddleRental && (
                    <div className="pt-2 space-y-2">
                      <label className="block text-[11px] font-bold text-[#6B756B]">Select Available Paddle:</label>
                      <select
                        value={selectedPaddleId}
                        onChange={(e) => setSelectedPaddleId(e.target.value)}
                        className="w-full border border-[#222222]/20 p-2 bg-[#FDFBF7] text-[#222222] outline-none"
                      >
                        <option value="">-- Choose Paddle --</option>
                        {paddles
                          .filter((p) => p.availability === 'Available' && p.quantityAvailable > 0)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.type}) – ₱{p.price}
                            </option>
                          ))}
                      </select>

                      <label className="block text-[11px] font-bold text-[#6B756B]">Payment Method:</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full border border-[#222222]/20 p-2 bg-[#FDFBF7] text-[#222222] outline-none"
                      >
                        <option value="GCash">GCash</option>
                        <option value="Maya">Maya</option>
                        <option value="Pay at Counter">Pay at Counter</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                  >
                    {selectedSession.players.length >= 12 ? 'Enter Queue' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
