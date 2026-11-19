'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Mail, Lock, LogIn, Scissors, AlertCircle } from 'lucide-react';

export type SignInFormData = {
  email: string;
  password: string;
};

const initialForm: SignInFormData = {
  email: '',
  password: '',
};

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignInFormData>(initialForm);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setIsLoading(true);

    try {
      const { data: signInResponse, error } = await authClient.signIn.email({
        email: form.email.trim(),
        password: form.password,
        rememberMe: true,
        callbackURL: '/',
      });

      console.log('sign in response', signInResponse, error);

      if (error) {
        setServerError(error.message || 'Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }
      router.refresh();
      router.push('/');
    } catch (err) {
      console.error('Unexpected sign-in error:', err);
      setServerError('Failed to connect to the server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
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
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Or{' '}
          <Link
            href="/signup"
            className="font-medium text-[#c56117] hover:underline"
          >
            create a new customer account
          </Link>
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
        <div className="space-y-6">
          {/* Server Error Alert */}
          {serverError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p>{serverError}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
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
                  disabled={isLoading}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jannat@gmail.com"
                  className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
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
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb] py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#422719] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#331d12] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? 'Signing In...' : 'Sign In'}
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

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60"
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
      </div>
    </div>
  );
}