/* Static language links work without this script. It only remembers a choice. */
(function () {
  'use strict';
  const key = 'app-legal-language';
  const links = Array.from(document.querySelectorAll('[data-language-link]'));
  const current = document.documentElement.lang;
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) { /* Storage may be disabled. */ }
  // A language-specific URL is an explicit choice, including a direct link.
  // Only the original, unsuffixed English URL may use the saved preference.
  const explicitLocale = /\.(?:zh-Hans|ja)\.html$/i.test(location.pathname);
  if (!explicitLocale && saved && saved !== current) {
    const target = links.find((link) => link.dataset.language === saved);
    if (target) { location.replace(target.href); return; }
  }
  for (const link of links) {
    link.addEventListener('click', () => {
      try { localStorage.setItem(key, link.dataset.language); } catch (_) { /* Link still works. */ }
    });
  }
})();
