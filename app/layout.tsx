import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

import { QueryProvider } from '@/components/shared/query-provider';
import { ThemeProvider } from '@/components/shared/theme-provider';
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
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <Analytics />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','905672405851583');fbq('track','PageView');`,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7LHJF329GL"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-7LHJF329GL');`,
          }}
        />
      </body>
    </html>
  );
}
