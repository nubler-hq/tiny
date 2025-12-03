import { describe, expect, it } from 'vitest'

import { Validate } from './validate'

describe('Validate', () => {
  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(Validate.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(
        true,
      )
      expect(Validate.isValidUUID('987fcdeb-51a2-3456-789a-bcdef0123456')).toBe(
        true,
      )
    })

    it('should reject invalid UUIDs', () => {
      expect(Validate.isValidUUID('invalid-uuid')).toBe(false)
      expect(Validate.isValidUUID('')).toBe(false)
    })
  })

  describe('isObjectFullFilled', () => {
    it('should validate fully filled objects', () => {
      const obj = { name: 'John', age: 30, email: 'john@example.com' }
      expect(Validate.isObjectFullFilled(obj)).toBe(true)
    })

    it('should reject objects with empty values', () => {
      const obj = { name: 'John', age: null, email: '' }
      expect(Validate.isObjectFullFilled(obj)).toBe(false)
    })

    it('should handle ignored properties', () => {
      const obj = { name: 'John', age: null, email: 'john@example.com' }
      expect(Validate.isObjectFullFilled(obj, ['age'])).toBe(true)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(Validate.isValidEmail('test@example.com')).toBe(true)
      expect(Validate.isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(Validate.isValidEmail('user+label@domain.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(Validate.isValidEmail('invalid.email')).toBe(false)
      expect(Validate.isValidEmail('@domain.com')).toBe(false)
      expect(Validate.isValidEmail('user@')).toBe(false)
      expect(Validate.isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate Brazilian phone numbers with different formats', () => {
      // Brazilian numbers with different formats
      expect(Validate.isValidPhone('+55 11 99999-9999')).toBe(true)
      expect(Validate.isValidPhone('11 99999-9999')).toBe(true)
      expect(Validate.isValidPhone('11999999999')).toBe(true)
      expect(Validate.isValidPhone('(11) 99999-9999')).toBe(true)
      expect(Validate.isValidPhone('(11)99999-9999')).toBe(true)
      expect(Validate.isValidPhone('+5511999999999')).toBe(true)
    })

    it('should validate international phone numbers', () => {
      // International numbers with different formats
      expect(Validate.isValidPhone('+1 555-123-4567')).toBe(true)
      expect(Validate.isValidPhone('+44 20 7123 4567')).toBe(true)
      expect(Validate.isValidPhone('+861234567890')).toBe(true)
      expect(Validate.isValidPhone('001-555-123-4567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      // Invalid formats
      expect(Validate.isValidPhone('123')).toBe(false) // Too short
      expect(Validate.isValidPhone('abcdefghijk')).toBe(false) // Only letters
      expect(Validate.isValidPhone('')).toBe(false) // Empty
      expect(Validate.isValidPhone('++55(11)99999-9999')).toBe(false) // Extra symbols
      expect(Validate.isValidPhone('11 9999-999')).toBe(false) // Incomplete
      expect(Validate.isValidPhone('11 ABCD-EFGH')).toBe(false) // With letters
      expect(Validate.isValidPhone('11 *****-****')).toBe(false) // With special characters
    })

    it('should validate landline phone numbers', () => {
      // Landline phones with different formats
      expect(Validate.isValidPhone('+55 11 3333-3333')).toBe(true)
      expect(Validate.isValidPhone('11 3333-3333')).toBe(true)
      expect(Validate.isValidPhone('1133333333')).toBe(true)
      expect(Validate.isValidPhone('(11) 3333-3333')).toBe(true)
    })
  })

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(Validate.isStrongPassword('Test123#')).toBe(true)
      expect(Validate.isStrongPassword('StrongP@ss1')).toBe(true)
      expect(Validate.isStrongPassword('Complex1ty!')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(Validate.isStrongPassword('weak')).toBe(false)
      expect(Validate.isStrongPassword('12345678')).toBe(false)
      expect(Validate.isStrongPassword('onlyletters')).toBe(false)
      expect(Validate.isStrongPassword('')).toBe(false)
    })
  })

  describe('isValidURL', () => {
    it('should validate correct URLs', () => {
      expect(Validate.isValidURL('https://example.com')).toBe(true)
      expect(Validate.isValidURL('http://sub.domain.com/path')).toBe(true)
      expect(Validate.isValidURL('example.com')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(Validate.isValidURL('not-a-url')).toBe(false)
      expect(Validate.isValidURL('')).toBe(false)
    })
  })

  describe('isInRange', () => {
    it('should validate numbers within range', () => {
      expect(Validate.isInRange(5, 0, 10)).toBe(true)
      expect(Validate.isInRange(0, 0, 10)).toBe(true)
      expect(Validate.isInRange(10, 0, 10)).toBe(true)
    })

    it('should reject numbers out of range', () => {
      expect(Validate.isInRange(-1, 0, 10)).toBe(false)
      expect(Validate.isInRange(11, 0, 10)).toBe(false)
    })
  })

  describe('hasValidLength', () => {
    it('should validate strings with correct length', () => {
      expect(Validate.hasValidLength('test', 1, 5)).toBe(true)
      expect(Validate.hasValidLength('test', 4, 4)).toBe(true)
    })

    it('should reject strings with incorrect length', () => {
      expect(Validate.hasValidLength('test', 5, 10)).toBe(false)
      expect(Validate.hasValidLength('', 1, 5)).toBe(false)
    })
  })

  describe('isValidCPF', () => {
    it('should validate correct CPFs', () => {
      // Valid CPFs with correct check digits
      expect(Validate.isValidCPF('529.982.247-25')).toBe(true)
      expect(Validate.isValidCPF('248.438.034-80')).toBe(true)
    })

    it('should reject invalid CPFs', () => {
      // CPFs with repeated digits
      expect(Validate.isValidCPF('111.111.111-11')).toBe(false)
      expect(Validate.isValidCPF('000.000.000-00')).toBe(false)

      // CPFs with incorrect check digits
      expect(Validate.isValidCPF('529.982.247-26')).toBe(false)
      expect(Validate.isValidCPF('248.438.034-81')).toBe(false)

      // Invalid formats
      expect(Validate.isValidCPF('52998224725')).toBe(false) // Without formatting
      expect(Validate.isValidCPF('529.982.247')).toBe(false) // Incomplete
    })
  })

  describe('isValidCNPJ', () => {
    it('should validate correct CNPJs', () => {
      // Valid CNPJs with correct check digits
      expect(Validate.isValidCNPJ('11.444.777/0001-61')).toBe(true)
      expect(Validate.isValidCNPJ('27.865.757/0001-02')).toBe(true)
    })

    it('should reject invalid CNPJs', () => {
      // CNPJs with repeated digits
      expect(Validate.isValidCNPJ('11.111.111/1111-11')).toBe(false)
      expect(Validate.isValidCNPJ('00.000.000/0000-00')).toBe(false)

      // CNPJs with incorrect check digits
      expect(Validate.isValidCNPJ('11.444.777/0001-62')).toBe(false)
      expect(Validate.isValidCNPJ('27.865.757/0001-03')).toBe(false)

      // Invalid formats
      expect(Validate.isValidCNPJ('27865757000102')).toBe(false) // Without formatting
      expect(Validate.isValidCNPJ('27.865.757/0001')).toBe(false) // Incomplete
    })
  })

  describe('isValidCEP', () => {
    it('should validate correct CEPs', () => {
      expect(Validate.isValidCEP('12345-678')).toBe(true)
      expect(Validate.isValidCEP('00000-000')).toBe(true)
    })

    it('should reject invalid CEPs', () => {
      expect(Validate.isValidCEP('1234-567')).toBe(false)
      expect(Validate.isValidCEP('12345678')).toBe(false)
      expect(Validate.isValidCEP('')).toBe(false)
    })
  })

  describe('arrayEvery and arraySome', () => {
    const numbers = [2, 4, 6, 8]
    const mixed = [2, 3, 4, 5]

    it('should validate conditions for all elements', () => {
      expect(Validate.arrayEvery(numbers, (n) => n % 2 === 0)).toBe(true)
      expect(Validate.arrayEvery(mixed, (n) => n % 2 === 0)).toBe(false)
    })

    it('should validate conditions for some elements', () => {
      expect(Validate.arraySome(mixed, (n) => n % 2 === 0)).toBe(true)
      expect(Validate.arraySome(numbers, (n) => n % 2 !== 0)).toBe(false)
    })
  })

  describe('date validations', () => {
    it('should validate dates within a range', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-12-31')
      const date = new Date('2023-06-15')
      const outside = new Date('2024-01-01')

      expect(Validate.isDateBetween(date, start, end)).toBe(true)
      expect(Validate.isDateBetween(outside, start, end)).toBe(false)
    })

    it('should validate future dates', () => {
      const future = new Date()
      future.setFullYear(future.getFullYear() + 1)
      const past = new Date()
      past.setFullYear(past.getFullYear() - 1)

      expect(Validate.isDateInFuture(future)).toBe(true)
      expect(Validate.isDateInFuture(past)).toBe(false)
    })

    it('should validate past dates', () => {
      const future = new Date()
      future.setFullYear(future.getFullYear() + 1)
      const past = new Date()
      past.setFullYear(past.getFullYear() - 1)

      expect(Validate.isDateInPast(past)).toBe(true)
      expect(Validate.isDateInPast(future)).toBe(false)
    })
  })
})
