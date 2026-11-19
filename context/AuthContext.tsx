'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: (data?.user as AuthUser | undefined) ?? null,
      isLoading: isPending,
      logout: async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
      },
    }),
    [data, isPending, router],
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
