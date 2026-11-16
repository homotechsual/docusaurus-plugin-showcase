import { Children, isValidElement, type InputHTMLAttributes, type ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ShowcaseFilters from '../../src/theme/ShowcaseFilters/index.js'
import { readSearchTags } from '../../src/theme/ShowcaseTagSelect/index.js'
import { readMaintenanceStatus } from '../../src/theme/ShowcaseStatusSelect/index.js'
import type { PluginOptions } from '../../src/core/types.js'

const { location, history, setSearchValue } = vi.hoisted(() => ({
  location: {
    pathname: '/showcase',
    search: '?tags=react&tags=featured&status=active&operator=AND&name=old',
    hash: '#filters',
    state: { source: 'showcase' },
  },
  history: { push: vi.fn(), replace: vi.fn() },
  setSearchValue: vi.fn(),
}))

vi.mock('react', async (importOriginal) => ({
  ...await importOriginal<typeof import('react')>(),
  useState: () => ['', setSearchValue],
  useEffect: vi.fn(),
}))

vi.mock('@docusaurus/router', () => ({
  useLocation: () => location,
  useHistory: () => history,
}))

vi.mock('@docusaurus/theme-common', () => ({
  usePluralForm: () => ({ selectMessage: () => '0 items' }),
}))

vi.mock('@docusaurus/Translate', () => ({
  default: () => null,
  translate: ({ message }: { message: string }) => message,
}))

vi.mock('../../src/theme/ShowcaseTooltip/index.js', () => ({
  default: () => null,
}))

function findSearchInput(node: ReactNode): InputHTMLAttributes<HTMLInputElement> {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ id?: string; children?: ReactNode }>(child)) continue
    if (child.type === 'input' && child.props.id === 'showcase-searchbar') {
      return child.props
    }
    if (child.props.children) {
      const input = findSearchInput(child.props.children)
      if (input.onInput) return input
    }
  }
  return {}
}

describe('Showcase search URL updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each(['d', 'doc', ''])('replaces history without navigation when searching for %j', (value) => {
    const options: PluginOptions = {
      dataDir: 'data',
      tags: {},
      statuses: {},
    }
    const input = findSearchInput(ShowcaseFilters({ items: [], options, onFilter: vi.fn() }))
    const target = { value } as HTMLInputElement
    expect(input.onInput).toBeTypeOf('function')
    input.onInput!({ currentTarget: target } as React.FormEvent<HTMLInputElement>)

    const search = new URLSearchParams(location.search)
    if (value) search.set('name', value)
    else search.delete('name')

    expect(setSearchValue).toHaveBeenCalledWith(value)
    expect(history.replace).toHaveBeenCalledExactlyOnceWith({
      ...location,
      search: search.toString(),
    })
    expect(history.push).not.toHaveBeenCalled()
  })
})

describe('default showcase filters', () => {
  it('uses default tags and statuses when their URL filters are absent', () => {
    expect(readSearchTags('', ['react'])).toEqual(['react'])
    expect(readMaintenanceStatus('', ['maintained', 'unknown'])).toEqual(['maintained', 'unknown'])
  })

  it('uses URL filters instead of defaults when explicitly supplied', () => {
    expect(readSearchTags('?tags=featured', ['react'])).toEqual(['featured'])
    expect(readMaintenanceStatus('?status=unmaintained', ['maintained', 'unknown'])).toEqual(['unmaintained'])
  })

  it('allows an explicit empty URL filter to clear defaults', () => {
    expect(readSearchTags('?tags=', ['react'])).toEqual([])
    expect(readMaintenanceStatus('?status=', ['maintained', 'unknown'])).toEqual([])
  })
})
