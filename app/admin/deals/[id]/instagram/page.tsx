import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getAdminDeal } from '@/services/deals/get-admin-deal';
import {
  getInstagramSlideFilename,
  type InstagramSlide,
} from '@/services/social/instagram-visual';

type InstagramVisualsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const slides: Array<{
  label: string;
  value: InstagramSlide;
}> = [
  { label: '1. Vol aller', value: 'outbound' },
  { label: '2. Vol retour', value: 'return' },
  { label: '3. Site / CTA', value: 'cta' },
];

export default async function InstagramVisualsPage({
  params,
}: InstagramVisualsPageProps) {
  const { id } = await params;
  const deal = await getAdminDeal(id);

  if (!deal) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Instagram
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Visuels du deal
          </h1>
          <p className="mt-3 text-muted-foreground">
            {deal.fromCity} → {deal.toCity} ·{' '}
            {deal.priceMad.toLocaleString('fr-MA')} MAD
          </p>
        </div>
        <Link
          href="/admin/deals"
          className="inline-flex h-10 items-center rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
        >
          Retour aux offres
        </Link>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {slides.map((slide) => {
          const imageUrl = `/api/admin/deals/${deal.id}/instagram/${slide.value}`;
          const filename = getInstagramSlideFilename(deal, slide.value);

          return (
            <article
              key={slide.value}
              className="rounded-2xl border bg-background p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold">{slide.label}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  1080×1350
                </span>
              </div>
              <img
                alt={slide.label}
                className="mt-4 aspect-[4/5] w-full rounded-xl border bg-muted object-cover"
                src={imageUrl}
              />
              <div className="mt-4 grid gap-2">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Ouvrir l’image
                </a>
                <a
                  download={filename}
                  href={imageUrl}
                  className="inline-flex h-10 items-center justify-center rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                >
                  Télécharger PNG
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
