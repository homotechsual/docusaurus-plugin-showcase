import React from 'react'
import clsx from 'clsx'
import { useHistory, useLocation } from '@docusaurus/router'
import Translate from '@docusaurus/Translate'
import styles from './styles.module.css'

export type Operator = 'AND' | 'OR'

const OperatorQueryKey = 'operator'

export function readOperator(search: string): Operator {
  return (new URLSearchParams(search).get(OperatorQueryKey) as Operator) ?? 'OR'
}

export default function ShowcaseFilterToggle(): React.JSX.Element {
  const id = 'showcase_filter_toggle'
  const history = useHistory()
  const location = useLocation()
  const operator = readOperator(location.search)
  const isAnd = operator === 'AND'

  const toggle = () => {
    const next = isAnd ? 'OR' : 'AND'
    const search = new URLSearchParams(location.search)
    search.set(OperatorQueryKey, next)
    history.push({ ...location, search: search.toString() })
  }

  return (
    <div>
      <input
        type="checkbox"
        id={id}
        className={styles.srOnly}
        aria-label="Toggle between OR and AND for the selected filters"
        onChange={toggle}
        checked={isAnd}
      />
      <label htmlFor={id} className={clsx(styles.checkboxLabel, 'shadow--md')}>
        <span><Translate id="showcase.filterToggle.or">OR</Translate></span>
        <span><Translate id="showcase.filterToggle.and">AND</Translate></span>
      </label>
    </div>
  )
}
