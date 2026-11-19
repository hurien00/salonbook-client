'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  Scissors,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative py-1.5 text-sm font-medium transition-colors',
        active ? 'text-[#422719]' : 'text-stone-600 hover:text-[#422719]',
      )}
    >
      {children}
      <span
        className={cn(
          'absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-amber-600 transition-transform duration-300',
          active ? 'scale-x-100' : 'scale-x-0',
        )}
      />
    </Link>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as
    | (typeof session extends { user: infer U } ? U & { role?: string } : { name: string; email: string; image?: string | null; role?: string })
    | undefined;

  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dashboardUrl = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer';

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut();
    router.refresh();
    router.push('/signin');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-stone-200 bg-white/90 shadow-sm shadow-stone-900/5 backdrop-blur-xl'
          : 'border-transparent bg-white/70 backdrop-blur-md',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo / Name: SalonBook */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#422719] shadow-md shadow-[#422719]/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Scissors className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
            </div>
            <div className="leading-tight">
              <span className="block font-serif text-xl font-bold tracking-tight text-[#422719]">
                Salon<span className="text-amber-700">Book</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                Luxury & Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="/" active={isActive('/')}>
              Home
            </NavLink>
            <NavLink href="/services" active={isActive('/services')}>
              Browse Services
            </NavLink>
            {user && (
              <NavLink href={dashboardUrl} active={pathname.startsWith('/dashboard')}>
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Auth State & Profile Dropdown */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-expanded={dropdownOpen}
                  className={cn(
                    'flex items-center gap-3 rounded-full border bg-white/80 py-1 pl-1 pr-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
                    dropdownOpen
                      ? 'border-amber-300 bg-amber-50/70'
                      : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/60',
                  )}
                >
                  <img
                    src={user.image || AVATAR_FALLBACK}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-amber-200"
                  />
                  <span className="text-left">
                    <span className="block max-w-[9rem] truncate text-xs font-semibold text-[#422719]">
                      {user.name}
                    </span>
                    <span className="block text-[10px] font-medium uppercase tracking-wide text-amber-700">
                      {user.role ?? 'customer'}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-stone-400 transition-transform duration-200',
                      dropdownOpen && 'rotate-180',
                    )}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-2xl border border-stone-200/80 bg-white py-2 shadow-xl shadow-stone-900/10 animate-in fade-in zoom-in-95 duration-100">
                      <div className="border-b border-stone-100 px-4 pb-3 pt-1">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                          Signed in as
                        </p>
                        <p className="truncate text-sm font-medium text-[#422719]">{user.name}</p>
                        <p className="truncate text-xs text-stone-500">{user.email}</p>
                      </div>

                      <div className="pt-1">
                        <Link
                          href={dashboardUrl}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
                        >
                          <LayoutDashboard className="h-4 w-4 text-amber-700" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href={`${dashboardUrl}/profile`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
                        >
                          <UserIcon className="h-4 w-4 text-amber-700" />
                          <span>My Profile</span>
                        </Link>
                      </div>

                      <div className="my-1 border-t border-stone-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          void handleLogout();
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-[#422719]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#422719] px-5 py-2 text-sm font-medium text-white shadow-md shadow-[#422719]/20 transition-all hover:bg-[#331d12] hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              className="rounded-xl p-2 text-stone-700 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-stone-200 bg-white/95 px-4 pb-6 pt-3 backdrop-blur-xl shadow-lg shadow-stone-900/5 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'block rounded-xl px-3 py-2.5 text-base font-medium transition-colors',
              isActive('/')
                ? 'bg-amber-50 text-amber-800'
                : 'text-stone-700 hover:bg-stone-50 hover:text-amber-700',
            )}
          >
            Home
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'mt-1 block rounded-xl px-3 py-2.5 text-base font-medium transition-colors',
              isActive('/services')
                ? 'bg-amber-50 text-amber-800'
                : 'text-stone-700 hover:bg-stone-50 hover:text-amber-700',
            )}
          >
            Browse Services
          </Link>

          {user ? (
            <div className="mt-3 space-y-1 border-t border-stone-100 pt-4">
              <div className="mb-3 flex items-center gap-3 px-3">
                <img
                  src={user.image || AVATAR_FALLBACK}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-200"
                />
                <div className="leading-tight">
                  <p className="font-semibold text-[#422719]">{user.name}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                    {user.role ?? 'customer'}
                  </p>
                </div>
              </div>
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 hover:text-amber-700"
              >
                Dashboard
              </Link>
              <Link
                href={`${dashboardUrl}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 hover:text-amber-700"
              >
                My Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handleLogout();
                }}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl border border-stone-300 py-2.5 text-center font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl bg-[#422719] py-2.5 text-center font-medium text-white shadow-md shadow-[#422719]/20 transition-colors hover:bg-[#331d12]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}