export type TagDef = {
  label: string
  description: string
  color: string
  icon?: string | null
}

export type StatusDef = {
  label: string
  description: string
  color?: string | null
  icon?: string | null
}

export type ShowcaseItem = {
  id: string
  name: string
  description: string
  website?: string | null
  source?: string | null
  preview?: string | null
  author?: string | null
  tags: string[]
  status?: string | null
  npmPackages?: string[] | null
  minimumVersion?: string | null
  [key: string]: unknown
}

export type ComputedFieldValue = {
  text: string
  href?: string
  date?: string
}

export type ComputedFieldContext = {
  options: Record<string, unknown>
}

export type ComputedFieldResolver = (
  item: ShowcaseItem,
  context: ComputedFieldContext,
) => ComputedFieldValue[] | null | Promise<ComputedFieldValue[] | null>

export type ComputedFieldDef = {
  label: string
  resolver: { module: string; exportName: string } | ComputedFieldResolver
  options?: Record<string, unknown>
  cacheTtlSeconds?: number
}

export type PluginOptions = {
  id?: string
  dataDir: string
  routeBasePath: string
  tags: Record<string, TagDef>
  statuses: Record<string, StatusDef>
  favouriteTag?: string | null
  pageTitle?: string | null
  pageDescription?: string | null
  submitUrl?: string | null
  submitLabel?: string | null
  submitFormPath?: string | null
  submitGithubRepo?: string | null
  schemaPath?: string | null
  schemaUrl?: string | null
  screenshotUrl?: string | null
  computedFields?: Record<string, ComputedFieldDef>
}

export type PresetOptions = Omit<Partial<PluginOptions>, 'tags'> & { tags: Record<string, TagDef> }

export type ShowcasePageData = {
  items: ShowcaseItem[]
  options: PluginOptions
}
