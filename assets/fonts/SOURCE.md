# Typography sources

All fonts are served locally. No visitor request goes to Google Fonts or another font service. Chinese and Japanese use the specimens selected by the user on October 7, 2026.

| Language / role | Typeface | Files |
| --- | --- | --- |
| English titles, including real italic | Fraunces | `fraunces-1.woff2`, `fraunces-2.woff2` |
| Simplified Chinese titles, UI and reading text | LXGW WenKai / 霞鹜文楷 | `lxgwwenkai-regular-subset-*.woff2`, `lxgwwenkai-bold-subset-*.woff2` |
| Japanese titles, UI and reading text | Zen Maru Gothic | `zenmarugothic-1.woff2`, `zenmarugothic-2.woff2`, `zenmarugothic-3.woff2` |
| English body and the Latin app name | Inter 4.1 | `InterVariable.woff2` |

## Three language families

Downloaded October 7, 2026. Fraunces and Zen Maru Gothic come from the official Google Fonts CSS2 service, subset for the characters in the corresponding static pages plus printable ASCII. Japanese includes regular (400), medium (500) and bold (700).

LXGW WenKai uses the same `lxgw-wenkai-webfont@1.7.0` package as the approved preview, containing font version v1.250. Its regular (400) and bold (700) WOFF2 blocks are downloaded from the version-pinned jsDelivr package; only blocks whose Unicode ranges intersect the Chinese page text and printable ASCII are included. The Chinese homepage title uses regular weight to retain its natural handwritten strokes.

All files are stored as supplied, without further font editing. `font-manifest.json` records the requested characters, source URLs, byte sizes and SHA-256 hashes; `typefaces.css` maps the local files and supplied weights/styles.

- Fraunces: https://github.com/googlefonts/fraunces — `fraunces-OFL.txt`
- LXGW WenKai upstream: https://github.com/lxgw/LxgwWenKai — `lxgwwenkai-OFL.txt`
- LXGW WenKai webfont packaging: https://github.com/chawyehsu/lxgw-wenkai-webfont; pinned distribution: https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/
- Zen Maru Gothic: https://github.com/googlefonts/zen-marugothic — `zenmarugothic-OFL.txt`

Each family is distributed with its SIL Open Font License. The files are not installed in the operating system.

`node scripts/update-fonts.cjs --check` works offline and detects new page characters outside the downloaded subsets, changed font files, and missing licenses. This is a check of the requested text coverage, not a claim that every upstream family contains every Unicode glyph; language-appropriate fallbacks remain available for mixed-language text.

When page copy adds new characters, first generate the pages, then run `node scripts/update-fonts.cjs` with network access. It requests subsets and licenses from the sources above and updates the manifest/CSS. For the pinned Chinese package it also verifies that the selected blocks declare all requested code points, separately for each weight. Review those asset changes, then run the offline checks again. Normal site generation does not download or update fonts.

## Existing Inter

`InterVariable.woff2` is the unmodified Inter 4.1 regular variable font, downloaded September 27, 2026:

- Font: https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1
- License: https://raw.githubusercontent.com/rsms/inter/v4.1/LICENSE.txt
- Upstream: https://rsms.me/inter/

Its SIL Open Font License is included in `Inter-LICENSE.txt`. Inter is used for Latin body copy and the unchanged AlignerDiary name; it no longer determines the Chinese or Japanese typeface.
