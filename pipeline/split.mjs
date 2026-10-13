/**
 * Readability aid: break the minified automations bundle onto many lines so
 * grep -n / sed -n can show real control flow.
 *
 * This is NOT a compiler and its output is never committed or executed — it
 * only exists so a human or an agent can read the artifact. It is
 * lexer-correct about what it must not touch: string, template and regex
 * bodies and comments are copied through byte for byte, so no literal we
 * later cite as a fact can be mutated by it.
 */
import fs from 'node:fs';

const BREAK_AFTER = new Set([';', '{', '}']);
// A `/` starts a regex only where a value cannot already have ended.
const REGEX_OK_BEFORE = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '~', '^', '<', '>', 'return', 'typeof', 'in', 'of', 'new', 'delete', 'void', 'case', 'do', 'else', 'yield', 'await']);

export function split(src) {
  const out = [];
  let line = '';
  let depth = 0;
  let prev = '';           // last significant byte emitted
  let prevWord = '';       // last identifier emitted, for the regex decision
  const push = () => { if (line.trim()) out.push('  '.repeat(Math.max(0, depth)) + line.trim()); line = ''; };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];

    // --- regions copied through verbatim ---
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      let j = i + 1;
      let tdepth = 0;
      for (; j < src.length; j++) {
        if (src[j] === '\\') { j++; continue; }
        if (quote === '`') {
          if (src[j] === '$' && src[j + 1] === '{') { tdepth++; j++; continue; }
          if (src[j] === '}' && tdepth > 0) { tdepth--; continue; }
        }
        if (src[j] === quote && tdepth === 0) break;
      }
      line += src.slice(i, j + 1); i = j; prev = quote; prevWord = ''; continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      const j = src.indexOf('\n', i); const end = j === -1 ? src.length : j;
      line += src.slice(i, end); i = end - 1; continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const j = src.indexOf('*/', i); const end = j === -1 ? src.length : j + 2;
      line += src.slice(i, end); i = end - 1; continue;
    }
    if (c === '/' && (REGEX_OK_BEFORE.has(prev) || REGEX_OK_BEFORE.has(prevWord) || prev === '')) {
      let j = i + 1, cls = false, ok = false;
      for (; j < src.length; j++) {
        const d = src[j];
        if (d === '\\') { j++; continue; }
        if (d === '\n') break;                       // not a regex after all
        if (cls) { if (d === ']') cls = false; continue; }
        if (d === '[') { cls = true; continue; }
        if (d === '/') { ok = true; break; }
      }
      if (ok) {
        let k = j + 1;
        while (k < src.length && /[a-z]/.test(src[k])) k++;  // flags
        line += src.slice(i, k); i = k - 1; prev = '/'; prevWord = ''; continue;
      }
    }

    // --- structure ---
    if (c === '\n' || c === '\r') { if (line.endsWith(' ')) continue; line += ' '; continue; }
    if (c === '{' || c === '(' || c === '[') {
      if (c === '{') { line += c; depth++; push(); prev = c; prevWord = ''; continue; }
      line += c; depth++; prev = c; prevWord = ''; continue;
    }
    if (c === '}' || c === ')' || c === ']') {
      if (c === '}') { push(); depth--; line += c; prev = c; prevWord = ''; continue; }
      depth--; line += c; prev = c; prevWord = ''; continue;
    }
    line += c;
    if (!/\s/.test(c)) {
      prev = c;
      prevWord = /[A-Za-z_$]/.test(c) ? prevWord + c : '';
    }
    if (BREAK_AFTER.has(c) && line.length > 70) push();
    if (line.length > 400 && (c === ',' || c === '&' || c === '|')) push();
  }
  push();
  return out.join('\n');
}

if (process.argv[2]) {
  const src = fs.readFileSync(process.argv[2], 'utf8');
  const result = split(src);
  // Byte-preservation self-check: dropping all whitespace must be a no-op.
  const strip = (s) => s.replace(/[\s]/g, '');
  if (strip(result).length !== strip(src).length) {
    console.error(`split: NON-WHITESPACE BYTES CHANGED (${strip(src).length} -> ${strip(result).length}) — do not cite this output`);
    process.exit(2);
  }
  fs.writeFileSync(process.argv[3], result);
  console.error(`split: ok, ${result.split('\n').length} lines, non-whitespace bytes identical`);
}
