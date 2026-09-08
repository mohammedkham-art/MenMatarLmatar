'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const COOKIE_NAME = 'mml_app_popup_closed';
const COOKIE_DAYS = 7;
const DELAY_MS = 5000;
const PLAY_URL = 'https://play.google.com/store/apps/details?id=ma.menmatarlmatar.app';
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0f3d2e&bgcolor=ffffff&data=${encodeURIComponent(PLAY_URL)}`;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, days: number) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=1; expires=${exp}; path=/; SameSite=Lax`;
}

export function DownloadAppPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookie(COOKIE_NAME)) return;
    const t = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setCookie(COOKIE_NAME, COOKIE_DAYS);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Télécharge l'application MML"
          className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header vert */}
          <div className="relative bg-[#0f3d2e] px-6 pt-6 pb-8 text-center">
            <button
              onClick={close}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white shadow-md">
              <Image
                src="/images/logo-sticker.png"
                alt="Men Matar L Matar"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>

            <p className="mt-3 text-xl font-black text-white" dir="rtl">
              ما تفوّتش أي عرض
            </p>
            <p className="mt-1.5 text-sm leading-snug text-white/80">
              Ne rate aucune offre —<br />reçois les deals en temps réel
            </p>
          </div>

          {/* Corps beige */}
          <div className="bg-[#faf8f3] px-6 py-6 text-center">
            {/* QR code */}
            <div className="mx-auto mb-4 w-fit rounded-xl border border-[#0f3d2e]/10 bg-white p-3 shadow-sm">
              <Image
                src={QR_SRC}
                alt="QR code Google Play"
                width={160}
                height={160}
                unoptimized
              />
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0f3d2e]/50">
              Disponible sur Android
            </p>

            {/* Bouton Play Store */}
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#0f3d2e] px-5 py-3 text-sm font-black text-white transition hover:opacity-90"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" />
                <path d="M14.208 12l3.924 3.924-8.044 4.607a1 1 0 01-1.003-.045L14.208 12z" />
                <path d="M20.802 10.145l-2.67 1.53L14.208 12l3.924-3.924 2.67 1.53a1 1 0 010 1.738z" />
                <path d="M9.085 3.514a1 1 0 011.003-.045l8.044 4.607L14.208 12 9.085 3.514z" />
              </svg>
              Télécharger sur Google Play
            </a>

            <p className="mt-3 text-xs text-[#0f3d2e]/40">
              Scanne le QR code ou clique le bouton
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
