import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'
import yaml from 'js-yaml'
import { Ajv } from 'ajv'
import type { ShowcaseItem, PluginOptions } from '../core/types.js'

type WarnFn = (message: string) => void

export async function loadShowcaseItems(
  siteDir: string,
  options: Pick<PluginOptions, 'dataDir' | 'routeBasePath' | 'tags' | 'statuses'> & { schemaPath?: string | null },
  warn: WarnFn,
): Promise<ShowcaseItem[]> {
  const dataDir = resolve(siteDir, options.dataDir)

  if (!existsSync(dataDir)) {
    warn(`[docusaurus-plugin-showcase] dataDir "${dataDir}" does not exist — no items loaded.`)
    return []
  }

  const schemaPath =
    options.schemaPath ??
    fileURLToPath(new URL('../../schema/showcase/1.0.0.json', import.meta.url))

  const ajv = new Ajv({ allErrors: true, strict: false })
  let validate: ReturnType<typeof ajv.compile> | null = null

  if (existsSync(schemaPath)) {
    try {
      const schema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as object
      validate = ajv.compile(schema)
    } catch (err) {
      warn(`[docusaurus-plugin-showcase] Could not load schema from "${schemaPath}": ${String(err)}`)
    }
  }

  const yamlFiles = globSync('**/*.yaml', { cwd: dataDir, absolute: true })
  const items: ShowcaseItem[] = []

  for (const filePath of yamlFiles) {
    try {
      const raw = yaml.load(readFileSync(filePath, 'utf-8'))

      if (validate && !validate(raw)) {
        const errors = ajv.errorsText(validate.errors)
        warn(`[docusaurus-plugin-showcase] Validation failed for "${filePath}": ${errors} — item skipped.`)
        continue
      }

      items.push(raw as ShowcaseItem)
    } catch (err) {
      warn(`[docusaurus-plugin-showcase] Failed to parse "${filePath}": ${String(err)} — item skipped.`)
    }
  }

  return items
}
