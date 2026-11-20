'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ServiceCard from '@/components/ServiceCard';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { Search, Filter, ArrowUpDown, Scissors, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Haircut & Styling',
  'Hair Coloring',
  'Hair Treatment',
  'Facial & Skincare',
  'Makeup',
  'Manicure & Pedicure',
  'Spa & Massage',
];

function BrowseServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat) {
      setCategory(paramCat);
    }
  }, [searchParams]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (category && category !== 'All') queryParams.append('category', category);
      if (sort === 'price_asc') queryParams.append('sort', 'price_asc');
      if (sort === 'price_desc') queryParams.append('sort', 'price_desc');

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/services?${queryString}` : '/services';

      const res = (await api.get(endpoint)) as { success?: boolean; data?: Service[] } | Service[];
      const list = Array.isArray(res) ? res : res?.data;
      setServices(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load services';
      console.error('Failed to load services:', message);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchServices();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchServices();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('newest');
  };

  return (
    <main className="flex-1 bg-[#faf9f8] py-12 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#c56117]">
            Luxury Salon Directory
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[#422719] sm:text-5xl">
            Browse Salon Services
          </h1>
          <p className="mt-3 text-sm text-stone-600 sm:text-base">
            Explore our full collection of salon services. Filter by category, search by service
            name, or sort by price.
          </p>
        </div>

        <div className="mb-10 space-y-4 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search services by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-300 py-3 pl-11 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
              />
            </div>

            <div className="relative md:col-span-4">
              <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative md:col-span-3">
              <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </form>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-[#422719] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-stone-600">
            Showing <span className="font-bold text-[#422719]">{services.length}</span> active
            services
          </p>

          {(search || category !== 'All' || sort !== 'newest') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#c56117] hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white"
              />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-8 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-[#c56117]">
              <Scissors className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#422719]">No Services Found</h3>
            <p className="mx-auto max-w-sm text-sm text-stone-500">
              We couldn't find any active salon services matching your selected search or
              filter criteria.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl bg-[#422719] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#331d12]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BrowseServicesPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center bg-[#faf9f8] text-sm text-stone-600">
            Loading services...
          </div>
        }
      >
        <BrowseServicesContent />
      </Suspense>
      <Footer />
    </>
  );
}