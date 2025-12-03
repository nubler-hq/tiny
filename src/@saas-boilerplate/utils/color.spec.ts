import { describe, expect, it } from 'vitest'
import { Color } from './color'

describe('Color', () => {
  describe('hexToHsl', () => {
    it('should convert white hex to HSL', () => {
      expect(Color.hexToHsl('#FFFFFF')).toBe('0, 0%, 100%')
    })

    it('should convert black hex to HSL', () => {
      expect(Color.hexToHsl('#000000')).toBe('0, 0%, 0%')
    })

    it('should convert red hex to HSL', () => {
      expect(Color.hexToHsl('#FF0000')).toBe('0, 100%, 50%')
    })

    it('should convert hex without # to HSL', () => {
      expect(Color.hexToHsl('FF0000')).toBe('0, 100%, 50%')
    })
  })

  describe('rgbToHex', () => {
    it('should convert white RGB to hex', () => {
      expect(Color.rgbToHex(255, 255, 255)).toBe('#ffffff')
    })

    it('should convert black RGB to hex', () => {
      expect(Color.rgbToHex(0, 0, 0)).toBe('#000000')
    })

    it('should convert red RGB to hex', () => {
      expect(Color.rgbToHex(255, 0, 0)).toBe('#ff0000')
    })

    it('should pad single digit hex values with 0', () => {
      expect(Color.rgbToHex(0, 10, 0)).toBe('#000a00')
    })
  })

  describe('hslToHex', () => {
    it('should convert white HSL to hex', () => {
      expect(Color.hslToHex(0, 0, 100)).toBe('#ffffff')
    })

    it('should convert black HSL to hex', () => {
      expect(Color.hslToHex(0, 0, 0)).toBe('#000000')
    })

    it('should convert red HSL to hex', () => {
      expect(Color.hslToHex(0, 100, 50)).toBe('#ff0000')
    })

    it('should convert green HSL to hex', () => {
      expect(Color.hslToHex(120, 100, 50)).toBe('#00ff00')
    })
  })

  describe('hexToRgb', () => {
    it('should convert white hex to RGB', () => {
      expect(Color.hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should convert black hex to RGB', () => {
      expect(Color.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('should convert red hex to RGB', () => {
      expect(Color.hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should convert hex without # to RGB', () => {
      expect(Color.hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    })
  })

  describe('rgbToHsl', () => {
    it('should convert white RGB to HSL', () => {
      expect(Color.rgbToHsl(255, 255, 255)).toBe('0, 0%, 100%')
    })

    it('should convert black RGB to HSL', () => {
      expect(Color.rgbToHsl(0, 0, 0)).toBe('0, 0%, 0%')
    })

    it('should convert red RGB to HSL', () => {
      expect(Color.rgbToHsl(255, 0, 0)).toBe('0, 100%, 50%')
    })

    it('should convert green RGB to HSL', () => {
      expect(Color.rgbToHsl(0, 255, 0)).toBe('120, 100%, 50%')
    })

    it('should convert blue RGB to HSL', () => {
      expect(Color.rgbToHsl(0, 0, 255)).toBe('240, 100%, 50%')
    })
  })
})
