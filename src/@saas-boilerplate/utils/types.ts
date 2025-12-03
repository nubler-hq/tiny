/* eslint-disable no-use-before-define */
import type { z } from 'zod'

/**
 * Utility types for advanced TypeScript type manipulation.
 * @module types
 */

/**
 * Checks if two types are exactly equal.
 * @template T1 - The first type.
 * @template T2 - The second type.
 * @returns `true` if the types are equal, `false` otherwise.
 */
type IsEqual<T1, T2> =
  (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
    ? true
    : false

/**
 * Checks if a type is a tuple (fixed-length array).
 * @template T - The type to check.
 * @returns `true` if the type is a tuple, `false` otherwise.
 */
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true

/**
 * Extracts the keys of a tuple.
 * @template T - The tuple type.
 * @returns The keys of the tuple.
 */
type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>

/**
 * Represents a numeric key (for array indexing).
 */
type ArrayKey = number

/**
 * Checks if two types are equal, but returns `never` if they are not assignable.
 * @template T1 - The first type.
 * @template T2 - The second type.
 */
type AnyIsEqual<T1, T2> = T1 extends T2
  ? IsEqual<T1, T2> extends true
    ? true
    : never
  : never

/**
 * Internal helper type for recursively constructing paths.
 * @template K - The current key (string or number).
 * @template V - The value type at the current key.
 * @template TraversedTypes - A union of types that have already been traversed.
 */
type PathImpl<K extends string | number, V, TraversedTypes> = V extends
  | string
  | number
  | boolean
  | null
  | undefined
  ? `${K}`
  : true extends AnyIsEqual<TraversedTypes, V>
    ? `${K}`
    : `${K}` | `${K}.${PathInternal<V, TraversedTypes | V>}`

/**
 * Internal helper type for recursively constructing paths.
 * @template T - The current type being traversed.
 * @template TraversedTypes - A union of types that have already been traversed.
 */
type PathInternal<T, TraversedTypes = T> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>
        }[TupleKeys<T>]
      : PathImpl<ArrayKey, V, TraversedTypes>
    : { [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes> }[keyof T]

/**
 * Creates a union of all possible paths (dot notation) within an object.
 * @template T - The object type.
 * @example
 * ```ts
 * interface MyObject {
 *   a: string;
 *   b: {
 *     c: number;
 *   };
 * }
 *
 * type MyObjectPaths = Path<MyObject>; // "a" | "b" | "b.c"
 * ```
 */
export type Path<T> = T extends any ? PathInternal<T> : never

/**
 * Checks if a value extends an expected type, and returns the expected type if it does, or a default type if it doesn't.
 * @template TTarget - The type of the value to check.
 * @template TExpected - The expected type.
 * @template TDefault - The default type to return if the value does not extend the expected type. Defaults to `never`.
 */
export type TypeOf<
  TTarget,
  TExpected,
  TDefault = never,
> = TTarget extends TExpected ? TExpected : TDefault

/**
 * Extracts the type of a nested property within an object based on a given path.
 * @template T - The object type.
 * @template K - The path to the property (using dot notation).
 * @example
 * ```ts
 * interface MyObject {
 *   a: string;
 *   b: {
 *     c: number;
 *   };
 * }
 *
 * type CType = FieldType<MyObject, "b.c">; // number
 * ```
 */
export type FieldType<
  T,
  K extends Path<T>,
> = K extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? FieldType<T[Head], Extract<Tail, Path<T[Head]>>>
    : never
  : K extends keyof T
    ? T[K]
    : never

/**
 * Makes all properties of an object (and its nested objects) optional, recursively.
 * @template T - The object type.
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

/**
 * Adds a `context` property to an existing type.
 * @template Payload - The original type.
 * @template Context - The type of the context to be added.
 */
export type WithContext<Payload, Context> = Payload & {
  context: Context
}

/**
 * Extracts keys of methods from a type that match a specific type.
 * @template T - The object type.
 * @template Match - The type to match for methods.
 */
export type ExtractMethodsOfType<T, Match> = {
  [K in keyof T]: T[K] extends Match ? K : never
}[keyof T]

/**
 * Replaces specified keys in a type with a new type.
 * @template T - The original type.
 * @template K - The keys to replace.
 * @template R - The new type for the replaced keys.
 */
export type ReplaceKeys<T, K extends keyof T, R> = {
  [P in keyof T]: P extends K ? R : T[P]
}

/**
 * Represents a dynamic object where keys and values are of a specific type.
 * @template T - The type of the values in the object.
 */
export type DynamicObject<T> = {
  [K in keyof T]: T[K]
}

/**
 * Flattens a union of array types into a union of their element types.
 * @template T - The type (union of arrays or other types).
 */
export type Flatten<T> = T extends any[] ? T[number] : T

/**
 * Resolves a type based on a condition and a mapping of types.
 * @template TCondition - The condition (a string literal type).
 * @template TMap - A record mapping condition strings to types.
 * @template TDefault - The default type if the condition is not found in the map.
 */
export type TypeResolver<
  TCondition extends string,
  TMap extends Record<string, any>,
  TDefault = never,
> = TCondition extends keyof TMap ? TMap[TCondition] : TDefault

/**
 * Makes specified keys of an object non-nullable.
 * @template T - The object type.
 */
export type NonNullableKeys<T> = {
  [K in keyof T]: NonNullable<T[K]>
}

/**
 * Infers the type of a Zod schema parameter.
 * @template TShape - The shape of a Zod object.
 * @template Key - The key within the shape to infer.
 */
export type InferZodShapeParam<
  TShape extends z.ZodObject<any>['shape'],
  Key extends keyof TShape,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = TShape extends { [K in Key]: z.ZodType<infer U> }
  ? z.infer<TShape[Key]>
  : unknown

/**
 * Checks if all keys in a type are `never`.
 * @template TShape - The type to check.
 */
export type AreAllKeysNever<TShape> = keyof TShape extends never
  ? true
  : TShape extends { body?: never; params?: never; query?: never }
    ? true
    : false

/**
 * Builds a parameter object if a key exists in a Zod shape.
 * @template TShape - The Zod shape.
 * @template Key - The key to check for ('body', 'params', 'query', or 'state').
 */
export type BuildParamIfExists<
  TShape,
  Key extends 'body' | 'params' | 'query' | 'state',
> = Key extends keyof TShape ? { [K in Key]: TShape[Key] } : {}

/**
 * Makes all properties of an object optional.
 * @template T - The object type.
 */
export type Optional<T> = {
  [P in keyof T]?: T[P]
}

/**
 * Makes specified properties of an object optional.
 * @template T - The object type.
 * @template K - The keys to make optional (union of string literals).
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Requires at least one property of an object to be defined.
 * @template T - The object type.
 */
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

/**
 *  Creates a type that represents either all properties of an object or none of them.
 * @template T - The object type.
 */
export type AllOrNone<T> = T | { [K in keyof T]?: never }

/**
 * Creates a read-only version of an object type.
 * @template T - The object type.
 */
export type ReadonlyObject<T> = {
  readonly [P in keyof T]: T[P]
}

/**
 * Recursively creates a read-only version of an object type, including nested objects.
 * @template T - The object type.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * Omits keys from a type, supporting union types.  This is a more robust version of Omit.
 * @template T - The object type
 * @template K - The keys to omit
 */
export type OmitUnion<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never
