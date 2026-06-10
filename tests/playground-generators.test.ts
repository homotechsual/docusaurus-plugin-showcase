import { describe, it, expect } from 'vitest'
import {
  generateTsConfig,
  generateJsConfig,
  generateSampleYaml,
  generateSchema,
} from '../demo/src/lib/playground-generators'
import type { PlaygroundState } from '../demo/src/lib/playground-generators'

const presetPluginsState: PlaygroundState = {
  mode: 'preset',
  preset: 'plugins',
  routeBasePath: 'plugins',
  dataDir: './data/plugins',
  pageTitle: '',
  pageDescription: '',
  submitUrl: '',
  screenshotUrl: '',
  favouriteTag: '',
}

const presetSitesState: PlaygroundState = {
  mode: 'preset',
  preset: 'sites',
  routeBasePath: 'sites',
  dataDir: './data/sites',
  pageTitle: '',
  pageDescription: '',
  submitUrl: '',
  screenshotUrl: '',
  favouriteTag: '',
}

const customState: PlaygroundState = {
  mode: 'custom',
  routeBasePath: 'showcase',
  dataDir: './data',
  pageTitle: 'My Directory',
  pageDescription: '',
  submitUrl: '',
  screenshotUrl: '',
  favouriteTag: 'react',
  tags: [
    { key: 'react', label: 'React', description: 'React-based tools', color: '#61dafb', icon: '' },
    { key: 'vue', label: 'Vue', description: 'Vue-based tools', color: '#42b883', icon: '' },
  ],
  statuses: [
    { key: 'active', label: 'Active', description: 'Actively maintained', color: '#39ca30', icon: 'circle-check' },
  ],
}

describe('generateTsConfig', () => {
  it('uses pluginsPreset spread for plugins preset mode', () => {
    const result = generateTsConfig(presetPluginsState)
    expect(result).toContain('pluginsPreset')
    expect(result).toContain("...pluginsPreset")
    expect(result).toContain("routeBasePath: 'plugins'")
    expect(result).toContain("dataDir: './data/plugins'")
  })

  it('uses sitesPreset spread for sites preset mode', () => {
    const result = generateTsConfig(presetSitesState)
    expect(result).toContain('sitesPreset')
    expect(result).toContain("...sitesPreset")
  })

  it('omits empty optional scalar fields', () => {
    const result = generateTsConfig(presetPluginsState)
    expect(result).not.toContain('pageTitle')
    expect(result).not.toContain('submitUrl')
    expect(result).not.toContain('screenshotUrl')
    expect(result).not.toContain('favouriteTag')
  })

  it('includes non-empty optional scalar fields', () => {
    const state: PlaygroundState = { ...presetPluginsState, pageTitle: 'My Directory', submitUrl: 'https://example.com/submit' }
    const result = generateTsConfig(state)
    expect(result).toContain("pageTitle: 'My Directory'")
    expect(result).toContain("submitUrl: 'https://example.com/submit'")
  })

  it('generates custom mode config with tags object', () => {
    const result = generateTsConfig(customState)
    expect(result).toContain('PluginOptions')
    expect(result).toContain('react:')
    expect(result).toContain("label: 'React'")
    expect(result).toContain("color: '#61dafb'")
    expect(result).toContain('vue:')
  })

  it('includes statuses in custom mode when present', () => {
    const result = generateTsConfig(customState)
    expect(result).toContain('statuses:')
    expect(result).toContain('active:')
    expect(result).toContain("icon: 'circle-check'")
  })

  it('omits statuses in custom mode when empty', () => {
    const state: PlaygroundState = { ...customState, statuses: [] }
    const result = generateTsConfig(state)
    expect(result).not.toContain('statuses')
  })

  it('omits icon line when icon is empty string', () => {
    const result = generateTsConfig(customState)
    // react tag has icon: '' — should not emit icon line
    const reactBlock = result.slice(result.indexOf('react:'), result.indexOf('vue:'))
    expect(reactBlock).not.toContain('icon:')
  })
})

describe('generateJsConfig', () => {
  it('produces no import statements', () => {
    const result = generateJsConfig(presetPluginsState)
    expect(result).not.toContain('import')
  })

  it('produces no satisfies annotations', () => {
    const result = generateJsConfig(customState)
    expect(result).not.toContain('satisfies')
  })

  it('still spreads the preset', () => {
    const result = generateJsConfig(presetPluginsState)
    expect(result).toContain('...pluginsPreset')
  })

  it('still includes tags for custom mode', () => {
    const result = generateJsConfig(customState)
    expect(result).toContain('react:')
    expect(result).toContain("label: 'React'")
  })
})

describe('generateSampleYaml', () => {
  it('uses first two plugins preset tag keys', () => {
    const result = generateSampleYaml(presetPluginsState)
    expect(result).toContain('- favourite')
    expect(result).toContain('- docusaurus')
    expect(result).toContain('id: author.my-item')
    expect(result).toContain('website: https://example.com')
  })

  it('uses first two sites preset tag keys', () => {
    const result = generateSampleYaml(presetSitesState)
    expect(result).toContain('- favorite')
    expect(result).toContain('- opensource')
  })

  it('uses first two custom tag keys', () => {
    const result = generateSampleYaml(customState)
    expect(result).toContain('- react')
    expect(result).toContain('- vue')
  })

  it('uses only one tag when only one custom tag defined', () => {
    const state: PlaygroundState = { ...customState, tags: [{ key: 'solo', label: 'Solo', description: '', color: '#fff', icon: '' }] }
    const result = generateSampleYaml(state)
    expect(result).toContain('- solo')
    // No second tag entry
    const tagLines = result.split('\n').filter(l => l.trim().startsWith('- '))
    expect(tagLines).toHaveLength(1)
  })

  it('produces empty tags list when no custom tags defined', () => {
    const state: PlaygroundState = { ...customState, tags: [] }
    const result = generateSampleYaml(state)
    expect(result).toContain('tags: []')
  })
})

describe('generateSchema', () => {
  it('returns a comment reference to the plugins-preset schema path', () => {
    const result = generateSchema(presetPluginsState)
    expect(result).toContain('plugins-preset/1.0.0.json')
    expect(result).toContain('$schema')
  })

  it('returns a comment reference to the sites-preset schema path', () => {
    const result = generateSchema(presetSitesState)
    expect(result).toContain('sites-preset/1.0.0.json')
  })

  it('generates valid JSON schema for custom mode', () => {
    const result = generateSchema(customState)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('includes custom tag keys as enum values in generated schema', () => {
    const result = generateSchema(customState)
    const schema = JSON.parse(result)
    expect(schema.properties.tags.items.enum).toContain('react')
    expect(schema.properties.tags.items.enum).toContain('vue')
  })

  it('includes custom status keys as enum values in generated schema', () => {
    const result = generateSchema(customState)
    const schema = JSON.parse(result)
    expect(schema.properties.status.enum).toContain('active')
    expect(schema.properties.status.enum).toContain(null)
  })

  it('omits status enum when no statuses defined', () => {
    const state: PlaygroundState = { ...customState, statuses: [] }
    const result = generateSchema(state)
    const schema = JSON.parse(result)
    expect(schema.properties.status).toEqual({ type: ['string', 'null'] })
  })
})
