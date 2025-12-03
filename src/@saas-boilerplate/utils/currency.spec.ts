import { describe, expect, it } from 'vitest'

import { Currency } from './currency'

describe('Currency', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(
        Currency.formatCurrency(1000, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$10.00')
      expect(
        Currency.formatCurrency(1999, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$19.99')
      expect(
        Currency.formatCurrency(500, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$5.00')
    })

    it('should format EUR currency correctly', () => {
      expect(
        Currency.formatCurrency(1000, { currency: 'EUR', locale: 'de-DE' }),
      ).toBe('10,00 €')
      expect(
        Currency.formatCurrency(1999, { currency: 'EUR', locale: 'de-DE' }),
      ).toBe('19,99 €')
      expect(
        Currency.formatCurrency(500, { currency: 'EUR', locale: 'de-DE' }),
      ).toBe('5,00 €')
    })

    it('should format GBP currency correctly', () => {
      expect(
        Currency.formatCurrency(1000, { currency: 'GBP', locale: 'en-US' }),
      ).toBe('£10.00')
      expect(
        Currency.formatCurrency(1999, { currency: 'GBP', locale: 'en-US' }),
      ).toBe('£19.99')
    })

    it('should format JPY currency correctly', () => {
      expect(
        Currency.formatCurrency(1000, { currency: 'JPY', locale: 'ja-JP' }),
      ).toBe('￥1,000')
      expect(
        Currency.formatCurrency(1999, { currency: 'JPY', locale: 'ja-JP' }),
      ).toBe('￥1,999')
    })

    it('should format BRL currency correctly', () => {
      expect(
        Currency.formatCurrency(1000, { currency: 'BRL', locale: 'pt-BR' }),
      ).toBe('R$ 10,00')
      expect(
        Currency.formatCurrency(1999, { currency: 'BRL', locale: 'pt-BR' }),
      ).toBe('R$ 19,99')
    })

    it('should handle different locales with same currency', () => {
      expect(
        Currency.formatCurrency(1000, { currency: 'USD', locale: 'pt-BR' }),
      ).toBe('US$ 10,00')
      expect(
        Currency.formatCurrency(1000, { currency: 'USD', locale: 'de-DE' }),
      ).toBe('10,00 $')
      expect(
        Currency.formatCurrency(1000, { currency: 'USD', locale: 'ja-JP' }),
      ).toBe('$10.00')
    })

    it('should handle fractional cents correctly', () => {
      expect(
        Currency.formatCurrency(100.5, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$1.01')
      expect(
        Currency.formatCurrency(100.1, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$1.00')
      expect(
        Currency.formatCurrency(199.5, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$2.00')
    })

    it('should handle negative amounts', () => {
      expect(
        Currency.formatCurrency(-1000, { currency: 'USD', locale: 'en-US' }),
      ).toBe('-$10.00')
      expect(
        Currency.formatCurrency(-1999, { currency: 'EUR', locale: 'de-DE' }),
      ).toBe('-19,99 €')
      expect(
        Currency.formatCurrency(-500, { currency: 'GBP', locale: 'en-US' }),
      ).toBe('-£5.00')
    })

    it('should handle zero amounts', () => {
      expect(
        Currency.formatCurrency(0, { currency: 'USD', locale: 'en-US' }),
      ).toBe('$0.00')
      expect(
        Currency.formatCurrency(0, { currency: 'EUR', locale: 'de-DE' }),
      ).toBe('0,00 €')
      expect(
        Currency.formatCurrency(0, { currency: 'GBP', locale: 'en-US' }),
      ).toBe('£0.00')
    })

    it('should handle very large amounts', () => {
      expect(
        Currency.formatCurrency(1000000, {
          currency: 'USD',
          locale: 'en-US',
        }),
      ).toBe('$10,000.00')
      expect(
        Currency.formatCurrency(1000000000, {
          currency: 'EUR',
          locale: 'de-DE',
        }),
      ).toBe('10.000.000,00 €')
    })
  })

  describe('formatNumber', () => {
    it('should format whole numbers correctly', () => {
      expect(Currency.formatNumber(1000)).toBe('1,000')
      expect(Currency.formatNumber(1000000)).toBe('1,000,000')
      expect(Currency.formatNumber(0)).toBe('0')
    })

    it('should format decimal numbers correctly', () => {
      expect(Currency.formatNumber(1234.56)).toBe('1,235')
      expect(Currency.formatNumber(9999.99)).toBe('10,000')
    })

    it('should format negative numbers correctly', () => {
      expect(Currency.formatNumber(-1000)).toBe('-1,000')
      expect(Currency.formatNumber(-1234.56)).toBe('-1,235')
    })
  })

  describe('centsToAmount', () => {
    it('should convert cents to amount correctly', () => {
      expect(Currency.centsToAmount(1000)).toBe(10)
      expect(Currency.centsToAmount(1999)).toBe(19.99)
      expect(Currency.centsToAmount(500)).toBe(5)
    })
  })

  describe('amountToCents', () => {
    it('should convert amount to cents correctly', () => {
      expect(Currency.amountToCents(10)).toBe(1000)
      expect(Currency.amountToCents(19.99)).toBe(1999)
      expect(Currency.amountToCents(5)).toBe(500)
    })
  })

  describe('add', () => {
    it('should add two amounts correctly', () => {
      expect(Currency.add(10, 5)).toBe(15)
      expect(Currency.add(19.99, 0.01)).toBe(20)
      expect(Currency.add(5, -5)).toBe(0)
    })
  })

  describe('subtract', () => {
    it('should subtract two amounts correctly', () => {
      expect(Currency.subtract(10, 5)).toBe(5)
      expect(Currency.subtract(20, 0.01)).toBe(19.99)
      expect(Currency.subtract(5, 5)).toBe(0)
    })
  })

  describe('toPercentage', () => {
    it('should convert value to percentage correctly', () => {
      expect(Currency.toPercentage(0.5)).toBe('50%')
      expect(Currency.toPercentage(0.123, 1)).toBe('12.3%')
      expect(Currency.toPercentage(1)).toBe('100%')
    })
  })
})
