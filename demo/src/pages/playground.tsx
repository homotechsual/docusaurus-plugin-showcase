import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { PlaygroundOutputAccordion } from '../components/PlaygroundOutputAccordion'
import {
  generateTsConfig,
  generateJsConfig,
  generateSampleYaml,
  generateSchema,
} from '../lib/playground-generators'
import type { PlaygroundState, TagEntry, StatusEntry, IconKey, CustomModeState } from '../lib/playground-generators'
import styles from './playground.module.css'

const PLUGINS_PRESET_TAG_KEYS = [
  'favourite', 'docusaurus', 'search', 'api', 'utility',
  'content', 'theme', 'markdown', 'analytics', 'integration', 'seo', 'editing',
]
const SITES_PRESET_TAG_KEYS = [
  'favorite', 'opensource', 'product', 'design', 'i18n',
  'versioning', 'large', 'meta', 'personal', 'rtl',
]
const ICON_OPTIONS: { value: IconKey; label: string }[] = [
  { value: '', label: '(none)' },
  { value: 'circle-check', label: 'circle-check' },
  { value: 'circle-minus', label: 'circle-minus' },
  { value: 'circle-x', label: 'circle-x' },
  { value: 'docusaurus', label: 'docusaurus' },
  { value: 'heart', label: 'heart' },
  { value: 'plus-square', label: 'plus-square' },
]

const SCALAR_DEFAULTS = {
  routeBasePath: 'showcase',
  dataDir: './data',
  pageTitle: '',
  pageDescription: '',
  submitUrl: '',
  screenshotUrl: '',
  favouriteTag: '',
}

const defaultPresetState: PlaygroundState = {
  mode: 'preset',
  preset: 'plugins',
  ...SCALAR_DEFAULTS,
  favouriteTag: 'favourite',
}

const defaultCustomState: PlaygroundState = {
  mode: 'custom',
  ...SCALAR_DEFAULTS,
  tags: [
    { key: 'example', label: 'Example', description: 'An example tag.', color: '#3ecc5f', icon: '' },
  ],
  statuses: [],
}

function extractScalars(s: PlaygroundState) {
  return {
    routeBasePath: s.routeBasePath,
    dataDir: s.dataDir,
    pageTitle: s.pageTitle,
    pageDescription: s.pageDescription,
    submitUrl: s.submitUrl,
    screenshotUrl: s.screenshotUrl,
    favouriteTag: s.favouriteTag,
  }
}

function ScalarFields({
  state,
  favouriteTagKeys,
  onChange,
}: {
  state: PlaygroundState
  favouriteTagKeys: string[]
  onChange: (key: keyof typeof SCALAR_DEFAULTS, value: string) => void
}) {
  return (
    <>
      {(
        [
          ['routeBasePath', 'routeBasePath', 'URL path for the showcase page'],
          ['dataDir', 'dataDir', 'Path to your YAML data directory'],
          ['pageTitle', 'pageTitle', 'Optional page heading'],
          ['pageDescription', 'pageDescription', 'Optional subtitle below the heading'],
          ['submitUrl', 'submitUrl', 'URL for "Add an item" button (optional)'],
          ['screenshotUrl', 'screenshotUrl', 'Screenshot service template URL (optional)'],
        ] as [keyof typeof SCALAR_DEFAULTS, string, string][]
      ).map(([key, label, hint]) => (
        <div key={key} className={styles.field}>
          <label htmlFor={key}>
            <strong>{label}</strong>
            <small className={styles.hint}>{hint}</small>
          </label>
          <input
            id={key}
            type="text"
            value={state[key] as string}
            onChange={(e) => onChange(key, e.target.value)}
            className={styles.input}
          />
        </div>
      ))}
      <div className={styles.field}>
        <label htmlFor="favouriteTag">
          <strong>favouriteTag</strong>
          <small className={styles.hint}>Tag key to display as "Our favourites" section (optional)</small>
        </label>
        <select
          id="favouriteTag"
          value={state.favouriteTag}
          onChange={(e) => onChange('favouriteTag', e.target.value)}
          className={styles.input}
        >
          <option value="">(none)</option>
          {favouriteTagKeys.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
    </>
  )
}

function TagRow({ tag, onChange, onRemove }: {
  tag: TagEntry
  onChange: (updated: TagEntry) => void
  onRemove: () => void
}) {
  return (
    <tr>
      <td className={styles.tableCell}>
        <input className={styles.cellInput} value={tag.key} onChange={(e) => onChange({ ...tag, key: e.target.value })} placeholder="key" />
      </td>
      <td className={styles.tableCell}>
        <input className={styles.cellInput} value={tag.label} onChange={(e) => onChange({ ...tag, label: e.target.value })} placeholder="Label" />
      </td>
      <td className={styles.tableCell}>
        <input className={styles.cellInput} value={tag.description} onChange={(e) => onChange({ ...tag, description: e.target.value })} placeholder="Description" />
      </td>
      <td className={styles.tableCellCenter}>
        <input type="color" value={tag.color} onChange={(e) => onChange({ ...tag, color: e.target.value })} className={styles.colorInput} aria-label="Color" />
      </td>
      <td className={styles.tableCell}>
        <select className={styles.cellInput} value={tag.icon} onChange={(e) => onChange({ ...tag, icon: e.target.value as IconKey })} aria-label="Icon">
          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className={styles.tableCell}>
        <button type="button" className="button button--sm button--danger" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  )
}

function StatusRow({ status, onChange, onRemove }: {
  status: StatusEntry
  onChange: (updated: StatusEntry) => void
  onRemove: () => void
}) {
  return (
    <tr>
      <td className={styles.tableCell}>
        <input className={styles.cellInput} value={status.key} onChange={(e) => onChange({ ...status, key: e.target.value })} placeholder="key" />
      </td>
      <td className={styles.tableCell}>
        <input className={styles.cellInput} value={status.label} onChange={(e) => onChange({ ...status, label: e.target.value })} placeholder="Label" />
      </td>
      <td className={styles.tableCell}>
        <input className={styles.cellInput} value={status.description} onChange={(e) => onChange({ ...status, description: e.target.value })} placeholder="Description" />
      </td>
      <td className={styles.tableCellCenter}>
        <input type="color" value={status.color} onChange={(e) => onChange({ ...status, color: e.target.value })} className={styles.colorInput} aria-label="Color" />
      </td>
      <td className={styles.tableCell}>
        <select className={styles.cellInput} value={status.icon} onChange={(e) => onChange({ ...status, icon: e.target.value as IconKey })} aria-label="Icon">
          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className={styles.tableCell}>
        <button type="button" className="button button--sm button--danger" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  )
}

function EntryTable({ label, rows, onAddRow }: { label: string; rows: React.ReactNode; onAddRow: () => void }) {
  return (
    <div className={styles.entryTable}>
      <div className={styles.entryTableHeader}>
        <strong>{label}</strong>
        <button type="button" className="button button--sm button--secondary" onClick={onAddRow}>+ Add</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {['key', 'label', 'description', 'color', 'icon', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  )
}

export default function PlaygroundPage() {
  const [state, setState] = useState<PlaygroundState>(defaultPresetState)

  function switchMode(mode: 'preset' | 'custom') {
    if (mode === state.mode) return
    const scalars = extractScalars(state)
    if (mode === 'preset') {
      setState({ ...defaultPresetState, ...scalars, favouriteTag: 'favourite' })
    } else {
      setState({ ...defaultCustomState, ...scalars, favouriteTag: '' })
    }
  }

  function updateScalar(key: keyof typeof SCALAR_DEFAULTS, value: string) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const tsConfig = generateTsConfig(state)
  const jsConfig = generateJsConfig(state)
  const sampleYaml = generateSampleYaml(state)
  const schema = generateSchema(state)

  const favouriteTagKeys =
    state.mode === 'preset'
      ? state.preset === 'plugins' ? PLUGINS_PRESET_TAG_KEYS : SITES_PRESET_TAG_KEYS
      : (state as CustomModeState).tags.map((t) => t.key)

  return (
    <Layout title="Config Playground" description="Interactively build your Showcase plugin configuration">
      <main className="container margin-vert--lg">
        <Heading as="h1">Config Playground</Heading>
        <p>Configure the plugin options and see the generated Docusaurus config, sample data file, and JSON Schema update in real time.</p>

        <div className={styles.grid}>
          {/* Controls */}
          <div>
            <ul className={`pills ${styles.modeToggle}`}>
              {(['preset', 'custom'] as const).map((m) => (
                <li
                  key={m}
                  className={`pills__item${state.mode === m ? ' pills__item--active' : ''}`}
                  onClick={() => switchMode(m)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && switchMode(m)}
                >
                  {m === 'preset' ? 'Preset' : 'Custom'}
                </li>
              ))}
            </ul>

            {state.mode === 'preset' && (
              <div className={styles.field}>
                <label><strong>Preset</strong></label>
                <div className={styles.presetOptions}>
                  {(['plugins', 'sites'] as const).map((p) => (
                    <label key={p} className={styles.presetLabel}>
                      <input
                        type="radio"
                        name="preset"
                        value={p}
                        checked={state.preset === p}
                        onChange={() => setState((prev) => ({
                          ...prev,
                          preset: p,
                          favouriteTag: p === 'plugins' ? 'favourite' : 'favorite',
                        } as PlaygroundState))}
                      />
                      {p === 'plugins' ? 'Plugins Directory' : 'Sites Directory'}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <ScalarFields state={state} favouriteTagKeys={favouriteTagKeys} onChange={updateScalar} />

            {state.mode === 'custom' && (() => {
              const customState = state as CustomModeState
              return (
                <>
                  <EntryTable
                    label="Tags"
                    onAddRow={() => setState((prev) => ({
                      ...prev,
                      tags: [...(prev as CustomModeState).tags, { key: '', label: '', description: '', color: '#3ecc5f', icon: '' }],
                    } as PlaygroundState))}
                    rows={customState.tags.map((tag, i) => (
                      <TagRow
                        key={i}
                        tag={tag}
                        onChange={(updated) => setState((prev) => {
                          const tags = [...(prev as CustomModeState).tags]
                          tags[i] = updated
                          return { ...prev, tags } as PlaygroundState
                        })}
                        onRemove={() => setState((prev) => {
                          const tags = (prev as CustomModeState).tags.filter((_, idx) => idx !== i)
                          return { ...prev, tags } as PlaygroundState
                        })}
                      />
                    ))}
                  />
                  <EntryTable
                    label="Statuses"
                    onAddRow={() => setState((prev) => ({
                      ...prev,
                      statuses: [...(prev as CustomModeState).statuses, { key: '', label: '', description: '', color: '#39ca30', icon: '' }],
                    } as PlaygroundState))}
                    rows={customState.statuses.map((status, i) => (
                      <StatusRow
                        key={i}
                        status={status}
                        onChange={(updated) => setState((prev) => {
                          const statuses = [...(prev as CustomModeState).statuses]
                          statuses[i] = updated
                          return { ...prev, statuses } as PlaygroundState
                        })}
                        onRemove={() => setState((prev) => {
                          const statuses = (prev as CustomModeState).statuses.filter((_, idx) => idx !== i)
                          return { ...prev, statuses } as PlaygroundState
                        })}
                      />
                    ))}
                  />
                </>
              )
            })()}
          </div>

          {/* Output */}
          <div className={styles.outputColumn}>
            <PlaygroundOutputAccordion title="docusaurus.config.ts" defaultOpen copyText={tsConfig}>
              <pre className={styles.codeBlock}><code>{tsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="docusaurus.config.js" copyText={jsConfig}>
              <pre className={styles.codeBlock}><code>{jsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="Sample YAML item" defaultOpen copyText={sampleYaml}>
              <pre className={styles.codeBlock}><code>{sampleYaml}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="JSON Schema" copyText={schema}>
              <pre className={styles.codeBlock}><code>{schema}</code></pre>
            </PlaygroundOutputAccordion>
          </div>
        </div>
      </main>
    </Layout>
  )
}
