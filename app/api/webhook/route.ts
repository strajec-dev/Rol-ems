import { NextRequest, NextResponse } from 'next/server'
import { sendReceiptEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

const centsToPeso = (cents: number) => `₱${(cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET

  if (secret) {
    const signature = req.headers.get('paymongo-signature') || ''
    const [tsHeader, sigHeader] = signature
      .split(',')
      .map((s) => s.trim())
      .reduce(
        (acc, part) => {
          const [k, v] = part.split('=')
          if (k === 't') acc[0] = v
          if (k === 'sig') acc[1] = v
          return acc
        },
        ['', ''],
      )

    if (!tsHeader || !sigHeader) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const signedPayload = `${tsHeader}.${raw}`
    const expected = hexToBytes(sigHeader)
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const actual = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload)))
    const valid =
      expected.length === actual.length && expected.every((v, i) => v === actual[i])

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const eventData = event?.data?.attributes || {}
  const eventType = eventData?.type || event?.data?.type
  console.log('Webhook received, type:', eventType)
  if (eventType !== 'checkout_session.payment.paid') {
    return NextResponse.json({ received: true })
  }

  // PayMongo delivers the session object in one of two shapes:
  //   1) event.data.attributes.data = session   (JSON:API)
  //   2) event.data.data            = session   (flattened)
  const session = eventData?.data || event?.data?.data
  const attrs = session?.attributes || {}
  const sessionId = session?.id

  const payments = Array.isArray(attrs?.payments) ? attrs?.payments : []
  const firstPaid = payments.find(
    (p: any) => p?.attributes?.status === 'paid',
  ) || payments[0]

  const billing = firstPaid?.attributes?.billing || attrs?.billing || {}
  const metadata = attrs?.metadata || {}
  let billingEmail: string | undefined = billing?.email || metadata?.email
  let amountPaid: number = firstPaid?.attributes?.amount || attrs?.amount || 0
  const lineItems = attrs?.line_items || []
  const description =
    metadata?.description ||
    (Array.isArray(lineItems) && lineItems[0]?.description) ||
    (Array.isArray(lineItems) && lineItems[0]?.name) ||
    'ROL-EMS booking'

  if (!billingEmail) {
    console.error('Webhook: no billing email found. session attrs:', JSON.stringify(attrs))
    return NextResponse.json({ received: true })
  }

  console.log('Webhook: sending receipt email to', billingEmail, 'amount', amountPaid, 'session', sessionId)

  const name = billing?.name || 'Guest'
  const reference = metadata?.reference || sessionId || event?.data?.id || '—'
  const date = metadata?.date
  const time = metadata?.time
  const guests = metadata?.guests

  try {
    await prisma.booking.updateMany({
      where: { reference },
      data: { status: 'confirmed' },
    })
  } catch (err) {
    console.error('Webhook: failed to confirm booking in DB', err)
  }

  try {
    await sendReceiptEmail(billingEmail, {
      reference,
      description,
      amount: amountPaid ? centsToPeso(amountPaid) : '—',
      name,
      date,
      time,
      guests: guests ? String(guests) : undefined,
    })
  } catch (err) {
    console.error('Webhook: failed to send receipt email', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
