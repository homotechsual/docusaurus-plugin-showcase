import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Translate, { translate } from '@docusaurus/Translate'
import clsx from 'clsx'
import ShowcaseCard from '../ShowcaseCard/index.js'
import { serializePluginYaml } from '../../core/yaml-serializer.js'
import type { ShowcaseItem, ShowcasePageData } from '../../core/types.js'
import styles from './styles.module.css'

type Props = {
  showcase: ShowcasePageData
}

type FormState = {
  id: string
  name: string
  description: string
  website: string
  source: string
  author: string
  preview: string
  status: string
  minimumVersion: string
  tags: string[]
  npmPackages: string
}

const emptyForm: FormState = {
  id: '',
  name: '',
  description: '',
  website: '',
  source: '',
  author: '',
  preview: '',
  status: '',
  minimumVersion: '',
  tags: [],
  npmPackages: '',
}

const REQUIRED_FIELDS = ['id', 'name', 'description', 'website'] as const
type RequiredField = typeof REQUIRED_FIELDS[number]

function parseNpmPackages(value: string): string[] {
  return value.split('\n').map((s) => s.trim()).filter((s) => s.length > 0)
}

function buildPreviewItem(form: FormState): ShowcaseItem {
  return {
    id: form.id || 'preview',
    name: form.name || 'Plugin Name',
    description: form.description || 'Plugin description.',
    website: form.website || '#',
    source: form.source || null,
    author: form.author || null,
    preview: form.preview || null,
    status: form.status || null,
    minimumVersion: form.minimumVersion || null,
    tags: form.tags,
    npmPackages: parseNpmPackages(form.npmPackages),
  }
}

function buildYamlItem(form: FormState): Partial<ShowcaseItem> {
  return {
    id: form.id || undefined,
    name: form.name || undefined,
    description: form.description || undefined,
    website: form.website || undefined,
    source: form.source || null,
    author: form.author || null,
    preview: form.preview || null,
    status: form.status || null,
    minimumVersion: form.minimumVersion || null,
    tags: form.tags,
    npmPackages: parseNpmPackages(form.npmPackages),
  }
}

function isValid(form: FormState): boolean {
  return REQUIRED_FIELDS.every((f) => form[f].trim().length > 0)
}

export default function ShowcaseForm({ showcase }: Props): React.JSX.Element {
  const { options } = showcase
  const [form, setForm] = useState<FormState>(emptyForm)
  const [attempted, setAttempted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [githubOpened, setGithubOpened] = useState(false)

  const previewItem = buildPreviewItem(form)
  const yaml = serializePluginYaml(buildYamlItem(form), options.schemaUrl)
  const valid = isValid(form)

  function setField(field: keyof Omit<FormState, 'tags'>, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleTag(tag: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      tags: checked ? [...prev.tags, tag] : prev.tags.filter((t) => t !== tag),
    }))
  }

  function copyToClipboard(text: string, onSuccess: () => void) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text).then(onSuccess)
    } else {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      onSuccess()
    }
  }

  function handleCopy() {
    copyToClipboard(yaml, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleGithubSubmit() {
    if (!valid) {
      setAttempted(true)
      return
    }
    const repo = options.submitGithubRepo!
    const folder = options.dataDir.replace(/\\/g, '/')
    const filename = encodeURIComponent(`${folder}/${form.id.trim()}.yaml`)
    const githubUrl = `https://github.com/${repo}/new/main?filename=${filename}`
    // window.open must be called synchronously inside the user gesture handler —
    // calling it inside a Promise.then() causes browsers to treat it as a popup and block it.
    window.open(githubUrl, '_blank', 'noreferrer')
    copyToClipboard(yaml, () => {
      setGithubOpened(true)
      setTimeout(() => setGithubOpened(false), 5000)
    })
  }

  function fieldError(field: RequiredField): boolean {
    return attempted && form[field].trim().length === 0
  }

  return (
    <Layout title={translate({ id: 'showcase.form.title', message: 'Submit an item' })}>
      <main className="container margin-vert--lg">
        <div className={styles.pageHeader}>
          <h1><Translate id="showcase.form.title">Submit an item</Translate></h1>
          <p><Translate id="showcase.form.subtitle">Fill in the details below to generate a YAML entry for submission.</Translate></p>
        </div>
        <div className={styles.layout}>
          <section className={styles.formPanel}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-id">
                <Translate id="showcase.form.field.id">ID</Translate>
                <span className={styles.required} aria-hidden="true"> *</span>
              </label>
              <input
                id="sf-id"
                className={clsx(styles.input, fieldError('id') && styles.inputError)}
                type="text"
                value={form.id}
                onChange={(e) => setField('id', e.target.value)}
                placeholder="e.g. acme.my-plugin"
                aria-required="true"
                aria-invalid={fieldError('id') ? 'true' : undefined}
              />
              {fieldError('id') && (
                <span className={styles.errorMsg}>
                  <Translate id="showcase.form.error.required">This field is required.</Translate>
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-name">
                <Translate id="showcase.form.field.name">Name</Translate>
                <span className={styles.required} aria-hidden="true"> *</span>
              </label>
              <input
                id="sf-name"
                className={clsx(styles.input, fieldError('name') && styles.inputError)}
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="My Plugin"
                aria-required="true"
                aria-invalid={fieldError('name')}
              />
              {fieldError('name') && (
                <span className={styles.errorMsg}>
                  <Translate id="showcase.form.error.required">This field is required.</Translate>
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-description">
                <Translate id="showcase.form.field.description">Description</Translate>
                <span className={styles.required} aria-hidden="true"> *</span>
              </label>
              <input
                id="sf-description"
                className={clsx(styles.input, fieldError('description') && styles.inputError)}
                type="text"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="A short description of what this plugin does."
                aria-required="true"
                aria-invalid={fieldError('description')}
              />
              {fieldError('description') && (
                <span className={styles.errorMsg}>
                  <Translate id="showcase.form.error.required">This field is required.</Translate>
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-website">
                <Translate id="showcase.form.field.website">Website</Translate>
                <span className={styles.required} aria-hidden="true"> *</span>
              </label>
              <input
                id="sf-website"
                className={clsx(styles.input, fieldError('website') && styles.inputError)}
                type="url"
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
                placeholder="https://example.com"
                aria-required="true"
                aria-invalid={fieldError('website')}
              />
              {fieldError('website') && (
                <span className={styles.errorMsg}>
                  <Translate id="showcase.form.error.required">This field is required.</Translate>
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-source">
                <Translate id="showcase.form.field.source">Source URL</Translate>
              </label>
              <input
                id="sf-source"
                className={styles.input}
                type="url"
                value={form.source}
                onChange={(e) => setField('source', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-author">
                <Translate id="showcase.form.field.author">Author</Translate>
              </label>
              <input
                id="sf-author"
                className={styles.input}
                type="text"
                value={form.author}
                onChange={(e) => setField('author', e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-preview">
                <Translate id="showcase.form.field.preview">Preview Image URL</Translate>
              </label>
              <input
                id="sf-preview"
                className={styles.input}
                type="url"
                value={form.preview}
                onChange={(e) => setField('preview', e.target.value)}
                placeholder="https://example.com/preview.png"
              />
            </div>

            {Object.keys(options.statuses).length > 0 && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-status">
                  <Translate id="showcase.form.field.status">Status</Translate>
                </label>
                <select
                  id="sf-status"
                  className={styles.select}
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="">—</option>
                  {Object.entries(options.statuses).map(([key, def]) => (
                    <option key={key} value={key}>{def.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-minver">
                <Translate id="showcase.form.field.minimumVersion">Minimum Version</Translate>
              </label>
              <input
                id="sf-minver"
                className={styles.input}
                type="text"
                value={form.minimumVersion}
                onChange={(e) => setField('minimumVersion', e.target.value)}
                placeholder="1.0.0"
              />
            </div>

            {Object.keys(options.tags).length > 0 && (
              <div className={styles.field}>
                <span className={styles.label}>
                  <Translate id="showcase.form.field.tags">Tags</Translate>
                </span>
                <div className={styles.checkboxGroup}>
                  {Object.entries(options.tags).map(([key, def]) => (
                    <label key={key} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.tags.includes(key)}
                        onChange={(e) => toggleTag(key, e.target.checked)}
                      />
                      <span className={styles.tagDot} style={{ backgroundColor: def.color }} />
                      {def.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-npm">
                <Translate id="showcase.form.field.npmPackages">npm Packages (one per line)</Translate>
              </label>
              <textarea
                id="sf-npm"
                className={styles.textarea}
                value={form.npmPackages}
                onChange={(e) => setField('npmPackages', e.target.value)}
                placeholder={'my-package\nanother-package'}
                rows={3}
              />
            </div>

            {options.submitGithubRepo && (
              <div className={styles.githubSubmit}>
                <button
                  type="button"
                  className={clsx('button button--primary', styles.githubButton)}
                  onClick={handleGithubSubmit}
                  disabled={attempted && !valid}
                >
                  <Translate id="showcase.form.github.button">Copy YAML &amp; open GitHub →</Translate>
                </button>
                {attempted && !valid && (
                  <p className={styles.githubError}>
                    <Translate id="showcase.form.github.invalid">Please fill in all required fields before submitting.</Translate>
                  </p>
                )}
                {githubOpened && (
                  <p className={styles.githubHint}>
                    <Translate id="showcase.form.github.hint">YAML copied to clipboard — press Ctrl+V to paste it into the GitHub editor, then commit and open a pull request.</Translate>
                  </p>
                )}
              </div>
            )}
          </section>

          <section className={styles.previewPanel}>
            <h2 className={styles.panelHeading}>
              <Translate id="showcase.form.preview.heading">Preview</Translate>
            </h2>
            <ul className={styles.previewList}>
              <ShowcaseCard item={previewItem} options={options} />
            </ul>

            <h2 className={styles.panelHeading}>
              <Translate id="showcase.form.yaml.heading">YAML</Translate>
            </h2>
            <div className={styles.yamlWrapper}>
              <button type="button" className={styles.copyButton} onClick={handleCopy}>
                {copied
                  ? <Translate id="showcase.form.yaml.copied">Copied!</Translate>
                  : <Translate id="showcase.form.yaml.copy">Copy</Translate>
                }
              </button>
              <pre className={styles.yaml}>{yaml}</pre>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  )
}
