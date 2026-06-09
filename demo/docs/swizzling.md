---
sidebar_position: 7
sidebar_label: Swizzling
---

# Swizzling

All theme components provided by this plugin are swizzleable using the standard Docusaurus swizzle command. Swizzle a component to wrap or replace it with your own implementation.

## Command

```bash
npx docusaurus swizzle @homotechsual/docusaurus-plugin-showcase <ComponentName>
```

## Components

| Component | Safety | Notes |
| --- | --- | --- |
| `ShowcasePage` | Unsafe / wrap | Top-level page layout. Controls the favourites section and the main grid. Wrap rather than eject to avoid diverging from future updates. |
| `ShowcaseCard` | Safe | Individual item card. Safe to eject and fully customise. |
| `ShowcaseFilters` | Safe | Filter bar containing the tag chips, status select, and toggle. |
| `ShowcaseFilterToggle` | Safe | OR / AND toggle that controls whether multiple tag filters are inclusive or exclusive. |
| `ShowcaseTagSelect` | Unsafe / wrap | Renders the list of tag filter chips. |
| `ShowcaseStatusSelect` | Unsafe / wrap | Renders the status filter dropdown. |
| `ShowcaseTooltip` | Safe | Tooltip wrapper used on tag chips. |

## Example - wrapping ShowcaseCard

Wrapping lets you add content above or below the original component without fully owning its implementation:

```tsx
// src/theme/ShowcaseCard/index.tsx
import React from 'react'
import ShowcaseCard from '@theme-original/ShowcaseCard'
import type ShowcaseCardType from '@theme/ShowcaseCard'
import type { WrapperProps } from '@docusaurus/types'

type Props = WrapperProps<typeof ShowcaseCardType>

export default function ShowcaseCardWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <ShowcaseCard {...props} />
    </>
  )
}
```

## Accessing custom fields

If your YAML files contain fields beyond the standard set, those fields are available on the `item` prop in any component that receives a `ShowcaseItem`:

```tsx
// Inside a swizzled ShowcaseCard
const { minimumVersion, author } = item as ShowcaseItem & {
  minimumVersion?: string
  author?: string
}
```
