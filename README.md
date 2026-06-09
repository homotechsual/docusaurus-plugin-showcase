# Showcase for Docusaurus

[![NPM Version](https://img.shields.io/npm/v/%40homotechsual%2Fdocusaurus-plugin-showcase?style=for-the-badge)
](https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase)
[![NPM Last Update](https://img.shields.io/npm/last-update/%40homotechsual%2Fdocusaurus-plugin-showcase?style=for-the-badge)](https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase)
[![NPM Downloads](https://img.shields.io/npm/dy/%40homotechsual%2Fdocusaurus-plugin-showcase?style=for-the-badge)
](https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase)

A Docusaurus plugin for building swizzleable showcase / directory pages from YAML data files.

## Installation

```bash
npm install @homotechsual/docusaurus-plugin-showcase
# or
yarn add @homotechsual/docusaurus-plugin-showcase
```

***

## Plugins preset

`pluginsPreset` is pre-configured for a Docusaurus plugin directory. It includes 12 category tags and 3 maintenance statuses.

### Plugins preset — quick start

```ts
// docusaurus.config.ts
import { pluginsPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

export default {
  plugins: [
    ['@homotechsual/docusaurus-plugin-showcase', {
      ...pluginsPreset,
      dataDir: 'data/plugins',       // directory of .yaml files relative to site root
      routeBasePath: 'plugins',      // page available at /plugins
      submitUrl: 'https://github.com/your-org/your-repo/discussions/1',
    }],
  ],
}
```

### Plugins preset — YAML format

Each plugin is a separate `.yaml` file. Add the language-server comment for editor autocomplete:

```yaml
# yaml-language-server: $schema=../../../node_modules/@homotechsual/docusaurus-plugin-showcase/schema/plugins-preset/1.0.0.json
id: author.plugin-name
name: My Plugin
description: A useful Docusaurus plugin.
website: https://github.com/author/plugin-name
source: https://github.com/author/plugin-name
author: author
tags:
  - utility
status: maintained
npmPackages:
  - plugin-name
minimumVersion: '3.0.0'
```

**Tags:** `favourite`, `docusaurus`, `search`, `api`, `utility`, `content`, `theme`, `markdown`, `analytics`, `integration`, `seo`, `editing`

**Statuses:** `maintained` · `unmaintained` · `unknown`

***

## Sites preset

`sitesPreset` mirrors the tag set used on [docusaurus.io/showcase](https://docusaurus.io/showcase). Statuses are not used.

### Sites preset — quick start

```ts
// docusaurus.config.ts
import { sitesPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

export default {
  plugins: [
    ['@homotechsual/docusaurus-plugin-showcase', {
      id: 'sites',                   // required when registering the plugin more than once
      ...sitesPreset,
      dataDir: 'data/sites',
      routeBasePath: 'sites',
      submitUrl: 'https://github.com/your-org/your-repo/discussions/1',
    }],
  ],
}
```

### Sites preset — YAML format

The sites preset accepts `title` as an alias for `name`, for compatibility with existing entries from `facebook/docusaurus`:

```yaml
# yaml-language-server: $schema=../../../node_modules/@homotechsual/docusaurus-plugin-showcase/schema/sites-preset/1.0.0.json
id: org.my-site
title: My Docusaurus Site           # alias for `name`
description: A site built with Docusaurus.
website: https://mysite.example.com
source: https://github.com/org/my-site   # optional
preview: https://mysite.example.com/img/social-card.png   # optional
tags:
  - opensource
  - personal
```

**Tags:** `favorite`, `opensource`, `product`, `design`, `i18n`, `versioning`, `large`, `meta`, `personal`, `rtl`

***

## Co-located images

Place an image file alongside the YAML file with the same base name to serve it through the webpack / Rspack asset pipeline instead of loading it from a remote URL:

```text
data/sites/
  my-site.yaml    # preview field may be omitted or set to null
  my-site.png     # bundled as a static asset
```

Supported extensions (checked in order): `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`

A co-located image takes precedence over any `preview` URL in the YAML file. Items that have neither a co-located image nor a `preview` URL fall back to the [slorber-api-screenshot](https://github.com/slorber/slorber-api-screenshot) service.

***

## Custom configuration

Build a showcase for any kind of content — not just Docusaurus plugins or sites — by defining your own tags and statuses from scratch:

```ts
// docusaurus.config.ts
import type { PluginOptions } from '@homotechsual/docusaurus-plugin-showcase'

const myShowcase: PluginOptions = {
  dataDir: 'data/showcase',
  routeBasePath: 'showcase',
  pageTitle: 'Community Showcase',
  pageDescription: 'Sites built with our framework.',
  favouriteTag: 'featured',
  tags: {
    featured: {
      label: 'Featured',
      description: 'Hand-picked featured sites.',
      color: '#e9669e',
      icon: 'heart',           // any Lucide icon name
    },
    community: {
      label: 'Community',
      description: 'Built by the community.',
      color: '#3ecc5f',
    },
  },
  statuses: {
    active: {
      label: 'Active',
      description: 'Actively maintained.',
      color: '#39ca30',
      icon: 'circle-check',
    },
    archived: {
      label: 'Archived',
      description: 'No longer maintained.',
      color: '#ca3c25',
      icon: 'circle-x',
    },
  },
}

export default {
  plugins: [
    ['@homotechsual/docusaurus-plugin-showcase', myShowcase],
  ],
}
```

### Custom YAML format

With a custom configuration the YAML fields are flexible. The only required core field is `id`; any additional fields you define in your YAML files are passed through to the showcase items and accessible in swizzled components.

```yaml
id: org.my-thing
name: My Thing
description: A short description.
website: https://example.com
tags:
  - featured
  - community
status: active
```

### JSON Schema validation

Point `schemaPath` at a [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) file to validate your YAML entries at build time:

```ts
import { join } from 'node:path'

const myShowcase: PluginOptions = {
  // ...
  schemaPath: join(__dirname, 'schema/my-showcase.json'),
}
```

Items that fail validation are skipped with a warning, not a build error.

***

## All options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `dataDir` | `string` | ✓ | Directory of `.yaml` files, relative to the Docusaurus site root. |
| `routeBasePath` | `string` | ✓ | URL path for the showcase page (`plugins` → `/plugins`). |
| `tags` | `Record<string, TagDef>` | ✓ | Tag definitions. At least one tag required. |
| `statuses` | `Record<string, StatusDef>` | | Status definitions. Omit or pass `{}` to hide the status UI. |
| `id` | `string` | | Plugin instance ID — required when registering the plugin more than once. |
| `favouriteTag` | `string` | | Tag key whose items appear in a highlighted "favourites" section. |
| `schemaPath` | `string` | | Absolute path to a JSON Schema 2020-12 file for validating YAML entries. |
| `pageTitle` | `string` | | Page `<title>` and heading. Defaults to `"Showcase"`. |
| `pageDescription` | `string` | | Page sub-heading. Defaults to `"A community showcase."`. |
| `submitUrl` | `string` | | URL for the "Add an item" button. Button is hidden when omitted. |

### TagDef

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | ✓ | Display name shown on the filter chip. |
| `description` | `string` | ✓ | Tooltip text shown when hovering the chip. |
| `color` | `string` | ✓ | CSS colour for the tag colour dot. |
| `icon` | `string` | | [Lucide](https://lucide.dev/icons/) icon name rendered beside the label. |

### StatusDef

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | ✓ | Display name shown on the card. |
| `description` | `string` | ✓ | Status description. |
| `color` | `string` | | CSS colour for the status indicator. |
| `icon` | `string` | | [Lucide](https://lucide.dev/icons/) icon name rendered beside the label. |

***

## Swizzling components

All theme components are swizzleable:

```bash
npx docusaurus swizzle @homotechsual/docusaurus-plugin-showcase ShowcaseCard
```

| Component | Safety | Notes |
| --- | --- | --- |
| `ShowcasePage` | unsafe / wrap | Top-level page layout. |
| `ShowcaseCard` | safe | Individual item card. |
| `ShowcaseFilters` | safe | Filter sidebar / bar. |
| `ShowcaseFilterToggle` | safe | OR / AND filter toggle. |
| `ShowcaseTagSelect` | unsafe / wrap | Tag filter chip list. |
| `ShowcaseStatusSelect` | unsafe / wrap | Status filter select. |
| `ShowcaseTooltip` | safe | Tooltip wrapper. |

***

## Licence

Apache-2.0
