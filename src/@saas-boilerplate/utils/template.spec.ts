import { describe, expect, it } from 'vitest'

import { Template } from './template'

describe('Template', () => {
  describe('interpolate', () => {
    it('should interpolate a template string with provided data', () => {
      const result = Template.interpolate('Hello {{name}}!', { name: 'John' })
      expect(result).toBe('Hello John!')
    })

    it('should return undefined for empty template string', () => {
      const result = Template.interpolate('', { name: 'John' })
      expect(result).toBeUndefined()
    })

    it('should handle multiple interpolations', () => {
      const result = Template.interpolate(
        '{{greeting}} {{name}}! Age: {{age}}',
        { greeting: 'Hi', name: 'John', age: 30 },
      )
      expect(result).toBe('Hi John! Age: 30')
    })
  })

  describe('interpolateObject', () => {
    it('should interpolate nested object properties', () => {
      const template = {
        greeting: 'Hello {{name}}!',
        info: {
          age: 'Age: {{age}}',
          location: 'Location: {{location}}',
        },
      }
      const data = { name: 'John', age: 30, location: 'NYC' }

      const result = Template.interpolateObject(template, data)

      expect(result).toEqual({
        greeting: 'Hello John!',
        info: {
          age: 'Age: 30',
          location: 'Location: NYC',
        },
      })
    })

    it('should return empty object for empty template', () => {
      const result = Template.interpolateObject({}, { name: 'John' })
      expect(result).toEqual({})
    })

    it('should handle non-string values', () => {
      const template = {
        name: '{{name}}',
        age: 30,
        active: true,
      }
      const result = Template.interpolateObject(template, { name: 'John' })
      expect(result).toEqual({
        name: 'John',
        age: 30,
        active: true,
      })
    })
  })

  describe('interpolateArray', () => {
    it('should interpolate an array of templates', () => {
      const templates = [
        'Hello {{name}}!',
        '{{greeting}} {{name}}',
        'Age: {{age}}',
      ]
      const data = { name: 'John', greeting: 'Hi', age: 30 }

      const result = Template.interpolateArray(templates, data)

      expect(result).toEqual(['Hello John!', 'Hi John', 'Age: 30'])
    })

    it('should handle empty templates in array', () => {
      const templates = ['', 'Hello {{name}}!']
      const result = Template.interpolateArray(templates, { name: 'John' })
      expect(result).toEqual(['', 'Hello John!'])
    })
  })

  describe('compileTemplate', () => {
    it('should return a function that interpolates data', () => {
      const compiled = Template.compileTemplate('Hello {{name}}!')
      const result = compiled({ name: 'John' })
      expect(result).toBe('Hello John!')
    })

    it('should handle multiple calls with different data', () => {
      const compiled = Template.compileTemplate('{{greeting}} {{name}}!')

      expect(compiled({ greeting: 'Hi', name: 'John' })).toBe('Hi John!')
      expect(compiled({ greeting: 'Hello', name: 'Jane' })).toBe('Hello Jane!')
    })
  })

  describe('interpolateAndEscape', () => {
    it('should interpolate and escape HTML in template string', () => {
      const text = 'Hello {{name}}! {{-html}}'
      const data = {
        name: 'John',
        html: '<script>alert("xss")</script>',
      }

      const result = Template.interpolateAndEscape(text, data)

      expect(result).toBe(
        'Hello John! &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      )
    })

    it('should return undefined for empty template string', () => {
      const result = Template.interpolateAndEscape('', { name: 'John' })
      expect(result).toBeUndefined()
    })

    it('should handle regular interpolation along with escaped content', () => {
      const text = '{{normal}} {{-escaped}}'
      const data = {
        normal: 'Hello',
        escaped: '<b>World</b>',
      }

      const result = Template.interpolateAndEscape(text, data)

      expect(result).toBe('Hello &lt;b&gt;World&lt;/b&gt;')
    })
  })
})
