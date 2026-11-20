'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Service } from '@/types';
import {
  CalendarCheck2,
  Clock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Award,
  MapPin,
} from 'lucide-react';

const BOOKING_STEPS = [
  {
    step: '01',
    title: 'Choose Your Treatment',
    description:
      'Browse transparent pricing, duration, and service details across hair, skin, nail, and spa categories.',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Pick Date & Time Slot',
    description:
      'Reserve an available appointment slot that fits your schedule with instant conflict-free slot validation.',
    icon: CalendarCheck2,
  },
  {
    step: '03',
    title: 'Confirm & Relax',
    description:
      'Track approval from your dashboard, pay securely online once confirmed, and enjoy zero waiting at the salon.',
    icon: CheckCircle2,
  },
];

const SALON_PROMISES = [
  'Certified senior stylists & estheticians',
  '100% sanitized tools & single-use hygiene kits',
  'Dermatologist-tested international hair & skin care',
  'Transparent pricing with no hidden chair charges',
];

export default function SalonExperienceSection() {
  const [activeServiceCount, setActiveServiceCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(7);

  useEffect(() => {
    let isMounted = true;

    const loadSalonSummary = async () => {
      try {
        const res = (await api.get('/services')) as
          | { success?: boolean; data?: Service[] }
          | Service[];

        const list = Array.isArray(res)
          ? res
          : res && typeof res === 'object' && Array.isArray(res.data)
            ? res.data
            : [];

        const activeList = list.filter(
          (item) => String(item.status || 'active').toLowerCase() === 'active',
        );

        const uniqueCategories = new Set(
          activeList.map((item) => String(item.category || '').trim()).filter(Boolean),
        );

        if (isMounted) {
          setActiveServiceCount(activeList.length);
          if (uniqueCategories.size > 0) {
            setCategoryCount(uniqueCategories.size);
          }
        }
      } catch {
        // Keep clean defaults if API is unavailable
      }
    };

    void loadSalonSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="border-t border-stone-200/80 bg-[#faf9f8] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: How Booking Works */}
        <div className="mb-14 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-[#c56117]">
              <Award className="h-3.5 w-3.5" />
              <span>Effortless Salon Booking</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#422719] sm:text-4xl">
              Book Your Self-Care in 3 Simple Steps
            </h2>
            <p className="max-w-xl text-sm text-stone-600">
              Designed for smooth scheduling—reserve your session online in under a minute and manage everything from your dashboard.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center space-x-2 self-start rounded-full bg-[#422719] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#331d12] sm:self-auto"
          >
            <span>Start Booking</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BOOKING_STEPS.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-3xl border border-stone-200/90 bg-white p-7 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#c56117]">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs font-bold tracking-widest text-stone-400">
                    STEP {item.step}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#422719]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Row: Salon Standards + Hours & Live Stats Card */}
        <div className="mt-12 grid grid-cols-1 gap-8 rounded-3xl border border-stone-200 bg-white p-7 shadow-2xs sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>SalonBook Quality Standard</span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#422719] sm:text-3xl">
              Crafted for Comfort, Hygiene & Lasting Results
            </h3>

            <p className="text-sm leading-relaxed text-stone-600">
              Every appointment includes a personalized consultation before your treatment begins so your stylist or therapist tailors the session to your exact preferences.
            </p>

            <ul className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              {SALON_PROMISES.map((promise) => (
                <li key={promise} className="flex items-start space-x-2.5 text-xs text-stone-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c56117]" />
                  <span className="font-medium">{promise}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#231610] via-[#321e14] to-[#4a2b19] p-6 text-white sm:p-8 lg:col-span-5">
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-amber-300/80">
                  Active Services
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-white">
                  {activeServiceCount > 0 ? `${activeServiceCount}+` : '6+'}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-amber-300/80">
                  Specialties
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-white">
                  {categoryCount} Categories
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs text-stone-200">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-stone-300">
                  <Clock className="h-4 w-4 text-amber-300" />
                  <span>Sat – Thu</span>
                </span>
                <span className="font-semibold text-white">10:00 AM – 09:00 PM</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-stone-300">
                  <Clock className="h-4 w-4 text-amber-300" />
                  <span>Friday</span>
                </span>
                <span className="font-semibold text-white">03:00 PM – 10:00 PM</span>
              </div>

              <div className="flex items-center space-x-2 pt-1 text-stone-300">
                <MapPin className="h-4 w-4 shrink-0 text-amber-300" />
                <span>Luxury Lounge • Walk-ins & Online Reservations</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/services"
                className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-400"
              >
                <span>Reserve Your Appointment</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}