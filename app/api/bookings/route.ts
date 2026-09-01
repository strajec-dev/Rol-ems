import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingsOverlap, isActiveBooking } from '@/lib/booking-overlap'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { facility, itemName, date, time, nights, hours, guests, name, contact, email, amount, payment, reference } = body

    if (!facility || !itemName || !date || !time) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    const requested = { date, nights: nights ?? null }

    const existing = await prisma.booking.findMany({
      where: { facility, status: { in: ['pending', 'confirmed'] } },
      select: { reference: true, date: true, nights: true, status: true, createdAt: true },
    })

    const conflict = existing.find((b) => isActiveBooking(b) && bookingsOverlap(requested, b))
    if (conflict) {
      return NextResponse.json(
        { error: 'This slot is no longer available. It may have just been booked by someone else. ', conflictReference: conflict.reference },
        { status: 409 },
      )
    }

    const isCash = payment === 'cash'
    const booking = await prisma.booking.create({
      data: {
        reference: reference || `ROL-${Math.floor(100000 + Math.random() * 900000)}`,
        facility,
        itemName,
        date,
        time,
        nights: nights ?? null,
        hours: hours ?? null,
        guests: guests || 1,
        name: name || null,
        contact: contact || null,
        email: email || null,
        amount: amount || 0,
        payment: payment || 'cash',
        status: isCash ? 'confirmed' : 'pending',
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    console.error('Booking create error:', err)
    return NextResponse.json({ error: 'Could not create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get('reference')
    const bookings = await prisma.booking.findMany({
      where: reference ? { reference } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bookings)
  } catch (err) {
    console.error('Booking list error:', err)
    return NextResponse.json({ error: 'Could not fetch bookings' }, { status: 500 })
  }
}
