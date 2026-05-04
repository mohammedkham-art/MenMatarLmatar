export type CurrencyCode = 'MAD' | 'EUR' | 'USD' | 'GBP';

export type CurrencyConversionParams = {
  amount: number;
  from: CurrencyCode;
  to: CurrencyCode;
};

export type CurrencyConversion = {
  amount: number;
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  convertedAmount: number;
};
