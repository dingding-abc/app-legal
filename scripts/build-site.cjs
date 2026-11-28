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
const homeCopy = require('../assets/home-copy.js');
const modernApps = new Set(['alignerdiary', 'miaomiaojizhang']);
const modernBodiesCache = new Map();
const bodies = {
  'zh-Hans': require('../assets/locales/zh-Hans.js'),
  ja: require('../assets/locales/ja.js'),
};
const checkOnly = process.argv.includes('--check');
const brandMark = "<svg class=\"brand-mark\" aria-hidden=\"true\" viewBox=\"0 0 24 28\" fill=\"none\"><path d=\"M5 2h10l5 5v19H5V2ZM15 2v6h5M9 13h7M9 18h7\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></svg>";

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
// Bind the homepages and AlignerDiary documents to the exact current asset bytes, including cached visits.
// Cache per generation; font maintenance must finish, then rerun generation.
const assetVersions = new Map();
function versionedAsset(relative, prefix = '../../') {
  if (!assetVersions.has(relative)) {
    const digest = createHash('sha256').update(fs.readFileSync(path.join(root, 'assets', relative))).digest('hex').slice(0, 12);
    assetVersions.set(relative, digest);
  }
  return `${prefix}assets/${relative}?v=${assetVersions.get(relative)}`;
}
function switcher(name, locale, ui, explicitEnglish = false) {
  const labels = { en: 'English', 'zh-Hans': '简体中文', ja: '日本語' };
  return `<div class="language-switcher" role="group" aria-label="${esc(ui.languageLabel)}">${supported.map((id) => `<a data-language-link data-language="${id}" href="./${fileName(name, id)}${explicitEnglish && id === 'en' ? '?lang=en' : ''}" hreflang="${id}" lang="${id}"${id === locale ? ' aria-current="page"' : ''}>${labels[id]}</a>`).join('')}</div>`;
}
function languageMenu(name, locale, ui) {
  const globe = '<svg class="language-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></svg>';
  const links = alignerLanguages.supported.map(id => {
    const href = name === 'index' ? homeHref(id) : `./${fileName(name, id)}`;
    return `<a data-language-link data-language="${id}" href="${href}" hreflang="${id}" lang="${id}" dir="${id === 'ar' ? 'rtl' : 'ltr'}"${id === locale ? ' aria-current="page"' : ''}>${esc(alignerLanguages.labels[id])}</a>`;
  }).join('');
  return `<details class="language-menu" data-language-menu><summary data-language-summary>${globe}<span>${esc(ui.languageLabel)}${locale === 'en' ? '' : ' <bdi lang="en" dir="ltr">/ Language</bdi>'}</span><bdi lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">${esc(alignerLanguages.labels[locale])}</bdi><svg class="language-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4"/></svg></summary><nav class="language-menu-panel" aria-label="${esc(ui.languageLabel)}">${links}</nav></details>`;
}
function modernContent(app) {
  if (!modernBodiesCache.has(app)) {
    const content = require(`../assets/locales/${app}.js`);
    for (const locale of alignerLanguages.supported) {
      const copy = alignerLanguages.messages[locale];
      if (!copy || !alignerLanguages.labels[locale] || !copy.ui.lastUpdated.includes('{date}')) throw Error(`Missing ${app} UI: ${locale}`);
      for (const page of ['privacy', 'terms', 'support']) {
        if (typeof content[locale]?.[page] !== 'string' || !content[locale][page].trim()) throw Error(`Missing ${app} body: ${locale}/${page}`);
        if (!copy.page[page]?.[0]) throw Error(`Missing ${app} title: ${locale}/${page}`);
      }
    }
    modernBodiesCache.set(app, content);
  }
  return modernBodiesCache.get(app);
}
function homeHref(locale, prefix = './') {
  return prefix + fileName('index', locale) + (locale === 'en' ? '?lang=en' : '');
}
function renderHomeApp(id, locale, copy) {
  const isAligner = id === 'alignerdiary';
  const isModern = modernApps.has(id);
  const listing = apps[id].locales[locale];
  const documentLocale = isModern || listing ? locale : 'en';
  const englishFallback = documentLocale !== locale;
  const { testing, fallback } = homeCopy[locale];
  const note = [apps[id].status === 'testing' ? testing : '', englishFallback ? fallback : ''].filter(Boolean).join(' · ');
  const name = listing?.name || (isAligner ? 'AlignerDiary' : apps[id].locales.en.name);
  const nameLanguage = isAligner ? (listing ? locale : 'en') : (locale === 'zh-Hans' ? 'zh-Hans' : 'en');
  const storeURL = isAligner ? (listing?.storeURL || apps[id].locales.en.storeURL) : null;
  const labels = { privacy: copy.ui.privacyShort, terms: copy.ui.termsShort, support: copy.ui.supportShort };
  const links = Object.entries(labels).map(([page, label]) => {
    const href = './apps/' + id + '/' + fileName(page, documentLocale) + (!isModern && documentLocale === 'en' ? '?lang=en' : '');
    return `<li><a href="${href}" hreflang="${documentLocale}">${esc(label)}</a></li>`;
  }).join('');
  const icon = versionedAsset(`${id}-icon.webp`, './');
  const storeLink = storeURL ? `<li><a class="home-store-link" href="${esc(storeURL)}"><bdi lang="en" dir="ltr">App Store</bdi></a></li>` : '';
  return `    <section class="home-app" aria-labelledby="${id}">
      <div class="home-app-heading">
        <img class="home-app-icon" src="${icon}" width="56" height="56" alt="">
        <div>
          <h2 id="${id}"><bdi lang="${nameLanguage}">${esc(name)}</bdi></h2>${note ? '\n          <p class="home-app-note" id="miaomiaojizhang-note">' + esc(note) + '</p>' : ''}
        </div>
      </div>
      <nav class="home-app-links" aria-labelledby="${id}"${note ? ' aria-describedby="miaomiaojizhang-note"' : ''}><ul>${links}${storeLink}</ul></nav>
    </section>`;
}
function renderHome(locale) {
  const copy = alignerLanguages.messages[locale];
  const contact = homeCopy[locale].contact;
  return `<!doctype html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${esc(copy.title)}">
  <title>${esc(copy.title)}</title>
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${versionedAsset('fonts/typefaces.css', './')}">
  <link rel="stylesheet" href="${versionedAsset('style.css', './')}">
  <link rel="stylesheet" href="${versionedAsset('home.css', './')}">
</head>
<body class="home-page">
<a class="skip-link" href="#main-content">${esc(copy.ui.skip)}</a>
<main class="home-shell" id="main-content" tabindex="-1">
  <header class="home-header">
    ${languageMenu('index', locale, copy.ui)}
    <h1>${esc(copy.title)}</h1>
  </header>
  <div class="home-apps">
${Object.keys(apps).sort().map(id => renderHomeApp(id, locale, copy)).join('\n')}
  </div>
</main>
<footer class="home-shell home-contact">
  <span>${esc(contact)}</span>
  <a data-contact-email dir="ltr" href="mailto:${esc(config.contactEmail)}"><bdi dir="ltr">${esc(config.contactEmail)}</bdi></a>
</footer>
<script src="${versionedAsset('site-language.js', './')}" defer></script>
</body></html>
`;
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
  const isModern = modernApps.has(app);
  let body = isModern ? modernContent(app)[locale]?.[page] : locale === 'en' ? extractEnglishBody(source) : bodies[locale]?.[app]?.[page];
  if (!body) throw Error(`Missing ${locale}/${app}/${page} body`);
  if (app !== 'template') body = contactLinks(body.replaceAll('{{EMAIL}}', esc(config.contactEmail)), isModern);
  if (locale !== 'en') {
    body = body.replace(/href="\.\/(privacy|terms|support)\.html"/g, (_, name) => `href="./${fileName(name, locale)}"`);
  }
  return body.replace(/\r\n/g, '\n').trim();
}
function renderDoc(app, page, locale, body) {
  const isModern = modernApps.has(app);
  const copy = isModern ? alignerLanguages.messages[locale] : messages[locale];
  const ui = copy.ui;
  const homeFile = app === 'template' ? '../../' + fileName('index', locale) : homeHref(locale, '../../');
  const homeLabel = ui.allApps;
  const homeAria = ui.brandHome;
  const appName = app === 'template' ? 'APP_NAME' : isModern ? (apps[app].locales[locale]?.name || (app === 'alignerdiary' ? 'AlignerDiary' : apps[app].locales.en.name)) : apps[app].locales[locale].name;
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
  if (isModern) {
    const date = apps[app].policyUpdated;
    const formatted = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
    labelMarkup = esc(ui.lastUpdated).replace('{date}', `<time datetime="${date}">${esc(formatted)}</time>`);
  }
  const docLink = (name, text) => `<a href="./${fileName(name, locale)}"${name === page ? ' aria-current="page"' : ''}>${esc(text)}</a>`;
  const navLabel = app === 'template' ? ui.templateNavDocs : app === 'alignerdiary' ? ui.navDocs : ui.navDocs.replace(/AlignerDiary|齿间时光/g, appName);
  return `<!doctype html>
<html lang="${locale}"${isModern ? ` dir="${locale === 'ar' ? 'rtl' : 'ltr'}"` : ''}>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <title>${esc(pageTitle)} · ${esc(appName)}</title>
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${isModern ? versionedAsset('fonts/typefaces.css') : '../../assets/fonts/typefaces.css'}">
  <link rel="stylesheet" href="${isModern ? versionedAsset('style.css') : '../../assets/style.css'}">
</head>
<body${isModern ? ' class="aligner-doc"' : ''}>
<a class="skip-link" href="#main-content">${esc(ui.skip)}</a>
<header class="site-header"><div class="container inner">
  <a class="brand" href="${homeFile}" aria-label="${esc(homeAria)}">${brandMark}<span>${esc(copy.title)}</span></a>
  <div class="header-tools">${isModern ? `\n    ${languageMenu(page, locale, ui)}` : ''}
    <nav aria-label="${esc(navLabel)}">${docLink('privacy', ui.privacyShort)}${docLink('terms', ui.termsShort)}${docLink('support', ui.supportShort)}</nav>
    ${isModern ? '' : switcher(page, locale, ui, false)}
  </div>
</div></header>
<div class="article-shell"><div class="breadcrumb"><a href="${homeFile}"><span${isModern ? ' class="back-arrow"' : ''} aria-hidden="true">←</span> ${esc(homeLabel)}</a></div>
<main id="main-content" class="article">
  <span class="badge">${isModern ? `<bdi dir="auto">${esc(appName)}</bdi>` : esc(appName)}</span><h1>${esc(pageTitle)}</h1><div class="meta">${labelMarkup}</div>
  <!-- article-body:start -->
  ${body}
  <!-- article-body:end -->
</main></div>
<footer class="site-footer"><div class="container"><strong>${esc(copy.title)}</strong><span>${esc(ui.footer)}</span></div></footer>
<script src="${isModern ? versionedAsset('site-language.js') : '../../assets/site-language.js'}" defer></script>
</body></html>
`;
}

// Validate the modern app authorities before writing outputs; incomplete translations fail closed.
for (const app of modernApps) modernContent(app);
for (const locale of alignerLanguages.supported) {
  if (!homeCopy[locale]?.contact || !homeCopy[locale]?.testing || (!supported.includes(locale) && !homeCopy[locale]?.fallback)) throw Error('Missing homepage copy: ' + locale);
  write(fileName('index', locale), renderHome(locale));
}
for (const app of [...Object.keys(apps), '_template']) {
  const key = app === '_template' ? 'template' : app;
  const isModern = modernApps.has(key);
  for (const page of ['privacy', 'terms', 'support']) {
    const source = isModern ? '' : fs.readFileSync(path.join(root, 'apps', app, `${page}.html`), 'utf8');
    const englishBody = documentBody(source, key, page, 'en');
    for (const locale of isModern ? alignerLanguages.supported : supported) {
      const body = locale === 'en' ? englishBody : documentBody(source, key, page, locale);
      const out = renderDoc(key, page, locale, body);
      write(path.join('apps', app, fileName(page, locale)), out);
    }
  }
}
