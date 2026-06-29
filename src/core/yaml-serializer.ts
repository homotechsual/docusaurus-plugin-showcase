import type { ShowcaseItem } from './types.js'

function yamlStr(v: unknown): string {
  return v == null ? 'null' : String(v)
}

function yamlQuoted(v: unknown): string {
  if (v == null) return 'null'
  return `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function serializePluginYaml(item: Partial<ShowcaseItem>, schemaUrl?: string | null): string {
  const lines: string[] = []

  if (schemaUrl) {
    lines.push(`# yaml-language-server: $schema=${schemaUrl}`)
  }

  lines.push(`id: ${yamlStr(item.id)}`)
  lines.push(`name: ${yamlQuoted(item.name)}`)
  lines.push(`description: ${yamlQuoted(item.description)}`)
  lines.push(`preview: ${yamlStr(item.preview)}`)
  lines.push(`website: ${yamlStr(item.website)}`)
  lines.push(`source: ${yamlStr(item.source)}`)
  lines.push(`author: ${yamlStr(item.author)}`)

  const tags = item.tags ?? []
  if (tags.length > 0) {
    lines.push('tags:')
    for (const tag of tags) {
      lines.push(`  - ${tag}`)
    }
  } else {
    lines.push('tags: []')
  }

  lines.push(`minimumVersion: ${yamlStr(item.minimumVersion)}`)
  lines.push(`status: ${yamlStr(item.status)}`)

  const pkgs = item.npmPackages ?? []
  if (pkgs.length > 0) {
    lines.push('npmPackages:')
    for (const pkg of pkgs) {
      lines.push(`  - ${pkg}`)
    }
  } else {
    lines.push('npmPackages: []')
  }

  return lines.join('\n') + '\n'
}
