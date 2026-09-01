import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const validStatuses = ['pending', 'confirmed', 'completed', 'expired', 'cancelled']

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await ctx.params
    const body = await req.json()

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const { status } = body
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { reference },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updated = await prisma.booking.update({
      where: { reference },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Booking update error:', err)
    return NextResponse.json({ error: 'Could not update booking' }, { status: 500 })
  }
}