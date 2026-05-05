import { NextResponse } from 'next/server';

import { fallbackDestinations } from '@/services/destinations/fallback-destinations';
import { getDestinations } from '@/services/destinations/get-destinations';
import { getSimulatorDestinations } from '@/services/destinations/simulator-extra-destinations';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');

  try {
    const destinations = await getDestinations().catch(() => fallbackDestinations);
    const mobileDestinations =
      mode === 'simulator'
        ? getSimulatorDestinations(destinations)
        : destinations.filter(
            (destination) => destination.visaType !== 'visa_required',
          );

    return NextResponse.json({ destinations: mobileDestinations });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Impossible de charger les destinations.',
      },
      { status: 500 },
    );
  }
}
