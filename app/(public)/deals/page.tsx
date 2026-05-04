export const dynamic = "force-dynamic";
import { DealsList } from '@/components/features/deals/deals-list';
import { PublicHeader } from '@/components/shared/public-header';
import { getDeals } from '@/services/deals/get-deals';

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Offres du moment
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sélection de bons plans actifs pour voyager depuis le Maroc.
          </p>
        </header>

        {deals.length > 0 ? (
          <DealsList deals={deals} />
        ) : (
          <div className="mt-10 rounded-xl border bg-background p-8 text-center text-muted-foreground">
            Aucune offre disponible pour le moment.
          </div>
        )}
      </div>
    </main>
  );
}
