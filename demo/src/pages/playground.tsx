// demo/src/pages/playground.tsx
import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { PlaygroundOutputAccordion } from '../components/PlaygroundOutputAccordion'
import {
  generateTsConfig,
  generateJsConfig,
  generateSampleYaml,
  generateSchema,
} from './playground-generators'
import type { PlaygroundState, TagEntry, StatusEntry, IconKey, CustomModeState } from './playground-generators'

// ── Tag keys for favouriteTag <select> in preset mode ──────────────────────
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

// ── Shared input style ─────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '0.25rem',
  padding: '0.4rem 0.6rem',
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: '4px',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontFamily: 'var(--ifm-font-family-base)',
  fontSize: '0.9rem',
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }

// ── Default states ─────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Sub-components ─────────────────────────────────────────────────────────
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
        <div key={key} style={fieldStyle}>
          <label htmlFor={key}>
            <strong>{label}</strong>
            <small style={{ display: 'block', color: 'var(--ifm-color-emphasis-700)' }}>{hint}</small>
          </label>
          <input
            id={key}
            type="text"
            value={state[key] as string}
            onChange={(e) => onChange(key, e.target.value)}
            style={inputStyle}
          />
        </div>
      ))}
      <div style={fieldStyle}>
        <label htmlFor="favouriteTag">
          <strong>favouriteTag</strong>
          <small style={{ display: 'block', color: 'var(--ifm-color-emphasis-700)' }}>
            Tag key to display as "Our favourites" section (optional)
          </small>
        </label>
        <select
          id="favouriteTag"
          value={state.favouriteTag}
          onChange={(e) => onChange('favouriteTag', e.target.value)}
          style={inputStyle}
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

function TagRow({
  tag,
  onChange,
  onRemove,
}: {
  tag: TagEntry
  onChange: (updated: TagEntry) => void
  onRemove: () => void
}) {
  const cellStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', verticalAlign: 'middle' }
  const cellInputStyle: React.CSSProperties = { ...inputStyle, marginTop: 0 }
  return (
    <tr>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={tag.key} onChange={(e) => onChange({ ...tag, key: e.target.value })} placeholder="key" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={tag.label} onChange={(e) => onChange({ ...tag, label: e.target.value })} placeholder="Label" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={tag.description} onChange={(e) => onChange({ ...tag, description: e.target.value })} placeholder="Description" />
      </td>
      <td style={{ ...cellStyle, textAlign: 'center' }}>
        <input type="color" value={tag.color} onChange={(e) => onChange({ ...tag, color: e.target.value })} style={{ width: '2.5rem', height: '2rem', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} />
      </td>
      <td style={cellStyle}>
        <select style={cellInputStyle} value={tag.icon} onChange={(e) => onChange({ ...tag, icon: e.target.value as IconKey })}>
          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <button className="button button--sm button--danger" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  )
}

function StatusRow({
  status,
  onChange,
  onRemove,
}: {
  status: StatusEntry
  onChange: (updated: StatusEntry) => void
  onRemove: () => void
}) {
  const cellStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', verticalAlign: 'middle' }
  const cellInputStyle: React.CSSProperties = { ...inputStyle, marginTop: 0 }
  return (
    <tr>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={status.key} onChange={(e) => onChange({ ...status, key: e.target.value })} placeholder="key" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={status.label} onChange={(e) => onChange({ ...status, label: e.target.value })} placeholder="Label" />
      </td>
      <td style={cellStyle}>
        <input style={cellInputStyle} value={status.description} onChange={(e) => onChange({ ...status, description: e.target.value })} placeholder="Description" />
      </td>
      <td style={{ ...cellStyle, textAlign: 'center' }}>
        <input type="color" value={status.color} onChange={(e) => onChange({ ...status, color: e.target.value })} style={{ width: '2.5rem', height: '2rem', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} />
      </td>
      <td style={cellStyle}>
        <select style={cellInputStyle} value={status.icon} onChange={(e) => onChange({ ...status, icon: e.target.value as IconKey })}>
          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <button className="button button--sm button--danger" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  )
}

function EntryTable({ label, rows, onAddRow }: { label: string; rows: React.ReactNode; onAddRow: () => void }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <strong>{label}</strong>
        <button className="button button--sm button--secondary" onClick={onAddRow}>+ Add</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--ifm-color-emphasis-100)' }}>
              {['key', 'label', 'description', 'color', 'icon', ''].map((h) => (
                <th key={h} style={{ padding: '0.35rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
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
      ? state.preset === 'plugins'
        ? PLUGINS_PRESET_TAG_KEYS
        : SITES_PRESET_TAG_KEYS
      : (state as CustomModeState).tags.map((t) => t.key)

  const modeBtnBase: React.CSSProperties = {
    padding: '0.35rem 1rem',
    border: '1px solid var(--ifm-color-emphasis-300)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  }

  return (
    <Layout title="Config Playground" description="Interactively build your Showcase plugin configuration">
      <main className="container margin-vert--lg">
        <Heading as="h1">Config Playground</Heading>
        <p>Configure the plugin options and see the generated Docusaurus config, sample data file, and JSON Schema update in real time.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* ── Left: Controls ── */}
          <div>
            {/* Mode toggle */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
              {(['preset', 'custom'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    ...modeBtnBase,
                    background: state.mode === m ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                    color: state.mode === m ? '#fff' : 'var(--ifm-font-color-base)',
                    borderRadius: m === 'preset' ? '6px 0 0 6px' : '0 6px 6px 0',
                  }}
                >
                  {m === 'preset' ? 'Preset' : 'Custom'}
                </button>
              ))}
            </div>

            {state.mode === 'preset' && (
              <div style={fieldStyle}>
                <label><strong>Preset</strong></label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  {(['plugins', 'sites'] as const).map((p) => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
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
                    onAddRow={() =>
                      setState((prev) => ({
                        ...prev,
                        tags: [
                          ...(prev as CustomModeState).tags,
                          { key: '', label: '', description: '', color: '#3ecc5f', icon: '' },
                        ],
                      } as PlaygroundState))
                    }
                    rows={customState.tags.map((tag, i) => (
                      <TagRow
                        key={i}
                        tag={tag}
                        onChange={(updated) =>
                          setState((prev) => {
                            const tags = [...(prev as CustomModeState).tags]
                            tags[i] = updated
                            return { ...prev, tags } as PlaygroundState
                          })
                        }
                        onRemove={() =>
                          setState((prev) => {
                            const tags = (prev as CustomModeState).tags.filter((_, idx) => idx !== i)
                            return { ...prev, tags } as PlaygroundState
                          })
                        }
                      />
                    ))}
                  />
                  <EntryTable
                    label="Statuses"
                    onAddRow={() =>
                      setState((prev) => ({
                        ...prev,
                        statuses: [
                          ...(prev as CustomModeState).statuses,
                          { key: '', label: '', description: '', color: '#39ca30', icon: '' },
                        ],
                      } as PlaygroundState))
                    }
                    rows={customState.statuses.map((status, i) => (
                      <StatusRow
                        key={i}
                        status={status}
                        onChange={(updated) =>
                          setState((prev) => {
                            const statuses = [...(prev as CustomModeState).statuses]
                            statuses[i] = updated
                            return { ...prev, statuses } as PlaygroundState
                          })
                        }
                        onRemove={() =>
                          setState((prev) => {
                            const statuses = (prev as CustomModeState).statuses.filter((_, idx) => idx !== i)
                            return { ...prev, statuses } as PlaygroundState
                          })
                        }
                      />
                    ))}
                  />
                </>
              )
            })()}
          </div>

          {/* ── Right: Output ── */}
          <div>
            <PlaygroundOutputAccordion title="docusaurus.config.ts" defaultOpen copyText={tsConfig}>
              <pre style={{ margin: 0 }}><code>{tsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="docusaurus.config.js" copyText={jsConfig}>
              <pre style={{ margin: 0 }}><code>{jsConfig}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="Sample YAML item" defaultOpen copyText={sampleYaml}>
              <pre style={{ margin: 0 }}><code>{sampleYaml}</code></pre>
            </PlaygroundOutputAccordion>

            <PlaygroundOutputAccordion title="JSON Schema" copyText={schema}>
              <pre style={{ margin: 0 }}><code>{schema}</code></pre>
            </PlaygroundOutputAccordion>
          </div>
        </div>
      </main>
    </Layout>
  )
}
