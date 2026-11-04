'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import { WorkspaceScreen } from '../ui';
import { api, IMAGES, loadCalendar, loadForecast } from '../client';

type Props = Pick<ComponentProps<typeof WorkspaceScreen>, 'routes' | 'user' | 'initialQuery' | 'initialResult' | 'initialCalendar'>;

export function Workspace(props: Props) {
  const router = useRouter();
  const logout = async () => {
    await api('auth/logout', {}).catch(() => undefined);
    router.replace('/');
    router.refresh();
  };
  return (
    <WorkspaceScreen
      {...props}
      loadForecast={loadForecast}
      loadCalendar={loadCalendar}
      onLogout={logout}
      heroImage={IMAGES.hero}
      routeImages={IMAGES}
    />
  );
}
