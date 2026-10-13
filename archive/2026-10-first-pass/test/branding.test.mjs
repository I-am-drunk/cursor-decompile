import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import ts from 'typescript';

function runtimeText(source, extension) {
 if (extension === '.ts') {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, source);
  const parts = [];
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
   if (![ts.SyntaxKind.SingleLineCommentTrivia, ts.SyntaxKind.MultiLineCommentTrivia].includes(token)) parts.push(scanner.getTokenText());
  }
  return parts.join('');
 }
 if (extension === '.css') return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\bcursor\s*:\s*[-\w ,]+\s*(;|(?=\}))/gi, '');
 return source;
}
async function files(dir) {
 return (await Promise.all((await readdir(dir, { withFileTypes:true })).map(entry => entry.isDirectory() ? files(join(dir,entry.name)) : join(dir,entry.name)))).flat();
}

test('runtime UI source and catalogues contain no vendor branding; evidence is never imported or served', async () => {
 const paths = await files('src');
 const evidence = paths.filter(path => basename(path).endsWith('-facts.json'));
 const violations = [];
 for (const path of paths.filter(path => !evidence.includes(path))) {
  const source = runtimeText(await readFile(path, 'utf8'), extname(path));
  if (/cursor/i.test(source)) violations.push(path);
  for (const fact of evidence) assert.ok(!source.includes(basename(fact)), `${path} references private UI evidence ${fact}`);
 }
 assert.deepEqual(violations, []);
});

test('branding guard catches templates, JSON and CSS copy even beside cursor declarations', () => {
 assert.doesNotMatch(runtimeText('a { cursor: pointer; }', '.css'), /cursor/i);
 assert.doesNotMatch(runtimeText('// Cursor capture\nconst name = "Workspace";', '.ts'), /cursor/i);
 for (const [source, type] of [
  ['a { cursor: pointer; } a::after { content: "Cursor"; }', '.css'],
  ['const html = `<p>Cursor ${name}</p>`;', '.ts'],
  ['{"description":"Cursor connector"}', '.json'],
  ['<button aria-label="Cursor">Open</button>', '.html'],
 ]) assert.match(runtimeText(source,type), /cursor/i);
});
