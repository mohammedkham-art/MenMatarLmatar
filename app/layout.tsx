import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

import { QueryProvider } from '@/components/shared/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Men Matar L Matar',
  description: 'Travel SaaS foundation for Moroccan travelers.',
  icons: {
    icon: [
      { url: '/images/favicon.ico' },
      {
        url: '/images/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/images/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/images/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/images/site.webmanifest',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
