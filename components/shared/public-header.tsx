import Image from 'next/image';
import Link from 'next/link';

import { ThemeToggle } from '@/components/shared/theme-toggle';

export function PublicHeader() {
  return (
    <header className="bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 md:gap-6">
        <Link
          href="/"
          className="inline-flex min-w-0 shrink-0 items-center gap-3 md:gap-4"
          aria-label="Men Matar L Matar"
        >
          <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-muted/40 shadow-sm md:h-14 md:w-14">
            <Image
              src="/images/logo-sticker.png"
              alt=""
              width={180}
              height={180}
              priority
              className="absolute left-1/2 top-[-0.2rem] h-[4.9rem] w-[4.25rem] max-w-none -translate-x-1/2 object-contain md:top-[-0.25rem] md:h-[5.6rem] md:w-[4.85rem]"
            />
          </span>
          <span className="grid min-w-0 gap-0.5">
            <span className="brand-header-mark text-primary">
              <span>MEN MATAR</span>
              <span>L MATAR</span>
            </span>
            <span
              dir="rtl"
              lang="ar"
              className="hidden whitespace-nowrap text-sm font-bold text-accent-foreground/80 dark:text-foreground/50 md:block"
            >
              نسافر بذكاء، ونعيش أحسن تجربة
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-black text-muted-foreground md:gap-3">
          <Link
            href="/destinations"
            className="rounded-full px-3 py-2 transition hover:bg-muted hover:text-primary"
          >
            Destinations
          </Link>
          <Link
            href="/deals"
            className="rounded-full px-3 py-2 transition hover:bg-muted hover:text-primary"
          >
            Offres
          </Link>
          <Link
            href="/simulator"
            className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Simulateur IA
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
