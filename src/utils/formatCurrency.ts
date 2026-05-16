/**
 * Currency formatting utilities for MiniMax.
 * All monetary values in the app must pass through these functions — no ad-hoc formatting.
 * Uses es-AR locale so separators match Argentine conventions (. for thousands, , for decimals).
 */

const arsInteger = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const arsDecimal = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un número como moneda argentina sin decimales.
 * @param amount - Monto en pesos argentinos
 * @returns Ej: 34000 → "$34.000"
 */
export function formatCurrency(amount: number): string {
  return arsInteger.format(amount);
}

/**
 * Formatea un número como moneda argentina con dos decimales.
 * @param amount - Monto en pesos argentinos
 * @returns Ej: 34000.5 → "$34.000,50"
 */
export function formatCurrencyWithDecimals(amount: number): string {
  return arsDecimal.format(amount);
}
