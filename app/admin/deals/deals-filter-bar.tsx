'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

const statusOptions = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'Actives' },
  { value: 'inactive', label: 'Inactives' },
] as const;

const visaOptions = [
  { value: 'all', label: 'Tous visas' },
  { value: 'visa_free', label: 'Sans visa' },
  { value: 'evisa', label: 'eVisa' },
  { value: 'on_arrival', label: 'À l\'arrivée' },
  { value: 'visa_required', label: 'Requis' },
] as const;

type DealsFilterBarProps = {
  totalCount: number;
  filteredCount: number;
};

export function DealsFilterBar({ totalCount, filteredCount }: DealsFilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = params.get('q') ?? '';
  const statut = params.get('statut') ?? 'all';
  const visa = params.get('visa') ?? 'all';
  const tri = params.get('tri') ?? '';

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      next.delete('status');
      next.delete('error');
      if (value === 'all' || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      startTransition(() => {
        router.push(`/admin/deals?${next.toString()}`);
      });
    },
    [params, router],
  );

  return (
    <div className={`mt-4 space-y-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="search"
        placeholder="Rechercher titre, ville, pays..."
        defaultValue={q}
        key={q}
        onKeyDown={(e) => {
          if (e.key === 'Enter') update('q', e.currentTarget.value);
        }}
        onBlur={(e) => {
          if (e.currentTarget.value !== q) update('q', e.currentTarget.value);
        }}
        className="h-10 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-xl border text-xs font-semibold">
          {statusOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update('statut', value)}
              className={`px-3 py-2 transition ${
                statut === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex overflow-hidden rounded-xl border text-xs font-semibold">
          {visaOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update('visa', value)}
              className={`px-3 py-2 transition ${
                visa === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={tri}
          onChange={(e) => update('tri', e.currentTarget.value)}
          className="h-9 rounded-xl border bg-background px-3 text-xs font-semibold outline-none transition focus:border-primary"
        >
          <option value="">Tri par défaut</option>
          <option value="departure">Date départ ↑</option>
          <option value="price">Prix croissant ↑</option>
          <option value="score">Score ↓</option>
        </select>

        {filteredCount < totalCount && (
          <p className="ml-auto text-xs text-muted-foreground">
            {filteredCount} / {totalCount} offre{totalCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
