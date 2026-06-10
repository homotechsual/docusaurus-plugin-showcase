import { describe, it, expect } from 'vitest'
import { validateOptions } from '../src/plugin.js'

const baseOptions = {
  dataDir: 'data',
  tags: { foo: { label: 'Foo', description: 'desc', color: '#fff' } },
}

describe('validateOptions', () => {
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
