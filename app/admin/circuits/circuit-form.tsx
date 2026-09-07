'use client';

import { useRef, useState } from 'react';

import type { Airline } from '@/services/airlines/types';
import type { Circuit, CircuitDestination, CircuitSegment } from '@/services/circuits/types';

type Props = {
  action: (formData: FormData) => Promise<void>;
  airlines: Airline[];
  circuit?: Circuit;
  submitLabel: string;
  title: string;
};

const emptySegment = (): CircuitSegment => ({
  from: '',
  fromCity: '',
  to: '',
  toCity: '',
  airline: '',
  stopover: null,
  stopoverCity: null,
  stopoverDuration: null,
  stopoverTips: null,
});

const emptyDestination = (): CircuitDestination => ({
  city: '',
  country: '',
  countryCode: '',
  iata: '',
  tips: [],
  visaRequired: false,
});

function inputClass(extra = '') {
  return `w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 ${extra}`;
}

function labelClass() {
  return 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1';
}

export function CircuitForm({ action, airlines, circuit, submitLabel, title }: Props) {
  const [segments, setSegments] = useState<CircuitSegment[]>(
    circuit?.segments?.length ? circuit.segments : [emptySegment()],
  );
  const [destinations, setDestinations] = useState<CircuitDestination[]>(
    circuit?.destinations?.length ? circuit.destinations : [emptyDestination()],
  );
  const [visasRequired, setVisasRequired] = useState<string>(
    circuit?.extraInfo?.visasRequired?.join('\n') ?? '',
  );
  const [terrestrialLegs, setTerrestrialLegs] = useState<string>(
    circuit?.extraInfo?.terrestrialLegs?.join('\n') ?? '',
  );
  const [extraTips, setExtraTips] = useState<string>(
    circuit?.extraInfo?.tips?.join('\n') ?? '',
  );
  const formRef = useRef<HTMLFormElement>(null);

  function updateSegment<K extends keyof CircuitSegment>(
    index: number,
    key: K,
    value: CircuitSegment[K],
  ) {
    setSegments((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  }

  function updateDestination<K extends keyof CircuitDestination>(
    index: number,
    key: K,
    value: CircuitDestination[K],
  ) {
    setDestinations((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)),
    );
  }

  const extraInfo = {
    visasRequired: visasRequired.split('\n').map((s) => s.trim()).filter(Boolean),
    terrestrialLegs: terrestrialLegs.split('\n').map((s) => s.trim()).filter(Boolean),
    tips: extraTips.split('\n').map((s) => s.trim()).filter(Boolean),
  };

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-2xl border bg-background p-6 shadow-sm"
    >
      {circuit && <input name="id" type="hidden" value={circuit.id} />}
      <input type="hidden" name="segments" value={JSON.stringify(segments)} />
      <input type="hidden" name="destinations" value={JSON.stringify(destinations)} />
      <input type="hidden" name="extra_info" value={JSON.stringify(extraInfo)} />

      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      {/* Champs de base */}
      <div className="mt-6 grid gap-4">
        <div>
          <label className={labelClass()}>Titre</label>
          <input
            name="title"
            className={inputClass()}
            placeholder="CMN → IST → BSB → CMN"
            defaultValue={circuit?.title}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass()}>Prix MAD</label>
            <input
              name="price_mad"
              type="number"
              min={0}
              className={inputClass()}
              placeholder="8900"
              defaultValue={circuit?.priceMad}
              required
            />
          </div>
          <div>
            <label className={labelClass()}>Booking URL</label>
            <input
              name="booking_url"
              type="url"
              className={inputClass()}
              placeholder="https://..."
              defaultValue={circuit?.bookingUrl ?? ''}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass()}>Date départ</label>
            <input
              name="departure_date"
              type="date"
              className={inputClass()}
              defaultValue={circuit?.departureDate ?? ''}
            />
          </div>
          <div>
            <label className={labelClass()}>Date retour</label>
            <input
              name="return_date"
              type="date"
              className={inputClass()}
              defaultValue={circuit?.returnDate ?? ''}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={circuit?.isActive ?? false}
              className="h-4 w-4 rounded border"
            />
            Actif
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              name="is_featured"
              type="checkbox"
              defaultChecked={circuit?.isFeatured ?? false}
              className="h-4 w-4 rounded border"
            />
            Featured
          </label>
        </div>
      </div>

      {/* Segments */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary">
            Segments (vols)
          </h3>
          <button
            type="button"
            onClick={() => setSegments((prev) => [...prev, emptySegment()])}
            className="text-xs font-semibold text-primary hover:underline"
          >
            + Ajouter un vol
          </button>
        </div>

        <div className="mt-3 space-y-4">
          {segments.map((seg, i) => (
            <div key={i} className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Vol {i + 1}
                </p>
                {segments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSegments((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass()}>IATA départ</label>
                  <input
                    className={inputClass()}
                    placeholder="CMN"
                    value={seg.from}
                    onChange={(e) => updateSegment(i, 'from', e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Ville départ</label>
                  <input
                    className={inputClass()}
                    placeholder="Casablanca"
                    value={seg.fromCity}
                    onChange={(e) => updateSegment(i, 'fromCity', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>IATA arrivée</label>
                  <input
                    className={inputClass()}
                    placeholder="IST"
                    value={seg.to}
                    onChange={(e) => updateSegment(i, 'to', e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Ville arrivée</label>
                  <input
                    className={inputClass()}
                    placeholder="Istanbul"
                    value={seg.toCity}
                    onChange={(e) => updateSegment(i, 'toCity', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass()}>Compagnie aérienne</label>
                  <select
                    className={inputClass('h-10')}
                    value={seg.airline}
                    onChange={(e) => updateSegment(i, 'airline', e.target.value)}
                  >
                    <option value="">Choisir une compagnie</option>
                    {airlines.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass()}>Escale IATA</label>
                  <input
                    className={inputClass()}
                    placeholder="IST (optionnel)"
                    value={seg.stopover ?? ''}
                    onChange={(e) => updateSegment(i, 'stopover', e.target.value.toUpperCase() || null)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Ville escale</label>
                  <input
                    className={inputClass()}
                    placeholder="Istanbul"
                    value={seg.stopoverCity ?? ''}
                    onChange={(e) => updateSegment(i, 'stopoverCity', e.target.value || null)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Durée escale</label>
                  <input
                    className={inputClass()}
                    placeholder="12h"
                    value={seg.stopoverDuration ?? ''}
                    onChange={(e) => updateSegment(i, 'stopoverDuration', e.target.value || null)}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className={labelClass()}>Conseils escale</label>
                <textarea
                  className={inputClass('resize-none')}
                  rows={2}
                  placeholder="Sortir voir la vieille ville, prévoir 30 min de transport..."
                  value={seg.stopoverTips ?? ''}
                  onChange={(e) => updateSegment(i, 'stopoverTips', e.target.value || null)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destinations */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary">
            Destinations
          </h3>
          <button
            type="button"
            onClick={() => setDestinations((prev) => [...prev, emptyDestination()])}
            className="text-xs font-semibold text-primary hover:underline"
          >
            + Ajouter une destination
          </button>
        </div>

        <div className="mt-3 space-y-4">
          {destinations.map((dest, i) => (
            <div key={i} className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Destination {i + 1}
                </p>
                {destinations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDestinations((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass()}>Ville</label>
                  <input
                    className={inputClass()}
                    placeholder="Bichkek"
                    value={dest.city}
                    onChange={(e) => updateDestination(i, 'city', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Pays</label>
                  <input
                    className={inputClass()}
                    placeholder="Kirghizistan"
                    value={dest.country}
                    onChange={(e) => updateDestination(i, 'country', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Code pays (ISO)</label>
                  <input
                    className={inputClass()}
                    placeholder="KG"
                    maxLength={2}
                    value={dest.countryCode}
                    onChange={(e) => updateDestination(i, 'countryCode', e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className={labelClass()}>IATA aéroport</label>
                  <input
                    className={inputClass()}
                    placeholder="FRU"
                    value={dest.iata}
                    onChange={(e) => updateDestination(i, 'iata', e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className={labelClass()}>Tips (une par ligne)</label>
                <textarea
                  className={inputClass('resize-none')}
                  rows={3}
                  placeholder="Visiter Ala-Too Square&#10;Essayer le beshbarmak&#10;Louer une voiture pour le lac Issyk-Kul"
                  value={dest.tips.join('\n')}
                  onChange={(e) =>
                    updateDestination(
                      i,
                      'tips',
                      e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                    )
                  }
                />
              </div>

              <div className="mt-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={dest.visaRequired}
                    onChange={(e) => updateDestination(i, 'visaRequired', e.target.checked)}
                    className="h-4 w-4 rounded border"
                  />
                  Visa requis pour passeport marocain
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra infos */}
      <div className="mt-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary">
          Infos pratiques
        </h3>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={labelClass()}>Visas requis (un par ligne)</label>
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              placeholder="Visa Kirghizistan — e-visa 30€&#10;Visa Ouzbékistan — e-visa 20€"
              value={visasRequired}
              onChange={(e) => setVisasRequired(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass()}>Étapes terrestres (un par ligne)</label>
            <textarea
              className={inputClass('resize-none')}
              rows={2}
              placeholder="Train Bichkek → Tachkent (5h)"
              value={terrestrialLegs}
              onChange={(e) => setTerrestrialLegs(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass()}>Conseils généraux (un par ligne)</label>
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              placeholder="Prévoir du cash en USD&#10;Pas de carte bleue acceptée au Kirghizistan"
              value={extraTips}
              onChange={(e) => setExtraTips(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
