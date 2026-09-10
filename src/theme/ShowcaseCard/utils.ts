import { resolveScreenshotUrl } from '../../core/utils.js'
import type { ShowcaseItem } from '../../core/types.js'

export const DEFAULT_PLACEHOLDER_PREVIEW =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="No preview available"><rect width="640" height="360" fill="%23f2f4f7"/><rect x="20" y="20" width="600" height="320" rx="14" fill="%23dbe1e8"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%23596a7a">No preview available</text></svg>'

export function normaliseCardUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function resolveCardPreviewImage(item: ShowcaseItem, screenshotUrl: string | null | undefined): string | null {
  const explicitPreview = normaliseCardUrl(item.preview)
  if (explicitPreview) return explicitPreview

  const website = normaliseCardUrl(item.website)
  if (website && screenshotUrl) {
    return resolveScreenshotUrl(screenshotUrl, website)
  }

  if (!website) {
    return DEFAULT_PLACEHOLDER_PREVIEW
  }

  return null
}
