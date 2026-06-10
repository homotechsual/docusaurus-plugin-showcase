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
