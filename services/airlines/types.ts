export type AirlineFare = {
  id: string;
  airlineId: string;
  fareName: string;
  personalItem: boolean;
  personalItemDimensions: string | null;
  cabinAllowed: boolean;
  cabinWeightKg: number | null;
  cabinDimensions: string | null;
  checkedAllowed: boolean;
  checkedWeightKg: number | null;
  checkedCount: number;
};

export type Airline = {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  fares: AirlineFare[];
};
