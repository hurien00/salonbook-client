'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Lock, UserPlus, Scissors, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export type SignUpFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type SignUpFields = SignUpFormData & {
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

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpFields>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFields, string>>>({});
  const [collected, setCollected] = useState<(SignUpFormData & { submittedAt: string }) | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /**
   * Collects the form data only.
   * TODO: swap this for `await signUp.email({ name, email, password })` (better-auth) later.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof SignUpFields, string>> = {};

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

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      submittedAt: new Date().toISOString(),
    };

    console.log('[sign-up] collected form data:', payload);
    setCollected(payload);
  };

  const reset = () => {
    setCollected(null);
    setForm(initialForm);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col items-center justify-center px-4 py-12">
      {/* Header / Brand Logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#422719] text-amber-400 shadow-sm">
            <Scissors className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#422719]">
            Salon<span className="text-[#c56117]">Book</span>
          </span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="font-medium text-[#c56117] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[460px] rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
        {collected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Form data collected</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  Nothing was sent to a server yet — the payload is logged in the console.
                </p>
              </div>
            </div>

            <pre className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-700">
              {JSON.stringify(collected, null, 2)}
            </pre>

            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              Edit again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  FULL NAME
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Emily Davis"
                    className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jannat@gmail.com"
                    className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  PHONE <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••"
                      className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-10 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
                  {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    CONFIRM
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••"
                      className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-stone-400">
                Minimum 8 characters, including one uppercase and one lowercase letter.
              </p>

              {/* Terms Checkbox */}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#422719] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#331d12] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-stone-200" />
              <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-stone-400 whitespace-nowrap">
                OR CONTINUE WITH
              </span>
              <div className="w-full border-t border-stone-200" />
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={() => console.log('[sign-up] Google OAuth clicked')}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}