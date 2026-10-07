# GlowGuide

An iPad browser prototype for beauty consultants. Built for the ACAD 325 school project.

Live prototype: [GlowGuide](https://glowguide-xi.vercel.app/).

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For an iPad on the same reachable network, use the printed Network URL. The dev server must remain running.

```sh
npm run check
npm test
npm run build
npm run preview
```

Node 22.13+ or 24+ is recommended for the TypeScript test runner. The current workspace was verified with Node 23.9.

For browser layout checks, `tests/dialog-layout.browser.mjs` exports `checkDialogLayout(page, baseUrl)`, using an Ego Browser Page and a URL that defaults to `http://localhost:5173/`. It verifies Scan and picker bounds across seven desktop/tablet/phone sizes, resizing while open, keyboard dismissal/focus, and scan/comparison independence. The caller creates and finishes the browser task space. This browser check runs separately from `npm test`.

## Layout

The reference canvas is the 11-inch iPad: **820 × 1180 CSS pixels** in portrait and **1180 × 820** in landscape. On touch devices, the app fills the available browser viewport, including safe-area spacing. Portrait uses three product columns; landscape uses four, with larger text and controls throughout.

On desktop, the preview keeps the iPad proportions and scales uniformly to fit the window, choosing the orientation that suits its aspect ratio. The header and navigation stay in place while the content scrolls. At app widths of 768px and above, Discover, Scan, Compare, and Consultation sit in a 96px left navigation rail; narrower layouts use bottom navigation. The selected page has a pale pink background in the rail, and Scan opens the existing scanner dialog. Smaller touch screens retain a two-column fallback. Scan and product-picker dialogs use the same canvas bounds and scale as the app; their dimmed backdrop stays inside the frame, including while resizing. Narrow screens keep the product picker as a bottom sheet.

## Try the prototype

1. Search for `Rare Beauty`, `Rhode`, `Fenty`, or an ingredient. Filter by Blush, Lips, or skincare category.
2. Open any product for details and ingredient-origin labels (Natural, Synthetic, or Not specified when provenance is unclear). Korean ingredient terms remain an optional add-on on Beauty of Joseon products; try `쌀겨수`.
3. Open **Compare** and use its two **Add a product** slots to search for and select a pair.
4. Compare **Soft Pinch Liquid Blush** with **Pocket Blush** or **Cheeks Out Freestyle Cream Blush**.
5. Select **Scan**, choose a sample thumbnail, and use **Scan this sample** to open its product information. Scanning and Discover never add products to Compare or change an existing pair.

6. Open **Consultation** to enter a customer’s usual routine, products used, skincare habits/preferences, and additional notes. Inputs stay available when switching pages in the same session; refreshing clears them. **Submit** is a placeholder and does not send, clear, or generate anything.

The scanner is a guided simulation. Product data and recommendation text are predefined; no camera, recognition API, or AI service is connected. Ten independent products are included: two each from Rare Beauty, Rhode, and Fenty Beauty, plus four from Beauty of Joseon. Selections last for the current page session and reset on reload.

## Project structure

- `src/catalog.ts`: product records, search, pair selection, recommendation logic.
- `src/main.ts`: home, detail, comparison, picker, and scanner interactions.
- `src/style.css`: responsive visual design.
- `src/icons.ts`: small line-icon set.
- `public/images/`: local product photographs.
- `tests/catalog.test.ts`: core search and comparison behavior.

## Sources

Product summaries and photos come from the official Beauty of Joseon pages for [Dynasty Cream](https://beautyofjoseon.com/products/dynasty-cream), [Glow Serum](https://beautyofjoseon.com/products/glow-serum-propolis-niacinamide), [Red Bean Water Gel](https://beautyofjoseon.com/products/red-bean-water-gel), and [Green Plum Refreshing Cleanser](https://beautyofjoseon.com/products/green-plum-refreshing-cleanser). Reviewed October 5, 2026. The Korean glossary contains authored example terms; it is not OCR output. Product image rights belong to their respective brands. This sample collection does not assert store availability.

Additional official product sources (reviewed October 5, 2026):

- Rare Beauty: [Soft Pinch Liquid Blush — Hope](https://www.rarebeauty.com/products/soft-pinch-liquid-blush?variant=43734829695111), [Soft Pinch Tinted Lip Oil — Hope](https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil?variant=43734835069063).
- Rhode: [Pocket Blush — Piggy](https://www.rhodeskin.com/products/pocket-blush-piggy), [Peptide Lip Treatment — Unscented](https://www.rhodeskin.com/products/peptide-lip-treatment).
- Fenty Beauty: [Cheeks Out Freestyle Cream Blush — Petal Poppin](https://fentybeauty.com/products/cheeks-out-freestyle-cream-blush-petal-poppin), [Gloss Bomb Universal Lip Luminizer — Fenty Glow](https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-fenty-glow).


## Deploy to Vercel

Production project: `west0ngs-projects/glowguide`. The project uses `npm ci`, `npm run build`, and the `dist` output directory configured in `vercel.json`.

For subsequent updates from this linked local checkout:

```sh
vercel deploy --prod --scope west0ngs-projects
```

On a fresh checkout, authenticate and link first with `vercel link --yes --project glowguide --scope west0ngs-projects`. The `.vercel` link is ignored by Git. `.vercelignore` excludes workspace/agent notes, test files, local output, and environment files. Hash routes do not require server rewrites. This is a manual CLI deployment; no Git repository is connected for automatic updates.
