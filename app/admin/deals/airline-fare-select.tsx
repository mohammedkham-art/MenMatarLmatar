'use client';

import { useId, useMemo, useState } from 'react';

import type { Airline } from '@/services/airlines/types';

type AirlineFareSelectProps = {
  airlines: Airline[];
  defaultAirlineId?: string | null;
  defaultFareId?: string | null;
  defaultAirlineName?: string | null;
};

export function AirlineFareSelect({
  airlines,
  defaultAirlineId,
  defaultFareId,
  defaultAirlineName,
}: AirlineFareSelectProps) {
  const inputId = useId();
  const initialAirlineId =
    defaultAirlineId ??
    airlines.find(
      (airline) =>
        defaultAirlineName &&
        airline.name.toLowerCase() === defaultAirlineName.toLowerCase(),
    )?.id ??
    '';
  const [airlineId, setAirlineId] = useState(initialAirlineId);
  const selectedAirline = useMemo(
    () => airlines.find((airline) => airline.id === airlineId),
    [airlineId, airlines],
  );
  const selectedFare = useMemo(() => {
    if (!selectedAirline) {
      return null;
    }

    return (
      selectedAirline.fares.find((fare) => fare.id === defaultFareId) ??
      selectedAirline.fares[0] ??
      null
    );
  }, [defaultFareId, selectedAirline]);

  return (
    <div className="grid gap-3">
      <input
        name="airline"
        type="hidden"
        value={selectedAirline?.name ?? defaultAirlineName ?? ''}
      />
      <input name="fareId" type="hidden" value={selectedFare?.id ?? ''} />
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          htmlFor={`${inputId}-airlineId`}
        >
          Compagnie
        </label>
        <select
          className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
          id={`${inputId}-airlineId`}
          name="airlineId"
          value={airlineId}
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

      {selectedFare && (
        <p className="rounded-xl border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Tarif bagages applique :{' '}
          <span className="font-semibold text-foreground">
            {selectedFare.fareName}
          </span>
        </p>
      )}
    </div>
  );
}
