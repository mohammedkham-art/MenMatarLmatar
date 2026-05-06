import type { Metadata } from 'next';

import { VisaSeoPage } from '@/components/features/seo/visa-seo-page';
import { fallbackCountries } from '@/services/countries/fallback-countries';
import { getCountries } from '@/services/countries/get-countries';

export const metadata: Metadata = {
  title: 'Destinations eVisa pour les Marocains | Men Matar L Matar',
  description:
    'Explore les pays avec eVisa pour les voyageurs marocains et prépare ton voyage avec les bons plans Men Matar L Matar.',
  alternates: {
    canonical: '/destinations/evisa-marocains',
  },
};

export default async function EvisaMoroccanDestinationsPage() {
  const countries = await getCountries().catch(() => fallbackCountries);

  return (
    <VisaSeoPage
      countries={countries}
      title="Destinations eVisa pour les Marocains"
      description="Certaines destinations demandent une demande eVisa avant le départ. Cette page t’aide à repérer ces options et à préparer ton voyage plus sereinement."
      filterHref="/destinations?visa=evisa"
      visaTypes={['evisa', 'e_visa']}
      highlights={[
        'Utile pour anticiper les démarches avant réservation.',
        'À vérifier selon la durée, le motif du voyage et le passeport.',
        'Combine les infos visa avec les bons plans vols disponibles.',
      ]}
      intro="Repère les destinations eVisa, lis les conditions officielles, puis utilise les offres et le simulateur IA pour estimer si le voyage colle à ton budget et à tes dates."
    />
  );
}
