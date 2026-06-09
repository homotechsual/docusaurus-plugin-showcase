import { describe, it, expect } from 'vitest'
import { generateShowcaseModule } from '../../src/core/module-generator.js'
import type { ShowcasePageData, ShowcaseItem } from '../../src/core/types.js'

const baseOptions = {
  id: 'default',
  dataDir: 'data',
  routeBasePath: 'showcase',
  tags: { foo: { label: 'Foo', description: 'desc', color: '#fff' } },
  statuses: {},
}

function makeItem(overrides: Partial<ShowcaseItem> = {}): ShowcaseItem {
  return {
    id: 'test.item',
    name: 'Test Item',
    description: 'A test item.',
    website: 'https://example.com',
    tags: [],
    ...overrides,
  }
}

describe('generateShowcaseModule', () => {
  it('produces a CJS module string starting with the generated comment', () => {
    const data: ShowcasePageData = { items: [], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toMatch(/^\/\/ @generated/)
    expect(result).toContain('module.exports =')
  })

  it('serialises a preview URL as a JSON string', () => {
    const item = makeItem({ preview: 'https://example.com/preview.png' })
    const data: ShowcasePageData = { items: [item], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('"preview":"https://example.com/preview.png"')
  })

  it('serialises a null preview as null', () => {
    const item = makeItem({ preview: null })
    const data: ShowcasePageData = { items: [item], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('"preview":null')
  })

  it('emits require() for items with _localImagePath', () => {
    const item = makeItem() as ShowcaseItem & { _localImagePath: string }
    item._localImagePath = '/abs/path/to/image.png'
    const data: ShowcasePageData = { items: [item as ShowcaseItem], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('require("/abs/path/to/image.png")')
  })

  it('strips _localImagePath from the serialised item', () => {
    const item = makeItem() as ShowcaseItem & { _localImagePath: string }
    item._localImagePath = '/abs/path/to/image.png'
    const data: ShowcasePageData = { items: [item as ShowcaseItem], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).not.toContain('_localImagePath')
  })

  it('_localImagePath takes precedence over a preview URL', () => {
    const item = makeItem({ preview: 'https://example.com/preview.png' }) as ShowcaseItem & { _localImagePath: string }
    item._localImagePath = '/abs/path/to/local.png'
    const data: ShowcasePageData = { items: [item as ShowcaseItem], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('require("/abs/path/to/local.png")')
    expect(result).not.toContain('https://example.com/preview.png')
  })
})
