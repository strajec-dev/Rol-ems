'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { pickleballOptions } from '@/lib/data'

type Step = 'schedule' | 'details' | 'review' | 'confirm'

const paymentMethods = ['Cash', 'GCash', 'Maya', 'Bank Transfer', 'Online Gateway']

const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']

const steps: { key: Step; label: string }[] = [
  { key: 'schedule', label: 'Date & Time' },
  { key: 'details', label: 'Your details' },
  { key: 'review', label: 'Review & pay' },
]

export default function PickleballBookingForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('schedule')
  const [court, setCourt] = useState(pickleballOptions[0])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [hours, setHours] = useState(1)
  const [players, setPlayers] = useState(2)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [payment, setPayment] = useState('GCash')
  const [confirmedRef, setConfirmedRef] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const rateNumber = (label: string) => {
    const m = label.match(/₱([\d,]+)/)
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0
  }
  const hourlyRate = rateNumber(court.price)
  const totalPrice = `₱${(hourlyRate * hours).toLocaleString()} / ${hours} hr${hours > 1 ? 's' : ''}`

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
    if (step === 'schedule') setStep('details')
    else if (step === 'details') setStep('review')
    else if (step === 'review') {
      setConfirmedRef(`PB-${Math.floor(100000 + Math.random() * 900000)}`)
      setStep('confirm')
    }
  }

  const goBack = () => {
    if (step === 'details') setStep('schedule')
    else if (step === 'review') setStep('details')
  }

  const scheduleReady = date && time
  const detailsReady = name.trim().length > 1 && contact.trim().length > 5
  const canNext =
    (step === 'schedule' && !!scheduleReady) ||
    (step === 'details' && detailsReady) ||
    step === 'review'

  const currentIndex = steps.findIndex((s) => s.key === step)

  const reset = () => {
    setStep('schedule')
    setCourt(pickleballOptions[0])
    setDate(''); setTime(''); setHours(1); setPlayers(2); setName(''); setContact(''); setPayment('GCash')
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
        {step === 'schedule' && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 1 · Pick your court</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Which pickleball court?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {pickleballOptions.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCourt(c)}
                  className={`p-5 text-left transition ${court.name === c.name ? 'border-2 border-[#1E5336] bg-[#F3F0EC]' : 'border border-[#222222]/15 hover:border-[#1E5336]/40'}`}
                >
                  <p className="font-serif text-lg text-[#1E5336]">{c.name}</p>
                  <p className="mt-1 text-[11px] leading-4 text-[#6B756B]">{c.detail}</p>
                  <p className="mt-3 text-sm font-bold text-[#1E5336]">{c.price}</p>
                </button>
              ))}
            </div>

            <p className="mt-8 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 2 · Date & time</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">When are you playing?</h2>
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
                        const disabled = c < today
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
                                : disabled
                                ? 'text-[#6B756B]/30'
                                : 'text-[#222222] hover:bg-[#E1A728] hover:text-[#1E5336]'
                            }`}
                          >
                            {c.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Start time</span>
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
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setTime(slot)
                          setTimeOpen(false)
                        }}
                        className={`block w-full px-3 py-2 text-left text-sm transition ${time === slot ? 'bg-[#1E5336] font-bold text-[#FDFBF7]' : 'text-[#222222] hover:bg-[#E1A728] hover:text-[#1E5336]'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Duration (hours)</span>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setHours((h) => Math.max(1, h - 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">−</button>
                  <span className="w-10 text-center text-xl font-bold text-[#1E5336]">{hours}</span>
                  <button onClick={() => setHours((h) => Math.min(4, h + 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">+</button>
                </div>
              </div>
              <div className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Players</span>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setPlayers((p) => Math.max(2, p - 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">−</button>
                  <span className="w-10 text-center text-xl font-bold text-[#1E5336]">{players}</span>
                  <button onClick={() => setPlayers((p) => Math.min(8, p + 1))} className="h-10 w-10 border border-[#222222]/20 text-lg">+</button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 3 · Your details</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Who is reserving the court?</h2>
            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#6B756B]/50 focus:border-[#1E5336]"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Contact number</span>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#6B756B]/50 focus:border-[#1E5336]"
                />
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
                <span className="text-[#6B756B]">Court</span>
                <span>{court.name}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Date & time</span>
                <span>{date} · {time}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Duration</span>
                <span>{hours} hr{hours > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Players</span>
                <span>{players}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Reserved by</span>
                <span>{name} · {contact}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Total</span>
                <span className="font-bold text-[#1E5336]">{totalPrice}</span>
              </div>
            </div>
            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Payment method</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`border px-3 py-2 text-[10px] uppercase tracking-[0.1em] ${payment === m ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]' : 'border-[#222222]/20 text-[#6B756B]'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E5336] text-[#FDFBF7]">
              <Check size={26} />
            </span>
            <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Court reserved</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
              {court.name} is on hold for {date} at {time}. A confirmation and receipt have been sent.
            </p>
            <div className="mt-6 w-full max-w-sm border border-[#222222]/15 p-4 text-left text-sm">
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Reference</span><span className="font-bold text-[#1E5336]">{confirmedRef}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Court</span><span>{court.name}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Date</span><span>{date} · {time}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Players</span><span>{players}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#6B756B]">Payment</span><span>{payment}</span></div>
              <div className="flex justify-between border-t border-[#222222]/15 pt-2 mt-2"><span className="text-[#6B756B]">Total</span><span className="font-bold text-[#1E5336]">{totalPrice}</span></div>
            </div>
          </div>
        )}
      </div>

      {step !== 'confirm' && (
        <div className="flex items-center justify-between border-t border-[#222222]/10 px-6 py-5">
          {step !== 'schedule' ? (
            <button onClick={goBack} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
              <ArrowLeft size={14} /> Back
            </button>
          ) : <span />}
          <button
            onClick={canNext ? goNext : undefined}
            disabled={!canNext}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-[0.16em] transition ${canNext ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'cursor-not-allowed bg-[#222222]/10 text-[#6B756B]'}`}
          >
            {step === 'review' ? 'Confirm & book' : 'Continue'} <ArrowRight size={14} />
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
