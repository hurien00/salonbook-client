'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  role?: string | null;
  isBlocked?: boolean | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  /** Optimistically patch the current user (e.g. after a profile update). */
  updateUser: (updates: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  // Local overrides for the session user, keyed by user id so they are
  // discarded automatically if a different account signs in.
  const [override, setOverride] = useState<{ id: string; changes: Partial<AuthUser> } | null>(
    null,
  );

  const sessionUser = (data?.user as AuthUser | undefined) ?? null;
  const sessionUserId = sessionUser?.id;

  const user = useMemo<AuthUser | null>(() => {
    if (!sessionUser) return null;
    if (!override || override.id !== sessionUser.id) return sessionUser;
    return { ...sessionUser, ...override.changes };
  }, [sessionUser, override]);

  const updateUser = useCallback(
    (updates: Partial<AuthUser>) => {
      if (!sessionUserId) return;

      setOverride((prev) => ({
        id: sessionUserId,
        changes: {
          ...(prev && prev.id === sessionUserId ? prev.changes : {}),
          ...updates,
        },
      }));
    },
    [sessionUserId],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: isPending,
      updateUser,
      logout: async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
      },
    }),
    [user, isPending, updateUser, router],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }

  return context;
}
