'use client'

import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const links = [
  { href: '#escape', label: 'The escape' },
  { href: '#facilities', label: 'Stay & play' },
  { href: '#queue', label: 'Open play' },
  { href: '#footer', label: 'Visit' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#222222]/10 bg-[#FDFBF7]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="#top" className="font-serif text-xl tracking-[-0.05em] text-[#1E5336]">
          ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
        </a>
        <nav className="hidden gap-8 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B756B] lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="group relative py-1">
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[#1E5336] transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <a href="#facilities" className="hidden border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336] sm:block">
          Make a booking <ArrowUpRight size={13} className="ml-1 inline" />
        </a>
        <button aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)} className="text-[#1E5336] lg:hidden">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav className="flex flex-col gap-5 border-t border-[#222222]/10 px-6 py-6 text-xs uppercase tracking-[0.14em] lg:hidden">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
          ))}
        </nav>
      )}
    </header>
  )
}
