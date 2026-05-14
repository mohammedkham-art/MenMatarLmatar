import { notFound } from 'next/navigation';

import { requireAdminSession } from '@/lib/auth/require-admin-session';
import { getAdminDeal } from '@/services/deals/get-admin-deal';
import { getInstagramSlideFilename } from '@/services/social/instagram-visual';

type InstagramVisualsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const instagramVisualVersion = 'story-single-v3';

export default async function InstagramVisualsPage({
  params,
}: InstagramVisualsPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const deal = await getAdminDeal(id);

  if (!deal) {
    notFound();
  }

  const imageUrl = `/admin/deals/${deal.id}/instagram/story?v=${instagramVisualVersion}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Instagram
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Story du deal
          </h1>
          <p className="mt-3 text-muted-foreground">
            {deal.fromCity} - {deal.toCity} ·{' '}
            {deal.priceMad.toLocaleString('fr-MA')} MAD
          </p>
        </div>
        <a
          href="/admin/deals"
          className="inline-flex h-10 items-center rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
        >
          Retour aux offres
        </a>
      </header>

      <section className="mt-10 max-w-md">
        <article className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Story Instagram</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              1080x1920
            </span>
          </div>
          <img
            alt="Story Instagram du deal"
            className="mt-4 aspect-[9/16] w-full rounded-xl border bg-muted object-cover"
            src={imageUrl}
          />
          <div className="mt-4 grid gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Ouvrir la story
            </a>
            <a
              download={getInstagramSlideFilename(deal)}
              href={imageUrl}
              className="inline-flex h-10 items-center justify-center rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
            >
              Telecharger PNG
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
