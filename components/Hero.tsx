import { ArrowUpRight } from 'lucide-react'

export default function Hero() {
  return (
    <section id="top" className="relative mx-auto min-h-[720px] max-w-[1440px] overflow-hidden bg-[#1E5336] text-[#FDFBF7] lg:min-h-[820px]">
      <div
        data-parallax
        className="parallax-media absolute inset-[-4%] bg-[linear-gradient(90deg,rgba(18,44,30,.88),rgba(18,44,30,.28)),linear-gradient(0deg,rgba(18,44,30,.72),transparent_60%),url('/Hero-image.jpg')] bg-cover bg-center"
      />
      <div className="relative flex min-h-[720px] flex-col justify-between px-6 py-10 sm:px-10 lg:min-h-[820px] lg:px-16 lg:py-14">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.22em] text-[#FDFBF7]/70">
          <span></span>
          <span className="hidden sm:block">San Jose, Cavite · Philippines</span>
        </div>
        <div className="max-w-3xl">
          <p className="mb-6 text-xs uppercase tracking-[0.24em] text-[#E1A728]">Everyday escape</p>
          <h1 className="max-w-2xl font-serif text-6xl leading-[0.88] tracking-[-0.065em] sm:text-8xl lg:text-[9.5rem]">
            Make room<br />for living.
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-6 text-[#FDFBF7]/78 sm:text-base">
            A quiet resort, a warm cottage, and the space to spend a good day your way.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#facilities" className="border border-[#FDFBF7]/70 px-5 py-3 text-[11px] uppercase tracking-[0.16em] hover:border-[#E1A728] hover:bg-[#E1A728] hover:text-[#1E5336]">
              Explore the resort <ArrowUpRight size={15} className="ml-2 inline" />
            </a>
            <a href="#queue" className="px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-[#FDFBF7]/75 hover:text-[#E1A728]">
              Find your game <ArrowUpRight size={15} className="ml-2 inline" />
            </a>
          </div>
        </div>
        <div id="escape" className="flex flex-col gap-5 border-t border-[#FDFBF7]/30 pt-5 text-[10px] uppercase tracking-[0.16em] sm:flex-row sm:justify-between">
          <span className="text-[#E1A728]">Cottages · courts · open play</span>
          <span className="text-[#FDFBF7]/65">Where everyday escape meets active motion.</span>
        </div>
      </div>
    </section>
  )
}
