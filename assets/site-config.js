/* The only maintained contact address. Run scripts/build-site.cjs after changing it. */
(function (root) {
  'use strict';
  const config = Object.freeze({ contactEmail: 'daniel.ding117@gmail.com' });
  root.SiteConfig = config;
  if (typeof module === 'object' && module.exports) module.exports = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
