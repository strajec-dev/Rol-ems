import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-[#222222]/10 px-6 py-16 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl text-[#1E5336]">ROL-EMS <span className="text-[#E1A728]">×</span> REBAR</p>
          <p className="mt-5 max-w-xs font-serif text-xl leading-7 text-[#1E5336]">A little more room for the things that make a day feel full.</p>
        </div>
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">Find us</p>
          <p className="text-sm leading-6 text-[#6B756B]">San Jose, General Trias<br />Cavite, Philippines</p>
          <p className="mt-3 flex items-center gap-2 text-xs text-[#1E5336]"><MapPin size={14} /> Get directions</p>
        </div>
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">Hours</p>
          <p className="text-sm leading-6 text-[#6B756B]">Monday — Sunday<br />8:00 AM — 10:00 PM</p>
        </div>
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">Stay in touch</p>
          <p className="text-sm leading-6 text-[#6B756B]">hello@rolems.ph<br />Instagram · Facebook</p>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl justify-between border-t border-[#222222]/10 pt-5 text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">
        <span>© 2026 ROL-EMS x REBAR</span>
        <span className="flex items-center gap-4">
          <a href="/booking/lookup" className="hover:text-[#1E5336]">Check a booking</a>
          <a href="/admin" className="hover:text-[#1E5336]">Staff</a>
        </span>
      </div>
    </footer>
  )
}
