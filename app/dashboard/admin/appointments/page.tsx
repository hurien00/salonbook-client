'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Appointment, Service, User } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

export default function AdminManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (currentStatus: string, currentSearch: string) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentStatus !== 'All') queryParams.append('status', currentStatus);
        if (currentSearch.trim()) queryParams.append('search', currentSearch.trim());

        const queryString = queryParams.toString();
        const endpoint = queryString
          ? `/appointments/admin/all?${queryString}`
          : '/appointments/admin/all';

        const res = (await api.get(endpoint)) as ApiResponse<Appointment[]> | Appointment[];
        const list = Array.isArray(res) ? res : res?.data;

        if (Array.isArray(list)) {
          setAppointments(list);
        } else {
          setAppointments([]);
        }
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Failed to load appointments'));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAppointments(statusFilter, search);
    }, 250);

    return () => clearTimeout(timer);
  }, [statusFilter, search, fetchAppointments]);

  useEffect(() => {
    if (!selectedAppointment) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAppointment(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedAppointment]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchAppointments(statusFilter, search);
  };

  // Confirm pending appointment
  const handleConfirmAppointment = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = (await api.patch(`/appointments/${id}/confirm`)) as ApiResponse<unknown>;
      if (res?.success !== false) {
        toast.success('Appointment confirmed! Customer can now proceed with Stripe payment.');
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: 'confirmed' } : app)),
        );
        setSelectedAppointment((prev) =>
          prev && prev._id === id ? { ...prev, status: 'confirmed' } : prev,
        );
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to confirm appointment'));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel appointment (Admin can cancel pending or confirmed)
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setActionLoadingId(id);
    try {
      const res = (await api.patch(`/appointments/${id}/admin-cancel`)) as ApiResponse<unknown>;
      if (res?.success !== false) {
        toast.success('Appointment cancelled successfully');
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: 'cancelled' } : app)),
        );
        setSelectedAppointment((prev) =>
          prev && prev._id === id ? { ...prev, status: 'cancelled' } : prev,
        );
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to cancel appointment'));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#c56117] border border-amber-200/70">
            <Sparkles className="h-3 w-3" />
            Salon Operations
          </span>
          <h1 className="mt-2 font-serif text-2xl font-bold text-[#422719] sm:text-3xl">
            Manage Appointments
          </h1>
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            Review customer appointment requests, confirm bookings, or cancel scheduled reservations.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-[#faf9f8] px-4 py-2 text-xs font-medium text-stone-600">
          Total Shown: <span className="font-bold text-[#422719]">{appointments.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or service title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-[#eaf0fb]/60 py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-shadow focus:border-[#c56117] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/25"
          />
        </form>

        <div className="relative sm:w-48">
          <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter appointments by status"
            className="w-full cursor-pointer rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-stone-800 transition-shadow focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List / Table */}
      {loading ? (
        <div className="rounded-3xl border border-stone-200/80 bg-[#faf9f8] p-12 text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#c56117]" />
          <p className="text-sm font-medium text-stone-600">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="space-y-3 rounded-3xl border border-stone-200/80 bg-[#faf9f8] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#c56117]">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#422719]">No Appointments Found</h3>
          <p className="text-xs text-stone-500 sm:text-sm">
            No customer appointment requests match the current filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-[#faf9f8] font-mono text-[11px] uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {appointments.map((app) => {
                  const customer = app.customerId as User | string;
                  const service = app.serviceId as Service | string;
                  const customerName =
                    typeof customer === 'object' && customer?.name ? customer.name : 'Unknown';
                  const customerEmail =
                    typeof customer === 'object' && customer?.email ? customer.email : '';
                  const serviceName =
                    typeof service === 'object' && service?.serviceName
                      ? service.serviceName
                      : 'Service';
                  const isBusy = actionLoadingId === app._id;

                  return (
                    <tr key={app._id} className="transition-colors hover:bg-amber-50/30">
                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#422719]">{customerName}</div>
                        <div className="text-xs text-stone-500">{customerEmail}</div>
                      </td>

                      {/* Service */}
                      <td className="max-w-[200px] truncate px-4 py-3.5 font-medium text-stone-800">
                        {serviceName}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5 text-xs text-stone-600">
                        <p className="font-semibold text-stone-800">{app.appointmentDate}</p>
                        <p className="text-stone-500">{app.timeSlot}</p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-serif font-bold text-[#c56117]">
                        {formatPrice(app.servicePrice)}
                      </td>

                      {/* Appointment Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            app.paymentStatus === 'paid'
                              ? 'bg-[#422719] text-amber-200'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {app.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="space-x-2 px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(app)}
                          className="inline-flex items-center justify-center rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-[#422719]"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {app.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => void handleConfirmAppointment(app._id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#422719] px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#331d12] disabled:cursor-not-allowed disabled:opacity-50"
                            title="Confirm appointment"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                            )}
                            <span>Confirm</span>
                          </button>
                        )}

                        {app.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => void handleCancelAppointment(app._id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Cancel appointment"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="w-full max-w-lg space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
              <h3 className="font-serif text-xl font-bold text-[#422719]">
                Appointment Full Info
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close modal"
                className="rounded-xl p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-stone-700">
              <div className="space-y-1 rounded-2xl border border-amber-200/60 bg-[#faf9f8] p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#c56117]">
                  Customer
                </p>
                <p className="font-semibold text-[#422719]">
                  {typeof selectedAppointment.customerId === 'object'
                    ? (selectedAppointment.customerId as User).name
                    : 'Customer'}
                </p>
                <p className="text-xs text-stone-600">
                  {typeof selectedAppointment.customerId === 'object'
                    ? (selectedAppointment.customerId as User).email
                    : ''}
                </p>
                <p className="text-xs text-stone-600">
                  Phone:{' '}
                  {typeof selectedAppointment.customerId === 'object'
                    ? (selectedAppointment.customerId as User)?.phone || 'Not provided'
                    : 'Not provided'}
                </p>
              </div>

              <div className="flex justify-between border-b border-stone-100 py-1.5">
                <span className="text-stone-500">Service:</span>
                <span className="font-semibold text-[#422719]">
                  {typeof selectedAppointment.serviceId === 'object'
                    ? (selectedAppointment.serviceId as Service).serviceName
                    : 'Service'}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 py-1.5">
                <span className="text-stone-500">Date & Slot:</span>
                <span className="font-semibold text-stone-800">
                  {selectedAppointment.appointmentDate} at {selectedAppointment.timeSlot}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 py-1.5">
                <span className="text-stone-500">Price:</span>
                <span className="font-serif font-bold text-[#c56117]">
                  {formatPrice(selectedAppointment.servicePrice)}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 py-1.5">
                <span className="text-stone-500">Appointment Status:</span>
                <span className="font-semibold capitalize text-stone-800">
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 py-1.5">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-semibold capitalize text-stone-800">
                  {selectedAppointment.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between border-b border-stone-100 py-1.5">
                <span className="text-stone-500">Booking Request Date:</span>
                <span className="text-stone-600">
                  {formatDate(selectedAppointment.createdAt)}
                </span>
              </div>

              {selectedAppointment.message && (
                <div className="pt-2">
                  <span className="font-mono text-xs uppercase text-stone-500">
                    Customer Message:
                  </span>
                  <p className="mt-1 rounded-xl border border-stone-200/70 bg-[#faf9f8] p-3 text-xs italic text-stone-800">
                    "{selectedAppointment.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl bg-[#422719] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#331d12]"
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