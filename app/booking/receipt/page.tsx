'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Printer } from 'lucide-react'
import type { BookingRecord } from '@/lib/bookings'

function ReceiptContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const [booking, setBooking] = useState<BookingRecord | null>(null)
  const [state, setState] = useState<'loading' | 'found' | 'notfound' | 'error'>('loading')

  useEffect(() => {
    if (!ref) { setState('notfound'); return }
    fetch(`/api/bookings?reference=${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then((data) => {
        const found = Array.isArray(data) && data.length > 0 ? data[0] : null
        if (found) { setBooking(found); setState('found') }
        else setState('notfound')
      })
      .catch(() => setState('error'))
  }, [ref])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F0EC]">
        <p className="text-sm text-[#6B756B]">Loading receipt…</p>
      </div>
    )
  }

  if (state === 'notfound' || state === 'error' || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F0EC]">
        <div className="bg-[#FDFBF7] p-10 text-center shadow-xl">
          <p className="text-sm font-semibold text-[#222222]">Receipt not found</p>
          <p className="mt-2 text-xs text-[#6B756B]">Check the reference and try again.</p>
          <a href="/" className="mt-6 inline-block text-xs uppercase tracking-[0.14em] text-[#1E5336] underline">
            Back to home
          </a>
        </div>
      </div>
    )
  }

  const formatPeso = (v: number) =>
    `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const rows: [string, string][] = [
    ['Reference', booking.reference],
    ['Booking', booking.itemName],
    ['Date & Time', `${booking.date} · ${booking.time}`],
    ...(booking.nights ? [['Nights', String(booking.nights)] as [string, string]] : []),
    ...(booking.hours ? [['Hours', String(booking.hours)] as [string, string]] : []),
    ['Guests', String(booking.guests)],
    ['Guest name', booking.name || '—'],
    ['Payment', booking.payment === 'cash' ? 'Pay at the venue' : 'Online (GCash / card)'],
    ['Status', booking.status.charAt(0).toUpperCase() + booking.status.slice(1)],
  ]

  return (
    <div className="min-h-screen bg-[#F3F0EC] px-4 py-12 print:bg-white print:p-0">
      {/* Print button — hidden when printing */}
      <div className="mx-auto mb-6 flex max-w-lg justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#1E5336] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] hover:bg-[#153d27]"
        >
          <Printer size={13} />
          Save as PDF / Print
        </button>
      </div>

      {/* Receipt card */}
      <div className="mx-auto max-w-lg bg-[#FDFBF7] shadow-2xl print:shadow-none">
        {/* Header */}
        <div className="bg-[#1E5336] px-8 py-7 text-center">
          <div className="font-serif text-xl tracking-[-0.5px] text-[#FDFBF7]">
            ROL-EMS <span className="text-[#E1A728]">×</span> REBAR
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[2px] text-[#E1A728]">
            Booking Receipt
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E5336] text-[#FDFBF7]">
              <Check size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#222222]">Reservation confirmed</p>
              <p className="text-xs text-[#6B756B]">Thank you, {booking.name || 'Guest'}!</p>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-[#222222]/10">
                  <td className="py-2.5 pr-4 text-xs text-[#6B756B]">{label}</td>
                  <td className="py-2.5 text-right font-medium text-[#222222]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="mt-4 flex justify-between border-t-2 border-[#1E5336] pt-3">
            <span className="text-sm font-bold text-[#222222]">
              {booking.payment === 'cash' ? 'Amount due at venue' : 'Total paid'}
            </span>
            <span className="text-sm font-bold text-[#1E5336]">{formatPeso(booking.amount)}</span>
          </div>

          <p className="mt-8 text-[11px] leading-5 text-[#6B756B]">
            We look forward to hosting you. If you have any questions, contact us at the resort
            or reply to your confirmation email.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-[#222222]/10 px-8 py-4 text-center text-[10px] text-[#6B756B]">
          ROL-EMS · REBAR Resort &amp; Sports Complex
        </div>
      </div>
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F3F0EC]">
          <p className="text-sm text-[#6B756B]">Loading receipt…</p>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  )
}
