import { Children, isValidElement, useEffect, type InputHTMLAttributes, type ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ShowcaseFilters, { filterItems } from '../../src/theme/ShowcaseFilters/index.js'
import { readSearchTags } from '../../src/theme/ShowcaseTagSelect/index.js'
import { readMaintenanceStatus } from '../../src/theme/ShowcaseStatusSelect/index.js'
import type { PluginOptions, ShowcaseItem } from '../../src/core/types.js'

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

describe('status and tag filtering', () => {
  const items: ShowcaseItem[] = [
    { id: 'maintained', name: 'Maintained', description: '', tags: ['react', 'featured'], status: 'maintained' },
    { id: 'unknown', name: 'Unknown', description: '', tags: ['react', 'featured'], status: 'unknown' },
    { id: 'partial', name: 'Partial', description: '', tags: ['react'], status: 'maintained' },
    { id: 'unmaintained', name: 'Unmaintained', description: '', tags: ['react', 'featured'], status: 'unmaintained' },
    { id: 'missing', name: 'Missing', description: '', tags: ['react', 'featured'] },
    { id: 'null', name: 'Null', description: '', tags: ['react', 'featured'], status: null },
  ]
  const statuses = ['maintained', 'unknown']

  it.each(['AND', 'OR'] as const)('ORs statuses with the %s tag operator', (operator) => {
    expect(filterItems(items, [], operator, null, statuses).map((item) => item.id))
      .toEqual(['maintained', 'unknown', 'partial'])
  })

  it.each([
    ['AND', ['maintained', 'unknown']],
    ['OR', ['maintained', 'unknown', 'partial']],
  ] as const)('preserves %s tag matching alongside ORed statuses', (operator, expected) => {
    expect(filterItems(items, ['react', 'featured'], operator, null, statuses).map((item) => item.id))
      .toEqual(expected)
  })

  it('still intersects search text with status and tag filters', () => {
    expect(filterItems(items, ['react', 'featured'], 'AND', 'unknown', statuses).map((item) => item.id))
      .toEqual(['unknown'])
  })

  it('leaves statuses unrestricted when none are selected', () => {
    expect(filterItems(items, [], 'AND', null, [])).toEqual(items)
  })

  it.each([
    ['?operator=AND', ['maintained', 'unknown', 'partial']],
    ['?operator=AND&tags=react&tags=featured', ['maintained', 'unknown']],
    ['?operator=AND&tags=react&tags=featured&status=maintained&status=unknown', ['maintained', 'unknown']],
  ])('applies defaults and shared URL filters without requiring multiple statuses: %s', (search, expectedIds) => {
    const previousSearch = location.search
    location.search = search
    const onFilter = vi.fn()
    vi.mocked(useEffect).mockImplementationOnce((effect) => { effect() })
    try {
      ShowcaseFilters({
        items,
        options: {
          dataDir: 'data',
          routeBasePath: 'showcase',
          tags: {},
          statuses: {},
          defaultFilters: { statuses },
        },
        onFilter,
      })
      const expected = items.filter((item) => expectedIds.includes(item.id))
      expect(onFilter).toHaveBeenCalledExactlyOnceWith(expected)
    } finally {
      location.search = previousSearch
    }
  })
})
