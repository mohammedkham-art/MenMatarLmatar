import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { tripSimulationRequestSchema } from '@/lib/validators/simulator';
import {
  generateTripPlan,
  TripPlanGenerationError,
} from '@/services/ai/client';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const params = tripSimulationRequestSchema.parse(body);
    const plan = await generateTripPlan(params);

    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Les informations envoyées sont invalides.',
          code: 'invalid_request',
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (error instanceof TripPlanGenerationError) {
      return NextResponse.json(
        {
          error: error.publicMessage,
          code: error.code,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: 'Impossible de générer le voyage pour le moment.',
        code: 'unexpected_error',
      },
      { status: 500 },
    );
  }
}
