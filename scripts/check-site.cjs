#!/usr/bin/env node
// No package dependencies: checks generated pages, local references and key content invariants.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const config = require('../assets/site-config.js');
const apps = require('../assets/app-catalog.js');
const { messages, supported } = require('../assets/i18n.js');
const aligner = require('../assets/aligner-languages.js');
const alignerBodies = require('../assets/locales/alignerdiary.js');
// Independent approved scope: the registry and generator cannot validate each other.
const expectedAligner = ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'zh-Hans', 'zh-Hant'];
const legacyLanguages = ['en', 'zh-Hans', 'ja'];
const kinds = ['privacy', 'terms', 'support'];
const localesFor = base => base.startsWith('apps/alignerdiary/') ? aligner.supported : supported;
const copyFor = (base, lang) => base.startsWith('apps/alignerdiary/') ? aligner.messages[lang] : messages[lang];
const homeLanguage = lang => supported.includes(lang) ? lang : 'en';
const bodyOf = html => html.match(/<!-- article-body:start -->([\s\S]*?)<!-- article-body:end -->/)?.[1]?.trim();
const decode = text => text.replace(/&(?:amp|quot|lt|gt|apos|#39|#x([0-9a-f]+)|#([0-9]+));/gi, (entity, hex, decimal) => hex || decimal ? String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)) : ({'&amp;':'&','&quot;':'"','&lt;':'<','&gt;':'>','&apos;':"'",'&#39;':"'"}[entity.toLowerCase()] || entity));
const visible = html => decode(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
function canonicalBody(html) {
  return decode(html).replace(/<\/?bdi\b[^>]*>/g, '').replace(/<([a-z][\w-]*)\b([^>]*)>/gi, (_, tag, attr) => '<' + tag.toLowerCase() + (tag === 'a' ? ' href="' + (attrs(attr).href || '') + '"' : '') + '>').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}
function checkContacts(html, relative, rtl) {
  const emails = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter(m => Object.hasOwn(attrs(m[1]), 'data-contact-email') || /mailto:/.test(attrs(m[1]).href || ''));
  assert(emails.length > 0, relative + ': no contact address');
  for (const m of emails) {
    const a = attrs(m[1]);
    assert(/\bdata-contact-email(?:\s|=|$)/.test(m[1]), relative + ': contact marker missing');
    assert(visible(m[2]) === config.contactEmail, relative + ': visible contact text drift');
    assert(a.href === 'mailto:' + config.contactEmail, relative + ': mailto drift');
    if (rtl) assert(a.dir === 'ltr' || /<bdi\b[^>]*dir="ltr"/.test(m[2]), relative + ': RTL email missing LTR isolation');
  }
  const addresses = visible(html).match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  assert(addresses.length > 0 && addresses.every(email => email === config.contactEmail), relative + ': stray visible email');
}

const basePages = [
  'index',
  'apps/keepaccounts/privacy', 'apps/keepaccounts/terms', 'apps/keepaccounts/support',
  'apps/alignerdiary/privacy', 'apps/alignerdiary/terms', 'apps/alignerdiary/support',
  'apps/_template/privacy', 'apps/_template/terms', 'apps/_template/support',
];
let checks = 0;
function assert(value, message) { checks++; if (!value) throw Error(message); }
function fileFor(base, lang) { return `${base}${lang === 'en' ? '' : `.${lang}`}.html`; }
function count(text, pattern) { return [...text.matchAll(pattern)].length; }
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((match) => [match[1], match[2] ?? ""]));
}
function checkResource(file, value) {
  if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) return;
  assert(!/^(?:[\/\\]|javascript:)/i.test(value), path.relative(root, file) + ': non-relative local resource ' + value);
  for (const prefix of ['/', '/repository-prefix/']) {
    const url = new URL(value, 'https://example.test' + prefix + path.relative(root, file).split(path.sep).join('/'));
    assert(url.pathname.startsWith(prefix), path.relative(root, file) + ': resource escapes hosted prefix ' + value);
  }
  const url = new URL(value, 'https://example.test/' + path.relative(root, file).split(path.sep).join('/'));
  const fragment = decodeURIComponent(url.hash.slice(1));
  const resolved = path.join(root, decodeURIComponent(url.pathname.slice(1)));
  assert(fs.existsSync(resolved), `${path.relative(root, file)}: missing ${value}`);
  if (fragment) {
    const content = fs.readFileSync(resolved, 'utf8');
    assert(content.includes(`id="${fragment}"`), `${path.relative(root, file)}: missing anchor ${value}`);
  }
}
assert(JSON.stringify(supported) === JSON.stringify(legacyLanguages), 'shared site locales changed: home/other apps/templates must stay three languages');
assert(JSON.stringify(aligner.supported) === JSON.stringify(expectedAligner), 'alignerdiary: expected exact approved eleven locales');
assert(JSON.stringify(Object.keys(alignerBodies).sort()) === JSON.stringify(expectedAligner), 'alignerdiary: body source locale set mismatch');
assert(apps.alignerdiary.policyUpdated === '2026-11-12', 'alignerdiary: approved policy date must be 2026-11-12');
for (const lang of expectedAligner) {
  assert(Boolean(aligner.labels[lang]?.trim()), 'alignerdiary: missing autonym ' + lang);
  const copy = aligner.messages[lang];
  assert(Boolean(copy?.title && copy?.ui && copy?.page), 'alignerdiary: incomplete chrome ' + lang);
  for (const key of ['skip', 'brandHome', 'brandHomeEnglish', 'languageLabel', 'navDocs', 'privacyShort', 'termsShort', 'supportShort', 'allApps', 'allAppsEnglish', 'lastUpdated', 'footer']) assert(typeof copy.ui[key] === 'string' && copy.ui[key].trim(), 'alignerdiary: missing UI ' + lang + '/' + key);
  for (const kind of kinds) {
    const body = alignerBodies[lang]?.[kind];
    assert(typeof body === 'string' && body.trim(), 'alignerdiary: missing body ' + lang + '/' + kind);
    assert(copy.page[kind]?.length === 2 && copy.page[kind].every(Boolean), 'alignerdiary: missing page metadata ' + lang + '/' + kind);
    assert(!body.includes(config.contactEmail), 'alignerdiary: body duplicates maintained contact address ' + lang + '/' + kind);
    assert(!/YOUR_EMAIL|LAST_UPDATED|APP_NAME/.test(body), 'alignerdiary: template token in body source ' + lang + '/' + kind);
    if (lang !== 'en') assert(visible(body) !== visible(alignerBodies.en[kind]), 'alignerdiary: English fallback body ' + lang + '/' + kind);
    const scriptPattern = { ar: /[\u0600-\u06ff]/, ja: /[\u3040-\u30ff]/, ko: /[\uac00-\ud7af]/, 'zh-Hans': /[\u3400-\u9fff]/, 'zh-Hant': /[\u3400-\u9fff]/ }[lang];
    if (scriptPattern) assert(scriptPattern.test(visible(body)), 'alignerdiary: missing native script ' + lang + '/' + kind);
  }
}
const bodyModuleSource = fs.readFileSync(path.join(root, 'assets/locales/alignerdiary.js'), 'utf8');
assert(!/\brequire\s*\(|^\s*import\s/m.test(bodyModuleSource), 'alignerdiary: single body source must not import compatibility modules or create a cycle');
for (const lang of ['zh-Hans', 'ja']) {
  const legacy = require('../assets/locales/' + lang + '.js').alignerdiary;
  for (const kind of kinds) assert(legacy?.[kind] === alignerBodies[lang][kind], 'alignerdiary: compatibility module result differs from authority ' + lang + '/' + kind);
}
const expectedFiles = basePages.flatMap(base => localesFor(base).map(lang => fileFor(base, lang))).sort();
const actualFiles = fs.readdirSync(root).filter(f => f.endsWith('.html')).concat(fs.readdirSync(path.join(root, 'apps')).flatMap(app => fs.readdirSync(path.join(root, 'apps', app)).filter(f => f.endsWith('.html')).map(f => 'apps/' + app + '/' + f))).sort();
assert(expectedFiles.length === 54 && JSON.stringify(actualFiles) === JSON.stringify(expectedFiles), 'static output: expected exact 54 pages (33 AlignerDiary + 9 Keepaccounts + 9 template + 3 home)');
for (const [id, app] of Object.entries(apps)) {
  for (const language of supported) {
    const listing = app.locales[language];
    assert(Boolean(listing?.name?.trim()), `${id}: missing ${language} store name`);
    if(app.status === 'testing'){assert(!listing.storeURL, `${id}: testing app must not invent a download URL`);continue;}
    const url = new URL(listing.storeURL);
    assert(url.protocol === 'https:' && url.hostname === 'apps.apple.com' && url.pathname.endsWith(`/id${app.storeId}`), `${id}: incorrect ${language} App Store destination`);
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
  for (const lang of localesFor(base)) {
    const copy = copyFor(base, lang);
    const relative = fileFor(base, lang);
    const file = path.join(root, relative);
    const html = fs.readFileSync(file, 'utf8');
    const documentAttrs = attrs(html.match(/<html\b[^>]*>/)?.[0] || '');
    assert(documentAttrs.lang === lang, relative + ': wrong document language');
    if (app) assert(documentAttrs.dir === (lang === 'ar' ? 'rtl' : 'ltr'), relative + ': wrong document direction');
    assert(count(html, /<h1\b/g) === 1, `${relative}: expected one h1`);
    assert(html.includes('class="skip-link" href="#main-content"'), `${relative}: skip link missing`);
    assert(html.includes('id="main-content"'), `${relative}: main target missing`);
    assert(html.includes('<meta name="description" content="'), `${relative}: description missing`);
    assert(html.includes('<title>') && html.includes('</title>'), `${relative}: title missing`);
    assert(!html.includes('{{EMAIL}}'), `${relative}: email placeholder leaked`);
    assert(visible(html).includes(copy.ui.footer), `${relative}: anonymous footer mismatch`);
    const languageLinks = [...html.matchAll(/<a\b[^>]*data-language-link[^>]*>/g)].map((match) => attrs(match[0]));
    assert(languageLinks.length === localesFor(base).length, `${relative}: incorrect language link count`);
    for (const targetLang of localesFor(base)) {
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
      for (const [id, app] of Object.entries(apps)) {
        for (const language of supported) assert(html.includes(app.locales[language].name), `${relative}: missing ${id} ${language} full name`);
        if(app.status !== 'testing') assert(html.includes(`href="${app.locales[lang].storeURL}"`), `${relative}: wrong ${id} download destination`);
        assert(html.includes(messages[lang].ui.downloadApp), `${relative}: download link label missing`);
      }
      for (const page of ['privacy', 'terms', 'support']) {
        assert(html.includes(`./apps/alignerdiary/${fileFor(page, lang)}`), `${relative}: missing ${page} app link`);
      }
      assert(html.includes(`href="./apps/alignerdiary/${fileFor('support', lang)}"`), `${relative}: support CTA loses language`);
      assert(html.includes(messages[lang].ui.smartCaption), `${relative}: smart description mismatch`);
      for(const page of ['privacy','terms','support'])assert(html.includes(`./apps/keepaccounts/${fileFor(page,lang)}`), `${relative}: missing bookkeeping document`);
    } else {
      assert(count(html, /<h2\b/g) === expectedSections, `${relative}: section count drift`);
      const body = html.match(/<!-- article-body:start -->([\s\S]*?)<!-- article-body:end -->/)?.[1] || '';
      if (!app) assert(count(body, /<p\b/g) === expectedParagraphs, `${relative}: paragraph count drift`);
      assert(html.includes(`../../${fileFor('index', homeLanguage(lang))}`), `${relative}: home link loses language/fallback`);
      const navs = [...html.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/g)].filter(m => kinds.every(page => m[1].includes('href="./' + fileFor(page, lang) + '"')));
      assert(navs.length === 1, relative + ': document navigation missing or duplicated');
      const nav = navs[0][1];
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
      if(base.startsWith('apps/keepaccounts/')){
        checkContacts(html, relative, false);
        assert(!/YOUR_EMAIL|LAST_UPDATED|APP_NAME|{{EMAIL}}/.test(html),relative+': placeholder leaked');
        assert(html.includes(lang==='en'?'October 12, 2026':'2026年10月12日'),relative+': wrong date');
        assert(html.includes('朝暮有数'),relative+': wrong app');
      }
      if (app) {
        const resources = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(m => new URL(m[1], 'https://example.test/' + relative));
        for (const asset of ['assets/style.css', 'assets/fonts/typefaces.css', 'assets/site-language.js']) {
          const matches = resources.filter(url => url.pathname === '/' + asset);
          assert(matches.length === 1, relative + ': missing/duplicate paired asset ' + asset);
          const digest = require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root, asset))).digest('hex').slice(0, 12);
          assert(matches[0].searchParams.get('v') === digest, relative + ': asset version hash mismatch ' + asset);
        }
        const appName = apps.alignerdiary.locales[lang]?.name || 'AlignerDiary';
        const badge = [...html.matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/g)].find(m => attrs(m[1]).class === 'badge');
        assert(badge && visible(badge[2]) === appName, relative + ': full app name missing');
        assert(!/YOUR_EMAIL|LAST_UPDATED|APP_NAME/.test(html), relative + ': template token in public document');
        const h1 = visible(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '');
        assert(h1 === copy.page[kind][0], relative + ': localized document heading mismatch');
        const title = visible(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        assert(title === copy.page[kind][0] + ' · ' + appName, relative + ': localized title mismatch');
        const description = attrs(html.match(/<meta\b[^>]*name="description"[^>]*>/)?.[0] || '').content;
        assert(decode(description || '') === copy.page[kind][0] + ' · ' + appName, relative + ': description metadata mismatch');
        const meta = [...html.matchAll(/<div\b([^>]*)>([\s\S]*?)<\/div>/g)].filter(m => (attrs(m[1]).class || '').split(/\s+/).includes('meta'));
        assert(meta.length === 1, relative + ': expected one .meta date');
        const times = [...meta[0][2].matchAll(/<time\b([^>]*)>([\s\S]*?)<\/time>/g)];
        assert(times.length === 1 && attrs(times[0][1]).datetime === '2026-11-12', relative + ': wrong approved datetime');
        const date = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : lang, {year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date('2026-11-12T00:00:00Z'));
        assert(visible(times[0][2]) === date, relative + ': visible policy date drift');
        assert(visible(meta[0][2]) === copy.ui.lastUpdated.replace('{date}', date), relative + ': policy date label drift');
        checkContacts(html, relative, lang === 'ar');
        const contacts = [...body.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)].filter(m => (attrs(m[1]).class || '').split(/\s+/).includes('contact-line'));
        assert(contacts.length === 1 && contacts[0][2].includes('data-contact-email'), relative + ': contact must have one independent paragraph');
        const expectedBody = alignerBodies[lang][kind].replaceAll('{{EMAIL}}', config.contactEmail).replace(/href="\.\/(privacy|terms|support)\.html"/g, (_, page) => 'href="./' + fileFor(page, lang) + '"');
        assert(canonicalBody(body) === canonicalBody(expectedBody), relative + ': body differs from single locale source');
        const structure = value => [...value.replace(/<\/?bdi\b[^>]*>/g, '').matchAll(/<\/?(?:h2|h3|p|ul|ol|li)\b[^>]*>/g)].map(m => m[0].replace(/\s[^>]*/, '>')).join('');
        assert(structure(body) === structure(alignerBodies.en[kind]), relative + ': localized body structure differs from English');
        const menu = html.match(/<details\b[^>]*data-language-menu[^>]*>([\s\S]*?)<\/details>/);
        assert(Boolean(menu), relative + ': native static language details missing');
        assert(/class="[^"]*\baligner-doc\b/.test(html.match(/<body\b[^>]*>/)?.[0] || ''), relative + ': scoped document class missing');
        assert(!/\bopen(?:\s|=|>)/.test(menu[0].slice(0, menu[0].indexOf('>') + 1)), relative + ': language menu should start closed');
        const summary = menu[1].match(/<summary\b[^>]*data-language-summary[^>]*>([\s\S]*?)<\/summary>/);
        assert(Boolean(summary) && visible(summary[1]).includes(copy.ui.languageLabel) && visible(summary[1]).includes(aligner.labels[lang]), relative + ': language summary needs localized Language and current autonym');
        if (lang !== 'en') assert(visible(summary[1]).includes('Language'), relative + ': non-English summary needs / Language cue');
        assert(count(menu[1], /data-language-link\b/g) === 11, relative + ': static language menu incomplete');
        assert(html.indexOf(menu[0]) < html.indexOf(navs[0][0]) && html.indexOf(menu[0]) < html.indexOf('<main'), relative + ': language entry must precede document navigation and article');
        const menuAnchors = [...menu[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
        for (const m of menuAnchors) {
          const a = attrs(m[1]); const id = a['data-language'];
          assert(visible(m[2]) === aligner.labels[id], relative + ': autonym mismatch ' + id);
          assert(a.dir === (id === 'ar' ? 'rtl' : 'ltr'), relative + ': language autonym direction ' + id);
          assert(!Object.hasOwn(a, 'onclick') && !Object.hasOwn(a, 'tabindex'), relative + ': static links should retain native navigation/focus');
        }
        if (!supported.includes(lang)) {
          const englishLabel = { ar:'بالإنجليزية', de:'Englisch', es:'inglés', fr:'anglais', it:'inglese', ko:'영어', pt:'inglês', 'zh-Hant':'英文' }[lang];
          assert(copy.ui.allAppsEnglish.includes(englishLabel) && copy.ui.brandHomeEnglish.includes(englishLabel), relative + ': localized English home fallback label must be explicit');
          assert(visible(html).includes(copy.ui.allAppsEnglish) && html.includes('aria-label="' + copy.ui.brandHomeEnglish + '"'), relative + ': missing localized explicit English home fallback');
        }

      }
    }
  }
}
// Source-level guards supplement, rather than establish, actual browser geometry.
const css = fs.readFileSync(path.join(root, 'assets/style.css'), 'utf8');
assert(/\.aligner-doc \.language-menu:not\(\[open\]\) > \.language-menu-panel\s*\{[^}]*display:\s*none/.test(css), 'language menu: closed panel must be hidden');
assert(/\.aligner-doc \.language-menu summary\s*\{[^}]*min-block-size:\s*44px/.test(css), 'language menu: summary target source must remain at least 44px');
assert(/\.aligner-doc \.language-menu-panel a\s*\{[^}]*min-block-size:\s*44px/.test(css), 'language menu: link target source must remain at least 44px');
assert(/\.aligner-doc \.language-menu-panel\s*\{[^}]*position:\s*absolute/.test(css), 'language menu: panel must not reflow article');
assert(/\.aligner-doc \.language-menu-panel\s*\{[^}]*overflow-y:\s*auto/.test(css), 'language menu: bounded panel needs scrolling to last item');

// Execute the actual preference script with links read from current static pages.
// This VM fixture omits browser layout, native details focus and rendering.
const script = fs.readFileSync(path.join(root, 'assets/site-language.js'), 'utf8');
function runLanguage(relative, saved, blocked = false, prefix = '/repository-prefix/', search = '') {
  const html = fs.readFileSync(path.join(root, relative), 'utf8');
  const lang = attrs(html.match(/<html\b[^>]*>/)?.[0] || '').lang;
  const isAligner = relative.startsWith('apps/alignerdiary/');
  const handlers = {};
  const documentHandlers = {};
  const windowHandlers = {};
  const links = [...html.matchAll(/<a\b([^>]*data-language-link[^>]*)>([\s\S]*?)<\/a>/g)].map(m => {
    const a = attrs(m[1]);
    return {
      dataset: { language: a['data-language'] },
      href: new URL(a.href, 'https://example.test' + prefix + relative).href,
      getAttribute(name) { return a[name] ?? null; },
      setAttribute(name, value) { a[name] = String(value); },
      removeAttribute(name) { delete a[name]; },
      addEventListener(event, callback) { if (event === 'click') handlers[a['data-language']] = callback; },
      closest(selector) { return selector === '[data-language-menu]' ? menu : null; },
    };
  });
  let redirected = null;
  let stored = saved;
  const menuHandlers = {};
  let focusCalls = 0;
  const summary = { focus() { focusCalls++; }, getBoundingClientRect() { return { bottom: 100 }; }, getAttribute() { return null; }, setAttribute() {}, removeAttribute() {} };
  const menu = {
    open: false,
    style: { setProperty() {} },
    contains() { return false; },
    querySelector(selector) { return selector.includes('summary') ? summary : null; },
    querySelectorAll() { return links; },
    addEventListener(event, callback) { menuHandlers[event] = callback; },
    removeAttribute(name) { if (name === 'open') this.open = false; },
    setAttribute(name) { if (name === 'open') this.open = true; },
  };
  const storage = blocked ? { getItem() { throw Error('storage blocked'); }, setItem() { throw Error('storage blocked'); } }
    : { getItem(key) { assert(key === 'app-legal-language', 'preference storage key drift'); return stored; }, setItem(key, value) { assert(key === 'app-legal-language', 'preference storage key drift'); stored = value; } };
  const document = {
    documentElement: { lang, dir: lang === 'ar' ? 'rtl' : 'ltr' },
    body: { classList: { contains(value) { return isAligner && value === 'aligner-doc'; } } },
    querySelectorAll(selector) { return selector.includes('data-language-menu') ? (isAligner ? [menu] : []) : links; },
    querySelector(selector) { return selector.includes('data-language-menu') && isAligner ? menu : null; },
    addEventListener(event, callback) { documentHandlers[event] = callback; },
  };
  vm.runInNewContext(script, { document, location: { pathname: prefix + relative, search, replace(value) { redirected = value; } }, localStorage: storage, URL, window: { addEventListener(event, callback) { windowHandlers[event] = callback; } } });
  return { redirected, handlers, getStored: () => stored, menu, menuHandlers, documentHandlers, windowHandlers, focusCalls: () => focusCalls };
}
for (const base of basePages) {
  const locales = localesFor(base);
  for (const lang of locales.filter(id => id !== 'en')) {
    for (const saved of locales.filter(id => id !== lang)) {
      const result = runLanguage(fileFor(base, lang), saved);
      assert(result.redirected === null, fileFor(base, lang) + ': explicit locale redirected by saved ' + saved);
      assert(typeof result.handlers.en === 'function', fileFor(base, lang) + ': English click handler missing');
      result.handlers.en({});
      assert(result.getStored() === 'en', fileFor(base, lang) + ': English click did not save en');
      assert(runLanguage(fileFor(base, 'en'), result.getStored()).redirected === null, fileFor(base, 'en') + ': explicit English choice redirected away');
    }
  }
  for (const saved of locales.filter(id => id !== 'en')) {
    const result = runLanguage(fileFor(base, 'en'), saved);
    const expected = 'https://example.test/repository-prefix/' + fileFor(base, saved);
    // Main-agent accepted difference: every Aligner URL is explicit, even without
    // a suffix, so a blocked English preference write cannot cause a bounce.
    assert(result.redirected === (base.startsWith('apps/alignerdiary/') ? null : expected), fileFor(base, 'en') + ': default URL preference contract drift for ' + saved);
  }
  for (const saved of [null, '', 'xx', 'ru', ...(base.startsWith('apps/alignerdiary/') ? [] : ['ar', 'it', 'zh-Hant'])]) {
    assert(runLanguage(fileFor(base, 'en'), saved).redirected === null, base + ': invalid/unsupported preference redirected');
  }
  for (const lang of locales) {
    const result = runLanguage(fileFor(base, lang), 'ja', true);
    assert(result.redirected === null, base + ': blocked storage redirected');
    assert(typeof result.handlers.en === 'function', base + ': blocked storage broke static link listener');
    result.handlers.en({});
  }
}
for (const saved of ['ja', 'zh-Hans', 'ar', 'it']) assert(runLanguage('index.html', saved, false, '/repository-prefix/', '?lang=en').redirected === null, 'explicit English home query redirected');
for (const lang of ['en', 'ar', 'de']) {
  const state = runLanguage(fileFor('apps/alignerdiary/privacy', lang), null);
  assert(state.focusCalls() === 0, 'closed menu unexpectedly moved focus');
  state.menu.open = true;
  let prevented = false;
  state.documentHandlers.keydown({ key: 'Escape', preventDefault() { prevented = true; } });
  assert(!state.menu.open && prevented && state.focusCalls() === 1, 'Escape must close menu and return summary focus');
  state.menu.open = true; state.documentHandlers.click({ target: {} });
  assert(!state.menu.open, 'outside click left language menu open');
  for (const event of ['pagehide', 'pageshow']) { state.menu.open = true; state.windowHandlers[event](); assert(!state.menu.open, event + ': cached menu left open'); }
  state.menu.open = true; state.menuHandlers.toggle(); state.windowHandlers.resize();
  assert(state.menu.open, 'viewport fitting unexpectedly closed menu');
}
console.log(`PASS: ${expectedFiles.length} pages, ${checks} static and language assertions. VM preference checks are not browser layout/focus/glyph verification.`);
