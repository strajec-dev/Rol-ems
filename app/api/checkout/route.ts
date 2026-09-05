import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, contact, email, amount, description, metadata } = body

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const secret = process.env.PAYMONGO_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Server is missing PayMongo configuration' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const reference = metadata?.reference || `RC-${Math.floor(100000 + Math.random() * 900000)}`

  const mergedMetadata = {
    ...(metadata || {}),
    reference,
    description: description || 'ROL-EMS booking',
    ...(email ? { email } : {}),
  }

  const payload = {
    data: {
      attributes: {
        billing: {
          name,
          email: email || undefined,
          phone: contact || undefined,
        },
        line_items: [
          {
            currency: 'PHP',
            amount: Math.round(amount * 100),
            description: description || 'ROL-EMS booking',
            name: description || 'ROL-EMS booking',
            quantity: 1,
          },
        ],
        payment_method_types: ['gcash', 'card', 'paymaya', 'grab_pay'],
        success_url: `${siteUrl}/payment/success?session_id={id}`,
        cancel_url: `${siteUrl}/#facilities`,
        metadata: mergedMetadata,
      },
    },
  }

  try {
    const res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('PayMongo error:', JSON.stringify(data))
      return NextResponse.json({ error: data?.errors?.[0]?.detail || 'Payment could not be started' }, { status: res.status })
    }

    const checkoutUrl = data?.data?.attributes?.checkout_url
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Payment session was not created' }, { status: 500 })
    }

    return NextResponse.json({ checkout_url: checkoutUrl, id: data?.data?.id })
  } catch (err) {
    console.error('Checkout route error:', err)
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 500 })
  }
}
