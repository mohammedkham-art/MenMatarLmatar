import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { FlashMessage } from '@/app/admin/destinations/flash-message';
import { AdminHeaderActions } from '@/components/shared/admin-header-actions';
import { requireAdminSession } from '@/lib/auth/require-admin-session';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getAirlines } from '@/services/airlines/get-airlines';
import type { Airline, AirlineFare } from '@/services/airlines/types';

type AdminAirlinesPageProps = {
  searchParams?: Promise<{ error?: string; status?: string }>;
};

function redirectToAirlines(params: Record<string, string>) {
  redirect(`/admin/airlines?${new URLSearchParams(params).toString()}`);
}

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableString(formData: FormData, name: string) {
  const value = getString(formData, name);
  return value.length > 0 ? value : null;
}

function getNullableInt(formData: FormData, name: string) {
  const value = getString(formData, name);
  if (!value) return null;
  return Number.parseInt(value, 10);
}

function getActionError(error: unknown) {
  return error instanceof Error ? error.message : 'Action impossible.';
}

function revalidateAirlinePaths() {
  revalidatePath('/admin/airlines');
  revalidatePath('/admin/deals');
  revalidatePath('/deals');
}

async function saveAirline(formData: FormData) {
  'use server';

  await requireAdminSession();

  try {
    const id = getString(formData, 'id');
    const payload = {
      name: getString(formData, 'name'),
      code: getString(formData, 'code').toUpperCase(),
      logo_url: getNullableString(formData, 'logoUrl'),
    };
    const supabase = createAdminSupabaseClient();
    const query = id
      ? supabase.from('airlines').update(payload).eq('id', id)
      : supabase.from('airlines').insert(payload);
    const { error } = await query;

    if (error) throw new Error(error.message);
    revalidateAirlinePaths();
  } catch (error) {
    redirectToAirlines({ error: getActionError(error) });
  }

  redirectToAirlines({ status: 'saved' });
}

async function deleteAirline(formData: FormData) {
  'use server';

  await requireAdminSession();

  try {
    const id = getString(formData, 'id');
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('airlines').delete().eq('id', id);

    if (error) throw new Error(error.message);
    revalidateAirlinePaths();
  } catch (error) {
    redirectToAirlines({ error: getActionError(error) });
  }

  redirectToAirlines({ status: 'deleted' });
}

async function saveFare(formData: FormData) {
  'use server';

  await requireAdminSession();

  try {
    const id = getString(formData, 'id');
    const payload = {
      airline_id: getString(formData, 'airlineId'),
      fare_name: getString(formData, 'fareName'),
      personal_item: formData.get('personalItem') === 'on',
      personal_item_dimensions: getNullableString(
        formData,
        'personalItemDimensions',
      ),
      cabin_allowed: formData.get('cabinAllowed') === 'on',
      cabin_weight_kg: getNullableInt(formData, 'cabinWeightKg'),
      cabin_dimensions: getNullableString(formData, 'cabinDimensions'),
      checked_allowed: formData.get('checkedAllowed') === 'on',
      checked_weight_kg: getNullableInt(formData, 'checkedWeightKg'),
      checked_count: getNullableInt(formData, 'checkedCount') ?? 1,
    };
    const supabase = createAdminSupabaseClient();
    const query = id
      ? supabase.from('airline_fares').update(payload).eq('id', id)
      : supabase.from('airline_fares').insert(payload);
    const { error } = await query;

    if (error) throw new Error(error.message);
    revalidateAirlinePaths();
  } catch (error) {
    redirectToAirlines({ error: getActionError(error) });
  }

  redirectToAirlines({ status: 'saved' });
}

export default async function AdminAirlinesPage({
  searchParams,
}: AdminAirlinesPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const airlines = await getAirlines().catch(() => []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Compagnies et tarifs
          </h1>
          <p className="mt-3 text-muted-foreground">
            Gere les compagnies aeriennes et les bagages inclus par tarif.
          </p>
        </div>
        <AdminHeaderActions
          links={[
            { href: '/admin', label: 'Admin' },
            { href: '/admin/deals', label: 'Offres' },
          ]}
        />
      </header>

      {params?.status && (
        <FlashMessage
          message="Modification enregistree."
          redirectTo="/admin/airlines"
          type="success"
        />
      )}
      {params?.error && (
        <FlashMessage
          message={params.error}
          redirectTo="/admin/airlines"
          type="error"
        />
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <AirlineForm action={saveAirline} title="Nouvelle compagnie" />

        <div className="space-y-5">
          {airlines.map((airline) => (
            <AirlinePanel key={airline.id} airline={airline} />
          ))}
        </div>
      </section>
    </main>
  );
}

function AirlinePanel({ airline }: { airline: Airline }) {
  return (
    <article className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{airline.name}</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Code IATA {airline.code}
          </p>
        </div>
        <form action={deleteAirline}>
          <input name="id" type="hidden" value={airline.id} />
          <button className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700">
            Supprimer
          </button>
        </form>
      </div>

      <details className="mt-4 rounded-xl border bg-muted p-4">
        <summary className="cursor-pointer text-sm font-bold text-primary">
          Modifier la compagnie
        </summary>
        <div className="mt-4">
          <AirlineForm
            action={saveAirline}
            airline={airline}
            title="Modifier la compagnie"
          />
        </div>
      </details>

      <div className="mt-5 grid gap-4">
        {airline.fares.length > 0 ? (
          airline.fares.map((fare) => (
            <FareForm
              key={fare.id}
              action={saveFare}
              airlineId={airline.id}
              fare={fare}
            />
          ))
        ) : (
          <FareForm
            action={saveFare}
            airlineId={airline.id}
            title="Tarif de base"
          />
        )}
      </div>
    </article>
  );
}

function AirlineForm({
  action,
  airline,
  title,
}: {
  action: (formData: FormData) => Promise<void>;
  airline?: Airline;
  title: string;
}) {
  return (
    <form action={action} className="rounded-xl border bg-background p-5">
      {airline && <input name="id" type="hidden" value={airline.id} />}
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 grid gap-3">
        <AdminInput name="name" label="Nom" defaultValue={airline?.name} />
        <AdminInput
          name="code"
          label="Code IATA"
          defaultValue={airline?.code}
        />
        <AdminInput
          name="logoUrl"
          label="Logo URL"
          defaultValue={airline?.logoUrl ?? ''}
          required={false}
        />
        <button className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground">
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function FareForm({
  action,
  airlineId,
  fare,
  title,
}: {
  action: (formData: FormData) => Promise<void>;
  airlineId: string;
  fare?: AirlineFare;
  title?: string;
}) {
  return (
    <div className="rounded-xl border bg-muted p-4">
      <form action={action} className="grid gap-3">
        <input name="airlineId" type="hidden" value={airlineId} />
        {fare && <input name="id" type="hidden" value={fare.id} />}
        <h3 className="text-sm font-bold text-primary">
          {title ?? 'Tarif de base'}
        </h3>
        <AdminInput
          name="fareName"
          label="Tarif"
          defaultValue={fare?.fareName}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <CheckField
            defaultChecked={fare?.personalItem ?? true}
            label="Effet personnel"
            name="personalItem"
          />
          <CheckField
            defaultChecked={fare?.cabinAllowed ?? false}
            label="Cabine"
            name="cabinAllowed"
          />
          <CheckField
            defaultChecked={fare?.checkedAllowed ?? false}
            label="Soute"
            name="checkedAllowed"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput
            name="personalItemDimensions"
            label="Dimensions effet personnel"
            defaultValue={fare?.personalItemDimensions ?? ''}
            required={false}
          />
          <AdminInput
            name="cabinDimensions"
            label="Dimensions cabine"
            defaultValue={fare?.cabinDimensions ?? ''}
            required={false}
          />
          <AdminInput
            name="cabinWeightKg"
            label="Poids cabine kg"
            defaultValue={fare?.cabinWeightKg ?? ''}
            required={false}
            type="number"
          />
          <AdminInput
            name="checkedWeightKg"
            label="Poids soute kg"
            defaultValue={fare?.checkedWeightKg ?? ''}
            required={false}
            type="number"
          />
          <AdminInput
            name="checkedCount"
            label="Nombre bagages soute"
            defaultValue={fare?.checkedCount ?? 1}
            type="number"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="h-10 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground">
            Enregistrer tarif
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminInput({
  defaultValue,
  label,
  name,
  required = true,
  type = 'text',
}: {
  defaultValue?: number | string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
      <input
        className="h-11 rounded-xl border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none focus:border-primary"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function CheckField({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-semibold">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}
