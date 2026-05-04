export const dynamic = 'force-dynamic';
import { TripSimulator } from '@/components/features/simulator/trip-simulator';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { fallbackDestinations } from '@/services/destinations/fallback-destinations';
import { getDestinations } from '@/services/destinations/get-destinations';

export default async function SimulatorPage() {
  const destinations = await getDestinations().catch(
    () => fallbackDestinations,
  );

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
          <TripSimulator destinations={destinations} />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
