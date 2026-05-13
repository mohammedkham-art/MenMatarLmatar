import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BaggageIcons } from '@/components/features/deals/baggage-icons';
import { PriceFreshnessBadge } from '@/components/features/deals/price-freshness-badge';
import { Button } from '@/components/ui/button';
import airports from '@/data/airports.json';
import { cn } from '@/lib/utils/cn';
import { getDealBySlug } from '@/services/deals/get-deal-by-slug';
import type { DealVisaType } from '@/services/deals/get-deals';
import { visaLabels } from '@/services/visa/visa-rules';

type DealPageProps = {
  params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const visaBadgeStyles: Record<DealVisaType, string> = {
  visa_free: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  evisa: 'bg-blue-50 text-blue-700 ring-blue-200',
  e_visa: 'bg-blue-50 text-blue-700 ring-blue-200',
  on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_required: 'bg-red-50 text-red-700 ring-red-200',
};

const airportsByCode = new Map(
  airports.map((airport) => [airport.code, airport.country]),
);

function formatDate(date: string | null) {
  if (!date) return 'Flexible';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Flexible';
  return dateFormatter.format(parsedDate);
}

function getTransitAirport(tags: string[]) {
  const transitTag = tags.find((tag) =>
    tag.toLowerCase().startsWith('transit:'),
  );

  return transitTag?.split(':')[1]?.trim().toUpperCase() ?? null;
}

function formatTransitAirport(airportCode: string | null) {
  if (!airportCode) return null;

  const country = airportsByCode.get(airportCode);

  return country ? `${airportCode} (${country})` : airportCode;
}

export async function generateMetadata({
  params,
}: DealPageProps): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDealBySlug(slug).catch(() => null);

  if (!deal) {
    return {
      title: 'Deal introuvable | Men Matar Lmatar',
    };
  }

  return {
    title: `${deal.fromCity} - ${deal.toCity} des ${deal.priceMad.toLocaleString('fr-MA')} MAD | Men Matar Lmatar`,
    description: `${deal.title} avec prix, bagages inclus et conditions visa pour les voyageurs marocains.`,
  };
}

export default async function DealDetailPage({ params }: DealPageProps) {
  const { slug } = await params;
  const deal = await getDealBySlug(slug).catch(() => null);

  if (!deal || !deal.isActive) {
    notFound();
  }

  const transitAirport = getTransitAirport(deal.tags);
  const formattedTransitAirport = formatTransitAirport(transitAirport);
  const airlineName =
    deal.airlineDetails?.name ?? deal.airline ?? 'Non renseignee';

  return (
    <main className="min-h-screen">
      <section className="border-b bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <a
              href="/deals"
              className="text-sm font-semibold text-primary transition hover:opacity-75"
            >
              Retour aux deals
            </a>
            <div className="mt-6">
              <PriceFreshnessBadge
                checkedAt={deal.lastCheckedAt}
                createdAt={deal.createdAt}
              />
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              {deal.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {deal.fromCity} - {deal.toCity} avec {airlineName}
            </p>
          </div>

          <div className="rounded-xl border bg-muted p-6">
            <p className="text-sm font-semibold text-muted-foreground">
              A partir de
            </p>
            <p className="mt-2 text-4xl font-black text-primary">
              {deal.priceMad.toLocaleString('fr-MA')} MAD
            </p>
            <Button asChild className="mt-6 w-full">
              <a
                href={deal.bookingUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Voir l&apos;offre
              </a>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Les prix peuvent fluctuer.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-background p-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Details du vol
            </h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Route
                </dt>
                <dd className="mt-1 font-semibold">
                  {deal.fromAirport} - {deal.toAirport}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Compagnie
                </dt>
                <dd className="mt-1 font-semibold">{airlineName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Depart
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatDate(deal.departureDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Retour
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatDate(deal.returnDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Dernier prix repere
                </dt>
                <dd className="mt-1 font-semibold">
                  {deal.priceMad.toLocaleString('fr-MA')} MAD
                </dd>
              </div>
              {formattedTransitAirport && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Escale
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {formattedTransitAirport}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border bg-background p-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Bagages inclus
            </h2>
            <div className="mt-6">
              <BaggageIcons fare={deal.fare} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border bg-background p-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Visa destination
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Pour les passeports marocains, cette destination est indiquee
              comme :
            </p>
            <p
              className={cn(
                'mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold ring-1 ring-inset',
                deal.visaType
                  ? visaBadgeStyles[deal.visaType]
                  : 'bg-amber-50 text-amber-700 ring-amber-200',
              )}
            >
              {deal.visaType ? visaLabels[deal.visaType] : 'A verifier'}
            </p>
          </section>

          <section className="rounded-xl border bg-muted p-6">
            <h2 className="text-xl font-bold tracking-tight">
              Avant de reserver
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Verifie toujours les horaires, les bagages, les conditions visa et
              le prix final sur le site partenaire avant paiement.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
