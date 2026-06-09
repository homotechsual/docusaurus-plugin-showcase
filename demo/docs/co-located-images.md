---
sidebar_position: 6
sidebar_label: Co-located Images
---

# Co-located images

By default, the `preview` field in a YAML file is a remote URL. Co-located images let you place the preview image file **next to the YAML file** so that webpack or Rspack processes it as a bundled asset - giving you content-hashed filenames, local optimisation, and no external dependency.

## How it works

Name the image file the same as the YAML file (same base name, any supported extension):

```text
data/sites/
  my-site.yaml
  my-site.png        ← picked up automatically
```

The plugin checks for a co-located image after loading and validating the YAML entry. If one is found, it is served through the bundler's asset pipeline rather than loaded from a URL at runtime.

## Supported extensions

The plugin checks for co-located images in this order, stopping at the first match:

1. `.png`
2. `.jpg`
3. `.jpeg`
4. `.webp`
5. `.gif`
6. `.svg`

## Priority rules

| Scenario | Result |
| --- | --- |
| Co-located image exists | Bundler asset used; `preview` URL in YAML is ignored. |
| No co-located image, `preview` set | Remote `preview` URL used. |
| No co-located image, no `preview` | Falls back to the [slorber-api-screenshot](https://github.com/slorber/slorber-api-screenshot) service which generates a screenshot of `website`. |

## Schema compatibility

Co-located image detection runs **after** JSON Schema validation. The internal `_localImagePath` property added by the plugin will therefore never conflict with an `additionalProperties: false` schema constraint.
