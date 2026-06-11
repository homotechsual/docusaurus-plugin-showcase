---
sidebar_position: 4
sidebar_label: Custom Showcase
---

# Custom showcase

When neither of the built-in presets fits your use case, you can define your own tags and statuses from scratch. This lets you use the plugin for anything - themes, resources, team members, documentation frameworks, and more.

## Configuration

Pass the full options object directly to the plugin:

```ts
// docusaurus.config.ts
import showcasePlugin, { type PluginOptions as ShowcasePluginOptions } from '@homotechsual/docusaurus-plugin-showcase'

export default {
  plugins: [
    [showcasePlugin, {
      id: 'tools',                   // required if you have other showcase instances
      dataDir: 'data/tools',
      routeBasePath: 'tools',
      pageTitle: 'Documentation Frameworks',
      pageDescription: 'A showcase of frameworks for building documentation sites.',
      favouriteTag: 'featured',
      submitUrl: 'https://github.com/your-org/your-repo/issues',
      tags: {
        featured: {
          label: 'Featured',
          description: 'Our recommended picks.',
          color: '#e9669e',
          icon: 'heart',
        },
        'open-source': {
          label: 'Open Source',
          description: 'Free and open-source tools.',
          color: '#39ca30',
        },
        paid: {
          label: 'Paid / Freemium',
          description: 'Commercial or freemium platforms.',
          color: '#e6af2e',
        },
      },
      statuses: {
        active: {
          label: 'Active',
          description: 'Actively maintained and developed.',
          color: '#39ca30',
          icon: 'circle-check',
        },
        archived: {
          label: 'Archived',
          description: 'No longer actively maintained.',
          color: '#ca3c25',
          icon: 'circle-x',
        },
      },
    } satisfies ShowcasePluginOptions],
  ],
}
```

See the [configuration reference](./configuration) for a full list of options, `TagDef`, and `StatusDef` fields.

## YAML format

The only required core field for a custom showcase is `id`. Everything else is optional:

```yaml
id: my-tool
name: My Tool
description: A short description.
website: https://example.com
source: https://github.com/example/my-tool
preview: https://example.com/img/og-image.png
tags:
  - featured
  - open-source
status: active
```

You can add any extra fields to your YAML files - they are passed through to the item data and are accessible in [swizzled components](./swizzling).

## Schema validation

Point `schemaPath` at a [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) file to validate your YAML entries at build time. Items that fail validation are skipped with a warning rather than causing a build error.

```ts
import { join } from 'node:path'
import showcasePlugin, { type PluginOptions as ShowcasePluginOptions } from '@homotechsual/docusaurus-plugin-showcase'

[showcasePlugin, {
  // ...
  schemaPath: join(import.meta.dirname, 'schema/my-showcase.json'),
} satisfies ShowcasePluginOptions]
```

A minimal schema that requires `id`, `name`, `description`, and `website`, and rejects unknown fields:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "name", "description", "website"],
  "additionalProperties": false,
  "properties": {
    "id":          { "type": "string" },
    "name":        { "type": "string" },
    "description": { "type": "string" },
    "website":     { "type": "string", "format": "uri" },
    "source":      { "type": ["string", "null"], "format": "uri" },
    "preview":     { "type": ["string", "null"] },
    "tags":        { "type": "array", "items": { "type": "string" } },
    "status":      { "type": ["string", "null"] }
  }
}
```

:::note

Place `_localImagePath` validation in your schema only if you need it - the plugin adds this field **after** schema validation, so it will not cause `additionalProperties` failures.

:::
