'use client';

import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Consent = 'accepted' | 'refused' | null;

const STORAGE_KEY = 'cookie_consent';

const GA_ID = 'G-7LHJF329GL';
const META_PIXEL_ID = '905672405851583';

export function ConsentManager() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent;
    setConsent(stored);
    setMounted(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  }

  function refuse() {
    localStorage.setItem(STORAGE_KEY, 'refused');
    setConsent('refused');
  }

  if (!mounted) return null;

  return (
    <>
      {/* Scripts analytics — uniquement si accepté */}
      {consent === 'accepted' && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
            }}
          />
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
            }}
          />
        </>
      )}

      {/* Bannière cookies — affichée tant qu'aucun choix n'est fait */}
      {consent === null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies analytiques (Google Analytics, Meta Pixel) pour améliorer le site.{' '}
              <Link href="/privacy" className="font-semibold text-primary hover:underline">
                En savoir plus
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={refuse}
                className="rounded-full border px-4 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                Refuser
              </button>
              <button
                onClick={accept}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
