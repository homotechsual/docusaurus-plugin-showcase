# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-25

### Added

* `submitLabel` plugin option — customises the text of the submit button. Falls back to the existing translatable default ("Add an item") when not set.

### Fixed

* `PlusSquare` icon now renders correctly at size 16. The previous path used a `fillRule: evenodd` cutout whose arms were ~0.5 px wide at that size, causing the icon to appear as a solid filled circle.

## [1.0.1] - 2026-06-11

### Added

* `PresetOptions` type — a narrower type for preset configurations requiring `tags`, exported from the package root.

### Changed

* Plugin default export now typed as `Plugin<unknown>` instead of `Plugin<ShowcasePageData>` for improved compatibility with the Docusaurus plugin type system.

## [1.0.0] - 2026-06-10

### Added

* `screenshotUrl` plugin option — a URL template for auto-generating preview images for items that have no `preview` field. Supports two tokens:
  * `{url}` — the site URL percent-encoded with `encodeURIComponent`
  * `{rawUrl}` — the site URL unmodified
* DocFX preset configuration and documentation in the demo site.

### Changed

* Cards for items with no `preview` field and no `screenshotUrl` configured now render with no image at all. Previously, the card would emit a broken `<img>` pointing at the now-removed hardcoded screenshot service.

### Removed

* Hardcoded fallback to `slorber-api-screenshot.netlify.app` for items without a `preview` image. Configure `screenshotUrl` explicitly if you want auto-screenshots.

## [0.1.0] - 2026-06-09

Initial release.

### Added

* Plugin core with full Docusaurus lifecycle integration (`loadContent`, `contentLoaded`, `getThemePath`, `validateOptions`).
* `ShowcasePage`, `ShowcaseCard`, `ShowcaseFilters`, `ShowcaseTooltip`, `ShowcaseFilterToggle`, `ShowcaseTagSelect`, and `ShowcaseStatusSelect` swizzleable theme components.
* YAML data loader with optional [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) validation — items that fail validation are skipped with a build-time warning.
* **Plugins preset** — tag and status definitions covering the Docusaurus plugin ecosystem, with a bundled schema.
* **Sites preset** — 10 tags matching the [docusaurus.io/showcase](https://docusaurus.io/showcase) taxonomy.
* Co-located preview images — place an image file alongside a YAML data file and the plugin resolves it automatically at build time.
* `title` → `name` alias in the YAML loader for compatibility with the Docusaurus community showcase data format.
* Filter UI: sliding AND/OR pill toggle, tag filter chips, status filter chips, and a name search bar.
* `favouriteTag` option — items with the designated tag are surfaced in a highlighted "Our favourites" section above the main grid.
* `schemaPath` option — supply your own JSON Schema to validate item data.
* `submitUrl` option — shows an "Add an item" button when set.
* `pageTitle` and `pageDescription` options for customising the page heading.
* `statuses` option — optional status definitions; the status filter row is hidden when empty.
* Bundled Heroicons (MIT) SVG icon components.
* Demo Docusaurus site with sample plugin, sites, and tools data.
* CI via GitHub Actions with npm and GitHub Package Registry publish workflows.

[1.1.0]: https://github.com/homotechsual/docusaurus-plugin-showcase/compare/1.0.1...1.1.0

[1.0.1]: https://github.com/homotechsual/docusaurus-plugin-showcase/compare/1.0.0...1.0.1

[1.0.0]: https://github.com/homotechsual/docusaurus-plugin-showcase/compare/0.1.0...1.0.0

[0.1.0]: https://github.com/homotechsual/docusaurus-plugin-showcase/releases/tag/0.1.0
