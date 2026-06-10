export function sortBy<T>(
  array: T[],
  getter: (item: T) => string | number | boolean,
): T[] {
  const copy = [...array]
  copy.sort((a, b) => {
    const va = getter(a)
    const vb = getter(b)
    if (va > vb) return 1
    if (vb > va) return -1
    return 0
  })
  return copy
}

export function toggleListItem<T>(list: T[], item: T): T[] {
  const index = list.indexOf(item)
  if (index === -1) return [...list, item]
  const copy = [...list]
  copy.splice(index, 1)
  return copy
}

export function resolveScreenshotUrl(template: string, website: string): string {
  return template
    .replace('{url}', encodeURIComponent(website))
    .replace('{rawUrl}', website)
}
