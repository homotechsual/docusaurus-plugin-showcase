import React, { type ReactNode, useState, useRef } from 'react'
import { usePopper } from 'react-popper'

type Props = {
  id: string
  text: string
  anchorEl: string
  children: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ShowcaseTooltip({ id, text, anchorEl, children }: Props): JSX.Element {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { styles: popperStyles, attributes } = usePopper(
    triggerRef.current,
    tooltipRef.current,
    {
      modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
    },
  )

  return (
    <>
      <span
        ref={triggerRef}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open && (
        <div
          id={id}
          role="tooltip"
          ref={tooltipRef}
          style={{
            ...popperStyles.popper,
            background: 'var(--ifm-color-emphasis-700)',
            color: 'var(--ifm-color-emphasis-0)',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: '0.8rem',
            maxWidth: 200,
            zIndex: 100,
          }}
          {...attributes.popper}
        >
          {text}
        </div>
      )}
    </>
  )
}
