import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingsOverlap, isActiveBooking } from '@/lib/booking-overlap'

export async function GET(req: NextRequest) {
  const facility = req.nextUrl.searchParams.get('facility')
  const date = req.nextUrl.searchParams.get('date')
  const nightsParam = req.nextUrl.searchParams.get('nights')

  if (!facility || !date) {
    return NextResponse.json({ times: [] })
  }

  const nights = nightsParam ? Math.max(1, parseInt(nightsParam, 10) || 1) : 1
  const wanted = { date, nights }

  try {
    const bookings = await prisma.booking.findMany({
      where: { facility, status: { in: ['pending', 'confirmed'] } },
      select: { date: true, time: true, nights: true, status: true, createdAt: true },
    })

    const booked = bookings.filter((b) => isActiveBooking(b) && bookingsOverlap(wanted, b))

    return NextResponse.json({ times: booked.map((b) => b.time) })
  } catch (err) {
    console.error('Booked times error:', err)
    return NextResponse.json({ times: [] })
  }
}