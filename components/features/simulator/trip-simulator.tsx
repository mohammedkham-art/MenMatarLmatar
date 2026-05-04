'use client';

import { useMutation } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils/cn';
import type {
  TravelerType,
  TravelStyle,
  TripSimulationRequest,
  TripSimulationResult,
} from '@/lib/validators/simulator';
import type { Destination } from '@/services/destinations/get-destinations';

type TripSimulatorProps = {
  destinations: Destination[];
};

type SimulatorApiResponse = {
  plan?: TripSimulationResult;
  error?: string;
  code?: string;
};

const travelerTypeOptions: Array<{
  label: string;
  value: TravelerType;
}> = [
  { label: 'Solo', value: 'solo' },
  { label: 'Couple', value: 'couple' },
  { label: 'Amis', value: 'friends' },
  { label: 'Famille', value: 'family' },
];

const travelStyleOptions: Array<{
  label: string;
  value: TravelStyle;
}> = [
  { label: 'Budget minimum', value: 'minimum' },
  { label: 'Équilibré', value: 'balanced' },
  { label: 'Confortable', value: 'comfortable' },
];

function getDestinationLabel(destination: Destination) {
  return `${destination.city}, ${destination.country}`;
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function searchDestinations(query: string, destinations: Destination[]) {
  const normalizedQuery = normalize(query.trim());

  if (normalizedQuery.length < 1) {
    return [];
  }

  return destinations
    .filter(
      (destination) =>
        normalize(destination.city).includes(normalizedQuery) ||
        normalize(destination.country).includes(normalizedQuery),
    )
    .slice(0, 6);
}

async function requestTripSimulation(params: TripSimulationRequest) {
  const response = await fetch('/api/simulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  const payload = (await response
    .json()
    .catch(() => ({}))) as SimulatorApiResponse;

  if (!response.ok || !payload.plan) {
    throw new Error(
      payload.error ?? 'Impossible de générer le séjour pour le moment.',
    );
  }

  return payload.plan;
}

export function TripSimulator({ destinations }: TripSimulatorProps) {
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [arrivalDate, setArrivalDate] = useState('');
  const [days, setDays] = useState(5);
  const [travelerType, setTravelerType] = useState<TravelerType>('solo');
  const [budgetMad, setBudgetMad] = useState(3000);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('balanced');

  const simulationMutation = useMutation({
    mutationFn: requestTripSimulation,
  });

  const destinationSuggestions = useMemo(
    () => searchDestinations(destinationQuery, destinations),
    [destinationQuery, destinations],
  );

  const isValid = useMemo(
    () =>
      Boolean(
        selectedDestination &&
        arrivalDate &&
        days >= 1 &&
        days <= 30 &&
        budgetMad >= 100,
      ),
    [arrivalDate, budgetMad, days, selectedDestination],
  );

  function handleDestinationChange(value: string) {
    setDestinationQuery(value);
    setSelectedDestination(null);
    setIsDestinationOpen(true);
    simulationMutation.reset();
  }

  function selectDestination(destination: Destination) {
    setSelectedDestination(destination);
    setDestinationQuery(getDestinationLabel(destination));
    setIsDestinationOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || !selectedDestination) {
      return;
    }

    simulationMutation.mutate({
      destinationId: selectedDestination.id,
      destinationCity: selectedDestination.city,
      destinationCountry: selectedDestination.country,
      destinationCountryCode: selectedDestination.countryCode,
      visaType: selectedDestination.visaType,
      arrivalDate,
      durationDays: days,
      budgetMad,
      travelerType,
      travelStyle,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-background p-6 shadow-sm"
      >
        <div className="grid gap-5">
          <DestinationAutocomplete
            query={destinationQuery}
            selectedDestination={selectedDestination}
            suggestions={destinationSuggestions}
            isOpen={isDestinationOpen}
            onFocus={() => setIsDestinationOpen(true)}
            onBlur={() => setIsDestinationOpen(false)}
            onChange={handleDestinationChange}
            onSelect={selectDestination}
          />
          <p className="text-xs font-medium text-muted-foreground">
            Destinations chargées: {destinations.length}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="arrival-date"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Date d’arrivée
              </label>
              <input
                id="arrival-date"
                type="date"
                value={arrivalDate}
                onChange={(event) => setArrivalDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
                required
              />
            </div>

            <NumberInput
              id="days"
              label="Nombre de jours"
              min={1}
              max={30}
              value={days}
              onChange={setDays}
            />
          </div>

          <SegmentedControl
            label="Type de voyageur"
            value={travelerType}
            options={travelerTypeOptions}
            onChange={setTravelerType}
          />

          <NumberInput
            id="budget"
            label="Budget total en MAD"
            min={100}
            value={budgetMad}
            onChange={setBudgetMad}
          />

          <SegmentedControl
            label="Style de voyage"
            value={travelStyle}
            options={travelStyleOptions}
            onChange={setTravelStyle}
          />

          {simulationMutation.isError && (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm font-medium">
              {simulationMutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || simulationMutation.isPending}
            className={cn(
              'mt-2 h-12 rounded-xl px-6 text-sm font-semibold transition',
              isValid && !simulationMutation.isPending
                ? 'bg-primary text-primary-foreground shadow-md hover:scale-[1.01]'
                : 'cursor-not-allowed bg-muted text-muted-foreground',
            )}
          >
            {simulationMutation.isPending
              ? 'Génération en cours...'
              : 'Simuler mon séjour'}
          </button>
        </div>
      </form>

      <SimulationPreview
        isLoading={simulationMutation.isPending}
        error={simulationMutation.error?.message ?? null}
        result={simulationMutation.data ?? null}
      />
    </div>
  );
}

type DestinationAutocompleteProps = {
  query: string;
  selectedDestination: Destination | null;
  suggestions: Destination[];
  isOpen: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onSelect: (destination: Destination) => void;
};

function DestinationAutocomplete({
  query,
  selectedDestination,
  suggestions,
  isOpen,
  onFocus,
  onBlur,
  onChange,
  onSelect,
}: DestinationAutocompleteProps) {
  const shouldShowEmptyState =
    isOpen && query.trim().length >= 1 && suggestions.length === 0;
  const shouldShowSuggestions = isOpen && suggestions.length > 0;

  return (
    <div className="relative">
      <label
        htmlFor="destination-city"
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Ville de destination
      </label>
      <input
        id="destination-city"
        type="text"
        value={query}
        placeholder="Istanbul, Bangkok, Dubaï..."
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
        autoComplete="off"
        required
      />

      {selectedDestination && (
        <input type="hidden" value={selectedDestination.id} readOnly />
      )}

      {(shouldShowSuggestions || shouldShowEmptyState) && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border bg-background p-2 shadow-lg">
          {shouldShowSuggestions &&
            suggestions.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(destination);
                }}
                className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-muted focus:bg-muted focus:outline-none"
              >
                <span>
                  <span className="font-semibold">{destination.city}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {destination.country}
                    {destination.countryCode
                      ? ` · ${destination.countryCode}`
                      : ''}
                  </span>
                </span>
              </button>
            ))}

          {shouldShowEmptyState && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Aucune destination trouvée
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type NumberInputProps = {
  id: string;
  label: string;
  min: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
};

function NumberInput({
  id,
  label,
  min,
  max,
  value,
  onChange,
}: NumberInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        required
      />
    </div>
  );
}

type SegmentedControlProps<TValue extends string> = {
  label: string;
  value: TValue;
  options: Array<{
    label: string;
    value: TValue;
  }>;
  onChange: (value: TValue) => void;
};

function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<TValue>) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SimulationPreviewProps = {
  isLoading: boolean;
  error: string | null;
  result: TripSimulationResult | null;
};

function SimulationPreview({
  isLoading,
  error,
  result,
}: SimulationPreviewProps) {
  if (isLoading) {
    return (
      <aside className="rounded-2xl border bg-muted/50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          IA voyage
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">
          Préparation de ton programme
        </h2>
        <p className="mt-4 leading-7 text-muted-foreground">
          L’itinéraire, le budget et les conseils passeport sont en cours de
          génération.
        </p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="rounded-2xl border bg-muted/50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Simulateur IA
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">
          La simulation n’a pas abouti
        </h2>
        <p className="mt-4 leading-7 text-muted-foreground">{error}</p>
        <p className="mt-4 rounded-xl border bg-background p-4 text-sm leading-6 text-muted-foreground">
          Tu peux relancer avec une durée plus courte, un budget légèrement
          différent ou réessayer dans quelques instants.
        </p>
      </aside>
    );
  }

  if (!result) {
    return (
      <aside className="rounded-2xl border bg-muted/50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Aperçu
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">
          Ton programme apparaîtra ici
        </h2>
        <p className="mt-4 leading-7 text-muted-foreground">
          Remplis le formulaire pour obtenir une estimation avec budget
          journalier, programme par jour et conseils pratiques.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border bg-muted/50 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Résultat IA estimé
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">{result.title}</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{result.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Budget total"
          value={`${result.budgetMad.toLocaleString('fr-MA')} MAD`}
        />
        <MetricCard
          label="Budget journalier estimé"
          value={`${result.estimatedDailyBudgetMad.toLocaleString('fr-MA')} MAD`}
        />
      </div>

      {result.budgetWarning && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
          {result.budgetWarning}
        </div>
      )}

      <BudgetBreakdown result={result} />

      <div className="mt-6">
        <h3 className="font-semibold">Programme jour par jour</h3>
        <div className="mt-3 space-y-3">
          {result.dayPlans.map((plan) => (
            <article
              key={plan.day}
              className="rounded-xl border bg-background p-4 text-sm leading-6"
            >
              <p className="font-semibold">
                Jour {plan.day} · {plan.title}
              </p>
              <p className="mt-2 text-muted-foreground">
                Matin: {plan.morning}
              </p>
              <p className="mt-1 text-muted-foreground">
                Après-midi: {plan.afternoon}
              </p>
              <p className="mt-1 text-muted-foreground">Soir: {plan.evening}</p>
              <p className="mt-2 font-medium text-primary">{plan.budgetTip}</p>
            </article>
          ))}
        </div>
      </div>

      <TipsBlock title="Conseils transport" tips={result.transportTips} />
      <TipsBlock title="Conseils repas" tips={result.foodTips} />
      <TipsBlock title="Passeport marocain" tips={result.passportVisaNotes} />
      <p className="mt-6 rounded-xl border bg-background p-4 text-xs leading-6 text-muted-foreground">
        Ces conseils sont une première estimation. Vérifie toujours les règles
        visa, passeport, transit et entrée auprès des sources officielles avant
        de réserver ou de partir.
      </p>
    </aside>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function BudgetBreakdown({ result }: { result: TripSimulationResult }) {
  const items = [
    { label: 'Logement', value: result.budgetBreakdown.lodgingMad },
    { label: 'Repas', value: result.budgetBreakdown.foodMad },
    {
      label: 'Transport local',
      value: result.budgetBreakdown.localTransportMad,
    },
    { label: 'Activités', value: result.budgetBreakdown.activitiesMad },
    { label: 'Marge', value: result.budgetBreakdown.bufferMad },
  ];

  return (
    <div className="mt-6">
      <h3 className="font-semibold">Répartition du budget</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold">
              {item.value.toLocaleString('fr-MA')} MAD
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TipsBlockProps = {
  title: string;
  tips: string[];
};

function TipsBlock({ title, tips }: TipsBlockProps) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
        {tips.map((tip) => (
          <li key={tip}>• {tip}</li>
        ))}
      </ul>
    </div>
  );
}
