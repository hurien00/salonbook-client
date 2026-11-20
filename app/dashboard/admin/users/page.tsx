'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { User, Appointment, Service } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react';

type ExtendedUser = User & {
  id?: string;
  isBlocked?: boolean;
};

type ExtendedAppointment = Appointment & {
  serviceName?: string;
  customerId?: string | { _id?: string };
  customerEmail?: string;
};

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

function getUserId(u: ExtendedUser): string {
  return String(u._id || u.id || '');
}

function applyClientUserFilter(
  list: ExtendedUser[],
  searchTerm: string,
  status: string,
): ExtendedUser[] {
  const q = searchTerm.trim().toLowerCase();

  return list
    .filter((u) => String(u.role || 'customer').toLowerCase() !== 'admin')
    .filter((u) => {
      if (status === 'active') return !u.isBlocked;
      if (status === 'blocked') return Boolean(u.isBlocked);
      return true;
    })
    .filter((u) => {
      if (!q) return true;
      return (
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.phone || '').toLowerCase().includes(q)
      );
    });
}

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserDetails, setSelectedUserDetails] = useState<{
    user: ExtendedUser;
    appointments: ExtendedAppointment[];
  } | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (overrideSearch?: string, overrideStatus?: string) => {
      setLoading(true);
      const activeSearch = overrideSearch !== undefined ? overrideSearch : search;
      const activeStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;

      try {
        const queryParams = new URLSearchParams();
        if (activeSearch.trim()) queryParams.append('search', activeSearch.trim());
        if (activeStatus !== 'all') queryParams.append('status', activeStatus);

        const qs = queryParams.toString();
        const res = (await api.get(qs ? `/users?${qs}` : '/users')) as
          | { success?: boolean; data?: ExtendedUser[] }
          | ExtendedUser[];

        const rawList = Array.isArray(res)
          ? res
          : res && typeof res === 'object' && Array.isArray(res.data)
            ? res.data
            : null;

        if (rawList) {
          setUsers(applyClientUserFilter(rawList, activeSearch, activeStatus));
          return;
        }
      } catch {
        // Fallback to /user if /users endpoint is not configured yet
      }

      try {
        const fallbackRes = (await api.get('/user')) as
          | { success?: boolean; data?: ExtendedUser[] }
          | ExtendedUser[];

        const fallbackList = Array.isArray(fallbackRes)
          ? fallbackRes
          : fallbackRes && typeof fallbackRes === 'object' && Array.isArray(fallbackRes.data)
            ? fallbackRes.data
            : [];

        setUsers(applyClientUserFilter(fallbackList, activeSearch, activeStatus));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load customers';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter],
  );

  useEffect(() => {
    void fetchUsers();
  }, [statusFilter, fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchUsers(search, statusFilter);
  };

  const handleToggleBlock = async (id: string, currentlyBlocked: boolean) => {
    if (!id) return;
    const actionText = currentlyBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;

    setBlockingId(id);
    try {
      const res = (await api.patch(`/users/${id}/block`)) as {
        success?: boolean;
        message?: string;
        data?: { isBlocked?: boolean };
      };

      const nextBlocked =
        res?.data?.isBlocked !== undefined ? Boolean(res.data.isBlocked) : !currentlyBlocked;

      toast.success(res?.message || `User successfully ${actionText}ed`);
      setUsers((prev) =>
        prev.map((u) => (getUserId(u) === id ? { ...u, isBlocked: nextBlocked } : u)),
      );
      setSelectedUserDetails((prev) =>
        prev && getUserId(prev.user) === id
          ? { ...prev, user: { ...prev.user, isBlocked: nextBlocked } }
          : prev,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to ${actionText} user`;
      toast.error(msg);
    } finally {
      setBlockingId(null);
    }
  };

  const handleViewUser = async (targetUser: ExtendedUser) => {
    const id = getUserId(targetUser);
    if (!id) return;

    setLoadingDetailsId(id);
    try {
      const res = (await api.get(`/users/${id}`)) as {
        success?: boolean;
        data?: { user: ExtendedUser; appointments: ExtendedAppointment[] };
      };

      if (res?.success && res.data?.user) {
        setSelectedUserDetails({
          user: res.data.user,
          appointments: Array.isArray(res.data.appointments) ? res.data.appointments : [],
        });
        return;
      }
    } catch {
      // Fallback: load all appointments and filter for this customer
    }

    try {
      const appRes = (await api.get('/appointments')) as {
        success?: boolean;
        data?: ExtendedAppointment[];
      };

      const allAppointments = Array.isArray(appRes?.data) ? appRes.data : [];
      const userEmail = String(targetUser.email || '').toLowerCase();

      const customerAppointments = allAppointments.filter((app) => {
        const appCustomerId =
          typeof app.customerId === 'object' && app.customerId !== null
            ? String(app.customerId._id || '')
            : String(app.customerId || '');
        const appEmail = String(app.customerEmail || '').toLowerCase();

        return (id && appCustomerId === id) || (userEmail && appEmail === userEmail);
      });

      setSelectedUserDetails({
        user: targetUser,
        appointments: customerAppointments,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch customer profile details';
      toast.error(msg);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
          Manage Registered Customers
        </h1>
        <p className="mt-1 text-xs text-stone-500 sm:text-sm">
          Review customer profiles, monitor account status, and enforce security policies.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-300 py-2 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </form>

        <div className="relative sm:w-48">
          <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-stone-300 bg-white py-2 pl-10 pr-4 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="blocked">Blocked Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-amber-700" />
          <p className="text-sm font-medium text-stone-600">Loading customers...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-stone-400" />
          <h3 className="text-base font-bold text-stone-800">No Customers Found</h3>
          <p className="text-xs text-stone-500">
            No registered customers match your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 font-mono text-[11px] uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact Phone</th>
                  <th className="px-4 py-3">Member Since</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => {
                  const uid = getUserId(u);
                  return (
                    <tr key={uid} className="transition-colors hover:bg-stone-50/70">
                      {/* Customer */}
                      <td className="flex items-center space-x-3 px-4 py-3.5">
                        <img
                          src={u.image || DEFAULT_AVATAR}
                          alt={u.name}
                          className="h-10 w-10 rounded-full border border-stone-200 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-stone-900">{u.name}</p>
                          <p className="text-xs text-stone-500">{u.email}</p>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 text-xs text-stone-600">{u.phone || '—'}</td>

                      {/* Member Since */}
                      <td className="px-4 py-3.5 text-xs text-stone-600">
                        {u.createdAt ? formatDate(u.createdAt) : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase text-rose-800">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-800">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="space-x-2 px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => void handleViewUser(u)}
                          disabled={loadingDetailsId === uid}
                          className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                          title="View User Details"
                        >
                          {loadingDetailsId === uid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleToggleBlock(uid, Boolean(u.isBlocked))}
                          disabled={blockingId === uid}
                          className={`inline-flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                            u.isBlocked
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                          }`}
                          title={u.isBlocked ? 'Unblock customer' : 'Block customer'}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Block</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Profile & Appointments History Modal */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-xl space-y-5 overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-stone-900">Customer Details</h3>
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="text-lg font-bold text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            {/* Profile summary */}
            <div className="flex items-center space-x-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
              <img
                src={selectedUserDetails.user.image || DEFAULT_AVATAR}
                alt={selectedUserDetails.user.name}
                className="h-16 w-16 rounded-full border border-amber-300 object-cover"
              />
              <div className="space-y-0.5">
                <h4 className="text-base font-bold text-stone-900">
                  {selectedUserDetails.user.name}
                </h4>
                <p className="text-xs text-stone-500">{selectedUserDetails.user.email}</p>
                <p className="text-xs text-stone-600">
                  Phone: {selectedUserDetails.user.phone || 'None'}
                </p>
                <div className="pt-1">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      selectedUserDetails.user.isBlocked
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedUserDetails.user.isBlocked ? 'Blocked Account' : 'Active Account'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Booking History */}
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
                Booking History ({selectedUserDetails.appointments.length} appointments)
              </h4>
              {selectedUserDetails.appointments.length === 0 ? (
                <p className="text-xs italic text-stone-400">No appointments placed yet.</p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {selectedUserDetails.appointments.map((app) => {
                    const serviceTitle =
                      app.serviceName ||
                      (typeof app.serviceId === 'object' && app.serviceId !== null
                        ? (app.serviceId as Service).serviceName
                        : 'Salon Service');

                    return (
                      <div
                        key={app._id}
                        className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 p-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-stone-800">{serviceTitle}</p>
                          <p className="text-stone-500">
                            {app.appointmentDate} • {app.timeSlot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold capitalize">{app.status}</span>
                          <p className="text-[10px] capitalize text-stone-400">
                            {app.paymentStatus}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="rounded-xl bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-200"
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