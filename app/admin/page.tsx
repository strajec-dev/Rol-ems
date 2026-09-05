'use client'

import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { LayoutDashboard, CalendarCheck, Users, Trophy, Volleyball, Disc, ChevronRight } from 'lucide-react'

export default function AdminDashboardPage() {
  const { reservations, openPlaySessions, tournaments, paddles, paddleRentals } = usePickleball()

  const totalBookings = reservations.length
  const pendingPayments = reservations.filter((r) => r.paymentStatus === 'pending').length
  const totalRevenue = reservations.filter((r) => r.paymentStatus === 'paid').reduce((sum, r) => sum + r.total, 0)
  const activeRentalsCount = paddleRentals.filter((r) => r.status === 'Active' || r.status === 'Reserved').length

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">ROL-EMS Management</p>
            <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Pickleball Dashboard</h1>
          </div>
          <span className="border border-[#1E5336] px-3 py-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
            System Online
          </span>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Navigation Cards Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'Court Schedule', href: '/admin/courts', icon: Volleyball, count: `3 Courts` },
            { label: 'Reservations', href: '/admin/reservations', icon: CalendarCheck, count: `${totalBookings} Total` },
            { label: 'Open Play Controls', href: '/admin/open-play', icon: Users, count: `${openPlaySessions.length} Sessions` },
            { label: 'Paddle Management', href: '/admin/paddles', icon: Disc, count: `${paddles.length} Paddles` },
            { label: 'Tournaments & Bracket', href: '/admin/tournaments', icon: Trophy, count: `${tournaments.length} Events` },
          ].map(({ label, href, icon: Icon, count }) => (
            <Link
              key={label}
              href={href}
              className="border border-[#222222]/15 bg-[#FDFBF7] p-5 transition hover:border-[#1E5336] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex h-9 w-9 items-center justify-center bg-[#1E5336] text-[#FDFBF7] mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1E5336]">{label}</h3>
              </div>
              <p className="text-xs text-[#6B756B] mt-2">{count}</p>
            </Link>
          ))}
        </div>

        {/* Operational Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Confirmed Revenue</p>
            <p className="mt-2 font-serif text-3xl text-[#1E5336]">₱{totalRevenue.toLocaleString()}</p>
            <p className="mt-1 text-xs text-[#6B756B]">From paid reservations</p>
          </div>

          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Pending Payments</p>
            <p className="mt-2 font-serif text-3xl text-[#E1A728]">{pendingPayments}</p>
            <p className="mt-1 text-xs text-[#6B756B]">Requires verification action</p>
          </div>

          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Active Paddle Rentals</p>
            <p className="mt-2 font-serif text-3xl text-emerald-700">{activeRentalsCount}</p>
            <p className="mt-1 text-xs text-[#6B756B]">Currently rented or reserved</p>
          </div>

          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Courts Operational</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#1E5336]">
              <span>1 Available</span> · <span>1 Reserved</span> · <span>1 Open Play</span>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[#222222]/10 pb-3">
            <h2 className="font-serif text-2xl text-[#1E5336]">Recent Reservations</h2>
            <Link href="/admin/reservations" className="text-xs text-[#1E5336] uppercase tracking-[0.12em] font-bold hover:underline">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Booking Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Court</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/10">
                {reservations.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/30">
                    <td className="p-3 font-mono font-bold text-[#1E5336]">{r.bookingId}</td>
                    <td className="p-3 font-bold text-[#222222]">
                      {r.customerName}
                      {r.paddleRentalName && (
                        <span className="block text-[10px] font-normal text-emerald-800 font-sans">
                          + {r.paddleRentalName} Rental
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#1E5336]">{r.court}</td>
                    <td className="p-3 text-[#6B756B]">{r.date} · {r.time}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                        r.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E1A728]/20 text-[#1E5336]'
                      }`}>
                        {r.paymentMethod} ({r.paymentStatus})
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                        r.bookingStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.bookingStatus}
                      </span>
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
