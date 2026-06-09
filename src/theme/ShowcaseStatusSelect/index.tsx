import React, { type ReactNode } from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import { toggleListItem } from '../../core/utils.js'
import styles from './styles.module.css'

type Props = {
  status: string
  id: string
  label: string
  icon: ReactNode
}

const StatusQueryKey = 'status'

export function readMaintenanceStatus(search: string): string[] {
  return new URLSearchParams(search).getAll(StatusQueryKey)
}

export default function ShowcaseStatusSelect({ status, id, label, icon }: Props): React.JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const selectedStatuses = readMaintenanceStatus(location.search)
  const checked = selectedStatuses.includes(status)

  const toggle = () => {
    const newStatuses = toggleListItem(selectedStatuses, status)
    const search = new URLSearchParams(location.search)
    search.delete(StatusQueryKey)
    newStatuses.forEach((s) => search.append(StatusQueryKey, s))
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
