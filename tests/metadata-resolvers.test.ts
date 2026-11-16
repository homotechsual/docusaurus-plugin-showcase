import { afterEach, describe, expect, it, vi } from 'vitest'
import { githubCommit, githubRelease, npmVersions } from '../demo/src/lib/metadata-resolvers.js'
import type { ShowcaseItem } from '../src/core/types.js'

const item: ShowcaseItem = { id: 'example', name: 'Example', description: '', tags: [] }
const context = { options: { endpoint: 'https://metadata.example.com' } }
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('demo API resolvers', () => {
  it('skips inapplicable items without requesting metadata', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(await npmVersions(item, context)).toBeNull()
    expect(await githubRelease({ ...item, source: 'https://gitlab.com/a/b' }, context)).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('deduplicates repository requests across different items and supports tree source URLs', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ values: [{ text: 'v1' }] }))
    vi.stubGlobal('fetch', fetch)
    await Promise.all([
      githubRelease({ ...item, source: 'https://github.com/test/shared/tree/main/path' }, context),
      githubRelease({ ...item, id: 'other', source: 'https://github.com/test/shared.git' }, context),
    ])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe('https://metadata.example.com/github/release?repo=test%2Fshared')
  })

  it('collects versions for all npm packages', async () => {
    const fetch = vi.fn().mockImplementation(async (url: string) => Response.json({ values: [{ text: url }] }))
    vi.stubGlobal('fetch', fetch)
    const result = await npmVersions({ ...item, npmPackages: ['test-package', '@scope/test-package'] }, context)
    expect(result).toHaveLength(2)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('reports failures, permits subsequent retry, and rejects malformed responses', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ values: [{ text: 'bad', href: 'javascript:bad' }] }))
      .mockResolvedValueOnce(Response.json({ values: [{ text: 'Recovered' }] }))
    vi.stubGlobal('fetch', fetch)
    const source = { ...item, source: 'https://github.com/test/retry' }
    await expect(githubCommit(source, context)).rejects.toThrow('503')
    await expect(githubCommit(source, context)).rejects.toThrow('Invalid')
    await expect(githubCommit(source, context)).resolves.toEqual([{ text: 'Recovered' }])
  })
})
