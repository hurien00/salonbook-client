import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Banner() {
  return (
    <section className="relative min-h-[620px] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
      {/* Salon-Themed Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/70 to-transparent" />

      {/* Banner Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bespoke Beauty & Wellness Reservations</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          Elevate Your Glow with <br />
          <span className="text-amber-400 italic">Signature Salon</span> Care
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-300 font-light leading-relaxed">
          Discover artisan haircuts, luminous coloring, rejuvenating facials, and luxury spa treatments curated by award-winning beauty professionals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {/* CTA Button: Explore Salon Services */}
          <Link
            href="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/30 hover:shadow-xl transition-all hover:scale-105"
          >
            <span>Explore Salon Services</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 font-semibold border border-stone-600/50 backdrop-blur-md transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}