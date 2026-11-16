import type { ComputedFieldDef, ComputedFieldValue, ShowcaseItem } from './types.js'

const caches = new WeakMap<ComputedFieldDef, Map<string, {
  expires: number
  promise: Promise<ComputedFieldValue[] | null>
}>>()

export function resolveComputedField(
  field: ComputedFieldDef,
  item: ShowcaseItem,
  refresh = false,
): Promise<ComputedFieldValue[] | null> {
  let cache = caches.get(field)
  if (!cache) {
    cache = new Map()
    caches.set(field, cache)
  }
  const key = JSON.stringify(item)
  const existing = cache.get(key)
  if (!refresh && existing && existing.expires > Date.now()) return existing.promise
  const entry = {
    expires: Infinity,
    promise: Promise.resolve().then(async () => {
      if (typeof field.resolver !== 'function') {
        throw new Error('Computed field resolver export must be a function.')
      }
      const value = await field.resolver(item, { options: field.options ?? {} })
      if (value !== null && (!Array.isArray(value) || value.some((part) =>
        !part || typeof part.text !== 'string' ||
        (part.href !== undefined && (typeof part.href !== 'string' || !/^https?:\/\//i.test(part.href))) ||
        (part.date !== undefined && (typeof part.date !== 'string' || !Number.isFinite(Date.parse(part.date))))))) {
        throw new Error('Computed field resolver returned an invalid value.')
      }
      entry.expires = Date.now() + (field.cacheTtlSeconds ?? 300) * 1000
      return value
    }).catch((error: unknown) => {
      entry.expires = Date.now() + 30_000
      throw error
    }),
  }
  cache.set(key, entry)
  return entry.promise
}
