#!/usr/bin/env node
// Raw local-file queries. This tool never parses or reformats JavaScript.
import { readFileSync } from 'node:fs';

const DEFAULT = 'corpus/app/out/vs/workbench/workbench.anysphere-ui-automations.js';
const LIMIT = 60;
const USAGE = `Usage: BUNDLE=path node pipeline/read.mjs <command>
  find <text> [padding-bytes]   literal UTF-8 search (default padding: 200)
  ctx <regex> [padding-bytes]   Unicode regex search (default padding: 200)
  names [regex]                textual i(identifier,"Name") candidates
  slice <offset> [length]      exact bytes, no added newline (default length: 2000)
  --help                      show this help
Search output is JSONL. Offsets and lengths are bytes; find/ctx stop at 60 hits.
Names are text matches, including matches in comments and strings, not a symbol table.`;

function integer(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  if (!/^(0|[1-9][0-9]*)$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) {
    throw new Error(`${label} must be a nonnegative safe integer`);
  }
  return Number(value);
}

function pattern(value, flags) {
  if (value === undefined) throw new Error('regex is required');
  try { return new RegExp(value, flags); }
  catch { throw new Error(`invalid regex: ${value}`); }
}

// Expand a byte window to whole UTF-8 characters. Input is validated first.
function window(bytes, byteOffset, byteLength, padding) {
  let start = Math.max(0, byteOffset - padding);
  let end = Math.min(bytes.length, byteOffset + byteLength + padding);
  while (start > 0 && (bytes[start] & 0xc0) === 0x80) start--;
  while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end++;
  return { byteOffset, byteLength, contextStart: start, contextEnd: end, text: bytes.subarray(start, end).toString('utf8') };
}

function emit(row) { process.stdout.write(`${JSON.stringify(row)}\n`); }

function main(args) {
  const [command, query, size] = args;
  if (command === '--help' && args.length === 1) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }
  if (['src', 'ident', 'strings'].includes(command)) {
    throw new Error(`${command} is unsupported: use names, find or ctx to inspect raw text; declaration/literal parsing is not provided`);
  }
  if (!['find', 'ctx', 'names', 'slice'].includes(command)) throw new Error(USAGE);
  if (args.length > (command === 'names' ? 2 : 3)) throw new Error('too many arguments');
  let regex;
  let amount;
  let offset;
  if (command === 'slice') {
    offset = integer(query, 'offset');
    amount = integer(size, 'length', 2000);
  } else if (command === 'names') {
    if (query !== undefined) regex = pattern(query, 'u');
  } else {
    amount = integer(size, 'padding', 200);
    if (command === 'ctx') regex = pattern(query, 'gu');
    else if (!query) throw new Error('nonempty search text is required');
  }
  const bytes = readFileSync(process.env.BUNDLE || DEFAULT);
  if (command === 'slice') {
    process.stdout.write(bytes.subarray(offset, Math.min(bytes.length, offset + amount)));
    return;
  }
  const source = bytes.toString('utf8');
  if (!Buffer.from(source, 'utf8').equals(bytes)) {
    throw new Error('search requires valid UTF-8; use slice to inspect arbitrary bytes');
  }
  if (command === 'find') {
    const needle = Buffer.from(query, 'utf8');
    let from = 0;
    let count = 0;
    for (;;) {
      const at = bytes.indexOf(needle, from);
      if (at < 0) break;
      if (count++ === LIMIT) { process.stderr.write('Stopped after 60 hits; narrow the query.\n'); break; }
      emit(window(bytes, at, needle.length, amount));
      from = at + needle.length;
    }
    return;
  }
  const matches = command === 'names'
    ? source.matchAll(/(?<![\w$])i\(\s*([A-Za-z_$][\w$]*)\s*,\s*"([^"\\\r\n]+)"\s*\)/gu)
    : source.matchAll(regex);
  let previousIndex = 0;
  let byteOffset = 0;
  let count = 0;
  for (const match of matches) {
    byteOffset += Buffer.byteLength(source.slice(previousIndex, match.index), 'utf8');
    previousIndex = match.index;
    const byteLength = Buffer.byteLength(match[0], 'utf8');
    if (command === 'names') {
      if (!regex || regex.test(match[2])) emit({ name: match[2], identifier: match[1], byteOffset, byteLength });
    } else {
      if (count++ === LIMIT) { process.stderr.write('Stopped after 60 hits; narrow the query.\n'); break; }
      emit(window(bytes, byteOffset, byteLength, amount));
    }
  }
}

try { main(process.argv.slice(2)); }
catch (error) {
  process.stderr.write(`read: ${error.message}\n`);
  process.exitCode = 2;
}
