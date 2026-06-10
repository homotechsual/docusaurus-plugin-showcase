import React, { useState } from 'react'
import clsx from 'clsx'
import styles from './PlaygroundOutputAccordion.module.css'

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
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open ? 'true' : 'false'}
          className={styles.toggleBtn}
        >
          <span className={clsx(styles.chevron, { [styles.chevronOpen]: open })}>▶</span>
          {title}
        </button>
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={copy}
        >
          {copied ? '✅ Copied' : 'Copy'}
        </button>
      </div>
      {open && (
        <div className={styles.body}>
          {children}
        </div>
      )}
    </div>
  )
}
