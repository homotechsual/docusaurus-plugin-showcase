import { dirname, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import type { LoadContext, OptionValidationContext, Plugin } from '@docusaurus/types'
import type { PluginOptions, ShowcasePageData } from './core/types.js'
import { loadShowcaseItems } from './loaders/yaml.js'
import { generateShowcaseModule } from './core/module-generator.js'

function pluginShowcase(
  context: LoadContext,
  options: PluginOptions,
): Plugin<ShowcasePageData> {
  return {
    name: 'docusaurus-plugin-showcase',

    getThemePath() {
      return join(dirname(fileURLToPath(import.meta.url)), 'theme')
    },

    async loadContent(): Promise<ShowcasePageData> {
      const items = await loadShowcaseItems(
        context.siteDir,
        options,
        (msg) => console.warn(msg),
      )
      const computedFields = Object.fromEntries(
        Object.entries(options.computedFields ?? {}).map(([key, field]) => {
          if (typeof field.resolver === 'function') {
            throw new Error('[docusaurus-plugin-showcase] Computed resolvers must be module references in plugin config.')
          }
          const module = field.resolver.module.startsWith('@site/')
            ? resolve(context.siteDir, field.resolver.module.slice(6))
            : createRequire(join(context.siteDir, 'package.json')).resolve(field.resolver.module)
          return [key, { ...field, resolver: { ...field.resolver, module } }]
        }),
      )
      return { items, options: { ...options, computedFields } }
    },

    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions

      const showcaseDataPath = await createData(
        'showcase-data.js',
        generateShowcaseModule(content),
      )

      addRoute({
        path: `/${options.routeBasePath}`,
        component: '@theme/ShowcasePage',
        modules: { showcase: showcaseDataPath },
        exact: true,
      })

      if (options.submitFormPath) {
        const formPath = `/${[options.routeBasePath, options.submitFormPath.replace(/^\//, '')].filter(Boolean).join('/')}`
        addRoute({
          path: formPath,
          component: '@theme/ShowcaseForm',
          modules: { showcase: showcaseDataPath },
          exact: true,
        })
      }
    },
  }
}

export function validateOptions({
  options,
}: OptionValidationContext<unknown, PluginOptions>): PluginOptions {
  const opts = options as Partial<PluginOptions>

  if (!opts.dataDir) {
    throw new Error('[docusaurus-plugin-showcase] The `dataDir` option is required.')
  }
  if (!opts.tags || Object.keys(opts.tags).length === 0) {
    throw new Error('[docusaurus-plugin-showcase] The `tags` option must define at least one tag.')
  }
  if (opts.defaultFilters !== undefined) {
    if (!opts.defaultFilters || typeof opts.defaultFilters !== 'object' || Array.isArray(opts.defaultFilters)) {
      throw new Error('[docusaurus-plugin-showcase] The `defaultFilters` option must be an object.')
    }
    for (const [filterType, values] of Object.entries(opts.defaultFilters)) {
      if (filterType !== 'tags' && filterType !== 'statuses') {
        throw new Error(`[docusaurus-plugin-showcase] Unknown default filter type "${filterType}".`)
      }
      if (!Array.isArray(values) || values.some((value) => typeof value !== 'string')) {
        throw new Error(`[docusaurus-plugin-showcase] The default ${filterType} filter must be an array of keys.`)
      }
      const definitions = filterType === 'tags' ? opts.tags : opts.statuses ?? {}
      const unknownValues = values.filter((value) => !Object.hasOwn(definitions, value))
      if (unknownValues.length > 0) {
        throw new Error(`[docusaurus-plugin-showcase] Unknown default ${filterType} filter key(s): ${unknownValues.join(', ')}.`)
      }
    }
  }
  for (const [key, field] of Object.entries(opts.computedFields ?? {})) {
    if (!field || typeof field.label !== 'string' || !field.label.trim() ||
      typeof field.resolver !== 'object' ||
      typeof field.resolver?.module !== 'string' || !field.resolver.module ||
      typeof field.resolver.exportName !== 'string' || !field.resolver.exportName) {
      throw new Error(`[docusaurus-plugin-showcase] Computed field "${key}" requires a label and a resolver module/exportName reference.`)
    }
    if (field.cacheTtlSeconds !== undefined &&
      (!Number.isFinite(field.cacheTtlSeconds) || field.cacheTtlSeconds < 0)) {
      throw new Error(`[docusaurus-plugin-showcase] Computed field "${key}" requires a non-negative cacheTtlSeconds.`)
    }
  }

  return {
    id: 'default',
    routeBasePath: 'showcase',
    ...opts,
    dataDir: opts.dataDir,
    tags: opts.tags,
    statuses: opts.statuses ?? {},
    screenshotUrl: opts.screenshotUrl ?? null,
    submitFormPath: opts.submitFormPath ?? null,
    submitGithubRepo: opts.submitGithubRepo ?? null,
    schemaUrl: opts.schemaUrl ?? null,
  }
}

export default pluginShowcase as unknown as (
  context: LoadContext,
  options: unknown,
) => Plugin<unknown>
