import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { CircuitForm } from '@/app/admin/circuits/circuit-form';
import { DeleteCircuitButton } from '@/app/admin/circuits/delete-circuit-button';
import { FlashMessage } from '@/app/admin/destinations/flash-message';
import { AdminHeaderActions } from '@/components/shared/admin-header-actions';
import { requireAdminSession } from '@/lib/auth/require-admin-session';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getAirlines } from '@/services/airlines/get-airlines';
import { getAdminCircuits } from '@/services/circuits/get-admin-circuits';
import type { Circuit, CircuitDestination, CircuitExtraInfo, CircuitSegment } from '@/services/circuits/types';

// ─── Types flash ────────────────────────────────────────────────────────────

type AdminFlash =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'activated'
  | 'deactivated'
  | 'featured'
  | 'unfeatured';

const flashMessages: Record<AdminFlash, string> = {
  created: 'Circuit créé avec succès.',
  updated: 'Circuit modifié avec succès.',
  deleted: 'Circuit supprimé avec succès.',
  activated: 'Circuit activé avec succès.',
  deactivated: 'Circuit désactivé avec succès.',
  featured: 'Circuit mis en avant avec succès.',
  unfeatured: 'Circuit retiré des mises en avant avec succès.',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getAdminCircuitsUrl(params: Record<string, string>) {
  return `/admin/circuits?${new URLSearchParams(params).toString()}`;
}

function redirectOk(status: AdminFlash) {
  redirect(getAdminCircuitsUrl({ status }));
}

function redirectErr(error: unknown) {
  const msg = error instanceof Error ? error.message : 'Action impossible.';
  redirect(getAdminCircuitsUrl({ error: msg }));
}

function getId(formData: FormData): string {
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) throw new Error('ID manquant.');
  return id;
}

function revalidate() {
  revalidatePath('/');
  revalidatePath('/circuits');
  revalidatePath('/admin/circuits');
}

function parseJsonField<T>(formData: FormData, key: string, fallback: T): T {
  try {
    const raw = formData.get(key);
    if (typeof raw !== 'string') return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function buildPayload(formData: FormData) {
  const title = formData.get('title');
  const price_mad = Number(formData.get('price_mad'));
  const departure_date = (formData.get('departure_date') as string) || null;
  const return_date = (formData.get('return_date') as string) || null;
  const booking_url = (formData.get('booking_url') as string) || null;
  const is_active = formData.get('is_active') === 'on';
  const is_featured = formData.get('is_featured') === 'on';
  const segments = parseJsonField<CircuitSegment[]>(formData, 'segments', []);
  const destinations = parseJsonField<CircuitDestination[]>(formData, 'destinations', []);
  const extra_info = parseJsonField<CircuitExtraInfo>(formData, 'extra_info', {
    visasRequired: [],
    terrestrialLegs: [],
    tips: [],
  });

  // Slug auto-généré depuis le titre
  const slug = (title as string)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return {
    title,
    slug,
    price_mad,
    departure_date,
    return_date,
    booking_url,
    is_active,
    is_featured,
    segments,
    destinations,
    extra_info,
  };
}

// ─── Server Actions ──────────────────────────────────────────────────────────

async function createCircuit(formData: FormData) {
  'use server';
  await requireAdminSession();
  try {
    const payload = buildPayload(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('circuits').insert(payload);
    if (error) throw new Error(error.message);
    revalidate();
  } catch (error) {
    redirectErr(error);
  }
  redirectOk('created');
}

async function updateCircuit(formData: FormData) {
  'use server';
  await requireAdminSession();
  try {
    const id = getId(formData);
    const payload = buildPayload(formData);
    // On ne réécrit pas le slug lors d'une mise à jour pour préserver les liens existants
    const { slug: _unused, ...updatePayload } = payload;
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('circuits').update(updatePayload).eq('id', id);
    if (error) throw new Error(error.message);
    revalidate();
  } catch (error) {
    redirectErr(error);
  }
  redirectOk('updated');
}

async function deleteCircuit(formData: FormData) {
  'use server';
  await requireAdminSession();
  try {
    const id = getId(formData);
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from('circuits').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidate();
  } catch (error) {
    redirectErr(error);
  }
  redirectOk('deleted');
}

async function toggleCircuitActive(formData: FormData) {
  'use server';
  await requireAdminSession();
  let nextStatus: AdminFlash = 'activated';
  try {
    const id = getId(formData);
    const isActive = formData.get('isActive') === 'true';
    nextStatus = isActive ? 'deactivated' : 'activated';
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('circuits')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (error) throw new Error(error.message);
    revalidate();
  } catch (error) {
    redirectErr(error);
  }
  redirectOk(nextStatus);
}

async function toggleCircuitFeatured(formData: FormData) {
  'use server';
  await requireAdminSession();
  let nextStatus: AdminFlash = 'featured';
  try {
    const id = getId(formData);
    const isFeatured = formData.get('isFeatured') === 'true';
    nextStatus = isFeatured ? 'unfeatured' : 'featured';
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from('circuits')
      .update({ is_featured: !isFeatured })
      .eq('id', id);
    if (error) throw new Error(error.message);
    revalidate();
  } catch (error) {
    redirectErr(error);
  }
  redirectOk(nextStatus);
}

// ─── Page ────────────────────────────────────────────────────────────────────

type PageProps = {
  searchParams?: Promise<{ error?: string; status?: AdminFlash }>;
};

export default async function AdminCircuitsPage({ searchParams }: PageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const successMessage = params?.status ? flashMessages[params.status] : null;
  const errorMessage = params?.error;

  let circuits: Circuit[] = [];
  let loadError: string | null = null;

  const [circuitsResult, airlines] = await Promise.allSettled([
    getAdminCircuits(),
    getAirlines(),
  ]);

  if (circuitsResult.status === 'fulfilled') {
    circuits = circuitsResult.value;
  } else {
    loadError = circuitsResult.reason instanceof Error ? circuitsResult.reason.message : 'Erreur de chargement.';
  }

  const airlinesList = airlines.status === 'fulfilled' ? airlines.value : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Gérer les circuits
          </h1>
          <p className="mt-3 text-muted-foreground">
            Crée et pilote les circuits multi-destinations.
          </p>
        </div>
        <AdminHeaderActions
          links={[
            { href: '/admin', label: 'Admin' },
            { href: '/admin/deals', label: 'Vols' },
            { href: '/admin/destinations', label: 'Destinations' },
          ]}
        />
      </header>

      {successMessage && (
        <FlashMessage message={successMessage} type="success" redirectTo="/admin/circuits" />
      )}
      {(errorMessage ?? loadError) && (
        <FlashMessage
          message={errorMessage ?? loadError!}
          type="error"
          redirectTo="/admin/circuits"
        />
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Formulaire création */}
        <CircuitForm
          action={createCircuit}
          airlines={airlinesList}
          submitLabel="Créer le circuit"
          title="Nouveau circuit"
        />

        {/* Liste */}
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Circuits existants</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {circuits.length} circuit{circuits.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {circuits.map((circuit) => (
              <AdminCircuitItem key={circuit.id} circuit={circuit} airlines={airlinesList} />
            ))}
            {circuits.length === 0 && (
              <div className="rounded-xl border bg-muted p-8 text-center text-muted-foreground">
                Aucun circuit pour le moment.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function AdminCircuitItem({ circuit, airlines }: { circuit: Circuit; airlines: import('@/services/airlines/types').Airline[] }) {
  const iataChain = [
    ...new Set([
      circuit.segments[0]?.from,
      ...circuit.segments.map((s) => s.to),
    ].filter(Boolean)),
  ].join(' → ');

  const dateStr = circuit.departureDate
    ? new Date(circuit.departureDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Date libre';

  return (
    <article className="rounded-xl border bg-muted/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-bold">{circuit.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {iataChain} · {circuit.priceMad.toLocaleString('fr-MA')} MAD · {dateStr}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {circuit.segments.length} vol{circuit.segments.length > 1 ? 's' : ''} ·{' '}
            {circuit.destinations.length} destination{circuit.destinations.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1 ${circuit.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
            {circuit.isActive ? 'Actif' : 'Inactif'}
          </span>
          {circuit.isFeatured && (
            <span className="rounded-full bg-accent/20 px-3 py-1 text-accent-foreground">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={toggleCircuitActive}>
          <input name="id" type="hidden" value={circuit.id} />
          <input name="isActive" type="hidden" value={String(circuit.isActive)} />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-xs font-semibold transition hover:bg-muted"
          >
            {circuit.isActive ? 'Désactiver' : 'Activer'}
          </button>
        </form>

        <form action={toggleCircuitFeatured}>
          <input name="id" type="hidden" value={circuit.id} />
          <input name="isFeatured" type="hidden" value={String(circuit.isFeatured)} />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-xs font-semibold transition hover:bg-muted"
          >
            {circuit.isFeatured ? 'Unfeatured' : 'Featured'}
          </button>
        </form>

        <DeleteCircuitButton action={deleteCircuit} circuitId={circuit.id} />
      </div>

      <details className="mt-4 rounded-xl border bg-background p-4">
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          Modifier
        </summary>
        <div className="mt-4">
          <CircuitForm
            action={updateCircuit}
            airlines={airlines}
            circuit={circuit}
            submitLabel="Enregistrer"
            title="Modifier le circuit"
          />
        </div>
      </details>
    </article>
  );
}
