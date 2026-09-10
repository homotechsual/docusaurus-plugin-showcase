import { describe, it, expect } from 'vitest'
import type { ShowcaseItem } from '../../src/core/types.js'
import {
  DEFAULT_PLACEHOLDER_PREVIEW,
  normaliseCardUrl,
  resolveCardPreviewImage,
} from '../../src/theme/ShowcaseCard/utils.js'

function makeItem(overrides: Partial<ShowcaseItem> = {}): ShowcaseItem {
  return {
    id: 'item',
    name: 'Item',
    description: 'Description',
    website: 'https://example.com',
    tags: [],
    ...overrides,
  }
}

describe('normaliseCardUrl', () => {
  it('returns null for undefined/null/blank values', () => {
    expect(normaliseCardUrl(undefined)).toBeNull()
    expect(normaliseCardUrl(null)).toBeNull()
    expect(normaliseCardUrl('   ')).toBeNull()
  })

  it('trims and returns non-empty URLs', () => {
    expect(normaliseCardUrl(' https://example.com ')).toBe('https://example.com')
  })
})

describe('resolveCardPreviewImage', () => {
  it('uses explicit preview when provided', () => {
    const item = makeItem({ preview: 'https://cdn.example.com/preview.png' })
    expect(resolveCardPreviewImage(item, 'https://shot.example.com/{url}')).toBe('https://cdn.example.com/preview.png')
  })

  it('uses generated screenshot when preview is absent and website exists', () => {
    const item = makeItem({ preview: null, website: 'https://acme.test' })
    expect(resolveCardPreviewImage(item, 'https://shot.example.com/{url}')).toBe(
      'https://shot.example.com/https%3A%2F%2Facme.test',
    )
  })

  it('uses placeholder when website is missing', () => {
    const item = makeItem({ preview: null, website: null })
    expect(resolveCardPreviewImage(item, 'https://shot.example.com/{url}')).toBe(DEFAULT_PLACEHOLDER_PREVIEW)
  })

  it('returns null when no preview, no screenshot template, and website exists', () => {
    const item = makeItem({ preview: null, website: 'https://acme.test' })
    expect(resolveCardPreviewImage(item, null)).toBeNull()
  })
})
