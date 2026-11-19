'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import DashboardSidebar from '@/components/DashboardSidebar';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, Sparkles } from 'lucide-react';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: 'customer' | 'admin' | string;
  isBlocked?: boolean;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user as SessionUser | undefined;
  const role = user?.role ?? 'customer';
  const isBlocked = Boolean(user?.isBlocked);

  useEffect(() => {
    if (isPending) return;

    // 1. Unauthenticated redirect
    if (!user) {
      toast.error('Please sign in to access your dashboard');
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Blocked user check
    if (isBlocked) {
      toast.error('Your account is blocked. Access is restricted.');
      router.replace('/signin');
      return;
    }

    // 3. Role-based URL protection
    if (role === 'customer' && pathname.startsWith('/dashboard/admin')) {
      toast.error('Forbidden: You do not have administrator permissions');
      router.replace('/dashboard/customer');
    } else if (role === 'admin' && pathname.startsWith('/dashboard/customer')) {
      toast.info('Redirecting to Admin Console');
      router.replace('/dashboard/admin');
    }
  }, [user, role, isBlocked, isPending, pathname, router]);

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center bg-[#faf9f8] px-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200/80 bg-white px-8 py-7 shadow-sm">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#422719]/10">
            <Loader2 className="h-6 w-6 animate-spin text-[#c56117]" />
          </div>
          <p className="text-sm font-medium text-stone-700">Verifying your session...</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
            <Sparkles className="h-3 w-3 text-amber-500" />
            SalonBook Workspace
          </span>
        </div>
      </div>
    );
  }

  // Render a loader while the redirect in the effect is in flight
  // (prevents a flash of dashboard content for signed-out users).
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-[#faf9f8]">
        <Loader2 className="h-6 w-6 animate-spin text-[#c56117]" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center bg-[#faf9f8] p-6 text-center">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-rose-200/90 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#422719]">Account Blocked</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Your account has been blocked by the salon administrator. You cannot access dashboard
            features at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col bg-[#faf9f8] text-stone-800">
      {/* The site Navbar already comes from app/layout.tsx, so we don't render it again here. */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        {/* DashboardSidebar renders its own <aside>, so don't wrap it in another one. */}
        <DashboardSidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="rounded-3xl border border-stone-200/70 bg-white/80 p-5 shadow-2xs sm:p-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
