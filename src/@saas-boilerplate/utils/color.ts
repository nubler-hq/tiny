/**
 * Utility class for color conversions between HEX, RGB, and HSL formats.
 */
export class Color {
  /**
   * Converts a HEX color string to an HSL color string.
   *
   * @param hex - The HEX color string (e.g., "#ff0000").
   * @returns The HSL color string (e.g., "0, 100%, 50%").
   *
   * @example
   * ```typescript
   * const hsl = Color.hexToHsl("#ff0000");
   * console.log(hsl);
   * ```
   */
  static hexToHsl(hex: string): string {
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }

    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return this.rgbToHsl(r, g, b)
  }

  /**
   * Converts RGB color values to a HEX color string.
   *
   * @param r - The red component (0-255).
   * @param g - The green component (0-255).
   * @param b - The blue component (0-255).
   * @returns The HEX color string (e.g., "#ff0000").
   *
   * @example
   * ```typescript
   * const hex = Color.rgbToHex(255, 0, 0);
   * console.log(hex);
   * ```
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`
  }

  /**
   * Converts HSL color values to a HEX color string.
   *
   * @param h - The hue component (0-360).
   * @param s - The saturation component (0-100).
   * @param l - The lightness component (0-100).
   * @returns The HEX color string (e.g., "#ff0000").
   *
   * @example
   * ```typescript
   * const hex = Color.hslToHex(0, 100, 50);
   * console.log(hex);
   * ```
   */
  static hslToHex(h: number, s: number, l: number): string {
    s /= 100
    l /= 100

    const k = (n: number) => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

    return this.rgbToHex(
      Math.round(f(0) * 255),
      Math.round(f(8) * 255),
      Math.round(f(4) * 255),
    )
  }

  /**
   * Converts a HEX color string to RGB color values.
   *
   * @param hex - The HEX color string (e.g., "#ff0000").
   * @returns An object containing the red, green, and blue components.
   *
   * @example
   * ```typescript
   * const rgb = Color.hexToRgb("#ff0000");
   * console.log(rgb);
   * ```
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }

    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return { r, g, b }
  }

  /**
   * Converts RGB color values to an HSL color string.
   *
   * @param r - The red component (0-255).
   * @param g - The green component (0-255).
   * @param b - The blue component (0-255).
   * @returns The HSL color string (e.g., "0, 100%, 50%").
   *
   * @example
   * ```typescript
   * const hsl = Color.rgbToHsl(255, 0, 0);
   * console.log(hsl);
   * ```
   */
  static rgbToHsl(r: number, g: number, b: number): string {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
  }
}
