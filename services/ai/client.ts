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
  };
};

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
    'Génère un plan de voyage très utile pour un voyageur marocain.',
    'Réponds uniquement en français simple, chaleureux, pratique et UTF-8 propre.',
    'Ne produis jamais de texte générique: cite des vrais quartiers, monuments, marchés, musées, plages, points de vue ou expériences connus de la destination.',
    'Ne prétends pas avoir consulté des données en direct. Les prix sont des estimations plausibles, pas des tarifs garantis.',
    'Tous les montants doivent être en dirhams marocains MAD. Convertis mentalement depuis les prix locaux si nécessaire et reste cohérent avec le budget total.',
    'Adapte fortement les choix au budget, au type de voyageur et au style demandé. Un petit budget doit donner des alternatives simples, pas des activités premium.',
    'Pense comme un voyageur marocain: coût global, visa, passeport, sécurité, quartiers pratiques, transport depuis l’aéroport, bagages, repas halal ou faciles à trouver quand pertinent, marge pour imprévus et paiement cash/carte.',
    'Pour les visas et passeports, utilise seulement le contexte fourni et recommande de vérifier les sources officielles avant réservation.',
    '',
    'Qualité attendue du plan:',
    '- Chaque journée doit avoir un titre et des activités concrètes matin, après-midi et soir.',
    '- Les activités doivent former un itinéraire logique par zone pour éviter les allers-retours coûteux.',
    '- Mentionne des spots touristiques réels et des expériences locales précises.',
    '- Ajoute pour chaque jour un budgetTip concret avec une estimation ou une optimisation en MAD.',
    '- Le summary doit expliquer le style du voyage en 2 à 4 phrases utiles.',
    '',
    'Conseils transport:',
    '- Inclure au moins un conseil aéroport → centre-ville avec option économique et option confortable.',
    '- Mentionner métro, bus, tram, train, taxi officiel ou applications VTC si pertinent pour la destination.',
    '- Donner des conseils pratiques: éviter taxis non officiels, vérifier prix avant départ, acheter carte transport, garder marge pour l’aéroport.',
    '',
    'Conseils repas:',
    '- Citer des plats locaux ou types de repas à essayer.',
    '- Séparer clairement options économiques et options plus confortables.',
    '- Donner des astuces pour manger bien sans exploser le budget.',
    '',
    'Conseils budget:',
    '- Si le budget est trop bas, le dire clairement dans budgetWarning et proposer des optimisations.',
    '- Répartir le budget en logement, nourriture, transport local, activités et marge.',
    '- Les chiffres doivent être réalistes et la somme de la répartition doit rester proche du budget total.',
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
    throw new Error('OPENAI_API_KEY is required to generate a trip plan.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL ?? 'gpt-4o-mini',
      instructions:
        'Tu es l’assistant voyage de Men Matar L Matar, une app SaaS pour voyageurs marocains. Tu produis des itinéraires concrets, prudents, bien budgétés et directement utilisables. Tu respectes strictement le schéma JSON demandé.',
      input: buildPrompt(params),
      max_output_tokens: 2200,
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

  const payload = (await response.json()) as OpenAIResponsesPayload;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? 'OpenAI trip generation request failed.',
    );
  }

  const responseText = extractResponseText(payload);

  if (!responseText) {
    throw new Error('OpenAI returned an empty trip plan.');
  }

  return tripSimulationResultSchema.parse(JSON.parse(responseText));
}
