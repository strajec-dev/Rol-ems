'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Story from '@/components/Story'
import Facilities from '@/components/Facilities'
import PoolHouse from '@/components/PoolHouse'
import Queue from '@/components/Queue'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Page() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
    elements.forEach((element) => observer.observe(element))

    let ticking = false
    const updateScrollMotion = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        document.documentElement.style.setProperty('--page-scroll', `${scrollY}px`)
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
          const rect = element.getBoundingClientRect()
          const distance = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.08
          element.style.setProperty('--parallax-y', `${distance}px`)
        })
        ticking = false
      })
    }
    updateScrollMotion()
    window.addEventListener('scroll', updateScrollMotion, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateScrollMotion)
    }
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-[#FDFBF7] text-[#222222]">
      <Header />
      <Hero />
      <Story />
      <Facilities />
      <PoolHouse />
      <Queue />
      <CTA />
      <Footer />
    </main>
  )
}
