import { readFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'
import yaml from 'js-yaml'
import { Ajv2020 as Ajv } from 'ajv/dist/2020.js'
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
  } else {
    warn(`[docusaurus-plugin-showcase] Schema file not found at "${schemaPath}" — validation skipped.`)
  }

  const yamlFiles = globSync('**/*.yaml', { cwd: dataDir, absolute: true })
  const items: ShowcaseItem[] = []

  for (const filePath of yamlFiles) {
    try {
      const raw = yaml.load(readFileSync(filePath, 'utf-8'))

      if (typeof raw !== 'object' || raw === null) {
        warn(`[docusaurus-plugin-showcase] Expected object in "${filePath}", got ${typeof raw} — item skipped.`)
        continue
      }

      // title → name alias (compatible with Docusaurus site showcase format)
      const item = raw as Record<string, unknown>
      if (!item.name && item.title) {
        item.name = item.title
        delete item.title
      }

      if (validate && !validate(item)) {
        const errors = ajv.errorsText(validate.errors)
        warn(`[docusaurus-plugin-showcase] Validation failed for "${filePath}": ${errors} — item skipped.`)
        continue
      }

      items.push(item as ShowcaseItem)
    } catch (err) {
      warn(`[docusaurus-plugin-showcase] Failed to parse "${filePath}": ${String(err)} — item skipped.`)
    }
  }

  return items
}
