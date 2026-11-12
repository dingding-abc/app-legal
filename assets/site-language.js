/* Static language links and native disclosure work without this enhancement. */
(function () {
  'use strict';
  const key = 'app-legal-language';
  const links = Array.from(document.querySelectorAll('[data-language-link]'));
  const menus = Array.from(document.querySelectorAll('[data-language-menu]'));
  const current = document.documentElement.lang;
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) { /* Storage may be disabled. */ }
  const suffix = location.pathname.match(/\.([^.\/]+)\.html$/)?.[1];
  const hasExplicitSuffix = suffix && links.some(link => link.dataset.language === suffix);
  const explicitEnglish = /(?:\?|&)lang=en(?:&|$)/.test(location.search || '');
  // AlignerDiary's original English URL is explicit too. A failed preference write
  // must never bounce an English click back to an older saved language.
  const explicitLocale = menus.length > 0 || hasExplicitSuffix || explicitEnglish;
  if (!explicitLocale && saved && saved !== current) {
    const target = links.find(link => link.dataset.language === saved);
    if (target) { location.replace(target.href); return; }
  }
  function closeMenus() { for (const menu of menus) menu.open = false; }
  function fitMenu(menu) {
    const summary = menu.querySelector('summary');
    if (!summary) return;
    const top = summary.getBoundingClientRect().bottom + 8;
    menu.style.setProperty('--language-menu-top', `${top}px`);
  }
  for (const link of links) {
    link.addEventListener('click', () => {
      try { localStorage.setItem(key, link.dataset.language); } catch (_) { /* Link still works. */ }
      closeMenus();
    });
  }
  if (!menus.length) return;
  for (const menu of menus) {
    menu.addEventListener('toggle', () => { if (menu.open) fitMenu(menu); });
  }
  document.addEventListener('click', event => {
    for (const menu of menus) if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const menu = menus.find(item => item.open);
    if (!menu) return;
    menu.open = false;
    menu.querySelector('summary').focus({ preventScroll: true });
    event.preventDefault();
  });
  window.addEventListener('resize', () => { for (const menu of menus) if (menu.open) fitMenu(menu); });
  // Do not restore an open popup from the browser's back/forward cache.
  window.addEventListener('pagehide', closeMenus);
  window.addEventListener('pageshow', closeMenus);
})();
