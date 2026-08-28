'use client'

import { ArrowLeft, Check } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [receiptStatus, setReceiptStatus] = useState<'sending' | 'sent' | 'skipped'>('sending')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setReceiptStatus('skipped')
      return
    }
    fetch(`/api/receipt?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => {
        setReceiptStatus(r.ok ? 'sent' : 'skipped')
      })
      .catch(() => setReceiptStatus('skipped'))
  }, [searchParams])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center bg-[#FDFBF7] px-6 py-16 text-center text-[#222222] shadow-2xl">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E5336] text-[#FDFBF7]">
        <Check size={26} />
      </span>
      <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Payment received</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
        Thanks — your booking is confirmed and your receipt is on its way to your email. We&apos;ll be in touch with any
        updates ahead of your visit.
      </p>
      <span className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
        {receiptStatus === 'sending' ? 'Sending your receipt…' : receiptStatus === 'sent' ? 'Receipt sent to your email' : ''}
      </span>
      <a
        href="/#facilities"
        className="mt-8 inline-flex items-center gap-2 border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
      >
        <ArrowLeft size={14} /> Back to stay & play
      </a>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F3F0EC] px-6 py-16 text-[#222222]">
      <Suspense fallback={<div className="mx-auto max-w-2xl bg-[#FDFBF7] px-6 py-16 text-center text-sm text-[#6B756B] shadow-2xl">Confirming payment…</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
