import { useCallback } from 'react';

import { useRates } from '@/api/queries';
import { useSettings } from '@/stores/settings';

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'TWD', name: 'Taiwan Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'ILS', name: 'Israeli Shekel' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'CLP', name: 'Chilean Peso' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'UAH', name: 'Ukrainian Hryvnia' },
  { code: 'RUB', name: 'Russian Ruble' },
] as const;

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: string) {
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat(undefined, { style: 'currency', currency });
    formatters.set(currency, f);
  }
  return f;
}

/**
 * Returns a function that converts a USD price into the selected currency and formats it.
 * Falls back to USD while rates are loading or if the selected currency has no rate.
 */
export function useFormatPrice() {
  const currency = useSettings(state => state.currency);
  const { data: rates } = useRates();
  // Prices are in USD. Rates come from Fixer and may be based on EUR, so normalise by the USD rate.
  const usdRate = rates?.USD?.exchangeRate ?? 1;
  const targetRate = rates?.[currency]?.exchangeRate;
  const rate = currency === 'USD' ? 1 : targetRate && targetRate / usdRate;
  const code = rate ? currency : 'USD';

  return useCallback((usd: number | null | undefined) => {
    if (usd === null || usd === undefined || Number.isNaN(usd)) {
      return '—';
    }
    return formatter(code).format(usd * (rate ?? 1));
  }, [ code, rate ]);
}
