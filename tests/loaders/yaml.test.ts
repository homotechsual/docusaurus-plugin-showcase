import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadShowcaseItems } from '../../src/loaders/yaml.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const fixturesDir = resolve(__dirname, '../fixtures')

describe('loadShowcaseItems', () => {
  it('loads valid YAML files and returns ShowcaseItem array', async () => {
    const warnings: string[] = []
    const items = await loadShowcaseItems(
      fixturesDir,
      { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
      (msg) => warnings.push(msg),
    )
    const validItem = items.find((i) => i.id === 'test.my-plugin')
    expect(validItem).toBeDefined()
    expect(validItem?.name).toBe('My Plugin')
    expect(validItem?.tags).toEqual(['utility'])
  })

  it('skips files that fail schema validation and emits a warning', async () => {
    const warnings: string[] = []
    const items = await loadShowcaseItems(
      fixturesDir,
      { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
      (msg) => warnings.push(msg),
    )
    const badItem = items.find((i) => (i as Record<string, unknown>)['id'] === 'test.bad-plugin')
    expect(badItem).toBeUndefined()
    expect(warnings.some((w) => w.includes('invalid-plugin.yaml'))).toBe(true)
  })

  it('returns empty array when dataDir does not exist', async () => {
    const warnings: string[] = []
    const items = await loadShowcaseItems(
      '/nonexistent/path',
      { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
      (msg) => warnings.push(msg),
    )
    expect(items).toEqual([])
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('maps title to name when name is absent', async () => {
    const warnings: string[] = []
    const items = await loadShowcaseItems(
      fixturesDir,
      { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
      (msg) => warnings.push(msg),
    )
    const item = items.find((i) => i.id === 'test.site-with-title')
    expect(item).toBeDefined()
    expect(item?.name).toBe('Site With Title')
    expect((item as Record<string, unknown>)['title']).toBeUndefined()
  })
})
