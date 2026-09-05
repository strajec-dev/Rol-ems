'use client'

import { useState } from 'react'
import Link from 'next/link'
import { courts, courtSchedule } from '@/lib/data'
import type { Court } from '@/lib/data'
import { usePickleball } from '@/context/PickleballContext'
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, Check, ArrowRight, ArrowLeft,
  Volleyball, Disc, CreditCard, Banknote, CircleCheck
} from 'lucide-react'

type Step = 'courts' | 'schedule' | 'details' | 'review' | 'confirm'
type PaymentMethod = 'Online Payment' | 'Pay at Counter'

const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']

const statusConfig = {
  available: { label: 'AVAILABLE', badge: 'bg-[#1E5336] text-[#FDFBF7]' },
  reserved: { label: 'RESERVED', badge: 'bg-[#E1A728] text-[#1E5336]' },
  occupied: { label: 'IN USE / OCCUPIED', badge: 'bg-red-700 text-white' },
  'open-play': { label: 'OPEN PLAY', badge: 'bg-blue-800 text-white' },
}

const steps: { key: Step; label: string }[] = [
  { key: 'courts', label: 'Pick Court' },
  { key: 'schedule', label: 'Date & Time' },
  { key: 'details', label: 'Your Details & Paddle' },
  { key: 'review', label: 'Review & Pay' },
]

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function BookingPage() {
  const { paddles, rentPaddle, addReservation } = usePickleball()

  const [step, setStep] = useState<Step>('courts')
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [viewSchedule, setViewSchedule] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [hours, setHours] = useState(1)
  const [players, setPlayers] = useState(2)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('Online Payment')
  const [confirmedRef, setConfirmedRef] = useState('')

  // Paddle Rental Option
  const [addPaddle, setAddPaddle] = useState(false)
  const [selectedPaddleId, setSelectedPaddleId] = useState('')
  const [rentedPaddleName, setRentedPaddleName] = useState('')

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))

  const courtId = selectedCourt?.id || ''
  const schedule = courtSchedule[courtId] || []
  const bookedSlotLabels = schedule.filter((s) => s.status !== 'available').map((s) => s.time)

  const selectedPaddle = paddles.find((p) => p.id === selectedPaddleId)
  const paddleCost = addPaddle && selectedPaddle ? selectedPaddle.price : 0
  const hourlyRate = 350
  const courtTotal = hourlyRate * hours
  const total = courtTotal + paddleCost

  const canProceedSchedule = !!date && !!time
  const canProceedDetails = name.trim().length > 1 && contact.trim().length > 6
  const currentIndex = steps.findIndex((s) => s.key === step)

  const go = (s: Step) => setStep(s)

  const confirm = () => {
    let pRentalId: string | undefined = undefined
    let pRentalName: string | undefined = undefined

    if (addPaddle && selectedPaddle) {
      const pRental = rentPaddle({
        paddleId: selectedPaddle.id,
        paddleName: selectedPaddle.name,
        renterName: name,
        renterContact: contact,
        attachedToType: 'Court Booking',
        courtOrSession: `${selectedCourt?.name} (${date} @ ${time})`,
        date,
        time,
        duration: `${hours} Hour(s)`,
        totalPrice: selectedPaddle.price,
        paymentMethod: payment === 'Pay at Counter' ? 'Pay at Counter' : 'Online Gateway',
        paymentStatus: payment === 'Pay at Counter' ? 'pending' : 'paid',
        status: payment === 'Pay at Counter' ? 'Reserved' : 'Active',
      })
      pRentalId = pRental.id
      pRentalName = selectedPaddle.name
      setRentedPaddleName(selectedPaddle.name)
    }

    const res = addReservation({
      customerName: name,
      court: selectedCourt?.name || 'Court 1',
      date,
      time,
      duration: hours,
      players,
      paymentMethod: payment === 'Pay at Counter' ? 'Pay at Counter' : 'Online Gateway',
      paymentStatus: payment === 'Pay at Counter' ? 'pending' : 'paid',
      bookingStatus: 'confirmed',
      total,
      paddleRentalId: pRentalId,
      paddleRentalName: pRentalName,
    })

    setConfirmedRef(res.bookingId)
    setStep('confirm')
  }

  const reset = () => {
    setStep('courts')
    setSelectedCourt(null)
    setDate(''); setTime(''); setHours(1); setPlayers(2)
    setName(''); setContact('')
    setAddPaddle(false); setSelectedPaddleId('')
    setPayment('Online Payment')
    setViewSchedule(null)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Header */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Reservation</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Book a Pickleball Court</h1>
          <p className="mt-2 text-sm text-[#6B756B]">Reserve an entire private court for your selected date and time.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {step !== 'confirm' && (
          <div className="mb-8 border-b border-[#222222]/10 bg-[#FDFBF7] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              {steps.map((s, i) => {
                const isDone = i < currentIndex
                const isActive = i === currentIndex
                return (
                  <div key={s.key} className="flex flex-1 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isDone || isActive ? 'bg-[#1E5336] text-[#FDFBF7]' : 'border border-[#222222]/20 text-[#6B756B]'
                      }`}
                    >
                      {isDone ? <Check size={12} /> : i + 1}
                    </span>
                    <span className={`hidden text-[10px] uppercase tracking-[0.12em] sm:block ${isActive ? 'font-bold text-[#1E5336]' : isDone ? 'text-[#6B756B]' : 'text-[#6B756B]/60'}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP: SELECT COURT */}
        {step === 'courts' && (
          <div>
            <h2 className="font-serif text-2xl text-[#1E5336] mb-4">Which court would you like to reserve?</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {courts.map((c) => {
                const cfg = statusConfig[c.status]
                const isBookable = c.status === 'available'

                return (
                  <div key={c.id} className="border border-[#222222]/15 bg-[#FDFBF7] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-xl text-[#1E5336]">{c.name}</p>
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-4 text-[#6B756B]">{c.detail}</p>
                      <p className="mt-3 text-sm font-bold text-[#1E5336]">{c.price}</p>
                    </div>

                    <div className="mt-6 border-t border-[#222222]/10 pt-4 flex gap-2">
                      <button
                        onClick={() => setViewSchedule(viewSchedule === c.id ? null : c.id)}
                        className="flex-1 border border-[#222222]/20 py-2 text-[10px] uppercase tracking-[0.12em] text-[#6B756B] hover:border-[#1E5336]"
                      >
                        Schedule
                      </button>
                      <button
                        disabled={!isBookable}
                        onClick={() => {
                          setSelectedCourt(c)
                          go('schedule')
                        }}
                        className={`flex-1 py-2 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                          isBookable ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                        }`}
                      >
                        {isBookable ? 'Book Court' : 'Occupied'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP: SCHEDULE */}
        {step === 'schedule' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Selected Court</p>
            <h2 className="font-serif text-3xl text-[#1E5336] mt-1">{selectedCourt?.name}</h2>
            
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="relative">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Date</span>
                <button
                  type="button"
                  onClick={() => { setCalendarOpen((v) => !v); setTimeOpen(false) }}
                  className="mt-2 flex w-full items-center justify-between border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none"
                >
                  <span className={date ? '' : 'text-[#6B756B]/50'}>{date || 'Select a date'}</span>
                  <CalendarDays size={16} className="text-[#1E5336]" />
                </button>
                {calendarOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 border border-[#222222]/15 bg-[#FDFBF7] p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <button onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1 text-[#6B756B]"><ChevronLeft size={16} /></button>
                      <span className="text-sm font-bold text-[#1E5336]">{monthLabel}</span>
                      <button onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1 text-[#6B756B]"><ChevronRight size={16} /></button>
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="pb-1 text-[10px] uppercase text-[#6B756B]">{d}</span>
                      ))}
                      {cells.map((c, i) => {
                        if (!c) return <span key={i} />
                        const iso = isoDate(c)
                        const disabled = c < today
                        const selected = iso === date
                        return (
                          <button
                            key={i}
                            disabled={disabled}
                            onClick={() => { setDate(iso); setCalendarOpen(false) }}
                            className={`h-8 text-xs ${selected ? 'bg-[#1E5336] text-[#FDFBF7] font-bold' : disabled ? 'text-[#6B756B]/30' : 'hover:bg-[#E1A728]'}`}
                          >
                            {c.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Start Time</span>
                <button
                  type="button"
                  onClick={() => { setTimeOpen((v) => !v); setCalendarOpen(false) }}
                  className="mt-2 flex w-full items-center justify-between border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none"
                >
                  <span className={time ? '' : 'text-[#6B756B]/50'}>{time || 'Select start time'}</span>
                  <Clock size={16} className="text-[#1E5336]" />
                </button>
                {timeOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto border border-[#222222]/15 bg-[#FDFBF7] p-2 shadow-xl">
                    {timeSlots.map((slot) => {
                      const taken = bookedSlotLabels.includes(slot)
                      return (
                        <button
                          key={slot}
                          disabled={taken}
                          onClick={() => { setTime(slot); setTimeOpen(false) }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                            taken ? 'cursor-not-allowed text-[#6B756B]/40 line-through' : time === slot ? 'bg-[#1E5336] text-[#FDFBF7] font-bold' : 'hover:bg-[#E1A728]'
                          }`}
                        >
                          <span>{slot}</span>
                          {taken && <span className="text-[9px] uppercase">Booked</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-[#222222]/10 pt-6">
              <button onClick={() => go('courts')} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                disabled={!canProceedSchedule}
                onClick={() => go('details')}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-[0.16em] ${
                  canProceedSchedule ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: DETAILS & PADDLE RENTAL */}
        {step === 'details' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Reservation Info</p>
            <h2 className="font-serif text-3xl text-[#1E5336] mt-1">Player Details & Paddle Add-on</h2>
            
            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Contact Number</span>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </label>
            </div>

            {/* Optional Paddle Rental Integration */}
            <div className="mt-6 border border-[#1E5336]/20 bg-emerald-50/40 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="courtPaddleRent"
                  checked={addPaddle}
                  onChange={(e) => setAddPaddle(e.target.checked)}
                  className="h-4 w-4 text-[#1E5336]"
                />
                <label htmlFor="courtPaddleRent" className="font-serif font-bold text-[#1E5336] cursor-pointer text-sm">
                  Add Paddle Rental to this Court Booking?
                </label>
              </div>

              {addPaddle && (
                <div className="mt-3 space-y-2 text-xs">
                  <label className="block font-bold text-[#6B756B]">Choose Available Paddle:</label>
                  <select
                    value={selectedPaddleId}
                    onChange={(e) => setSelectedPaddleId(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  >
                    <option value="">-- Select Paddle --</option>
                    {paddles
                      .filter((p) => p.availability === 'Available' && p.quantityAvailable > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type}) – ₱{p.price} / rental
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between border-t border-[#222222]/10 pt-6">
              <button onClick={() => go('schedule')} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                disabled={!canProceedDetails}
                onClick={() => go('review')}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-[0.16em] ${
                  canProceedDetails ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: REVIEW & PAY */}
        {step === 'review' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Final Step</p>
            <h2 className="font-serif text-3xl text-[#1E5336] mt-1">Review & Payment Method</h2>

            <div className="mt-6 divide-y divide-[#222222]/10 border border-[#222222]/15 text-sm">
              <div className="flex justify-between px-4 py-3"><span className="text-[#6B756B]">Court</span><span>{selectedCourt?.name}</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-[#6B756B]">Date & Time</span><span>{date} · {time}</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-[#6B756B]">Reserved by</span><span>{name} ({contact})</span></div>
              {addPaddle && selectedPaddle && (
                <div className="flex justify-between px-4 py-3 bg-emerald-50/60">
                  <span className="text-[#1E5336] font-bold">Paddle Rental Add-on</span>
                  <span className="font-bold text-[#1E5336]">{selectedPaddle.name} (+₱{selectedPaddle.price})</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 bg-[#F3F0EC]"><span className="font-bold">Total Amount</span><span className="font-serif text-xl font-bold text-[#1E5336]">₱{total}</span></div>
            </div>

            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Payment Options</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['Online Payment', 'Pay at Counter'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`border px-4 py-3 text-[10px] uppercase tracking-[0.12em] font-bold ${
                      payment === m ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]' : 'border-[#222222]/20 text-[#6B756B]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-[#222222]/10 pt-6">
              <button onClick={() => go('details')} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={confirm}
                className="flex items-center gap-2 bg-[#E1A728] px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1E5336] hover:bg-[#c48e1a]"
              >
                Confirm & Book Court <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP: CONFIRMED */}
        {step === 'confirm' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-8 text-center max-w-md mx-auto">
            <CircleCheck size={48} className="mx-auto text-[#1E5336]" />
            <h2 className="font-serif text-3xl text-[#1E5336] mt-4">Court Reserved</h2>
            <p className="text-xs text-[#6B756B] mt-2">Reference: <strong className="text-[#1E5336]">{confirmedRef}</strong></p>

            <div className="mt-6 border border-[#222222]/15 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between"><span className="text-[#6B756B]">Court</span><span>{selectedCourt?.name}</span></div>
              <div className="flex justify-between"><span className="text-[#6B756B]">Date & Time</span><span>{date} · {time}</span></div>
              {rentedPaddleName && (
                <div className="flex justify-between text-[#1E5336] font-bold">
                  <span>Paddle Rental</span>
                  <span>{rentedPaddleName}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-[#6B756B]">Payment</span><span>{payment}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span className="text-[#6B756B]">Total</span><span>₱{total}</span></div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={reset} className="flex-1 border border-[#1E5336] py-3 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
                Book Another
              </button>
              <Link href="/" className="flex-1 bg-[#1E5336] py-3 text-center text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7]">
                Back to Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
