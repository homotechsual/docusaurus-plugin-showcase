---
sidebar_position: 5
sidebar_label: Configuration Reference
---

# Configuration reference

## Plugin options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `dataDir` | `string` | ✓ | Directory containing `.yaml` data files, relative to the Docusaurus site root. |
| `routeBasePath` | `string` | ✓ | URL path for the showcase page. `plugins` produces a page at `/plugins`. |
| `tags` | `Record<string, TagDef>` | ✓ | Tag definitions. At least one tag is required. |
| `statuses` | `Record<string, StatusDef>` | | Status definitions. Omit or pass `{}` to hide the status filter UI. |
| `id` | `string` | | Plugin instance ID - required when registering the plugin more than once in `docusaurus.config.ts`. |
| `favouriteTag` | `string` | | Tag key whose items are surfaced in a highlighted "Our favourites" section above the main grid. |
| `schemaPath` | `string` | | Absolute path to a [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) file. Items that fail validation are skipped with a build-time warning. |
| `pageTitle` | `string` | | Page `<title>` and visible heading. Defaults to `"Showcase"`. |
| `pageDescription` | `string` | | Sub-heading shown below the page title. Defaults to `"A community showcase."`. |
| `submitUrl` | `string` | | URL for the "Add an item" call-to-action button. The button is hidden when this is omitted. |

## TagDef

Defines a single tag that items can be assigned and that appears as a filterable chip in the UI.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | ✓ | Display name shown on the filter chip and on each card. |
| `description` | `string` | ✓ | Tooltip text shown when hovering the filter chip. |
| `color` | `string` | ✓ | CSS colour for the tag colour dot (hex, rgb, named, etc.). |
| `icon` | `string` | | [Lucide](https://lucide.dev/icons/) icon name rendered beside the tag label. |

## StatusDef

Defines a single status that an item can be assigned. Statuses are displayed on the card and optionally shown as a filter.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | ✓ | Display name shown on the card status row. |
| `description` | `string` | ✓ | Description of what this status means. |
| `color` | `string` | | CSS colour for the status indicator dot. |
| `icon` | `string` | | [Lucide](https://lucide.dev/icons/) icon name rendered beside the status label. |

## ShowcaseItem fields

These are the standard fields read from each YAML file. Custom fields are passed through as-is and are accessible in [swizzled components](./swizzling).

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the item. |
| `name` | `string` | Display name shown as the card title. |
| `description` | `string` | Short description shown on the card body. |
| `website` | `string` | Primary URL - linked from the card title. |
| `source` | `string \| null` | Source code URL - shown as a "source" button. |
| `preview` | `string \| null` | Preview image URL. Overridden by a [co-located image](./co-located-images) if one exists. |
| `author` | `string \| null` | Author name shown on the card. |
| `tags` | `string[]` | Array of tag keys defined in the plugin options. |
| `status` | `string \| null` | Status key defined in the plugin options. |
| `npmPackages` | `string[] \| null` | *(Plugins preset)* npm package names. |
| `minimumVersion` | `string \| null` | *(Plugins preset)* Minimum Docusaurus version required. |
