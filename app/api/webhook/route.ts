import { NextRequest, NextResponse } from 'next/server'
import { sendReceiptEmail } from '@/lib/email'

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

  const eventType = event?.data?.attributes?.type
  if (eventType !== 'checkout_session.payment.paid') {
    return NextResponse.json({ received: true })
  }

  const payment = event?.data?.attributes?.data
  const checkoutSession = payment?.attributes?.checkout_session || payment
  const attrs = checkoutSession?.attributes || {}
  const sessionId = checkoutSession?.id

  const embeddedPayment = attrs?.payment || payment?.attributes?.payment
  let billingEmail: string | undefined = attrs?.billing?.email || payment?.attributes?.billing?.email
  let amountPaid: number =
    embeddedPayment?.attributes?.amount ||
    payment?.attributes?.amount ||
    payment?.attributes?.payment_intent?.attributes?.amount ||
    0
  const metadata = attrs?.metadata || {}
  const lineItems = attrs?.line_items || payment?.attributes?.line_items || []
  const description =
    metadata?.description ||
    (Array.isArray(lineItems) && lineItems[0]?.description) ||
    (Array.isArray(lineItems) && lineItems[0]?.name) ||
    'ROL-EMS booking'

  if (!billingEmail) {
    console.error('Webhook: no billing email found for session', sessionId)
    return NextResponse.json({ received: true })
  }

  const name = attrs?.billing?.name || payment?.attributes?.billing?.name || 'Guest'
  const reference = metadata?.reference || sessionId || payment?.id || '—'
  const date = metadata?.date
  const time = metadata?.time
  const guests = metadata?.guests

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
