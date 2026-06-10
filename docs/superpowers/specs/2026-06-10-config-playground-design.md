# Config Playground Design

**Date:** 2026-06-10
**Status:** Approved

## Overview

Add an interactive Config Playground to the `docusaurus-plugin-showcase` demo site, modelled on the existing playground in `docusaurus-plugin-plausible`. Users configure the plugin through a form UI and see live-generated config snippets, a sample YAML data item, and a JSON Schema — all updated in real time.

The `PlaygroundOutputAccordion` component built for this feature is also backported to the plausible demo, replacing its current inline output blocks.

---

## Architecture

### New files — showcase demo (`j:/Projects/docusaurus-plugin-showcase/demo/`)

| File | Purpose |
|---|---|
| `src/pages/playground.tsx` | Page shell: layout, state, mode toggle, form controls |
| `src/pages/playground-generators.ts` | All four code-generation functions (TS config, JS config, YAML, schema) |
| `src/components/PlaygroundOutputAccordion.tsx` | Reusable accordion output panel with integrated Copy button |

### Changed files — showcase demo

| File | Change |
|---|---|
| `docusaurus.config.ts` | Add `/playground` to navbar and footer links |

### New files — plausible demo (`j:/Projects/docusaurus-plugin-plausible/demo/`)

| File | Purpose |
|---|---|
| `src/components/PlaygroundOutputAccordion.tsx` | Copied from showcase |
| `src/pages/playground-generators.ts` | Generators extracted from existing monolithic `playground.tsx` |

### Changed files — plausible demo

| File | Change |
|---|---|
| `src/pages/playground.tsx` | Refactored to use `PlaygroundOutputAccordion`; inline `CopyButton` removed |

---

## State

The page holds a union-typed state object. Switching modes preserves scalar fields but resets tag/status state.

```typescript
interface ScalarOptions {
  routeBasePath: string
  dataDir: string
  pageTitle: string
  pageDescription: string
  submitUrl: string
  screenshotUrl: string
  favouriteTag: string
}

interface PresetModeState extends ScalarOptions {
  mode: 'preset'
  preset: 'plugins' | 'sites'
}

// Available icon keys (from plugin's icon registry). Empty string = no icon.
type IconKey = '' | 'heart' | 'docusaurus' | 'circle-check' | 'circle-x' | 'circle-minus' | 'plus-square'

interface TagEntry {
  key: string
  label: string
  description: string
  color: string   // hex colour string, e.g. '#61dafb'
  icon: IconKey
}

interface StatusEntry {
  key: string
  label: string
  description: string
  color: string
  icon: IconKey
}

interface CustomModeState extends ScalarOptions {
  mode: 'custom'
  tags: TagEntry[]
  statuses: StatusEntry[]
}

type PlaygroundState = PresetModeState | CustomModeState
```

**Defaults — preset mode:**
- `preset: 'plugins'`
- `routeBasePath: 'showcase'`
- `dataDir: './data'`
- All other scalars: empty string

**Defaults — custom mode:**
- `tags`: one example tag row pre-populated to guide the user
- `statuses`: empty
- Scalars preserved from prior mode state

---

## UI Layout

Two-column CSS Grid layout (mirrors plausible playground):

- **Left column — Options form**
  - Segmented control: `Preset | Custom` (switches mode)
  - **Preset mode shows:**
    - Preset selector: radio or select — `Docusaurus Plugins Directory` / `Docusaurus Sites Directory`
    - Scalar option inputs (routeBasePath, dataDir, pageTitle, pageDescription, submitUrl, screenshotUrl)
    - `favouriteTag`: `<select>` populated with the chosen preset's tag keys (e.g. `favourite`, `analytics`, …); empty option = unset
  - **Custom mode shows:**
    - Same scalar option inputs (routeBasePath, dataDir, pageTitle, pageDescription, submitUrl, screenshotUrl)
    - `favouriteTag`: `<select>` dynamically populated from the user's defined tag keys; empty option = unset
    - Tags table: rows of (key, label, description, color `<input type="color">`, icon `<select>` of `IconKey` values), with Add Row / Remove Row buttons
    - Statuses table: same row structure as tags table

- **Right column — Output**
  - Four stacked `PlaygroundOutputAccordion` instances:
    1. `docusaurus.config.ts` — **open by default**
    2. `docusaurus.config.js` — collapsed by default
    3. Sample YAML item — **open by default**
    4. JSON Schema — collapsed by default

All outputs update live on every state change.

---

## `PlaygroundOutputAccordion` Component

```typescript
interface PlaygroundOutputAccordionProps {
  title: string
  defaultOpen?: boolean      // default: false
  copyText: string           // full text written to clipboard on Copy
  children: React.ReactNode  // rendered content (code block)
}
```

- Header bar: title text, chevron (rotates when open), Copy button
- Copy button always visible regardless of open/closed state
- Copy feedback: button label changes to `✅ Copied` for 2 seconds, then reverts
- Body: conditionally rendered (no animation) — consistent with Docusaurus component behaviour
- Styled with Docusaurus `var(--ifm-*)` CSS variables for theme/dark-mode compatibility

---

## Code Generators (`playground-generators.ts`)

### `generateTsConfig(state: PlaygroundState): string`

**Preset mode:**
```ts
import type { PluginOptions } from '@homotechsual/docusaurus-plugin-showcase'
import { pluginsPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'
// or sitesPreset

export default {
  plugins: [
    ...pluginsPreset({
      routeBasePath: 'showcase',
      dataDir: './data',
      // ... only non-empty scalar options included
    } satisfies Partial<PluginOptions>),
  ],
} satisfies Config
```

**Custom mode:**
```ts
import type { PluginOptions } from '@homotechsual/docusaurus-plugin-showcase'

export default {
  plugins: [
    [
      '@homotechsual/docusaurus-plugin-showcase',
      {
        routeBasePath: 'showcase',
        dataDir: './data',
        tags: {
          react: { label: 'React', description: '...', color: '#61dafb' },
        },
        // statuses omitted if empty
      } satisfies PluginOptions,
    ],
  ],
} satisfies Config
```

### `generateJsConfig(state: PlaygroundState): string`

Same structure as TS but without imports or `satisfies` annotations.

### `generateSampleYaml(state: PlaygroundState): string`

Always the same shape. Tag keys: first 1–2 keys from the active preset or custom tag list, so the sample is immediately valid against the schema.

```yaml
id: author.my-item
name: My Item
description: A brief description of this item.
website: https://example.com
tags:
  - analytics
```

### `generateSchema(state: PlaygroundState): string`

**Preset mode:** A short YAML comment block showing the `$schema` line to add to data files:

```yaml
# Add this line to your YAML files for editor validation:
# $schema: ./node_modules/@homotechsual/docusaurus-plugin-showcase/schema/plugins-preset/1.0.0.json
```

**Custom mode:** A generated JSON Schema (rendered as JSON) with the user's tag keys as the valid enum for `tags` items, and status keys similarly. Matches the structure of the bundled schemas at `schema/showcase/1.0.0.json`.

---

## Plausible Backport Scope

The plausible playground currently has two stacked output blocks (TS config, JS config) with an inline `CopyButton` component.

Changes:
1. Extract all generator functions from `playground.tsx` into `playground-generators.ts`
2. Copy `PlaygroundOutputAccordion.tsx` into the plausible demo's `src/components/`
3. Replace the two inline output blocks with two `<PlaygroundOutputAccordion>` instances (both `defaultOpen`)
4. Remove the inline `CopyButton` component (absorbed into the accordion)

No behaviour changes to the plausible playground — purely structural/component improvements.

---

## Testing

- Manual: open the demo site, exercise both modes, verify all four accordions update live and Copy works
- Verify dark mode: toggle Docusaurus dark mode, check accordion styling holds
- Verify plausible playground still behaves identically after refactor
