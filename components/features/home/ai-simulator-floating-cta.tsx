import Link from 'next/link';

export function AiSimulatorFloatingCta() {
  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8">
      <div className="group relative">
        <div className="pointer-events-none absolute bottom-full right-0 mb-3 hidden w-72 rounded-xl border bg-background p-4 text-sm opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
          <p className="font-semibold">
            Simule ton voyage en quelques secondes
          </p>
          <p className="mt-2 leading-6 text-muted-foreground">
            Obtiens une estimation rapide de ton séjour selon ton budget.
          </p>
        </div>
        <Link
          href="/simulator"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
        >
          ✨ Simuler mon séjour
        </Link>
      </div>
    </div>
  );
}
