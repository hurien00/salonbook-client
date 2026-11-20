import { authClient } from '@/lib/auth-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(endpoint: string, params?: RequestOptions['params']): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function getSessionHeaders(): Promise<Record<string, string>> {
  try {
    const sessionRes = await authClient.getSession();
    const user = sessionRes?.data?.user as
      | { id?: string; role?: string; email?: string }
      | undefined;

    const headers: Record<string, string> = {};
    if (user?.role) {
      headers['x-user-role'] = String(user.role);
    }
    if (user?.id) {
      headers['x-user-id'] = String(user.id);
    }
    if (user?.email) {
      headers['x-user-email'] = String(user.email);
    }
    return headers;
  } catch {
    return {};
  }
}

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = options;
  const url = buildUrl(endpoint, params);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const sessionHeaders = await getSessionHeaders();

  const response = await fetch(url, {
    ...rest,
    body,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...sessionHeaders,
      ...headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as { message?: unknown }).message === 'string' &&
        (data as { message: string }).message) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function uploadImageFile(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_IMGBB_API_KEY is not configured');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { url?: string; display_url?: string };
    error?: { message?: string };
  } | null;

  const uploadedUrl = data?.data?.url || data?.data?.display_url;
  if (!response.ok || !data?.success || !uploadedUrl) {
    throw new Error(data?.error?.message || 'Failed to upload image to ImgBB');
  }

  return uploadedUrl;
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;