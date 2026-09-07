import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { getCircuitBySlug } from '@/services/circuits/get-circuit';
import type { Circuit, CircuitDestination, CircuitSegment } from '@/services/circuits/types';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const circuit = await getCircuitBySlug(slug).catch(() => null);
  if (!circuit) return {};
  return {
    title: `${circuit.title} | Men Matar L Matar`,
    description: `Circuit multi-destinations depuis le Maroc — ${circuit.destinations.map((d) => d.city).join(', ')}. À partir de ${circuit.priceMad.toLocaleString('fr-MA')} MAD.`,
  };
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatDate(date: string | null) {
  if (!date) return 'Flexible';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'Flexible' : dateFormatter.format(d);
}

// ─── Timeline segment ────────────────────────────────────────────────────────

function SegmentRow({ seg, index }: { seg: CircuitSegment; index: number }) {
  const hasStopover = !!seg.stopover || !!seg.stopoverCity;
  const city = seg.stopoverCity ?? seg.stopover ?? '';
  const hours = seg.stopoverDuration ? parseFloat(seg.stopoverDuration) : NaN;
  const isTransit = !isNaN(hours) && hours < 3;
  const stopoverLabel = hasStopover
    ? isTransit
      ? `Transit · ${city}`
      : `Escale · ${city}${seg.stopoverDuration ? ` · ${seg.stopoverDuration}` : ''}`
    : null;

  return (
    <div className="relative flex gap-4">
      {/* Ligne verticale */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
          {index + 1}
        </div>
        <div className="mt-1 w-px flex-1 bg-border" />
      </div>

      <div className="pb-8 pt-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-lg font-black">{seg.from}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-lg font-black">{seg.to}</span>
          {seg.fromCity && seg.toCity && (
            <span className="text-sm text-muted-foreground">
              {seg.fromCity} → {seg.toCity}
            </span>
          )}
        </div>

        {seg.airline && (
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {seg.airline}
          </p>
        )}

        {stopoverLabel && (
          <span className="mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {stopoverLabel}
          </span>
        )}

        {seg.stopoverTips && (
          <p className="mt-2 text-sm text-muted-foreground">{seg.stopoverTips}</p>
        )}
      </div>
    </div>
  );
}

// ─── Destination card ────────────────────────────────────────────────────────

function DestinationCard({ dest }: { dest: CircuitDestination }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-3">
        {dest.countryCode && (
          <Image
            src={`https://flagcdn.com/20x15/${dest.countryCode.toLowerCase()}.png`}
            width={20}
            height={15}
            alt=""
            className="shrink-0"
            unoptimized
          />
        )}
        <div className="flex-1">
          <p className="font-black">{dest.city}</p>
          {dest.country && (
            <p className="text-xs text-muted-foreground">{dest.country}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            dest.visaLabel === 'Sans visa'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {dest.visaLabel}
        </span>
      </div>

      {dest.tips.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t pt-3">
          {dest.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-0.5 shrink-0 text-primary">·</span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CircuitDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const circuit = await getCircuitBySlug(slug).catch(() => null);
  if (!circuit) notFound();

  const hasExtraInfo =
    circuit.extraInfo.visasRequired.length > 0 ||
    circuit.extraInfo.terrestrialLegs.length > 0 ||
    circuit.extraInfo.tips.length > 0;

  return (
    <main className="min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <div className="bg-primary">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <Link
            href="/circuits"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            ← Circuits
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {circuit.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-lg font-black text-white">
              {circuit.priceMad.toLocaleString('fr-MA')} MAD
            </span>
            <span className="rounded-full bg-accent/80 px-3 py-1.5 text-sm font-bold text-white">
              {circuit.destinations.length} destination{circuit.destinations.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-white/70">
            {formatDate(circuit.departureDate)}
            {circuit.returnDate && ` → ${formatDate(circuit.returnDate)}`}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Colonne principale */}
          <div className="space-y-10">
            {/* Timeline vols */}
            <section>
              <h2 className="mb-6 text-2xl font-black tracking-tight">
                Itinéraire vols
              </h2>
              <div>
                {circuit.segments.map((seg, i) => (
                  <SegmentRow key={i} seg={seg} index={i} />
                ))}
                {/* Dernière puce (retour) */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="pt-1.5 font-bold text-muted-foreground">Retour</p>
                </div>
              </div>
            </section>

            {/* Destinations */}
            <section>
              <h2 className="mb-4 text-2xl font-black tracking-tight">
                Destinations
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {circuit.destinations.map((dest, i) => (
                  <DestinationCard key={i} dest={dest} />
                ))}
              </div>
            </section>

            {/* Infos pratiques */}
            {hasExtraInfo && (
              <section>
                <h2 className="mb-4 text-2xl font-black tracking-tight">
                  Infos pratiques
                </h2>
                <div className="space-y-6">
                  {circuit.extraInfo.visasRequired.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-primary">
                        Visas
                      </h3>
                      <ul className="space-y-1.5">
                        {circuit.extraInfo.visasRequired.map((v, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="mt-0.5 shrink-0 text-primary">·</span>
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {circuit.extraInfo.terrestrialLegs.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-primary">
                        Étapes terrestres
                      </h3>
                      <ul className="space-y-1.5">
                        {circuit.extraInfo.terrestrialLegs.map((l, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="mt-0.5 shrink-0 text-primary">·</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {circuit.extraInfo.tips.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-primary">
                        Conseils
                      </h3>
                      <ul className="space-y-1.5">
                        {circuit.extraInfo.tips.map((t, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="mt-0.5 shrink-0 text-primary">·</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar CTA */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-background p-6 shadow-sm">
              <p className="text-3xl font-black">
                {circuit.priceMad.toLocaleString('fr-MA')}{' '}
                <span className="text-lg text-muted-foreground">MAD</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(circuit.departureDate)}
                {circuit.returnDate && ` → ${formatDate(circuit.returnDate)}`}
              </p>

              {circuit.bookingUrl ? (
                <a
                  href={circuit.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
                >
                  Réserver ce circuit
                  <span aria-hidden>→</span>
                </a>
              ) : (
                <div className="mt-6 rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                  Lien de réservation bientôt disponible
                </div>
              )}

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {circuit.destinations.length} destination{circuit.destinations.length > 1 ? 's' : ''} incluse{circuit.destinations.length > 1 ? 's' : ''}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {circuit.segments.length} vol{circuit.segments.length > 1 ? 's' : ''} dans l&apos;itinéraire
                </li>
                {circuit.extraInfo.visasRequired.length > 0 && (
                  <li className="flex gap-2">
                    <span className="text-amber-500">!</span>
                    Visas requis — voir infos pratiques
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}
