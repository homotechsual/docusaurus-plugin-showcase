# Showcase Theming — Default Appearance Uplift

**Date:** 2026-06-09  
**Reference:** `J:\Projects\DocusaurusCommunity\website\src\pages\plugindirectory`  
**Scope:** Plugin source (`src/theme/`) + demo site (`demo/src/css/custom.css`)

---

## Goal

Lift the plugin's default visual appearance to match the polished theming in the `docusaurusCommunity/website` plugin directory. All changes ship as improved defaults; every element remains fully swizzleable.

---

## Decisions

- **Plain CSS modules** — no SCSS dependency. CSS modules are processed by the consuming site's webpack; adding SCSS would impose `sass` + `@docusaurus/plugin-sass` on every user.
- **Component structure changes are in scope** — the two filter components require a structural change (hidden checkbox + styled label) to achieve the reference appearance. Pure CSS alone cannot replicate the pill toggle or styled tag labels.
- **No global CSS** — the screen-reader-only utility is defined locally in each component's CSS module, not injected globally. All styles stay scoped to their own module.
- **Inline `var()` fallbacks** — every new CSS custom property includes a fallback so the plugin works out-of-the-box without any site configuration.

---

## Changes

### 1. `ShowcaseFilterToggle` — sliding pill toggle

**Files:** `src/theme/ShowcaseFilterToggle/index.tsx`, `src/theme/ShowcaseFilterToggle/styles.module.css` (new)

**Component change:**  
Replace the current `<button onClick={toggle}>` with a hidden `<input type="checkbox">` + `<label>` pair. The checkbox carries `className={styles.srOnly}` and drives state via `onChange`. The label is the visual element.

**CSS:**
- Label: 80×25px pill (`border-radius` = height), `border: 2px solid var(--ifm-color-primary-darkest)`, flex with "OR" and "AND" text at each end, `opacity: 0.75`, `transition: opacity`.
- `::after` pseudo-element: half-width glider, `background-color: var(--ifm-color-primary-darkest)`, slides via `transform: translateX()`.  
  - Unchecked (OR active): glider on the right half.  
  - Checked (AND active): glider on the left half (`translateX(-border-width)`).
- Hover: `opacity: 1`, box-shadow glow with `--ifm-color-primary-dark`.
- `:focus-visible` on the hidden input targets the label `::after` with an outline.
- `.srOnly`: position absolute, 1px × 1px, clipped — keeps the input accessible without showing it.

**URL state:** unchanged — `readOperator` / `history.push` logic is untouched.

---

### 2. `ShowcaseTagSelect` + `ShowcaseStatusSelect` — styled pill labels

**Files:**
- `src/theme/ShowcaseTagSelect/index.tsx`, `src/theme/ShowcaseTagSelect/styles.module.css` (new)
- `src/theme/ShowcaseStatusSelect/index.tsx`, `src/theme/ShowcaseStatusSelect/styles.module.css` (new)

**Component change:**  
Move the `<input type="checkbox">` to `className={styles.srOnly}`. The `<label htmlFor={id}>` becomes the full visual pill. Remove the current inline styles from both components.

**CSS (identical pattern for both):**
```
input[type='checkbox'] + .checkboxLabel {
  display: flex; align-items: center; cursor: pointer;
  border-radius: 4px; padding: 0.275rem 0.8rem;
  border: 2px solid var(--ifm-color-secondary-darkest);
  opacity: 0.85; line-height: 1.5;
  transition: opacity 200ms ease-out;
}
.checkboxLabel:hover {
  opacity: 1;
  box-shadow: 0 0 2px 1px var(--ifm-color-secondary-darkest);
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
input:focus-visible + .checkboxLabel {
  outline: 2px solid currentColor;
}
```
`.srOnly` is duplicated in each CSS module (8 lines, no shared global needed).

---

### 3. `ShowcaseCard` — animated link, dark mode button, image height

**File:** `src/theme/ShowcaseCard/styles.module.css`

**3a. Animated title link**  
Keep the existing `color: var(--ifm-color-primary)` on `.cardLink`. Add `background` and `transition` to that same rule, and replace the existing `.cardLink:hover { text-decoration: underline }` block with a `:not(:focus):hover` rule that only grows the underline:
```css
/* Add to existing .cardLink rule (keep color: var(--ifm-color-primary)) */
.cardLink {
  text-decoration: none;
  background: linear-gradient(var(--ifm-color-primary), var(--ifm-color-primary))
    0% 100% / 0% 1px no-repeat;
  transition: background-size ease-out 200ms;
}
/* Replace .cardLink:hover { text-decoration: underline } with: */
.cardLink:not(:focus):hover {
  background-size: 100% 1px;
}
```

**3b. Dark mode source button**  
Add after the existing `.sourceBtn` rule:
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

**3c. Card image fixed height**  
```css
.cardImage {
  overflow: hidden;
  height: 150px;
  border-bottom: 2px solid var(--ifm-color-emphasis-200);
}
```

---

### 4. Demo `custom.css` — add `--site-color-checkbox-checked-bg`

**File:** `demo/src/css/custom.css`

Add to `:root`:
```css
--site-color-checkbox-checked-bg: hsl(167deg 56% 73% / 25%);
```
Add to `[data-theme='dark']`:
```css
--site-color-checkbox-checked-bg: hsl(167deg 56% 73% / 10%);
```

The existing `--site-color-favourite-background` and `--site-color-svg-icon-favourite` vars are already present and correct.

---

## Files Touched

| File | Change type |
|---|---|
| `src/theme/ShowcaseFilterToggle/index.tsx` | Component restructure |
| `src/theme/ShowcaseFilterToggle/styles.module.css` | New file |
| `src/theme/ShowcaseTagSelect/index.tsx` | Component restructure |
| `src/theme/ShowcaseTagSelect/styles.module.css` | New file |
| `src/theme/ShowcaseStatusSelect/index.tsx` | Component restructure |
| `src/theme/ShowcaseStatusSelect/styles.module.css` | New file |
| `src/theme/ShowcaseCard/styles.module.css` | CSS additions |
| `demo/src/css/custom.css` | Add one CSS var (light + dark) |

8 files total. No changes to `ShowcasePage`, `ShowcaseFilters`, `ShowcaseTooltip`, plugin logic, or types.

---

## Out of Scope

- Tooltip styling (reference uses `--site-color-tooltip` vars; the plugin's tooltip already works adequately)
- `@docusaurus/plugin-ideal-image` for card images (reference uses `<Image>` from ideal-image; out of scope for this pass)
- Any changes to the YAML schema, plugin options, or data loading
