export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

import { CircuitCard } from '@/components/features/circuits/circuit-card';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { getCircuits } from '@/services/circuits/get-circuits';

export const metadata: Metadata = {
  title: 'Circuits multi-destinations | Men Matar L Matar',
  description:
    'Circuits multi-destinations depuis le Maroc — itinéraires sur mesure avec vols, escales et conseils visa inclus.',
};

export default async function CircuitsPage() {
  const circuits = await getCircuits().catch(() => []);

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Circuits</h1>
          <p className="mt-3 text-muted-foreground">
            Itinéraires multi-destinations depuis le Maroc — vols, escales et infos visa inclus.
          </p>
        </header>

        {circuits.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {circuits.map((circuit) => (
              <CircuitCard key={circuit.id} circuit={circuit} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border bg-background p-8 text-center text-muted-foreground">
            Aucun circuit disponible pour le moment.
          </div>
        )}
      </div>
      <PublicFooter />
    </main>
  );
}
