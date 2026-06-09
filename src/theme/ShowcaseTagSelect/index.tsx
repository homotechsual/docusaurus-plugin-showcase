import React, { type ReactNode } from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import { toggleListItem } from '../../core/utils.js'
import styles from './styles.module.css'

type Props = {
  tag: string
  id: string
  label: string
  icon: ReactNode
}

const TagsQueryKey = 'tags'

export function readSearchTags(search: string): string[] {
  return new URLSearchParams(search).getAll(TagsQueryKey)
}

export default function ShowcaseTagSelect({ tag, id, label, icon }: Props): React.JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const selectedTags = readSearchTags(location.search)
  const checked = selectedTags.includes(tag)

  const toggle = () => {
    const newTags = toggleListItem(selectedTags, tag)
    const search = new URLSearchParams(location.search)
    search.delete(TagsQueryKey)
    newTags.forEach((t) => search.append(TagsQueryKey, t))
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
