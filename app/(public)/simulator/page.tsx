export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { TripSimulator } from '@/components/features/simulator/trip-simulator';

export const metadata: Metadata = {
  description:
    'Simule ton voyage en quelques secondes : budget en MAD, programme jour par jour, conseils pratiques. Passeport marocain.',
};
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { fallbackDestinations } from '@/services/destinations/fallback-destinations';
import { getDestinations } from '@/services/destinations/get-destinations';
import { getSimulatorDestinations } from '@/services/destinations/simulator-extra-destinations';

type SimulatorPageProps = {
  searchParams: Promise<{ destination?: string }>;
};

export default async function SimulatorPage({ searchParams }: SimulatorPageProps) {
  const destinations = getSimulatorDestinations(
    await getDestinations().catch(() => fallbackDestinations),
  );

  const { destination } = await searchParams;
  const normalizedQuery = destination?.trim().toLowerCase() ?? '';
  const initialDestination =
    normalizedQuery.length > 0
      ? (destinations.find(
          (d) => d.city.toLowerCase() === normalizedQuery,
        ) ?? null)
      : null;

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            Simulateur de séjour
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Simule ton voyage en quelques secondes
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Indique ta destination, ton budget et ton style de voyage pour
            obtenir une première idée de séjour générée par IA.
          </p>
        </header>

        <div className="mt-10">
          <TripSimulator destinations={destinations} initialDestination={initialDestination} />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
