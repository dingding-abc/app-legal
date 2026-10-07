#!/usr/bin/env node
// No package dependencies: checks generated pages, local references and key content invariants.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const config = require('../assets/site-config.js');
const { messages, supported } = require('../assets/i18n.js');
const basePages = [
  'index',
  'apps/alignerdiary/privacy', 'apps/alignerdiary/terms', 'apps/alignerdiary/support',
  'apps/_template/privacy', 'apps/_template/terms', 'apps/_template/support',
];
let checks = 0;
function assert(value, message) { checks++; if (!value) throw Error(message); }
function fileFor(base, lang) { return `${base}${lang === 'en' ? '' : `.${lang}`}.html`; }
function count(text, pattern) { return [...text.matchAll(pattern)].length; }
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}
function checkResource(file, value) {
  if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) return;
  const [target, fragment] = value.split('#');
  const resolved = target ? path.resolve(path.dirname(file), target) : file;
  assert(fs.existsSync(resolved), `${path.relative(root, file)}: missing ${value}`);
  if (fragment) {
    const content = fs.readFileSync(resolved, 'utf8');
    assert(content.includes(`id="${fragment}"`), `${path.relative(root, file)}: missing anchor ${value}`);
  }
}
for (const base of basePages) {
  const home = base === 'index';
  const template = base.startsWith('apps/_template/');
  const app = base.startsWith('apps/alignerdiary/');
  const kind = home ? 'home' : base.split('/').at(-1);
  const english = fs.readFileSync(path.join(root, fileFor(base, 'en')), 'utf8');
  const expectedSections = home ? 0 : count(english, /<h2\b/g);
  const expectedParagraphs = home ? 0 : count(english.match(/<!-- article-body:start -->([\s\S]*?)<!-- article-body:end -->/)?.[1] || '', /<p\b/g);
  for (const lang of supported) {
    const relative = fileFor(base, lang);
    const file = path.join(root, relative);
    const html = fs.readFileSync(file, 'utf8');
    assert(html.includes(`<html lang="${lang}">`), `${relative}: wrong document language`);
    assert(count(html, /<h1\b/g) === 1, `${relative}: expected one h1`);
    assert(html.includes('class="skip-link" href="#main-content"'), `${relative}: skip link missing`);
    assert(html.includes('id="main-content"'), `${relative}: main target missing`);
    assert(html.includes('<meta name="description" content="'), `${relative}: description missing`);
    assert(html.includes('<title>') && html.includes('</title>'), `${relative}: title missing`);
    assert(!html.includes('{{EMAIL}}'), `${relative}: email placeholder leaked`);
    assert(html.includes(messages[lang].ui.footer), `${relative}: anonymous footer mismatch`);
    const languageLinks = [...html.matchAll(/<a\b[^>]*data-language-link[^>]*>/g)].map((match) => attrs(match[0]));
    assert(languageLinks.length === 3, `${relative}: expected three language links`);
    for (const targetLang of supported) {
      const link = languageLinks.find((item) => item['data-language'] === targetLang);
      assert(Boolean(link), `${relative}: missing ${targetLang} language link`);
      const expected = `./${fileFor(path.basename(base), targetLang)}`;
      assert(link.href === expected, `${relative}: ${targetLang} points to ${link.href}, expected ${expected}`);
      assert(link.hreflang === targetLang && link.lang === targetLang, `${relative}: language link labels mismatch`);
      assert((link['aria-current'] === 'page') === (targetLang === lang), `${relative}: active language mismatch`);
    }
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) checkResource(file, match[1]);
    if (home) {
      assert(!html.includes('apps/_template/'), `${relative}: template exposed on homepage`);
      for (const page of ['privacy', 'terms', 'support']) {
        assert(html.includes(`./apps/alignerdiary/${fileFor(page, lang)}`), `${relative}: missing ${page} app link`);
      }
      assert(html.includes(`href="./apps/alignerdiary/${fileFor('support', lang)}"`), `${relative}: support CTA loses language`);
      assert(html.includes(messages[lang].ui.smartCaption), `${relative}: smart description mismatch`);
      assert(html.includes(messages[lang].ui.emptyHeading), `${relative}: empty smart status missing`);
    } else {
      assert(count(html, /<h2\b/g) === expectedSections, `${relative}: section count drift`);
      const body = html.match(/<!-- article-body:start -->([\s\S]*?)<!-- article-body:end -->/)?.[1] || '';
      assert(count(body, /<p\b/g) === expectedParagraphs, `${relative}: paragraph count drift`);
      assert(html.includes(`../../${fileFor('index', lang)}`), `${relative}: home link loses language`);
      const nav = html.match(/<nav aria-label="[^"]+">([\s\S]*?)<\/nav>/)?.[1] || '';
      assert(count(nav, /aria-current="page"/g) === 1, `${relative}: document nav active state`);
      for (const page of ['privacy', 'terms', 'support']) {
        assert(nav.includes(`./${fileFor(page, lang)}`), `${relative}: ${page} nav loses language`);
      }
      if (template) {
        assert(!html.includes(config.contactEmail), `${relative}: real contact used in template`);
        const tokens = kind === 'privacy'
          ? ['APP_NAME', 'LAST_UPDATED', 'YOUR_EMAIL', 'DATA_COLLECTION_TEXT', 'ICLOUD_TEXT', 'PURCHASE_TEXT', 'ANALYTICS_TEXT', 'DATA_CONTROL_TEXT']
          : kind === 'terms' ? ['APP_NAME', 'LAST_UPDATED', 'YOUR_EMAIL', 'APP_PURPOSE'] : ['APP_NAME', 'YOUR_EMAIL'];
        for (const token of tokens) assert(html.includes(token), `${relative}: lost ${token}`);
        assert(!html.includes('AlignerDiary'), `${relative}: concrete app leaked into template`);
      }
      if (app) {
        assert(!/YOUR_EMAIL|LAST_UPDATED|APP_NAME/.test(html), `${relative}: template token in public document`);
        const identity = { en: 'independent developer', 'zh-Hans': '独立开发者', ja: '個人開発者' }[lang];
        assert(html.includes(identity), `${relative}: anonymous developer identity missing`);
        assert(html.includes(lang === 'en' ? 'September 20, 2026' : '2026年9月20日'), `${relative}: policy date changed`);
        const emailLinks = [...html.matchAll(/<a\b[^>]*data-contact-email[^>]*>([^<]+)<\/a>/g)];
        assert(emailLinks.length > 0, `${relative}: no contact address`);
        for (const link of emailLinks) {
          assert(link[1] === config.contactEmail, `${relative}: contact text drift`);
          assert(link[0].includes(`href="mailto:${config.contactEmail}"`), `${relative}: mailto drift`);
        }
      }
    }
  }
}
// Verify direct language URLs win over a saved choice, and the English link saves en.
const script = fs.readFileSync(path.join(root, 'assets/site-language.js'), 'utf8');
function runLanguage(pathname, lang, saved, blocked = false) {
  const handlers = {};
  const links = supported.map((language) => ({
    dataset: { language },
    href: `https://example.test/index${language === 'en' ? '' : `.${language}`}.html`,
    addEventListener(event, callback) { handlers[language] = callback; },
  }));
  let redirected = null;
  let stored = saved;
  const storage = blocked ? { getItem() { throw Error('storage blocked'); }, setItem() { throw Error('storage blocked'); } }
    : { getItem() { return stored; }, setItem(_key, value) { stored = value; } };
  vm.runInNewContext(script, {
    document: { documentElement: { lang }, querySelectorAll: () => links },
    location: { pathname, replace(value) { redirected = value; } },
    localStorage: storage,
  });
  return { redirected, handlers, getStored: () => stored };
}
assert(runLanguage('/site/index.ja.html', 'ja', 'en').redirected === null, 'direct Japanese URL redirected');
assert(runLanguage('/site/index.zh-Hans.html', 'zh-Hans', 'ja').redirected === null, 'direct Chinese URL redirected');
assert(runLanguage('/site/apps/alignerdiary/privacy.ja.html', 'ja', 'en').redirected === null, 'direct legal URL redirected');
assert(runLanguage('/site/index.html', 'en', 'ja').redirected?.endsWith('/index.ja.html'), 'default URL did not honor saved choice');
const english = runLanguage('/site/index.ja.html', 'ja', 'ja');
english.handlers.en();
assert(english.getStored() === 'en', 'English click did not save en');
assert(runLanguage('/site/index.html', 'en', english.getStored()).redirected === null, 'English choice redirected away');
assert(runLanguage('/site/index.html', 'en', null, true).redirected === null, 'blocked storage threw or redirected');
console.log(`PASS: ${basePages.length * supported.length} pages, ${checks} static and language assertions.`);
