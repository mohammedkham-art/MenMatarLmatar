import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

import { QueryProvider } from '@/components/shared/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Men Matar L Matar',
  description:
    'Bons plans voyage depuis le Maroc, infos visa et simulateur IA pour préparer ton prochain départ.',
  metadataBase: new URL('https://menmatarlmatar.ma'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Men Matar L Matar',
    description:
      'Bons plans voyage depuis le Maroc, infos visa et simulateur IA pour préparer ton prochain départ.',
    url: 'https://menmatarlmatar.ma',
    siteName: 'Men Matar L Matar',
    images: [
      {
        url: '/images/og-men-matar-lmatar.png',
        width: 1200,
        height: 630,
        alt: 'Men Matar L Matar - bons plans voyage depuis le Maroc',
      },
    ],
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Men Matar L Matar',
    description:
      'Bons plans voyage depuis le Maroc, infos visa et simulateur IA pour préparer ton prochain départ.',
    images: ['/images/og-men-matar-lmatar.png'],
  },
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
