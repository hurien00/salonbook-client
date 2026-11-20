'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useSession } from '@/lib/auth-client';
import { Service } from '@/types';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Clock,
  Sparkles,
  Calendar,
  Send,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

const PREDEFINED_TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:30 AM - 12:30 PM',
  '01:00 PM - 02:00 PM',
  '02:30 PM - 03:30 PM',
  '04:00 PM - 05:00 PM',
  '05:30 PM - 06:30 PM',
  '07:00 PM - 08:00 PM',
];

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { data: session, isPending: authLoading } = useSession();
  const user = session?.user as SessionUser | undefined;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(PREDEFINED_TIME_SLOTS[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!authLoading && !user && id) {
      toast.info('Please sign in to view full service details and book an appointment.');
      router.replace(`/signin?redirect=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }

    if (!id) return;

    let isMounted = true;
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = (await api.get(`/services/${id}`)) as
          | { success?: boolean; data?: Service; message?: string }
          | Service;

        const data =
          typeof res === 'object' && res !== null && 'data' in res && res.data
            ? res.data
            : (res as Service);

        if (isMounted) {
          if (data && '_id' in data) {
            setService(data);
            setError(null);
          } else {
            setError('Service not found');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Invalid service ID or service is no longer available';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchService();
    return () => {
      isMounted = false;
    };
  }, [id, user, authLoading, router]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be signed in to submit an appointment request');
      router.replace(`/signin?redirect=${encodeURIComponent(`/services/${id || ''}`)}`);
      return;
    }

    if (user.role === 'admin') {
      toast.error(
        'Admins cannot submit customer appointment requests. Please use a customer account.',
      );
      return;
    }

    if (!appointmentDate) {
      toast.error('Please select an appointment date');
      return;
    }

    if (!timeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!service || service.status !== 'active') {
      toast.error('This service is currently inactive and cannot be booked.');
      return;
    }

    setSubmitting(true);
    try {
      const res = (await api.post('/appointments', {
        serviceId: service._id,
        appointmentDate,
        timeSlot,
        message,
      })) as { success?: boolean; message?: string };

      if (res?.success !== false) {
        toast.success(
          'Appointment request submitted successfully! Pending admin confirmation.',
        );
        router.push('/dashboard/customer/appointments');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit appointment request';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#c56117]" />
          <p className="text-sm font-medium text-stone-600">Loading service details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl space-y-6 px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#422719]">Service Not Found</h1>
          <p className="text-sm text-stone-600">
            {error || 'The requested salon service does not exist or has been removed.'}
          </p>
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 rounded-full bg-[#422719] px-6 py-3 font-medium text-white transition-colors hover:bg-[#331d12]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse Services</span>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#faf9f8] py-12 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/services"
              className="inline-flex items-center space-x-2 text-sm font-medium text-stone-500 hover:text-[#c56117]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all services</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xs">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <img
                    src={service.image}
                    alt={service.serviceName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 flex items-center space-x-1.5 rounded-full bg-[#1f140f]/85 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-md backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{service.category}</span>
                  </div>
                  {service.status === 'inactive' && (
                    <div className="absolute right-4 top-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">
                      Inactive
                    </div>
                  )}
                </div>

                <div className="space-y-6 p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-6">
                    <div>
                      <h1 className="font-serif text-3xl font-bold text-[#422719]">
                        {service.serviceName}
                      </h1>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-stone-500">
                        <span className="flex items-center space-x-1.5">
                          <Clock className="h-4 w-4 text-[#c56117]" />
                          <span>{service.duration} mins duration</span>
                        </span>
                        <span>•</span>
                        <span className="font-medium text-stone-700">{service.category}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-xs uppercase tracking-wider text-stone-400">
                        Price
                      </p>
                      <p className="font-serif text-3xl font-bold text-[#c56117]">
                        {formatPrice(service.price)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#422719]">
                      About This Service
                    </h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
                      {service.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 text-xs text-stone-600 sm:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Certified Master Stylists</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Premium Botanicals & Salon Products</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Complimentary Scalp Consultation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Contactless Stripe Payment upon confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl border border-stone-200 bg-white p-8 shadow-2xs">
                <div className="mb-6 flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#c56117]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#422719]">
                      Request Appointment
                    </h2>
                    <p className="text-xs text-stone-500">Pick your preferred date and time slot</p>
                  </div>
                </div>

                {user?.role === 'admin' ? (
                  <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="flex items-center space-x-2 font-semibold">
                      <AlertCircle className="h-4 w-4 text-[#c56117]" />
                      <span>Admin Account Detected</span>
                    </div>
                    <p className="text-xs leading-relaxed text-amber-800">
                      Admins cannot submit customer appointment requests. Please switch to or
                      register a customer account to test booking.
                    </p>
                  </div>
                ) : service.status !== 'active' ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                    <p className="font-semibold">Service Unavailable</p>
                    <p className="mt-1 text-xs text-rose-700">
                      This service is currently inactive and cannot accept new appointments.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={(e) => void handleBookingSubmit(e)} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Appointment Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Available Time Slot <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                      >
                        {PREDEFINED_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Additional Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any special styling preferences, hair history, or notes for your artist..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-[#faf9f8] p-4 text-sm">
                      <span className="text-stone-600">Total Due on Confirmation:</span>
                      <span className="text-base font-bold text-[#422719]">
                        {formatPrice(service.price)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#422719] px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-[#331d12] disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 text-amber-300" />
                          <span>Request Appointment</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] leading-relaxed text-stone-400">
                      Your request starts in <strong>Pending</strong> status. Once approved by salon
                      administration, you can complete payment securely via Stripe.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}