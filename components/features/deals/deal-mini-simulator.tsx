'use client';

import { useState } from 'react';

import type { TripSimulationResult } from '@/lib/validators/simulator';

type VisaType = 'visa_free' | 'evisa' | 'on_arrival' | 'visa_required' | null;

type Props = {
  toCity: string;
  fromCity: string;
  country: string;
  countryCode: string;
  visaType: VisaType;
  dealId: string;
  departureDate: string | null;
};

type ApiResponse = { plan?: TripSimulationResult; error?: string };

export function DealMiniSimulator({
  toCity,
  fromCity,
  country,
  countryCode,
  visaType,
  dealId,
  departureDate,
}: Props) {
  const [days, setDays] = useState('');
  const [budgetMad, setBudgetMad] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TripSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const arrivalDate = departureDate?.slice(0, 10) ?? defaultDate;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedDays = Number(days);
      const parsedBudget = Number(budgetMad);
      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: dealId,
          destinationCity: toCity,
          destinationCountry: country || toCity,
          destinationCountryCode: countryCode,
          visaType,
          arrivalDate,
          durationDays: parsedDays >= 1 ? parsedDays : 7,
          ...(parsedBudget >= 1_000 ? { budgetMad: parsedBudget } : {}),
          travelerType: 'solo',
          travelStyle: 'balanced',
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.plan) {
        setError(data.error ?? 'Impossible de générer le programme.');
        return;
      }

      setResult(data.plan);
    } catch {
      setError('Erreur de connexion. Réessaie dans quelques instants.');
    } finally {
      setLoading(false);
    }
  }

  void fromCity;

  return (
    <div className="rounded-2xl bg-primary p-6">
      {/* En-tête */}
      <p className="text-xs font-black uppercase tracking-[0.22em] text-white">
        Prépare ton séjour
      </p>
      <h2 className="mt-1 text-2xl font-bold text-white">à {toCity}</h2>
      <p className="mt-0.5 text-sm text-white">
        Programme personnalisé par IA
      </p>

      <div className="mt-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Champs */}
      <div className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <label
            className="block text-xs font-black uppercase tracking-[0.16em] text-white"
          >
            Durée
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="ex: 7 jours"
            className="mt-2 w-full border-b bg-transparent pb-2 text-sm font-semibold text-white outline-none placeholder:font-normal"
            style={{
              borderColor: '#4ade80',
              caretColor: '#4ade80',
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-black uppercase tracking-[0.16em] text-white"
          >
            Budget
          </label>
          <input
            type="number"
            min={1000}
            step={500}
            value={budgetMad}
            onChange={(e) => setBudgetMad(e.target.value)}
            placeholder="ex: 8000 MAD"
            className="mt-2 w-full border-b bg-transparent pb-2 text-sm font-semibold text-white outline-none placeholder:font-normal"
            style={{
              borderColor: '#4ade80',
              caretColor: '#4ade80',
            }}
          />
        </div>
      </div>

      {/* Bouton */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-white py-3 text-sm font-bold text-black transition hover:bg-white/90 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2"
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                borderTopColor: '#4ade80',
              }}
            />
            Génération en cours…
          </span>
        ) : (
          <span>✨ Générer mon programme</span>
        )}
      </button>

      {error && (
        <p className="mt-3 rounded-xl px-3 py-2 text-center text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/30" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          {error}
        </p>
      )}

      {/* Résultat */}
      {result && (
        <div
          className="mt-5 space-y-5 rounded-xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <p className="text-sm leading-6 text-white/80">{result.summary}</p>

          {result.budgetWarning && (
            <p
              className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/30"
            >
              ⚠️ {result.budgetWarning}
            </p>
          )}

          {/* Répartition budget */}
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.16em]"
              style={{ color: '#4ade80' }}
            >
              Répartition budget
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ['Hôtel', result.budgetBreakdown.lodgingMad],
                  ['Repas', result.budgetBreakdown.foodMad],
                  ['Transport', result.budgetBreakdown.localTransportMad],
                  ['Activités', result.budgetBreakdown.activitiesMad],
                ] as const
              ).map(([label, amount]) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <dt className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-black text-white">
                    {amount.toLocaleString('fr-MA')} MAD
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Programme jour par jour */}
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.16em]"
              style={{ color: '#4ade80' }}
            >
              Programme jour par jour
            </p>
            <div className="mt-2 space-y-2">
              {result.dayPlans.map((day) => (
                <div
                  key={day.day}
                  className="rounded-xl p-3 text-xs"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <p className="font-black" style={{ color: '#4ade80' }}>
                    Jour {day.day} — {day.title}
                  </p>
                  <p className="mt-1 text-white/70">{day.morning}</p>
                  <p className="mt-0.5 text-white/70">{day.afternoon}</p>
                  <p className="mt-0.5 text-white/70">{day.evening}</p>
                  <p className="mt-1.5 font-semibold" style={{ color: '#86efac' }}>
                    {day.budgetTip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils transport */}
          {result.transportTips.length > 0 && (
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: '#4ade80' }}
              >
                Transport
              </p>
              <ul className="mt-2 space-y-1">
                {result.transportTips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-white/70">
                    <span className="mt-0.5 shrink-0" style={{ color: '#4ade80' }}>
                      →
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
