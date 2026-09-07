export type CircuitSegment = {
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  airline: string;
  stopover: string | null;
  stopoverCity: string | null;
  stopoverDuration: string | null;
  stopoverTips: string | null;
};

export type CircuitDestination = {
  city: string;
  country: string;
  countryCode: string;
  iata: string;
  tips: string[];
  visaType: string;
};

export type CircuitExtraInfo = {
  visasRequired: string[];
  terrestrialLegs: string[];
  tips: string[];
};

export type Circuit = {
  id: string;
  slug: string;
  title: string;
  priceMad: number;
  departureDate: string | null;
  returnDate: string | null;
  isActive: boolean;
  isFeatured: boolean;
  bookingUrl: string | null;
  storyUrl: string | null;
  segments: CircuitSegment[];
  destinations: CircuitDestination[];
  extraInfo: CircuitExtraInfo;
  createdAt: string;
  updatedAt: string;
};
