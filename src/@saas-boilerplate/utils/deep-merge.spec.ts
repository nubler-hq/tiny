import { describe, expect, it } from 'vitest'

import { DeepMerge } from './deep-merge'

describe('DeepMerge', () => {
  it('should merge two simple objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = DeepMerge.merge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should merge nested objects', () => {
    const target = { a: { b: 1 } }
    const source = { a: { c: 2 } }
    const result = DeepMerge.merge(target, source)
    expect(result).toEqual({ a: { b: 1, c: 2 } })
  })

  it('should handle non-object target', () => {
    const target = null
    const source = { a: 1 }
    // @ts-expect-error - This is a hack to make TypeScript happy
    const result = DeepMerge.merge(target, source)
    expect(result).toEqual({ a: 1 })
  })

  it('should handle arrays correctly', () => {
    const target = { a: [1, 2] }
    const source = { a: [3, 4] }
    const result = DeepMerge.merge(target, source)
    expect(result).toEqual({ a: [1, 2, 3, 4] })
  })

  it('should merge multiple sources', () => {
    const target = { a: 1 }
    const source1 = { b: 2 }
    const source2 = { c: 3 }
    const result = DeepMerge.merge(target, source1, source2)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle array properties correctly', () => {
    const target = { a: [1, 2] }
    const source1 = { a: [3] }
    const source2 = { a: [4, 5] }
    const result = DeepMerge.merge(target, source1, source2)
    expect(result).toEqual({ a: [1, 2, 3, 4, 5] })
  })
})
