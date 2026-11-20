'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Appointment, CustomerStats } from '@/types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Scissors,
} from 'lucide-react';

function calculateStatsFromAppointments(items: Appointment[]): CustomerStats {
  let pending = 0;
  let confirmed = 0;
  let cancelled = 0;

  for (const item of items) {
    const statusLower = String(item.status || 'Pending').toLowerCase();
    if (statusLower === 'confirmed') confirmed += 1;
    else if (statusLower === 'cancelled') cancelled += 1;
    else pending += 1;
  }

  return {
    total: items.length,
    pending,
    confirmed,
    cancelled,
  };
}

export default function CustomerDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = (await api.get('/appointments/stats/customer')) as {
          success?: boolean;
          data?: CustomerStats;
        };

        if (isMounted && res?.success && res.data) {
          setStats({
            total: Number(res.data.total ?? 0),
            pending: Number(res.data.pending ?? 0),
            confirmed: Number(res.data.confirmed ?? 0),
            cancelled: Number(res.data.cancelled ?? 0),
          });
          return;
        }
      } catch {
        // Fallback to /appointments if dedicated customer stats route isn't added yet
      }

      try {
        const listRes = (await api.get('/appointments')) as {
          success?: boolean;
          data?: Appointment[];
        };
        if (isMounted && listRes?.success && Array.isArray(listRes.data)) {
          setStats(calculateStatsFromAppointments(listRes.data));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load customer stats';
        console.warn('Failed to load customer stats:', msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-salon-900 via-stone-900 to-amber-950 p-8 text-white shadow-md sm:p-10">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {user?.name || 'Valued Guest'}!
          </h1>
          <p className="text-sm leading-relaxed text-stone-300">
            Manage your salon appointment requests, track confirmation statuses, and pay for your sessions seamlessly.
          </p>
          <div className="pt-2">
            <Link
              href="/services"
              className="inline-flex items-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow transition-all hover:bg-amber-400"
            >
              <Scissors className="h-4 w-4" />
              <span>Book New Service</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div>
        <h2 className="mb-4 font-mono text-base font-bold uppercase tracking-wider text-stone-700">
          Appointment Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Appointments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Total Requests
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-stone-900">
                {loading ? '...' : stats.total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          {/* Pending Appointments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Pending Approval
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-stone-900">
                {loading ? '...' : stats.pending}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Confirmed Appointments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Confirmed
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-stone-900">
                {loading ? '...' : stats.confirmed}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Cancelled Appointments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                Cancelled
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-stone-900">
                {loading ? '...' : stats.cancelled}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/customer/appointments"
          className="group flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-900 transition-colors group-hover:text-amber-800">
              Manage My Appointments
            </h3>
            <p className="text-xs text-stone-500">
              Check status, pay online with Stripe for confirmed sessions, or cancel pending requests.
            </p>
          </div>
          <ArrowRight className="ml-4 h-5 w-5 shrink-0 text-stone-400 transition-all group-hover:translate-x-1 group-hover:text-amber-800" />
        </Link>

        <Link
          href="/dashboard/customer/profile"
          className="group flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-900 transition-colors group-hover:text-amber-800">
              My Profile Settings
            </h3>
            <p className="text-xs text-stone-500">
              Update personal details, profile avatar, and contact phone number.
            </p>
          </div>
          <ArrowRight className="ml-4 h-5 w-5 shrink-0 text-stone-400 transition-all group-hover:translate-x-1 group-hover:text-amber-800" />
        </Link>
      </div>
    </div>
  );
}