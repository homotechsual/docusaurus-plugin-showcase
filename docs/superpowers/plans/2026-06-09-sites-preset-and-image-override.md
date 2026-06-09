# Sites Preset and Local Image Override — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `sitesPreset` matching the docusaurus.io/showcase format, make `statuses` optional, and allow co-located images in the data directory to override the `preview` URL.

**Architecture:** Six targeted changes across plugin validation, UI guard, a new CJS module generator, the YAML loader, a new JSON schema, and a new preset constant. Each change is independently testable. The JS module generator is extracted to `src/core/module-generator.ts` so it can be unit-tested; `plugin.ts` imports and calls it.

**Tech Stack:** TypeScript, Vitest, Node.js `fs`/`path`, `js-yaml`, `ajv/dist/2020.js`, Docusaurus plugin API (`createData`, `addRoute`).

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/plugin.ts` | Modify | Remove empty-statuses guard; normalise `statuses ?? {}`; call `generateShowcaseModule` |
| `src/core/module-generator.ts` | **Create** | `generateShowcaseModule(data)` — serialises `ShowcasePageData` to a CJS JS string with `require()` for local images |
| `src/theme/ShowcaseFilters/index.tsx` | Modify | Guard the status `<ul>` so it only renders when statuses exist |
| `src/loaders/yaml.ts` | Modify | Normalise `title → name`; detect co-located images and set `_localImagePath` |
| `src/presets/sites.ts` | **Create** | `sitesPreset` — 10 tags, `statuses: {}`, sites-specific schema path |
| `src/presets/index.ts` | Modify | Re-export `sitesPreset` |
| `schema/sites-preset/1.0.0.json` | **Create** | Strict JSON Schema for site showcase items |
| `tests/plugin.test.ts` | **Create** | Unit tests for `validateOptions` (empty/absent statuses) |
| `tests/core/module-generator.test.ts` | **Create** | Unit tests for `generateShowcaseModule` |
| `tests/loaders/yaml.test.ts` | Modify | Tests for `title→name` and co-located image detection |
| `tests/fixtures/site-with-title.yaml` | **Create** | Fixture: YAML with `title` instead of `name` |
| `tests/fixtures/test-with-image.yaml` | **Create** | Fixture: YAML for co-located image test |
| `tests/fixtures/test-with-image.png` | **Create** | Placeholder file so `existsSync` returns true |

---

## Task 1: Optional statuses — `validateOptions`

**Files:**
- Modify: `src/plugin.ts:45-68`
- Create: `tests/plugin.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/plugin.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateOptions } from '../../src/plugin.js'

const baseOptions = {
  dataDir: 'data',
  tags: { foo: { label: 'Foo', description: 'desc', color: '#fff' } },
}

describe('validateOptions', () => {
  it('throws when dataDir is missing', () => {
    expect(() =>
      validateOptions({ options: { tags: baseOptions.tags } }),
    ).toThrow('dataDir')
  })

  it('throws when tags is empty', () => {
    expect(() =>
      validateOptions({ options: { dataDir: 'data', tags: {} } }),
    ).toThrow('tags')
  })

  it('accepts empty statuses object', () => {
    const result = validateOptions({
      options: { ...baseOptions, statuses: {} },
    })
    expect(result.statuses).toEqual({})
  })

  it('defaults statuses to {} when absent', () => {
    const result = validateOptions({ options: baseOptions })
    expect(result.statuses).toEqual({})
  })

  it('preserves provided statuses', () => {
    const statuses = {
      maintained: { label: 'Maintained', description: 'desc', icon: 'circle-check' },
    }
    const result = validateOptions({ options: { ...baseOptions, statuses } })
    expect(result.statuses).toEqual(statuses)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```
yarn test tests/plugin.test.ts
```

Expected: tests for "accepts empty statuses" and "defaults statuses to {}" fail because the current code throws for empty statuses.

- [ ] **Step 3: Update `validateOptions` in `src/plugin.ts`**

Remove the statuses empty-check block and normalise with `?? {}`. Replace lines 56–58 and the `statuses: opts.statuses` in the return:

```ts
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```
yarn test tests/plugin.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```
git add src/plugin.ts tests/plugin.test.ts
git commit -m "feat: make statuses optional in validateOptions"
```

---

## Task 2: Conditional status `<ul>` in ShowcaseFilters

**Files:**
- Modify: `src/theme/ShowcaseFilters/index.tsx:134-153`

> No unit test for this UI change — it is verified visually and is covered by the integration of Task 1 (a preset with `statuses: {}` no longer renders the status row).

- [ ] **Step 1: Wrap the status list in a guard**

In `src/theme/ShowcaseFilters/index.tsx`, replace the outer `<ul>` for statuses (currently starting at line 136) with a conditional block:

```tsx
{Object.keys(options.statuses).length > 0 && (
  <ul className={clsx('clean-list', styles.tagList)}>
    {Object.entries(options.statuses).map(([key, status]) => {
      const id = `showcase-status-${key}`
      const Icon = getIcon(status.icon)
      return (
        <li key={key} className={styles.tagListItem}>
          <ShowcaseTooltip id={id} text={status.description} anchorEl="#__docusaurus">
            <ShowcaseStatusSelect
              status={key}
              id={id}
              label={status.label}
              icon={Icon
                ? <span className={styles.tagIcon} style={{ '--showcase-tag-color': status.color ?? undefined } as React.CSSProperties}><Icon size={18} /></span>
                : status.color
                  ? <span className={styles.tagColorDot} style={{ '--showcase-tag-color': status.color } as React.CSSProperties} />
                  : null}
            />
          </ShowcaseTooltip>
        </li>
      )
    })}
  </ul>
)}
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```
yarn build
```

Expected: exits 0, `Assets copied.` in output.

- [ ] **Step 3: Commit**

```
git add src/theme/ShowcaseFilters/index.tsx
git commit -m "feat: hide status filter row when statuses is empty"
```

---

## Task 3: `generateShowcaseModule` helper + switch to `.js` data file

**Files:**
- Create: `src/core/module-generator.ts`
- Modify: `src/plugin.ts:27-33`
- Create: `tests/core/module-generator.test.ts`

### Background

`createData` currently emits `showcase-data.json`. Switching to `showcase-data.js` (a CJS module) lets the bundler (webpack or Rspack) process `require('/abs/path/image.png')` calls inside it, replacing them with asset URLs at build time. Using `module.exports =` (CJS) avoids ESM/CJS interop ambiguity when Docusaurus's route loader passes the data as a prop.

- [ ] **Step 1: Write failing tests for `generateShowcaseModule`**

Create `tests/core/module-generator.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateShowcaseModule } from '../../src/core/module-generator.js'
import type { ShowcasePageData, ShowcaseItem } from '../../src/core/types.js'

const baseOptions = {
  id: 'default',
  dataDir: 'data',
  routeBasePath: 'showcase',
  tags: { foo: { label: 'Foo', description: 'desc', color: '#fff' } },
  statuses: {},
}

function makeItem(overrides: Partial<ShowcaseItem> = {}): ShowcaseItem {
  return {
    id: 'test.item',
    name: 'Test Item',
    description: 'A test item.',
    website: 'https://example.com',
    tags: [],
    ...overrides,
  }
}

describe('generateShowcaseModule', () => {
  it('produces a CJS module string starting with the generated comment', () => {
    const data: ShowcasePageData = { items: [], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toMatch(/^\/\/ @generated/)
    expect(result).toContain('module.exports =')
  })

  it('serialises a preview URL as a JSON string', () => {
    const item = makeItem({ preview: 'https://example.com/preview.png' })
    const data: ShowcasePageData = { items: [item], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('"preview":"https://example.com/preview.png"')
  })

  it('serialises a null preview as null', () => {
    const item = makeItem({ preview: null })
    const data: ShowcasePageData = { items: [item], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('"preview":null')
  })

  it('emits require() for items with _localImagePath', () => {
    const item = makeItem() as ShowcaseItem & { _localImagePath: string }
    item._localImagePath = '/abs/path/to/image.png'
    const data: ShowcasePageData = { items: [item as ShowcaseItem], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('require("/abs/path/to/image.png")')
  })

  it('strips _localImagePath from the serialised item', () => {
    const item = makeItem() as ShowcaseItem & { _localImagePath: string }
    item._localImagePath = '/abs/path/to/image.png'
    const data: ShowcasePageData = { items: [item as ShowcaseItem], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).not.toContain('_localImagePath')
  })

  it('_localImagePath takes precedence over a preview URL', () => {
    const item = makeItem({ preview: 'https://example.com/preview.png' }) as ShowcaseItem & { _localImagePath: string }
    item._localImagePath = '/abs/path/to/local.png'
    const data: ShowcasePageData = { items: [item as ShowcaseItem], options: baseOptions }
    const result = generateShowcaseModule(data)
    expect(result).toContain('require("/abs/path/to/local.png")')
    expect(result).not.toContain('https://example.com/preview.png')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```
yarn test tests/core/module-generator.test.ts
```

Expected: all tests fail with "Cannot find module".

- [ ] **Step 3: Create `src/core/module-generator.ts`**

```ts
import type { ShowcaseItem, ShowcasePageData } from './types.js'

function serializeItem(item: ShowcaseItem): string {
  const { _localImagePath, preview, ...rest } = item as ShowcaseItem & { _localImagePath?: string }
  const previewJs = _localImagePath
    ? `require(${JSON.stringify(_localImagePath)})`
    : JSON.stringify(preview ?? null)
  const inner = JSON.stringify(rest).slice(1, -1)
  return inner ? `{"preview":${previewJs},${inner}}` : `{"preview":${previewJs}}`
}

export function generateShowcaseModule(data: ShowcasePageData): string {
  const itemsJs = data.items.map(serializeItem).join(',')
  return (
    `// @generated by @homotechsual/docusaurus-plugin-showcase\n` +
    `module.exports = {"items":[${itemsJs}],"options":${JSON.stringify(data.options)}};\n`
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```
yarn test tests/core/module-generator.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Update `src/plugin.ts` to import and use `generateShowcaseModule`**

Add the import at the top (after existing imports):

```ts
import { generateShowcaseModule } from './core/module-generator.js'
```

Replace the `createData` call in `contentLoaded` (currently produces `.json`):

```ts
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
```

- [ ] **Step 6: Build to verify no TypeScript errors**

```
yarn build
```

Expected: exits 0.

- [ ] **Step 7: Run full test suite**

```
yarn test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```
git add src/core/module-generator.ts src/plugin.ts tests/core/module-generator.test.ts
git commit -m "feat: generate showcase-data.js module with require() for local images"
```

---

## Task 4: YAML loader — `title → name` alias

**Files:**
- Modify: `src/loaders/yaml.ts:1` (import line) and `src/loaders/yaml.ts:44-59` (per-file loop body)
- Create: `tests/fixtures/site-with-title.yaml`
- Modify: `tests/loaders/yaml.test.ts`

- [ ] **Step 1: Write failing test**

Add to `tests/loaders/yaml.test.ts` (after the existing `describe` block):

```ts
it('maps title to name when name is absent', async () => {
  const warnings: string[] = []
  const items = await loadShowcaseItems(
    fixturesDir,
    { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
    (msg) => warnings.push(msg),
  )
  const item = items.find((i) => i.id === 'test.site-with-title')
  expect(item).toBeDefined()
  expect(item?.name).toBe('Site With Title')
  expect((item as Record<string, unknown>)['title']).toBeUndefined()
})
```

- [ ] **Step 2: Create fixture `tests/fixtures/site-with-title.yaml`**

```yaml
id: test.site-with-title
title: Site With Title
description: A test site using title instead of name.
website: https://example.com/site-with-title
tags: []
```

- [ ] **Step 3: Run test to confirm it fails**

```
yarn test tests/loaders/yaml.test.ts
```

Expected: the new test fails — item is not found (schema validation rejects it because `name` is missing before the alias is applied, or item loads but `name` is undefined).

- [ ] **Step 4: Add `title → name` normalisation to `src/loaders/yaml.ts`**

Update the `node:path` import to add the newly needed names:

```ts
import { resolve, join, dirname, basename, extname } from 'node:path'
```

Inside the `for (const filePath of yamlFiles)` loop, add the alias block immediately after the `typeof raw !== 'object'` guard and before the `validate` call:

```ts
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
```

> Note: the existing code casts `raw` directly to `ShowcaseItem` at the end. Change the final push to use the already-cast `item` variable: `items.push(item as ShowcaseItem)`.

- [ ] **Step 5: Run all loader tests to confirm they pass**

```
yarn test tests/loaders/yaml.test.ts
```

Expected: all tests pass including the new one.

- [ ] **Step 6: Commit**

```
git add src/loaders/yaml.ts tests/loaders/yaml.test.ts tests/fixtures/site-with-title.yaml
git commit -m "feat: normalise title → name alias in YAML loader"
```

---

## Task 5: YAML loader — co-located image detection

**Files:**
- Modify: `src/loaders/yaml.ts` (add image detection after alias block)
- Create: `tests/fixtures/test-with-image.yaml`
- Create: `tests/fixtures/test-with-image.png` (placeholder — any non-empty file)
- Modify: `tests/loaders/yaml.test.ts`

- [ ] **Step 1: Write failing test**

Add to `tests/loaders/yaml.test.ts` (inside the existing `describe` block):

```ts
it('sets _localImagePath when a co-located image file exists', async () => {
  const warnings: string[] = []
  const items = await loadShowcaseItems(
    fixturesDir,
    { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
    (msg) => warnings.push(msg),
  )
  const item = items.find((i) => i.id === 'test.with-image') as Record<string, unknown> | undefined
  expect(item).toBeDefined()
  expect(typeof item?._localImagePath).toBe('string')
  expect((item?._localImagePath as string)).toMatch(/test-with-image\.png$/)
})

it('does not set _localImagePath when no co-located image exists', async () => {
  const warnings: string[] = []
  const items = await loadShowcaseItems(
    fixturesDir,
    { dataDir: '.', routeBasePath: 'showcase', tags: {}, statuses: {} },
    (msg) => warnings.push(msg),
  )
  const item = items.find((i) => i.id === 'test.my-plugin') as Record<string, unknown> | undefined
  expect(item).toBeDefined()
  expect(item?._localImagePath).toBeUndefined()
})
```

- [ ] **Step 2: Create the fixture files**

`tests/fixtures/test-with-image.yaml`:
```yaml
id: test.with-image
name: Plugin With Image
description: A test plugin that has a co-located preview image.
website: https://example.com/with-image
tags: []
```

`tests/fixtures/test-with-image.png` — create an empty placeholder file. In the terminal:

```
node -e "require('fs').writeFileSync('tests/fixtures/test-with-image.png', Buffer.alloc(0))"
```

Expected: file created at `tests/fixtures/test-with-image.png` (0 bytes).

- [ ] **Step 3: Run tests to confirm they fail**

```
yarn test tests/loaders/yaml.test.ts
```

Expected: the `_localImagePath` detection test fails because the loader doesn't yet set it.

- [ ] **Step 4: Add co-located image detection to `src/loaders/yaml.ts`**

Add the image detection block immediately after the `title → name` alias block (before the `validate` call). The `join`, `dirname`, `basename`, `extname` imports were already added in Task 4:

```ts
      // Co-located image detection
      const base = basename(filePath, extname(filePath))
      const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
      for (const ext of imageExts) {
        const imagePath = join(dirname(filePath), `${base}${ext}`)
        if (existsSync(imagePath)) {
          item._localImagePath = imagePath
          break
        }
      }
```

The full loop body (after all modifications) should look like:

```ts
  for (const filePath of yamlFiles) {
    try {
      const raw = yaml.load(readFileSync(filePath, 'utf-8'))

      if (typeof raw !== 'object' || raw === null) {
        warn(`[docusaurus-plugin-showcase] Expected object in "${filePath}", got ${typeof raw} — item skipped.`)
        continue
      }

      const item = raw as Record<string, unknown>

      // title → name alias
      if (!item.name && item.title) {
        item.name = item.title
        delete item.title
      }

      // co-located image detection
      const base = basename(filePath, extname(filePath))
      const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
      for (const ext of imageExts) {
        const imagePath = join(dirname(filePath), `${base}${ext}`)
        if (existsSync(imagePath)) {
          item._localImagePath = imagePath
          break
        }
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
```

- [ ] **Step 5: Run all loader tests**

```
yarn test tests/loaders/yaml.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Build and run full test suite**

```
yarn build && yarn test
```

Expected: exits 0, all tests pass.

- [ ] **Step 7: Commit**

```
git add src/loaders/yaml.ts tests/loaders/yaml.test.ts tests/fixtures/test-with-image.yaml tests/fixtures/test-with-image.png
git commit -m "feat: detect co-located images in YAML loader and set _localImagePath"
```

---

## Task 6: Sites JSON schema

**Files:**
- Create: `schema/sites-preset/1.0.0.json`

> No unit test for a JSON schema file. Correctness is verified implicitly in Task 7 when the sites preset loads YAML that uses `title`.

- [ ] **Step 1: Create `schema/sites-preset/1.0.0.json`**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/homotechsual/docusaurus-plugin-showcase/schema/sites-preset/1.0.0.json",
  "title": "SiteShowcaseItem",
  "type": "object",
  "required": ["id", "description", "website"],
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for this site"
    },
    "name": {
      "type": "string",
      "description": "Display name"
    },
    "title": {
      "type": "string",
      "description": "Alias for name (compatible with Docusaurus site showcase format)"
    },
    "description": {
      "type": "string"
    },
    "website": {
      "type": "string",
      "format": "uri"
    },
    "source": {
      "type": ["string", "null"],
      "format": "uri",
      "description": "URL to the website's source repository"
    },
    "preview": {
      "type": ["string", "null"],
      "description": "Preview image URL. null = use screenshot service or co-located image file."
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

> Note: both `name` and `title` are optional in the schema because the loader normalises `title → name` before validation. `id`, `description`, and `website` are required; `name`/`title` are not marked required so YAML with only `title` passes schema validation (the loader already maps it to `name` before validation reaches this point).

- [ ] **Step 2: Verify the schema is well-formed**

```
node -e "JSON.parse(require('fs').readFileSync('schema/sites-preset/1.0.0.json', 'utf-8')); console.log('valid JSON')"
```

Expected: prints `valid JSON`.

- [ ] **Step 3: Commit**

```
git add schema/sites-preset/1.0.0.json
git commit -m "feat: add JSON schema for sites-preset items"
```

---

## Task 7: Sites preset + export

**Files:**
- Create: `src/presets/sites.ts`
- Modify: `src/presets/index.ts:1`

- [ ] **Step 1: Create `src/presets/sites.ts`**

```ts
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PluginOptions } from '../core/types.js'

export const sitesPreset: Partial<PluginOptions> = {
  favouriteTag: 'favorite',
  statuses: {},
  schemaPath: join(
    dirname(fileURLToPath(import.meta.url)),
    '../../schema/sites-preset/1.0.0.json',
  ),
  pageTitle: 'Docusaurus Site Showcase',
  pageDescription: 'List of websites people are building with Docusaurus',
  tags: {
    favorite: {
      label: 'Favorite',
      description: 'Our favorite Docusaurus sites that you must absolutely check out!',
      color: '#e9669e',
      icon: 'heart',
    },
    opensource: {
      label: 'Open-Source',
      description: 'Open-Source Docusaurus sites can be useful for inspiration!',
      color: '#39ca30',
    },
    product: {
      label: 'Product',
      description: 'Docusaurus sites associated to a commercial product!',
      color: '#dfd545',
    },
    design: {
      label: 'Design',
      description: 'Beautiful Docusaurus sites, polished and standing out from the initial template!',
      color: '#a44fb7',
    },
    i18n: {
      label: 'I18n',
      description: 'Translated Docusaurus sites using the internationalization support with more than 1 locale.',
      color: '#127f82',
    },
    versioning: {
      label: 'Versioning',
      description: 'Docusaurus sites using the versioning feature of the docs plugin to manage multiple versions.',
      color: '#fe6829',
    },
    large: {
      label: 'Large',
      description: 'Very large Docusaurus sites, including many more pages than the average!',
      color: '#8c2f00',
    },
    meta: {
      label: 'Meta',
      description: 'Docusaurus sites of Meta (formerly Facebook) projects',
      color: '#4267b2',
    },
    personal: {
      label: 'Personal',
      description: 'Personal websites, blogs and digital gardens built with Docusaurus',
      color: '#14cfc3',
    },
    rtl: {
      label: 'RTL Direction',
      description: 'Docusaurus sites using the right-to-left reading direction support.',
      color: '#ffcfc3',
    },
  },
}
```

- [ ] **Step 2: Add export to `src/presets/index.ts`**

Replace the entire file contents:

```ts
export { pluginsPreset } from './plugins.js'
export { sitesPreset } from './sites.js'
```

- [ ] **Step 3: Build to verify no TypeScript errors**

```
yarn build
```

Expected: exits 0, `Assets copied.` in output.

- [ ] **Step 4: Verify the preset is importable from the package**

```
node -e "const {sitesPreset} = require('./lib/presets/index.js'); console.log(Object.keys(sitesPreset.tags).length, 'tags')"
```

Expected: prints `10 tags`.

- [ ] **Step 5: Run the full test suite one final time**

```
yarn test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```
git add src/presets/sites.ts src/presets/index.ts
git commit -m "feat: add sitesPreset with 10 tags matching docusaurus.io/showcase"
```

---

## Self-Review

### Spec coverage

| Spec section | Task |
|---|---|
| Remove `statuses` empty check in `validateOptions` | Task 1 |
| Normalise `statuses: opts.statuses ?? {}` | Task 1 |
| Guard status `<ul>` on `Object.keys(options.statuses).length > 0` | Task 2 |
| `generateShowcaseModule` helper generating `.js` module | Task 3 |
| `title → name` alias in loader | Task 4 |
| Co-located image detection setting `_localImagePath` | Task 5 |
| `schema/sites-preset/1.0.0.json` | Task 6 |
| `src/presets/sites.ts` with 10 tags | Task 7 |
| `src/presets/index.ts` exporting `sitesPreset` | Task 7 |

All spec requirements covered.

### Deviations from spec

1. **`module.exports =` instead of `export default`** — The spec's `generateShowcaseModule` used `export default`. This plan uses `module.exports =` (CJS) to avoid ESM/CJS interop ambiguity when Docusaurus's route loader passes the data as a prop. CJS `require()` calls for asset paths are valid and processed identically by webpack and Rspack.

2. **`generateShowcaseModule` in `src/core/module-generator.ts` instead of private in `src/plugin.ts`** — Extracted to its own module so it can be unit-tested. `plugin.ts` imports it. The spec said "not exported from plugin.ts" which is still true.

### Placeholder scan
No TBDs, no vague steps. Every code block is complete.

### Type consistency
- `ShowcaseItem & { _localImagePath?: string }` cast used consistently in `serializeItem` (Task 3) and in the test for `_localImagePath` (Task 5).
- `generateShowcaseModule(data: ShowcasePageData): string` signature consistent across Tasks 3 and plugin.ts import.
- `sitesPreset: Partial<PluginOptions>` type consistent with `pluginsPreset` pattern.
