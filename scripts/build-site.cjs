#!/usr/bin/env node
// Generate complete static language pages; the original English URLs remain stable.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = require('../assets/site-config.js');
const apps = require('../assets/app-catalog.js');
const { messages, supported } = require('../assets/i18n.js');
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
  if (checkOnly) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) throw Error(`Out of date: ${relative}. Run node scripts/build-site.cjs`);
  } else fs.writeFileSync(target, content, 'utf8');
  console.log(`${checkOnly ? 'checked' : 'wrote'} ${relative}`);
}
function switcher(name, locale, ui) {
  const labels = { en: 'English', 'zh-Hans': '简体中文', ja: '日本語' };
  return `<div class="language-switcher" role="group" aria-label="${esc(ui.languageLabel)}">${supported.map((id) => `<a data-language-link data-language="${id}" href="./${fileName(name, id)}" hreflang="${id}" lang="${id}"${id === locale ? ' aria-current="page"' : ''}>${labels[id]}</a>`).join('')}</div>`;
}
function withLocaleLinks(html, locale) {
  if (locale === 'en') return html;
  return html.replace(/href="(\.\/(?:apps\/alignerdiary\/)?(?:index|privacy|terms|support))\.html"/g, (_, base) => `href="${base}.${locale}.html"`);
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
            <p data-i18n="alignerDescription">${esc(ui.alignerDescription)}</p>
            <dl class="app-names" aria-label="${esc(ui.appNames)}">${otherNames}</dl>
            <a class="store-link" href="${esc(current.storeURL)}" target="_blank" rel="noopener noreferrer"><span>${esc(ui.downloadApp)}</span><span aria-hidden="true">↗</span></a>
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
function contactLinks(html) {
  return html.replace(/<a(?: data-contact-email)? href="mailto:[^"]+">[^<]+<\/a>/g,
    `<a data-contact-email href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>`);
}
function documentBody(source, app, page, locale) {
  let body = locale === 'en' ? extractEnglishBody(source) : bodies[locale]?.[app]?.[page];
  if (!body) throw Error(`Missing ${locale}/${app}/${page} body`);
  if (app === 'alignerdiary') body = contactLinks(body.replaceAll('{{EMAIL}}', esc(config.contactEmail)));
  if (locale !== 'en') body = body.replace(/href="\.\/(privacy|terms|support)\.html"/g, (_, name) => `href="./${fileName(name, locale)}"`);
  return body.trim();
}
function renderDoc(source, app, page, locale, body) {
  const copy = messages[locale];
  const ui = copy.ui;
  const appName = app === 'template' ? 'APP_NAME' : apps[app].locales[locale].name;
  const pageTitle = copy.page[page][0];
  const description = `${pageTitle} · ${appName}`;
  const label = page === 'privacy' || page === 'terms'
    ? app === 'template' ? `${locale === 'en' ? 'Last updated: ' : locale === 'zh-Hans' ? '最后更新：' : '最終更新日：'}LAST_UPDATED` : ui.lastUpdated
    : app === 'template' ? ui.templateMeta : ui.lastUpdated;
  const docLink = (name, text) => `<a href="./${fileName(name, locale)}"${name === page ? ' aria-current="page"' : ''}>${esc(text)}</a>`;
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <title>${esc(pageTitle)} · ${esc(appName)}</title>
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/fonts/typefaces.css">
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
<a class="skip-link" href="#main-content">${esc(ui.skip)}</a>
<header class="site-header"><div class="container inner">
  <a class="brand" href="../../${fileName('index', locale)}" aria-label="${esc(ui.brandHome)}">${brandMark}<span>${esc(copy.title)}</span></a>
  <div class="header-tools">
    <nav aria-label="${esc(app === 'template' ? ui.templateNavDocs : ui.navDocs)}">${docLink('privacy', ui.privacyShort)}${docLink('terms', ui.termsShort)}${docLink('support', ui.supportShort)}</nav>
    ${switcher(page, locale, ui)}
  </div>
</div></header>
<div class="article-shell"><div class="breadcrumb"><a href="../../${fileName('index', locale)}"><span aria-hidden="true">←</span> ${esc(ui.allApps)}</a></div>
<main id="main-content" class="article">
  <span class="badge">${esc(appName)}</span><h1>${esc(pageTitle)}</h1><div class="meta">${esc(label)}</div>
  <!-- article-body:start -->
  ${body}
  <!-- article-body:end -->
</main></div>
<footer class="site-footer"><div class="container"><strong>${esc(copy.title)}</strong><span>${esc(ui.footer)}</span></div></footer>
<script src="../../assets/site-language.js" defer></script>
</body></html>
`;
}

for (const locale of supported) write(fileName('index', locale), renderHome(englishHome, locale));
for (const app of ['alignerdiary', '_template']) {
  const key = app === '_template' ? 'template' : app;
  for (const page of ['privacy', 'terms', 'support']) {
    const source = fs.readFileSync(path.join(root, 'apps', app, `${page}.html`), 'utf8');
    const englishBody = documentBody(source, key, page, 'en');
    for (const locale of supported) {
      const body = locale === 'en' ? englishBody : documentBody(source, key, page, locale);
      const out = renderDoc(source, key, page, locale, body);
      write(path.join('apps', app, fileName(page, locale)), out);
    }
  }
}
