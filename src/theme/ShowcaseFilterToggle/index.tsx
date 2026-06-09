import React from 'react'
import { useHistory, useLocation } from '@docusaurus/router'
import Translate from '@docusaurus/Translate'

export type Operator = 'AND' | 'OR'

const OperatorQueryKey = 'operator'

export function readOperator(search: string): Operator {
  return (new URLSearchParams(search).get(OperatorQueryKey) as Operator) ?? 'OR'
}

export default function ShowcaseFilterToggle(): JSX.Element {
  const history = useHistory()
  const location = useLocation()
  const operator = readOperator(location.search)

  const toggle = () => {
    const next = operator === 'OR' ? 'AND' : 'OR'
    const search = new URLSearchParams(location.search)
    search.set(OperatorQueryKey, next)
    history.push({ ...location, search: search.toString() })
  }

  return (
    <button onClick={toggle} className="button button--sm button--secondary">
      <Translate
        id="showcase.filterToggle.label"
        values={{ operator: <b>{operator}</b> }}
      >
        {'Filter: {operator}'}
      </Translate>
    </button>
  )
}
