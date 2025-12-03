/**
 * Type definition for any object with string keys and any values
 */
type AnyObject = { [key: string]: any }

/**
 * Utility class for performing deep merge operations on objects.
 * This class provides functionality to recursively merge multiple objects into a single object,
 * preserving nested structures and handling arrays.
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const merged = DeepMerge.merge(obj1, obj2);
 * // Result: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export class DeepMerge {
  /**
   * Recursively merges multiple source objects into a target object.
   * Arrays are concatenated, objects are deeply merged, and primitive values are overwritten.
   *
   * @param target - The target object to merge into
   * @param sources - One or more source objects to merge from
   * @returns The merged object combining all sources into the target
   *
   * @typeParam T - Type of the target object
   * @typeParam U - Array type containing types of source objects
   *
   * @example
   * ```typescript
   * const target = { user: { name: 'John' }, tags: ['a'] };
   * const source = { user: { age: 30 }, tags: ['b'] };
   * const result = DeepMerge.merge(target, source);
   * // Result: { user: { name: 'John', age: 30 }, tags: ['a', 'b'] }
   * ```
   */
  static merge<T extends Record<string, any>, U extends Record<string, any>[]>(
    target: T,
    ...sources: U
  ): T & U[number] {
    if (typeof target !== 'object' || target === null) {
      target = {} as T
    }

    if (!sources || sources.length === 0) {
      return target as T & U[number]
    }

    if (sources.length === 0) {
      return target as T & U[number]
    }

    for (const source of sources) {
      if (typeof source !== 'object' || source === null) {
        continue
      }

      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
          if (!(key in target)) {
            Object.assign(target, { [key]: {} })
          }
          DeepMerge.merge(
            target[key] as AnyObject,
            (source[key] as AnyObject) || {},
          )
        } else if (Array.isArray(source[key])) {
          // Se source[key] é um array, substituímos o valor no target em vez de concatenar
          // @ts-expect-error - This is a hack to make TypeScript happy
          target[key] = source[key]
        } else {
          // @ts-expect-error - This is a hack to make TypeScript happy
          target[key] = source[key]
        }
      }
    }

    return target as T & U[number]
  }
}
