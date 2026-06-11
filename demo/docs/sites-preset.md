---
sidebar_position: 3
sidebar_label: Sites Preset
---

# Sites preset

The `sitesPreset` is pre-configured for a **Docusaurus site showcase**. Its 10 tags mirror those used on [docusaurus.io/showcase](https://docusaurus.io/showcase), so you can import data files from the `facebook/docusaurus` repository without any changes. Statuses are not used.

## Quick start

```ts
// docusaurus.config.ts
import showcasePlugin, { type PluginOptions as ShowcasePluginOptions } from '@homotechsual/docusaurus-plugin-showcase'
import { sitesPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

export default {
  plugins: [
    [showcasePlugin, {
      id: 'sites',                   // required when registering the plugin more than once
      ...sitesPreset,
      dataDir: 'data/sites',
      routeBasePath: 'sites',
      submitUrl: 'https://github.com/your-org/your-repo/discussions/1',
    } satisfies ShowcasePluginOptions],
  ],
}
```

## YAML format

```yaml
# yaml-language-server: $schema=../../../node_modules/@homotechsual/docusaurus-plugin-showcase/schema/sites-preset/1.0.0.json
id: org.my-site
title: My Docusaurus Site           # alias for `name` - compatible with facebook/docusaurus entries
description: A site built with Docusaurus.
website: https://mysite.example.com
source: https://github.com/org/my-site
preview: https://mysite.example.com/img/social-card.png
tags:
  - opensource
  - personal
```

:::tip title alias

The sites preset accepts `title` as an alias for `name`. This means you can copy entries from [`facebook/docusaurus/website/src/data/showcase`](https://github.com/facebook/docusaurus/tree/main/website/src/data/showcase) without modification.

:::

### Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | ✓ | Unique identifier. |
| `name` or `title` | ✓ | Display name. `title` is an alias for `name`. |
| `description` | ✓ | Short description shown on the card. |
| `website` | ✓ | Primary URL for the site. |
| `source` | | Source code URL. |
| `preview` | | URL to a preview image. See also [co-located images](./co-located-images). |
| `tags` | | Array of tag keys from the list below. |

## Tags

| Key | Label | Description |
| --- | --- | --- |
| `favorite` | Favorite | Items pinned to the "Our favourites" section. |
| `opensource` | Open-Source | Sites with publicly available source code. |
| `product` | Product | Sites associated with a commercial product. |
| `design` | Design | Beautifully designed sites that stand out. |
| `i18n` | I18n | Sites using Docusaurus internationalisation. |
| `versioning` | Versioning | Sites using the docs versioning feature. |
| `large` | Large | Sites with a very large number of pages. |
| `meta` | Meta | Sites from Meta (formerly Facebook) projects. |
| `personal` | Personal | Personal websites, blogs, and digital gardens. |
| `rtl` | RTL Direction | Sites using right-to-left reading direction. |
