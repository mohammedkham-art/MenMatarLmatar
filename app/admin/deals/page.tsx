import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { DealsFilterBar } from '@/app/admin/deals/deals-filter-bar';
import { DeleteDealButton } from '@/app/admin/deals/delete-deal-button';
import { FlashMessage } from '@/app/admin/destinations/flash-message';
import { AdminHeaderActions } from '@/components/shared/admin-header-actions';
import { requireAdminSession } from '@/lib/auth/require-admin-session';
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
  last_checked_at?: string;
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

const marketingTagOptions = [
  'offre spéciale !',
  'bon prix',
  "le deal de l'année !",
  'le meilleur prix',
  'bon deal',
  'offre éclair !',
];

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
  const selectedTags = formData
    .getAll('tags')
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
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
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
    isActive: formData.get('isActive') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
    score: formData.get('score'),
  };

  return createDealSchema.parse(rawInput);
}

function getTransitTag(formData: FormData) {
  if (formData.get('hasTransit') !== 'on') {
    return null;
  }

  const transitAirport = formData.get('transitAirport');

  if (typeof transitAirport !== 'string') {
    return null;
  }

  const normalizedAirport = transitAirport
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  return normalizedAirport ? `transit:${normalizedAirport}` : null;
}

function getVisibleTags(tags: string[]) {
  return tags.filter((tag) => !tag.toLowerCase().startsWith('transit:'));
}

function getTransitAirport(tags: string[]) {
  const transitTag = tags.find((tag) =>
    tag.toLowerCase().startsWith('transit:'),
  );

  return transitTag?.split(':')[1]?.trim().toUpperCase() ?? '';
}

function getDealPayload(formData: FormData): DealMutationPayload {
  const input = getDealInput(formData);
  const tags =
    input.tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];
  const transitTag = getTransitTag(formData);
  const payloadTags = transitTag ? [...tags, transitTag] : tags;

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
    tags: payloadTags,
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

  await requireAdminSession();

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

  await requireAdminSession();

  try {
    const id = getDealId(formData);
    const payload = {
      ...getDealPayload(formData),
      last_checked_at: new Date().toISOString(),
    };
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

  await requireAdminSession();

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

  await requireAdminSession();

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

  await requireAdminSession();

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
    q?: string;
    statut?: string;
    visa?: string;
    tri?: string;
  }>;
};

export default async function AdminDealsPage({
  searchParams,
}: AdminDealsPageProps) {
  await requireAdminSession();

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

  const search = (params?.q ?? '').toLowerCase();
  const statut = params?.statut ?? 'all';
  const visa = params?.visa ?? 'all';
  const tri = params?.tri ?? '';

  let filteredDeals = deals;

  if (search) {
    filteredDeals = filteredDeals.filter(
      (deal) =>
        deal.title.toLowerCase().includes(search) ||
        deal.fromCity.toLowerCase().includes(search) ||
        deal.toCity.toLowerCase().includes(search) ||
        deal.countryCode.toLowerCase().includes(search),
    );
  }

  if (statut === 'active') {
    filteredDeals = filteredDeals.filter((deal) => deal.isActive);
  } else if (statut === 'inactive') {
    filteredDeals = filteredDeals.filter((deal) => !deal.isActive);
  }

  if (visa !== 'all') {
    filteredDeals = filteredDeals.filter((deal) => {
      const v = deal.visaType;
      if (visa === 'evisa') return v === 'evisa' || v === 'e_visa';
      if (visa === 'on_arrival')
        return v === 'on_arrival' || v === 'visa_on_arrival';
      return v === visa;
    });
  }

  if (tri === 'departure') {
    filteredDeals = [...filteredDeals].sort((a, b) => {
      if (!a.departureDate) return 1;
      if (!b.departureDate) return -1;
      return (
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime()
      );
    });
  } else if (tri === 'price') {
    filteredDeals = [...filteredDeals].sort((a, b) => a.priceMad - b.priceMad);
  } else if (tri === 'score') {
    filteredDeals = [...filteredDeals].sort((a, b) => b.score - a.score);
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
        <AdminHeaderActions
          links={[
            { href: '/admin', label: 'Admin' },
            { href: '/admin/destinations', label: 'Destinations' },
          ]}
        />
      </header>

      {successMessage && (
        <FlashMessage
          message={successMessage}
          type="success"
          redirectTo="/admin/deals"
        />
      )}

      {(errorMessage || loadErrorMessage) && (
        <FlashMessage
          message={errorMessage ?? loadErrorMessage!}
          type="error"
          redirectTo="/admin/deals"
        />
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

          <DealsFilterBar
            totalCount={deals.length}
            filteredCount={filteredDeals.length}
          />

          <div className="mt-6 space-y-4">
            {filteredDeals.map((deal) => (
              <AdminDealItem key={deal.id} countries={countries} deal={deal} />
            ))}

            {filteredDeals.length === 0 && (
              <div className="rounded-xl border bg-muted p-8 text-center text-muted-foreground">
                {deals.length === 0
                  ? 'Aucune offre pour le moment.'
                  : 'Aucune offre ne correspond aux filtres.'}
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
        <a
          href={`/admin/deals/${deal.id}/instagram`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-semibold text-primary transition hover:bg-primary/15"
        >
          Générer visuels Instagram
        </a>
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
        <TagsCheckboxes deal={deal} />

        <TransitFields deal={deal} />

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

function TagsCheckboxes({ deal }: { deal?: Deal }) {
  const selectedTags = deal ? getVisibleTags(deal.tags) : [];
  const extraTags = selectedTags.filter(
    (tag) => !marketingTagOptions.includes(tag),
  );

  return (
    <div className="rounded-xl border bg-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Tags
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {marketingTagOptions.map((tag) => (
          <label
            key={tag}
            className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm font-semibold"
          >
            <input
              name="tags"
              type="checkbox"
              value={tag}
              defaultChecked={selectedTags.includes(tag)}
            />
            {tag}
          </label>
        ))}
      </div>
      {extraTags.map((tag) => (
        <input key={tag} name="tags" type="hidden" value={tag} />
      ))}
      {extraTags.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Les anciens tags hors liste sont conserves si tu modifies cette
          offre.
        </p>
      )}
    </div>
  );
}

function TransitFields({ deal }: { deal?: Deal }) {
  const transitAirport = deal ? getTransitAirport(deal.tags) : '';

  return (
    <div className="grid gap-3 rounded-xl border bg-muted p-4">
      <label className="flex items-start gap-3 text-sm font-semibold">
        <input
          name="hasTransit"
          type="checkbox"
          defaultChecked={Boolean(transitAirport)}
          className="mt-1"
        />
        <span>
          Afficher un badge transit
          <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
            Pour les vols avec bagages transferes automatiquement pendant
            l&apos;escale.
          </span>
        </span>
      </label>
      <AdminInput
        name="transitAirport"
        label="Code aeroport transit"
        placeholder="MAD"
        defaultValue={transitAirport}
      />
    </div>
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
          name !== 'airline' &&
          name !== 'returnDate' &&
          name !== 'tags' &&
          name !== 'transitAirport'
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
