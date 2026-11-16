import React, { type ReactNode } from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import { toggleListItem } from '../../core/utils.js'
import styles from './styles.module.css'

type Props = {
  tag: string
  id: string
  label: string
  icon: ReactNode
  defaultTags?: string[]
}

const TagsQueryKey = 'tags'

export function readSearchTags(search: string, defaultTags: string[] = []): string[] {
  const params = new URLSearchParams(search)
  return params.has(TagsQueryKey)
    ? params.getAll(TagsQueryKey).filter(Boolean)
    : defaultTags
}

export default function ShowcaseTagSelect({ tag, id, label, icon, defaultTags = [] }: Props): React.JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const selectedTags = readSearchTags(location.search, defaultTags)
  const checked = selectedTags.includes(tag)

  const toggle = () => {
    const newTags = toggleListItem(selectedTags, tag)
    const search = new URLSearchParams(location.search)
    search.delete(TagsQueryKey)
    if (newTags.length === 0 && defaultTags.length > 0) search.append(TagsQueryKey, '')
    else newTags.forEach((t) => search.append(TagsQueryKey, t))
    history.push({ ...location, search: search.toString() })
  }

  return (
    <>
      <input
        type="checkbox"
        id={id}
        className={styles.srOnly}
        checked={checked}
        onChange={toggle}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        {label}
        {icon}
      </label>
    </>
  )
}
