/**
 * A utility class for handling currency-related operations.
 * Provides methods for formatting, converting, and calculating currency values.
 *
 * @remarks
 * This class handles currency operations with precision, using cents as the base unit
 * to avoid floating-point arithmetic issues. It supports multiple currencies and locales
 * through the Intl.NumberFormat API.
 */
export class Currency {
  /**
   * Formats a cents amount into a localized currency string.
   *
   * @param cents - The amount in cents to format
   * @param options - Configuration options for currency formatting
   * @param options.currency - The ISO 4217 currency code (default: 'USD')
   * @param options.locale - The locale to use for formatting (default: 'en-US')
   * @returns A formatted currency string
   *
   * @example
   * ```typescript
   * Currency.formatCurrency(1099); // '$10.99'
   * Currency.formatCurrency(1099, { currency: 'EUR', locale: 'de-DE' }); // '10,99 €'
   * Currency.formatCurrency(1000, { currency: 'JPY' }); // '¥1,000'
   * ```
   */
  static formatCurrency(
    cents: number,
    options: { currency?: string; locale?: string } = {},
  ): string {
    const { currency = 'USD', locale = 'en-US' } = options

    const amount = currency === 'JPY' ? cents : this.centsToAmount(cents)

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    })
      .format(amount)
      .replace(/\u00A0/g, ' ') // Substitui espaços não separáveis por espaços normais
  }

  /**
   * Formats a number with thousands separators without decimal places.
   *
   * @param value - The number to format
   * @returns A formatted string with thousands separators
   *
   * @example
   * ```typescript
   * Currency.formatNumber(1000000); // '1,000,000'
   * Currency.formatNumber(1234567); // '1,234,567'
   * ```
   */
  static formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value)
  }

  /**
   * Converts an amount in cents to its decimal representation.
   *
   * @param cents - The amount in cents to convert
   * @returns The decimal amount
   *
   * @example
   * ```typescript
   * Currency.centsToAmount(1099); // 10.99
   * Currency.centsToAmount(50000); // 500.00
   * ```
   */
  static centsToAmount(cents: number): number {
    return cents / 100
  }

  /**
   * Converts a decimal amount to cents.
   *
   * @param amount - The decimal amount to convert
   * @returns The amount in cents, rounded to the nearest integer
   *
   * @example
   * ```typescript
   * Currency.amountToCents(10.99); // 1099
   * Currency.amountToCents(500.00); // 50000
   * ```
   */
  static amountToCents(amount: number): number {
    return Math.round(amount * 100)
  }

  /**
   * Adds two numbers with fixed decimal precision to avoid floating-point errors.
   *
   * @param a - First number to add
   * @param b - Second number to add
   * @returns The sum with two decimal places precision
   *
   * @example
   * ```typescript
   * Currency.add(0.1, 0.2); // 0.3
   * Currency.add(10.99, 5.01); // 16.00
   * ```
   */
  static add(a: number, b: number): number {
    return Number((a + b).toFixed(2))
  }

  /**
   * Subtracts two numbers with fixed decimal precision to avoid floating-point errors.
   *
   * @param a - Number to subtract from
   * @param b - Number to subtract
   * @returns The difference with two decimal places precision
   *
   * @example
   * ```typescript
   * Currency.subtract(10.00, 5.50); // 4.50
   * Currency.subtract(100.00, 0.01); // 99.99
   * ```
   */
  static subtract(a: number, b: number): number {
    return Number((a - b).toFixed(2))
  }

  /**
   * Converts a decimal value to a percentage string.
   *
   * @param value - The decimal value to convert (e.g., 0.15 for 15%)
   * @param decimals - Number of decimal places to show (default: 0)
   * @returns A formatted percentage string
   *
   * @example
   * ```typescript
   * Currency.toPercentage(0.156); // '16%'
   * Currency.toPercentage(0.156, 1); // '15.6%'
   * ```
   */
  static toPercentage(value: number, decimals: number = 0): string {
    return `${(value * 100).toFixed(decimals)}%`
  }
}
