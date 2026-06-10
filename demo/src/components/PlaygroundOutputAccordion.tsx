import React, { useState } from 'react'

interface PlaygroundOutputAccordionProps {
  title: string
  defaultOpen?: boolean
  copyText: string
  children: React.ReactNode
}

export function PlaygroundOutputAccordion({
  title,
  defaultOpen = false,
  copyText,
  children,
}: PlaygroundOutputAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function copy() {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '6px',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          background: 'var(--ifm-color-emphasis-100)',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open ? 'true' : 'false'}
          style={{
            flex: 1,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--ifm-font-color-base)',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: 0,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              fontSize: '0.7rem',
            }}
          >
            ▶
          </span>
          {title}
        </button>
        <button
          className="button button--sm button--secondary"
          onClick={copy}
          style={{ flexShrink: 0 }}
        >
          {copied ? '✅ Copied' : 'Copy'}
        </button>
      </div>
      {open && (
        <div style={{ padding: '1rem', overflowX: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  )
}
