import React, { useEffect, useState } from 'react'
import Translate, { translate } from '@docusaurus/Translate'
import type { ComputedFieldDef, ComputedFieldValue, PluginOptions, ShowcaseItem } from '../../core/types.js'
import { resolveComputedField } from '../../core/computed-fields.js'
import cardStyles from '../ShowcaseCard/styles.module.css'
import styles from './styles.module.css'

function relativeDate(date: string): string {
  const seconds = (Date.parse(date) - Date.now()) / 1000
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, size] of [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]] as const) {
    if (Math.abs(seconds) >= size || unit === 'second') return formatter.format(Math.round(seconds / size), unit)
  }
  return ''
}

function Field({ field, item }: { field: ComputedFieldDef; item: ShowcaseItem }): React.JSX.Element | null {
  const [state, setState] = useState<{ value?: ComputedFieldValue[] | null; error?: string }>({})
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setState({})
    resolveComputedField(field, item, attempt > 0).then(
      (value) => { if (active) setState({ value }) },
      (error: unknown) => {
        console.error(`[docusaurus-plugin-showcase] Computed field "${field.label}" failed:`, error)
        if (active) setState({ error: error instanceof Error ? error.message : String(error) })
      },
    )
    return () => { active = false }
  }, [field, item, attempt])
  if (state.value === null || state.value?.length === 0) return null
  return (
    <div className={`${cardStyles.statusRow} ${styles.row}`}>
      <span className={cardStyles.statusLabel}>{field.label}:</span>
      {state.error ? (
        <span role="status" title={state.error}>
          <Translate id="showcase.computed.unavailable">Information unavailable</Translate>{' '}
          <button type="button" className={styles.retry} onClick={() => setAttempt((value) => value + 1)}>
            <Translate id="showcase.computed.retry">Retry</Translate>
          </button>
        </span>
      ) : state.value === undefined ? (
        <span role="status">{translate({ id: 'showcase.computed.loading', message: 'Loading...' })}</span>
      ) : (
        <ul className={styles.values}>
          {state.value.map((value, index) => (
            <li key={index}>
              {value.href ? <a href={value.href} target="_blank" rel="noopener noreferrer">{value.text}</a> : value.text}
              {value.date && <> {'\u00b7'} <time dateTime={value.date} title={new Date(value.date).toLocaleString()}>{relativeDate(value.date)}</time></>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ShowcaseComputedFields({ item, options }: { item: ShowcaseItem; options: PluginOptions }): React.JSX.Element {
  return <>{Object.entries(options.computedFields ?? {}).map(([key, field]) => <Field key={key} item={item} field={field} />)}</>
}
