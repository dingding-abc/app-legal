# App Legal & Support — design specification

Updated October 7, 2026. The requested direction combines a recognizable independent-app identity with practical document navigation. English, Chinese and Japanese each use a deliberately chosen local typeface.

## References and interpretation

The following public Figma Community previews were inspected in the browser:

- [Nature Inspired Visual Essay](https://www.figma.com/community/file/1494802487063033242/nature-inspired-visual-essay): deep green, asymmetric composition and expressive serif type.
- [Minimalist Design Student Portfolio](https://www.figma.com/community/file/1498071814425915852/minimalist-design-student-portfolio): a clear opening statement and a visual project index.
- [Retro-Industrial Music Event](https://www.figma.com/community/file/1497430039004576833/retro-industrial-music-event): a comparison for stronger contrast; its event-specific style was not adopted.

These inform proportions, hierarchy and contrast. The notebook illustration, site markup and styles are original to this project; no template images or design files were copied.

## Visual system

- Cream paper `#f5f4ee`, off-white content `#fffefa`, deep ink `#263e32`, accent `#355c43`, a small amount of lime `#d5e79a`.
- Wide opening with the title on the left and a short explanation on the right, separated by a fine rule.
- English display: Fraunces, with a real italic second title line. English body and Latin app name: Inter.
- Simplified Chinese: LXGW WenKai, with a regular-weight title that preserves the approved handwritten character.
- Japanese: Zen Maru Gothic, with rounded Japanese letterforms, a medium-weight title and separately tuned size and spacing.
- All fonts are bundled locally. See `assets/fonts/SOURCE.md` for licenses, source snapshots and subset maintenance.
- Overall width: 1080 px. Reading column: 760 px. Use a single 16 px rounded app panel, without nested cards or broad shadows.

## Homepage

1. Compact masthead, document mark, section links, and visible active language.
2. A two-line handbook title and a factual description of the documents. The browse link leads directly to the app directory.
3. Light category header. One featured AlignerDiary panel: a deep-green illustrated notebook cover on the left; the exact localized App Store title, the other two language titles, a direct App Store download link, and three numbered document links on the right. All three titles remain visible without JavaScript, truncation or tooltips. Names use their own language typefaces. The cover is decorative, not a representation of the app interface or an official app icon.
4. Smart is a compact category row with an explicit no-apps message. Do not invent a launch date or future product.
5. Contact offers the same-language AlignerDiary support link, with a modest lime accent.
6. Small footer with the existing independent-developer wording.

## Documents and templates

Keep the reading column open. Use the matching language typeface, the full localized App Store name in the app label, and a fine separator below the protected date. Preserve all existing legal paragraphs, sections, contacts and template tokens. Shared document navigation retains `aria-current="page"`; back links preserve language.

Formal content and September 20, 2026 dates remain unchanged. The contact address is maintained only in `assets/site-config.js`. The template is never listed on the homepage.

## Responsive and accessible behavior

- Below 680 px, the introduction stacks and the app cover becomes a compact horizontal illustration above the document index. Outer gutters are 20 px.
- Tune each language title separately. Keep all descriptions available, wrap long text and avoid horizontal scrolling at 320/375 px.
- Preserve one h1, semantic regions, a visible skip link, practical 44 px navigation targets, keyboard focus and static language links.
- Document rows use subtle arrow-background feedback; reduced motion disables transitions. Decorative artwork is hidden from assistive technology.
- Content, navigation and fonts do not require JavaScript or remote services. The only runtime script remembers language preference.

## Maintenance and validation

The homepage structure lives in `index.html`; text-only `data-i18n` elements are generated from `assets/i18n.js`. Document bodies retain their existing authority and generation direction. Run the normal build and site checks, plus the offline font check. Font updates require network access only when the maintained content adds characters beyond the bundled subset.

Check desktop, 375 px and 320 px pages, actual font readiness, keyboard navigation, language switching and repository-prefix navigation. Record actual results in `PROJECT.md`. This work is local and does not authorize publication.

## AlignerDiary concise multilingual documents · November 12, 2026

This local update replaces AlignerDiary body authority with `assets/locales/alignerdiary.js` for all 11 locales, including English. Existing English, Simplified Chinese and Japanese URLs remain. The homepage, other app, and templates retain their three-language layout, content, dates and font system. Only AlignerDiary uses `body.aligner-doc` styling and its updated date. Existing brand colors are retained.

The language disclosure appears in the header before the document navigation; at narrow widths the reading order is brand, language, then Privacy / Terms / Support. It shows a globe, a localized language label, `/ Language` on non-English pages, and the current language autonym. All 11 same-document choices are real static links sorted by language code. Native `details/summary` provides the baseline keyboard disclosure; the positioned, scrollable panel keeps the header and main geometry unchanged. Touch targets remain at least 44 CSS px. Closing hides links from Tab; enhancement adds Escape with focus return, outside-click closing, and page-cache cleanup without timed animation. Verify these claims in the browser at 320/375 px and desktop, including the last menu item, rapid close/reopen, no-JS navigation, RTL, and LTR-isolated email.

Arabic uses `dir=rtl`, logical edges and a mirrored back arrow; globe artwork is not mirrored. The eight added locale pages link to the English homepage with a localized English label and `?lang=en`. AlignerDiary unsuffixed English document URLs are now explicit too, rather than depending on a successful preference write; test English selection while storage writes fail. Homepage and other-app saved-preference enhancement remains. The introductory contact line uses existing ink/link colors and compact emphasis, without another card or duplicated address.

Font maintenance retains the three local families, acquisition sources and character corpus. Every autonym uses its own `lang` to select an appropriate local/system face; additional Latin pages use existing Inter, while Arabic, Korean and Traditional Chinese use system fallbacks. The updater still collects the complete text of en/zh-Hans/ja pages, including all autonyms, and verifies character snapshots, checksums and licenses. Passing it does not prove Arabic/Korean glyph coverage in Fraunces or a system fallback; browser readability is a separate acceptance item.

Research evidence supplied by the main agent on November 12, 2026: [W3C localized navigation](https://www.w3.org/International/questions/qa-navigation-select) for header placement and autonyms; [GOV.UK language navigation](https://design-system.service.gov.uk/components/language-navigation/) for corresponding-language content and clear current language; [MDN details](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) for native disclosure semantics. These are the main agent’s observed sources, not fresh independent observations by the implementation worker. Always-visible 11 links would consume header height; a select-driven jump would depend on JavaScript; prominent disclosure with static links fits the confirmed scope. No external code was copied. Public user-feedback and cross-browser Safari evidence are missing, so this is an implementation choice, not proof of general superiority.

Generation is an implementation check. Final checker/font execution belongs to the separate Sol xhigh worker, and browser review and acceptance to the main agent. No commit, index mutation, push, deployment or remote write is authorized.

The first real browser preview exposed stale unversioned CSS being reused with new AlignerDiary markup. Preserve that failure evidence. AlignerDiary now versions the CSS, language script, and font stylesheet URLs with the first 12 hex digits of each current file’s SHA-256; other pages keep their existing references. Regenerate after font updates and verify the original cached-browser path. Also retain the verified catalog app names for en/zh-Hans/ja; the confirmed AlignerDiary brand is the fallback for the eight new locales only. These corrections do not imply browser acceptance.

Astra R1 additionally requires each generated WOFF2 URL to carry the first 12 hex digits of its actual byte SHA-256. The updater keeps file names, font families, licenses and verified download reuse. Its check mode separates path from query, compares the original expected resources and verifies each unique v value against current bytes without weakening content, checksum or license checks. Generate current body HTML for the corpus, run font maintenance, then regenerate HTML to bind its three asset versions to the new font CSS. The shared font stylesheet requires a small Keepaccounts en/zh-Hans/ja browser regression, owned by the main agent. Old failure evidence and packages remain historical.
