'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Check,
  Loader2,
  Scissors,
  UserPlus,
} from 'lucide-react';

export type Role = 'customer' | 'admin';

export type SignUpFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
};

type SignUpFields = Omit<SignUpFormData, 'role'> & {
  confirmPassword: string;
  acceptedTerms: boolean;
};

const initialForm: SignUpFields = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-11 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30';

const ROLE_OPTIONS: Array<{ value: Role; label: string; hint: string; icon: typeof User }> = [
  { value: 'customer', label: 'Customer', hint: 'Book and manage appointments', icon: User },
  { value: 'admin', label: 'Admin', hint: 'Manage salons and bookings', icon: ShieldCheck },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignUpFields>(initialForm);
  const [role, setRole] = useState<Role>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ name: string; email: string; role: Role } | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const nextErrors: Partial<Record<keyof SignUpFields, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    }

    if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password)) {
      nextErrors.password = 'Include one uppercase and one lowercase letter.';
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms = 'Please accept the terms to continue.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role,
      });

      if (error) {
        setServerError(error.message ?? 'Could not create your account. Please try again.');
        return;
      }

      setCreated({
        name: data?.user?.name ?? form.name.trim(),
        email: data?.user?.email ?? form.email.trim(),
        role,
      });

      router.refresh();
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setServerError(null);

    try {
      const { error } = await signIn.social({ provider: 'google', callbackURL: '/' });

      if (error) {
        setServerError(error.message ?? 'Google sign-up is unavailable right now.');
      }
    } catch {
      setServerError('Google sign-up is unavailable right now.');
    }
  };

  const reset = () => {
    setCreated(null);
    setForm(initialForm);
    setRole('customer');
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        {/* Logo + Heading */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#422719] shadow-md shadow-[#422719]/20">
              <Scissors className="h-6 w-6 text-amber-300" strokeWidth={1.75} />
            </div>
            <span className="font-serif text-3xl font-bold tracking-tight text-[#422719]">
              Salon<span className="text-[#c56117]">Book</span>
            </span>
          </Link>

          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-stone-900">
            {role === 'admin' ? 'Create your admin account' : 'Create your customer account'}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Already have an account?{' '}
            <Link href="/signin" className="font-semibold text-[#c56117] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          {created ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Account created</p>
                  <p className="mt-0.5 text-xs text-emerald-700">You are signed in as {created.email}.</p>
                </div>
              </div>

              <dl className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/60 text-sm">
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-stone-500">Name</dt>
                  <dd className="font-medium text-stone-900">{created.name}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-stone-500">Email</dt>
                  <dd className="truncate font-medium text-stone-900">{created.email}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-stone-500">Role</dt>
                  <dd className="font-medium capitalize text-stone-900">{created.role}</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#422719] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#331d12]"
                >
                  Continue to SalonBook
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Create another account
                </button>
              </div>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Emily Davis"
                      className={inputClass}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Phone Number{' '}
                    <span className="font-normal normal-case tracking-normal text-stone-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 019-2834"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Account type → sent to better-auth as `role` */}
                <fieldset>
                  <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Account Type
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
                      const active = role === value;

                      return (
                        <label
                          key={value}
                          className={cn(
                            'relative cursor-pointer rounded-xl border p-3.5 transition-all',
                            active
                              ? 'border-[#c56117] bg-amber-50/70 ring-1 ring-[#c56117]/40'
                              : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50',
                          )}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={value}
                            checked={active}
                            onChange={() => setRole(value)}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-2">
                            <Icon className={cn('h-4 w-4', active ? 'text-[#c56117]' : 'text-stone-400')} />
                            <span className={cn('text-sm font-semibold', active ? 'text-[#422719]' : 'text-stone-700')}>
                              {label}
                            </span>
                            {active && <Check className="ml-auto h-4 w-4 text-[#c56117]" />}
                          </span>
                          <span className="mt-1 block text-[11px] leading-snug text-stone-500">{hint}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-11 pr-11 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition-colors hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-stone-400">
                      At least 8 characters, one uppercase and one lowercase letter.
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      checked={form.acceptedTerms}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-[#422719] focus:ring-amber-500"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="font-medium text-[#c56117] hover:underline">Terms of Service</span> and{' '}
                      <span className="font-medium text-[#c56117] hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                  {errors.acceptedTerms && <p className="mt-1 text-xs text-rose-600">{errors.acceptedTerms}</p>}
                </div>

                {serverError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#422719] py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#331d12] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 font-medium text-stone-400">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}