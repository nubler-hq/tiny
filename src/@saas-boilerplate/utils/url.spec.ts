import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { Url } from './url'

describe('Url', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getUrl', () => {
    it('should use APP_URL when available', () => {
      process.env.APP_URL = 'https://test.com'
      const result = Url.getUrl()
      expect(result).toBe('https://test.com')
    })

    it('should use fallback when APP_URL is not set', () => {
      process.env.APP_URL = undefined
      const result = Url.getUrl()
      expect(result).toBe('http://localhost:3000')
    })

    it('should append path correctly', () => {
      process.env.APP_URL = 'https://test.com'
      const result = Url.getUrl('path/to/resource')
      expect(result).toBe('https://test.com/path/to/resource')
    })

    it('should handle paths with leading slash', () => {
      process.env.APP_URL = 'https://test.com'
      const result = Url.getUrl('/path/to/resource')
      expect(result).toBe('https://test.com/path/to/resource')
    })
  })

  describe('appendQueryParams', () => {
    it('should append query parameters to the URL', () => {
      const result = Url.appendQueryParams('https://example.com', {
        foo: 'bar',
        baz: 'qux',
      })
      expect(result).toBe('https://example.com?foo=bar&baz=qux')
    })

    it('should handle empty query parameters', () => {
      const result = Url.appendQueryParams('https://example.com', {})
      expect(result).toBe('https://example.com?')
    })
  })

  describe('generateUniqueUrl', () => {
    it('should generate a unique URL with a random UUID', () => {
      const baseUrl = 'https://example.com/resource'
      const result = Url.generateUniqueUrl(baseUrl)
      expect(result).toMatch(new RegExp(`^${baseUrl}/[0-9a-fA-F-]{36}$`))
    })
  })

  describe('isAbsoluteUrl', () => {
    it('should return true for absolute URLs', () => {
      expect(Url.isAbsoluteUrl('https://example.com')).toBe(true)
      expect(Url.isAbsoluteUrl('http://example.com')).toBe(true)
      expect(Url.isAbsoluteUrl('//example.com')).toBe(true)
    })

    it('should return false for relative URLs', () => {
      expect(Url.isAbsoluteUrl('/relative/path')).toBe(false)
      expect(Url.isAbsoluteUrl('relative/path')).toBe(false)
    })
  })

  describe('normalizeUrl', () => {
    it('should remove trailing slashes from the URL', () => {
      expect(Url.normalizeUrl('https://example.com/')).toBe(
        'https://example.com',
      )
      expect(Url.normalizeUrl('https://example.com/path/')).toBe(
        'https://example.com/path',
      )
    })

    it('should not alter URLs without trailing slashes', () => {
      expect(Url.normalizeUrl('https://example.com')).toBe(
        'https://example.com',
      )
      expect(Url.normalizeUrl('https://example.com/path')).toBe(
        'https://example.com/path',
      )
    })
  })

  describe('combineUrl', () => {
    it('should combine a base URL with a relative path', () => {
      const result = Url.combineUrl('https://example.com', 'path/to/resource')
      expect(result).toBe('https://example.com/path/to/resource')
    })

    it('should handle base URLs with trailing slashes', () => {
      const result = Url.combineUrl('https://example.com/', 'path/to/resource')
      expect(result).toBe('https://example.com/path/to/resource')
    })

    it('should handle relative paths with leading slashes', () => {
      const result = Url.combineUrl('https://example.com', '/path/to/resource')
      expect(result).toBe('https://example.com/path/to/resource')
    })
  })
})
