import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BaggageIcons } from '@/components/features/deals/baggage-icons';
import { CurrencyConverter } from '@/components/features/deals/currency-converter';
import { DealMiniSimulator } from '@/components/features/deals/deal-mini-simulator';
import { currencyMap } from '@/utils/currency-map';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { Button } from '@/components/ui/button';
import airports from '@/data/airports.json';
import { cn } from '@/lib/utils/cn';
import { normalizeText } from '@/lib/normalize-text';
import { getDealBySlug } from '@/services/deals/get-deal-by-slug';
import type { DealVisaType } from '@/services/deals/get-deals';
import { normalizeVisaType, visaLabels } from '@/services/visa/visa-rules';

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

function getVisibleTags(tags: string[]) {
  return tags.filter((tag) => !tag.toLowerCase().startsWith('transit:'));
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

  const transitAirport = getTransitAirport(deal.tags);
  const flightType = transitAirport ? 'avec escale' : 'direct';
  const airlineName = deal.airlineDetails?.name ?? deal.airline;
  const date = deal.departureDate ? formatDate(deal.departureDate) : null;
  const description =
    [
      `${deal.fromCity} - ${deal.toCity} à partir de ${deal.priceMad.toLocaleString('fr-MA')} MAD`,
      airlineName ? `avec ${airlineName}` : null,
      `Vol ${flightType}`,
      date ? `départ ${date}` : null,
    ]
      .filter(Boolean)
      .join('. ') + '.';

  const ogTitle = `${deal.fromCity} → ${deal.toCity} · ${deal.priceMad.toLocaleString('fr-MA')} MAD`;

  return {
    title: `${deal.fromCity} - ${deal.toCity} des ${deal.priceMad.toLocaleString('fr-MA')} MAD | Men Matar Lmatar`,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: [
        {
          url: '/images/og-men-matar-lmatar.png',
          width: 1200,
          height: 630,
          alt: 'Men Matar L Matar - bons plans voyage depuis le Maroc',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
    },
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
  const formattedPrice = deal.priceMad.toLocaleString('fr-MA');
  const visibleTags = getVisibleTags(deal.tags);
  const visaLabel = deal.visaType ? visaLabels[deal.visaType] : 'A verifier';
  const destinationCountry = airportsByCode.get(deal.toAirport) ?? '';
  const normalizedVisaType = normalizeVisaType(deal.visaType as DealVisaType);
  const currency = deal.countryCode
    ? (currencyMap[deal.countryCode.toUpperCase()] ?? null)
    : null;
  const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' });
  const destinationCountryName = deal.countryCode
    ? (regionNames.of(deal.countryCode.toUpperCase()) ?? destinationCountry)
    : destinationCountry;

  return (
    <main className="min-h-screen">
      <PublicHeader />

      <section className="relative overflow-hidden border-b bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.5)_100%)]">
        <div className="absolute right-[-10rem] top-[-12rem] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-[-12rem] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-6 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_560px] lg:items-start lg:py-6">
          {/* Colonne gauche — inchangée */}
          <div className="min-w-0">
            <a
              href="/deals"
              className="inline-flex items-center rounded-full border bg-background/85 px-4 py-2 text-sm font-black text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30"
            >
              Retour aux deals
            </a>

            <div className="mt-4">
              <span
                className={cn(
                  'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset',
                  deal.visaType
                    ? visaBadgeStyles[deal.visaType]
                    : 'bg-amber-50 text-amber-700 ring-amber-200',
                )}
              >
                {visaLabel}
              </span>
              <h1 className="mt-2 text-3xl font-black leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {deal.fromCity} - {deal.toCity}
              </h1>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border bg-primary p-4 text-primary-foreground shadow-2xl shadow-primary/20 sm:p-5">
              <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-xl border border-white/15 bg-white/[0.08] p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs text-primary-foreground/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://flagcdn.com/20x15/ma.png"
                      width={20}
                      height={15}
                      alt=""
                    />
                    Maroc
                  </p>
                  <p className="text-2xl font-black">{deal.fromAirport}</p>
                  <p className="mt-1 text-sm font-semibold text-primary-foreground/75">
                    {deal.fromCity}
                  </p>
                </div>

                <div
                  aria-hidden="true"
                  className="flex flex-col items-center justify-center gap-4"
                >
                  <span className="text-5xl font-black leading-none text-white">→</span>
                  <span className="text-5xl font-black leading-none text-white/50">←</span>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/[0.08] p-3">
                  {deal.countryCode && (
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs text-primary-foreground/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://flagcdn.com/20x15/${deal.countryCode.toLowerCase()}.png`}
                        width={20}
                        height={15}
                        alt=""
                      />
                      {destinationCountryName}
                    </p>
                  )}
                  <p className="text-2xl font-black">{deal.toAirport}</p>
                  <p className="mt-1 text-sm font-semibold text-primary-foreground/75">
                    {deal.toCity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite — convertisseur + simulateur */}
          <div className="grid grid-cols-[40fr_60fr] gap-4">
            {currency && (
              <CurrencyConverter
                currencyCode={currency.code}
                currencyName={currency.name}
              />
            )}
            <DealMiniSimulator
              toCity={deal.toCity}
              fromCity={deal.fromCity}
              country={destinationCountryName}
              countryCode={deal.countryCode}
              visaType={normalizedVisaType}
              dealId={deal.id}
              departureDate={deal.departureDate}
            />
          </div>
        </div>
      </section>

      {/* Ligne 2 : Prix + dates + bouton */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:py-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              À partir de
            </p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-4xl font-black tracking-tight text-primary sm:text-5xl">
                {formattedPrice} MAD
              </p>
              {!transitAirport && !deal.tags.includes('Escale') && (
                <span className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  ✈️ Vol direct
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[240px]">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                Départ
              </p>
              <p className="mt-2 font-black">{formatDate(deal.departureDate)}</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                Retour
              </p>
              <p className="mt-2 font-black">{formatDate(deal.returnDate)}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              asChild
              className="h-12 w-full rounded-xl text-base font-black sm:w-auto sm:min-w-[180px]"
            >
              <a
                href={deal.bookingUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Voir l&apos;offre 🔥
              </a>
            </Button>
            <p className="text-xs font-medium text-muted-foreground">
              Les prix peuvent fluctuer.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.72fr)] lg:py-12">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/70">
                  Itineraire
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Details du vol
                </h2>
              </div>
              <span className="rounded-full bg-muted px-4 py-2 text-sm font-black text-primary">
                {deal.fromAirport} - {deal.toAirport}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted p-4">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Compagnie
                </dt>
                <dd className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-lg font-black leading-tight">{airlineName}</span>
                  {deal.airlineDetails?.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={deal.airlineDetails.logoUrl}
                      alt={airlineName}
                      width={100}
                      height={100}
                      className="-mt-2 rounded-xl object-contain"
                    />
                  )}
                </dd>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Dernier prix repere
                </dt>
                <dd className="mt-2 text-base font-black">
                  {formattedPrice} MAD
                </dd>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Départ
                </dt>
                <dd className="mt-2 text-base font-black">
                  {formatDate(deal.departureDate)}
                </dd>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Retour
                </dt>
                <dd className="mt-2 text-base font-black">
                  {formatDate(deal.returnDate)}
                </dd>
              </div>
              {formattedTransitAirport && (
                <div className="rounded-xl bg-accent/15 p-4 ring-1 ring-inset ring-accent/25 sm:col-span-2">
                  <dt className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
                    Escale
                  </dt>
                  <dd className="mt-2 text-base font-black">
                    {formattedTransitAirport}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/70">
                  Inclus avec ce tarif
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Bagages
                </h2>
              </div>
              {deal.fare && (
                <span className="rounded-full bg-muted px-4 py-2 text-sm font-black text-primary">
                  {deal.fare.fareName}
                </span>
              )}
            </div>
            <div className="mt-6 rounded-xl bg-muted/70 p-4">
              <BaggageIcons fare={deal.fare} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/70">
              Passeport marocain
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Visa destination
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Cette destination est classee selon les conditions connues pour
              les voyageurs marocains.
            </p>
            <p
              className={cn(
                'mt-5 inline-flex rounded-full px-4 py-2 text-sm font-black ring-1 ring-inset',
                deal.visaType
                  ? visaBadgeStyles[deal.visaType]
                  : 'bg-amber-50 text-amber-700 ring-amber-200',
              )}
            >
              {visaLabel}
            </p>
          </section>

          {visibleTags.length > 0 && (
            <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black tracking-tight">A noter</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent-foreground ring-1 ring-inset ring-accent/25"
                  >
                    {normalizeText(tag)}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border bg-muted p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black tracking-tight">
              Avant de réserver
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Verifie toujours les horaires, les bagages, les conditions visa et
              le prix final sur le site partenaire avant paiement.
            </p>
          </section>
        </aside>
      </section>

      <PublicFooter />
    </main>
  );
}
