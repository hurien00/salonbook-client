'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { AdminStats } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Users,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type StatsApiResponse = {
  success?: boolean;
  data?: Partial<AdminStats>;
};

const INITIAL_STATS: AdminStats = {
  totalCustomers: 0,
  totalActiveServices: 0,
  totalAppointments: 0,
  pendingAppointments: 0,
  confirmedAppointments: 0,
  totalSuccessfulPayments: 0,
  totalRevenue: 0,
};

export default function AdminDashboardOverview() {
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user as SessionUser | undefined;

  const [stats, setStats] = useState<AdminStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = (await api.get('/appointments/stats/admin')) as
          | StatsApiResponse
          | Partial<AdminStats>;

        const rawData =
          typeof res === 'object' && res !== null && 'data' in res && res.data
            ? res.data
            : (res as Partial<AdminStats>);

        if (isMounted && rawData) {
          setStats({
            totalCustomers: Number(rawData.totalCustomers ?? 0),
            totalActiveServices: Number(rawData.totalActiveServices ?? 0),
            totalAppointments: Number(rawData.totalAppointments ?? 0),
            pendingAppointments: Number(rawData.pendingAppointments ?? 0),
            confirmedAppointments: Number(rawData.confirmedAppointments ?? 0),
            totalSuccessfulPayments: Number(rawData.totalSuccessfulPayments ?? 0),
            totalRevenue: Number(rawData.totalRevenue ?? 0),
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to load admin stats:', message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const adminDisplayName = sessionLoading ? 'Loading...' : user?.name || 'Admin';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1f140f] via-[#422719] to-[#2a1810] p-8 text-white shadow-lg sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Master Salon Management Console</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Admin Overview: {adminDisplayName}
          </h1>
          <p className="text-sm leading-relaxed text-stone-300">
            Monitor registered customers, manage appointment confirmations, oversee salon service
            offerings, and track Stripe transactions in real time.
          </p>
        </div>
      </div>

      {/* 6 Key Statistics Cards */}
      <div>
        <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-stone-700">
          Key Performance Indicators
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Total Registered Customers */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Registered Customers
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#422719]">
                {loading ? '...' : stats.totalCustomers}
              </p>
              <Link
                href="/dashboard/admin/users"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#c56117] hover:underline"
              >
                <span>View all customers</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#c56117]">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* 2. Total Active Services */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Active Salon Services
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#422719]">
                {loading ? '...' : stats.totalActiveServices}
              </p>
              <Link
                href="/dashboard/admin/services"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#c56117] hover:underline"
              >
                <span>Manage services catalog</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf9f8] text-[#422719] border border-stone-200/70">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {/* 3. Total Appointment Requests */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Total Requests
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#422719]">
                {loading ? '...' : stats.totalAppointments}
              </p>
              <Link
                href="/dashboard/admin/appointments"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#c56117] hover:underline"
              >
                <span>Review appointments</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf9f8] text-[#422719] border border-stone-200/70">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          {/* 4. Pending Appointments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#c56117]">
                Pending Approval
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#c56117]">
                {loading ? '...' : stats.pendingAppointments}
              </p>
              <p className="mt-1 text-[11px] text-stone-400">Requires admin review</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#c56117]">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* 5. Confirmed Appointments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Confirmed Appointments
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-emerald-700">
                {loading ? '...' : stats.confirmedAppointments}
              </p>
              <p className="mt-1 text-[11px] text-stone-400">Ready for client payment</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* 6. Total Successful Payments */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Stripe Payments ({stats.totalSuccessfulPayments})
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#422719]">
                {loading ? '...' : formatPrice(stats.totalRevenue)}
              </p>
              <Link
                href="/dashboard/admin/transactions"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#c56117] hover:underline"
              >
                <span>Audit transactions</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/dashboard/admin/services"
          className="group space-y-2 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-all hover:border-amber-300 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#c56117]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#422719] transition-colors group-hover:text-[#c56117]">
            Manage Salon Services
          </h3>
          <p className="text-xs leading-relaxed text-stone-500">
            Add new treatments, edit pricing, upload photos via ImgBB, and toggle active visibility.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/appointments"
          className="group space-y-2 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-all hover:border-amber-300 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf9f8] text-[#422719] border border-stone-200/70">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#422719] transition-colors group-hover:text-[#c56117]">
            Manage Appointments
          </h3>
          <p className="text-xs leading-relaxed text-stone-500">
            Confirm pending client requests, cancel sessions, and view individual booking details.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/users"
          className="group space-y-2 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs transition-all hover:border-amber-300 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf9f8] text-[#422719] border border-stone-200/70">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#422719] transition-colors group-hover:text-[#c56117]">
            Registered Customers
          </h3>
          <p className="text-xs leading-relaxed text-stone-500">
            Inspect customer accounts, check appointment history, and block or unblock users.
          </p>
        </Link>
      </div>
    </div>
  );
}