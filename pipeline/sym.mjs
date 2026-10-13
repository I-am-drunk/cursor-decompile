#!/usr/bin/env node
// sym.mjs — read-only query tool over a minified bundle that retains original
// identifier names via React-Compiler `i(localIdent,"OriginalName")` calls.
//
//   sym.mjs names [regex]        list OriginalName -> localIdent
//   sym.mjs src <OriginalName>   print the source bound to that name
//   sym.mjs ident <localIdent>   print the source of a local identifier
//   sym.mjs strings <regex>      list distinct quoted string literals matching
//   sym.mjs ctx <regex> [pad]    raw windows around each regex hit (default pad 200)
//   sym.mjs slice <off> <len>    raw byte slice
//
// Env BUNDLE overrides the default bundle path.
import { readFileSync } from 'node:fs'

const DEFAULT = 'corpus/ext/usr/share/cursor/resources/app/out/vs/workbench/workbench.anysphere-ui-automations.js'
const src = readFileSync(process.env.BUNDLE || DEFAULT, 'utf8')
const [cmd, arg, arg2] = process.argv.slice(2)

// --- name registry -------------------------------------------------------
// `i(localIdent,"OriginalName")` is emitted once per compiled function.
function registry() {
  const m = new Map()
  for (const hit of src.matchAll(/\bi\(([A-Za-z_$][\w$]*),"([^"]+)"\)/g)) {
    const [, ident, name] = hit
    if (!m.has(name)) m.set(name, [])
    m.get(name).push(ident)
  }
  return m
}

// --- brace matching ------------------------------------------------------
// Walks from `from` to the matching close of the first `open` char, skipping
// strings, template literals, regex literals and comments.
function matchBrace(from, open = '{', close = '}') {
  let i = src.indexOf(open, from)
  if (i < 0) return -1
  let depth = 0
  for (; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      for (i++; i < src.length; i++) {
        if (src[i] === '\\') { i++; continue }
        if (src[i] === q) break
        if (q === '`' && src[i] === '$' && src[i + 1] === '{') {
          const end = matchBrace(i + 1)
          if (end < 0) return -1
          i = end
        }
      }
      continue
    }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) return -1; continue }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i) + 1; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return i }
  }
  return -1
}

// Find the declaration of `ident` and return its full source text.
function declOf(ident) {
  const pats = [
    new RegExp(`\\bfunction\\s+${ident}\\s*\\(`, 'g'),
    new RegExp(`\\bclass\\s+${ident}\\b`, 'g'),
    new RegExp(`(?:const|let|var)\\s+${ident}\\s*=`, 'g'),
  ]
  for (const re of pats) {
    for (const hit of re.exec(src) ? [re.lastIndex && { index: re.lastIndex - 0 }] : []) void hit
    re.lastIndex = 0
    const m = re.exec(src)
    if (!m) continue
    const end = matchBrace(m.index)
    if (end < 0) continue
    return src.slice(m.index, end + 1)
  }
  return null
}

const out = (s) => process.stdout.write(s + '\n')

switch (cmd) {
  case 'names': {
    const re = arg ? new RegExp(arg) : null
    const rows = [...registry()].filter(([n]) => !re || re.test(n)).sort()
    for (const [n, ids] of rows) out(`${n}\t${ids.join(',')}`)
    out(`-- ${rows.length} name(s)`)
    break
  }
  case 'src': {
    const ids = registry().get(arg)
    if (!ids) { out(`!! no registered name ${arg}`); break }
    for (const id of ids) {
      const d = declOf(id)
      out(`/* ===== ${arg} (local: ${id}) ===== */`)
      out(d ?? `!! declaration of ${id} not found`)
    }
    break
  }
  case 'ident': {
    out(declOf(arg) ?? `!! declaration of ${arg} not found`)
    break
  }
  case 'strings': {
    const re = new RegExp(arg)
    const seen = new Set()
    for (const h of src.matchAll(/"((?:[^"\\\n]|\\.){1,400})"|'((?:[^'\\\n]|\\.){1,400})'/g)) {
      const v = h[1] ?? h[2]
      if (re.test(v) && !seen.has(v)) { seen.add(v); out(v) }
    }
    out(`-- ${seen.size} string(s)`)
    break
  }
  case 'ctx': {
    const pad = Number(arg2 ?? 200)
    const re = new RegExp(arg, 'g')
    let n = 0, m
    while ((m = re.exec(src)) && n < 60) {
      out(`/* @${m.index} */ ` + src.slice(Math.max(0, m.index - pad), m.index + pad))
      n++
      if (m.index === re.lastIndex) re.lastIndex++
    }
    out(`-- ${n} hit(s)`)
    break
  }
  case 'slice':
    out(src.slice(Number(arg), Number(arg) + Number(arg2 ?? 2000)))
    break
  default:
    out(readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 14).join('\n'))
}
