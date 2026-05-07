import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { CountryCodeInput } from '@/app/admin/destinations/country-code-input';
import { DeleteCountryButton } from '@/app/admin/destinations/delete-country-button';
import { AdminHeaderActions } from '@/components/shared/admin-header-actions';
import { requireAdminSession } from '@/lib/auth/require-admin-session';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { countryAdminSchema } from '@/lib/validators/country';
import type { Country, VisaType } from '@/services/countries/get-countries';
import { getCountries } from '@/services/countries/get-countries';
import {
  normalizeVisaType,
  type StoredVisaType,
  visaLabels,
} from '@/services/visa/visa-rules';

type CountryMutationPayload = {
  name: string;
  code: string;
  region: string;
  visa_type: 'visa_free' | 'evisa' | 'on_arrival' | 'visa_required';
  max_stay_days: number | null;
  notes: string | null;
  official_source_url: string | null;
  is_featured: boolean;
};

type AdminFlash = 'created' | 'updated' | 'deleted' | 'featured' | 'unfeatured';

const adminFlashMessages: Record<AdminFlash, string> = {
  created: 'Destination ajoutée avec succès.',
  updated: 'Destination modifiée avec succès.',
  deleted: 'Destination supprimée avec succès.',
  featured: 'Destination mise en avant avec succès.',
  unfeatured: 'Destination retirée des mises en avant avec succès.',
};

function getAdminDestinationsUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `/admin/destinations?${searchParams.toString()}`;
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Action impossible pour le moment.';
}

function redirectWithSuccess(status: AdminFlash) {
  redirect(getAdminDestinationsUrl({ status }));
}

function redirectWithError(error: unknown) {
  redirect(
    getAdminDestinationsUrl({
      error: getActionErrorMessage(error),
    }),
  );
}

function getCountryInput(formData: FormData) {
  const rawInput = {
    name: formData.get('name'),
    code: formData.get('code'),
    region: formData.get('region'),
    visaType: formData.get('visaType'),
    maxStayDays: formData.get('maxStayDays') ?? '',
    notes: formData.get('notes') || undefined,
    officialSourceUrl: formData.get('officialSourceUrl') || undefined,
    isFeatured: formData.get('isFeatured') === 'on',
  };

  return countryAdminSchema.parse(rawInput);
}

function getCountryPayload(formData: FormData): CountryMutationPayload {
  const input = getCountryInput(formData);

  return {
    name: input.name,
    code: input.code,
    region: input.region,
    visa_type: input.visaType,
    max_stay_days:
      typeof input.maxStayDays === 'number' ? input.maxStayDays : null,
    notes: input.notes ?? null,
    official_source_url: input.officialSourceUrl || null,
    is_featured: input.isFeatured,
  };
}

function getCountryId(formData: FormData) {
  const id = formData.get('id');

  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Country id is required.');
  }

  return id;
}

function revalidateDestinationPaths() {
  revalidatePath('/');
  revalidatePath('/destinations');
  revalidatePath('/admin/destinations');
}

async function createCountry(formData: FormData) {
  'use server';

  await requireAdminSession();

  try {
    const payload = getCountryPayload(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('countries').insert(payload);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDestinationPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess('created');
}

async function updateCountry(formData: FormData) {
  'use server';

  await requireAdminSession();

  try {
    const id = getCountryId(formData);
    const payload = getCountryPayload(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('countries')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDestinationPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess('updated');
}

async function deleteCountry(formData: FormData) {
  'use server';

  await requireAdminSession();

  try {
    const id = getCountryId(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('countries').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDestinationPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess('deleted');
}

async function toggleCountryFeatured(formData: FormData) {
  'use server';

  await requireAdminSession();

  let nextStatus: AdminFlash = 'featured';

  try {
    const id = getCountryId(formData);
    const isFeatured = formData.get('isFeatured') === 'true';
    nextStatus = isFeatured ? 'unfeatured' : 'featured';
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('countries')
      .update({ is_featured: !isFeatured })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateDestinationPaths();
  } catch (error) {
    redirectWithError(error);
  }

  redirectWithSuccess(nextStatus);
}

type AdminDestinationsPageProps = {
  searchParams?: Promise<{
    error?: string;
    status?: AdminFlash;
  }>;
};

export default async function AdminDestinationsPage({
  searchParams,
}: AdminDestinationsPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const successMessage = params?.status
    ? adminFlashMessages[params.status]
    : null;
  const errorMessage = params?.error;
  let countries: Country[] = [];
  let loadErrorMessage: string | null = null;

  try {
    countries = await getCountries();
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
            Gérer les destinations
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ajoute ou modifie les pays accessibles avec un passeport marocain, y
            compris le type de visa, la durée maximale et la source officielle.
          </p>
        </div>
        <AdminHeaderActions
          links={[
            { href: '/admin', label: 'Admin' },
            { href: '/admin/deals', label: 'Offres' },
          ]}
        />
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
        <CountryForm
          action={createCountry}
          submitLabel="Ajouter la destination"
          title="Nouvelle destination"
        />

        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Destinations existantes
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {countries.length} destination{countries.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {countries.map((country) => (
              <AdminCountryItem key={country.id} country={country} />
            ))}

            {countries.length === 0 && (
              <div className="rounded-xl border bg-muted p-8 text-center text-muted-foreground">
                Aucune destination pour le moment.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

type AdminCountryItemProps = {
  country: Country;
};

function AdminCountryItem({ country }: AdminCountryItemProps) {
  return (
    <article className="rounded-xl border bg-muted/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{country.name}</h3>
            <span className="rounded-md bg-background px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
              {country.code}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {country.region} · {visaLabels[country.visaType]}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Séjour max : {country.maxStayDays ?? 'Non précisé'} jours
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-background px-3 py-1">
            {country.isFeatured ? 'Mise en avant' : 'Standard'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={toggleCountryFeatured}>
          <input name="id" type="hidden" value={country.id} />
          <input
            name="isFeatured"
            type="hidden"
            value={String(country.isFeatured)}
          />
          <AdminActionButton>
            {country.isFeatured ? 'Retirer de la une' : 'Mettre en avant'}
          </AdminActionButton>
        </form>
        <DeleteCountryButton
          action={deleteCountry}
          countryId={country.id}
          countryName={country.name}
        />
      </div>

      <details className="mt-4 rounded-xl border bg-background p-4">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          Modifier
        </summary>
        <div className="mt-4">
          <CountryForm
            action={updateCountry}
            country={country}
            submitLabel="Enregistrer"
            title="Modifier la destination"
          />
        </div>
      </details>
    </article>
  );
}

type CountryFormProps = {
  action: (formData: FormData) => Promise<void>;
  country?: Country;
  submitLabel: string;
  title: string;
};

function CountryForm({
  action,
  country,
  submitLabel,
  title,
}: CountryFormProps) {
  return (
    <form
      action={action}
      className="rounded-2xl border bg-background p-6 shadow-sm"
    >
      {country && <input name="id" type="hidden" value={country.id} />}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      <div className="mt-6 grid gap-4">
        <AdminInput
          name="name"
          label="Pays"
          placeholder="Algérie"
          defaultValue={country?.name}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CountryCodeInput defaultValue={country?.code} />
          <RegionSelect defaultValue={country?.region} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <VisaTypeSelect defaultValue={country?.visaType} />
          <AdminInput
            name="maxStayDays"
            label="Séjour max en jours"
            placeholder="90"
            type="number"
            defaultValue={country?.maxStayDays ?? ''}
            required={false}
          />
        </div>

        <AdminTextarea
          name="notes"
          label="Notes"
          placeholder="Informations indicatives à vérifier avant le départ."
          defaultValue={country?.notes ?? ''}
        />

        <AdminInput
          name="officialSourceUrl"
          label="Source officielle"
          placeholder="https://..."
          type="url"
          defaultValue={country?.officialSourceUrl ?? ''}
          required={false}
        />

        <label className="flex items-center gap-3 rounded-xl border bg-muted p-4 text-sm font-semibold">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={country?.isFeatured ?? false}
          />
          Mettre en avant sur la page d’accueil
        </label>

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

type VisaTypeSelectProps = {
  defaultValue?: VisaType | null;
};

function VisaTypeSelect({ defaultValue }: VisaTypeSelectProps) {
  return (
    <div>
      <label
        htmlFor="visaType"
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Type de visa
      </label>
      <select
        id="visaType"
        name="visaType"
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        defaultValue={defaultValue ? normalizeVisaType(defaultValue) : ''}
        required
      >
        <option value="">Choisir un type</option>
        <option value="visa_free">Sans visa</option>
        <option value="evisa">eVisa</option>
        <option value="on_arrival">Visa à l’arrivée</option>
        <option value="visa_required">Visa requis</option>
      </select>
    </div>
  );
}

const regions = [
  'Afrique centrale',
  "Afrique de l'Est",
  "Afrique de l'Ouest",
  'Afrique du Nord',
  'Afrique australe',
  'Amérique centrale',
  'Amérique du Nord',
  'Amérique du Sud',
  'Asie centrale',
  "Asie de l'Est",
  'Asie du Sud',
  'Asie du Sud-Est',
  'Caraïbes',
  'Caucase',
  'Europe',
  'Moyen-Orient',
  'Océanie',
];

type RegionSelectProps = {
  defaultValue?: string;
};

function RegionSelect({ defaultValue }: RegionSelectProps) {
  return (
    <div>
      <label
        htmlFor="region"
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Région
      </label>
      <select
        id="region"
        name="region"
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        defaultValue={defaultValue ?? ''}
        required
      >
        <option value="">Choisir une région</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
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
  required?: boolean;
};

function AdminInput({
  name,
  label,
  placeholder,
  type = 'text',
  defaultValue,
  required = true,
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
        required={required}
      />
    </div>
  );
}

type AdminTextareaProps = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
};

function AdminTextarea({
  name,
  label,
  placeholder,
  defaultValue,
}: AdminTextareaProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 min-h-28 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
      />
    </div>
  );
}

type AdminActionButtonProps = {
  children: string;
};

function AdminActionButton({ children }: AdminActionButtonProps) {
  return (
    <button
      type="submit"
      className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-xs font-semibold transition hover:bg-muted"
    >
      {children}
    </button>
  );
}
