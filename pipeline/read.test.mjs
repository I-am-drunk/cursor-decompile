import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const tool = fileURLToPath(new URL('./read.mjs', import.meta.url));

function fixture(t, input) {
  const directory = mkdtempSync(join(tmpdir(), 'cursor-reader-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, 'original fixture.js');
  writeFileSync(file, input);
  return (...args) => {
    const result = spawnSync(process.execPath, [tool, ...args], {
      env: { ...process.env, BUNDLE: file }, timeout: 2000,
    });
    assert.equal(result.error, undefined, 'query must terminate');
    assert.deepEqual(readFileSync(file), Buffer.from(input), 'input must not change');
    assert.deepEqual(readdirSync(directory), ['original fixture.js'], 'query must not write files');
    return result;
  };
}

function rows(result) {
  assert.equal(result.status, 0, result.stderr.toString());
  return result.stdout.toString().trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
}

test('slice returns exact bytes across Unicode and arbitrary binary bytes', t => {
  const input = Buffer.concat([Buffer.from('é🙂hello'), Buffer.from([0, 255, 13, 10])]);
  const run = fixture(t, input);
  for (const [offset, length] of [[6, 5], [1, 7], [0, 0], [9000, 5]]) {
    const result = run('slice', String(offset), String(length));
    assert.equal(result.status, 0);
    assert.deepEqual(result.stdout, input.subarray(offset, offset + length));
  }
  assert.deepEqual(run('slice', '11').stdout, input.subarray(11));
  assert.deepEqual(run('slice', '0').stdout, input);
});

test('literal search returns full matches, byte offsets and whole Unicode context', t => {
  const input = Buffer.from('é🙂long-match🙂é');
  const run = fixture(t, input);
  const [row] = rows(run('find', 'long-match', '1'));
  assert.equal(row.byteOffset, 6);
  assert.equal(row.byteLength, 10);
  assert.equal(row.contextStart, 2);
  assert.equal(row.contextEnd, 20);
  assert.equal(row.text, '🙂long-match🙂');
  assert.deepEqual(Buffer.from(row.text), input.subarray(row.contextStart, row.contextEnd));
  assert.deepEqual(rows(run('find', 'missing')), []);
});

test('raw queries preserve dollar, regex, comment and nested-template regressions', t => {
  const samples = [
    'function $x(){return 1}i($x,"Dollar");',
    'function f(){return /}/.test("}")}i(f,"Regex");',
    'function f(){/*',
    'const t = `${"}" + `n{m};`}tail`;',
  ];
  for (const input of samples) {
    const run = fixture(t, input);
    assert.deepEqual(run('slice', '0').stdout, Buffer.from(input));
    const [row] = rows(run('find', input, '0'));
    assert.equal(row.text, input);
    assert.equal(row.byteOffset, 0);
    assert.equal(row.byteLength, Buffer.byteLength(input));
  }
});

test('regex contexts advance past empty matches on Unicode code points', t => {
  const run = fixture(t, 'é🙂aé');
  assert.deepEqual(rows(run('ctx', '(?:)', '0')).map(row => row.byteOffset), [0, 2, 6, 7, 9]);
  assert.deepEqual(rows(run('ctx', 'é', '0')).map(row => [row.byteOffset, row.byteLength]), [[0, 2], [7, 2]]);
  assert.equal(rows(run('ctx', '🙂a', '0'))[0].text, '🙂a');
});

test('names includes column-zero and dollar identifiers as text candidates', t => {
  const input = 'i($x,"Dollar");é\ni(y,"Next");zi(z,"Prefix");$i(z,"Prefix");/* i(q,"Comment") */';
  const run = fixture(t, input);
  const matches = rows(run('names'));
  assert.deepEqual(matches.map(({ name, identifier }) => [name, identifier]), [['Dollar', '$x'], ['Next', 'y'], ['Comment', 'q']]);
  assert.equal(matches[1].byteOffset, Buffer.byteLength(input.slice(0, input.indexOf('i(y'))));
  assert.deepEqual(rows(run('names', '^Dollar$')).map(row => row.name), ['Dollar']);
});

test('find and ctx cap results and report truncation', t => {
  const run = fixture(t, 'x '.repeat(61));
  for (const command of ['find', 'ctx']) {
    const result = run(command, 'x', '0');
    assert.equal(rows(result).length, 60);
    assert.match(result.stderr.toString(), /Stopped after 60 hits/);
  }
});

test('search rejects malformed UTF-8 instead of replacing source bytes', t => {
  const run = fixture(t, Buffer.from([0xc3, 0x28]));
  for (const command of ['find', 'ctx', 'names']) {
    const result = run(command, 'x');
    assert.equal(result.status, 2);
    assert.equal(result.stdout.length, 0);
    assert.match(result.stderr.toString(), /valid UTF-8/);
  }
});

test('invalid commands and arguments fail before opening the input', () => {
  const invalid = [
    [], ['unknown'], ['slice'], ['slice', '-1'], ['slice', '1.5'],
    ['slice', 'NaN'], ['slice', '9007199254740992'], ['slice', '0', 'no'],
    ['ctx'], ['ctx', '['], ['ctx', 'x', '-1'], ['names', '['],
    ['find'], ['find', ''], ['find', 'x', '0', 'extra'], ['names', 'x', '0'],
    ['src', 'Dollar'], ['ident', 'f'], ['strings', 'x'],
  ];
  for (const args of invalid) {
    const result = spawnSync(process.execPath, [tool, ...args], {
      env: { ...process.env, BUNDLE: '/does-not-exist/cursor-fixture.js' }, timeout: 2000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.equal(result.stdout.length, 0);
    assert.doesNotMatch(result.stderr.toString(), /ENOENT/);
    assert.ok(result.stderr.length > 0);
  }
  const help = spawnSync(process.execPath, [tool, '--help'], {
    env: { ...process.env, BUNDLE: '/does-not-exist/cursor-fixture.js' },
  });
  assert.equal(help.status, 0);
  assert.match(help.stdout.toString(), /Usage:/);
});
