'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { Service } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Sparkles,
  Clock,
  ShieldAlert,
  Loader2,
  X,
} from 'lucide-react';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

const SERVICE_CATEGORIES = [
  'Haircut & Styling',
  'Hair Coloring',
  'Hair Treatment',
  'Facial & Skincare',
  'Makeup',
  'Manicure & Pedicure',
  'Spa & Massage',
];

type ServiceFormState = {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  status: 'active' | 'inactive';
  imageFile: File | null;
  existingImageUrl: string;
};

const EMPTY_FORM: ServiceFormState = {
  serviceName: '',
  category: SERVICE_CATEGORIES[0],
  description: '',
  price: '',
  duration: '',
  status: 'active',
  imageFile: null,
  existingImageUrl: '',
};

export default function AdminServicesPage() {
  const { data: session, isPending: authLoading } = useSession();
  const user = session?.user as SessionUser | undefined;
  const isAdmin = user?.role === 'admin';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await api.get('/services?includeInactive=true')) as
        | { success?: boolean; data?: Service[] }
        | Service[];
      const list = Array.isArray(res) ? res : res?.data;
      setServices(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load services';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      void fetchServices();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAdmin, fetchServices]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5MB or less');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setForm((prev) => ({ ...prev, imageFile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviewUrl(null);
  };

  const handleEditClick = (service: Service) => {
    if (!service._id) return;
    setEditingId(service._id);
    setForm({
      serviceName: service.serviceName,
      category: service.category || SERVICE_CATEGORIES[0],
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration),
      status: service.status === 'inactive' ? 'inactive' : 'active',
      imageFile: null,
      existingImageUrl: service.image || '',
    });
    setPreviewUrl(service.image || null);
  };

  const handleDeleteClick = async (id: string) => {
    if (!isAdmin) {
      toast.error('Only Admin can delete services');
      return;
    }
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted successfully');
      setServices((prev) => prev.filter((item) => item._id !== id));
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete service';
      toast.error(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('Only Admin can create or update services');
      return;
    }

    const numericPrice = Number(form.price);
    const numericDuration = Number(form.duration);

    if (!form.serviceName.trim()) {
      toast.error('Service Name is required');
      return;
    }
    if (!form.category.trim()) {
      toast.error('Service Category is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error('Price must be a positive number');
      return;
    }
    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      toast.error('Estimated Duration must be a positive number');
      return;
    }
    if (!editingId && !form.imageFile) {
      toast.error('Please upload a service image');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('serviceName', form.serviceName.trim());
      formData.append('category', form.category.trim());
      formData.append('description', form.description.trim());
      formData.append('price', String(numericPrice));
      formData.append('duration', String(numericDuration));
      formData.append('status', form.status);

      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      if (editingId) {
        const res = (await api.patch(`/services/${editingId}`, formData)) as
          | { success?: boolean; data?: Service }
          | Service;
        const updated =
          typeof res === 'object' && res !== null && 'data' in res && res.data
            ? res.data
            : (res as Service);

        toast.success('Service updated successfully');
        setServices((prev) =>
          prev.map((item) => (item._id === editingId ? { ...item, ...updated } : item)),
        );
      } else {
        const res = (await api.post('/services', formData)) as
          | { success?: boolean; data?: Service }
          | Service;
        const created =
          typeof res === 'object' && res !== null && 'data' in res && res.data
            ? res.data
            : (res as Service);

        toast.success('Service added to services collection');
        if (created?._id) {
          setServices((prev) => [created, ...prev]);
        } else {
          await fetchServices();
        }
      }

      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save service';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#c56117]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-rose-600" />
        <h2 className="font-serif text-lg font-bold text-[#422719]">Admin Access Required</h2>
        <p className="text-xs text-stone-600">
          Only Admin can create, update, or delete salon services.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#c56117]">
            <Sparkles className="h-3 w-3" />
            Services Catalog
          </span>
          <h1 className="mt-2 font-serif text-2xl font-bold text-[#422719] sm:text-3xl">
            {editingId ? 'Update Service' : 'Add New Service'}
          </h1>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-5 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Service Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.serviceName}
              onChange={(e) => setForm((prev) => ({ ...prev, serviceName: e.target.value }))}
              placeholder="e.g., Signature Keratin Blowout"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Service Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Price (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="e.g., 1500"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Estimated Duration (minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={form.duration}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 60"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Service Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value === 'inactive' ? 'inactive' : 'active',
                }))
              }
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Service Image (Upload File) {!editingId && <span className="text-rose-500">*</span>}
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-stone-300 bg-[#faf9f8] px-4 py-2.5 text-sm text-stone-600 transition-colors hover:border-[#c56117]">
              <span className="truncate">
                {form.imageFile ? form.imageFile.name : 'Choose an image file...'}
              </span>
              <Upload className="h-4 w-4 shrink-0 text-[#c56117]" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the treatment, benefits, and what is included..."
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 focus:border-[#c56117] focus:outline-none focus:ring-2 focus:ring-amber-500/25"
          />
        </div>

        {previewUrl && (
          <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-[#faf9f8] p-3">
            <img
              src={previewUrl}
              alt="Service preview"
              className="h-16 w-24 rounded-xl border border-stone-200 object-cover"
            />
            <div className="text-xs text-stone-600">
              <p className="font-semibold text-[#422719]">Selected Image Preview</p>
              <p className="text-stone-500">
                {form.imageFile ? `${(form.imageFile.size / 1024).toFixed(1)} KB` : 'Current image'}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#422719] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#331d12] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{editingId ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-amber-300" />
                <span>{editingId ? 'Update Service' : 'Add Service'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#422719]">
          Services in Database ({services.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-[#c56117]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((srv) => (
              <div
                key={srv._id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <img
                    src={srv.image}
                    alt={srv.serviceName}
                    className="h-16 w-16 shrink-0 rounded-xl border border-stone-200 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-serif text-base font-bold text-[#422719]">
                        {srv.serviceName}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          srv.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {srv.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">{srv.category}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-[#c56117]">
                      <span>{formatPrice(srv.price)}</span>
                      <span className="inline-flex items-center gap-1 font-normal text-stone-500">
                        <Clock className="h-3 w-3" />
                        {srv.duration} mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEditClick(srv)}
                    className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-amber-50 hover:text-[#422719]"
                    title="Edit Service"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => srv._id && void handleDeleteClick(srv._id)}
                    className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                    title="Delete Service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}