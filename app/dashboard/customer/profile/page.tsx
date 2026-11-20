'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, type AuthUser } from '@/context/AuthContext';
import { api, uploadImageFile } from '@/lib/api';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  ShieldCheck,
} from 'lucide-react';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageOption, setImageOption] = useState<'url' | 'file'>('file');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setImageUrl(user.image || '');
      setPreviewUrl(user.image || '');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = user?.image || '';

      if (imageOption === 'file') {
        if (imageFile) {
          setUploadingImage(true);
          try {
            finalImageUrl = await uploadImageFile(imageFile);
            setImageUrl(finalImageUrl);
          } catch (uploadErr: unknown) {
            const msg =
              uploadErr instanceof Error ? uploadErr.message : 'Failed to upload image';
            toast.error(`Image upload failed: ${msg}`);
            return;
          } finally {
            setUploadingImage(false);
          }
        }
      } else {
        finalImageUrl = imageUrl.trim();
      }

      const payload: { name: string; phone: string; image?: string } = {
        name: trimmedName,
        phone: phone.trim(),
      };
      if (finalImageUrl) {
        payload.image = finalImageUrl;
      }

      const res = (await api.put('/auth/profile', payload)) as
        | { success?: boolean; data?: AuthUser | null; user?: AuthUser | null }
        | AuthUser
        | null;

      const updatedProfile: AuthUser | null =
        res && typeof res === 'object'
          ? 'data' in res || 'user' in res
            ? res.data ?? res.user ?? null
            : (res as AuthUser)
          : null;

      if (updatedProfile) {
        updateUser(updatedProfile);
        if (updatedProfile.image) {
          setImageUrl(updatedProfile.image);
          setPreviewUrl(updatedProfile.image);
        }
      } else if (user) {
        updateUser({
          ...user,
          name: trimmedName,
          phone: phone.trim(),
          image: finalImageUrl || user.image,
        });
      }

      setImageFile(null);
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const displayAvatar =
    imageOption === 'file'
      ? previewUrl || user?.image || DEFAULT_AVATAR
      : imageUrl.trim() || user?.image || DEFAULT_AVATAR;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          View and update your personal information and contact preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
        {/* User Info Header */}
        <div className="flex items-center space-x-5 pb-6 border-b border-stone-100">
          <img
            src={displayAvatar}
            alt={user?.name || 'Customer'}
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-300"
          />
          <div>
            <h2 className="text-lg font-bold text-stone-900">{user?.name || 'Customer'}</h2>
            <p className="text-xs text-stone-500">{user?.email || ''}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                {user?.role || 'customer'}
              </span>
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Active Account
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleProfileSave(e)} className="space-y-5">
          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address (Permanent)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Email is linked to your authentication credentials.
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm text-stone-800"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm text-stone-800"
              />
            </div>
          </div>

          {/* Profile Image Option */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Update Profile Image
            </label>
            <div className="flex space-x-4 mb-2">
              <button
                type="button"
                onClick={() => setImageOption('file')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  imageOption === 'file'
                    ? 'border-amber-700 text-amber-800'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                Upload File (ImgBB)
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageOption('url');
                  setPreviewUrl(imageUrl || user?.image || '');
                }}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  imageOption === 'url'
                    ? 'border-amber-700 text-amber-800'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                Image URL
              </button>
            </div>

            {imageOption === 'file' ? (
              <label className="cursor-pointer flex items-center justify-center space-x-2 border-2 border-dashed border-stone-300 rounded-xl py-3 px-4 hover:border-amber-600 transition-colors bg-stone-50">
                <Upload className="w-4 h-4 text-stone-500" />
                <span className="text-xs text-stone-600 truncate">
                  {imageFile ? imageFile.name : 'Choose image to upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="relative">
                <ImageIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm text-stone-800"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-salon-900 hover:bg-salon-800 text-white font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}