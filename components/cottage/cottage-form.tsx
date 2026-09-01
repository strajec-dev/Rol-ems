'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Loader2, Wallet } from 'lucide-react'
import { cottageAddOns, cottageOptions, eventAddOns, eventVenues } from '@/lib/data'
import { addBooking, getBlockedDates, getBookedTimes, type BookingRecord } from '@/lib/bookings'

type Step = 'type' | 'schedule' | 'details' | 'review' | 'confirm'

type BookingType = 'day' | 'overnight' | 'event'

type BookingKind = 'cottage' | 'event'

const paymentMethods = [
  { id: 'online', label: 'Pay online (GCash, card, e-wallets)' },
  { id: 'cash', label: 'Pay at the venue' },
]

const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']

const steps: { key: Step; label: string }[] = [
  { key: 'type', label: 'Booking' },
  { key: 'schedule', label: 'Date & Time' },
  { key: 'details', label: 'Your details' },
  { key: 'review', label: 'Review & pay' },
]

export default function CottageBookingForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('type')
  const [kind, setKind] = useState<BookingKind>('cottage')
  const [bookingType, setBookingType] = useState<BookingType>('day')
  const [cottage, setCottage] = useState(cottageOptions[0])
  const [venue, setVenue] = useState(eventVenues[0])
  const [nights, setNights] = useState(1)
  const [eventDetails, setEventDetails] = useState('')
  const [addOns, setAddOns] = useState<Record<string, number>>({})
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(4)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [payment, setPayment] = useState('online')
  const [paying, setPaying] = useState(false)
  const [confirmedRef, setConfirmedRef] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [blockedDates, setBlockedDates] = useState<string[]>([])

  const facilityKey = kind === 'event' ? `event:${venue.name}` : `cottage:${cottage.name}`

  useEffect(() => {
    let active = true
    if (!date) {
      setBookedTimes([])
      return
    }
    setLoadingSlots(true)
    const spanNights = kind === 'event' || bookingType !== 'overnight' ? 1 : nights
    getBookedTimes(facilityKey, date, spanNights).then((times) => {
      if (active) setBookedTimes(times)
    }).finally(() => {
      if (active) setLoadingSlots(false)
    })
    return () => {
      active = false
    }
  }, [facilityKey, date, bookingType, nights, kind])

  useEffect(() => {
    let active = true
    if (!calendarOpen) return
    const month = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}`
    getBlockedDates(facilityKey, month).then((dates) => {
      if (active) setBlockedDates(dates)
    })
    return () => {
      active = false
    }
  }, [calendarOpen, facilityKey, viewMonth])

  const capacity = kind === 'event' ? (venue.capacity ?? 50) : (cottage.capacity ?? 8)

  const isoDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))

  const shiftMonth = (delta: number) => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  const pickDate = (d: Date, disabled: boolean) => {
    if (disabled) return
    setDate(isoDate(d))
    setCalendarOpen(false)
  }

  const goNext = () => {
    if (step === 'type') setStep('schedule')
    else if (step === 'schedule') setStep('details')
    else if (step === 'details') setStep('review')
  }

  const persistBooking = async () => {
    const addOnText = selectedAddons.length > 0 ? ` · ${formatAddOns()}` : ''
    const label =
      kind === 'event'
        ? `Event · ${venue.name}${addOnText}`
        : bookingType === 'overnight'
        ? `Cottage · ${cottage.name} (${nights} night${nights > 1 ? 's' : ''})${addOnText}`
        : `Cottage · ${cottage.name} (day rental)${addOnText}`
    const record = await addBooking({
      facility: facilityKey,
      itemName: label,
      date,
      time,
      nights: kind === 'event' ? undefined : nights,
      guests,
      name,
      contact,
      email,
      amount: chargeAmount,
      payment,
    })
    setConfirmedRef(record.reference)
    return record
  }

  const goBack = () => {
    if (step === 'schedule') setStep('type')
    else if (step === 'details') setStep('schedule')
    else if (step === 'review') setStep('details')
  }

  const rateNumber = (label: string) => {
    const m = label.match(/₱([\d,]+)/)
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0
  }
  const baseRate = rateNumber(cottage.price)
  const eventRate = rateNumber(venue.price)

  const activeAddOns = kind === 'event' ? eventAddOns : cottageAddOns

  const selectedAddons = activeAddOns.filter((a) => (addOns[a.id] || 0) > 0)
  const addOnCost = selectedAddons.reduce((sum, a) => sum + a.price * (addOns[a.id] || 0), 0)
  const formatAddOns = () => selectedAddons.map((a) => `${a.name} ×${addOns[a.id]}`).join(', ')

  let chargeAmount = 0
  let totalPrice = ''
  if (kind === 'event') {
    chargeAmount = eventRate + addOnCost
    if (chargeAmount > 0) {
      const parts = [eventRate > 0 ? `₱${eventRate.toLocaleString()}` : 'Venue fee (on request)']
      if (addOnCost > 0) parts.push(`+₱${addOnCost.toLocaleString()} add-ons`)
      totalPrice = `${parts.join(' · ')} / event`
    } else {
      totalPrice = 'Event fee on request'
    }
  } else {
    chargeAmount = baseRate * nights + addOnCost
    const block = bookingType === 'overnight'
      ? `₱${(baseRate * nights).toLocaleString()} / ${nights} night${nights > 1 ? 's' : ''}`
      : cottage.price
    totalPrice = addOnCost > 0 ? `${block} · +₱${addOnCost.toLocaleString()} add-ons` : block
  }

  const slotTaken = date && time && bookedTimes.length > 0

  const scheduleReady = date && time && !slotTaken
  const nameValid = !/[^A-Za-z\s]/.test(name) && name.trim().length > 0
  const contactValid = !/[^\d\s]/.test(contact) && contact.trim().length > 5
  const emailValid = email === '' || /\S+@\S+\.\S+/.test(email)
  const detailsReady = nameValid && contactValid && emailValid && (payment !== 'online' || email.trim().length > 0)
  const canNext =
    (step === 'type') ||
    (step === 'schedule' && !!scheduleReady) ||
    (step === 'details' && detailsReady) ||
    (step === 'review' && (chargeAmount > 0 || payment === 'cash'))

  const doCheckout = async () => {
    let record: BookingRecord
    try {
      record = await persistBooking()
    } catch (err) {
      const conflict = (err as Error & { conflict?: boolean }).conflict
      if (conflict) {
        alert((err as Error).message || 'This slot is no longer available. Please pick another date or time.')
        setStep('schedule')
        return
      }
      alert((err as Error).message || 'Could not create your booking. Please try again.')
      return
    }

    if (payment === 'cash') {
      setStep('confirm')
      return
    }

    const addOnText = selectedAddons.length > 0 ? ` · ${formatAddOns()}` : ''
    const bookingLabel =
      kind === 'event'
        ? `Event · ${venue.name}${addOnText}`
        : bookingType === 'overnight'
        ? `Cottage · ${cottage.name} (${nights} night${nights > 1 ? 's' : ''})${addOnText}`
        : `Cottage · ${cottage.name} (day rental)${addOnText}`

    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          email,
          amount: chargeAmount,
          description: `ROL-EMS · ${bookingLabel} · ${date} at ${time}`,
          metadata: {
            reference: record.reference,
            booking: bookingLabel,
            date,
            time,
            guests,
            nights: kind === 'event' ? undefined : nights,
            eventDetails: kind === 'event' ? eventDetails : undefined,
            addOns: selectedAddons.length > 0 ? formatAddOns() : undefined,
          },
        }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        if (data.id) localStorage.setItem('paymongo_session_id', data.id)
        window.location.href = data.checkout_url
        return
      }
      throw new Error(data.error || 'Payment could not start')
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error && err.message ? err.message : 'Something went wrong starting your payment. Please try again.'
      alert(msg)
    } finally {
      setPaying(false)
    }
  }

  const currentIndex = steps.findIndex((s) => s.key === step)

  const reset = () => {
    setStep('type')
    setKind('cottage')
    setBookingType('day')
    setCottage(cottageOptions[0])
    setVenue(eventVenues[0])
    setNights(1)
    setEventDetails('')
    setAddOns({})
    setDate(''); setTime(''); setGuests(4); setName(''); setContact(''); setEmail(''); setPayment('online'); setPaying(false)
  }

  return (
    <div className="mx-auto w-full max-w-2xl bg-[#FDFBF7] text-[#222222] shadow-2xl">
      {step !== 'confirm' && (
        <div className="border-b border-[#222222]/10 px-6 py-5">
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

      <div className="px-6 py-6">
        {step === 'type' && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 1 · Choose your booking</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">What are you booking?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setKind('cottage')}
                className={`p-5 text-left transition ${kind === 'cottage' ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
              >
                <p className="font-serif text-lg text-[#1E5336]">Cottage</p>
                <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">Rent a cottage by the beach</p>
              </button>
              <button
                onClick={() => setKind('event')}
                className={`p-5 text-left transition ${kind === 'event' ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
              >
                <p className="font-serif text-lg text-[#1E5336]">Event</p>
                <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">Whole-area / event venue</p>
              </button>
            </div>

            {kind === 'cottage' && (
              <div className="mt-6">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">How long are you renting?</span>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setBookingType('day')}
                    className={`p-5 text-left transition ${bookingType === 'day' ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
                  >
                    <p className="font-serif text-lg text-[#1E5336]">Day rental</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">Day trip · check out same day</p>
                    <p className="mt-3 text-sm font-bold text-[#1E5336]">{cottage.price}</p>
                  </button>
                  <button
                    onClick={() => { setBookingType('overnight'); setNights(1) }}
                    className={`p-5 text-left transition ${bookingType === 'overnight' ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
                  >
                    <p className="font-serif text-lg text-[#1E5336]">Overnight</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">Stay overnight · pick nights</p>
                    <p className="mt-3 text-sm font-bold text-[#1E5336]">{cottage.price} / night</p>
                  </button>
                </div>

                <div className="mt-8">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Choose your cottage</span>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {cottageOptions.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => { setCottage(c); setGuests((g) => Math.min(g, c.capacity ?? 8)) }}
                        className={`p-4 text-left transition ${cottage.name === c.name ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
                      >
                        <p className="font-serif text-lg text-[#1E5336]">{c.name}</p>
                        <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">{c.detail}</p>
                        <p className="mt-3 text-sm font-bold text-[#1E5336]">{c.price}</p>
                        {c.capacity && <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">Up to {c.capacity} guests</p>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {kind === 'event' && (
              <div className="mt-6">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Choose your venue</span>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {eventVenues.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => { setVenue(v); setGuests((g) => Math.min(g, v.capacity ?? 50)) }}
                      className={`p-5 text-left transition ${venue.name === v.name ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
                    >
                      <p className="font-serif text-lg text-[#1E5336]">{v.name}</p>
                      <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">{v.detail}</p>
                      <p className="mt-3 text-sm font-bold text-[#1E5336]">{v.price}</p>
                      {v.capacity && <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">Up to {v.capacity} guests</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === 'schedule' && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 2 · Reservation date & time</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">When are you coming?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="relative block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Date</span>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="mt-2 flex w-full items-center justify-between border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none hover:border-[#1E5336]/50"
                >
                  <span className={date ? '' : 'text-[#6B756B]/50'}>{date || 'Select a date'}</span>
                  <CalendarDays size={16} className="text-[#1E5336]" />
                </button>
                {calendarOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 border border-[#222222]/15 bg-[#FDFBF7] p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => shiftMonth(-1)} className="p-1 text-[#6B756B] hover:text-[#1E5336]">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-bold text-[#1E5336]">{monthLabel}</span>
                      <button type="button" onClick={() => shiftMonth(1)} className="p-1 text-[#6B756B] hover:text-[#1E5336]">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="pb-1 text-[10px] uppercase text-[#6B756B]">{d}</span>
                      ))}
                      {cells.map((c, i) => {
                        if (!c) return <span key={i} />
                        const iso = isoDate(c)
                        const booked = blockedDates.includes(iso)
                        const past = c < today
                        const disabled = past || booked
                        const selected = iso === date
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={disabled}
                            onClick={() => pickDate(c, disabled)}
                            className={`h-8 text-xs transition ${
                              selected
                                ? 'bg-[#1E5336] font-bold text-[#FDFBF7]'
                                : booked
                                ? 'bg-[#222222]/8 text-[#6B756B]/50 line-through'
                                : past
                                ? 'text-[#6B756B]/30'
                                : 'text-[#222222] hover:bg-[#E1A728] hover:text-[#1E5336]'
                            }`}
                          >
                            {c.getDate()}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#222222]/10 pt-3 text-[10px] text-[#6B756B]">
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1E5336]" /> Available</span>
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#222222]/30" /> Booked</span>
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E1A728]" /> Today / past</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Arrival time</span>
                <button
                  type="button"
                  onClick={() => setTimeOpen((v) => !v)}
                  className="mt-2 flex w-full items-center justify-between border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none hover:border-[#1E5336]/50"
                >
                  <span className={time ? '' : 'text-[#6B756B]/50'}>{time || 'Select a time'}</span>
                  <Clock size={16} className="text-[#1E5336]" />
                </button>
                {timeOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto border border-[#222222]/15 bg-[#FDFBF7] p-2 shadow-xl">
                    {timeSlots.map((slot) => {
                      const taken = date && !loadingSlots ? bookedTimes.length > 0 : false
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={taken}
                          onClick={() => {
                            setTime(slot)
                            setTimeOpen(false)
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                            taken
                              ? 'cursor-not-allowed text-[#6B756B]/40 line-through'
                              : time === slot
                              ? 'bg-[#1E5336] font-bold text-[#FDFBF7]'
                              : 'text-[#222222] hover:bg-[#E1A728] hover:text-[#1E5336]'
                          }`}
                        >
                          {slot}
                          {taken && <span className="text-[9px] uppercase tracking-[0.1em] not-italic line-through">Booked</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Guests (up to {capacity})</span>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">−</button>
                <span className="w-10 text-center text-xl font-bold text-[#1E5336]">{guests}</span>
                <button onClick={() => setGuests((g) => Math.min(capacity, g + 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">+</button>
              </div>
            </div>
            {bookingType === 'overnight' && (
              <div className="mt-6">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Number of nights</span>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setNights((n) => Math.max(1, n - 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">−</button>
                  <span className="w-10 text-center text-xl font-bold text-[#1E5336]">{nights}</span>
                  <button onClick={() => setNights((n) => Math.min(14, n + 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">+</button>
                </div>
              </div>
            )}
            {kind === 'event' && (
              <div className="mt-6">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Event type</span>
                <input
                  type="text"
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  placeholder="e.g. Wedding, birthday, team building"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#6B756B]/50 focus:border-[#1E5336]"
                />
              </div>
            )}

            <div className="mt-8">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                {kind === 'event' ? 'Event add-ons' : 'Stay add-ons'} (optional)
              </span>
              <div className="mt-3 divide-y divide-[#222222]/10 border border-[#222222]/15">
                {activeAddOns.map((a) => {
                  const qty = addOns[a.id] || 0
                  return (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#222222]">
                          {a.name}
                          <span className="ml-2 font-normal text-[#1E5336]">
                            {a.price > 0 ? `₱${a.price.toLocaleString()} / ${a.unit}` : 'Quote on request'}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#6B756B]">{a.detail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {qty > 0 && <span className="text-sm font-bold text-[#1E5336]">₱{(a.price * qty).toLocaleString()}</span>}
                        <button onClick={() => setAddOns((s) => ({ ...s, [a.id]: Math.max(0, qty - 1) }))} className="h-8 w-8 border border-[#222222]/20 text-lg leading-none">−</button>
                        <span className="w-6 text-center text-sm font-bold text-[#1E5336]">{qty}</span>
                        <button onClick={() => setAddOns((s) => ({ ...s, [a.id]: qty + 1 }))} className="h-8 w-8 border border-[#222222]/20 text-lg leading-none">+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {date && time && (
              <div className="mt-8 flex items-center justify-between border border-[#1E5336]/20 bg-[#F3F0EC] px-4 py-3">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Estimated total</span>
                <span className="text-sm font-bold text-[#1E5336]">{totalPrice}</span>
              </div>
            )}
          </>
        )}

        {step === 'details' && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 3 · Your details</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Who is the booking for?</h2>
            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className={`mt-2 w-full border bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#6B756B]/50 focus:border-[#1E5336] ${
                    name === '' ? 'border-[#222222]/20' : nameValid ? 'border-green-600' : 'border-red-600'
                  }`}
                />
                {name !== '' && !nameValid && (
                  <span className="mt-1.5 block text-[10px] text-red-600">Letters only — no numbers or symbols.</span>
                )}
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Contact number</span>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className={`mt-2 w-full border bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#6B756B]/50 focus:border-[#1E5336] ${
                    contact === '' ? 'border-[#222222]/20' : contactValid ? 'border-green-600' : 'border-red-600'
                  }`}
                />
                {contact !== '' && !contactValid && (
                  <span className="mt-1.5 block text-[10px] text-red-600">Numbers only — no letters or symbols.</span>
                )}
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Email {payment === 'online' ? <span className="normal-case text-red-600">(required for online payment)</span> : <span className="normal-case text-[#6B756B]/60">(optional)</span>}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maria@gmail.com"
                  className={`mt-2 w-full border bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#6B756B]/50 focus:border-[#1E5336] ${
                    email === '' ? 'border-[#222222]/20' : emailValid ? 'border-green-600' : 'border-red-600'
                  }`}
                />
                {email !== '' && !emailValid && (
                  <span className="mt-1.5 block text-[10px] text-red-600">Please enter a valid email address.</span>
                )}
                <span className="mt-1.5 block text-[10px] text-[#6B756B]/70">We'll send your receipt and confirmation here after booking.</span>
              </label>
            </div>
          </>
        )}

        {step === 'review' && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 4 · Review & payment</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Almost there.</h2>
            <div className="mt-6 divide-y divide-[#222222]/10 border border-[#222222]/15">
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Booking</span>
                <span>{kind === 'event' ? 'Event' : bookingType === 'day' ? 'Day rental' : `Overnight · ${nights} night${nights > 1 ? 's' : ''}`}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Cottage / venue</span>
                <span>{kind === 'event' ? venue.name : cottage.name}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Date & time</span>
                <span>{date} · {time}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Guests</span>
                <span>{guests}</span>
              </div>
              {kind === 'event' && (
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-[#6B756B]">Event</span>
                  <span>{eventDetails || '—'}</span>
                </div>
              )}
              {kind === 'event' && selectedAddons.length > 0 && (
                <div className="px-4 py-3 text-sm">
                  <span className="text-[#6B756B]">Add-ons</span>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    {selectedAddons.map((a) => (
                      <span key={a.id} className="text-[#222222]">
                        {a.name} ×{addOns[a.id]}
                        <span className="ml-1 text-[#6B756B]">₱{(a.price * (addOns[a.id] || 0)).toLocaleString()}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Guest</span>
                <span>{name} · {contact}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Email</span>
                <span>{email || '—'}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Total</span>
                <span className="font-bold text-[#1E5336]">{totalPrice}</span>
              </div>
            </div>
            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Payment method</span>
              <div className="mt-2 flex flex-col gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition ${payment === m.id ? 'border-[#1E5336] bg-[#F3F0EC] text-[#1E5336]' : 'border-[#222222]/20 text-[#6B756B] hover:border-[#1E5336]/40'}`}
                  >
                    <span className="flex items-center gap-2.5">
                      {m.id === 'online' ? <Wallet size={16} /> : <span className="h-4 w-4 rounded-full border border-current" />}
                      {m.label}
                    </span>
                    <span className={`h-3 w-3 rounded-full border border-current ${payment === m.id ? 'bg-current' : ''}`} />
                  </button>
                ))}
              </div>
              {payment === 'online' && (
                <p className="mt-2 text-[10px] text-[#6B756B]">
                  You&apos;ll be redirected to our payment page to pay by GCash, card, PayPal, or other e-wallets.
                </p>
              )}
            </div>
          </>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E5336] text-[#FDFBF7]">
              <Check size={26} />
            </span>
            <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Reservation confirmed</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
              Your {kind === 'event' ? 'event venue' : 'cottage rental'} is on hold for {date} at {time}. A confirmation and receipt have been sent.
            </p>
            <div className="mt-6 w-full max-w-sm border border-[#222222]/15 p-4 text-left text-sm">
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Reference</span><span className="font-bold text-[#1E5336]">{confirmedRef}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Booking</span><span>{kind === 'event' ? 'Event' : bookingType === 'day' ? 'Day rental' : `Overnight · ${nights} night${nights > 1 ? 's' : ''}`}</span></div>
              {kind === 'event' && selectedAddons.length > 0 && (
                <div className="flex justify-between py-1"><span className="text-[#6B756B]">Add-ons</span><span>{formatAddOns()}</span></div>
              )}
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Guest</span><span>{name}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Payment</span><span>{payment === 'online' ? 'Online (GCash / card)' : 'Pay at the venue'}</span></div>
              <div className="flex justify-between border-t border-[#222222]/15 pt-2 mt-2"><span className="text-[#6B756B]">Total</span><span className="font-bold text-[#1E5336]">{totalPrice}</span></div>
            </div>
          </div>
        )}
      </div>

      {step !== 'confirm' && (
        <div className="flex items-center justify-between border-t border-[#222222]/10 px-6 py-5">
          {step !== 'type' ? (
            <button onClick={goBack} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
              <ArrowLeft size={14} /> Back
            </button>
          ) : <span />}
          <button
            onClick={canNext ? (step === 'review' ? doCheckout : goNext) : undefined}
            disabled={!canNext || paying}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-[0.16em] transition ${canNext && !paying ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'cursor-not-allowed bg-[#222222]/10 text-[#6B756B]'}`}
          >
            {paying ? (
              <><Loader2 size={14} className="animate-spin" /> Starting payment…</>
            ) : step === 'review' ? (
              payment === 'online' ? 'Pay now' : 'Confirm & book'
            ) : (
              <>Continue <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex justify-center border-t border-[#222222]/10 px-6 py-5">
          <button
            onClick={() => {
              reset()
              onDone()
            }}
            className="border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}