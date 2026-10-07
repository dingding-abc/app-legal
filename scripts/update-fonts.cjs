#!/usr/bin/env node
// Optional network maintenance. Normal site generation and font checks stay offline.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const fontDir = path.join(root, 'assets/fonts');
const manifestPath = path.join(fontDir, 'font-manifest.json');
const specs = [
  { locale: 'en', family: 'Fraunces', query: 'Fraunces:ital,wght@0,400..600;1,400..600', slug: 'fraunces' },
  {
    locale: 'zh-Hans', family: 'LXGW WenKai', slug: 'lxgwwenkai',
    // Match the approved specimen (font v1.250), with its original WOFF2 blocks.
    sourceBase: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/',
    stylesheets: ['lxgwwenkai-regular.css', 'lxgwwenkai-bold.css'],
  },
  { locale: 'ja', family: 'Zen Maru Gothic', query: 'Zen Maru Gothic:wght@400;500;700', slug: 'zenmarugothic' },
];
function corpus(locale) {
  const pages = ['index', ...['alignerdiary', '_template'].flatMap(app => ['privacy', 'terms', 'support'].map(page => `apps/${app}/${page}`))];
  const text = pages.map(page => fs.readFileSync(path.join(root, `${page}${locale === 'en' ? '' : `.${locale}`}.html`), 'utf8')
    .replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')).join('');
  const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32)).join('');
  return [...new Set([...text + ascii])].filter(char => !/[\r\n\t]/.test(char)).sort().join('');
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function includesCharacter(face, char) {
  const code = char.codePointAt(0);
  const range = face.match(/unicode-range:\s*([^;}]+)/)?.[1];
  if (!range) throw Error('Expected a Unicode range for each font block');
  return range.split(',').some(part => {
    const [start, end = start] = part.trim().replace(/^U\+/i, '').split('-');
    return code >= parseInt(start.replace(/\?/g, '0'), 16) && code <= parseInt(end.replace(/\?/g, 'f'), 16);
  });
}
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000), headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  } });
  if (!response.ok) throw Error(`${response.status}: ${new URL(url).hostname}`);
  return response;
}
async function main() {
  if (process.argv.includes('--check')) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const css = fs.readFileSync(path.join(fontDir, 'typefaces.css'), 'utf8');
    const expected = manifest.flatMap(entry => entry.files.map(file => `./${file.name}`));
    const references = [...css.matchAll(/url\(([^)]+)\)/g)].map(match => match[1]);
    if (references.length !== expected.length || references.some(file => !expected.includes(file)) || expected.some(file => !references.includes(file))) throw Error('Local font stylesheet references have drifted');
    for (const spec of specs) {
      const entry = manifest.find(item => item.locale === spec.locale && item.family === spec.family);
      if (!entry) throw Error(`Missing font: ${spec.family}`);
      const missing = [...corpus(spec.locale)].filter(char => !entry.characters.includes(char));
      if (missing.length) throw Error(`${spec.family}: new characters ${missing.join('')}. Run node scripts/update-fonts.cjs after generating pages.`);
      for (const file of entry.files) {
        if (hash(fs.readFileSync(path.join(fontDir, file.name))) !== file.sha256) throw Error(`Font changed: ${file.name}`);
      }
      if (!fs.readFileSync(path.join(fontDir, `${spec.slug}-OFL.txt`), 'utf8').includes('SIL OPEN FONT LICENSE')) throw Error(`Missing license: ${spec.family}`);
    }
    console.log('PASS: three local font families, content coverage and file integrity.');
    return;
  }
  // Finish downloads before replacing any existing local assets.
  const pending = [];
  const manifest = [];
  const rules = [];
  for (const spec of specs) {
    const characters = corpus(spec.locale);
    const sources = spec.sourceBase
      ? spec.stylesheets.map(file => new URL(file, spec.sourceBase).href)
      : [`https://fonts.googleapis.com/css2?${new URLSearchParams({ family: spec.query, display: 'swap', text: characters })}`];
    const faces = [];
    for (const source of sources) {
      const css = await (await get(source)).text();
      const supplied = css.match(/@font-face\s*\{[^}]+\}/g) || [];
      if (!supplied.length) throw Error(`No font faces returned for ${spec.family}`);
      const selected = spec.sourceBase ? supplied.filter(face => [...characters].some(char => includesCharacter(face, char))) : supplied;
      if (spec.sourceBase && [...characters].some(char => !selected.some(face => includesCharacter(face, char)))) throw Error(`Missing Unicode ranges: ${spec.family}`);
      faces.push(...selected.map(face => ({ face, source })));
    }
    const files = [];
    for (const [index, { face, source }] of faces.entries()) {
      const src = face.match(/url\((['"]?)([^)'"\s]+)\1\)/);
      if (!src) throw Error('Missing font source');
      const url = new URL(src[2], source).href;
      if (spec.sourceBase ? !url.startsWith(spec.sourceBase + 'files/') : new URL(url).hostname !== 'fonts.gstatic.com') throw Error('Unexpected font source');
      const bytes = Buffer.from(await (await get(url)).arrayBuffer());
      if (bytes.subarray(0, 4).toString() !== 'wOF2') throw Error('Expected WOFF2 font');
      const name = spec.sourceBase ? path.posix.basename(new URL(url).pathname) : `${spec.slug}-${index + 1}.woff2`;
      pending.push({ name, bytes });
      files.push({ name, sha256: hash(bytes), bytes: bytes.length, url });
      rules.push(face.replace(src[0], `url(./${name})`));
    }
    const licenseURL = spec.sourceBase ? new URL('OFL.txt', spec.sourceBase).href : `https://raw.githubusercontent.com/google/fonts/main/ofl/${spec.slug}/OFL.txt`;
    const license = await (await get(licenseURL)).text();
    if (!license.includes('SIL OPEN FONT LICENSE')) throw Error('Unexpected license response');
    pending.push({ name: `${spec.slug}-OFL.txt`, bytes: license });
    manifest.push({ locale: spec.locale, family: spec.family, sources, licenseURL, characters, files });
    console.log(`Prepared ${spec.family}: ${files.reduce((sum, file) => sum + file.bytes, 0)} bytes`);
  }
  for (const file of pending) fs.writeFileSync(path.join(fontDir, file.name), file.bytes);
  fs.writeFileSync(path.join(fontDir, 'typefaces.css'), `/* Local font subsets; see SOURCE.md and font-manifest.json. */\n${rules.join('\n\n')}\n`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
