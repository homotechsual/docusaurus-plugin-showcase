import { describe, it, expect } from 'vitest'
import { validateOptions } from '../src/plugin.js'

const baseOptions = {
  dataDir: 'data',
  tags: { foo: { label: 'Foo', description: 'desc', color: '#fff' } },
}

describe('validateOptions', () => {
  it('preserves runtime field module configuration', () => {
    const computedFields = { version: { label: 'Version', resolver: { module: '@site/version.ts', exportName: 'version' } } }
    expect(validateOptions({ options: { ...baseOptions, computedFields } }).computedFields).toEqual(computedFields)
  })

  it.each([
    { label: 'Version', resolver: () => null },
    { label: 'Version', resolver: { module: 123, exportName: 'version' } },
    { label: '', resolver: { module: 'version.ts', exportName: 'version' } },
    { label: 'Version', resolver: { module: 'version.ts', exportName: '' } },
    { label: 'Version', resolver: { module: 'version.ts', exportName: 'version' }, cacheTtlSeconds: -1 },
  ])('rejects invalid computed field configuration', (definition) => {
    expect(() => validateOptions({ options: { ...baseOptions, computedFields: { version: definition } } })).toThrow('Computed field')
  })

  it('throws when dataDir is missing', () => {
    expect(() =>
      validateOptions({ options: { tags: baseOptions.tags } }),
    ).toThrow('dataDir')
  })

  it('throws when tags is empty', () => {
    expect(() =>
      validateOptions({ options: { dataDir: 'data', tags: {} } }),
    ).toThrow('tags')
  })

  it('accepts empty statuses object', () => {
    const result = validateOptions({
      options: { ...baseOptions, statuses: {} },
    })
    expect(result.statuses).toEqual({})
  })

  it('defaults statuses to {} when absent', () => {
    const result = validateOptions({ options: baseOptions })
    expect(result.statuses).toEqual({})
  })

  it('preserves provided statuses', () => {
    const statuses = {
      maintained: { label: 'Maintained', description: 'desc', icon: 'circle-check' },
    }
    const result = validateOptions({ options: { ...baseOptions, statuses } })
    expect(result.statuses).toEqual(statuses)
  })

  it('preserves valid default filters', () => {
    const defaultFilters = { tags: ['foo'], statuses: ['maintained', 'unknown'] }
    const result = validateOptions({
      options: {
        ...baseOptions,
        statuses: {
          maintained: { label: 'Maintained', description: 'desc' },
          unknown: { label: 'Unknown', description: 'desc' },
        },
        defaultFilters,
      },
    })
    expect(result.defaultFilters).toEqual(defaultFilters)
  })

  it.each([
    { tags: ['missing'] },
    { statuses: ['missing'] },
    { tags: 'foo' },
  ])('rejects invalid default filters: %j', (defaultFilters) => {
    expect(() => validateOptions({
      options: { ...baseOptions, statuses: {}, defaultFilters },
    })).toThrow('default')
  })

  it('defaults screenshotUrl to null when absent', () => {
    const result = validateOptions({ options: baseOptions })
    expect(result.screenshotUrl).toBeNull()
  })

  it('preserves provided screenshotUrl', () => {
    const result = validateOptions({
      options: { ...baseOptions, screenshotUrl: 'https://example.com/{url}/thumb' },
    })
    expect(result.screenshotUrl).toBe('https://example.com/{url}/thumb')
  })
})
