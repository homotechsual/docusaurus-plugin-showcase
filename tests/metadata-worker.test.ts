import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../examples/metadata-worker/worker.mjs'

const env = {
  ALLOWED_ORIGINS: 'https://demo.example.com',
  PAGES_PROJECT: 'docusaurus-showcase',
  GITHUB_TOKEN: 'test-public-only-token',
}
let stored: Map<string, Response>
let pending: Promise<unknown>[]
const upstream = vi.fn()

async function request(path: string, origin = 'https://demo.example.com', method = 'GET') {
  const response = await worker.fetch(new Request(`https://metadata.example.com${path}`, {
    method, headers: { Origin: origin },
  }), env, { waitUntil: (promise: Promise<unknown>) => pending.push(promise) })
  await Promise.all(pending)
  pending = []
  return response
}

beforeEach(() => {
  stored = new Map()
  pending = []
  upstream.mockReset()
  vi.stubGlobal('fetch', upstream)
  vi.stubGlobal('caches', { default: {
    match: async (key: Request) => stored.get(key.url)?.clone(),
    put: async (key: Request, response: Response) => { stored.set(key.url, response.clone()) },
  } })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('standalone metadata Worker', () => {
  it('resolves scoped npm packages and caches normalized requests without cached CORS', async () => {
    upstream.mockResolvedValue(Response.json({ version: '1.2.3' }))
    const first = await request('/npm?package=%40scope%2Fname&ignored=1')
    expect(await first.json()).toEqual({ values: [{ text: '@scope/name: 1.2.3', href: 'https://www.npmjs.com/package/@scope/name' }] })
    expect(upstream.mock.calls[0][0]).toBe('https://registry.npmjs.org/%40scope%2Fname/latest')
    expect(first.headers.get('Cache-Control')).toContain('max-age=900')
    const second = await request('/npm?package=@scope/name', 'https://branch.docusaurus-showcase.pages.dev')
    expect(second.headers.get('Access-Control-Allow-Origin')).toBe('https://branch.docusaurus-showcase.pages.dev')
    expect(upstream).toHaveBeenCalledTimes(1)
    expect([...stored.values()][0].headers.has('Access-Control-Allow-Origin')).toBe(false)
  })

  it('fetches both release and default-branch commit with a shared public repository check', async () => {
    upstream.mockResolvedValueOnce(Response.json({ private: false }))
      .mockResolvedValueOnce(Response.json({ tag_name: 'v2', published_at: '2026-11-01T12:00:00Z' }))
      .mockResolvedValueOnce(Response.json([{ sha: 'a'.repeat(40), commit: { committer: { date: '2026-11-02T12:00:00Z' } } }]))
    const release = await request('/github/release?repo=owner/repo')
    expect((await release.json()).values[0].text).toBe('v2')
    const commit = await request('/github/commit?repo=owner/repo')
    expect((await commit.json()).values[0]).toEqual({
      text: 'aaaaaaa', date: '2026-11-02T12:00:00Z', href: `https://github.com/owner/repo/commit/${'a'.repeat(40)}`,
    })
    expect(upstream).toHaveBeenCalledTimes(3)
    expect(upstream.mock.calls[2][0]).toContain('/commits?per_page=1')
    expect(upstream.mock.calls[0][1].headers.Authorization).toBe('Bearer test-public-only-token')
  })

  it('distinguishes no stable releases from an unknown repository', async () => {
    upstream.mockResolvedValueOnce(Response.json({ private: false }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
    expect(await (await request('/github/release?repo=owner/repo')).json()).toEqual({ values: [{ text: 'No stable releases published' }] })
    upstream.mockResolvedValueOnce(new Response(null, { status: 404 }))
    expect((await request('/github/release?repo=owner/missing')).status).toBe(404)
  })

  it('handles empty repositories without treating arbitrary conflicts as success', async () => {
    upstream.mockResolvedValueOnce(Response.json({ private: false }))
      .mockResolvedValueOnce(Response.json({ message: 'Git Repository is empty.' }, { status: 409 }))
    expect(await (await request('/github/commit?repo=owner/empty')).json()).toEqual({ values: [{ text: 'No code updates' }] })
    upstream.mockResolvedValueOnce(Response.json({ private: false }))
      .mockResolvedValueOnce(Response.json({ message: 'Other conflict' }, { status: 409 }))
    expect((await request('/github/commit?repo=owner/conflict')).status).toBe(502)
  })

  it('rejects private repository data even when a token has access', async () => {
    upstream.mockResolvedValueOnce(Response.json({ private: true }))
    expect((await request('/github/release?repo=owner/private')).status).toBe(404)
    expect(stored.size).toBe(0)
    expect(upstream).toHaveBeenCalledTimes(1)
  })

  it('does not cache provider errors and explicitly surfaces rate limits', async () => {
    upstream.mockResolvedValue(new Response(null, { status: 429 }))
    const response = await request('/npm?package=test')
    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(stored.size).toBe(0)
    await request('/npm?package=test')
    expect(upstream).toHaveBeenCalledTimes(2)
  })

  it.each(['/npm?package=https://bad.example', '/github/release?repo=../..', '/unknown'])('rejects invalid routes and identifiers: %s', async (path) => {
    expect((await request(path)).status).toBeGreaterThanOrEqual(400)
    expect(upstream).not.toHaveBeenCalled()
  })

  it('handles preflight and blocks unrelated browser origins', async () => {
    expect((await request('/npm', 'https://demo.example.com', 'OPTIONS')).status).toBe(204)
    expect((await request('/health', 'https://docusaurus-showcase.pages.dev.evil.example')).headers.has('Access-Control-Allow-Origin')).toBe(false)
    expect((await request('/health', 'https://demo.example.com', 'POST')).status).toBe(405)
  })
})
