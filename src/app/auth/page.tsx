import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { AuthForm } from './form';

export const metadata = { title: 'Вход: Решись Авиа' };

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  if (await currentUser()) redirect('/forecast');
  const { mode } = await searchParams;
  return <AuthForm mode={mode === 'login' ? 'login' : 'register'} />;
}
