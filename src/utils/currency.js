import { useCurrency } from '../contexts/CurrencyContext'

/**
 * Format a USD amount in the chosen display currency.
 * @param {number} usd - amount in USD
 * @param {string} currency - 'USD' or 'INR'
 * @param {number} usdToInr - current exchange rate
 */
export function formatCurrency(usd, currency, usdToInr) {
  if (usd == null || isNaN(usd)) return ''

  if (currency === 'INR') {
    const inr = usd * usdToInr
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inr)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd)
}

export function useFormattedCurrency() {
  const { currency, usdToInr } = useCurrency()
  return (usd) => formatCurrency(usd, currency, usdToInr)
}

/**
 * Format a monetary value in the display currency.
 *
 * Two modes:
 *   - capturedRate provided: `amount` is in USD; convert using capturedRate (historical accuracy).
 *   - capturedRate omitted:  `amount` is already in display currency; format as-is.
 *
 * Use this (not formatCurrency) when the value was already converted, OR when you want
 * to use a specific historical rate instead of the live cached rate.
 */
export function formatDisplayAmount(amount, currency, capturedRate = null) {
  if (amount == null || isNaN(amount)) return ''
  const display = (capturedRate != null && currency === 'INR')
    ? Math.round(amount * capturedRate)
    : amount
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(display)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(display)
}
