export const dynamic = 'force-dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { DealCard } from '@/components/features/deals/deal-card';
import { AiSimulatorFloatingCta } from '@/components/features/home/ai-simulator-floating-cta';
import { VisaDestinationsSection } from '@/components/features/home/visa-destinations-section';
import { SimulatorSection } from '@/components/features/simulator/simulator-section';
import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';
import { fallbackCountries } from '@/services/countries/fallback-countries';
import { getCountries } from '@/services/countries/get-countries';
import { getDeals } from '@/services/deals/get-deals';

const flightBoardRows = [
  { code: 'IST', city: 'Istanbul', visa: 'Sans visa' },
  { code: 'DXB', city: 'Dubaï', visa: 'eVisa' },
  { code: 'BKK', city: 'Bangkok', visa: 'Sans visa' },
  { code: 'DPS', city: 'Bali', visa: 'Visa à l’arrivée' },
  { code: 'DOH', city: 'Doha', visa: 'eVisa' },
  { code: 'CAI', city: 'Le Caire', visa: 'Visa à l’arrivée' },
  { code: 'TUN', city: 'Tunis', visa: 'Sans visa' },
  { code: 'KUL', city: 'Kuala Lumpur', visa: 'Sans visa' },
  { code: 'BAH', city: 'Bahreïn', visa: 'eVisa' },
  { code: 'NBO', city: 'Nairobi', visa: 'eVisa' },
];

const simulatorSnapshots = [
  { days: '3 jours', budget: '2 000 MAD', city: 'Istanbul' },
  { days: '5 jours', budget: '4 500 MAD', city: 'Tunis' },
  { days: '7 jours', budget: '6 500 MAD', city: 'Bangkok' },
  { days: '4 jours', budget: '3 800 MAD', city: 'Le Caire' },
  { days: '10 jours', budget: '9 900 MAD', city: 'Bali' },
  { days: '6 jours', budget: '5 700 MAD', city: 'Doha' },
];

function getRefreshItems<T>(items: T[], count: number) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function getRefreshItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export default async function HomePage() {
  const [countriesResult, dealsResult] = await Promise.allSettled([
    getCountries(),
    getDeals(),
  ]);

  const countries =
    countriesResult.status === 'fulfilled'
      ? countriesResult.value
      : fallbackCountries;

  const deals = dealsResult.status === 'fulfilled' ? dealsResult.value : [];
  const visaStats = [
    {
      label: 'Sans visa',
      href: '/destinations?visa=visa_free',
      value: '+40',
      detail: 'départs possibles',
      tone: 'from-emerald-600/12 to-emerald-50',
    },
    {
      label: 'eVisa',
      href: '/destinations?visa=e_visa',
      value: '+40',
      detail: 'dossiers simples',
      tone: 'from-sky-600/12 to-sky-50',
    },
    {
      label: 'Visa à l’arrivée',
      href: '/destinations?visa=visa_on_arrival',
      value: '14',
      detail: 'options flexibles',
      tone: 'from-amber-500/18 to-amber-50',
    },
  ];
  const featuredDeals = deals.filter((deal) => deal.isFeatured);
  const homepageDeals = [
    ...featuredDeals,
    ...deals.filter((deal) => !deal.isFeatured),
  ].slice(0, 3);
  const currentFlightRows = getRefreshItems(flightBoardRows, 3);
  const currentSimulation = getRefreshItem(simulatorSnapshots);

  return (
    <main>
      <PublicHeader />

      <section className="relative overflow-hidden border-b bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.42)_100%)]">
        <div className="mx-auto grid min-h-[calc(100vh-5.5rem)] w-full max-w-7xl items-center gap-10 px-6 pb-14 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(22.5rem,26.5rem)] lg:pb-16 lg:pt-10 xl:grid-cols-[minmax(0,1fr)_minmax(25rem,29rem)]">
          <div className="min-w-0 max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border bg-background/80 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_hsl(var(--accent)/0.16)]" />
              Passeport marocain
            </div>

            <div className="brand-hero-mark" aria-label="Men Matar L Matar">
              <span>MEN MATAR</span>
              <span>L MATAR</span>
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-foreground md:text-6xl">
              Ton prochain départ commence par ce que ton passeport permet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Découvre où tu peux partir sans visa, compare les offres en MAD et
              lance une simulation IA avant de réserver.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/destinations"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Explorer les destinations
              </Link>
              <Link
                href="/simulator"
                className="inline-flex h-12 items-center justify-center rounded-xl border bg-background px-5 text-sm font-black text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                Simuler mon voyage
              </Link>
            </div>
          </div>

          <div className="grid w-full max-w-[26.5rem] gap-5 justify-self-center lg:justify-self-end xl:max-w-[29rem]">
            <div className="relative min-h-[27rem] overflow-hidden rounded-2xl border bg-primary p-5 text-primary-foreground shadow-2xl shadow-primary/20 sm:p-6">
              <div className="absolute right-[-4rem] top-[-5rem] h-48 w-48 rounded-full bg-accent/25 blur-3xl" />
              <div className="bg-emerald-300/12 absolute bottom-[-5rem] left-[-4rem] h-56 w-56 rounded-full blur-3xl" />

              <div className="relative flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-foreground/60">
                    Flight board
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight">
                    Departures
                  </p>
                </div>
                <span className="bg-white/92 flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/30 p-1.5 shadow-xl shadow-black/10 sm:h-24 sm:w-24">
                  <Image
                    src="/images/logo-sticker.png"
                    alt="Men Matar L Matar"
                    width={220}
                    height={260}
                    priority
                    className="h-full w-full object-contain"
                  />
                </span>
              </div>

              <div className="bg-black/22 relative mt-7 overflow-hidden rounded-xl border border-white/15 p-3 font-mono shadow-inner sm:p-4">
                <div className="grid grid-cols-[3.6rem_minmax(0,1fr)_minmax(6.5rem,0.95fr)] gap-2 border-b border-white/10 pb-2 text-[0.6rem] font-black uppercase tracking-[0.14em] text-primary-foreground/45 sm:grid-cols-[4rem_minmax(0,1fr)_minmax(7.7rem,1fr)] sm:gap-3">
                  <span>Code</span>
                  <span>Ville</span>
                  <span>Visa</span>
                </div>
                <div className="grid gap-2 pt-3">
                  {currentFlightRows.map((row, index) => (
                    <div
                      key={row.code}
                      className="flight-row grid grid-cols-[3.6rem_minmax(0,1fr)_minmax(6.5rem,0.95fr)] items-center gap-2 rounded-lg bg-white/[0.07] px-3 py-3 text-xs sm:grid-cols-[4rem_minmax(0,1fr)_minmax(7.7rem,1fr)] sm:gap-3 sm:text-sm"
                      style={{ animationDelay: `${index * 180}ms` }}
                    >
                      <span className="text-base font-black text-accent sm:text-lg">
                        {row.code}
                      </span>
                      <span className="min-w-0 truncate font-black">
                        {row.city}
                      </span>
                      <span className="text-primary-foreground/78 min-w-0 text-balance">
                        {row.visa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-5 rounded-xl border border-white/15 bg-white/[0.08] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-foreground/50">
                      IA voyage
                    </p>
                    <p className="mt-1 text-lg font-black">
                      {currentSimulation.days} · {currentSimulation.budget} ·{' '}
                      {currentSimulation.city}
                    </p>
                  </div>
                  <Link
                    href="/simulator"
                    className="rounded-full bg-accent px-3 py-1 text-xs font-black text-accent-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                  >
                    prêt
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {visaStats.map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className={`group rounded-xl border bg-gradient-to-br ${stat.tone} p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg`}
                >
                  <p className="text-3xl font-black text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-black">{stat.label}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                    <span>{stat.detail}</span>
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {homepageDeals.length > 0 && (
        <section className="border-y bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/70">
                  Bons plans
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Meilleures offres
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Les vols à surveiller avant de réserver.
                </p>
              </div>
              <Link
                href="/deals"
                className="text-sm font-black text-primary hover:underline"
              >
                Voir toutes les offres →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {homepageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        </section>
      )}

      <VisaDestinationsSection countries={countries} />

      <SimulatorSection />

      <AiSimulatorFloatingCta />
      <PublicFooter />
    </main>
  );
}
