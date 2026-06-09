---
sidebar_position: 2
sidebar_label: Plugins Preset
---

# Plugins preset

The `pluginsPreset` is pre-configured for a **Docusaurus plugin directory**. It includes 12 category tags and 3 maintenance statuses out of the box, together with a JSON Schema that validates entries at build time.

## Quick start

```ts
// docusaurus.config.ts
import { pluginsPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

export default {
  plugins: [
    ['@homotechsual/docusaurus-plugin-showcase', {
      ...pluginsPreset,
      dataDir: 'data/plugins',       // relative to your site root
      routeBasePath: 'plugins',      // served at /plugins
      submitUrl: 'https://github.com/your-org/your-repo/discussions/1',
    }],
  ],
}
```

`pluginsPreset` provides sensible defaults for every other option. The three fields above are the only ones you need to supply.

## YAML format

Create one `.yaml` file per plugin inside `dataDir`. Add the language-server comment to get editor autocomplete and inline validation:

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

### Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | ✓ | Unique identifier, e.g. `author.plugin-name`. |
| `name` | ✓ | Display name shown on the card. |
| `description` | ✓ | Short description shown on the card. |
| `website` | ✓ | Primary link - typically the GitHub repo or npm page. |
| `source` | | Source code URL, shown as a "source" button on the card. |
| `preview` | | URL to a preview image. See also [co-located images](./co-located-images). |
| `author` | | Author name shown on the card. |
| `tags` | ✓ | Array of tag keys. Must include at least one value from the list below. |
| `status` | | One of the status keys below. |
| `npmPackages` | | Array of npm package names (for future use / custom swizzle). |
| `minimumVersion` | | Minimum Docusaurus version required, e.g. `'3.0.0'`. |

## Tags

| Key | Label | Description |
| --- | --- | --- |
| `favourite` | Favourite | Items pinned to the "Our favourites" section. |
| `docusaurus` | Docusaurus | Core or official Docusaurus plugins. |
| `search` | Search | Plugins implementing search functionality. |
| `api` | API | Plugins for API documentation and testing. |
| `utility` | Utility | Utility plugins such as analytics, SASS support, etc. |
| `content` | Content | Plugins providing content enhancements. |
| `theme` | Theme | Plugins implementing themes or significant theme changes. |
| `markdown` | Markdown | Plugins adding new Markdown features. |
| `analytics` | Analytics | Analytics integrations (Plausible, Matomo, etc.). |
| `integration` | Integration | Plugins integrating with external services. |
| `seo` | SEO | Plugins implementing SEO improvements. |
| `editing` | Editing | Plugins for editing or contribution workflows. |

## Statuses

| Key | Label | Meaning |
| --- | --- | --- |
| `maintained` | Maintained | Compatible with the latest Docusaurus stable release. |
| `unmaintained` | Unmaintained | Not updated for or incompatible with the latest stable release. |
| `unknown` | Unknown | Maintenance status could not be determined. |
