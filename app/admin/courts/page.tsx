'use client'

import { useState } from 'react'
import Link from 'next/link'
import { courts as initialCourts, courtSchedule } from '@/lib/data'
import type { Court, CourtStatus } from '@/lib/data'
import { Volleyball, ArrowLeft, Plus, Edit2, Lock, Unlock, Users, Calendar, CheckCircle } from 'lucide-react'

export default function AdminCourtsPage() {
  const [courtsList, setCourtsList] = useState<Court[]>(initialCourts)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [statusSelect, setStatusSelect] = useState<CourtStatus>('available')

  const handleUpdateStatus = (courtId: string, newStatus: CourtStatus) => {
    setCourtsList((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, status: newStatus } : c))
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC]">
      {/* Subheader */}
      <div className="bg-[#111111] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#E1A728] hover:underline mb-2">
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </Link>
          <h1 className="font-serif text-3xl font-bold">Court Management</h1>
          <p className="mt-1 text-xs text-white/60">Configure court status, block schedules, or assign Open Play sessions.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {courtsList.map((court) => {
            const schedule = courtSchedule[court.id] || []

            return (
              <div key={court.id} className="rounded-2xl bg-white p-6 shadow-sm border border-[rgba(17,17,17,0.1)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-[#1E5336]">{court.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      court.status === 'available' ? 'bg-green-100 text-green-700' :
                      court.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                      court.status === 'open-play' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {court.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B756B] mb-4">{court.detail}</p>
                  <p className="text-sm font-bold text-[#111] mb-4">{court.price}</p>

                  <div className="space-y-2 border-t border-[rgba(17,17,17,0.08)] pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B756B]">Quick Change Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'available')}
                        className={`rounded-lg py-1.5 text-xs font-semibold border ${court.status === 'available' ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        Set Available
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'reserved')}
                        className={`rounded-lg py-1.5 text-xs font-semibold border ${court.status === 'reserved' ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        Set Reserved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'open-play')}
                        className={`rounded-lg py-1.5 text-xs font-semibold border ${court.status === 'open-play' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        Assign Open Play
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'occupied')}
                        className={`rounded-lg py-1.5 text-xs font-semibold border ${court.status === 'occupied' ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        Block Court
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[rgba(17,17,17,0.08)] pt-4">
                  <p className="text-[11px] font-semibold uppercase text-[#6B756B] mb-2">Today's Slots Overview</p>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                    {schedule.map((s) => (
                      <div key={s.time} className="flex justify-between py-1 px-2 rounded bg-[#F3F0EC]/50">
                        <span className="font-medium text-[#111]">{s.time}</span>
                        <span className="text-[#6B756B] capitalize">{s.status} {s.name ? `(${s.name})` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
