export type BookingRecord = {
  reference: string
  facility: string
  itemName: string
  date: string
  time: string
  nights?: number
  hours?: number
  guests: number
  name?: string
  contact?: string
  email?: string
  amount: number
  payment: string
  status: string
  createdAt: string
}

const toMinutes = (timeLabel: string): number => {
  const m = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = (m[3] || '').toUpperCase()
  if (ap === 'PM' && h < 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + min
}

export async function getBookings(): Promise<BookingRecord[]> {
  try {
    const res = await fetch('/api/bookings', { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getBookedTimes(facility: string, date: string, nights: number = 1): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      facility,
      date,
      nights: String(nights),
    })
    const res = await fetch(
      `/api/bookings/availability/booked?${params.toString()}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.times) ? data.times : []
  } catch {
    return []
  }
}

export async function getBlockedDates(facility: string, month: string): Promise<string[]> {
  try {
    const res = await fetch(
      `/api/bookings/availability/calendar?facility=${encodeURIComponent(facility)}&month=${encodeURIComponent(month)}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.dates) ? data.dates : []
  } catch {
    return []
  }
}

export function isTimeTaken(
  time: string,
  bookedTimes: string[],
  durationMinutes: number = 0,
): boolean {
  const wanted = { start: toMinutes(time), end: toMinutes(time) + durationMinutes }
  return bookedTimes.some((bt) => {
    const ex = { start: toMinutes(bt), end: toMinutes(bt) }
    return wanted.start < ex.end && ex.start < wanted.end
  })
}

export async function addBooking(
  booking: Omit<BookingRecord, 'reference' | 'createdAt' | 'status'>,
): Promise<BookingRecord> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const err = new Error(data?.error || 'Could not create booking') as Error & { conflict?: boolean }
    if (res.status === 409) err.conflict = true
    throw err
  }
  return await res.json()
}
