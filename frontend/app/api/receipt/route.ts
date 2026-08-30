import { NextRequest, NextResponse } from 'next/server'
import { sendReceiptEmail } from '@/lib/email'

const centsToPeso = (cents: number) => `₱${(cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const secret = process.env.PAYMONGO_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Server is missing PayMongo configuration' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
      },
    })

    if (!res.ok) {
      console.error('Receipt: failed to fetch session', sessionId, res.status)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const data = await res.json()
    const attrs = data?.data?.attributes || {}

    const payments = Array.isArray(attrs?.payments) ? attrs?.payments : []
    const firstPaid = payments.find((p: any) => p?.attributes?.status === 'paid') || payments[0]

    const billing = firstPaid?.attributes?.billing || attrs?.billing || {}
    const metadata = attrs?.metadata || {}
    const billingEmail: string | undefined = billing?.email || metadata?.email
    if (!billingEmail) {
      return NextResponse.json({ error: 'No billing email' }, { status: 400 })
    }

    const amountPaid: number = firstPaid?.attributes?.amount || attrs?.amount || 0
    const lineItems = attrs?.line_items || []
    const description =
      metadata?.description ||
      (Array.isArray(lineItems) && lineItems[0]?.description) ||
      (Array.isArray(lineItems) && lineItems[0]?.name) ||
      'ROL-EMS booking'

    await sendReceiptEmail(billingEmail, {
      reference: metadata?.reference || sessionId || '—',
      description,
      amount: amountPaid ? centsToPeso(amountPaid) : '—',
      name: billing?.name || 'Guest',
      date: metadata?.date,
      time: metadata?.time,
      guests: metadata?.guests ? String(metadata?.guests) : undefined,
    })

    return NextResponse.json({ ok: true, email: billingEmail })
  } catch (err) {
    console.error('Receipt route error:', err)
    return NextResponse.json({ error: 'Could not send receipt' }, { status: 500 })
  }
}
