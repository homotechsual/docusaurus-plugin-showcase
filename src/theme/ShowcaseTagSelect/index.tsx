import React, { type ReactNode } from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import { toggleListItem } from '../../core/utils.js'

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
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={toggle}
        style={{ marginRight: 4 }}
      />
      {label}
      {icon}
    </label>
  )
}
