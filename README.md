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

The entire app follows Hallie’s CLOSER reference: rose-brown gradient canvas, wine navigation and actions, warm cream content cards and inputs, and locally bundled Asul display type, with DM Sans for compact body text. Shared CSS tokens cover Discover/search, product details, comparison/recommendations, Consultation, product picker and scanner, including hover, focus, selection and empty states. Product photography retains its original colors. The reference’s school/fashion questions are replaced with basic skincare preferences.

`tests/consultation.browser.mjs` exports `checkConsultation(page, baseUrl)` for Ego Browser. It checks real selections, step navigation, session/save/reset behavior, multiline escaping, search/comparison independence, and four tablet/desktop/phone layouts. Run separately from `npm test`.

`tests/theme.browser.mjs` exports `checkTheme(page, baseUrl)` for Ego Browser. It exercises and captures eleven page/modal states at four tablet/desktop/phone sizes, checking horizontal overflow and the shared visual system.

The shared GSAP motion language covers eight interaction types. These are action feedback, not whole-page transitions; all controls and navigation respond immediately.

| Surface | Trigger and feedback | Timing |
| --- | --- | --- |
| Product links and buttons throughout the app | Pointer/touch press or keyboard activation gently compresses and releases the image/control | 0.28s |
| Discover categories and search | Retained products move from their previous positions; new results appear in a short stagger; count/empty state confirms changes | 0.24–0.44s |
| Main navigation | The newly active entry draws and releases a short marker | 0.42s |
| Product details | Opening Read the label reveals its explanation rows in sequence; closing remains native and immediate | 0.25s + 0.04s/row |
| Product picker | Search results rearrange; confirming the first item briefly settles its image and outlines the selected comparison slot | 0.32–0.44s |
| Consultation | Selecting an answer draws its ring and check | 0.38s |
| Comparison | Completing or replacing a pair joins the two cards and briefly outlines them | 0.54s |
| Sample scanner | Corner marks focus and a single soft beam sweeps across the sample | 0.84s |

Reduced-motion settings use complete static states. Scoped contexts cancel before rerender, reset, modal close, preference changes, or HMR disposal. No ongoing floating effects or hover dependency. Result position measurements account for scaled desktop iPad previews.

`tests/motion.browser.mjs` checks the original questionnaire/pair/scanner feedback. `tests/motion-coverage.browser.mjs` checks the added pointer/keyboard press, category/search reflow, navigation, glossary, picker confirmation, rapid updates/cancellation, reduced motion, and stable document listener counts. Both export check functions for an Ego Browser Page and run separately from `npm test`.

## Layout

The app always opens with an **1180 × 820 CSS pixel landscape iPad canvas**, including direct links and refreshes. Portrait iPads, narrow phones, and tall desktop windows uniformly shrink that same canvas to fit; viewport shape and pointer type never switch it to portrait. There is no orientation selector. At widths of 700px and above the frame keeps a 48px fitting margin; smaller windows use all available width. Scaling caps at 1.

The navigation order is Consultation, Discover, Scan, Compare; the initial route remains Discover. The header and 96px navigation rail stay in place while the main content scrolls. The logical landscape layout retains four product columns and the two-column details/comparison views at every outer window size. Scan and product-picker dialogs share the app's measured bounds and CSS zoom, including when resized while open. Their dimmed backdrop stays inside the frame. A 1280 × 868 outer window displays the canvas at its full 1180 × 820 size.

`tests/landscape.browser.mjs` checks first visits and route refreshes at 900 × 800, 360 × 800, 820 × 1180, and 1280 × 868, plus real questionnaire/picker actions and scaled dialog alignment.

## Try the prototype

1. Search for `Rare Beauty`, `Rhode`, `Fenty`, or an ingredient. Filter by Blush, Lips, or skincare category.
2. Open any product for details and ingredient-origin labels (Natural, Synthetic, or Not specified when provenance is unclear). Korean ingredient terms remain an optional add-on on Beauty of Joseon products; try `쌀겨수`.
3. Open **Compare** and use its two **Add a product** slots to search for and select a pair.
4. Compare **Soft Pinch Liquid Blush** with **Pocket Blush** or **Cheeks Out Freestyle Cream Blush**. Once two distinct products are selected, the bottom GlowGuide card randomly chooses A or B and displays that product’s name. A is the left slot, B the right. Each pair keeps its choice for the current page session; changing the pair draws a choice for the new pair, and removing either product hides the card. This is predefined prototype behavior, not product analysis or an AI service.
5. Select **Scan**, choose a sample thumbnail, and use **Scan this sample** to open its product information. Scanning and Discover never add products to Compare or change an existing pair.

6. Open **Consultation** to step through the customer’s skin type, skincare concerns (multiple choices), preferred texture, and optional additional notes. Answers start blank and can be skipped. **Back / Next** retain answers; **New customer** clears the questionnaire and returns to step one without changing product searches or comparisons. **Submit** shows “Saved” for the current session; editing an answer clears that feedback. Answers, step position, and notes survive navigation, and clear on refresh. There is no server save, diagnosis, or generated response.

The scanner is a guided simulation. Product data and recommendation text are predefined; no camera, recognition API, or AI service is connected. Ten independent products are included: two each from Rare Beauty, Rhode, and Fenty Beauty, plus four from Beauty of Joseon. Selections last for the current page session and reset on reload.

## Project structure

- `src/catalog.ts`: product records, search, pair selection, recommendation logic.
- `src/main.ts`: home, detail, comparison, picker, and scanner interactions.
- `src/style.css`: responsive visual design.
- `src/motion.ts`: bounded GSAP interaction contexts and reduced-motion cleanup.
- `src/pair-suggestion.ts`: session-stable random comparison choice.
- `src/icons.ts`: small line-icon set.
- `public/images/`: local product photographs.
- `tests/catalog.test.ts`: core search and comparison behavior.

## Sources

Product summaries and photos come from the official Beauty of Joseon pages for [Dynasty Cream](https://beautyofjoseon.com/products/dynasty-cream), [Glow Serum](https://beautyofjoseon.com/products/glow-serum-propolis-niacinamide), [Red Bean Water Gel](https://beautyofjoseon.com/products/red-bean-water-gel), and [Green Plum Refreshing Cleanser](https://beautyofjoseon.com/products/green-plum-refreshing-cleanser). Reviewed October 5, 2026. The Korean glossary contains authored example terms; it is not OCR output. Product image rights belong to their respective brands. This sample collection does not assert store availability.

Additional official product sources (reviewed October 5, 2026):

- Rare Beauty: [Soft Pinch Liquid Blush — Hope](https://www.rarebeauty.com/products/soft-pinch-liquid-blush?variant=43734829695111), [Soft Pinch Tinted Lip Oil — Hope](https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil?variant=43734835069063).
- Rhode: [Pocket Blush — Piggy](https://www.rhodeskin.com/products/pocket-blush-piggy), [Peptide Lip Treatment — Unscented](https://www.rhodeskin.com/products/peptide-lip-treatment).
- Fenty Beauty: [Cheeks Out Freestyle Cream Blush — Petal Poppin](https://fentybeauty.com/products/cheeks-out-freestyle-cream-blush-petal-poppin), [Gloss Bomb Universal Lip Luminizer — Fenty Glow](https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-fenty-glow).


## Product prices

Prices are static US regular list prices in USD, checked against the official store’s matching size and shade on October 6, 2026. They appear on Discover, product details, the Compare picker, and the comparison table. Temporary discounts, tax, and shipping are excluded; prices do not update live.

| Product | Sample size / shade | USD list price |
| --- | --- | ---: |
| Rare Beauty — [Soft Pinch Liquid Blush](https://www.rarebeauty.com/products/soft-pinch-liquid-blush?variant=43734829695111) | 7.5 ml · Hope · Nude mauve | $25.00 |
| Rhode — [Pocket Blush](https://www.rhodeskin.com/products/pocket-blush-piggy) | 5.3 g · Piggy · Baby pink | $25.00 |
| Fenty Beauty — [Cheeks Out Freestyle Cream Blush](https://fentybeauty.com/products/cheeks-out-freestyle-cream-blush-petal-poppin) | 3 g · Petal Poppin | $28.00 |
| Rare Beauty — [Soft Pinch Tinted Lip Oil](https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil?variant=43734835069063) | 3 ml · Hope · Nude mauve | $24.00 |
| Rhode — [Peptide Lip Treatment](https://www.rhodeskin.com/products/peptide-lip-treatment) | 10 ml · Clear | $20.00 |
| Fenty Beauty — [Gloss Bomb Universal Lip Luminizer](https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-fenty-glow) | 9 ml · Fenty Glow | $23.00 |
| Beauty of Joseon — [Dynasty Cream](https://beautyofjoseon.com/products/dynasty-cream) | 50 ml | $24.00 |
| Beauty of Joseon — [Glow Serum](https://beautyofjoseon.com/products/glow-serum-propolis-niacinamide) | 30 ml | $17.00 |
| Beauty of Joseon — [Red Bean Water Gel](https://beautyofjoseon.com/products/red-bean-water-gel) | 100 ml | $18.00 |
| Beauty of Joseon — [Green Plum Cleanser](https://beautyofjoseon.com/products/green-plum-refreshing-cleanser) | 100 ml | $13.00 |

## Deploy to Vercel

Production project: `west0ngs-projects/glowguide`. The project uses `npm ci`, `npm run build`, and the `dist` output directory configured in `vercel.json`.

For subsequent updates from this linked local checkout:

```sh
vercel deploy --prod --scope west0ngs-projects
```

On a fresh checkout, authenticate and link first with `vercel link --yes --project glowguide --scope west0ngs-projects`. The `.vercel` link is ignored by Git. `.vercelignore` excludes workspace/agent notes, test files, local output, and environment files. Hash routes do not require server rewrites. This is a manual CLI deployment; no Git repository is connected for automatic updates.
