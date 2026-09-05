'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { OpenPlaySession } from '@/lib/data'
import { Users, Plus, ArrowLeft, Calendar, Clock, Edit, Trash2, Lock, Unlock, ToggleLeft, ToggleRight, CheckCircle2, UserX } from 'lucide-react'

export default function AdminOpenPlayPage() {
  const {
    openPlaySessions,
    createOpenPlaySession,
    updateOpenPlaySession,
    cancelOpenPlaySession,
    toggleRegistration,
    toggleQueue,
    leaveOpenPlaySession,
    removeFromQueue,
  } = usePickleball()

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<OpenPlaySession | null>(null)

  // Form State
  const [court, setCourt] = useState('Court 1')
  const [date, setDate] = useState('2026-08-31')
  const [dayOfWeek, setDayOfWeek] = useState('Monday')
  const [startTime, setStartTime] = useState('5:00 PM')
  const [endTime, setEndTime] = useState('8:00 PM')

  const handleOpenAdd = () => {
    setEditingSession(null)
    setCourt('Court 1')
    setDate('2026-08-31')
    setDayOfWeek('Monday')
    setStartTime('5:00 PM')
    setEndTime('8:00 PM')
    setIsAddSessionModalOpen(true)
  }

  const handleOpenEdit = (session: OpenPlaySession) => {
    setEditingSession(session)
    setCourt(session.court)
    setDate(session.date)
    setDayOfWeek(session.dayOfWeek || 'Monday')
    setStartTime(session.startTime)
    setEndTime(session.endTime)
    setIsAddSessionModalOpen(true)
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSession) {
      updateOpenPlaySession(editingSession.id, {
        court,
        date,
        dayOfWeek,
        startTime,
        endTime,
      })
    } else {
      createOpenPlaySession({
        court,
        date,
        dayOfWeek,
        startTime,
        endTime,
      })
    }

    setIsAddSessionModalOpen(false)
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
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Open Play Controls</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Open Play Schedule Management</h1>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 bg-[#1E5336] text-[#FDFBF7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#153b26] transition shadow-sm"
            >
              <Plus size={16} /> Create Open Play Session
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Master Session Schedule Cards */}
        <div className="mb-8 border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-[#1E5336]">Configured Open Play Court Sessions</h2>
              <p className="text-xs text-[#6B756B]">
                Each court session enforces a strict maximum capacity of <strong>12 players</strong>.
              </p>
            </div>
            <span className="text-xs text-[#1E5336] font-bold uppercase">
              {openPlaySessions.length} Total Sessions Configured
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {openPlaySessions.map((session) => {
              const currentPlayersCount = session.players.length
              const isFull = currentPlayersCount >= 12

              return (
                <div
                  key={session.id}
                  className={`border-2 p-5 bg-white shadow-sm flex flex-col justify-between ${
                    session.status === 'cancelled'
                      ? 'border-gray-300 opacity-60'
                      : isFull
                      ? 'border-amber-400'
                      : 'border-[#1E5336]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-3">
                      <div>
                        <h3 className="font-serif font-bold text-xl text-[#1E5336]">{session.court} — Open Play</h3>
                        <p className="text-xs font-bold text-[#E1A728] uppercase tracking-wider">{session.dayOfWeek || 'Monday'}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        session.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : isFull
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Schedule Time & Capacity */}
                    <div className="space-y-1 text-xs text-[#6B756B] mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-[#1E5336]" />
                        <span>Start: <strong>{session.startTime}</strong> · End: <strong>{session.endTime}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#1E5336]" />
                        <span>Date: <strong>{session.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[#1E5336]">
                        <Users size={14} />
                        <span>Capacity: 12 Players ({currentPlayersCount}/12 Active)</span>
                      </div>
                    </div>

                    {/* Quick Admin Toggles */}
                    <div className="grid grid-cols-2 gap-2 mb-4 bg-[#F3F0EC] p-2.5 rounded text-[11px]">
                      <button
                        onClick={() => toggleRegistration(session.id)}
                        className={`flex items-center justify-center gap-1 p-1.5 font-bold uppercase rounded transition ${
                          session.isRegistrationOpen
                            ? 'bg-emerald-700 text-white'
                            : 'bg-rose-700 text-white'
                        }`}
                      >
                        {session.isRegistrationOpen ? <Unlock size={12} /> : <Lock size={12} />}
                        {session.isRegistrationOpen ? 'Reg: Open' : 'Reg: Closed'}
                      </button>

                      <button
                        onClick={() => toggleQueue(session.id)}
                        className={`flex items-center justify-center gap-1 p-1.5 font-bold uppercase rounded transition ${
                          session.isQueueOpen
                            ? 'bg-blue-700 text-white'
                            : 'bg-stone-500 text-white'
                        }`}
                      >
                        {session.isQueueOpen ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {session.isQueueOpen ? 'Queue: Open' : 'Queue: Closed'}
                      </button>
                    </div>

                    {/* Player List */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[10px] font-bold uppercase text-[#6B756B] block">
                        Registered Players ({session.players.length}):
                      </span>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {session.players.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-stone-50 p-1.5 rounded">
                            <span>#{idx + 1} {p}</span>
                            <button
                              onClick={() => leaveOpenPlaySession(session.id, p)}
                              className="text-rose-600 font-bold text-[10px] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Queue List */}
                    {session.queue.length > 0 && (
                      <div className="space-y-1.5 bg-amber-50 p-2.5 rounded border border-amber-200 mb-4">
                        <span className="text-[10px] font-bold uppercase text-amber-900 block">
                          Waiting Queue ({session.queue.length}):
                        </span>
                        {session.queue.map((q, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-amber-950 font-bold">
                            <span>Pos #{idx + 1}: {q}</span>
                            <button
                              onClick={() => removeFromQueue(session.id, q)}
                              className="text-rose-700 text-[10px] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#222222]/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEdit(session)}
                      className="border border-[#222222]/20 px-3 py-1 text-[11px] font-bold uppercase hover:bg-stone-100 flex items-center gap-1"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => cancelOpenPlaySession(session.id)}
                      className="border border-rose-200 text-rose-600 px-3 py-1 text-[11px] font-bold uppercase hover:bg-rose-600 hover:text-white flex items-center gap-1"
                    >
                      Cancel Session
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Session Modal */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">
                {editingSession ? 'Edit Open Play Schedule' : 'Create Open Play Session'}
              </h3>
              <button onClick={() => setIsAddSessionModalOpen(false)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Assigned Court *</label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                >
                  <option value="Court 1">Court 1</option>
                  <option value="Court 2">Court 2</option>
                  <option value="Court 3">Court 3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 5:00 PM"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 8:00 PM"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#F3F0EC] p-3 rounded font-bold text-[#1E5336]">
                Fixed Capacity: 12 Players per Court (Enforced Automatically)
              </div>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSessionModalOpen(false)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
