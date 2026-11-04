import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import './design.css';

const onest = Onest({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-onest' });

export const metadata: Metadata = {
  title: 'Решись Авиа: прогноз продаж билетов',
  description: 'Сколько билетов купят при вашей цене: прогноз продаж и загрузки рейса на июнь 2026.',
};

export const viewport: Viewport = { themeColor: '#0a6cf2' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="light" className={onest.variable}>
      <body>{children}</body>
    </html>
  );
}
