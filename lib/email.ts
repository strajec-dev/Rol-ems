import nodemailer, { type Transporter } from 'nodemailer'

type TemplateData = {
  reference: string
  description: string
  amount: string
  name: string
  date?: string
  time?: string
  guests?: string
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

function html({ reference, description, amount, name, date, time, guests }: TemplateData): string {
  const rows = [
    ['Reference', reference],
    ['Booking', description],
    ...(date ? [['Date', `${date}${time ? ` · ${time}` : ''}`]] : []),
    ...(guests ? [['Guests', guests]] : []),
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#6B756B;font-size:13px;border-bottom:1px solid #eee;width:40%">${k}</td><td style="padding:8px 0;color:#1E5336;font-weight:600;text-align:right;border-bottom:1px solid #eee">${v}</td></tr>`,
    )
    .join('')

  return `
  <div style="background:#F3F0EC;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#FDFBF7;border:1px solid #e5e0d6;overflow:hidden">
      <div style="background:#1E5336;padding:24px;text-align:center">
        <div style="color:#FDFBF7;font-family:Georgia,serif;font-size:20px;letter-spacing:-0.5px">ROL-EMS <span style="color:#E1A728">&times;</span> REBAR</div>
        <div style="color:#E1A728;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Payment receipt</div>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 4px;color:#222;font-size:15px;font-weight:600">Thank you, ${name}!</p>
        <p style="margin:0 0 20px;color:#6B756B;font-size:13px">Your payment has been received. Details below.</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <div style="display:flex;justify-content:space-between;margin-top:16px;border-top:2px solid #1E5336;padding-top:12px">
          <span style="color:#222;font-weight:700">Total paid</span>
          <span style="color:#1E5336;font-weight:700">${amount}</span>
        </div>
        <p style="margin:24px 0 0;color:#6B756B;font-size:12px;line-height:1.5">We look forward to hosting you. If you have any questions, reply to this email or reach us at the resort.</p>
      </div>
    </div>
  </div>`
}

export async function sendReceiptEmail(to: string, data: TemplateData): Promise<void> {
  await transporter().sendMail({
    from: `ROL-EMS <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `Your ROL-EMS receipt · ${data.reference}`,
    html: html(data),
  })
}
