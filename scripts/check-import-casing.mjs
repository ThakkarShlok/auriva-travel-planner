import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const rootsToScan = ['src', 'api']
const orphanRoots = [
  'src/components',
  'src/pages',
  'src/hooks',
  'src/services',
  'src/utils',
  'src/store',
  'src/contexts',
  'src/pdf',
]
const sourceExts = ['.js', '.jsx', '.ts', '.tsx']

function toPosix(path) {
  return path.split(sep).join('/')
}

function walk(dir, files = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue
      walk(full, files)
    } else if (sourceExts.includes(extname(entry.name))) {
      files.push(full)
    }
  }

  return files
}

function existingCaseMap(dir) {
  try {
    return new Map(readdirSync(dir).map((name) => [name.toLowerCase(), name]))
  } catch {
    return null
  }
}

function existsExactCase(absPath) {
  const parsed = resolve(absPath).split(/[\\/]+/)
  let current = parsed[0] + sep

  for (const part of parsed.slice(1)) {
    if (!part) continue
    const names = existingCaseMap(current)
    if (!names) return false
    const actual = names.get(part.toLowerCase())
    if (actual !== part) return false
    current = join(current, actual)
  }

  return true
}

function findCaseInsensitive(absPath) {
  const parsed = resolve(absPath).split(/[\\/]+/)
  let current = parsed[0] + sep
  const actualParts = [parsed[0]]
  let hadMismatch = false

  for (const part of parsed.slice(1)) {
    if (!part) continue
    const names = existingCaseMap(current)
    if (!names) return null
    const actual = names.get(part.toLowerCase())
    if (!actual) return null
    if (actual !== part) hadMismatch = true
    actualParts.push(actual)
    current = join(current, actual)
  }

  return { actualPath: current, hadMismatch, actualParts }
}

function statMaybe(absPath) {
  try {
    return statSync(absPath)
  } catch {
    return null
  }
}

function candidatesFor(importer, specifier) {
  const base = resolve(dirname(importer), specifier)
  const ext = extname(base)
  const candidates = []

  if (ext && sourceExts.includes(ext)) {
    candidates.push(base)
  } else {
    candidates.push(base)
    for (const sourceExt of sourceExts) candidates.push(`${base}${sourceExt}`)
    for (const sourceExt of sourceExts) candidates.push(join(base, `index${sourceExt}`))
  }

  return candidates
}

function resolveImport(importer, specifier) {
  for (const candidate of candidatesFor(importer, specifier)) {
    const ci = findCaseInsensitive(candidate)
    if (!ci) continue
    const stat = statMaybe(ci.actualPath)
    if (!stat?.isFile()) continue

    const exact = existsExactCase(candidate)
    return {
      expectedPath: candidate,
      actualPath: ci.actualPath,
      mismatch: !exact || ci.hadMismatch,
    }
  }

  return null
}

function lineNumberForOffset(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length
}

const importRegexes = [
  /\bimport\s+(?:[^'"]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g,
  /\bexport\s+[^'"]*?\s+from\s+['"](\.{1,2}\/[^'"]+)['"]/g,
  /\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
]

const sourceFiles = rootsToScan.flatMap((dir) => walk(join(root, dir)))
const casingMismatches = []
const missingFiles = []
const importedActualFiles = new Set()
const importExpectations = new Map()

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8')

  for (const regex of importRegexes) {
    regex.lastIndex = 0
    let match
    while ((match = regex.exec(text))) {
      const specifier = match[1]
      const resolvedImport = resolveImport(file, specifier)
      const line = lineNumberForOffset(text, match.index)
      const relFile = toPosix(relative(root, file))

      if (!resolvedImport) {
        missingFiles.push({ importer: relFile, line, specifier })
        continue
      }

      importedActualFiles.add(toPosix(relative(root, resolvedImport.actualPath)))
      const actualKey = resolve(resolvedImport.actualPath).toLowerCase()
      const expectedRel = toPosix(relative(root, resolvedImport.expectedPath))
      const actualRel = toPosix(relative(root, resolvedImport.actualPath))

      if (!importExpectations.has(actualKey)) importExpectations.set(actualKey, new Map())
      const expectationMap = importExpectations.get(actualKey)
      if (!expectationMap.has(expectedRel)) expectationMap.set(expectedRel, [])
      expectationMap.get(expectedRel).push({ importer: relFile, line, specifier })

      if (resolvedImport.mismatch) {
        casingMismatches.push({
          importer: relFile,
          line,
          specifier,
          expected: expectedRel,
          actual: actualRel,
        })
      }
    }
  }
}

const conflictingExpectations = [...importExpectations.entries()]
  .map(([actualKey, expectations]) => ({ actualKey, expectations: [...expectations.entries()] }))
  .filter(({ expectations }) => expectations.length > 1)

const orphanCandidates = orphanRoots.flatMap((dir) => walk(join(root, dir)))
const possiblyOrphaned = orphanCandidates
  .map((file) => toPosix(relative(root, file)))
  .filter((file) => !importedActualFiles.has(file))
  .sort()

function printSection(title, rows, emptyMessage, formatter) {
  console.log(`\n${title}`)
  console.log('='.repeat(title.length))
  if (rows.length === 0) {
    console.log(emptyMessage)
    return
  }
  rows.forEach((row, idx) => {
    console.log(`${idx + 1}. ${formatter(row)}`)
  })
}

printSection(
  'CASING MISMATCHES',
  casingMismatches,
  'None found.',
  (row) =>
    `${row.importer}:${row.line}\n   import: ${row.specifier}\n   expected path: ${row.expected}\n   actual disk path: ${row.actual}`,
)

if (conflictingExpectations.length > 0) {
  console.log('\nCONFLICTING IMPORT CASING')
  console.log('========================')
  conflictingExpectations.forEach((conflict, idx) => {
    console.log(`${idx + 1}. ${conflict.expectations.map(([expected]) => expected).join(' | ')}`)
    for (const [expected, refs] of conflict.expectations) {
      console.log(`   ${expected}`)
      refs.forEach((ref) => console.log(`     - ${ref.importer}:${ref.line} (${ref.specifier})`))
    }
  })
}

printSection(
  'MISSING FILES',
  missingFiles,
  'None found.',
  (row) => `${row.importer}:${row.line}\n   import: ${row.specifier}`,
)

printSection(
  'POSSIBLY ORPHANED FILES',
  possiblyOrphaned,
  'None found.',
  (row) => row,
)

console.log('\nSUMMARY')
console.log('=======')
console.log(`Casing mismatches: ${casingMismatches.length}`)
console.log(`Conflicting import casing groups: ${conflictingExpectations.length}`)
console.log(`Missing files: ${missingFiles.length}`)
console.log(`Possibly orphaned files: ${possiblyOrphaned.length}`)

if (casingMismatches.length > 15) {
  process.exitCode = 2
}
