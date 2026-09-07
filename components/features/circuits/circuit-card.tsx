import Image from 'next/image';
import Link from 'next/link';

import type { Circuit, CircuitSegment } from '@/services/circuits/types';

function iataChain(segments: CircuitSegment[]): string {
  if (!segments.length) return '';
  const codes = [segments[0].from, ...segments.map((s) => s.to)].filter(Boolean);
  return [...new Set(codes)].join(' → ');
}

function stopoverLabel(seg: CircuitSegment): string | null {
  if (!seg.stopover && !seg.stopoverCity) return null;
  const city = seg.stopoverCity ?? seg.stopover ?? '';
  if (!seg.stopoverDuration) return `Transit · ${city}`;
  const hours = parseFloat(seg.stopoverDuration);
  if (!isNaN(hours) && hours < 3) return `Transit · ${city}`;
  return `Escale · ${city} · ${seg.stopoverDuration}`;
}

export function CircuitCard({ circuit }: { circuit: Circuit }) {
  const chain = iataChain(circuit.segments);

  const dateStr = circuit.departureDate
    ? new Date(circuit.departureDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Date flexible';

  const stopoverBadges = circuit.segments
    .map(stopoverLabel)
    .filter((l): l is string => l !== null);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Header coloré */}
      <div className="bg-primary px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {chain}
        </p>
        <h2 className="mt-1 text-xl font-black leading-tight text-white">
          {circuit.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
            {circuit.priceMad.toLocaleString('fr-MA')} MAD
          </span>
          <span className="rounded-full bg-accent/80 px-3 py-1 text-xs font-bold text-white">
            {circuit.destinations.length} destination{circuit.destinations.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Date */}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{dateStr}</span>
          {circuit.returnDate && (
            <>
              {' '}→{' '}
              {new Date(circuit.returnDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </>
          )}
        </p>

        {/* Destinations avec drapeaux + badges visa */}
        <div className="space-y-2">
          {circuit.destinations.map((dest, i) => (
            <div key={i} className="flex items-center gap-3">
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
              <span className="text-sm font-semibold">
                {dest.city}
                {dest.country && dest.country !== dest.city && (
                  <span className="font-normal text-muted-foreground"> · {dest.country}</span>
                )}
              </span>
              <span
                className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  dest.visaRequired
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {dest.visaRequired ? 'Visa requis' : 'Sans visa'}
              </span>
            </div>
          ))}
        </div>

        {/* Badges escale */}
        {stopoverBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stopoverBadges.map((label, i) => (
              <span
                key={i}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link
            href={`/circuits/${circuit.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Voir le circuit
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
