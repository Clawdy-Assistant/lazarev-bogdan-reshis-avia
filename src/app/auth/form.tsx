'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuthScreen } from '../ui';
import { ApiError, api, IMAGES } from '../client';

const message = (e: unknown) => (e instanceof ApiError ? e.message : 'Не удалось связаться с сервером. Попробуйте ещё раз.');

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const actions = useMemo(() => ({
    register: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      try { await api('auth/register', data); } catch (e) { return message(e); }
    },
    verify: async (email: string, code: string) => {
      try {
        await api('auth/verify', { email, code });
        router.replace('/forecast');
        router.refresh();
      } catch (e) { return message(e); }
    },
    resend: async (email: string) => {
      try { await api('auth/resend', { email }); } catch (e) { return message(e); }
    },
    login: async (email: string, password: string) => {
      try {
        const res = await api<{ status: string }>('auth/login', { email, password });
        if (res.status === 'needs_code') return { needsCode: true as const };
        router.replace('/forecast');
        router.refresh();
      } catch (e) { return message(e); }
    },
  }), [router]);

  return <AuthScreen initialStep={mode} heroImage={IMAGES.hero} actions={actions} />;
}
