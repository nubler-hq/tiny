import { describe, it, expect } from 'vitest'
import { ObjectNavigator } from './object'

describe('ObjectNavigator', () => {
  describe('get', () => {
    it('should return the value of a simple property', () => {
      const obj = { name: 'John', age: 30 }
      expect(ObjectNavigator.get(obj, 'name')).toBe('John')
      expect(ObjectNavigator.get(obj, 'age')).toBe(30)
    })

    it('should return the value of a nested property', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
            details: {
              age: 30,
            },
          },
        },
      }
      expect(ObjectNavigator.get(obj, 'user.profile.name')).toBe('John')
      expect(ObjectNavigator.get(obj, 'user.profile.details.age')).toBe(30)
    })

    it('should return undefined for invalid paths', () => {
      const obj = { name: 'John' }
      // @ts-expect-error Testing invalid path
      expect(ObjectNavigator.get(obj, 'invalid')).toBeUndefined()
      // @ts-expect-error Testing invalid nested path
      expect(ObjectNavigator.get(obj, 'invalid.path')).toBeUndefined()
    })

    it('should handle arrays correctly', () => {
      const obj = {
        users: ['John', 'Jane'],
        data: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
      }
      expect(ObjectNavigator.get(obj, 'users.0')).toBe('John')
      expect(ObjectNavigator.get(obj, 'users.1')).toBe('Jane')
      expect(ObjectNavigator.get(obj, 'data.1.name')).toBe('Jane')
    })

    it('should handle null and undefined values', () => {
      const obj = {
        user: null,
        profile: undefined,
        data: {
          nested: null,
        },
      }
      // @ts-expect-error Testing null path traversal
      expect(ObjectNavigator.get(obj, 'user.name')).toBeUndefined()
      // @ts-expect-error Testing undefined path traversal
      expect(ObjectNavigator.get(obj, 'profile.details')).toBeUndefined()
      // @ts-expect-error Testing null nested path traversal
      expect(ObjectNavigator.get(obj, 'data.nested.value')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing properties', () => {
      const obj = { name: 'John', age: 30 }
      expect(ObjectNavigator.has(obj, 'name')).toBe(true)
      expect(ObjectNavigator.has(obj, 'age')).toBe(true)
    })

    it('should return false for non-existing properties', () => {
      const obj = { name: 'John' }
      // @ts-expect-error Testing non-existent property
      expect(ObjectNavigator.has(obj, 'invalid')).toBe(false)
      // @ts-expect-error Testing non-existent property
      expect(ObjectNavigator.has(obj, 'age')).toBe(false)
    })

    it('should check nested properties correctly', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
          },
        },
      }
      expect(ObjectNavigator.has(obj, 'user.profile.name')).toBe(true)
      // @ts-expect-error Testing non-existent nested property
      expect(ObjectNavigator.has(obj, 'user.profile.age')).toBe(false)
    })

    it('should handle null and undefined values', () => {
      const obj = {
        user: null,
        profile: undefined,
      }
      // @ts-expect-error Testing null path traversal
      expect(ObjectNavigator.has(obj, 'user.name')).toBe(false)
      // @ts-expect-error Testing undefined path traversal
      expect(ObjectNavigator.has(obj, 'profile.details')).toBe(false)
    })
  })

  describe('set', () => {
    it('should set value for simple properties', () => {
      const obj = { name: 'John' }
      // @ts-expect-error Testing setting new property
      const result = ObjectNavigator.set(obj, 'age', 30)
      expect(result as any).toHaveProperty('age', 30)
      expect(result.name).toBe('John') // preserves existing properties
    })

    it('should set value for nested properties', () => {
      const obj = { user: { name: 'John' } }
      // @ts-expect-error Testing setting nested property
      const result = ObjectNavigator.set(obj, 'user.age', 30)
      expect((result as any).user).toHaveProperty('age', 30)
      expect(result.user.name).toBe('John') // preserves existing nested properties
    })

    it('should create nested objects if they dont exist', () => {
      const obj = {}
      // @ts-expect-error Testing creating nested objects
      const result = ObjectNavigator.set(obj, 'user.profile.name', 'John')
      expect((result as any).user.profile.name).toBe('John')
    })

    it('should handle arrays correctly', () => {
      const obj = { users: ['John'] }
      // @ts-expect-error Testing array manipulation
      const result = ObjectNavigator.set(obj, 'users.1', 'Jane')
      expect(result.users[0]).toBe('John') // preserves existing array elements
      expect(result.users[1]).toBe('Jane')
    })

    it('should preserve object immutability', () => {
      const obj = { user: { name: 'John' } }
      // @ts-expect-error Testing object immutability
      const result = ObjectNavigator.set(obj, 'user.age', 30)

      // Original object should not be modified
      expect(obj.user).not.toHaveProperty('age')
      expect((result as any).user).toHaveProperty('age', 30)
    })

    it('should handle null and undefined values', () => {
      const obj = {
        user: null,
        profile: undefined,
      }
      // @ts-expect-error Testing null/undefined handling
      const result = ObjectNavigator.set(obj, 'user.name', 'John')
      expect((result as any).user.name).toBe('John')
    })
  })
})
