import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveComputedField } from '../../src/core/computed-fields.js'
import type { ComputedFieldDef, ShowcaseItem } from '../../src/core/types.js'

const item: ShowcaseItem = { id: 'test', name: 'Test', description: '', tags: [] }

afterEach(() => vi.useRealTimers())

describe('runtime computed fields', () => {
  it('supports synchronous values and passes item and public options', async () => {
    const resolver = vi.fn(() => [{ text: '1.2.3' }])
    const field: ComputedFieldDef = { label: 'Version', resolver, options: { endpoint: 'https://example.com' } }
    await expect(resolveComputedField(field, item)).resolves.toEqual([{ text: '1.2.3' }])
    expect(resolver).toHaveBeenCalledWith(item, { options: field.options })
  })

  it('deduplicates pending requests and caches successful results until expiry', async () => {
    vi.useFakeTimers()
    const resolver = vi.fn(async () => [{ text: '1.2.3' }])
    const field: ComputedFieldDef = { label: 'Version', resolver, cacheTtlSeconds: 60 }
    const first = resolveComputedField(field, item)
    expect(resolveComputedField(field, { ...item })).toBe(first)
    await first
    vi.advanceTimersByTime(59_999)
    await resolveComputedField(field, item)
    expect(resolver).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    await resolveComputedField(field, item)
    expect(resolver).toHaveBeenCalledTimes(2)
  })

  it('isolates field definitions and changed items', async () => {
    const resolver = vi.fn(async () => null)
    const first: ComputedFieldDef = { label: 'First', resolver }
    await resolveComputedField(first, item)
    await resolveComputedField({ label: 'Second', resolver }, item)
    await resolveComputedField(first, { ...item, source: 'https://github.com/a/b' })
    expect(resolver).toHaveBeenCalledTimes(3)
  })

  it('caches failures briefly but allows explicit retries', async () => {
    vi.useFakeTimers()
    const resolver = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue([{ text: 'Recovered' }])
    const field: ComputedFieldDef = { label: 'Version', resolver }
    await expect(resolveComputedField(field, item)).rejects.toThrow('Offline')
    await expect(resolveComputedField(field, item)).rejects.toThrow('Offline')
    expect(resolver).toHaveBeenCalledTimes(1)
    await expect(resolveComputedField(field, item, true)).resolves.toEqual([{ text: 'Recovered' }])
  })

  it.each([
    [{ text: 123 }],
    [{ text: 'Unsafe', href: 'javascript:alert(1)' }],
    [{ text: 'Invalid date', date: 'yesterday' }],
    undefined,
    {},
  ])('rejects invalid resolver output %j', async (output) => {
    const field: ComputedFieldDef = { label: 'Invalid', resolver: vi.fn().mockResolvedValue(output) }
    await expect(resolveComputedField(field, item)).rejects.toThrow('invalid value')
  })

  it('rejects a missing/non-function module export at runtime', async () => {
    const field: ComputedFieldDef = { label: 'Invalid', resolver: { module: 'missing', exportName: 'missing' } }
    await expect(resolveComputedField(field, item)).rejects.toThrow('must be a function')
  })
})
