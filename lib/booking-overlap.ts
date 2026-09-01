export type BookingShape = {
  date: string
  nights?: number | null
}

export type StoredBooking = BookingShape & {
  status: string
  createdAt?: Date | string
}

export type DateRange = { start: Date; end: Date }

// How long an in-progress (pending) booking holds a slot after it was created
// before it is treated as abandoned/expired and released.
export const PENDING_HOLD_MS =
  (parseInt(process.env.PENDING_HOLD_MINUTES || '15', 10) || 15) * 60 * 1000

export const isActiveBooking = (b: StoredBooking, now: Date = new Date()): boolean => {
  if (b.status === 'confirmed' || b.status === 'completed') return true
  if (b.status !== 'pending') return false
  const createdAt = b.createdAt instanceof Date ? b.createdAt : b.createdAt ? new Date(b.createdAt) : now
  return now.getTime() - createdAt.getTime() < PENDING_HOLD_MS
}

export const toIso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const addDays = (d: Date, days: number) => {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

export const occupiedRange = (arrival: string, nights: number): DateRange => {
  const parts = arrival.split('-').map((n) => parseInt(n, 10))
  const start = new Date(parts[0], parts[1] - 1, parts[2])
  return { start, end: addDays(start, nights) }
}

export const bookingNights = (b: BookingShape): number =>
  b.nights && b.nights > 1 ? b.nights : 1

export const rangesOverlap = (a: DateRange, b: DateRange): boolean =>
  a.start < b.end && b.start < a.end

// Test whether two reservations (using their stored date/nights) overlap.
export const bookingsOverlap = (a: BookingShape, b: BookingShape): boolean =>
  rangesOverlap(occupiedRange(a.date, bookingNights(a)), occupiedRange(b.date, bookingNights(b)))
