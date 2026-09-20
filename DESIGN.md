# App Legal & Support — design specification

## Purpose and scope

This is a public directory of app privacy policies, terms of use, and support information. Visitors should find their app and open the relevant document immediately. Keep the existing English language and site name, as confirmed by the owner.

The existing project is plain HTML and shared CSS, intended for GitHub Pages. Preserve this architecture, all existing document URLs, and the existing legal text. No framework, package installation, backend, search, account system, or invented apps are needed. The working folder is on Windows and is not currently a Git repository.

## Visual direction

A quiet, carefully typeset document library: warm paper, dark ink, restrained teal details, and generous but purposeful spacing. It should feel trustworthy and welcoming without making unverified privacy or security claims.

- Background: warm off-white `#f7f8f5`; surfaces `#ffffff`.
- Main text: deep ink `#20332f`; supporting text `#5d6d67`.
- Accent: dark teal `#245f50`; pale accent surface `#eaf1eb`.
- Borders: `#dde4dd`; avoid broad gradients, heavy shadows, and decorative stock imagery.
- Use a system sans-serif font stack, with Georgia for the homepage headline only. No remotely loaded assets or fonts.
- Overall content width: about 1080 px. Document reading width: about 780 px.
- Use small custom inline SVG marks: a folded document for the site identity, a simple AD monogram for AlignerDiary (a directory identifier, not an asserted official app logo).
- Corners: around 18–24 px for the app panel, 10–14 px for document links. Hairline borders and restrained hover transitions.

## Homepage composition

1. Header, around 80 px high: a compact document mark and the existing site name on the left; `Apps` and `Contact` anchor links on the right. No sticky obstruction on small screens.
2. Intro, around 64 px top padding on desktop: a small `APP INFORMATION` eyebrow, a two-line editorial headline `A home for the details.` at about 60–68 px, followed by `Privacy policies, terms of use, and support for our apps.` in a readable supporting size. A small subtle document motif may balance the right side, but must not compete with the directory. Do not create an oversized marketing hero.
3. App directory visible within a normal desktop first viewport. A section label `Our apps` and a brief right-aligned `Policies & support` descriptor. One full-width app panel for AlignerDiary. Header row contains the monogram, app name, and factual description `A personal record of your aligner journey.` derived from the existing app-purpose paragraph.
4. Inside that panel, three equally weighted document links in a desktop row. Each is a real anchor with an understated icon, descriptive title, short caption, and arrow. Titles: `Privacy Policy`, `Terms of Use`, `Support`. Captions: `How your information is handled.`, `Guidelines for using the app.`, `Contact details and help.` Preserve the current relative paths. Use a clear hover treatment and visible keyboard focus. Avoid app-store badges, invented product status, dates, or platform claims.
5. Compact contact strip below the directory: `Need a hand?` with a sentence directing visitors to the support page for their app. Link back to the app directory as `Find app support`, rather than inventing a shared email address. Do not duplicate a large promotional card.
6. Minimal footer with site name and the existing copyright wording. Subtle divider and generous whitespace finish the page.

## Responsive and accessible behavior

- At narrow widths, use 20 px page gutters, a headline around 40 px, and stack the three document links vertically.
- Keep the site identity and navigation legible at 320 px; allow header wrapping if needed.
- Use semantic header/nav/main/section/article/footer elements, one h1, descriptive link names, and a visible-on-focus skip link.
- Decorative SVGs are hidden from assistive technologies. Keyboard focus has a visible offset outline.
- Avoid horizontal scrolling at 320/375 px and at increased text size. Interactive targets should be at least 44 px in practical dimensions.
- Respect reduced-motion preferences. Main content and navigation must work with JavaScript disabled and without external network access.

## Document pages and templates

Apply the same identity, palette, spacing, favicon, and footer to all six existing document and template pages. Provide a small `All apps` breadcrumb or back link above the document. Set the active Privacy/Terms/Support link with `aria-current="page"`. Keep article typography calm and readable, with clear heading hierarchy and a narrow line length.

Preserve the existing article text, app name, policy dates, email placeholders, and template tokens exactly; do not edit legal meaning or invent contact details. Existing `YOUR_EMAIL` values are a known publication prerequisite and must be explicitly documented in README/PROJECT. Do not treat these as verified working email contacts. Template pages should use the same layout and remain absent from the homepage directory.

## Maintenance and delivery

- README should describe this folder's actual purpose, structure, direct-open and local-server preview options, adding another app, publishing to GitHub Pages, stable per-app URLs, and the pre-publication content checks already present.
- Add concise AGENTS.md and PROJECT.md for ongoing maintenance; PROJECT.md should point to this design, document authoritative content sources, and clearly distinguish intended hosting from deployed hosting.
- Future apps are added by copying the template folder and duplicating the homepage app panel. Do not add unused automation or competing data sources.
- Deliver the local implementation and preview. Deployment is outside this request.

## Acceptance

- Homepage presents the single real app with three correct document links and a polished compact composition.
- The three AlignerDiary documents and three templates share the new visual language and retain their original article wording.
- Existing relative URLs work both at a domain root and under a GitHub Pages repository path.
- Check local assets, links, anchors, headings, keyboard navigation, and desktop/mobile layout; report checks actually performed.
- No new runtime dependency or build requirement. No remote fonts, scripts, analytics, or invented product content.
