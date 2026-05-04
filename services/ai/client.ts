import { getServerEnv } from '@/lib/validators/env';
import {
  type TripSimulationRequest,
  tripSimulationResultSchema,
} from '@/lib/validators/simulator';
import type { GenerateTripPlanParams, TripPlan } from '@/services/ai/types';

type OpenAIResponsesPayload = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

export type TripPlanGenerationErrorCode =
  | 'missing_api_key'
  | 'invalid_api_key'
  | 'rate_limited'
  | 'timeout'
  | 'invalid_response'
  | 'provider_error';

export class TripPlanGenerationError extends Error {
  constructor(
    public readonly code: TripPlanGenerationErrorCode,
    public readonly publicMessage: string,
    public readonly status = 500,
    message = publicMessage,
  ) {
    super(message);
    this.name = 'TripPlanGenerationError';
  }
}

const responseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'destinationCity',
    'destinationCountry',
    'durationDays',
    'budgetMad',
    'estimatedDailyBudgetMad',
    'summary',
    'budgetWarning',
    'budgetBreakdown',
    'dayPlans',
    'transportTips',
    'foodTips',
    'passportVisaNotes',
  ],
  properties: {
    title: { type: 'string' },
    destinationCity: { type: 'string' },
    destinationCountry: { type: 'string' },
    durationDays: { type: 'integer' },
    budgetMad: { type: 'integer' },
    estimatedDailyBudgetMad: { type: 'integer' },
    summary: { type: 'string' },
    budgetWarning: { type: ['string', 'null'] },
    budgetBreakdown: {
      type: 'object',
      additionalProperties: false,
      required: [
        'lodgingMad',
        'foodMad',
        'localTransportMad',
        'activitiesMad',
        'bufferMad',
      ],
      properties: {
        lodgingMad: { type: 'integer' },
        foodMad: { type: 'integer' },
        localTransportMad: { type: 'integer' },
        activitiesMad: { type: 'integer' },
        bufferMad: { type: 'integer' },
      },
    },
    dayPlans: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'day',
          'title',
          'morning',
          'afternoon',
          'evening',
          'budgetTip',
        ],
        properties: {
          day: { type: 'integer' },
          title: { type: 'string' },
          morning: { type: 'string' },
          afternoon: { type: 'string' },
          evening: { type: 'string' },
          budgetTip: { type: 'string' },
        },
      },
    },
    transportTips: {
      type: 'array',
      items: { type: 'string' },
    },
    foodTips: {
      type: 'array',
      items: { type: 'string' },
    },
    passportVisaNotes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const;

function getVisaContext(params: TripSimulationRequest) {
  if (params.visaType === 'visa_free') {
    return 'La base indique une destination sans visa pour le passeport marocain.';
  }

  if (params.visaType === 'evisa') {
    return 'La base indique une destination avec e-visa pour le passeport marocain.';
  }

  if (params.visaType === 'on_arrival') {
    return "La base indique un visa à l'arrivée pour le passeport marocain.";
  }

  if (params.visaType === 'visa_required') {
    return 'La base indique un visa obligatoire à obtenir avant le départ pour le passeport marocain.';
  }

  return 'Aucune information visa fiable fournie par la base locale.';
}

function getBudgetContext(params: TripSimulationRequest) {
  const dailyBudget = Math.floor(params.budgetMad / params.durationDays);

  if (dailyBudget < 450) {
    return [
      `Budget très serré: environ ${dailyBudget} MAD par jour.`,
      'Le plan doit privilégier logement simple, transports publics, repas locaux pas chers, activités gratuites et quartiers bien connectés.',
      'Ajoute un budgetWarning clair si le séjour risque d’être difficile avec ce budget.',
    ].join(' ');
  }

  if (dailyBudget < 900) {
    return [
      `Budget économique à moyen: environ ${dailyBudget} MAD par jour.`,
      'Le plan doit combiner logement propre mais simple, repas locaux, quelques activités payantes et trajets optimisés.',
    ].join(' ');
  }

  if (dailyBudget < 1_600) {
    return [
      `Budget confortable: environ ${dailyBudget} MAD par jour.`,
      'Le plan peut inclure bons quartiers, restaurants locaux de qualité, visites payantes utiles et transports plus confortables.',
    ].join(' ');
  }

  return [
    `Budget premium: environ ${dailyBudget} MAD par jour.`,
    'Le plan peut inclure hôtel bien situé, restaurants réputés, expériences confortables et transferts pratiques, sans prix fantaisistes.',
  ].join(' ');
}

function buildPrompt(params: TripSimulationRequest) {
  return [
    'Génère un plan de voyage utile pour un voyageur marocain, en français simple et pratique.',
    'Réponds en JSON strict selon le schéma. Ne prétends pas consulter des données en direct.',
    'Prix: estimations plausibles en MAD, cohérentes avec le budget total.',
    'Contenu: vrais quartiers, monuments, marchés, musées, plages, points de vue ou expériences connues.',
    'Itinéraire: journées concrètes, zones logiques, peu d’allers-retours, budgetTip précis en MAD.',
    'Transport: conseil aéroport vers centre-ville, option économique, option confortable, taxis officiels ou transports publics si pertinent.',
    'Repas: plats locaux, options économiques et confortables, astuces pour maîtriser le budget.',
    'Visa/passeport: utilise seulement le contexte fourni et recommande toujours de vérifier les sources officielles avant réservation ou départ.',
    '',
    `Destination: ${params.destinationCity}, ${params.destinationCountry}`,
    `Code pays: ${params.destinationCountryCode ?? 'non fourni'}`,
    `Date d'arrivée: ${params.arrivalDate}`,
    `Durée: ${params.durationDays} jours`,
    `Budget total: ${params.budgetMad} MAD`,
    `Contexte budget: ${getBudgetContext(params)}`,
    `Type de voyageur: ${params.travelerType}`,
    `Style: ${params.travelStyle}`,
    `Contexte visa: ${getVisaContext(params)}`,
  ].join('\n');
}

function getMaxOutputTokens(durationDays: number) {
  return Math.min(4_500, Math.max(1_800, 1_200 + durationDays * 140));
}

function extractResponseText(payload: OpenAIResponsesPayload) {
  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text' && content.text)?.text;
}

export async function generateTripPlan(
  params: GenerateTripPlanParams,
): Promise<TripPlan> {
  const env = getServerEnv();
  const apiKey = env.OPENAI_API_KEY ?? env.AI_API_KEY;

  if (!apiKey) {
    throw new TripPlanGenerationError(
      'missing_api_key',
      "Le simulateur IA n'est pas encore configuré. Ajoute OPENAI_API_KEY sur Vercel puis réessaie.",
      503,
      'OPENAI_API_KEY or AI_API_KEY is required to generate a trip plan.',
    );
  }

  let response: Response;

  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL ?? 'gpt-4.1-mini',
        instructions:
          'Tu es l’assistant voyage de Men Matar L Matar, une app SaaS pour voyageurs marocains. Produis des itinéraires concrets, prudents, bien budgétés et directement utilisables. Respecte strictement le schéma JSON demandé.',
        input: buildPrompt(params),
        max_output_tokens: getMaxOutputTokens(params.durationDays),
        text: {
          format: {
            type: 'json_schema',
            name: 'trip_simulation',
            strict: true,
            schema: responseJsonSchema,
          },
        },
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new TripPlanGenerationError(
        'timeout',
        'Le simulateur met trop de temps à répondre. Essaie avec une durée plus courte ou relance dans quelques secondes.',
        504,
      );
    }

    throw new TripPlanGenerationError(
      'provider_error',
      'Le simulateur IA est momentanément indisponible. Réessaie dans quelques instants.',
      502,
      error instanceof Error ? error.message : undefined,
    );
  }

  const payload = (await response.json()) as OpenAIResponsesPayload;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new TripPlanGenerationError(
        'invalid_api_key',
        'La clé OpenAI du simulateur est refusée. Vérifie OPENAI_API_KEY côté Vercel.',
        503,
        payload.error?.message,
      );
    }

    if (response.status === 429) {
      throw new TripPlanGenerationError(
        'rate_limited',
        'Le quota IA est temporairement atteint. Réessaie dans quelques minutes.',
        429,
        payload.error?.message,
      );
    }

    throw new TripPlanGenerationError(
      'provider_error',
      "Le simulateur IA n'a pas pu générer ce voyage. Réessaie avec un budget ou une durée légèrement différente.",
      502,
      payload.error?.message ?? 'OpenAI trip generation request failed.',
    );
  }

  const responseText = extractResponseText(payload);

  if (!responseText) {
    throw new TripPlanGenerationError(
      'invalid_response',
      'Le simulateur a reçu une réponse vide. Relance la simulation dans quelques secondes.',
      502,
      'OpenAI returned an empty trip plan.',
    );
  }

  try {
    return tripSimulationResultSchema.parse(JSON.parse(responseText));
  } catch (error) {
    throw new TripPlanGenerationError(
      'invalid_response',
      'Le simulateur a reçu une réponse incomplète. Réessaie avec une durée plus courte.',
      502,
      error instanceof Error ? error.message : undefined,
    );
  }
}
