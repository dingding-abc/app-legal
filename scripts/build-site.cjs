#!/usr/bin/env node
// Generate complete static language pages; the original English URLs remain stable.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const config = require('../assets/site-config.js');
const apps = require('../assets/app-catalog.js');
const { messages, supported } = require('../assets/i18n.js');
const alignerLanguages = require('../assets/aligner-languages.js');
let alignerBodies; // Loaded only when AlignerDiary generation begins.
const bodies = {
  'zh-Hans': require('../assets/locales/zh-Hans.js'),
  ja: require('../assets/locales/ja.js'),
};
const checkOnly = process.argv.includes('--check');
const englishHome = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const brandMark = englishHome.match(/<svg class="brand-mark"[\s\S]*?<\/svg>/)?.[0];
if (!brandMark) throw Error('Home brand mark missing');

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function fileName(name, locale) { return `${name}${locale === 'en' ? '' : `.${locale}`}.html`; }
function write(relative, content) {
  const target = path.join(root, relative);
  const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  const unchanged = existing !== null && existing.replace(/\r\n/g, '\n') === content.replace(/\r\n/g, '\n');
  if (checkOnly) {
    if (!unchanged) throw Error(`Out of date: ${relative}. Run node scripts/build-site.cjs`);
  } else if (!unchanged) fs.writeFileSync(target, content, 'utf8');
  console.log(`${checkOnly ? 'checked' : unchanged ? 'unchanged' : 'wrote'} ${relative}`);
}
// Bind new AlignerDiary HTML to the exact current asset bytes, including cached visits.
// Cache per generation; font maintenance must finish, then rerun generation.
const assetVersions = new Map();
function versionedAsset(relative) {
  if (!assetVersions.has(relative)) {
    const digest = createHash('sha256').update(fs.readFileSync(path.join(root, 'assets', relative))).digest('hex').slice(0, 12);
    assetVersions.set(relative, `../../assets/${relative}?v=${digest}`);
  }
  return assetVersions.get(relative);
}
function switcher(name, locale, ui) {
  const labels = { en: 'English', 'zh-Hans': '简体中文', ja: '日本語' };
  return `<div class="language-switcher" role="group" aria-label="${esc(ui.languageLabel)}">${supported.map((id) => `<a data-language-link data-language="${id}" href="./${fileName(name, id)}" hreflang="${id}" lang="${id}"${id === locale ? ' aria-current="page"' : ''}>${labels[id]}</a>`).join('')}</div>`;
}
function alignerSwitcher(name, locale, ui) {
  const globe = '<svg class="language-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></svg>';
  const links = alignerLanguages.supported.map(id => `<a data-language-link data-language="${id}" href="./${fileName(name, id)}" hreflang="${id}" lang="${id}" dir="${id === 'ar' ? 'rtl' : 'ltr'}"${id === locale ? ' aria-current="page"' : ''}>${esc(alignerLanguages.labels[id])}</a>`).join('');
  return `<details class="language-menu" data-language-menu><summary data-language-summary>${globe}<span>${esc(ui.languageLabel)}${locale === 'en' ? '' : ' <bdi lang="en" dir="ltr">/ Language</bdi>'}</span><bdi lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">${esc(alignerLanguages.labels[locale])}</bdi><svg class="language-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4"/></svg></summary><nav class="language-menu-panel" aria-label="${esc(ui.languageLabel)}">${links}</nav></details>`;
}
function alignerContent() {
  if (!alignerBodies) {
    const content = require('../assets/locales/alignerdiary.js');
    for (const locale of alignerLanguages.supported) {
      const copy = alignerLanguages.messages[locale];
      if (!copy || !alignerLanguages.labels[locale] || !copy.ui.lastUpdated.includes('{date}')) throw Error(`Missing AlignerDiary UI: ${locale}`);
      for (const page of ['privacy', 'terms', 'support']) {
        if (typeof content[locale]?.[page] !== 'string' || !content[locale][page].trim()) throw Error(`Missing AlignerDiary body: ${locale}/${page}`);
        if (!copy.page[page]?.[0]) throw Error(`Missing AlignerDiary title: ${locale}/${page}`);
      }
    }
    alignerBodies = content;
  }
  return alignerBodies;
}
function withLocaleLinks(html, locale) {
  if (locale === 'en') return html;
  return html.replace(/href="(\.\/(?:apps\/[\w-]+\/)?(?:index|privacy|terms|support))\.html"/g, (_, base) => `href="${base}.${locale}.html"`);
}
function appIdentity(id, locale) {
  const app = apps[id];
  const ui = messages[locale].ui;
  if (!app) throw Error(`Unknown app: ${id}`);
  const labels = { en: 'English', 'zh-Hans': '简体中文', ja: '日本語' };
  const current = app.locales[locale];
  const otherNames = supported.filter(language => language !== locale).map(language =>
    `<div><dt lang="${language}">${labels[language]}</dt><dd lang="${language}">${esc(app.locales[language].name)}</dd></div>`).join('');
  return `<div class="app-heading">
            <h3 lang="${locale}">${esc(current.name)}</h3>
            <p${id === 'alignerdiary' ? ' data-i18n="alignerDescription"' : ''}>${esc(current.description || ui.alignerDescription)}</p>
            <dl class="app-names" aria-label="${esc(ui.appNames)}">${otherNames}</dl>
            ${current.storeURL ? `<a class="store-link" href="${esc(current.storeURL)}" target="_blank" rel="noopener noreferrer"><span>${esc(ui.downloadApp)}</span><span aria-hidden="true">↗</span></a>` : `<span class="store-link" aria-disabled="true"><span>${esc(ui.downloadApp)}</span><span>${esc(({en:'Not released','zh-Hans':'测试中',ja:'テスト中'})[locale])}</span></span>`}
          </div>`;
}
function renderHome(source, locale) {
  const copy = messages[locale];
  const ui = copy.ui;
  let html = source.replace(/<html lang="[^"]+">/, `<html lang="${locale}">`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(copy.homeDescription)}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(copy.title)}</title>`);
  html = html.replace(/<a class="skip-link" href="#main-content">[^<]*<\/a>/, `<a class="skip-link" href="#main-content">${esc(ui.skip)}</a>`);
  html = html.replace(/aria-label="App Legal &amp; Support home"/, `aria-label="${esc(ui.brandHome)}"`);
  html = html.replace(/<span>App Legal &amp; Support<\/span>/, `<span>${esc(copy.title)}</span>`);
  html = html.replace(/<nav aria-label="Primary navigation"><a href="#apps">[^<]*<\/a><a href="#contact">[^<]*<\/a><\/nav>/,
    `<nav aria-label="${esc(ui.primaryNav)}"><a href="#apps">${esc(ui.apps)}</a><a href="#contact">${esc(ui.contact)}</a></nav>`);
  html = withLocaleLinks(html, locale);
  html = html.replace(/<div class="language-switcher"[^>]*>[\s\S]*?<\/div>/, switcher('index', locale, ui));
  html = html.replace(/<!-- app-identity:([\w-]+):start -->[\s\S]*?<!-- app-identity:\1:end -->/g,
    (_, id) => `<!-- app-identity:${id}:start -->\n          ${appIdentity(id, locale)}\n          <!-- app-identity:${id}:end -->`);
  // Translation markers survive regeneration, so wording changes cannot break matching.
  html = html.replace(/<(h[1-6]|p|span|strong)([^>]* data-i18n="([^"]+)"[^>]*)>[^<]*<\/\1>/g,
    (_, tag, attributes, key) => {
      if (!Object.hasOwn(ui, key) || typeof ui[key] !== 'string') throw Error(`Missing home copy: ${locale}/${key}`);
      return `<${tag}${attributes}>${esc(ui[key])}</${tag}>`;
    });
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,
    `<footer class="site-footer"><div class="container"><strong>${esc(copy.title)}</strong><span>${esc(ui.footer)}</span></div></footer>`);
  if (!html.includes('assets/site-language.js')) html = html.replace('</body>', '<script src="./assets/site-language.js" defer></script>\n</body>');
  return html.replace(/\r\n/g, '\n');
}
function extractEnglishBody(source) {
  const marked = source.match(/<!-- article-body:start -->([\s\S]*?)<!-- article-body:end -->/);
  if (marked) return marked[1].trim();
  const main = source.match(/<main id="main-content" class="article">([\s\S]*?)<\/main>/);
  const body = main?.[1].match(/<div class="meta">[\s\S]*?<\/div>([\s\S]*)/);
  if (!body) throw Error('English legal body missing');
  return body[1].trim();
}
function contactLinks(html, isolate = false) {
  if (isolate) return html.replace(/<a\b[^>]*\bhref="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>/g,
    `<a data-contact-email dir="ltr" href="mailto:${esc(config.contactEmail)}"><bdi dir="ltr">${esc(config.contactEmail)}</bdi></a>`);
  return html.replace(/<a(?: data-contact-email)? href="mailto:[^"]+">[^<]+<\/a>/g,
    `<a data-contact-email${isolate ? ' dir="ltr"' : ''} href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>`);
}
function documentBody(source, app, page, locale) {
  // All 33 AlignerDiary bodies have one authority, including English.
  let body = app === 'alignerdiary' ? alignerContent()[locale]?.[page] : locale === 'en' ? extractEnglishBody(source) : bodies[locale]?.[app]?.[page];
  if (!body) throw Error(`Missing ${locale}/${app}/${page} body`);
  if (app !== 'template') body = contactLinks(body.replaceAll('{{EMAIL}}', esc(config.contactEmail)), app === 'alignerdiary');
  if (locale !== 'en') body = body.replace(/href="\.\/(privacy|terms|support)\.html"/g, (_, name) => `href="./${fileName(name, locale)}"`);
  return body.trim();
}
function renderDoc(source, app, page, locale, body) {
  const isAligner = app === 'alignerdiary';
  const copy = isAligner ? alignerLanguages.messages[locale] : messages[locale];
  const ui = copy.ui;
  const homeLocale = supported.includes(locale) ? locale : 'en';
  // Extra locales explicitly link to English; the query also beats a saved preference.
  const homeFile = fileName('index', homeLocale) + (homeLocale !== locale ? '?lang=en' : '');
  const homeLabel = homeLocale === locale ? ui.allApps : ui.allAppsEnglish;
  const homeAria = homeLocale === locale ? ui.brandHome : ui.brandHomeEnglish;
  const appName = app === 'template' ? 'APP_NAME' : isAligner ? (apps[app].locales[locale]?.name || 'AlignerDiary') : apps[app].locales[locale].name;
  const pageTitle = copy.page[page][0];
  const description = `${pageTitle} · ${appName}`;
  let label = page === 'privacy' || page === 'terms'
    ? app === 'template' ? `${locale === 'en' ? 'Last updated: ' : locale === 'zh-Hans' ? '最后更新：' : '最終更新日：'}LAST_UPDATED` : ui.lastUpdated
    : app === 'template' ? ui.templateMeta : ui.lastUpdated;
  if (app !== 'template' && apps[app].policyUpdated) {
    const date = apps[app].policyUpdated;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Invalid policy date: ' + app);
    const [year, month, day] = date.split('-').map(Number);
    const englishDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
    label = ({ en: 'Last updated: ' + englishDate, 'zh-Hans': '最后更新：' + year + '年' + month + '月' + day + '日', ja: '最終更新日：' + year + '年' + month + '月' + day + '日' })[locale];
  }
  let labelMarkup = esc(label);
  if (isAligner) {
    const date = apps[app].policyUpdated;
    const formatted = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
    labelMarkup = esc(ui.lastUpdated).replace('{date}', `<time datetime="${date}">${esc(formatted)}</time>`);
  }
  const docLink = (name, text) => `<a href="./${fileName(name, locale)}"${name === page ? ' aria-current="page"' : ''}>${esc(text)}</a>`;
  return `<!doctype html>
<html lang="${locale}"${isAligner ? ` dir="${locale === 'ar' ? 'rtl' : 'ltr'}"` : ''}>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <title>${esc(pageTitle)} · ${esc(appName)}</title>
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${isAligner ? versionedAsset('fonts/typefaces.css') : '../../assets/fonts/typefaces.css'}">
  <link rel="stylesheet" href="${isAligner ? versionedAsset('style.css') : '../../assets/style.css'}">
</head>
<body${isAligner ? ' class="aligner-doc"' : ''}>
<a class="skip-link" href="#main-content">${esc(ui.skip)}</a>
<header class="site-header"><div class="container inner">
  <a class="brand" href="../../${homeFile}" aria-label="${esc(homeAria)}">${brandMark}<span>${esc(copy.title)}</span></a>
  <div class="header-tools">${isAligner ? `\n    ${alignerSwitcher(page, locale, ui)}` : ''}
    <nav aria-label="${esc(app === 'template' ? ui.templateNavDocs : app === 'alignerdiary' ? ui.navDocs : appName)}">${docLink('privacy', ui.privacyShort)}${docLink('terms', ui.termsShort)}${docLink('support', ui.supportShort)}</nav>
    ${isAligner ? '' : switcher(page, locale, ui)}
  </div>
</div></header>
<div class="article-shell"><div class="breadcrumb"><a href="../../${homeFile}"><span${isAligner ? ' class="back-arrow"' : ''} aria-hidden="true">←</span> ${esc(homeLabel)}</a></div>
<main id="main-content" class="article">
  <span class="badge">${isAligner ? `<bdi dir="auto">${esc(appName)}</bdi>` : esc(appName)}</span><h1>${esc(pageTitle)}</h1><div class="meta">${labelMarkup}</div>
  <!-- article-body:start -->
  ${body}
  <!-- article-body:end -->
</main></div>
<footer class="site-footer"><div class="container"><strong>${esc(copy.title)}</strong><span>${esc(ui.footer)}</span></div></footer>
<script src="${isAligner ? versionedAsset('site-language.js') : '../../assets/site-language.js'}" defer></script>
</body></html>
`;
}

// Validate the new authority before writing outputs; incomplete translations fail closed.
alignerContent();
for (const locale of supported) write(fileName('index', locale), renderHome(englishHome, locale));
for (const app of [...Object.keys(apps), '_template']) {
  const key = app === '_template' ? 'template' : app;
  for (const page of ['privacy', 'terms', 'support']) {
    const source = key === 'alignerdiary' ? '' : fs.readFileSync(path.join(root, 'apps', app, `${page}.html`), 'utf8');
    const englishBody = documentBody(source, key, page, 'en');
    for (const locale of key === 'alignerdiary' ? alignerLanguages.supported : supported) {
      const body = locale === 'en' ? englishBody : documentBody(source, key, page, locale);
      const out = renderDoc(source, key, page, locale, body);
      write(path.join('apps', app, fileName(page, locale)), out);
    }
  }
}
