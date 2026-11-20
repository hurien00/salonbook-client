'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Appointment, Service } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  CreditCard,
  XCircle,
  Eye,
  Loader2,
  CheckCircle2,
  Scissors,
  ArrowRight,
} from 'lucide-react';

type ExtendedAppointment = Appointment & {
  serviceName?: string;
  category?: string;
  serviceImage?: string;
};

const DEFAULT_SERVICE_IMG =
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80';

function getServiceInfo(app: ExtendedAppointment) {
  const isServiceObj = typeof app.serviceId === 'object' && app.serviceId !== null;
  const serviceObj = isServiceObj ? (app.serviceId as Service) : null;

  return {
    name: app.serviceName || serviceObj?.serviceName || 'Salon Service',
    category: app.category || serviceObj?.category || 'General',
    image: app.serviceImage || serviceObj?.image || DEFAULT_SERVICE_IMG,
    price: Number(app.servicePrice ?? serviceObj?.price ?? 0),
  };
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = (await api.get('/appointments')) as {
        success?: boolean;
        data?: ExtendedAppointment[];
        message?: string;
      };
      if (res?.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending appointment request?')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = (await api.patch(`/appointments/${id}/status`, {
        status: 'Cancelled',
      })) as { success?: boolean; message?: string };

      if (res?.success !== false) {
        toast.success(res?.message || 'Appointment cancelled successfully');
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: 'Cancelled' } : app)),
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayNow = async (appointmentId: string) => {
    setPayingId(appointmentId);
    try {
      const res = (await api.post('/transactions/create-checkout-session', {
        appointmentId,
      })) as { success?: boolean; url?: string; message?: string };

      if (res?.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res?.message || 'Could not create payment session. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment initiation failed';
      toast.error(message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
            My Appointments
          </h1>
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            Review your appointment statuses, complete payments for confirmed sessions, and manage requests.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center space-x-2 self-start rounded-xl bg-salon-900 px-4 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-salon-800 sm:self-auto"
        >
          <Scissors className="h-3.5 w-3.5" />
          <span>Book Another Service</span>
        </Link>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-amber-700" />
          <p className="text-sm font-medium text-stone-600">Loading your appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">No Appointments Yet</h3>
          <p className="mx-auto max-w-sm text-sm text-stone-500">
            You haven't booked any salon appointments. Explore our luxury services to reserve your first slot!
          </p>
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-amber-500"
          >
            <span>Explore Salon Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => {
            const info = getServiceInfo(app);
            const statusLower = String(app.status || 'Pending').toLowerCase();
            const paymentLower = String(app.paymentStatus || 'Unpaid').toLowerCase();

            return (
              <div
                key={app._id}
                className="flex flex-col justify-between gap-6 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all hover:border-amber-200 sm:p-6 lg:flex-row lg:items-center"
              >
                <div className="flex items-start space-x-4 sm:items-center">
                  <img
                    src={info.image}
                    alt={info.name}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-stone-200 object-cover sm:h-20 sm:w-20"
                  />
                  <div className="space-y-1">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      {info.category}
                    </span>
                    <h3 className="line-clamp-1 font-serif text-base font-bold text-stone-900 sm:text-lg">
                      {info.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-stone-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" />
                        <span className="font-medium text-stone-700">{app.appointmentDate}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-stone-400" />
                        <span>{app.timeSlot}</span>
                      </span>
                      <span>•</span>
                      <span className="text-stone-400">
                        Booked: {app.createdAt ? formatDate(app.createdAt) : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                      Amount
                    </p>
                    <p className="font-serif text-lg font-bold text-stone-900">
                      {formatPrice(info.price)}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        statusLower === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : statusLower === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {statusLower === 'confirmed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {statusLower === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                      {statusLower === 'cancelled' && <XCircle className="mr-1 h-3 w-3" />}
                      {app.status || 'Pending'}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        paymentLower === 'paid'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      {app.paymentStatus || 'Unpaid'}
                    </span>
                  </div>

                  <div className="mt-2 flex w-full items-center space-x-2 sm:mt-0 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(app)}
                      className="rounded-xl border border-stone-200 p-2 text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {statusLower === 'confirmed' && paymentLower === 'unpaid' && (
                      <button
                        type="button"
                        onClick={() => void handlePayNow(app._id)}
                        disabled={payingId === app._id}
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {payingId === app._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5" />
                        )}
                        <span>Pay Now</span>
                      </button>
                    )}

                    {statusLower === 'pending' && (
                      <button
                        type="button"
                        onClick={() => void handleCancelAppointment(app._id)}
                        disabled={cancellingId === app._id}
                        className="inline-flex items-center space-x-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                      >
                        {cancellingId === app._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        <span>Cancel Request</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-stone-900">Appointment Details</h3>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-lg font-bold text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-stone-700">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Service:</span>
                <span className="font-semibold text-stone-900">
                  {getServiceInfo(selectedAppointment).name}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Date:</span>
                <span className="font-semibold">{selectedAppointment.appointmentDate}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Time Slot:</span>
                <span className="font-semibold">{selectedAppointment.timeSlot}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Price:</span>
                <span className="font-bold text-amber-800">
                  {formatPrice(getServiceInfo(selectedAppointment).price)}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Appointment Status:</span>
                <span className="font-semibold">{selectedAppointment.status || 'Pending'}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-semibold">
                  {selectedAppointment.paymentStatus || 'Unpaid'}
                </span>
              </div>

              {selectedAppointment.message && (
                <div className="pt-2">
                  <span className="block font-mono text-xs uppercase text-stone-500">
                    Your Message:
                  </span>
                  <p className="mt-1 rounded-xl bg-stone-50 p-3 text-xs italic text-stone-800">
                    "{selectedAppointment.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}