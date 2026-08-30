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
  createdAt: string
}

const STORAGE_KEY = 'rol-ems-bookings'

export type ConflictingRange = {
  start: number
  end: number
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

export function getBookings(): BookingRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BookingRecord[]) : []
  } catch {
    return []
  }
}

function saveBookings(list: BookingRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
}

export function isSlotAvailable(facility: string, date: string, time: string, durationMinutes: number = 0): boolean {
  const list = getBookings()
  const wanted: ConflictingRange = { start: toMinutes(time), end: toMinutes(time) + durationMinutes }
  return !list.some((b) => {
    if (b.facility !== facility || b.date !== date) return false
    const existing: ConflictingRange = { start: toMinutes(b.time), end: toMinutes(b.time) }
    return wanted.start < existing.end && existing.start < wanted.end
  })
}

export function addBooking(booking: Omit<BookingRecord, 'reference' | 'createdAt'>): BookingRecord {
  const ref = `ROL-${Math.floor(100000 + Math.random() * 900000)}`
  const record: BookingRecord = {
    ...booking,
    reference: ref,
    createdAt: new Date().toISOString(),
  }
  const list = getBookings()
  list.push(record)
  saveBookings(list)
  return record
}
