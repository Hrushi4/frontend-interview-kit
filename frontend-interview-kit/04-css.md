# 04 — CSS

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. Three ways to add CSS?**
Inline `style=""`, internal `<style>`, external `<link rel="stylesheet">`. External is cacheable and preferred.

**2. Selector types?**
Element `p`, class `.btn`, id `#main`, attribute `[type="email"]`, universal `*`, descendant `a b`, child `a > b`, adjacent sibling `a + b`, general sibling `a ~ b`, pseudo-class `:hover`, pseudo-element `::before`, grouping `h1, h2`.

**3. The box model?**
content → padding → border → margin. Default `box-sizing: content-box` adds padding/border to the declared width.

**4. Why `box-sizing: border-box` globally?**
Width includes padding and border, so layouts are predictable.
```css
*, *::before, *::after { box-sizing: border-box; }
```

**5. Margin vs padding?**
Padding is inside the border (gets background); margin is outside (transparent, can collapse, can be negative).

**6. `display` values?**
`block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `none`, `contents`, `flow-root`, `table`.

**7. `inline` vs `inline-block`?**
inline ignores width/height and vertical margins; inline-block flows inline but respects box dimensions.

**8. Units — absolute vs relative?**
Absolute: `px`. Relative: `%` (of parent), `em` (of element's font-size, compounds), `rem` (of root font-size), `vw`/`vh` (viewport), `ch` (width of "0"), `fr` (grid fraction).

**9. `rem` vs `em` — when to use which?**
rem for font sizes and spacing scale (predictable, respects user font settings). em for things that should scale with the component's own font (button padding, icon size).

**10. Colours formats?**
Named, hex `#0a7`, `rgb()`, `hsl()`, modern `oklch()` (perceptually uniform — good for design tokens), alpha via `/ 50%`.

**11. `position` values?**
- `static` — default flow.
- `relative` — offset from its normal spot; becomes containing block for absolute children.
- `absolute` — removed from flow; positioned relative to nearest positioned ancestor.
- `fixed` — relative to viewport (unless an ancestor has transform/filter).
- `sticky` — acts relative until a threshold, then sticks within its scroll container/parent.

**12. `display: none` vs `visibility: hidden` vs `opacity: 0`?**
none removes from layout and accessibility tree. hidden keeps space, not focusable/announced. opacity 0 keeps space and remains interactive and announced.

**13. Pseudo-classes vs pseudo-elements?**
Pseudo-classes select a state: `:hover`, `:focus-visible`, `:checked`, `:disabled`, `:nth-child(2n)`, `:first-of-type`, `:not()`. Pseudo-elements create/target parts: `::before`, `::after`, `::placeholder`, `::selection`, `::marker`.

**14. Centre text vs centre a block?**
Text: `text-align: center`. Block with known width: `margin-inline: auto`. Anything: `display:grid; place-items:center`.

**15. Overflow values?**
`visible`, `hidden`, `scroll`, `auto`, `clip`. `text-overflow: ellipsis` needs `overflow:hidden; white-space:nowrap`.

**16. What is the cascade?**
Order of precedence: origin & importance (user-agent < user < author; `!important` flips) → cascade layers → specificity → source order (last wins).

**17. Inheritance — which properties inherit?**
Typography (`color`, `font-*`, `line-height`, `visibility`) inherits; box properties (`margin`, `padding`, `border`, `background`) don't. Force with `inherit`, reset with `initial`/`unset`/`revert`.

**18. Specificity calculation?**
(inline, ids, classes/attributes/pseudo-classes, elements/pseudo-elements). `#nav .item a` = (0,1,1,1). Higher left column wins. `!important` overrides all non-important.

**19. `:is()`, `:where()`, `:not()` specificity?**
`:is()`/`:not()` take the specificity of their most specific argument. `:where()` is always zero — ideal for library/base styles that should be easy to override.

**20. Media query basics?**
```css
@media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (prefers-color-scheme: dark) { ... }
@media (hover: hover) and (pointer: fine) { ... }
```

---

## 🟡 Level 2 — Intermediate — Layout

**21. Flexbox core properties?**
Container: `flex-direction`, `flex-wrap`, `justify-content` (main axis), `align-items` (cross axis), `align-content`, `gap`. Items: `flex-grow`, `flex-shrink`, `flex-basis`, `align-self`, `order`.

**22. `flex: 1` vs `flex: auto` vs `flex: none`?**
`1` = `1 1 0%` (equal share ignoring content size); `auto` = `1 1 auto` (grow from content size); `none` = `0 0 auto` (rigid).

**23. Why does a flex item overflow with long text?**
Flex items have `min-width: auto`. Fix with `min-width: 0` (or `overflow:hidden`) on the item.

**24. Grid core concepts?**
`grid-template-columns/rows`, `fr`, `repeat()`, `minmax()`, `gap`, `grid-template-areas`, line-based placement `grid-column: 1 / -1`, implicit tracks via `grid-auto-rows`.

**25. Responsive grid without media queries?**
```css
.cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
```

**26. `auto-fit` vs `auto-fill`?**
Both create as many tracks as fit. auto-fill keeps empty tracks; auto-fit collapses them so items stretch.

**27. Named grid areas example (dashboard)?**
```css
.app { display:grid; grid-template: "nav header" 64px "nav main" 1fr / 240px 1fr; min-height:100dvh; }
.nav { grid-area: nav } .header { grid-area: header } .main { grid-area: main }
```

**28. Flexbox vs Grid — when?**
Flex: one-dimensional, content-driven (toolbars, nav items, centring). Grid: two-dimensional, layout-driven (page shells, card galleries, forms aligned in columns). Mixed use is normal.

**29. Holy-grail / sticky footer layout?**
`body { min-height:100dvh; display:grid; grid-template-rows:auto 1fr auto; }`.

**30. Margin collapsing?**
Adjacent vertical margins of block elements (siblings, or parent/first child without border/padding) combine into the larger one. Doesn't happen in flex/grid containers or with BFC.

**31. Block formatting context (BFC) — how to create and why?**
`display: flow-root`, `overflow` not visible, floats, absolutely positioned, flex/grid items. Contains floats, stops margin collapse with children, prevents wrapping around floats.

**32. Floats — still relevant?**
Mostly for wrapping text around images. Clear with `clear: both` or parent `display: flow-root`.

**33. Stacking context and z-index?**
z-index only competes within the same stacking context. New contexts are created by positioned elements with z-index, `opacity < 1`, `transform`, `filter`, `will-change`, `isolation: isolate`, `position: fixed/sticky`, flex/grid children with z-index. Explains "z-index: 9999 still behind".

**34. `isolation: isolate`?**
Creates a stacking context without side effects — tame z-index wars inside components.

**35. Sticky not working — common causes?**
Ancestor with `overflow: hidden/auto`, no `top` value, parent too short, or element inside a flex container with stretch alignment.

---

## 🟡 Intermediate — Responsive & Modern CSS

**36. Mobile-first approach?**
Base styles for small screens, add `min-width` queries for larger ones — less override CSS, better on low-end phones.

**37. Fluid typography with `clamp()`?**
`font-size: clamp(1rem, 0.9rem + 0.6vw, 1.5rem);` (min, preferred, max).

**38. Viewport units `vh` vs `svh`/`lvh`/`dvh`?**
`100vh` on mobile includes area behind browser UI. `svh` = smallest, `lvh` = largest, `dvh` = dynamic (updates as UI shows/hides).

**39. Container queries?**
```css
.card-wrap { container-type: inline-size; }
@container (min-width: 420px) { .card { display:grid; grid-template-columns: 120px 1fr; } }
```
Components adapt to their slot, not the viewport — perfect for design systems.

**40. `:has()` relational selector examples?**
`.field:has(input:invalid) label { color: red }`, `.card:has(img) { padding-top:0 }`, `body:has(dialog[open]) { overflow:hidden }`.

**41. CSS custom properties (variables)?**
Defined on any element, inherit, readable/writable via JS, used for theming.
```css
:root { --brand: oklch(60% .15 160); --radius: 8px; }
[data-theme="dark"] { --bg: #111; }
.btn { background: var(--brand); border-radius: var(--radius); }
```

**42. Variables vs Sass variables?**
Sass variables are compile-time; CSS variables are runtime, cascade-aware, and can change per tenant/theme without rebuild.

**43. `@property`?**
Registers a typed custom property — enables animating gradients/colours stored in variables.

**44. Native CSS nesting?**
```css
.card { padding:1rem; & .title { font-weight:600 } &:hover { box-shadow: var(--shadow) } }
```

**45. Logical properties?**
`margin-inline-start`, `padding-block`, `inset-inline` — adapt automatically for RTL languages.

**46. `aspect-ratio`?**
`aspect-ratio: 16/9` replaces the padding-top hack for video tiles and thumbnails.

**47. `object-fit` / `object-position`?**
`cover` crops to fill, `contain` letterboxes — for `<img>` and `<video>` in fixed boxes.

**48. Dark mode strategy?**
Tokens as CSS variables; default from `prefers-color-scheme`; user override via `data-theme` attribute; `color-scheme: light dark` so form controls and scrollbars adapt.

**49. `@supports` feature queries?**
`@supports (container-type: inline-size) { ... }` — progressive enhancement.

**50. Cascade layers?**
```css
@layer reset, base, components, utilities;
@layer components { .btn { ... } }
```
Later layers win regardless of specificity; unlayered styles beat layered. Great for taming third-party CSS.

---

## 🟡 Intermediate — Animation & Effects

**51. Transition vs animation?**
Transitions animate between two states on change. Keyframe animations run independently, loop, have multiple steps.

**52. Which properties are cheap to animate?**
`transform` and `opacity` — handled by the compositor. Animating `width`, `height`, `top`, `left`, `margin` triggers layout every frame.

**53. `will-change`?**
Hints the browser to promote an element to its own layer. Apply just before animation, remove after; overuse wastes memory.

**54. Reduced motion?**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

**55. View Transitions API?**
`document.startViewTransition(() => updateDOM())` animates between DOM states; cross-document transitions for MPAs.

**56. Scroll-driven animations?**
`animation-timeline: scroll()` / `view()` — progress bars and reveal effects without JS scroll listeners.

**57. Scroll snap?**
```css
.carousel { scroll-snap-type: x mandatory; overflow-x:auto; display:flex; }
.slide { scroll-snap-align: center; flex: 0 0 100%; }
```

---

## 🔴 Level 3 — Advanced

**58. How does the browser render CSS — the pipeline?**
Style calculation → layout → paint → composite. Know what each property triggers (csstriggers-style thinking).

**59. Layout thrashing in CSS context?**
Reading layout (`offsetHeight`) after writing styles forces synchronous layout. Batch reads, then writes.

**60. `contain` property?**
`contain: layout paint style` isolates a subtree so changes don't affect the rest of the page. `content-visibility: auto` + `contain-intrinsic-size` skips rendering off-screen sections — huge wins on long lists/pages.

**61. Critical CSS?**
Inline the styles needed for above-the-fold content; load the rest asynchronously. Frameworks/SSR tools automate this.

**62. CSS architecture approaches?**
BEM naming, OOCSS, ITCSS layering, utility-first (Tailwind), CSS Modules (scoped per file), CSS-in-JS (styled-components, Emotion), zero-runtime CSS-in-JS (vanilla-extract, Panda, Linaria).

**63. Runtime CSS-in-JS trade-offs?**
Pros: dynamic styling, co-location, theming. Cons: runtime cost, larger JS, style injection during render, friction with React Server Components and streaming. Trend: zero-runtime or utility CSS.

**64. CSS Modules — how does scoping work?**
Build step rewrites class names to unique hashes; `composes` for reuse; `:global()` escape hatch.

**65. Design tokens pipeline?**
Tokens defined once (JSON/Figma variables) → generated to CSS variables, TS constants and Tailwind theme (e.g., Style Dictionary) → consumed by components.

**66. Subgrid?**
`grid-template-columns: subgrid` lets nested items align to parent tracks — aligned card headers/footers across a row.

**67. Anchor positioning?**
Position tooltips/popovers relative to an anchor element in pure CSS (`anchor-name`, `position-anchor`, `anchor()`); check browser support before relying on it.

**68. Font loading and CLS?**
`font-display: swap` shows fallback immediately (possible shift); `optional` avoids late swaps. Match fallback metrics with `size-adjust`, `ascent-override`. Preload critical fonts; self-host woff2; subset.

**69. Writing maintainable responsive breakpoints?**
Few content-driven breakpoints, tokens for them, prefer container queries and intrinsic layouts (`minmax`, `clamp`) over many fixed breakpoints.

**70. Print styles?**
`@media print { nav, .no-print { display:none } a::after { content: " (" attr(href) ")" } }`, `break-inside: avoid` for cards/tables.

**71. Specificity wars in a large codebase — how to fix?**
Introduce cascade layers, flatten selectors to single classes, ban IDs for styling, use `:where()` for base styles, lint with Stylelint rules on max specificity.

**72. Accessible focus styles?**
```css
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
```
Never `outline: none` without a replacement; ensure 3:1 contrast against surroundings.

**73. Forced colors / high contrast mode?**
`@media (forced-colors: active)` — use system colours (`CanvasText`, `ButtonText`); borders instead of background-only indicators.

---

## 🧩 Level 4 — Scenario-based

**74. A modal appears behind the header despite `z-index: 9999`.**
The modal is inside a parent that creates a stacking context (transform/opacity/z-index). Render it in a portal at the body level, or use `<dialog>`/popover which renders in the top layer.

**75. A flex row overflows on mobile because of a long email address.**
`min-width: 0` on the flex child + `overflow-wrap: anywhere` or `text-overflow: ellipsis`.

**76. `position: sticky` table header doesn't stick.**
An ancestor has `overflow: hidden`, or `top` isn't set. Put the scroll on the table wrapper and apply `top:0` to `th`.

**77. 100vh section is cut off on iPhone.**
Use `100dvh` (with `100vh` fallback first).

**78. Text over a video tile isn't readable.**
Add a gradient scrim behind text, check 4.5:1 contrast, use text-shadow minimally.

**79. Theme switch flashes the wrong theme on load.**
Set `data-theme` from a tiny inline script in `<head>` before CSS paints (reading the saved preference), and set `color-scheme`.

**80. CSS bundle is 600 KB, most unused.**
Code-split CSS per route, remove dead component libraries, PurgeCSS/Tailwind content scanning, audit third-party CSS, critical CSS inline.

**81. Animations stutter on low-end Android.**
Animate transform/opacity only, avoid box-shadow/blur animations, reduce layer count, respect reduced motion, test with CPU throttling.

**82. Design system must support 5 tenants' brand colours without rebuilds.**
Semantic tokens (`--color-primary`, `--color-surface`) on `:root`, tenant values injected at boot from config; components only use semantic tokens; verify contrast per tenant palette.

**83. Build a responsive video grid for 1–12 participants.**
```css
.grid { display:grid; gap:8px; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
.tile { aspect-ratio:16/9; background:#000; border-radius:12px; overflow:hidden; position:relative; }
.tile video { width:100%; height:100%; object-fit:cover; }
.tile[data-speaking="true"] { outline: 3px solid var(--speaking); }
```
Spotlight layout: switch container class to a 1-big + filmstrip grid.

---

## 🎯 From Your Resume

**84. "How did you theme BpoBox for multiple tenants with Radix?"**
Radix is unstyled → components styled with semantic CSS variables → tenant config sets variables at runtime → state styles via Radix data attributes (`[data-state="open"]`, `[data-highlighted]`).

**85. "How did you keep the InterpretIQ call controls accessible over live video?"**
Solid control-bar background (not transparent over video), 3:1 focus outline, icons with labels/tooltips, large tap targets (≥ 44px), visible state for muted/camera-off beyond colour (icon change + label).

**86. "Responsive design for tablets in hospitals?"**
Touch targets, landscape/portrait layouts with container queries, `dvh` for full-height call view, safe-area insets (`env(safe-area-inset-bottom)`) for installed PWA mode.
