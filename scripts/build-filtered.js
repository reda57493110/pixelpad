#!/usr/bin/env node

/**
 * Build script that filters out expected client-side rendering warnings
 * These warnings are informational and expected for pages using client hooks
 */

const { spawn } = require('child_process')
const path = require('path')

// Filter out expected warnings about client-side rendering
const filterWarnings = (data) => {
  const lines = data.toString().split('\n')
  const filtered = lines.filter(line => {
    // Filter out the "deopted into client-side rendering" warnings
    // These are expected for pages using client-side hooks
    if (line.includes('deopted into client-side rendering')) {
      return false
    }
    return true
  })
  return filtered.join('\n')
}

// Run Next.js build
const buildProcess = spawn('next', ['build'], {
  cwd: path.join(__dirname, '..'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
})

// Filter stdout
buildProcess.stdout.on('data', (data) => {
  const filtered = filterWarnings(data)
  if (filtered.trim()) {
    process.stdout.write(filtered)
  }
})

// Filter stderr
buildProcess.stderr.on('data', (data) => {
  const filtered = filterWarnings(data)
  if (filtered.trim()) {
    process.stderr.write(filtered)
  }
})

buildProcess.on('close', (code) => {
  process.exit(code)
})


