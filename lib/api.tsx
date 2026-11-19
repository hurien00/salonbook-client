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

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = options;
  const url = buildUrl(endpoint, params);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(url, {
    ...rest,
    body,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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