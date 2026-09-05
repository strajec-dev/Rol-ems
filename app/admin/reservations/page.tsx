'use client'

import { useState } from 'react'
import Link from 'next/link'
import { reservations as initialReservations } from '@/lib/data'
import type { Reservation } from '@/lib/data'
import { ArrowLeft, Check, X, CreditCard, Search, Filter } from 'lucide-react'

export default function AdminReservationsPage() {
  const [resList, setResList] = useState<Reservation[]>(initialReservations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const filtered = resList.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      r.court.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      r.bookingStatus === statusFilter.toLowerCase() ||
      r.paymentStatus === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const updateStatus = (id: string, field: 'paymentStatus' | 'bookingStatus', value: string) => {
    setResList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
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
          <h1 className="font-serif text-3xl font-bold">Reservation Management</h1>
          <p className="mt-1 text-xs text-white/60">Review, approve, modify, or cancel court booking reservations.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-[rgba(17,17,17,0.1)] shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, booking ID, court..."
              className="w-full rounded-xl border border-[rgba(17,17,17,0.15)] bg-[#F3F0EC] pl-10 pr-4 py-2 text-xs outline-none focus:border-[#1E5336]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#6B756B]" />
            <span className="text-xs text-[#6B756B] font-semibold">Filter:</span>
            {['All', 'Confirmed', 'Pending', 'Paid', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === st ? 'bg-[#1E5336] text-white' : 'bg-[#F3F0EC] text-[#6B756B] hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-[rgba(17,17,17,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[rgba(17,17,17,0.08)] bg-[#F3F0EC] text-[#6B756B] font-bold">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Court</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Booking Status</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(17,17,17,0.06)]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F3F0EC]/40">
                    <td className="p-4 font-mono font-bold text-[#111]">{r.bookingId}</td>
                    <td className="p-4 font-semibold text-[#111]">{r.customerName}</td>
                    <td className="p-4 font-bold text-[#1E5336]">{r.court}</td>
                    <td className="p-4 text-[#444]">{r.date} at {r.time} ({r.duration}h)</td>
                    <td className="p-4 text-[#6B756B]">{r.paymentMethod}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        r.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        r.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        r.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                        r.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#1E5336]">₱{r.total.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {r.bookingStatus !== 'confirmed' && (
                          <button
                            onClick={() => updateStatus(r.id, 'bookingStatus', 'confirmed')}
                            className="rounded-md bg-green-600 p-1.5 text-white hover:bg-green-700"
                            title="Approve Booking"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {r.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => updateStatus(r.id, 'paymentStatus', 'paid')}
                            className="rounded-md bg-amber-500 p-1.5 text-white hover:bg-amber-600"
                            title="Mark as Paid"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        {r.bookingStatus !== 'cancelled' && (
                          <button
                            onClick={() => {
                              updateStatus(r.id, 'bookingStatus', 'cancelled')
                              updateStatus(r.id, 'paymentStatus', 'cancelled')
                            }}
                            className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700"
                            title="Cancel Booking"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
