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
  website: string
  source?: string | null
  preview?: string | null
  author?: string | null
  tags: string[]
  status?: string | null
  npmPackages?: string[] | null
  minimumVersion?: string | null
  [key: string]: unknown
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
  schemaPath?: string | null
  screenshotUrl?: string | null
}

export type PresetOptions = Omit<Partial<PluginOptions>, 'tags'> & { tags: Record<string, TagDef> }

export type ShowcasePageData = {
  items: ShowcaseItem[]
  options: PluginOptions
}
