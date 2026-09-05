'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Trophy, CalendarCheck, Users, LayoutDashboard, Volleyball, Disc } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Hub', icon: Volleyball },
  { href: '/booking', label: 'Court Booking', icon: CalendarCheck },
  { href: '/open-play', label: 'Open Play', icon: Users },
  { href: '/paddles', label: 'Paddle Rental', icon: Disc },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 border-b border-[#222222]/10 bg-[#FDFBF7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Original Brand Logo */}
        <Link href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
          ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          <span className="ml-2 block font-sans text-[9px] uppercase tracking-[0.2em] text-[#E1A728]">Pickleball Sports Center</span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                  active
                    ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                    : 'text-[#6B756B] hover:text-[#1E5336]'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Admin Link & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className={`hidden items-center gap-1.5 border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition sm:flex ${
              pathname.startsWith('/admin')
                ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                : 'border-[#222222]/20 text-[#222222] hover:border-[#1E5336] hover:text-[#1E5336]'
            }`}
          >
            <LayoutDashboard size={13} />
            Admin
          </Link>

          <button
            className="p-1 text-[#222222] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#222222]/10 bg-[#FDFBF7] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  isActive(href) ? 'text-[#1E5336]' : 'text-[#6B756B]'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 border border-[#1E5336] py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1E5336]"
            >
              <LayoutDashboard size={16} />
              Admin Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
