import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { tripSimulationRequestSchema } from '@/lib/validators/simulator';
import { generateTripPlan } from '@/services/ai/client';

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
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de générer le voyage pour le moment.';

    const status = message.includes('OPENAI_API_KEY') ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
