import type {
  Deal,
  Destination,
  TripSimulationRequest,
  TripSimulationResult,
} from './types';

const defaultApiBaseUrl = 'https://menmatarlmatar.ma';

export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? defaultApiBaseUrl;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Une erreur est survenue.');
  }

  return payload;
}

export async function fetchDeals() {
  const payload = await requestJson<{ deals: Deal[] }>('/api/mobile/deals');

  return payload.deals;
}

export async function fetchDestinations(mode: 'public' | 'simulator') {
  const suffix = mode === 'simulator' ? '?mode=simulator' : '';
  const payload = await requestJson<{ destinations: Destination[] }>(
    `/api/mobile/destinations${suffix}`,
  );

  return payload.destinations;
}

export async function simulateTrip(params: TripSimulationRequest) {
  const payload = await requestJson<{
    plan?: TripSimulationResult;
    error?: string;
  }>('/api/simulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(55_000),
  });

  if (!payload.plan) {
    throw new Error(payload.error ?? 'Impossible de générer le séjour.');
  }

  return payload.plan;
}
