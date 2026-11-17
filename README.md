# Showcase for Docusaurus

[![NPM Version](https://img.shields.io/npm/v/%40homotechsual%2Fdocusaurus-plugin-showcase?style=for-the-badge)
](https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase)
[![NPM Last Update](https://img.shields.io/npm/last-update/%40homotechsual%2Fdocusaurus-plugin-showcase?style=for-the-badge)](https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase)
[![NPM Downloads](https://img.shields.io/npm/dy/%40homotechsual%2Fdocusaurus-plugin-showcase?style=for-the-badge)
](https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase)

A Docusaurus plugin for building swizzleable showcase / directory pages from YAML data files.

**[Full documentation →](https://showcase.docusaurus.homotechsual.dev)**

## Installation

```bash
npm install @homotechsual/docusaurus-plugin-showcase
# or
yarn add @homotechsual/docusaurus-plugin-showcase
```

## Quick start

Two built-in presets cover the most common use cases:

- **`pluginsPreset`** — a Docusaurus plugin directory with 12 category tags and 3 maintenance statuses.
- **`sitesPreset`** — mirrors the tag set from [docusaurus.io/showcase](https://docusaurus.io/showcase).

```ts
// docusaurus.config.ts
import { pluginsPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

export default {
  plugins: [
    ['@homotechsual/docusaurus-plugin-showcase', {
      ...pluginsPreset,
      dataDir: 'data/plugins',
      routeBasePath: 'plugins',
    }],
  ],
}
```

For custom tags, statuses, JSON Schema validation, co-located images, swizzling, and all configuration options, see the [docs](https://showcase.docusaurus.homotechsual.dev).

## Runtime computed fields

Cards can resolve additional fields in the browser using synchronous or async
functions exported from client-side modules. The demo uses this for npm versions,
GitHub releases, and code updates through an external caching API.
See the [runtime fields documentation](demo/docs/runtime-computed-fields.mdx) and
[standalone Cloudflare Workers example](examples/metadata-worker). The proxy is
not bundled or deployed by the npm package.

## Demo site integrations

The demo homepage displays the package version and links to the current release.
Its production build generates OpenGraph images for documentation and pages using
`@homotechsual/docusaurus-og` and locally installed Inter fonts. Plausible tracking
is configured for `showcase.docusaurus.homotechsual.dev`; these integrations are
demo-only and are not enabled automatically for plugin consumers.

## Licence

Apache-2.0
