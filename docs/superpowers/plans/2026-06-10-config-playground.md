# Config Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-mode interactive Config Playground to the showcase demo site, backport the shared `PlaygroundOutputAccordion` component to the plausible demo, and refactor the plausible playground to use it.

**Architecture:** The playground page holds a union-typed React state object; switching between Preset and Custom modes preserves scalar fields. Four stacked accordion panels on the right update live from pure generator functions in a sibling `playground-generators.ts` file. The accordion component is duplicated into each demo's `src/components/` (separate repos — shared package would be overkill for one small component).

**Tech Stack:** React 19, TypeScript, Docusaurus 3 (`@theme/Layout`, `@theme/Heading`, `var(--ifm-*)` CSS variables), Vitest for generator unit tests.

---

## File Map

### Showcase demo (`j:/Projects/docusaurus-plugin-showcase/`)

| Action | Path | Responsibility |
|---|---|---|
| Create | `demo/src/components/PlaygroundOutputAccordion.tsx` | Accordion panel UI + integrated Copy button |
| Create | `demo/src/pages/playground-generators.ts` | All 4 code-generation functions + shared state types |
| Create | `demo/src/pages/playground.tsx` | Page shell, state, mode toggle, form controls |
| Modify | `demo/docusaurus.config.ts` | Add `/playground` to navbar + footer |
| Create | `tests/playground-generators.test.ts` | Unit tests for generator functions |

### Plausible demo (`j:/Projects/docusaurus-plugin-plausible/`)

| Action | Path | Responsibility |
|---|---|---|
| Create | `demo/src/components/PlaygroundOutputAccordion.tsx` | Copy of showcase accordion |
| Create | `demo/src/pages/playground-generators.ts` | Generator functions extracted from existing playground |
| Modify | `demo/src/pages/playground.tsx` | Refactored to use accordion; inline CopyButton removed |

---

## Task 1: PlaygroundOutputAccordion component (showcase)

**Files:**
- Create: `demo/src/components/PlaygroundOutputAccordion.tsx`

- [ ] **Step 1: Create the component**

```tsx
// demo/src/components/PlaygroundOutputAccordion.tsx
import React, { useState } from 'react'

interface PlaygroundOutputAccordionProps {
  title: string
  defaultOpen?: boolean
  copyText: string
  children: React.ReactNode
}

export function PlaygroundOutputAccordion({
  title,
  defaultOpen = false,
  copyText,
  children,
}: PlaygroundOutputAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '6px',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          background: 'var(--ifm-color-emphasis-100)',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            flex: 1,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--ifm-font-color-base)',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: 0,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              fontSize: '0.7rem',
            }}
          >
            ▶
          </span>
          {title}
        </button>
        <button
          className="button button--sm button--secondary"
          onClick={copy}
          style={{ flexShrink: 0 }}
        >
          {copied ? '✅ Copied' : 'Copy'}
        </button>
      </div>
      {open && (
        <div style={{ padding: '1rem', overflowX: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/components/PlaygroundOutputAccordion.tsx
git commit -m "feat(demo): add PlaygroundOutputAccordion component"
```

---

## Task 2: Showcase playground generators + unit tests

**Files:**
- Create: `demo/src/pages/playground-generators.ts`
- Create: `tests/playground-generators.test.ts`

- [ ] **Step 1: Write the failing tests first**

```ts
// tests/playground-generators.test.ts
import { describe, it, expect } from 'vitest'
import {
  generateTsConfig,
  generateJsConfig,
  generateSampleYaml,
  generateSchema,
} from '../demo/src/pages/playground-generators'
import type { PlaygroundState } from '../demo/src/pages/playground-generators'

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
```

- [ ] **Step 2: Run tests to verify they fail (module not found is expected)**

```bash
npx vitest run tests/playground-generators.test.ts
```

Expected: FAIL — `Cannot find module '../demo/src/pages/playground-generators'`

- [ ] **Step 3: Create the generators file**

```ts
// demo/src/pages/playground-generators.ts

export type IconKey =
  | ''
  | 'circle-check'
  | 'circle-minus'
  | 'circle-x'
  | 'docusaurus'
  | 'heart'
  | 'plus-square'

export interface TagEntry {
  key: string
  label: string
  description: string
  color: string
  icon: IconKey
}

export interface StatusEntry {
  key: string
  label: string
  description: string
  color: string
  icon: IconKey
}

interface ScalarOptions {
  routeBasePath: string
  dataDir: string
  pageTitle: string
  pageDescription: string
  submitUrl: string
  screenshotUrl: string
  favouriteTag: string
}

export interface PresetModeState extends ScalarOptions {
  mode: 'preset'
  preset: 'plugins' | 'sites'
}

export interface CustomModeState extends ScalarOptions {
  mode: 'custom'
  tags: TagEntry[]
  statuses: StatusEntry[]
}

export type PlaygroundState = PresetModeState | CustomModeState

// Tag keys for each preset, in declaration order
const PLUGINS_PRESET_TAGS = [
  'favourite', 'docusaurus', 'search', 'api', 'utility',
  'content', 'theme', 'markdown', 'analytics', 'integration', 'seo', 'editing',
]
const SITES_PRESET_TAGS = [
  'favorite', 'opensource', 'product', 'design', 'i18n',
  'versioning', 'large', 'meta', 'personal', 'rtl',
]

function buildScalarLines(s: ScalarOptions, indent: string): string[] {
  const lines: string[] = []
  if (s.pageTitle) lines.push(`${indent}pageTitle: '${s.pageTitle}',`)
  if (s.pageDescription) lines.push(`${indent}pageDescription: '${s.pageDescription}',`)
  if (s.submitUrl) lines.push(`${indent}submitUrl: '${s.submitUrl}',`)
  if (s.screenshotUrl) lines.push(`${indent}screenshotUrl: '${s.screenshotUrl}',`)
  if (s.favouriteTag) lines.push(`${indent}favouriteTag: '${s.favouriteTag}',`)
  return lines
}

function buildTagLines(tags: TagEntry[], indent: string): string[] {
  return tags.flatMap((t) => {
    const props = [
      `${indent}  label: '${t.label}',`,
      `${indent}  description: '${t.description}',`,
      `${indent}  color: '${t.color}',`,
      ...(t.icon ? [`${indent}  icon: '${t.icon}',`] : []),
    ]
    return [`${indent}${t.key}: {`, ...props, `${indent}},`]
  })
}

function buildStatusLines(statuses: StatusEntry[], indent: string): string[] {
  return statuses.flatMap((s) => {
    const props = [
      `${indent}  label: '${s.label}',`,
      `${indent}  description: '${s.description}',`,
      ...(s.color ? [`${indent}  color: '${s.color}',`] : []),
      ...(s.icon ? [`${indent}  icon: '${s.icon}',`] : []),
    ]
    return [`${indent}${s.key}: {`, ...props, `${indent}},`]
  })
}

export function generateTsConfig(state: PlaygroundState): string {
  const i = '        ' // 8 spaces — inside plugin options object
  const i4 = '    '   // 4 spaces — inside plugins array

  if (state.mode === 'preset') {
    const presetName = state.preset === 'plugins' ? 'pluginsPreset' : 'sitesPreset'
    return [
      `import type { Config } from '@docusaurus/types'`,
      `import { ${presetName} } from '@homotechsual/docusaurus-plugin-showcase/presets'`,
      ``,
      `export default {`,
      `  plugins: [`,
      `    [`,
      `      '@homotechsual/docusaurus-plugin-showcase',`,
      `      {`,
      `${i}...${presetName},`,
      `${i}dataDir: '${state.dataDir || './data'}',`,
      `${i}routeBasePath: '${state.routeBasePath || 'showcase'}',`,
      ...buildScalarLines(state, i),
      `      },`,
      `    ],`,
      `  ],`,
      `} satisfies Config`,
    ].join('\n')
  }

  // Custom mode
  const lines = [
    `import type { Config } from '@docusaurus/types'`,
    `import type { PluginOptions } from '@homotechsual/docusaurus-plugin-showcase'`,
    ``,
    `export default {`,
    `  plugins: [`,
    `    [`,
    `      '@homotechsual/docusaurus-plugin-showcase',`,
    `      {`,
    `${i}dataDir: '${state.dataDir || './data'}',`,
    `${i}routeBasePath: '${state.routeBasePath || 'showcase'}',`,
    ...buildScalarLines(state, i),
  ]

  if (state.tags.length > 0) {
    lines.push(`${i}tags: {`)
    lines.push(...buildTagLines(state.tags, `${i}  `))
    lines.push(`${i}},`)
  }

  if (state.statuses.length > 0) {
    lines.push(`${i}statuses: {`)
    lines.push(...buildStatusLines(state.statuses, `${i}  `))
    lines.push(`${i}},`)
  }

  lines.push(`      } satisfies PluginOptions,`, `    ],`, `  ],`, `} satisfies Config`)
  return lines.join('\n')
}

export function generateJsConfig(state: PlaygroundState): string {
  const i = '        '

  if (state.mode === 'preset') {
    const presetName = state.preset === 'plugins' ? 'pluginsPreset' : 'sitesPreset'
    return [
      `const { ${presetName} } = require('@homotechsual/docusaurus-plugin-showcase/presets')`,
      ``,
      `module.exports = {`,
      `  plugins: [`,
      `    [`,
      `      '@homotechsual/docusaurus-plugin-showcase',`,
      `      {`,
      `${i}...${presetName},`,
      `${i}dataDir: '${state.dataDir || './data'}',`,
      `${i}routeBasePath: '${state.routeBasePath || 'showcase'}',`,
      ...buildScalarLines(state, i),
      `      },`,
      `    ],`,
      `  ],`,
      `}`,
    ].join('\n')
  }

  const lines = [
    `module.exports = {`,
    `  plugins: [`,
    `    [`,
    `      '@homotechsual/docusaurus-plugin-showcase',`,
    `      {`,
    `${i}dataDir: '${state.dataDir || './data'}',`,
    `${i}routeBasePath: '${state.routeBasePath || 'showcase'}',`,
    ...buildScalarLines(state, i),
  ]

  if (state.tags.length > 0) {
    lines.push(`${i}tags: {`)
    lines.push(...buildTagLines(state.tags, `${i}  `))
    lines.push(`${i}},`)
  }

  if (state.statuses.length > 0) {
    lines.push(`${i}statuses: {`)
    lines.push(...buildStatusLines(state.statuses, `${i}  `))
    lines.push(`${i}},`)
  }

  lines.push(`      },`, `    ],`, `  ],`, `}`)
  return lines.join('\n')
}

export function generateSampleYaml(state: PlaygroundState): string {
  let tagKeys: string[]

  if (state.mode === 'preset') {
    const all = state.preset === 'plugins' ? PLUGINS_PRESET_TAGS : SITES_PRESET_TAGS
    tagKeys = all.slice(0, 2)
  } else {
    tagKeys = state.tags.slice(0, 2).map((t) => t.key)
  }

  const tagsBlock =
    tagKeys.length === 0
      ? 'tags: []'
      : ['tags:', ...tagKeys.map((k) => `  - ${k}`)].join('\n')

  return [
    `id: author.my-item`,
    `name: My Item`,
    `description: A brief description of this item.`,
    `website: https://example.com`,
    tagsBlock,
  ].join('\n')
}

export function generateSchema(state: PlaygroundState): string {
  if (state.mode === 'preset') {
    const schemaFile =
      state.preset === 'plugins'
        ? 'plugins-preset/1.0.0.json'
        : 'sites-preset/1.0.0.json'
    return [
      `# Add this line to your YAML data files for editor validation:`,
      `# $schema: ./node_modules/@homotechsual/docusaurus-plugin-showcase/schema/${schemaFile}`,
    ].join('\n')
  }

  // Custom mode: generate a full JSON schema
  const tagEnum = state.tags.map((t) => t.key)
  const statusEnum = [...state.statuses.map((s) => s.key), null]

  const schema: Record<string, unknown> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'custom-showcase-schema',
    title: 'ShowcaseItem',
    type: 'object',
    required: ['id', 'name', 'description', 'website'],
    additionalProperties: true,
    properties: {
      id: { type: 'string', description: "Unique identifier (e.g. 'author.item-name')" },
      name: { type: 'string' },
      description: { type: 'string' },
      website: { type: 'string', format: 'uri' },
      source: { type: ['string', 'null'], format: 'uri' },
      preview: { type: ['string', 'null'] },
      author: { type: ['string', 'null'] },
      tags: {
        type: 'array',
        items:
          tagEnum.length > 0
            ? { type: 'string', enum: tagEnum }
            : { type: 'string' },
      },
      status:
        state.statuses.length > 0
          ? { type: ['string', 'null'], enum: statusEnum }
          : { type: ['string', 'null'] },
      npmPackages: { type: ['array', 'null'], items: { type: 'string' } },
      minimumVersion: { type: ['string', 'null'] },
    },
  }

  return JSON.stringify(schema, null, 2)
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run tests/playground-generators.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add demo/src/pages/playground-generators.ts tests/playground-generators.test.ts
git commit -m "feat(demo): add playground generators with unit tests"
```

---

## Task 3: Showcase playground page

**Files:**
- Create: `demo/src/pages/playground.tsx`

- [ ] **Step 1: Create the playground page**

```tsx
// demo/src/pages/playground.tsx
import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { PlaygroundOutputAccordion } from '../components/PlaygroundOutputAccordion'
import {
  generateTsConfig,
  generateJsConfig,
  generateSampleYaml,
  generateSchema,
} from './playground-generators'
import type { PlaygroundState, TagEntry, StatusEntry, IconKey } from './playground-generators'

// ── Tag keys for favouriteTag <select> in preset mode ──────────────────────
const PLUGINS_PRESET_TAG_KEYS = [
  'favourite', 'docusaurus', 'search', 'api', 'utility',
  'content', 'theme', 'markdown', 'analytics', 'integration', 'seo', 'editing',
]
const SITES_PRESET_TAG_KEYS = [
  'favorite', 'opensource', 'product', 'design', 'i18n',
  'versioning', 'large', 'meta', 'personal', 'rtl',
]
const ICON_OPTIONS: { value: IconKey; label: string }[] = [
  { value: '', label: '(none)' },
  { value: 'circle-check', label: 'circle-check' },
  { value: 'circle-minus', label: 'circle-minus' },
  { value: 'circle-x', label: 'circle-x' },
  { value: 'docusaurus', label: 'docusaurus' },
  { value: 'heart', label: 'heart' },
  { value: 'plus-square', label: 'plus-square' },
]

// ── Shared input style ─────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '0.25rem',
  padding: '0.4rem 0.6rem',
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: '4px',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontFamily: 'var(--ifm-font-family-base)',
  fontSize: '0.9rem',
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }

// ── Default states ─────────────────────────────────────────────────────────
const SCALAR_DEFAULTS = {
  routeBasePath: 'showcase',
  dataDir: './data',
  pageTitle: '',
  pageDescription: '',
  submitUrl: '',
  screenshotUrl: '',
  favouriteTag: '',
}

const defaultPresetState: PlaygroundState = {
  mode: 'preset',
  preset: 'plugins',
  ...SCALAR_DEFAULTS,
  favouriteTag: 'favourite',
}

const defaultCustomState: PlaygroundState = {
  mode: 'custom',
  ...SCALAR_DEFAULTS,
  tags: [
    { key: 'example', label: 'Example', description: 'An example tag.', color: '#3ecc5f', icon: '' },
  ],
  statuses: [],
}

// ── Helpers ────────────────────────────────────────────────────────────────
function extractScalars(s: PlaygroundState) {
  return {
    routeBasePath: s.routeBasePath,
    dataDir: s.dataDir,
    pageTitle: s.pageTitle,
    pageDescription: s.pageDescription,
    submitUrl: s.submitUrl,
    screenshotUrl: s.screenshotUrl,
    favouriteTag: s.favouriteTag,
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ScalarFields({
  state,
  favouriteTagKeys,
  onChange,
}: {
  state: PlaygroundState
  favouriteTagKeys: string[]
  onChange: (key: keyof typeof SCALAR_DEFAULTS, value: string) => void
}) {
  return (
    <>
      {(
        [
          ['routeBasePath', 'routeBasePath', 'URL path for the showcase page'],
          ['dataDir', 'dataDir', 'Path to your YAML data directory'],
          ['pageTitle', 'pageTitle', 'Optional page heading'],
          ['pageDescription', 'pageDescription', 'Optional subtitle below the heading'],
          ['submitUrl', 'submitUrl', 'URL for "Add an item" button (optional)'],
          ['screenshotUrl', 'screenshotUrl', 'Screenshot service template URL (optional)'],
        ] as [keyof typeof SCALAR_DEFAULTS, string, string][]
      ).map(([key, label, hint]) => (
        <div key={key} style={fieldStyle}>
          <label htmlFor={key}>
            <strong>{label}</strong>
            <small style={{ display: 'block', color: 'var(--ifm-color-emphasis-700)' }}>{hint}</small>
          </label>
          <input
            id={key}
            type="text"
            value={state[key] as string}
            onChange={(e) => onChange(key, e.target.value)}
            style={inputStyle}
          />
        </div>
      ))}
      <div style={fieldStyle}>
        <label htmlFor="favouriteTag">
          <strong>favouriteTag</strong>
          <small style={{ display: 'block', color: 'var(--ifm-color-emphasis-700)' }}>
            Tag key to display as "Our favourites" section (optional)
          </small>
        </label>
        <select
          id="favouriteTag"
          value={state.favouriteTag}
          onChange={(e) => onChange('favouriteTag', e.target.value)}
          style={inputStyle}
        >
          <option value="">(none)</option>
          {favouriteTagKeys.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
    </>
  )
}

function TagRow({
  tag,
  onChange,
  onRemove,
}: {
  tag: TagEntry
  onChange: (updated: TagEntry) => void
  onRemove: () => void
}) {
  const cellStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', verticalAlign: 'middle' }
  const cellInputStyle: React.CSSProperties = { ...inputStyle, marginTop: 0 }
  return (
    <tr>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={tag.key} onChange={(e) => onChange({ ...tag, key: e.target.value })} placeholder="key" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={tag.label} onChange={(e) => onChange({ ...tag, label: e.target.value })} placeholder="Label" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={tag.description} onChange={(e) => onChange({ ...tag, description: e.target.value })} placeholder="Description" />
      </td>
      <td style={{ ...cellStyle, textAlign: 'center' }}>
        <input type="color" value={tag.color} onChange={(e) => onChange({ ...tag, color: e.target.value })} style={{ width: '2.5rem', height: '2rem', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} />
      </td>
      <td style={cellStyle}>
        <select style={cellInputStyle} value={tag.icon} onChange={(e) => onChange({ ...tag, icon: e.target.value as IconKey })}>
          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <button className="button button--sm button--danger" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  )
}

function StatusRow({
  status,
  onChange,
  onRemove,
}: {
  status: StatusEntry
  onChange: (updated: StatusEntry) => void
  onRemove: () => void
}) {
  const cellStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', verticalAlign: 'middle' }
  const cellInputStyle: React.CSSProperties = { ...inputStyle, marginTop: 0 }
  return (
    <tr>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={status.key} onChange={(e) => onChange({ ...status, key: e.target.value })} placeholder="key" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={status.label} onChange={(e) => onChange({ ...status, label: e.target.value })} placeholder="Label" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={status.description} onChange={(e) => onChange({ ...status, description: e.target.value })} placeholder="Description" />
      </td>
      <td style={{ ...cellStyle, textAlign: 'center' }}>
        <input type="color" value={status.color} onChange={(e) => onChange({ ...status, color: e.target.value })} style={{ width: '2.5rem', height: '2rem', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} />
      </td>
      <td style={cellStyle}>
        <select style={cellInputStyle} value={status.icon} onChange={(e) => onChange({ ...status, icon: e.target.value as IconKey })}>
          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <button className="button button--sm button--danger" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  )
}

function EntryTable({ label, rows, onAddRow }: { label: string; rows: React.ReactNode; onAddRow: () => void }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <strong>{label}</strong>
        <button className="button button--sm button--secondary" onClick={onAddRow}>+ Add</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--ifm-color-emphasis-100)' }}>
              {['key', 'label', 'description', 'color', 'icon', ''].map((h) => (
                <th key={h} style={{ padding: '0.35rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [state, setState] = useState<PlaygroundState>(defaultPresetState)

  function switchMode(mode: 'preset' | 'custom') {
    if (mode === state.mode) return
    const scalars = extractScalars(state)
    if (mode === 'preset') {
      setState({ ...defaultPresetState, ...scalars, favouriteTag: 'favourite' })
    } else {
      setState({ ...defaultCustomState, ...scalars, favouriteTag: '' })
    }
  }

  function updateScalar(key: keyof typeof SCALAR_DEFAULTS, value: string) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const tsConfig = generateTsConfig(state)
  const jsConfig = generateJsConfig(state)
  const sampleYaml = generateSampleYaml(state)
  const schema = generateSchema(state)

  const favouriteTagKeys =
    state.mode === 'preset'
      ? state.preset === 'plugins'
        ? PLUGINS_PRESET_TAG_KEYS
        : SITES_PRESET_TAG_KEYS
      : (state as import('./playground-generators').CustomModeState).tags.map((t) => t.key)

  const modeBtnBase: React.CSSProperties = {
    padding: '0.35rem 1rem',
    border: '1px solid var(--ifm-color-emphasis-300)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  }

  return (
    <Layout title="Config Playground" description="Interactively build your Showcase plugin configuration">
      <main className="container margin-vert--lg">
        <Heading as="h1">Config Playground</Heading>
        <p>Configure the plugin options and see the generated Docusaurus config, sample data file, and JSON Schema update in real time.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* ── Left: Controls ── */}
          <div>
            {/* Mode toggle */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
              {(['preset', 'custom'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    ...modeBtnBase,
                    background: state.mode === m ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                    color: state.mode === m ? '#fff' : 'var(--ifm-font-color-base)',
                    borderRadius: m === 'preset' ? '6px 0 0 6px' : '0 6px 6px 0',
                  }}
                >
                  {m === 'preset' ? 'Preset' : 'Custom'}
                </button>
              ))}
            </div>

            {state.mode === 'preset' && (
              <div style={fieldStyle}>
                <label><strong>Preset</strong></label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  {(['plugins', 'sites'] as const).map((p) => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="preset"
                        value={p}
                        checked={state.preset === p}
                        onChange={() => setState((prev) => ({
                          ...prev,
                          preset: p,
                          favouriteTag: p === 'plugins' ? 'favourite' : 'favorite',
                        } as PlaygroundState))}
                      />
                      {p === 'plugins' ? 'Plugins Directory' : 'Sites Directory'}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <ScalarFields state={state} favouriteTagKeys={favouriteTagKeys} onChange={updateScalar} />

            {state.mode === 'custom' && (() => {
              const customState = state as import('./playground-generators').CustomModeState
              return (
                <>
                  <EntryTable
                    label="Tags"
                    onAddRow={() =>
                      setState((prev) => ({
                        ...prev,
                        tags: [
                          ...(prev as import('./playground-generators').CustomModeState).tags,
                          { key: '', label: '', description: '', color: '#3ecc5f', icon: '' },
                        ],
                      } as PlaygroundState))
                    }
                    rows={customState.tags.map((tag, i) => (
                      <TagRow
                        key={i}
                        tag={tag}
                        onChange={(updated) =>
                          setState((prev) => {
                            const tags = [...(prev as import('./playground-generators').CustomModeState).tags]
                            tags[i] = updated
                            return { ...prev, tags } as PlaygroundState
                          })
                        }
                        onRemove={() =>
                          setState((prev) => {
                            const tags = (prev as import('./playground-generators').CustomModeState).tags.filter((_, idx) => idx !== i)
                            return { ...prev, tags } as PlaygroundState
                          })
                        }
                      />
                    ))}
                  />
                  <EntryTable
                    label="Statuses"
                    onAddRow={() =>
                      setState((prev) => ({
                        ...prev,
                        statuses: [
                          ...(prev as import('./playground-generators').CustomModeState).statuses,
                          { key: '', label: '', description: '', color: '#39ca30', icon: '' },
                        ],
                      } as PlaygroundState))
                    }
                    rows={customState.statuses.map((status, i) => (
                      <StatusRow
                        key={i}
                        status={status}
                        onChange={(updated) =>
                          setState((prev) => {
                            const statuses = [...(prev as import('./playground-generators').CustomModeState).statuses]
                            statuses[i] = updated
                            return { ...prev, statuses } as PlaygroundState
                          })
                        }
                        onRemove={() =>
                          setState((prev) => {
                            const statuses = (prev as import('./playground-generators').CustomModeState).statuses.filter((_, idx) => idx !== i)
                            return { ...prev, statuses } as PlaygroundState
                          })
                        }
                      />
                    ))}
                  />
                </>
              )
            })()}
          </div>

          {/* ── Right: Output ── */}
          <div>
            <PlaygroundOutputAccordion title="docusaurus.config.ts" defaultOpen copyText={tsConfig}>
              <pre style={{ margin: 0 }}><code>{tsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="docusaurus.config.js" copyText={jsConfig}>
              <pre style={{ margin: 0 }}><code>{jsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="Sample YAML item" defaultOpen copyText={sampleYaml}>
              <pre style={{ margin: 0 }}><code>{sampleYaml}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="JSON Schema" copyText={schema}>
              <pre style={{ margin: 0 }}><code>{schema}</code></pre>
            </PlaygroundOutputAccordion>
          </div>
        </div>
      </main>
    </Layout>
  )
}
```

- [ ] **Step 2: Start the demo dev server and open the playground**

```bash
cd demo && npm start
```

Open http://localhost:3000/playground in your browser.

- [ ] **Step 3: Manual verification checklist**

Verify all of the following:
- [ ] Page loads without errors (check browser console)
- [ ] Mode toggle switches between Preset and Custom — scalar fields survive the switch
- [ ] Preset mode: switching between "Plugins Directory" / "Sites Directory" radios updates `favouriteTag` select options and all four output panels
- [ ] Preset mode: filling in `pageTitle` adds it to the generated config; clearing it removes it
- [ ] Custom mode: "Add" button adds a new empty row to Tags table; "Remove" removes it
- [ ] Custom mode: adding tags updates `favouriteTag` select and all output panels live
- [ ] Custom mode: adding statuses causes `statuses:` block to appear in TS/JS outputs and updates schema
- [ ] Schema accordion (collapsed by default): expanding it shows correct content for both modes
- [ ] Copy button on each accordion writes to clipboard (paste into a text editor to verify)
- [ ] Dark mode: toggle Docusaurus dark mode — accordion headers, inputs, and code blocks render correctly

- [ ] **Step 4: Commit**

```bash
git add demo/src/pages/playground.tsx
git commit -m "feat(demo): add Config Playground page"
```

---

## Task 4: Wire navigation

**Files:**
- Modify: `demo/docusaurus.config.ts`

- [ ] **Step 1: Add Playground to navbar**

In `demo/docusaurus.config.ts`, add to `themeConfig.navbar.items` (after the Docs entry, before GitHub):

```ts
{ to: '/playground', label: 'Playground', position: 'left' },
```

The full `navbar.items` array should look like:
```ts
items: [
  { to: '/plugins', label: 'Plugin Preset Demo', position: 'left' },
  { to: '/sites', label: 'Sites Preset Demo', position: 'left' },
  { to: '/tools', label: 'Custom Showcase Demo', position: 'left' },
  { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
  { to: '/playground', label: 'Playground', position: 'left' },
  {
    to: 'https://github.com/homotechsual/docusaurus-plugin-showcase',
    label: 'GitHub',
    position: 'right',
    target: '_blank',
    className: 'github-link',
  },
],
```

- [ ] **Step 2: Add Playground to footer**

In `themeConfig.footer.links`, add `{ label: 'Config Playground', to: '/playground' }` to the first column (`title: 'Plugin'`):

```ts
{
  title: 'Plugin',
  items: [
    { label: 'Plugins Preset Demo', to: '/plugins' },
    { label: 'Sites Preset Demo', to: '/sites' },
    { label: 'Custom Showcase Demo', to: '/tools' },
    { label: 'Documentation', to: '/docs/intro' },
    { label: 'Config Playground', to: '/playground' },
  ],
},
```

- [ ] **Step 3: Verify links appear**

With the dev server still running (or restart it), confirm:
- Navbar shows "Playground" link and clicking it navigates to `/playground`
- Footer shows "Config Playground" link

- [ ] **Step 4: Commit**

```bash
git add demo/docusaurus.config.ts
git commit -m "feat(demo): add Playground to navbar and footer navigation"
```

---

## Task 5: Backport accordion to plausible demo

**Files:**
- Create: `j:/Projects/docusaurus-plugin-plausible/demo/src/components/PlaygroundOutputAccordion.tsx`

- [ ] **Step 1: Check whether `demo/src/components/` exists in the plausible repo**

```bash
ls j:/Projects/docusaurus-plugin-plausible/demo/src/
```

If the `components/` directory does not exist, create it:
```bash
mkdir j:/Projects/docusaurus-plugin-plausible/demo/src/components
```

- [ ] **Step 2: Copy the accordion component**

The file content is identical to the one created in Task 1. Create:

```tsx
// j:/Projects/docusaurus-plugin-plausible/demo/src/components/PlaygroundOutputAccordion.tsx
// (Identical content to showcase's PlaygroundOutputAccordion.tsx — see Task 1 Step 1)
```

Copy the exact content from `j:/Projects/docusaurus-plugin-showcase/demo/src/components/PlaygroundOutputAccordion.tsx`.

- [ ] **Step 3: Commit in the plausible repo**

```bash
cd j:/Projects/docusaurus-plugin-plausible
git add demo/src/components/PlaygroundOutputAccordion.tsx
git commit -m "feat(demo): add PlaygroundOutputAccordion component"
```

---

## Task 6: Extract plausible generators

**Files:**
- Create: `j:/Projects/docusaurus-plugin-plausible/demo/src/pages/playground-generators.ts`

The current `playground.tsx` has five functions: `resolveScriptName`, `resolveScriptUrl`, `buildOptions`, `generateTsConfig`, `generateJsConfig`. Extract them (along with the `PlaygroundState` interface and `defaults`) into a separate file.

- [ ] **Step 1: Create the generators file**

```ts
// j:/Projects/docusaurus-plugin-plausible/demo/src/pages/playground-generators.ts

export interface PlaygroundState {
  domain: string
  customDomain: string
  hashBasedRouting: boolean
  outboundLinks: boolean
  fileDownloads: boolean
  taggedEvents: boolean
  revenue: boolean
  captureOnLocalhost: boolean
  manualPageviews: boolean
  compat: boolean
  pageviewProps: boolean
  excludePaths: string
  proxyApiEndpoint: string
}

export const defaults: PlaygroundState = {
  domain: 'your-site.com',
  customDomain: '',
  hashBasedRouting: false,
  outboundLinks: false,
  fileDownloads: false,
  taggedEvents: false,
  revenue: false,
  captureOnLocalhost: false,
  manualPageviews: false,
  compat: false,
  pageviewProps: false,
  excludePaths: '',
  proxyApiEndpoint: '',
}

export function resolveScriptName(s: PlaygroundState): string {
  const ext: string[] = []
  if (s.hashBasedRouting) ext.push('hash')
  if (s.outboundLinks) ext.push('outbound-links')
  if (s.fileDownloads) ext.push('file-downloads')
  if (s.taggedEvents) ext.push('tagged-events')
  if (s.revenue) ext.push('revenue')
  if (s.captureOnLocalhost) ext.push('local')
  if (s.manualPageviews) ext.push('manual')
  if (s.compat) ext.push('compat')
  if (s.pageviewProps) ext.push('pageview-props')
  return ext.length > 0 ? `plausible.${ext.join('.')}.js` : 'plausible.js'
}

export function resolveScriptUrl(s: PlaygroundState): string {
  return `https://${s.customDomain || 'plausible.io'}/js/${resolveScriptName(s)}`
}

function buildOptions(s: PlaygroundState): string[] {
  const lines: string[] = [`        domain: '${s.domain}',`]
  if (s.customDomain) lines.push(`        customDomain: '${s.customDomain}',`)
  if (s.hashBasedRouting) lines.push(`        hashBasedRouting: true,`)
  if (s.outboundLinks) lines.push(`        outboundLinks: true,`)
  if (s.fileDownloads) lines.push(`        fileDownloads: true,`)
  if (s.taggedEvents) lines.push(`        taggedEvents: true,`)
  if (s.revenue) lines.push(`        revenue: true,`)
  if (s.captureOnLocalhost) lines.push(`        captureOnLocalhost: true,`)
  if (s.manualPageviews) lines.push(`        manualPageviews: true,`)
  if (s.compat) lines.push(`        compat: true,`)
  if (s.pageviewProps) lines.push(`        pageviewProps: true,`)
  if (s.excludePaths) {
    const patterns = s.excludePaths.split('\n').map((p) => p.trim()).filter(Boolean)
    lines.push(`        excludePaths: [${patterns.map((p) => `'${p}'`).join(', ')}],`)
  }
  if (s.proxyApiEndpoint) lines.push(`        proxyApiEndpoint: '${s.proxyApiEndpoint}',`)
  return lines
}

export function generateTsConfig(s: PlaygroundState): string {
  return [
    `import plausiblePlugin from '@homotechsual/docusaurus-plugin-plausible'`,
    `import type { PluginOptions } from '@homotechsual/docusaurus-plugin-plausible'`,
    ``,
    `export default {`,
    `  plugins: [`,
    `    [`,
    `      plausiblePlugin,`,
    `      {`,
    ...buildOptions(s),
    `      } satisfies PluginOptions,`,
    `    ],`,
    `  ],`,
    `}`,
  ].join('\n')
}

export function generateJsConfig(s: PlaygroundState): string {
  return [
    `export default {`,
    `  plugins: [`,
    `    [`,
    `      '@homotechsual/docusaurus-plugin-plausible',`,
    `      {`,
    ...buildOptions(s),
    `      },`,
    `    ],`,
    `  ],`,
    `}`,
  ].join('\n')
}
```

- [ ] **Step 2: Commit in the plausible repo**

```bash
cd j:/Projects/docusaurus-plugin-plausible
git add demo/src/pages/playground-generators.ts
git commit -m "refactor(demo): extract playground generator functions"
```

---

## Task 7: Refactor plausible playground to use accordion

**Files:**
- Modify: `j:/Projects/docusaurus-plugin-plausible/demo/src/pages/playground.tsx`

- [ ] **Step 1: Rewrite playground.tsx to use accordion and imported generators**

Replace the entire file with:

```tsx
// j:/Projects/docusaurus-plugin-plausible/demo/src/pages/playground.tsx
import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { PlaygroundOutputAccordion } from '../components/PlaygroundOutputAccordion'
import {
  defaults,
  resolveScriptName,
  resolveScriptUrl,
  generateTsConfig,
  generateJsConfig,
} from './playground-generators'
import type { PlaygroundState } from './playground-generators'

const booleanOptions: {
  key: keyof PlaygroundState
  label: string
  description: string
}[] = [
  { key: 'hashBasedRouting', label: 'Hash-based routing', description: 'Track hash (#) route changes' },
  { key: 'outboundLinks', label: 'Outbound links', description: 'Track clicks on external links' },
  { key: 'fileDownloads', label: 'File downloads', description: 'Track file download clicks' },
  { key: 'taggedEvents', label: 'Tagged events', description: 'Track data-analytics tagged elements' },
  { key: 'revenue', label: 'Revenue', description: 'Track ecommerce revenue' },
  { key: 'captureOnLocalhost', label: 'Capture on localhost', description: 'Enable tracking in development' },
  { key: 'manualPageviews', label: 'Manual pageviews', description: 'Disable automatic pageview tracking' },
  { key: 'compat', label: 'Compat mode', description: 'Compatibility script for browsers that block the standard tracker' },
  { key: 'pageviewProps', label: 'Pageview props', description: 'Attach custom properties to every pageview' },
]

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '0.25rem',
  padding: '0.4rem 0.6rem',
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: '4px',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontFamily: 'var(--ifm-font-family-base)',
}

export default function PlaygroundPage() {
  const [state, setState] = useState<PlaygroundState>(defaults)

  function update<K extends keyof PlaygroundState>(key: K, value: PlaygroundState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const scriptName = resolveScriptName(state)
  const scriptUrl = resolveScriptUrl(state)
  const tsConfig = generateTsConfig(state)
  const jsConfig = generateJsConfig(state)

  return (
    <Layout
      title="Config Playground"
      description="Interactively build your Plausible plugin configuration"
    >
      <main className="container margin-vert--lg">
        <Heading as="h1">Config Playground</Heading>
        <p>
          Configure the plugin options and see the generated Docusaurus config and resolved script URL
          in real time.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* ── Controls ── */}
          <div>
            <Heading as="h2">Options</Heading>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="domain">
                <strong>domain</strong> <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                id="domain"
                type="text"
                value={state.domain}
                onChange={(e) => update('domain', e.target.value)}
                placeholder="your-site.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="customDomain">
                <strong>customDomain</strong>
              </label>
              <input
                id="customDomain"
                type="text"
                value={state.customDomain}
                onChange={(e) => update('customDomain', e.target.value)}
                placeholder="plausible.io"
                style={inputStyle}
              />
            </div>

            <Heading as="h3">Extensions</Heading>

            {booleanOptions.map(({ key, label, description }) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={state[key] as boolean}
                  onChange={(e) => update(key, e.target.checked as PlaygroundState[typeof key])}
                  style={{ marginTop: '0.3rem', flexShrink: 0 }}
                />
                <span>
                  <strong>{label}</strong>
                  <br />
                  <small style={{ color: 'var(--ifm-color-emphasis-700)' }}>{description}</small>
                </span>
              </label>
            ))}

            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <label htmlFor="excludePaths">
                <strong>excludePaths</strong>
              </label>
              <small style={{ display: 'block', color: 'var(--ifm-color-emphasis-700)' }}>
                One regex pattern per line (e.g. <code>^/admin</code>)
              </small>
              <textarea
                id="excludePaths"
                value={state.excludePaths}
                onChange={(e) => update('excludePaths', e.target.value)}
                rows={3}
                style={{ ...inputStyle, fontFamily: 'var(--ifm-font-family-monospace)' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="proxyApiEndpoint">
                <strong>proxyApiEndpoint</strong>
              </label>
              <input
                id="proxyApiEndpoint"
                type="text"
                value={state.proxyApiEndpoint}
                onChange={(e) => update('proxyApiEndpoint', e.target.value)}
                placeholder="https://your-site.com/api/event"
                style={inputStyle}
              />
            </div>
          </div>

          {/* ── Output ── */}
          <div>
            <Heading as="h2">Output</Heading>

            <div style={{ marginBottom: '1.5rem' }}>
              <Heading as="h3">Resolved script</Heading>
              <table>
                <tbody>
                  <tr>
                    <th style={{ paddingRight: '1rem', whiteSpace: 'nowrap' }}>Filename</th>
                    <td><code>{scriptName}</code></td>
                  </tr>
                  <tr>
                    <th style={{ paddingRight: '1rem', whiteSpace: 'nowrap' }}>Full URL</th>
                    <td><code style={{ wordBreak: 'break-all' }}>{scriptUrl}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <PlaygroundOutputAccordion title="docusaurus.config.ts" defaultOpen copyText={tsConfig}>
              <pre style={{ margin: 0 }}><code>{tsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="docusaurus.config.js" defaultOpen copyText={jsConfig}>
              <pre style={{ margin: 0 }}><code>{jsConfig}</code></pre>
            </PlaygroundOutputAccordion>
          </div>
        </div>
      </main>
    </Layout>
  )
}
```

- [ ] **Step 2: Start the plausible demo dev server and verify the playground**

```bash
cd j:/Projects/docusaurus-plugin-plausible/demo && npm start
```

Open http://localhost:3000/playground. Verify:
- [ ] Page loads without errors
- [ ] Resolved script section still shows filename and URL correctly
- [ ] Accordion for `docusaurus.config.ts` is open by default and shows TS config
- [ ] Accordion for `docusaurus.config.js` is open by default and shows JS config
- [ ] Copy button on each accordion writes the correct text to clipboard
- [ ] Dark mode renders correctly

- [ ] **Step 3: Commit in the plausible repo**

```bash
cd j:/Projects/docusaurus-plugin-plausible
git add demo/src/pages/playground.tsx
git commit -m "refactor(demo): use PlaygroundOutputAccordion for output panels"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All spec requirements have corresponding tasks — accordion component (Task 1), generators (Task 2), playground page (Task 3), navigation (Task 4), plausible backport (Tasks 5–7)
- [x] **No placeholders:** All code blocks are complete and runnable
- [x] **Type consistency:** `PlaygroundState`, `TagEntry`, `StatusEntry`, `IconKey` defined in `playground-generators.ts` Task 2 and imported correctly in `playground.tsx` Task 3. `CustomModeState` imported as a type cast where needed.
- [x] **Generator exports match test imports:** All four generator functions and `PlaygroundState` type are exported from `playground-generators.ts` and imported by name in the test file
