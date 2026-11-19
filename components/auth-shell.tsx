import Link from 'next/link';
import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  mode: 'sign-in' | 'sign-up';
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const PERKS = [
  'Browse verified salons and stylists',
  'Real-time availability with instant confirmation',
  'Manage every appointment in one place',
];

export default function AuthShell({ mode, title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-stone-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        {/* Brand / marketing panel */}
        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-salon-950 p-10 text-white shadow-xl shadow-salon-900/10 lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-salon-950 via-salon-950/80 to-salon-900/40" />

          <div className="relative flex h-full min-h-[520px] flex-col justify-between">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Luxury &amp; Care
            </span>

            <div className="space-y-6">
              <h2 className="max-w-sm font-serif text-4xl font-bold leading-tight">
                Beauty appointments, <span className="text-amber-400 italic">beautifully</span> booked.
              </h2>
              <ul className="space-y-3 text-sm text-stone-300">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-stone-400">
              Trusted by 2,000+ guests across the city.
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Toggle between the two pages */}
            <div className="mb-7 grid grid-cols-2 gap-1 rounded-full bg-stone-100 p-1">
              <Link
                href="/signin"
                className={cn(
                  'rounded-full py-2 text-center text-sm font-semibold transition-all',
                  mode === 'sign-in'
                    ? 'bg-white text-salon-900 shadow-sm'
                    : 'text-stone-500 hover:text-salon-900',
                )}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  'rounded-full py-2 text-center text-sm font-semibold transition-all',
                  mode === 'sign-up'
                    ? 'bg-white text-salon-900 shadow-sm'
                    : 'text-stone-500 hover:text-salon-900',
                )}
              >
                Sign Up
              </Link>
            </div>

            <h1 className="font-serif text-2xl font-bold text-salon-900">{title}</h1>
            <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            By continuing you agree to our{' '}
            <span className="cursor-pointer underline-offset-2 hover:text-stone-600 hover:underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="cursor-pointer underline-offset-2 hover:text-stone-600 hover:underline">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
