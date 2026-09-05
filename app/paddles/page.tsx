'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { Paddle, PaddleType, PaymentMethod } from '@/lib/data'
import { Disc, ShieldCheck, Zap, Layers, Filter, CheckCircle2, Clock, CalendarCheck, Users, Trophy } from 'lucide-react'

export default function PaddleRentalPage() {
  const { paddles, openPlaySessions, rentPaddle } = usePickleball()
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedPaddle, setSelectedPaddle] = useState<Paddle | null>(null)
  const [isRentModalOpen, setIsRentModalOpen] = useState(false)

  // Form State
  const [renterName, setRenterName] = useState('')
  const [renterContact, setRenterContact] = useState('')
  const [attachedToType, setAttachedToType] = useState<'Court Booking' | 'Open Play' | 'Tournament' | 'Standalone'>('Open Play')
  const [attachedToId, setAttachedToId] = useState('')
  const [rentalDuration, setRentalDuration] = useState('2 Hours')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const paddleTypes = ['All', 'Control', 'Power', 'All-Around', 'Spin', 'Precision']

  const filteredPaddles = paddles.filter((p) =>
    selectedType === 'All' ? true : p.type === selectedType
  )

  const handleOpenRentModal = (paddle: Paddle) => {
    setSelectedPaddle(paddle)
    setSuccessMessage(null)
    setIsRentModalOpen(true)
  }

  const handleConfirmRental = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPaddle || !renterName.trim()) return

    const selectedSession = openPlaySessions.find((s) => s.id === attachedToId)
    const courtOrSessionStr =
      attachedToType === 'Open Play' && selectedSession
        ? `${selectedSession.court} Open Play (${selectedSession.startTime} - ${selectedSession.endTime})`
        : attachedToType === 'Court Booking'
        ? 'Attached to Court Booking'
        : attachedToType === 'Tournament'
        ? 'Attached to Tournament Match'
        : 'Standalone Paddle Rental'

    const rental = rentPaddle({
      paddleId: selectedPaddle.id,
      paddleName: selectedPaddle.name,
      renterName,
      renterContact,
      attachedToType,
      attachedToId: attachedToId || undefined,
      courtOrSession: courtOrSessionStr,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: rentalDuration,
      totalPrice: selectedPaddle.price,
      paymentMethod,
      paymentStatus: paymentMethod === 'Pay at Counter' ? 'pending' : 'paid',
      status: paymentMethod === 'Pay at Counter' ? 'Reserved' : 'Active',
    })

    setSuccessMessage(
      `Rental confirmed! Reference #${rental.id}. You can collect your paddle at the front counter.`
    )
    setRenterName('')
    setRenterContact('')
  }

  const getStatusBadge = (status: Paddle['availability']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Rented':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Reserved':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Under Maintenance':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
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
                Pickleball Gear & Equipment
              </p>
              <h1 className="mt-1 font-serif text-4xl sm:text-5xl font-bold">Paddle Rental Center</h1>
              <p className="mt-2 text-sm text-white/80 max-w-2xl">
                Elevate your game with top-tier pickleball paddles from Selkirk, Joola, CRBN, and Paddletek.
                Rent a paddle for your Court Booking, Open Play session, or Tournament.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 border border-white/20 rounded-xl">
              <Disc size={36} className="text-[#E1A728] animate-spin-slow" />
              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest">Rental Rates</p>
                <p className="font-serif text-2xl font-bold text-white">₱150 – ₱200 <span className="text-xs font-sans font-normal text-white/70">/ session</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#222222]/10 pb-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#1E5336]" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1E5336]">Filter by Type:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {paddleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded-md ${
                  selectedType === type
                    ? 'bg-[#1E5336] text-[#FDFBF7] shadow-sm'
                    : 'bg-white text-[#6B756B] border border-[#222222]/10 hover:border-[#1E5336] hover:text-[#1E5336]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Required Example Table View */}
        <div className="mb-10 border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
            <div>
              <h2 className="font-serif text-xl text-[#1E5336]">Paddle Rental Inventory Table</h2>
              <p className="text-xs text-[#6B756B]">Real-time availability for booking & Open Play</p>
            </div>
            <span className="text-xs text-[#1E5336] font-bold uppercase tracking-wider">
              {paddles.filter((p) => p.availability === 'Available').length} Available Now
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Paddle</th>
                  <th className="p-3">Brand & Model</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Rental Price</th>
                  <th className="p-3 text-center">Availability</th>
                  <th className="p-3 text-center">Condition</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/10">
                {filteredPaddles.map((paddle) => (
                  <tr key={paddle.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-3 font-bold text-[#1E5336]">
                      <div className="flex items-center gap-2">
                        <Disc size={16} className="text-[#E1A728]" />
                        <span>{paddle.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#222222]">{paddle.brand} · {paddle.model}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-stone-200 text-stone-800 rounded">
                        {paddle.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#1E5336]">₱{paddle.price}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded-full ${getStatusBadge(paddle.availability)}`}>
                        {paddle.availability} ({paddle.quantityAvailable}/{paddle.totalQuantity})
                      </span>
                    </td>
                    <td className="p-3 text-center text-[#6B756B]">{paddle.condition}</td>
                    <td className="p-3 text-right">
                      <button
                        disabled={paddle.availability !== 'Available' || paddle.quantityAvailable <= 0}
                        onClick={() => handleOpenRentModal(paddle)}
                        className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition rounded ${
                          paddle.availability === 'Available' && paddle.quantityAvailable > 0
                            ? 'bg-[#1E5336] text-white hover:bg-[#153b26]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {paddle.availability === 'Available' && paddle.quantityAvailable > 0 ? 'Rent Now' : 'Unavailable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Cards View */}
        <h2 className="font-serif text-2xl text-[#1E5336] mb-4">Available Equipment Specifications</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPaddles.map((paddle) => (
            <div
              key={paddle.id}
              className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm hover:border-[#1E5336] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#E1A728]">
                    {paddle.brand}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-full ${getStatusBadge(paddle.availability)}`}>
                    {paddle.availability}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-[#1E5336]">{paddle.name}</h3>
                <p className="text-xs text-[#6B756B] mt-0.5">{paddle.model}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Paddle Type:</span>
                    <span className="font-bold text-[#1E5336]">{paddle.type}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Rental Price:</span>
                    <span className="font-mono font-bold text-[#1E5336]">₱{paddle.price}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Stock Available:</span>
                    <span className="font-bold text-[#222222]">{paddle.quantityAvailable} of {paddle.totalQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Condition:</span>
                    <span className="font-bold text-emerald-700">{paddle.condition}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[#6B756B]">Duration:</span>
                    <span className="text-[#222222]">{paddle.rentalDuration}</span>
                  </div>
                </div>

                {paddle.notes && (
                  <p className="mt-3 text-[11px] italic bg-[#F3F0EC] p-2.5 rounded text-[#555]">
                    "{paddle.notes}"
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#222222]/10">
                <button
                  disabled={paddle.availability !== 'Available' || paddle.quantityAvailable <= 0}
                  onClick={() => handleOpenRentModal(paddle)}
                  className={`w-full py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition ${
                    paddle.availability === 'Available' && paddle.quantityAvailable > 0
                      ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153b26]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {paddle.availability === 'Available' && paddle.quantityAvailable > 0
                    ? 'Rent This Paddle'
                    : 'Currently Rented / Reserved'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rental Modal */}
      {isRentModalOpen && selectedPaddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#E1A728]">Pickleball Equipment</p>
                <h3 className="font-serif text-2xl text-[#1E5336]">Reserve Paddle Rental</h3>
              </div>
              <button
                onClick={() => setIsRentModalOpen(false)}
                className="text-[#6B756B] hover:text-[#222222] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="py-6 text-center space-y-4">
                <CheckCircle2 size={48} className="mx-auto text-emerald-600 animate-bounce" />
                <h4 className="font-serif text-xl text-[#1E5336]">Paddle Reserved Successfully!</h4>
                <p className="text-xs text-[#6B756B]">{successMessage}</p>
                <button
                  onClick={() => setIsRentModalOpen(false)}
                  className="mt-4 bg-[#1E5336] text-white px-6 py-2 text-xs font-bold uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmRental} className="space-y-4">
                <div className="bg-[#F3F0EC] p-3 rounded text-xs space-y-1">
                  <p className="font-bold text-[#1E5336]">{selectedPaddle.name} ({selectedPaddle.brand})</p>
                  <p className="text-[#6B756B]">Type: {selectedPaddle.type} · Rate: ₱{selectedPaddle.price}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Renter Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full border border-[#222222]/20 bg-white p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={renterContact}
                    onChange={(e) => setRenterContact(e.target.value)}
                    placeholder="0917-XXX-XXXX"
                    className="w-full border border-[#222222]/20 bg-white p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                    Attach Rental To
                  </label>
                  <select
                    value={attachedToType}
                    onChange={(e) => setAttachedToType(e.target.value as any)}
                    className="w-full border border-[#222222]/20 bg-white p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                  >
                    <option value="Open Play">Open Play Session</option>
                    <option value="Court Booking">Court Reservation</option>
                    <option value="Tournament">Tournament Session</option>
                    <option value="Standalone">Standalone Rental</option>
                  </select>
                </div>

                {attachedToType === 'Open Play' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                      Select Open Play Session
                    </label>
                    <select
                      value={attachedToId}
                      onChange={(e) => setAttachedToId(e.target.value)}
                      className="w-full border border-[#222222]/20 bg-white p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                    >
                      <option value="">-- Choose Session --</option>
                      {openPlaySessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.court} · {s.dayOfWeek} ({s.startTime} - {s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                      Rental Duration
                    </label>
                    <select
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(e.target.value)}
                      className="w-full border border-[#222222]/20 bg-white p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                    >
                      <option value="1 Hour">1 Hour</option>
                      <option value="2 Hours">2 Hours</option>
                      <option value="Open Play Session">Open Play Session</option>
                      <option value="Full Day">Full Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6B756B] mb-1">
                      Payment Option
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full border border-[#222222]/20 bg-white p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                    >
                      <option value="GCash">GCash (Online)</option>
                      <option value="Maya">Maya (Online)</option>
                      <option value="Online Gateway">Credit/Debit Gateway</option>
                      <option value="Pay at Counter">Pay at Counter</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222222]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#6B756B]">Total Rental Amount</p>
                    <p className="font-serif text-xl font-bold text-[#1E5336]">₱{selectedPaddle.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRentModalOpen(false)}
                      className="border border-[#222222]/20 px-4 py-2 text-xs font-bold uppercase text-[#6B756B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#1E5336] text-[#FDFBF7] px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#153b26]"
                    >
                      Confirm Rental
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
