import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingNights, isActiveBooking, occupiedRange, rangesOverlap, toIso } from '@/lib/booking-overlap'

const addDays = (d: Date, days: number) => {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

export async function GET(req: NextRequest) {
  const facility = req.nextUrl.searchParams.get('facility')
  const month = req.nextUrl.searchParams.get('month')

  if (!facility || !month) {
    return NextResponse.json({ dates: [] })
  }

  const [y, m] = month.split('-').map((n) => parseInt(n, 10))
  if (!y || !m) {
    return NextResponse.json({ dates: [] })
  }

  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = new Date(y, m, 1)

  try {
    const bookings = await prisma.booking.findMany({
      where: { facility, status: { in: ['pending', 'confirmed'] } },
      select: { date: true, nights: true, status: true, createdAt: true },
    })

    const occupied = new Set<string>()
    for (const b of bookings) {
      if (!isActiveBooking(b)) continue
      const range = occupiedRange(b.date, bookingNights(b))
      if (!rangesOverlap(range, { start: monthStart, end: monthEnd })) continue

      const start = range.start < monthStart ? monthStart : range.start
      const end = range.end > monthEnd ? monthEnd : range.end
      for (let d = new Date(start); d < end; d = addDays(d, 1)) {
        occupied.add(toIso(d))
      }
    }

    return NextResponse.json({ dates: Array.from(occupied) })
  } catch (err) {
    console.error('Calendar availability error:', err)
    return NextResponse.json({ dates: [] })
  }
}