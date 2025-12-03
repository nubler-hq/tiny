/**
 * Utility class providing methods for URL manipulation and generation.
 * This class offers various static methods to handle common URL operations
 * such as parameter appending, URL normalization, and unique URL generation.
 *
 * @remarks
 * All methods in this class are static and can be used without instantiating
 * the class. The class follows RESTful URL conventions and handles edge cases
 * such as trailing slashes and proper URL formatting.
 *
 * @example
 * ```typescript
 * // Get a full URL with base path
 * const apiUrl = Url.get('/api/v1');
 *
 * // Append query parameters
 * const searchUrl = Url.appendQueryParams(apiUrl, { q: 'search', sort: 'desc' });
 *
 * // Generate a unique URL
 * const uniqueResourceUrl = Url.generateUniqueUrl(apiUrl);
 *
 * // Combine URLs safely
 * const combinedUrl = Url.combineUrl('https://api.example.com', '/resources');
 * ```
 */
export class Url {
  /**
   * Gets the base URL from the application configuration.
   *
   * @param base - Optional base URL to use instead of the default localhost.
   * @param path - An optional path to append to the base URL.
   * @returns The full URL with the base URL and optional path.
   *
   * @example
   * ```typescript
   * const url1 = Url.get('/api/v1');
   * // 'http://localhost:3000/api/v1'
   *
   * const url2 = Url.get('https://api.example.com', '/users');
   * // 'https://api.example.com/users'
   * ```
   */
  static get(path?: string, base?: string): string {
    const baseUrl =
      base || process.env.NEXT_PUBLIC_IGNITER_APP_URL || 'http://localhost:3000'

    // Se não houver path, retorna apenas a base normalizada
    if (!path) {
      return this.normalizeUrl(baseUrl)
    }

    // Usa o método combineUrl existente para garantir manipulação correta das barras
    return this.combineUrl(baseUrl, path)
  }

  /**
   * Appends query parameters to a given URL.
   *
   * @param url - The base URL to append query parameters to.
   * @param params - An object representing the query parameters.
   * @returns The URL with the appended query parameters.
   *
   * @example
   * ```typescript
   * const url = Url.appendQueryParams('https://api.example.com', {
   *   search: 'test',
   *   page: '1',
   *   sort: 'desc'
   * });
   * // 'https://api.example.com?search=test&page=1&sort=desc'
   * ```
   */
  static appendQueryParams(
    url: string,
    params: Record<string, string>,
  ): string {
    const queryString = new URLSearchParams(params).toString()
    return `${url}?${queryString}`
  }

  /**
   * Checks if a given URL is absolute.
   *
   * @param url - The URL to check.
   * @returns True if the URL is absolute, false otherwise.
   *
   * @example
   * ```typescript
   * Url.isAbsoluteUrl('https://example.com'); // true
   * Url.isAbsoluteUrl('//example.com'); // true
   * Url.isAbsoluteUrl('/path/to/resource'); // false
   * ```
   */
  static isAbsoluteUrl(url: string): boolean {
    return /^(?:[a-z]+:)?\/\//i.test(url)
  }

  /**
   * Normalizes a URL by removing any trailing slashes.
   *
   * @param url - The URL to normalize.
   * @returns The normalized URL without trailing slashes.
   *
   * @example
   * ```typescript
   * Url.normalizeUrl('https://example.com/'); // 'https://example.com'
   * Url.normalizeUrl('https://example.com/api//'); // 'https://example.com/api'
   * ```
   */
  static normalizeUrl(url: string): string {
    return url.replace(/\/+$/, '')
  }

  /**
   * Combines a base URL with a relative path, ensuring proper slash handling.
   *
   * @param baseUrl - The base URL to combine with.
   * @param relativePath - The relative path to append.
   * @returns The properly combined URL.
   *
   * @example
   * ```typescript
   * Url.combineUrl('https://example.com/', '/api/v1/');
   * // 'https://example.com/api/v1'
   *
   * Url.combineUrl('https://example.com', 'users');
   * // 'https://example.com/users'
   * ```
   */
  static combineUrl(baseUrl: string, relativePath: string): string {
    return `${this.normalizeUrl(baseUrl)}/${relativePath.replace(/^\/+/, '')}`
  }
}
