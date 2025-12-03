import type { FieldType, Path } from './types'

/**
 * A utility class providing type-safe methods for navigating and manipulating nested objects.
 * Implements a robust object traversal system with full TypeScript support for path-based operations.
 *
 * @remarks
 * This class is designed to handle complex object structures while maintaining type safety.
 * It provides methods for getting, setting, and checking the existence of deeply nested values
 * using dot notation paths.
 *
 * @example
 * ```typescript
 * const user = {
 *   profile: {
 *     name: 'John',
 *     address: {
 *       city: 'New York'
 *     }
 *   }
 * };
 *
 * // Get nested value
 * const city = ObjectNavigator.get(user, 'profile.address.city');
 *
 * // Check if path exists
 * const hasEmail = ObjectNavigator.has(user, 'profile.email');
 *
 * // Set nested value
 * const updated = ObjectNavigator.set(user, 'profile.address.zipCode', '10001');
 * ```
 */
export class ObjectNavigator {
  /**
   * Retrieves a value from a nested object path with full type inference.
   * Safely handles undefined or null values in the object traversal chain.
   *
   * @param object - Source object to retrieve value from
   * @param path - Dot notation path to the desired value (e.g., 'user.address.city')
   * @returns The value at the specified path with correct type inference
   *
   * @throws {undefined} When the path doesn't exist (returns undefined)
   *
   * @example
   * ```typescript
   * const data = {
   *   user: {
   *     profile: {
   *       name: 'John'
   *     }
   *   }
   * };
   *
   * const name = ObjectNavigator.get(data, 'user.profile.name');
   * // Returns: 'John'
   *
   * const age = ObjectNavigator.get(data, 'user.profile.age');
   * // Returns: undefined
   * ```
   */
  static get<T extends Record<string, any>, P extends Path<T>>(
    object: T,
    path: P,
  ): T[P] {
    if (!object || !path) {
      return undefined as T[P]
    }

    const keys = path.split('.')
    let result: any = object

    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined as T[P]
      }

      // Business Rule: Handle array index access with numeric keys
      if (/^\d+$/.test(key)) {
        const index = parseInt(key, 10)
        if (Array.isArray(result)) {
          result = result[index]
          continue
        }
      }

      result = result[key]
    }

    return result as T[P]
  }

  /**
   * Checks if a nested path exists in an object.
   * Performs a safe traversal through the object structure to verify path existence.
   *
   * @param object - Source object to check
   * @param path - Dot notation path to verify
   * @returns Boolean indicating if the complete path exists in the object
   *
   * @example
   * ```typescript
   * const data = {
   *   settings: {
   *     theme: 'dark'
   *   }
   * };
   *
   * const hasTheme = ObjectNavigator.has(data, 'settings.theme');
   * // Returns: true
   *
   * const hasLanguage = ObjectNavigator.has(data, 'settings.language');
   * // Returns: false
   * ```
   */
  static has<T extends Record<string, any>, P extends Path<T>>(
    object: T,
    path: P,
  ): boolean {
    if (!object || !path) {
      return false
    }

    const keys = path.split('.')
    let current: any = object

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false
      }
      current = current[key]
    }

    return true
  }

  /**
   * Sets a value at a specified nested path in an object.
   * Creates the necessary object structure if it doesn't exist.
   *
   * @param object - Target object to set value in
   * @param path - Dot notation path where to set the value
   * @param value - Value to set at the specified path
   * @returns A new object with the updated value at the specified path
   *
   * @remarks
   * - Creates intermediate objects if they don't exist
   * - Preserves existing object structure
   * - Returns a new object instead of mutating the original
   *
   * @example
   * ```typescript
   * const user = {
   *   profile: {
   *     name: 'John'
   *   }
   * };
   *
   * const updated = ObjectNavigator.set(user, 'profile.address.city', 'New York');
   * // Returns: {
   * //   profile: {
   * //     name: 'John',
   * //     address: {
   * //       city: 'New York'
   * //     }
   * //   }
   * // }
   * ```
   */
  static set<T extends Record<string, any>, P extends Path<T>>(
    object: T,
    path: P,
    value: FieldType<T, P>,
  ): T {
    if (!object || !path) {
      return object
    }

    // Business Rule: Create a deep copy to avoid mutations
    const result = { ...object }
    const keys = path.split('.')

    let current: Record<string, any> = result

    // Business Rule: Traverse the path until the second-to-last key
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]

      // Business Rule: Create nested object if it doesn't exist
      if (!(key in current)) {
        current[key] = {}
      } else if (current[key] === null || current[key] === undefined) {
        current[key] = {}
      } else {
        // Business Rule: Create a deep copy of nested objects
        current[key] = JSON.parse(JSON.stringify(current[key]))
      }

      current = current[key] as Record<string, any>
    }

    // Business Rule: Set the value at the final key
    const lastKey = keys[keys.length - 1]
    current[lastKey] = value

    return result as T
  }
}
