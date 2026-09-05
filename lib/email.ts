import nodemailer, { type Transporter } from 'nodemailer'

type TemplateData = {
  reference: string
  description: string
  amount: string
  name: string
  date?: string
  time?: string
  guests?: string
  /** If set, shows a 'Download Receipt' button in the email */
  receiptUrl?: string
  /** If true, wording is for cash / pay-at-venue bookings */
  isCash?: boolean
}

let cached: Transporter | null = null

function transporter(): Transporter {
  if (cached) return cached
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return cached
}

function html({ reference, description, amount, name, date, time, guests, receiptUrl, isCash }: TemplateData): string {
  const rows = [
    ['Reference', reference],
    ['Booking', description],
    ...(date ? [['Date', `${date}${time ? ` · ${time}` : ''}`]] : []),
    ...(guests ? [['Guests', guests]] : []),
    ['Payment', isCash ? 'Pay at the venue' : 'Online (GCash / card)'],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#6B756B;font-size:13px;border-bottom:1px solid #eee;width:40%">${k}</td><td style="padding:8px 0;color:#1E5336;font-weight:600;text-align:right;border-bottom:1px solid #eee">${v}</td></tr>`,
    )
    .join('')

  const headline = isCash ? 'Reservation confirmed!' : 'Payment received!'
  const subline = isCash
    ? 'Your booking is confirmed. Please bring payment when you arrive. Details below.'
    : 'Your payment has been received. Details below.'
  const totalLabel = isCash ? 'Amount due at venue' : 'Total paid'

  const paymentNote = isCash
    ? 'Pay at the venue: please settle this booking at the front desk when you arrive. We accept cash, GCash, and Maya — no online payment is required.'
    : 'Online payment: your payment was processed online via GCash, card, or an e-wallet. No payment is due at the venue.'

  const noteBox = `
    <div style="margin-top:20px;border:1px solid #e5e0d6;background:#F3F0EC;padding:14px 16px">
      <div style="color:#1E5336;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px">Payment method</div>
      <p style="margin:0;color:#6B756B;font-size:12px;line-height:1.5">${paymentNote}</p>
    </div>`

  const downloadBtn = receiptUrl
    ? `<div style="margin-top:20px;text-align:center">
        <a href="${receiptUrl}" style="display:inline-block;background:#1E5336;color:#FDFBF7;padding:12px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-family:Arial,sans-serif">Download receipt</a>
      </div>`
    : ''

  return `
  <div style="background:#F3F0EC;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#FDFBF7;border:1px solid #e5e0d6;overflow:hidden">
      <div style="background:#1E5336;padding:24px;text-align:center">
        <div style="color:#FDFBF7;font-family:Georgia,serif;font-size:20px;letter-spacing:-0.5px">ROL-EMS <span style="color:#E1A728">&times;</span> REBAR</div>
        <div style="color:#E1A728;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Booking Receipt</div>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 4px;color:#222;font-size:15px;font-weight:600">Thank you, ${name}!</p>
        <p style="margin:0 0 4px;color:#222;font-size:14px;font-weight:700">${headline}</p>
        <p style="margin:0 0 20px;color:#6B756B;font-size:13px">${subline}</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <div style="display:flex;justify-content:space-between;margin-top:16px;border-top:2px solid #1E5336;padding-top:12px">
          <span style="color:#222;font-weight:700">${totalLabel}</span>
          <span style="color:#1E5336;font-weight:700">${amount}</span>
        </div>
        ${noteBox}
        ${downloadBtn}
        <p style="margin:24px 0 0;color:#6B756B;font-size:12px;line-height:1.5">We look forward to hosting you. If you have any questions, reply to this email or reach us at the resort.</p>
      </div>
    </div>
  </div>`
}

export async function sendReceiptEmail(to: string, data: TemplateData): Promise<void> {
  const fromEnv = process.env.SMTP_FROM || ''
  const from = fromEnv.includes('<') ? fromEnv : fromEnv ? `ROL-EMS <${fromEnv}>` : `ROL-EMS <${process.env.SMTP_USER}>`

  await transporter().sendMail({
    from,
    to,
    subject: `Your ROL-EMS receipt · ${data.reference}`,
    html: html(data),
  })
}
