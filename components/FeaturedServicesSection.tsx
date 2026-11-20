'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Service } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Clock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const DEFAULT_SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80';

const FALLBACK_ACTIVE_SERVICES: Service[] = [
  {
    _id: 'featured-fallback-1',
    serviceName: 'Signature Precision Haircut & Blowout',
    category: 'Haircut & Styling',
    description:
      'Tailored haircut crafted to suit your face shape, finished with a nourishing wash and voluminous salon blowout.',
    price: 1200,
    duration: 60,
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    _id: 'featured-fallback-2',
    serviceName: 'Dimensional Balayage & Gloss Toning',
    category: 'Hair Coloring',
    description:
      'Hand-painted soft highlights paired with a shine-boosting gloss toner for natural dimension and healthy hair.',
    price: 4500,
    duration: 150,
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    _id: 'featured-fallback-3',
    serviceName: 'Deep Keratin Smooth & Repair Therapy',
    category: 'Hair Treatment',
    description:
      'Restorative keratin treatment that tames frizz, strengthens strands, and leaves hair silky and manageable.',
    price: 3800,
    duration: 120,
    image:
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    _id: 'featured-fallback-4',
    serviceName: '24K Gold Radiance Hydrating Facial',
    category: 'Facial & Skincare',
    description:
      'Gentle exfoliation, deep pore cleansing, and an illuminating mask for a fresh, dewy, and radiant complexion.',
    price: 2500,
    duration: 75,
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    _id: 'featured-fallback-5',
    serviceName: 'Soft Glam Evening & Party Makeover',
    category: 'Makeup',
    description:
      'Luminous, long-wear makeup tailored to your features with custom eye styling and skin-smoothing prep.',
    price: 3500,
    duration: 90,
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    _id: 'featured-fallback-6',
    serviceName: 'Luxury Spa Gel Manicure & Pedicure',
    category: 'Manicure & Pedicure',
    description:
      'Complete nail grooming, exfoliating scrub, relaxing massage, and long-lasting polish for hands and feet.',
    price: 1800,
    duration: 90,
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
];

function getSafeImageSrc(src?: string): string {
  if (!src || typeof src !== 'string') return DEFAULT_SERVICE_IMAGE;
  const trimmed = src.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return DEFAULT_SERVICE_IMAGE;
}

function getShortDescription(text: string | null | undefined, maxLength = 95): string {
  const clean = String(text || '').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}...`;
}

export default function FeaturedServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedServices = async () => {
      setLoading(true);
      try {
        const res = (await api.get('/services')) as
          | { success?: boolean; data?: Service[] }
          | Service[];

        const rawList = Array.isArray(res)
          ? res
          : res && typeof res === 'object' && Array.isArray(res.data)
            ? res.data
            : [];

        const activeFromDb = rawList.filter(
          (item) => String(item.status || 'active').toLowerCase() === 'active',
        );

        const combined: Service[] = [...activeFromDb];
        for (const fallbackItem of FALLBACK_ACTIVE_SERVICES) {
          if (combined.length >= 6) break;
          const exists = combined.some(
            (s) => s.serviceName.toLowerCase() === fallbackItem.serviceName.toLowerCase(),
          );
          if (!exists) {
            combined.push(fallbackItem);
          }
        }

        if (isMounted) {
          setServices(combined.slice(0, 6));
        }
      } catch {
        if (isMounted) {
          setServices(FALLBACK_ACTIVE_SERVICES.slice(0, 6));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFeaturedServices();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-[#faf9f8] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-[#c56117]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Featured Salon Services</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#422719] sm:text-4xl">
              Signature Treatments & Styling
            </h2>
            <p className="max-w-xl text-sm text-stone-600">
              Explore our active salon services crafted for everyday elegance and special occasions.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center space-x-2 self-start rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-[#422719] transition-colors hover:border-[#c56117] hover:text-[#c56117] sm:self-auto"
          >
            <span>View All Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#c56117]" />
            <p className="mt-3 text-sm text-stone-500">Loading featured services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const isDbService =
                typeof service._id === 'string' && !service._id.startsWith('featured-fallback-');
              const detailsHref = isDbService ? `/services/${service._id}` : '/services';

              return (
                <article
                  key={service._id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                    <img
                      src={getSafeImageSrc(service.image)}
                      alt={service.serviceName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== DEFAULT_SERVICE_IMAGE) {
                          target.src = DEFAULT_SERVICE_IMAGE;
                        }
                      }}
                    />
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-[#1f140f]/85 px-3 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-xs">
                      {service.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between space-y-5 p-6">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg font-bold text-[#422719] line-clamp-1">
                          {service.serviceName}
                        </h3>
                        <span className="shrink-0 font-serif text-lg font-bold text-[#c56117]">
                          {formatPrice(service.price)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs text-stone-500">
                        <Clock className="h-3.5 w-3.5 text-[#c56117]" />
                        <span>{service.duration} mins</span>
                      </div>

                      <p className="text-sm leading-relaxed text-stone-600 line-clamp-2">
                        {getShortDescription(service.description)}
                      </p>
                    </div>

                    <Link
                      href={detailsHref}
                      className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-[#422719] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#331d12]"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}