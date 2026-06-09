import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from '@docusaurus/router'
import { usePluralForm } from '@docusaurus/theme-common'
import { translate } from '@docusaurus/Translate'
import clsx from 'clsx'
import type { ShowcaseItem, PluginOptions } from '../../core/types.js'
import ShowcaseTagSelect, { readSearchTags } from '../ShowcaseTagSelect/index.js'
import ShowcaseStatusSelect, { readMaintenanceStatus } from '../ShowcaseStatusSelect/index.js'
import ShowcaseFilterToggle, { readOperator, type Operator } from '../ShowcaseFilterToggle/index.js'
import ShowcaseTooltip from '../ShowcaseTooltip/index.js'
import { getIcon } from '../icons.js'
import styles from './styles.module.css'

const SearchNameKey = 'name'

export function readSearchName(search: string): string | null {
  return new URLSearchParams(search).get(SearchNameKey)
}

export function filterItems(
  items: ShowcaseItem[],
  selectedTags: string[],
  operator: Operator,
  searchName: string | null,
  selectedStatuses: string[],
): ShowcaseItem[] {
  let result = items

  if (searchName) {
    const q = searchName.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q),
    )
  }

  if (selectedStatuses.length > 0) {
    result = result.filter((item) =>
      operator === 'AND'
        ? selectedStatuses.every((s) => item.status === s)
        : selectedStatuses.some((s) => item.status === s),
    )
  }

  if (selectedTags.length > 0) {
    result = result.filter((item) => {
      if (item.tags.length === 0) return false
      return operator === 'AND'
        ? selectedTags.every((t) => item.tags.includes(t))
        : selectedTags.some((t) => item.tags.includes(t))
    })
  }

  return result
}

type Props = {
  items: ShowcaseItem[]
  options: PluginOptions
  onFilter: (filtered: ShowcaseItem[]) => void
}

export default function ShowcaseFilters({ items, options, onFilter }: Props): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const [searchValue, setSearchValue] = useState<string>('')

  useEffect(() => {
    const tags = readSearchTags(location.search)
    const operator = readOperator(location.search)
    const name = readSearchName(location.search)
    const statuses = readMaintenanceStatus(location.search)
    setSearchValue(name ?? '')
    onFilter(filterItems(items, tags, operator, name, statuses))
  }, [location.search, items, onFilter])

  const { selectMessage } = usePluralForm()
  const filteredCount = filterItems(
    items,
    readSearchTags(location.search),
    readOperator(location.search),
    readSearchName(location.search),
    readMaintenanceStatus(location.search),
  ).length

  const countLabel = selectMessage(
    filteredCount,
    translate({
      id: 'showcase.filters.resultCount',
      message: '1 item|{count} items',
    }, { count: filteredCount }),
  )

  const updateSearch = (value: string) => {
    setSearchValue(value)
    const search = new URLSearchParams(location.search)
    if (value) search.set(SearchNameKey, value)
    else search.delete(SearchNameKey)
    history.push({ ...location, search: search.toString() })
  }

  return (
    <section className="container margin-top--l margin-bottom--lg">
      <div className={styles.filtersRow}>
        <div className={styles.filtersRowLeft}>
          <h2 style={{ marginBottom: 0 }}>
            {translate({ id: 'showcase.filters.title', message: 'Filters' })}
          </h2>
          <span>{countLabel}</span>
        </div>
        <ShowcaseFilterToggle />
      </div>

      <ul className={clsx('clean-list', styles.tagList)}>
        {Object.entries(options.tags).map(([key, tag]) => {
          const id = `showcase-tag-${key}`
          const Icon = getIcon(tag.icon)
          return (
            <li key={key} className={styles.tagListItem}>
              <ShowcaseTooltip id={id} text={tag.description} anchorEl="#__docusaurus">
                <ShowcaseTagSelect
                  tag={key}
                  id={id}
                  label={tag.label}
                  icon={Icon ? <Icon size={16} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: tag.color, display: 'inline-block', marginLeft: 4 }} />}
                />
              </ShowcaseTooltip>
            </li>
          )
        })}
      </ul>

      <ul className={clsx('clean-list', styles.tagList)}>
        {Object.entries(options.statuses).map(([key, status]) => {
          const id = `showcase-status-${key}`
          const Icon = getIcon(status.icon)
          return (
            <li key={key} className={styles.tagListItem}>
              <ShowcaseTooltip id={id} text={status.description} anchorEl="#__docusaurus">
                <ShowcaseStatusSelect
                  status={key}
                  id={id}
                  label={status.label}
                  icon={Icon ? <Icon size={16} /> : null}
                />
              </ShowcaseTooltip>
            </li>
          )
        })}
      </ul>

      <div className={styles.searchContainer}>
        <input
          id="showcase-searchbar"
          placeholder={translate({
            id: 'showcase.searchBar.placeholder',
            message: 'Search by name or author...',
          })}
          value={searchValue}
          onInput={(e) => updateSearch(e.currentTarget.value)}
        />
      </div>
    </section>
  )
}
