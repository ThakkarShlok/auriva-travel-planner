import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, posix } from 'node:path'

const exts = ['.js', '.jsx', '.ts', '.tsx']

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
}

function walk(dir, files = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue
    const child = posix.join(dir, entry.name)
    if (entry.isDirectory()) walk(child, files)
    else files.push(child)
  }

  return files
}

let mode = 'git HEAD'
let treeFiles
try {
  treeFiles = git(['ls-tree', '-r', 'HEAD', '--name-only'])
    .split(/\r?\n/)
    .filter(Boolean)
} catch {
  mode = 'filesystem'
  treeFiles = [...walk('src'), ...walk('api')]
}

const fileSet = new Set(treeFiles)
const sourceFiles = treeFiles.filter((file) =>
  /^(src|api)\//.test(file) && exts.includes(extname(file)),
)

const importRegexes = [
  /\bimport\s+(?:[^'"]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g,
  /\bexport\s+[^'"]*?\s+from\s+['"](\.{1,2}\/[^'"]+)['"]/g,
  /\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
]

function lineNumberForOffset(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length
}

function normalizePath(path) {
  return posix.normalize(path).replace(/\\/g, '/')
}

function candidates(importer, specifier) {
  const base = normalizePath(posix.join(dirname(importer), specifier))
  if (exts.includes(extname(base))) return [base]

  return [
    base,
    ...exts.map((ext) => `${base}${ext}`),
    ...exts.map((ext) => posix.join(base, `index${ext}`)),
  ]
}

function resolveCaseInsensitive(candidate) {
  const lower = candidate.toLowerCase()
  const matches = treeFiles.filter((file) => file.toLowerCase() === lower)
  return matches
}

const missing = []
const casing = []

for (const importer of sourceFiles) {
  const text = mode === 'git HEAD' ? git(['show', `HEAD:${importer}`]) : readFileSync(importer, 'utf8')

  for (const regex of importRegexes) {
    regex.lastIndex = 0
    let match
    while ((match = regex.exec(text))) {
      const specifier = match[1]
      const line = lineNumberForOffset(text, match.index)
      const possible = candidates(importer, specifier)

      const exact = possible.find((candidate) => fileSet.has(candidate))
      if (exact) continue

      const insensitiveMatches = possible.flatMap((candidate) =>
        resolveCaseInsensitive(candidate).map((actual) => ({ expected: candidate, actual })),
      )

      if (insensitiveMatches.length > 0) {
        casing.push({ importer, line, specifier, matches: insensitiveMatches })
      } else {
        missing.push({ importer, line, specifier, tried: possible })
      }
    }
  }
}

console.log('CASE-SENSITIVE IMPORT AUDIT AGAINST GIT HEAD')
console.log('============================================')
console.log(`Mode: ${mode}`)
console.log(`Source files checked: ${sourceFiles.length}`)
console.log(`Casing mismatches: ${casing.length}`)
console.log(`Missing imports: ${missing.length}`)

if (casing.length > 0) {
  console.log('\nCASING MISMATCHES')
  casing.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.importer}:${item.line}`)
    console.log(`   import: ${item.specifier}`)
    for (const match of item.matches) {
      console.log(`   expected: ${match.expected}`)
      console.log(`   actual:   ${match.actual}`)
    }
  })
}

if (missing.length > 0) {
  console.log('\nMISSING IMPORTS')
  missing.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.importer}:${item.line}`)
    console.log(`   import: ${item.specifier}`)
    console.log(`   tried: ${item.tried.join(', ')}`)
  })
}

if (casing.length > 0 || missing.length > 0) {
  process.exitCode = 1
}
