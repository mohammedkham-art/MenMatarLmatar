import type {
  TripSimulationRequest,
  TripSimulationResult,
} from '@/lib/validators/simulator';

export type GenerateTripPlanParams = TripSimulationRequest;
export type TripPlan = TripSimulationResult;
