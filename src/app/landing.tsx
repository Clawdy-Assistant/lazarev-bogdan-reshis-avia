'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import { LandingScreen } from './ui';
import { IMAGES, loadDemo } from './client';

type Props = Pick<ComponentProps<typeof LandingScreen>, 'routes' | 'demoStart'>;

export function Landing({ routes, demoStart }: Props) {
  const router = useRouter();
  return (
    <LandingScreen
      routes={routes}
      demoStart={demoStart}
      images={IMAGES}
      loadDemo={loadDemo}
      onRegister={() => router.push('/auth?mode=register')}
      onLogin={() => router.push('/auth?mode=login')}
    />
  );
}
