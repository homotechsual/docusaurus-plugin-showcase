---
sidebar_position: 1
sidebar_label: Introduction
---

# @homotechsual/docusaurus-plugin-showcase

A Docusaurus plugin for building swizzleable showcase / directory pages from YAML data files.

## Installation

```bash
npm install @homotechsual/docusaurus-plugin-showcase
```

## Quick start (plugins directory preset)

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

## YAML file format (plugins preset)

Each plugin is a separate `.yaml` file. Add the language-server comment for autocomplete:

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
```

## Custom configuration

Use core types to define your own tags and statuses for any showcase use case:

```ts
import type { PluginOptions } from '@homotechsual/docusaurus-plugin-showcase'

const options: PluginOptions = {
  dataDir: 'data/showcase',
  routeBasePath: 'showcase',
  pageTitle: 'Community Showcase',
  pageDescription: 'Sites built with our framework.',
  tags: {
    featured: { label: 'Featured', description: 'Hand-picked featured sites.', color: '#e9669e' },
    community: { label: 'Community', description: 'Built by the community.', color: '#3ecc5f' },
  },
  statuses: {
    active: { label: 'Active', description: 'Actively maintained.', icon: 'circle-check' },
  },
  favouriteTag: 'featured',
}
```

## Swizzling components

All theme components are swizzleable:

```bash
npx docusaurus swizzle @homotechsual/docusaurus-plugin-showcase ShowcaseCard
```

Swizzleable components: `ShowcasePage` (unsafe/wrap), `ShowcaseCard` (safe), `ShowcaseFilters` (safe), `ShowcaseFilterToggle` (safe), `ShowcaseTagSelect` (unsafe/wrap), `ShowcaseStatusSelect` (unsafe/wrap), `ShowcaseTooltip` (safe).

## Initial publish

Before OIDC trusted publishing works, publish once manually to claim the package name:

```bash
npm publish --access public
```

Then configure the trust policy on npmjs.org: package → Settings → Publishing → Granular access tokens → add the GitHub repo + `npm` environment.

## Licence

Apache-2.0
