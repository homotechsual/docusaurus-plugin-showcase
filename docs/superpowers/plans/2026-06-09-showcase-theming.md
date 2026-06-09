# Showcase Theming Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the plugin's default visual appearance to match the `docusaurusCommunity/website` plugin directory — sliding OR/AND toggle, styled tag/status pills, animated card title link, dark-mode source button, fixed card image height.

**Architecture:** All changes are isolated to CSS modules and their paired React components. No new dependencies. New CSS files are picked up automatically by the existing `scripts/copy-assets.mjs` build step which copies all `.css` files from `src/` → `lib/`. The demo site's `custom.css` gets one new CSS custom property.

**Tech Stack:** React 19, Docusaurus 3, CSS Modules, TypeScript, Yarn workspaces (`demo` workspace)

---

## File Map

| File | Action |
|---|---|
| `src/theme/ShowcaseFilterToggle/styles.module.css` | **Create** |
| `src/theme/ShowcaseFilterToggle/index.tsx` | **Modify** — replace `<button>` with hidden checkbox + label pill |
| `src/theme/ShowcaseTagSelect/styles.module.css` | **Create** |
| `src/theme/ShowcaseTagSelect/index.tsx` | **Modify** — move checkbox to srOnly, style label as pill |
| `src/theme/ShowcaseStatusSelect/styles.module.css` | **Create** |
| `src/theme/ShowcaseStatusSelect/index.tsx` | **Modify** — same pattern as TagSelect |
| `src/theme/ShowcaseCard/styles.module.css` | **Modify** — animated link, dark-mode button, image height |
| `demo/src/css/custom.css` | **Modify** — add `--site-color-checkbox-checked-bg` |

---

## Context You Need

**How CSS modules work here:** Each `.module.css` file is processed by the consuming Docusaurus site's webpack at build time. Class names are scoped (e.g. `.checkboxLabel` → `.checkboxLabel_abc123`). Type selectors like `input` are NOT scoped, so `input:checked + .checkboxLabel` compiles to `input:checked + .checkboxLabel_abc123` — this is intentional and correct.

**How the tooltip wraps filter components:** `ShowcaseTooltip` wraps its children in a `<span>` with its own `ref`. The tag/status select components are rendered inside this span. This means the DOM structure is `<span><input/><label/></span>`, making `input + .checkboxLabel` a valid adjacent sibling selector. No `forwardRef` is needed on the select components.

**FilterToggle glider logic:** The `::after` pseudo-element starts at `left: 0`, `width: 50%`. The default transform slides it to the right half (covering the AND side) when OR is active. When checked (AND active), it slides back to the left half (covering the OR side). This matches the reference implementation exactly.

**Build commands:**
```bash
# From repo root — build the plugin (tsc + copy-assets)
yarn build

# Start the demo site (from repo root)
yarn workspace demo start
```

---

## Task 1: ShowcaseFilterToggle — pill toggle

**Files:**
- Create: `src/theme/ShowcaseFilterToggle/styles.module.css`
- Modify: `src/theme/ShowcaseFilterToggle/index.tsx`

- [ ] **Step 1: Create the CSS file**

Create `src/theme/ShowcaseFilterToggle/styles.module.css` with this exact content:

```css
.srOnly {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: polygon(0 0, 0 0, 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
}

.checkboxLabel {
  --toggle-height: 25px;
  --toggle-width: 80px;
  --toggle-border: 2px;
  display: flex;
  width: var(--toggle-width);
  height: var(--toggle-height);
  position: relative;
  border-radius: var(--toggle-height);
  border: var(--toggle-border) solid var(--ifm-color-primary-darkest);
  cursor: pointer;
  justify-content: space-around;
  align-items: center;
  opacity: 0.75;
  transition: opacity var(--ifm-transition-fast) var(--ifm-transition-timing-default);
  box-shadow: var(--ifm-global-shadow-md);
}

.checkboxLabel:hover {
  opacity: 1;
  box-shadow: var(--ifm-global-shadow-md), 0 0 2px 1px var(--ifm-color-primary-dark);
}

.checkboxLabel::after {
  position: absolute;
  content: '';
  inset: 0;
  width: calc(var(--toggle-width) / 2);
  height: 100%;
  border-radius: var(--toggle-height);
  background-color: var(--ifm-color-primary-darkest);
  transition: transform var(--ifm-transition-fast) var(--ifm-transition-timing-default);
  transform: translateX(calc(var(--toggle-width) / 2 - var(--toggle-border)));
}

.checkboxLabel > * {
  font-size: 0.8rem;
  color: inherit;
  z-index: 1;
  transition: opacity 150ms ease-in 50ms;
}

input:checked + .checkboxLabel::after {
  transform: translateX(calc(-1 * var(--toggle-border)));
}

input:focus-visible + .checkboxLabel {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

- [ ] **Step 2: Replace ShowcaseFilterToggle/index.tsx**

Replace the entire content of `src/theme/ShowcaseFilterToggle/index.tsx`:

```tsx
import React from 'react'
import clsx from 'clsx'
import { useHistory, useLocation } from '@docusaurus/router'
import Translate from '@docusaurus/Translate'
import styles from './styles.module.css'

export type Operator = 'AND' | 'OR'

const OperatorQueryKey = 'operator'

export function readOperator(search: string): Operator {
  return (new URLSearchParams(search).get(OperatorQueryKey) as Operator) ?? 'OR'
}

export default function ShowcaseFilterToggle(): JSX.Element {
  const id = 'showcase_filter_toggle'
  const history = useHistory()
  const location = useLocation()
  const operator = readOperator(location.search)
  const isAnd = operator === 'AND'

  const toggle = () => {
    const next = isAnd ? 'OR' : 'AND'
    const search = new URLSearchParams(location.search)
    search.set(OperatorQueryKey, next)
    history.push({ ...location, search: search.toString() })
  }

  return (
    <div>
      <input
        type="checkbox"
        id={id}
        className={styles.srOnly}
        aria-label="Toggle between OR and AND for the selected filters"
        onChange={toggle}
        checked={isAnd}
      />
      <label htmlFor={id} className={clsx(styles.checkboxLabel, 'shadow--md')}>
        <Translate id="showcase.filterToggle.or">OR</Translate>
        <Translate id="showcase.filterToggle.and">AND</Translate>
      </label>
    </div>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
yarn build
```

Expected: exits 0 with no TypeScript errors. The `lib/theme/ShowcaseFilterToggle/styles.module.css` file should appear in `lib/`.

- [ ] **Step 4: Commit**

```bash
git add src/theme/ShowcaseFilterToggle/styles.module.css src/theme/ShowcaseFilterToggle/index.tsx
git commit -m "feat: replace filter toggle button with sliding pill toggle"
```

---

## Task 2: ShowcaseTagSelect — styled pill labels

**Files:**
- Create: `src/theme/ShowcaseTagSelect/styles.module.css`
- Modify: `src/theme/ShowcaseTagSelect/index.tsx`

- [ ] **Step 1: Create the CSS file**

Create `src/theme/ShowcaseTagSelect/styles.module.css`:

```css
.srOnly {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: polygon(0 0, 0 0, 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
}

input[type='checkbox'] + .checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
  line-height: 1.5;
  border-radius: 4px;
  padding: 0.275rem 0.8rem;
  opacity: 0.85;
  transition: opacity 200ms ease-out;
  border: 2px solid var(--ifm-color-secondary-darkest);
}

.checkboxLabel:hover {
  opacity: 1;
  box-shadow: 0 0 2px 1px var(--ifm-color-secondary-darkest);
}

input:focus-visible + .checkboxLabel {
  outline: 2px solid currentColor;
}

input:checked + .checkboxLabel {
  opacity: 0.9;
  background-color: var(--site-color-checkbox-checked-bg, hsl(167deg 56% 73% / 25%));
  border: 2px solid var(--ifm-color-primary-darkest);
}

input:checked + .checkboxLabel:hover {
  opacity: 0.75;
  box-shadow: 0 0 2px 1px var(--ifm-color-primary-dark);
}
```

- [ ] **Step 2: Replace ShowcaseTagSelect/index.tsx**

Replace the entire content of `src/theme/ShowcaseTagSelect/index.tsx`:

```tsx
import React, { type ReactNode } from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import { toggleListItem } from '../../core/utils.js'
import styles from './styles.module.css'

type Props = {
  tag: string
  id: string
  label: string
  icon: ReactNode
}

const TagsQueryKey = 'tags'

export function readSearchTags(search: string): string[] {
  return new URLSearchParams(search).getAll(TagsQueryKey)
}

export default function ShowcaseTagSelect({ tag, id, label, icon }: Props): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const selectedTags = readSearchTags(location.search)
  const checked = selectedTags.includes(tag)

  const toggle = () => {
    const newTags = toggleListItem(selectedTags, tag)
    const search = new URLSearchParams(location.search)
    search.delete(TagsQueryKey)
    newTags.forEach((t) => search.append(TagsQueryKey, t))
    history.push({ ...location, search: search.toString() })
  }

  return (
    <>
      <input
        type="checkbox"
        id={id}
        className={styles.srOnly}
        checked={checked}
        onChange={toggle}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        {label}
        {icon}
      </label>
    </>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
yarn build
```

Expected: exits 0. `lib/theme/ShowcaseTagSelect/styles.module.css` appears in `lib/`.

- [ ] **Step 4: Commit**

```bash
git add src/theme/ShowcaseTagSelect/styles.module.css src/theme/ShowcaseTagSelect/index.tsx
git commit -m "feat: style tag filter pills with border, hover glow and checked state"
```

---

## Task 3: ShowcaseStatusSelect — styled pill labels

**Files:**
- Create: `src/theme/ShowcaseStatusSelect/styles.module.css`
- Modify: `src/theme/ShowcaseStatusSelect/index.tsx`

- [ ] **Step 1: Create the CSS file**

Create `src/theme/ShowcaseStatusSelect/styles.module.css` — identical pill pattern as TagSelect:

```css
.srOnly {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: polygon(0 0, 0 0, 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
}

input[type='checkbox'] + .checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
  line-height: 1.5;
  border-radius: 4px;
  padding: 0.275rem 0.8rem;
  opacity: 0.85;
  transition: opacity 200ms ease-out;
  border: 2px solid var(--ifm-color-secondary-darkest);
}

.checkboxLabel:hover {
  opacity: 1;
  box-shadow: 0 0 2px 1px var(--ifm-color-secondary-darkest);
}

input:focus-visible + .checkboxLabel {
  outline: 2px solid currentColor;
}

input:checked + .checkboxLabel {
  opacity: 0.9;
  background-color: var(--site-color-checkbox-checked-bg, hsl(167deg 56% 73% / 25%));
  border: 2px solid var(--ifm-color-primary-darkest);
}

input:checked + .checkboxLabel:hover {
  opacity: 0.75;
  box-shadow: 0 0 2px 1px var(--ifm-color-primary-dark);
}
```

- [ ] **Step 2: Replace ShowcaseStatusSelect/index.tsx**

Replace the entire content of `src/theme/ShowcaseStatusSelect/index.tsx`:

```tsx
import React, { type ReactNode } from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import { toggleListItem } from '../../core/utils.js'
import styles from './styles.module.css'

type Props = {
  status: string
  id: string
  label: string
  icon: ReactNode
}

const StatusQueryKey = 'status'

export function readMaintenanceStatus(search: string): string[] {
  return new URLSearchParams(search).getAll(StatusQueryKey)
}

export default function ShowcaseStatusSelect({ status, id, label, icon }: Props): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const selectedStatuses = readMaintenanceStatus(location.search)
  const checked = selectedStatuses.includes(status)

  const toggle = () => {
    const newStatuses = toggleListItem(selectedStatuses, status)
    const search = new URLSearchParams(location.search)
    search.delete(StatusQueryKey)
    newStatuses.forEach((s) => search.append(StatusQueryKey, s))
    history.push({ ...location, search: search.toString() })
  }

  return (
    <>
      <input
        type="checkbox"
        id={id}
        className={styles.srOnly}
        checked={checked}
        onChange={toggle}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        {label}
        {icon}
      </label>
    </>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
yarn build
```

Expected: exits 0. `lib/theme/ShowcaseStatusSelect/styles.module.css` appears in `lib/`.

- [ ] **Step 4: Commit**

```bash
git add src/theme/ShowcaseStatusSelect/styles.module.css src/theme/ShowcaseStatusSelect/index.tsx
git commit -m "feat: style status filter pills with border, hover glow and checked state"
```

---

## Task 4: ShowcaseCard — animated link, dark-mode button, image height

**Files:**
- Modify: `src/theme/ShowcaseCard/styles.module.css`

- [ ] **Step 1: Update `.cardImage` — add fixed height and border**

In `src/theme/ShowcaseCard/styles.module.css`, replace:

```css
.cardImage {
  overflow: hidden;
}
```

with:

```css
.cardImage {
  overflow: hidden;
  height: 150px;
  border-bottom: 2px solid var(--ifm-color-emphasis-200);
}
```

- [ ] **Step 2: Update `.cardLink` — animated gradient underline**

Replace the existing `.cardLink` and `.cardLink:hover` rules (two separate blocks currently):

```css
.cardLink {
  color: var(--ifm-color-primary);
  text-decoration: none;
}

.cardLink:hover {
  text-decoration: underline;
}
```

with:

```css
.cardLink {
  color: var(--ifm-color-primary);
  text-decoration: none;
  background: linear-gradient(var(--ifm-color-primary), var(--ifm-color-primary))
    0% 100% / 0% 1px no-repeat;
  transition: background-size ease-out 200ms;
}

.cardLink:not(:focus):hover {
  background-size: 100% 1px;
}
```

- [ ] **Step 3: Update `.sourceBtn` — dark mode support**

After the existing `.sourceBtn { margin-left: auto; }` rule, add:

```css
.sourceBtn:focus-visible {
  background-color: var(--ifm-color-secondary-dark);
}

[data-theme='dark'] .sourceBtn {
  background-color: var(--ifm-color-emphasis-200) !important;
  color: inherit;
}

[data-theme='dark'] .sourceBtn:hover {
  background-color: var(--ifm-color-emphasis-300) !important;
}
```

- [ ] **Step 4: Type-check**

```bash
yarn build
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/theme/ShowcaseCard/styles.module.css
git commit -m "feat: add animated card title link, dark-mode source button, fixed image height"
```

---

## Task 5: Demo — add checkbox checked CSS custom property

**Files:**
- Modify: `demo/src/css/custom.css`

- [ ] **Step 1: Add `--site-color-checkbox-checked-bg` to both themes**

In `demo/src/css/custom.css`, add to the `:root` block:

```css
--site-color-checkbox-checked-bg: hsl(167deg 56% 73% / 25%);
```

And add to the `[data-theme='dark']` block:

```css
--site-color-checkbox-checked-bg: hsl(167deg 56% 73% / 10%);
```

The full file should look like:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  --ifm-color-primary-darker: #277148;
  --ifm-color-primary-darkest: #205d3b;
  --ifm-color-primary-light: #33925d;
  --ifm-color-primary-lighter: #359962;
  --ifm-color-primary-lightest: #3cad6e;
  --ifm-code-font-size: 95%;
  --site-color-favourite-background: #f6d5f7;
  --site-color-svg-icon-favourite: #e9669e;
  --site-color-checkbox-checked-bg: hsl(167deg 56% 73% / 25%);
}

[data-theme='dark'] {
  --ifm-color-primary: #25c2a0;
  --ifm-color-primary-dark: #21af90;
  --ifm-color-primary-darker: #1fa588;
  --ifm-color-primary-lightest: #4fddbf;
  --site-color-favourite-background: #4a1d4a;
  --site-color-checkbox-checked-bg: hsl(167deg 56% 73% / 10%);
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/css/custom.css
git commit -m "feat: add site-color-checkbox-checked-bg CSS var to demo"
```

---

## Task 6: Visual verification

- [ ] **Step 1: Start the demo**

```bash
yarn workspace demo start
```

Open `http://localhost:3000/plugins` in a browser.

- [ ] **Step 2: Verify filter toggle**

- [ ] Toggle pill is visible in the top-right of the filter bar (NOT a plain button)
- [ ] Pill shows "OR" and "AND" text on each half
- [ ] Clicking toggles the glider between left and right halves
- [ ] Hover adds a glow shadow
- [ ] URL query string changes between `?operator=OR` and `?operator=AND`

- [ ] **Step 3: Verify tag + status pills**

- [ ] Tag filter items render as bordered pill labels (no native checkbox visible)
- [ ] Hovering a pill adds a box-shadow glow
- [ ] Clicking a pill highlights it (teal/green background, primary-darkest border)
- [ ] Clicking a highlighted pill de-selects it (returns to default border/background)
- [ ] Tab key navigates through pills; focused pill shows an outline

- [ ] **Step 4: Verify card title link**

- [ ] Hovering a card title shows an animated underline growing left-to-right
- [ ] The underline colour matches `--ifm-color-primary`

- [ ] **Step 5: Verify source button in dark mode**

- [ ] Toggle dark mode (click the theme toggle in the navbar)
- [ ] Cards with a "source" button show it with a grey background (not white/default)
- [ ] Hovering the source button in dark mode darkens it slightly

- [ ] **Step 6: Verify card image height**

- [ ] All cards have a uniform image height (~150px)
- [ ] A 2px border separates the image from the card body

- [ ] **Step 7: Final commit if anything was tweaked**

```bash
git add -p  # stage only what you changed
git commit -m "fix: visual verification tweaks"
```
