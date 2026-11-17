import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'

const require = createRequire(import.meta.url)
const font = readFileSync(require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff'))

export const renderPage = (data, { siteConfig }) => [
  createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 72,
        backgroundColor: '#731c1c',
        color: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 700,
      },
    },
    createElement('div', { style: { fontSize: 28, marginBottom: 32 } }, siteConfig.title),
    createElement('div', { style: { fontSize: 64, lineHeight: 1.1 } }, data.metadata.title),
    createElement('div', { style: { fontSize: 28, marginTop: 32, color: '#f2bab6' } },
      data.metadata.description || siteConfig.tagline),
  ),
  {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
  },
]
