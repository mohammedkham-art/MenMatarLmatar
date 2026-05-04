import { z } from 'zod';

export const travelerTypeSchema = z.enum([
  'solo',
  'couple',
  'friends',
  'family',
]);
export const travelStyleSchema = z.enum(['minimum', 'balanced', 'comfortable']);

export const tripSimulationRequestSchema = z.object({
  destinationId: z.string().min(1),
  destinationCity: z.string().min(1).max(120),
  destinationCountry: z.string().min(1).max(120),
  destinationCountryCode: z.string().max(8).nullable(),
  visaType: z
    .enum(['visa_free', 'evisa', 'on_arrival', 'visa_required'])
    .nullable(),
  arrivalDate: z.string().date(),
  durationDays: z.number().int().min(1).max(30),
  budgetMad: z.number().int().min(100).max(500_000),
  travelerType: travelerTypeSchema,
  travelStyle: travelStyleSchema,
});

export const tripSimulationResultSchema = z.object({
  title: z.string().min(1).max(140),
  destinationCity: z.string().min(1).max(120),
  destinationCountry: z.string().min(1).max(120),
  durationDays: z.number().int().min(1).max(30),
  budgetMad: z.number().int().min(0),
  estimatedDailyBudgetMad: z.number().int().min(0),
  summary: z.string().min(1).max(700),
  budgetWarning: z.string().max(400).nullable(),
  budgetBreakdown: z.object({
    lodgingMad: z.number().int().min(0),
    foodMad: z.number().int().min(0),
    localTransportMad: z.number().int().min(0),
    activitiesMad: z.number().int().min(0),
    bufferMad: z.number().int().min(0),
  }),
  dayPlans: z
    .array(
      z.object({
        day: z.number().int().min(1),
        title: z.string().min(1).max(100),
        morning: z.string().min(1).max(240),
        afternoon: z.string().min(1).max(240),
        evening: z.string().min(1).max(240),
        budgetTip: z.string().min(1).max(220),
      }),
    )
    .min(1)
    .max(30),
  transportTips: z.array(z.string().min(1).max(220)).min(2).max(5),
  foodTips: z.array(z.string().min(1).max(220)).min(2).max(5),
  passportVisaNotes: z.array(z.string().min(1).max(260)).min(2).max(5),
});

export type TravelerType = z.infer<typeof travelerTypeSchema>;
export type TravelStyle = z.infer<typeof travelStyleSchema>;
export type TripSimulationRequest = z.infer<typeof tripSimulationRequestSchema>;
export type TripSimulationResult = z.infer<typeof tripSimulationResultSchema>;
