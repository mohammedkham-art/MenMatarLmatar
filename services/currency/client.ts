import type {
  CurrencyConversion,
  CurrencyConversionParams,
} from '@/services/currency/types';

export async function convertCurrency(
  params: CurrencyConversionParams,
): Promise<CurrencyConversion> {
  return {
    ...params,
    rate: 1,
    convertedAmount: params.amount,
  };
}
