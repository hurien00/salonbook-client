'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Service } from '@/types';
import {
  Scissors,
  Palette,
  Sparkles,
  Smile,
  Brush,
  Hand,
  Flower2,
  ArrowRight,
  Layers,
} from 'lucide-react';

type CategoryItem = {
  name: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SALON_CATEGORIES: CategoryItem[] = [
  {
    name: 'Haircut & Styling',
    description: 'Precision cuts, layered styles, and bouncy blowouts tailored to you.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    icon: Scissors,
  },
  {
    name: 'Hair Coloring',
    description: 'Rich global shades, seamless balayage, and glossy dimension tones.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    icon: Palette,
  },
  {
    name: 'Hair Treatment',
    description: 'Keratin smoothing, deep hydration, and bond-repairing hair therapy.',
    image:
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    icon: Sparkles,
  },
  {
    name: 'Facial & Skincare',
    description: 'Glowing facials, gentle exfoliation, and barrier-nourishing skin care.',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    icon: Smile,
  },
  {
    name: 'Makeup',
    description: 'Soft glam party looks, radiant event finishes, and bridal artistry.',
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    icon: Brush,
  },
  {
    name: 'Manicure & Pedicure',
    description: 'Nail shaping, soothing scrubs, and long-wear gel polish for hands and feet.',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    icon: Hand,
  },
  {
    name: 'Spa & Massage',
    description: 'Calming aromatherapy and tension-relieving full body spa sessions.',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    icon: Flower2,
  },
];

export default function ServiceCategoriesSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    const loadServiceCounts = async () => {
      try {
        const res = (await api.get('/services')) as
          | { success?: boolean; data?: Service[] }
          | Service[];

        const list = Array.isArray(res)
          ? res
          : res && typeof res === 'object' && Array.isArray(res.data)
            ? res.data
            : [];

        const nextCounts: Record<string, number> = {};
        for (const item of list) {
          if (String(item.status || 'active').toLowerCase() !== 'active') continue;
          const cat = String(item.category || '').trim();
          if (cat) {
            nextCounts[cat] = (nextCounts[cat] || 0) + 1;
          }
        }

        if (isMounted) {
          setCounts(nextCounts);
        }
      } catch {
        // Keep clean UI without blocking render if counts fail
      }
    };

    void loadServiceCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-[#c56117]">
              <Layers className="h-3.5 w-3.5" />
              <span>Salon Service Categories</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#422719] sm:text-4xl">
              Explore By Category
            </h2>
            <p className="max-w-xl text-sm text-stone-600">
              Pick a service category to browse specialized treatments and book your preferred slot.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center space-x-2 self-start rounded-full bg-[#422719] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#331d12] sm:self-auto"
          >
            <span>Browse All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SALON_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const serviceCount = counts[cat.name];
            const targetHref = `/services?category=${encodeURIComponent(cat.name)}`;

            return (
              <Link
                key={cat.name}
                href={targetHref}
                className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-3xl border border-stone-200 bg-stone-900 p-6 text-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-65 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f140f]/95 via-[#1f140f]/55 to-transparent" />

                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 backdrop-blur-xs">
                      <IconComponent className="h-4 w-4" />
                    </span>

                    {typeof serviceCount === 'number' && serviceCount > 0 && (
                      <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-200 backdrop-blur-xs">
                        {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold leading-snug text-white">
                    {cat.name}
                  </h3>

                  <p className="text-xs leading-relaxed text-stone-200 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="flex items-center space-x-1.5 pt-1 text-xs font-semibold text-amber-300">
                    <span>Explore Services</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}