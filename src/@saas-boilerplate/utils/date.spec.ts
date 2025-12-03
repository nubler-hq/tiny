import { describe, it, expect } from 'vitest'
import { DateUtils } from './date'

describe('DateUtils', () => {
  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = DateUtils.parseDate('2023-12-25')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2023)
    })

    it('should parse valid timestamp', () => {
      const timestamp = 1703462400000 // 2023-12-25
      const result = DateUtils.parseDate(timestamp)
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2023)
    })

    it('should return null for invalid date', () => {
      const result = DateUtils.parseDate('invalid-date')
      expect(result).toBeNull()
    })

    it('should return null for null/undefined', () => {
      expect(DateUtils.parseDate(null)).toBeNull()
      expect(DateUtils.parseDate(undefined)).toBeNull()
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = DateUtils.formatDate('2023-12-25')
      expect(result).toBe('Dec 25, 2023')
    })

    it('should return empty string for invalid date', () => {
      const result = DateUtils.formatDate('invalid-date')
      expect(result).toBe('')
    })

    it('should accept custom options', () => {
      const result = DateUtils.formatDate('2023-12-25', {
        month: 'long',
        year: 'numeric',
      })
      expect(result).toBe('December 2023')
    })
  })

  describe('toISOStringSafe', () => {
    it('should convert valid date to ISO string', () => {
      const result = DateUtils.toISOStringSafe('2023-12-25')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should return current date ISO for invalid date', () => {
      const result = DateUtils.toISOStringSafe('invalid-date')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('isPast', () => {
    it('should return true for past date', () => {
      const result = DateUtils.isPast('2020-01-01')
      expect(result).toBe(true)
    })

    it('should return false for future date', () => {
      const result = DateUtils.isPast('2030-01-01')
      expect(result).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('should return true for future date', () => {
      const result = DateUtils.isFuture('2030-01-01')
      expect(result).toBe(true)
    })

    it('should return false for past date', () => {
      const result = DateUtils.isFuture('2020-01-01')
      expect(result).toBe(false)
    })
  })

  describe('getRelativeTime', () => {
    it('should return "today" for current date', () => {
      const today = new Date().toISOString().split('T')[0]
      const result = DateUtils.getRelativeTime(today)
      expect(result).toBe('today')
    })

    it('should return relative time for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)
      const result = DateUtils.getRelativeTime(pastDate)
      expect(result).toContain('ago')
    })

    it('should return relative time for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3)
      const result = DateUtils.getRelativeTime(futureDate)
      expect(result).toBe('3 days')
    })
  })
})
