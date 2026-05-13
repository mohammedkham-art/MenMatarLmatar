'use client';

import { useMemo, useState } from 'react';

import type { Airline } from '@/services/airlines/types';

type AirlineFareSelectProps = {
  airlines: Airline[];
  defaultAirlineId?: string | null;
  defaultFareId?: string | null;
};

export function AirlineFareSelect({
  airlines,
  defaultAirlineId,
  defaultFareId,
}: AirlineFareSelectProps) {
  const [airlineId, setAirlineId] = useState(defaultAirlineId ?? '');
  const selectedAirline = useMemo(
    () => airlines.find((airline) => airline.id === airlineId),
    [airlineId, airlines],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <input
        name="airlineName"
        type="hidden"
        value={selectedAirline?.name ?? ''}
      />
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          htmlFor={`airlineId-${defaultAirlineId ?? 'new'}`}
        >
          Compagnie
        </label>
        <select
          className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
          defaultValue={defaultAirlineId ?? ''}
          id={`airlineId-${defaultAirlineId ?? 'new'}`}
          name="airlineId"
          onChange={(event) => setAirlineId(event.target.value)}
        >
          <option value="">Choisir une compagnie</option>
          {airlines.map((airline) => (
            <option key={airline.id} value={airline.id}>
              {airline.name} ({airline.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          htmlFor={`fareId-${defaultFareId ?? 'new'}`}
        >
          Tarif
        </label>
        <select
          className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:opacity-60"
          defaultValue={defaultFareId ?? ''}
          disabled={!selectedAirline}
          id={`fareId-${defaultFareId ?? 'new'}`}
          name="fareId"
        >
          <option value="">Choisir un tarif</option>
          {selectedAirline?.fares.map((fare) => (
            <option key={fare.id} value={fare.id}>
              {fare.fareName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
