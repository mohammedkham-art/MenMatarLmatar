import Image from 'next/image';
import Link from 'next/link';

import { LaunchCountdown } from '@/components/features/home/launch-countdown';

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/menmatarlmatar',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.25A4.75 4.75 0 1 1 7.25 12 4.75 4.75 0 0 1 12 7.25Zm0 2A2.75 2.75 0 1 0 14.75 12 2.75 2.75 0 0 0 12 9.25Zm5.25-2.55a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05Z"
        />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@menmatarlmatar',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M14.75 2h2.2a5.55 5.55 0 0 0 4.25 4.88v2.28a7.45 7.45 0 0 1-4.05-1.2v7.02A6.02 6.02 0 1 1 11.13 9v2.34a3.73 3.73 0 1 0 3.62 3.72V2Z"
        />
      </svg>
    ),
  },
];

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
      <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-[-8rem] h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="bg-white/92 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 p-1.5 shadow-xl shadow-black/10">
              <Image
                src="/images/logo-sticker.png"
                alt="Men Matar L Matar"
                width={160}
                height={160}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="grid leading-none">
              <span className="text-lg font-black tracking-tight">
                MEN MATAR
              </span>
              <span className="text-lg font-black tracking-tight text-accent">
                L MATAR
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-primary-foreground transition hover:-translate-y-0.5 hover:bg-white/[0.14]"
              >
                {link.icon}
              </Link>
            ))}
          </div>
        </header>

        <div className="grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-primary-foreground/70">
              Nouveau SaaS voyage marocain
            </p>

            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
              Prochainement
              <span
                dir="rtl"
                lang="ar"
                className="mt-4 block text-4xl text-accent md:text-6xl"
              >
                قريباً
              </span>
            </h1>

            <p className="text-primary-foreground/78 mt-7 max-w-2xl text-lg leading-8">
              Men Matar L Matar prépare une expérience simple pour découvrir les
              destinations accessibles avec un passeport marocain, suivre les
              visas, repérer les bons plans vols et simuler ton prochain séjour.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="https://www.instagram.com/menmatarlmatar"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-5 text-sm font-black text-accent-foreground shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Suivre sur Instagram
              </Link>
              <Link
                href="https://www.tiktok.com/@menmatarlmatar"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] px-5 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5 hover:bg-white/[0.14]"
              >
                Suivre sur TikTok
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/15 bg-black/20 p-5 shadow-2xl shadow-black/15 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-foreground/50">
              Décollage dans
            </p>
            <div className="mt-5">
              <LaunchCountdown
                launchDate={process.env.NEXT_PUBLIC_LAUNCH_DATE}
              />
            </div>
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.07] p-4">
              <p className="text-sm font-black">Passeport marocain</p>
              <p className="text-primary-foreground/68 mt-2 text-sm leading-6">
                Destinations sans visa, eVisa, visa à l’arrivée, deals de vols
                et simulateur IA de voyage.
              </p>
            </div>
          </aside>
        </div>

        <footer className="border-white/12 text-primary-foreground/58 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-sm">
          <span>© Men Matar L Matar</span>
          <span dir="rtl" lang="ar">
            نسافر بذكاء، ونعيش أحسن تجربة
          </span>
        </footer>
      </section>
    </main>
  );
}
