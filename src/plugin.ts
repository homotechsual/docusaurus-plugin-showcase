import { dirname, join } from 'node:path'
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
      return { items, options }
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

  return {
    id: 'default',
    routeBasePath: 'showcase',
    ...opts,
    dataDir: opts.dataDir,
    tags: opts.tags,
    statuses: opts.statuses ?? {},
  }
}

export default pluginShowcase as unknown as (
  context: LoadContext,
  options: unknown,
) => Plugin<ShowcasePageData>
