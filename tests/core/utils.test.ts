import { describe, it, expect } from 'vitest'
import { sortBy, toggleListItem, resolveScreenshotUrl } from '../../src/core/utils.js'

describe('sortBy', () => {
  it('sorts an array by a string getter ascending', () => {
    const input = [{ name: 'Zebra' }, { name: 'Apple' }, { name: 'Mango' }]
    const result = sortBy(input, (x) => x.name.toLowerCase())
    expect(result.map((x) => x.name)).toEqual(['Apple', 'Mango', 'Zebra'])
  })

  it('sorts an array by a number getter ascending', () => {
    const input = [{ n: 3 }, { n: 1 }, { n: 2 }]
    const result = sortBy(input, (x) => x.n)
    expect(result.map((x) => x.n)).toEqual([1, 2, 3])
  })

  it('does not mutate the original array', () => {
    const input = [{ n: 2 }, { n: 1 }]
    sortBy(input, (x) => x.n)
    expect(input[0].n).toBe(2)
  })

  it('returns empty array unchanged', () => {
    expect(sortBy([], (x: string) => x)).toEqual([])
  })
})

describe('toggleListItem', () => {
  it('adds item when not present', () => {
    expect(toggleListItem(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
  })

  it('removes item when present', () => {
    expect(toggleListItem(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })

  it('does not mutate the original array', () => {
    const input = ['a', 'b']
    toggleListItem(input, 'a')
    expect(input).toEqual(['a', 'b'])
  })

  it('returns empty array when removing last item', () => {
    expect(toggleListItem(['a'], 'a')).toEqual([])
  })
})

describe('resolveScreenshotUrl', () => {
  it('replaces {url} with the percent-encoded website', () => {
    const result = resolveScreenshotUrl(
      'https://screenshot.example.com/{url}/thumb',
      'https://mysite.com/page?q=1&r=2',
    )
    expect(result).toBe(
      'https://screenshot.example.com/https%3A%2F%2Fmysite.com%2Fpage%3Fq%3D1%26r%3D2/thumb',
    )
  })

  it('replaces {rawUrl} with the raw website string', () => {
    const result = resolveScreenshotUrl(
      'https://screenshot.example.com/?target={rawUrl}',
      'https://mysite.com',
    )
    expect(result).toBe('https://screenshot.example.com/?target=https://mysite.com')
  })

  it('resolves a template containing both {url} and {rawUrl}', () => {
    const result = resolveScreenshotUrl(
      'https://screenshot.example.com/{url}?raw={rawUrl}',
      'https://mysite.com',
    )
    expect(result).toBe(
      'https://screenshot.example.com/https%3A%2F%2Fmysite.com?raw=https://mysite.com',
    )
  })

  it('returns the template unchanged when it contains no tokens', () => {
    const result = resolveScreenshotUrl(
      'https://screenshot.example.com/fixed-path',
      'https://mysite.com',
    )
    expect(result).toBe('https://screenshot.example.com/fixed-path')
  })
})
