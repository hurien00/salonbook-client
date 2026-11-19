'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Calendar,
  User as UserIcon,
  Sparkles,
  Users,
  CreditCard,
  LogOut,
  Scissors,
  Home,
  type LucideIcon,
} from 'lucide-react';

type Role = 'customer' | 'admin';

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
};

const AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

const menuItemsByRole: Record<Role, MenuItem[]> = {
  customer: [
    { id: 'overview', label: 'Overview', href: '/dashboard/customer', icon: LayoutDashboard },
    {
      id: 'appointments',
      label: 'My Appointments',
      href: '/dashboard/customer/appointments',
      icon: Calendar,
    },
    { id: 'profile', label: 'My Profile', href: '/dashboard/customer/profile', icon: UserIcon },
  ],
  admin: [
    { id: 'overview', label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    {
      id: 'services',
      label: 'Manage Services',
      href: '/dashboard/admin/services',
      icon: Sparkles,
    },
    {
      id: 'appointments',
      label: 'Manage Appointments',
      href: '/dashboard/admin/appointments',
      icon: Calendar,
    },
    { id: 'users', label: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
    {
      id: 'transactions',
      label: 'Transactions',
      href: '/dashboard/admin/transactions',
      icon: CreditCard,
    },
    { id: 'profile', label: 'My Profile', href: '/dashboard/admin/profile', icon: UserIcon },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as SessionUser | undefined;
  const role: Role = user?.role === 'admin' ? 'admin' : 'customer';
  const isAdmin = role === 'admin';
  const links = menuItemsByRole[role];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.replace('/signin');
  };

  return (
    <aside className="flex min-h-[calc(100vh-5rem)] w-full flex-col justify-between border-b border-[#422719]/40 bg-[#1f140f] p-5 text-stone-200 md:w-64 md:border-b-0 md:border-r md:p-6">
      <div>
        {/* Salon Branding badge */}
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#422719] text-amber-300 shadow-xs">
            <Scissors className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wide text-white">
              {isAdmin ? 'Admin Console' : 'Customer Portal'}
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400/90">
              SalonBook
            </p>
          </div>
        </div>

        {/* User Card */}
        {isPending ? (
          <div className="mb-6 flex animate-pulse items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="h-2.5 w-14 rounded bg-white/10" />
            </div>
          </div>
        ) : (
          user && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-[#422719]/40 p-3">
              <img
                src={user.image || AVATAR_FALLBACK}
                alt={user.name}
                className="h-10 w-10 rounded-full border border-amber-400/50 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <span className="mt-0.5 inline-block rounded bg-[#c56117]/25 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                  {role}
                </span>
              </div>
            </div>
          )
        )}

        {/* Navigation Links */}
        <div className="space-y-1.5">
          <p className="px-3 pb-2 font-mono text-[11px] uppercase tracking-wider text-stone-400">
            Menu
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#c56117] text-white shadow-sm shadow-[#c56117]/30'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-amber-400/80'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-white/5 hover:text-stone-200"
        >
          <Home className="h-4 w-4" />
          <span>Back to Main Site</span>
        </Link>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;