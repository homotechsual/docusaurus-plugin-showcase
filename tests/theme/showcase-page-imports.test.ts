import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('ShowcasePage swizzle imports', () => {
  it('imports ShowcaseCard from the theme alias', () => {
    const filePath = resolve(process.cwd(), 'src/theme/ShowcasePage/index.tsx')
    const source = readFileSync(filePath, 'utf-8')

    expect(source).toContain("import ShowcaseCard from '@theme/ShowcaseCard'")
    expect(source).not.toContain("import ShowcaseCard from '../ShowcaseCard/index.js'")
  })
})
