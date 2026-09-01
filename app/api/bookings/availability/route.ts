import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { facility, date, time, durationMinutes = 0 } = body

    if (!facility || !date || !time) {
      return NextResponse.json({ available: true })
    }

    const wanted = { start: toMinutes(time), end: toMinutes(time) + durationMinutes }

    const existing = await prisma.booking.findMany({
      where: { facility, date, status: { in: ['pending', 'confirmed'] } },
      select: { time: true },
    })

    const available = !existing.some((b) => {
      const ex = { start: toMinutes(b.time), end: toMinutes(b.time) }
      return wanted.start < ex.end && ex.start < wanted.end
    })

    return NextResponse.json({ available })
  } catch (err) {
    console.error('Availability check error:', err)
    return NextResponse.json({ error: 'Could not check availability' }, { status: 500 })
  }
}
