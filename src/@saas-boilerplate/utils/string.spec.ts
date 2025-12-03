import { describe, expect, it } from 'vitest'

import { String } from './string'

describe('String Utility Functions', () => {
  it('should capitalize each word in a string', () => {
    expect(String.capitalize('hello world')).toBe('Hello World')
    expect(String.capitalize('HELLO WORLD')).toBe('Hello World')
  })

  it('should convert a string to camelCase', () => {
    expect(String.toCamelCase('hello world')).toBe('helloWorld')
    expect(String.toCamelCase('Hello World')).toBe('helloWorld')
  })

  it('should convert a string to snake_case', () => {
    expect(String.toSnakeCase('hello world')).toBe('hello_world')
    expect(String.toSnakeCase('HelloWorld')).toBe('hello_world')
  })

  it('should convert a string to kebab-case', () => {
    expect(String.toKebabCase('hello world')).toBe('hello-world')
    expect(String.toKebabCase('HelloWorld')).toBe('hello-world')
  })

  it('should check if a string is a palindrome', () => {
    expect(String.isPalindrome('racecar')).toBe(true)
    expect(String.isPalindrome('hello')).toBe(false)
  })

  it('should truncate a string to a specified length and add an ellipsis if needed', () => {
    expect(String.truncate('hello world', 5)).toBe('hello...')
    expect(String.truncate('hello', 10)).toBe('hello')
  })

  it('should capitalize the first character of a string', () => {
    expect(String.capitalizeFirst('hello')).toBe('Hello')
    expect(String.capitalizeFirst('Hello')).toBe('Hello')
  })

  it('should decapitalize the first character of a string', () => {
    expect(String.decapitalizeFirst('Hello')).toBe('hello')
    expect(String.decapitalizeFirst('hello')).toBe('hello')
  })

  it('should replace all occurrences of a substring within a string', () => {
    expect(String.replaceAll('hello world', 'world', 'there')).toBe(
      'hello there',
    )
    expect(String.replaceAll('hello world world', 'world', 'there')).toBe(
      'hello there there',
    )
  })

  it('should format category slugs to human-readable labels', () => {
    expect(String.formatCategoryLabel('account-management')).toBe(
      'Account Management',
    )
    expect(String.formatCategoryLabel('api-keys')).toBe('Api Keys')
    expect(String.formatCategoryLabel('getting-started')).toBe(
      'Getting Started',
    )
    expect(String.formatCategoryLabel('billing')).toBe('Billing')
    expect(String.formatCategoryLabel('')).toBe('')
  })
})
