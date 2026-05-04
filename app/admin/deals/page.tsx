import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { DeleteDealButton } from '@/app/admin/deals/delete-deal-button';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createDealSchema } from '@/lib/validators/deal';
import type { Country } from '@/services/countries/get-countries';
import { getCountries } from '@/services/countries/get-countries';
import { getAdminDeals } from '@/services/deals/get-admin-deals';
import type { Deal } from '@/services/deals/get-deals';

type DealMutationPayload = {
  title: string;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  country_code: string;
  price_mad: number;
  airline: string | null;
  departure_date: string | null;
  return_date: string | null;
  booking_url: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  score: number;
};

type AdminFlash =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'activated'
  | 'deactivated'
  | 'featured'
  | 'unfeatured';

const adminFlashMessages: Record<AdminFlash, string> = {
  created: 'Offre ajoutée avec succès.',
  updated: 'Offre modifiée avec succès.',
  deleted: 'Offre supprimée avec succès.',
  activated: 'Offre activée avec succès.',
  deactivated: 'Offre désactivée avec succès.',
  featured: 'Offre mise en avant avec succès.',
  unfeatured: 'Offre retirée des mises en avant avec succès.',
};

function getAdminDealsUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/deals?${searchParams.toString()}`;
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Action impossible pour le moment.';
}

function redirectWithSuccess(status: AdminFlash) {
  redirect(getAdminDealsUrl({ status }));
}

function redirectWithError(error: unknown) {
  redirect(
    getAdminDealsUrl({
      error: getActionErrorMessage(error),
    }),
  );
}

function getDealInput(formData: FormData) {
  const rawInput = {
    title: formData.get('title'),
    fromAirport: formData.get('fromAirport'),
    toAirport: formData.get('toAirport'),
    fromCity: formData.get('fromCity'),
    toCity: formData.get('toCity'),
    countryCode: formData.get('countryCode'),
    priceMad: formData.get('priceMad'),
    airline: formData.get('airline') || undefined,
    departureDate: formData.get('departureDate') || undefined,
    returnDate: formData.get('returnDate') || undefined,
    bookingUrl: formData.get('bookingUrl'),
    tags: formData.get('tags') || undefined,
    isActive: formData.get('isActive') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
    score: formData.get('score'),
  };

  return createDealSchema.parse(rawInput);
}

function getDealPayload(formData: FormData): DealMutationPayload {
  const input = getDealInput(formData);
  const tags =
    input.tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];

  return {
    title: input.title,
    from_airport: input.fromAirport,
    to_airport: input.toAirport,
    from_city: input.fromCity,
    to_city: input.toCity,
    country_code: input.countryCode,
    price_mad: input.priceMad,
    airline: input.airline || null,
    departure_date: input.departureDate || null,
    return_date: input.returnDate || null,
    booking_url: input.bookingUrl,
    tags,
    is_active: input.isActive,
    is_featured: input.isFeatured,
    score: input.score,
  };
}

function getDealId(formData: FormData) {
  const id = formData.get('id');

  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Deal id is required.');
  }

  return id;
}

function revalidateDealPaths() {
  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/admin/deals');
}

async function createDeal(formData: FormData) {
  'use server';

  try {
    const payload = getDealPayload(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('deals').insert(payload);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDealPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess('created');
}

async function updateDeal(formData: FormData) {
  'use server';

  try {
    const id = getDealId(formData);
    const payload = getDealPayload(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('deals').update(payload).eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDealPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess('updated');
}

async function deleteDeal(formData: FormData) {
  'use server';

  try {
    const id = getDealId(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('deals').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDealPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess('deleted');
}

async function toggleDealActive(formData: FormData) {
  'use server';

  let nextStatus: AdminFlash = 'activated';

  try {
    const id = getDealId(formData);
    const isActive = formData.get('isActive') === 'true';
    nextStatus = isActive ? 'deactivated' : 'activated';
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('deals')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDealPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess(nextStatus);
}

async function toggleDealFeatured(formData: FormData) {
  'use server';

  let nextStatus: AdminFlash = 'featured';

  try {
    const id = getDealId(formData);
    const isFeatured = formData.get('isFeatured') === 'true';
    nextStatus = isFeatured ? 'unfeatured' : 'featured';
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('deals')
      .update({ is_featured: !isFeatured })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDealPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess(nextStatus);
}

type AdminDealsPageProps = {
  searchParams?: Promise<{
    error?: string;
    status?: AdminFlash;
  }>;
};

export default async function AdminDealsPage({
  searchParams,
}: AdminDealsPageProps) {
  const params = await searchParams;
  const successMessage = params?.status
    ? adminFlashMessages[params.status]
    : null;
  const errorMessage = params?.error;
  let countries: Country[] = [];
  let deals: Deal[] = [];
  let loadErrorMessage: string | null = null;

  try {
    [countries, deals] = await Promise.all([getCountries(), getAdminDeals()]);
  } catch (error) {
    loadErrorMessage = getActionErrorMessage(error);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Gérer les offres
          </h1>
          <p className="mt-3 text-muted-foreground">
            Ajoute, modifie et pilote les offres visibles sur le SaaS.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-primary">
          Retour au site
        </Link>
      </header>

      {successMessage && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      {(errorMessage || loadErrorMessage) && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage ?? loadErrorMessage}
        </div>
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <DealForm
          action={createDeal}
          countries={countries}
          submitLabel="Ajouter l’offre"
          title="Nouvelle offre"
        />

        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Offres existantes
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {deals.length} offre{deals.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {deals.map((deal) => (
              <AdminDealItem key={deal.id} countries={countries} deal={deal} />
            ))}

            {deals.length === 0 && (
              <div className="rounded-xl border bg-muted p-8 text-center text-muted-foreground">
                Aucune offre pour le moment.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

type AdminDealItemProps = {
  countries: Country[];
  deal: Deal;
};

function AdminDealItem({ countries, deal }: AdminDealItemProps) {
  return (
    <article className="rounded-xl border bg-muted/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-bold">{deal.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {deal.fromAirport} → {deal.toAirport} · À partir de{' '}
            {deal.priceMad.toLocaleString('fr-MA')} MAD
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {deal.fromCity} → {deal.toCity} · {deal.countryCode}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-background px-3 py-1">
            Score {deal.score}
          </span>
          <span className="rounded-full bg-background px-3 py-1">
            {deal.isActive ? 'Active' : 'Inactive'}
          </span>
          {deal.isFeatured && (
            <span className="rounded-full bg-accent/20 px-3 py-1 text-accent-foreground">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={toggleDealActive}>
          <input name="id" type="hidden" value={deal.id} />
          <input name="isActive" type="hidden" value={String(deal.isActive)} />
          <AdminActionButton variant="secondary">
            {deal.isActive ? 'Deactivate' : 'Activate'}
          </AdminActionButton>
        </form>
        <form action={toggleDealFeatured}>
          <input name="id" type="hidden" value={deal.id} />
          <input
            name="isFeatured"
            type="hidden"
            value={String(deal.isFeatured)}
          />
          <AdminActionButton variant="secondary">
            {deal.isFeatured ? 'Unfeatured' : 'Featured'}
          </AdminActionButton>
        </form>
        <DeleteDealButton action={deleteDeal} dealId={deal.id} />
      </div>

      <details className="mt-4 rounded-xl border bg-background p-4">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          Edit
        </summary>
        <div className="mt-4">
          <DealForm
            action={updateDeal}
            countries={countries}
            deal={deal}
            submitLabel="Enregistrer"
            title="Modifier l’offre"
          />
        </div>
      </details>
    </article>
  );
}

type DealFormProps = {
  action: (formData: FormData) => Promise<void>;
  countries: Country[];
  deal?: Deal;
  submitLabel: string;
  title: string;
};

function DealForm({
  action,
  countries,
  deal,
  submitLabel,
  title,
}: DealFormProps) {
  return (
    <form
      action={action}
      className="rounded-2xl border bg-background p-6 shadow-sm"
    >
      {deal && <input name="id" type="hidden" value={deal.id} />}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      <div className="mt-6 grid gap-4">
        <AdminInput
          name="title"
          label="Titre"
          placeholder="Marrakech → Istanbul"
          defaultValue={deal?.title}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            name="fromAirport"
            label="Aéroport départ"
            placeholder="RAK"
            defaultValue={deal?.fromAirport}
          />
          <AdminInput
            name="toAirport"
            label="Aéroport arrivée"
            placeholder="IST"
            defaultValue={deal?.toAirport}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            name="fromCity"
            label="Ville départ"
            placeholder="Marrakech"
            defaultValue={deal?.fromCity}
          />
          <AdminInput
            name="toCity"
            label="Ville arrivée"
            placeholder="Istanbul"
            defaultValue={deal?.toCity}
          />
        </div>

        <CountrySelect countries={countries} defaultValue={deal?.countryCode} />

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            name="priceMad"
            label="Prix MAD"
            placeholder="1790"
            type="number"
            defaultValue={deal?.priceMad}
          />
          <AdminInput
            name="airline"
            label="Compagnie"
            placeholder="Turkish Airlines"
            defaultValue={deal?.airline ?? ''}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            name="departureDate"
            label="Date départ"
            type="date"
            defaultValue={deal?.departureDate ?? ''}
          />
          <AdminInput
            name="returnDate"
            label="Date retour"
            type="date"
            defaultValue={deal?.returnDate ?? ''}
          />
        </div>

        <AdminInput
          name="bookingUrl"
          label="Lien de réservation"
          placeholder="https://www.trip.com/flights/..."
          type="url"
          defaultValue={deal?.bookingUrl}
        />

        <AdminInput
          name="tags"
          label="Tags"
          placeholder="sans visa, bon prix, été"
          defaultValue={deal?.tags.join(', ')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            name="score"
            label="Score"
            placeholder="80"
            type="number"
            defaultValue={deal?.score ?? 80}
          />
          <div className="grid content-end gap-3 rounded-xl border bg-muted p-4">
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={deal?.isActive ?? true}
              />
              Offre active
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={deal?.isFeatured ?? false}
              />
              Meilleure offre
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 h-12 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

type CountrySelectProps = {
  countries: Country[];
  defaultValue?: string;
};

function CountrySelect({ countries, defaultValue }: CountrySelectProps) {
  return (
    <div>
      <label
        htmlFor={defaultValue ? `countryCode-${defaultValue}` : 'countryCode'}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Pays
      </label>
      <select
        id={defaultValue ? `countryCode-${defaultValue}` : 'countryCode'}
        name="countryCode"
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        defaultValue={defaultValue ?? ''}
        required
      >
        <option value="">Choisir un pays</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name} ({country.code})
          </option>
        ))}
      </select>
    </div>
  );
}

type AdminInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: number | string;
};

function AdminInput({
  name,
  label,
  placeholder,
  type = 'text',
  defaultValue,
}: AdminInputProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
        required={
          name !== 'airline' && name !== 'returnDate' && name !== 'tags'
        }
      />
    </div>
  );
}

type AdminActionButtonProps = {
  children: string;
  variant?: 'danger' | 'secondary';
};

function AdminActionButton({
  children,
  variant = 'secondary',
}: AdminActionButtonProps) {
  return (
    <button
      type="submit"
      className={
        variant === 'danger'
          ? 'inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100'
          : 'inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-xs font-semibold transition hover:bg-muted'
      }
    >
      {children}
    </button>
  );
}
