#!/usr/bin/env node
import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dirname, '../src')
const libDir = join(__dirname, '../lib')

function copyAssets(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const srcPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      copyAssets(srcPath)
    } else if (entry.name.endsWith('.css')) {
      const relPath = relative(srcDir, srcPath)
      const destPath = join(libDir, relPath)
      const destDir = dirname(destPath)
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
      copyFileSync(srcPath, destPath)
      console.log(`Copied: ${relPath}`)
    }
  }
}

copyAssets(srcDir)
console.log('Assets copied.')
