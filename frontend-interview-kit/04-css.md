# 04 — CSS

**How this file is organised**

- **Part A — Understand the topic:** how CSS works (the cascade, the box model, layout systems and rendering), explained simply.
- **Part B — Interview questions and answers:** Basic → Layout → Responsive and Modern CSS → Animation → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is CSS?

CSS (Cascading Style Sheets) controls how HTML looks: colours, fonts, spacing, layout and animation. A CSS rule has a **selector** (which elements) and **declarations** (what to change):

```css
.btn-primary {            /* selector */
  background: #0b5fff;    /* declaration: property: value; */
  padding: 0.5rem 1rem;
}
```

### The "C" in CSS: the cascade

Many rules can target the same element, and the **cascade** decides which one wins. It checks these in order:

1. **Origin and importance:** browser defaults < your styles. `!important` reverses the order.
2. **Cascade layers** (`@layer`): later layers win.
3. **Specificity:** more specific selectors win. IDs beat classes, which beat elements.
4. **Source order:** if everything else is equal, the rule written last wins.

**Inheritance** is a separate idea. Some properties, mostly text ones like `color` and `font-family`, pass down from parent to child automatically.

### The box model

Every element is a rectangular box made of four layers:

```text
+------------------- margin -------------------+
|  +--------------- border ----------------+   |
|  |  +----------- padding -------------+  |   |
|  |  |          content               |  |   |
|  |  +--------------------------------+  |   |
|  +--------------------------------------+   |
+----------------------------------------------+
```

By default (`content-box`), `width` sets only the content, so padding and border make the box bigger. With `box-sizing: border-box`, `width` includes padding and border. Almost every project sets this globally.

### Layout systems

- **Normal flow:** block elements stack vertically and inline elements flow like text.
- **Flexbox:** lays out items in **one direction** (a row or a column). Great for toolbars, navbars and centring.
- **Grid:** lays out in **two dimensions** (rows and columns). Great for page shells, dashboards and card galleries.
- **Positioning:** `relative`, `absolute`, `fixed` and `sticky` take elements out of the normal flow or pin them.

### Responsive design

Responsive design means one codebase that works on phones, tablets and desktops. The main tools:

- **Media queries:** change styles by viewport size or user preference (dark mode, reduced motion).
- **Fluid units:** `%`, `rem`, `vw`, `fr`, `clamp()`.
- **Container queries:** change a component's styles based on the size of its *container*, not the whole screen.

### How CSS affects performance

When styles change, the browser may need to redo **layout** (expensive), **paint** (moderate) or only **composite** (cheap, done on the GPU). Animating `transform` and `opacity` only needs compositing, which is why smooth animations use them.

### Why interviewers ask about CSS

Interviewers want to know whether you can build layouts without fighting the browser. Can you debug "why is my z-index not working" or "why is this overflowing"? Can you design a maintainable, themeable styling system for a large app? For you, they'll focus on multi-tenant theming (BpoBox) and accessible video UI (InterpretIQ).

---

## Part B — Interview Questions and Answers

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What are the three ways to add CSS?**

**Short answer:** Inline (`style="..."`), internal (a `<style>` tag) and external (`<link rel="stylesheet">`). External is preferred.

**Explanation:** External files are cached and reused across pages. Inline styles have the highest specificity and can't use media queries or pseudo-classes, so keep them for truly dynamic values set by JavaScript.

**Example:**

```html
<link rel="stylesheet" href="/styles.css">
<div class="progress" style="--value: 42%"></div>  <!-- dynamic value only -->
```

**Say it like this:** "I keep styles in external files or modules for caching and maintainability, and use inline styles only for dynamic values, usually by setting a CSS variable."

---

**Q2. What types of selectors are there?**

**Short answer:** Element, class, ID, attribute, descendant, child, sibling, pseudo-class and pseudo-element selectors.

**Explanation:**

| Selector | Example | Matches |
|---|---|---|
| Element | `p` | all paragraphs |
| Class | `.btn` | class="btn" |
| ID | `#main` | id="main" |
| Attribute | `[type="email"]` | email inputs |
| Descendant | `nav a` | any `a` inside `nav` |
| Child | `ul > li` | direct children |
| Adjacent sibling | `h2 + p` | the `p` right after an `h2` |
| General sibling | `h2 ~ p` | all later `p` siblings |
| Pseudo-class | `a:hover` | a state |
| Pseudo-element | `p::first-line` | a part |

**Example:** `.call-list > li[data-status="missed"]:hover` combines child, attribute and pseudo-class selectors.

**Say it like this:** "I mostly use single class selectors to keep specificity low, with attribute selectors for state, like `[data-state='open']`."

---

**Q3. Explain the box model.**

**Short answer:** Every element is a box of content → padding → border → margin. With the default `content-box`, padding and border are added to the declared width.

**Explanation:** That default makes sizes hard to reason about, which is why most projects switch to `border-box`, where `width` includes padding and border.

**Example:**

```css
.box { width: 200px; padding: 20px; border: 5px solid; }
/* content-box: visible width = 200 + 40 + 10 = 250px */
/* border-box:  visible width = 200px */
```

**Say it like this:** "Every element is content, padding, border and margin. I set `box-sizing: border-box` globally so `width` means the full visible width."

---

**Q4. Why set `box-sizing: border-box` globally?**

**Short answer:** So `width` and `height` include padding and border, which makes layout maths predictable.

**Explanation:** With `content-box`, two 50%-wide columns with padding overflow their row. With `border-box` they fit exactly. Pseudo-elements are included so decorative boxes behave the same.

**Example:**

```css
*, *::before, *::after { box-sizing: border-box; }
```

**Say it like this:** "It's the first rule in every reset I write, because then 50% plus padding still means 50%."

---

**Q5. Margin vs padding?**

**Short answer:** Padding is space inside the border; margin is space outside it.

**Explanation:** Padding shows the element's background and increases the clickable area. Margin is transparent, can be negative, and vertical margins can collapse. In flex and grid layouts, `gap` is often better than margins.

**Example:**

```css
.btn { padding: 0.5rem 1rem; }      /* bigger click target */
.card + .card { margin-top: 1rem; } /* space between cards */
```

**Say it like this:** "Padding is inside and clickable, margin is outside and spacing. For spacing between items in flex or grid I prefer `gap`."

---

**Q6. What are the common `display` values?**

**Short answer:** `block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `none`, `contents` and `flow-root`.

**Explanation:** `contents` removes the element's own box but keeps its children (careful: it can remove semantics from some elements). `flow-root` creates a new block formatting context, which contains floats.

**Example:**

```css
.toolbar { display: flex; }
.badge { display: inline-flex; align-items: center; }
.clearfix { display: flow-root; }
```

**Say it like this:** "Day to day I use flex and grid for layout, `inline-flex` for icon-and-text badges, and `flow-root` when I need to contain floats."

---

**Q7. `inline` vs `inline-block`?**

**Short answer:** `inline` ignores width, height and vertical margins; `inline-block` sits in a line of text but respects them.

**Explanation:** Use `inline-block` (or `inline-flex`) when something must flow with text but needs its own size and padding, like a badge or a pill.

**Example:**

```css
.pill { display: inline-block; padding: 2px 8px; border-radius: 999px; }
```

**Say it like this:** "Inline elements can't be sized; inline-block can. For a status pill inside a sentence I use inline-block or inline-flex."

---

**Q8. What units are there?**

**Short answer:** Absolute `px`, and relative units: `%`, `em`, `rem`, `vw`/`vh`, `ch` and `fr`.

**Explanation:** `%` is relative to the parent, `em` to the element's own font size (nested ems compound), `rem` to the root font size, `vw`/`vh` to the viewport, `ch` to the width of "0", and `fr` to free space in a grid.

**Example:**

```css
.article { max-width: 65ch; }                 /* readable line length */
.layout { grid-template-columns: 240px 1fr; } /* sidebar + rest */
h1 { font-size: 2rem; }
```

**Say it like this:** "I use `rem` for typography and spacing, `ch` for readable text widths, `fr` in grids, and `px` mainly for borders."

---

**Q9. When do you use `rem` and when `em`?**

**Short answer:** `rem` for font sizes and the spacing scale; `em` for things that should scale with the component's own text.

**Explanation:** `rem` respects the user's browser font setting, which is an accessibility win. `em` inside components makes padding grow with the component's font size.

**Example:**

```css
.btn { font-size: 1rem; padding: 0.5em 1em; }
.btn--large { font-size: 1.25rem; } /* padding scales automatically */
```

**Say it like this:** "I use `rem` for the global scale so users' font settings work, and `em` inside components so padding scales with the text."

---

**Q10. What colour formats are there?**

**Short answer:** Named colours, hex, `rgb()`, `hsl()` and the modern `oklch()`, with alpha written as `/ 50%`.

**Explanation:** `oklch()` is perceptually uniform: changing lightness looks consistent across hues, which makes it great for generating design-token palettes and predictable contrast.

**Example:**

```css
:root {
  --primary: oklch(60% 0.15 250);
  --primary-hover: oklch(55% 0.15 250);
  --overlay: rgb(0 0 0 / 50%);
}
```

**Say it like this:** "For design tokens I like `oklch`, because I can adjust lightness for hover or dark mode and the colour stays visually consistent."

---

**Q11. Explain the `position` values.**

**Short answer:** `static` (normal flow), `relative` (offset, keeps space), `absolute` (removed from flow, relative to the nearest positioned ancestor), `fixed` (relative to the viewport) and `sticky` (relative until it sticks at a threshold).

**Explanation:** `relative` also becomes the reference point for absolutely positioned children. `fixed` breaks if an ancestor has `transform` or `filter`, because that ancestor becomes the reference instead.

**Example:**

```css
.tile { position: relative; }
.tile .name-badge { position: absolute; bottom: 8px; left: 8px; }
.table thead th { position: sticky; top: 0; }
```

**Say it like this:** "The pattern I use most is a `relative` container with `absolute` overlays, like the name badge on a video tile, and `sticky` for table headers."

---

**Q12. `display: none` vs `visibility: hidden` vs `opacity: 0`?**

**Short answer:** `display: none` removes the element from layout and the accessibility tree; `visibility: hidden` keeps its space but hides it from everyone; `opacity: 0` keeps it in layout, clickable and readable by screen readers.

**Explanation:**

| | Takes space | Clickable | Screen readers |
|---|---|---|---|
| `display: none` | no | no | no |
| `visibility: hidden` | yes | no | no |
| `opacity: 0` | yes | yes | yes |

**Example:** A visually-hidden utility keeps text for screen readers only:

```css
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

**Say it like this:** "To hide something from everyone I use `display: none`. To hide it visually but keep it for screen readers I use a visually-hidden class, never `opacity: 0` alone."

---

**Q13. Pseudo-classes vs pseudo-elements?**

**Short answer:** Pseudo-classes (`:hover`, `:focus-visible`, `:checked`) select an element in a state; pseudo-elements (`::before`, `::placeholder`) target or create part of an element.

**Explanation:** Pseudo-classes use one colon, pseudo-elements two. `::before`/`::after` need a `content` property to appear and are good for decoration.

**Example:**

```css
.row:nth-child(even) { background: #f7f7f7; }
.required-label::after { content: " *"; color: var(--danger); }
```

**Say it like this:** "Pseudo-classes are about state, like hover or checked; pseudo-elements add or style parts, like a required asterisk."

---

**Q14. How do you centre things?**

**Short answer:** `text-align: center` for text, `margin-inline: auto` for a block with a width, and `display: grid; place-items: center` for anything.

**Explanation:** Grid's `place-items` centres both axes in one line. Flex with `justify-content` and `align-items` works too.

**Example:**

```css
.empty-state { display: grid; place-items: center; min-height: 300px; }
```

**Say it like this:** "My go-to is `display: grid; place-items: center`, which centres anything both ways in one line."

---

**Q15. What are the `overflow` values?**

**Short answer:** `visible`, `hidden`, `scroll`, `auto` and `clip`.

**Explanation:** `auto` shows scrollbars only when needed. `hidden` still allows programmatic scrolling and creates a scroll container (which can break `sticky`); `clip` doesn't. Truncation needs overflow combined with `text-overflow`.

**Example:**

```css
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
```

**Say it like this:** "I use `overflow: auto` for scroll areas, and the ellipsis pattern or line-clamp for long agent names and transcript previews."

---

**Q16. What is the cascade?**

**Short answer:** The algorithm that decides which rule wins: importance and origin, then cascade layers, then specificity, then source order.

**Explanation:** Browser defaults lose to your styles unless `!important` reverses things. Layers let you control precedence explicitly. Most real-world CSS bugs are specificity problems.

**Example:** `.btn { color: blue }` and later `.btn { color: red }`: red wins by source order. `#nav .btn { color: green }` beats both by specificity.

**Say it like this:** "When two rules conflict, the browser checks importance, then layers, then specificity, then order. I keep selectors flat so order and layers do the work."

---

**Q17. Which properties inherit?**

**Short answer:** Typography properties inherit (`color`, `font-*`, `line-height`, `text-align`, `visibility`); box properties don't (`margin`, `padding`, `border`, `background`, `width`).

**Explanation:** Use `inherit` to take the parent's value, `initial` for the spec default, `unset` to inherit if naturally inherited, and `revert` for the browser default.

**Example:**

```css
.card { color: var(--text); }      /* every paragraph inside inherits it */
button { font: inherit; }          /* buttons don't inherit font by default */
```

**Say it like this:** "Text styles inherit, box styles don't. A classic reset is `button { font: inherit }`, because form controls don't inherit fonts by default."

---

**Q18. How is specificity calculated?**

**Short answer:** As a score of (inline, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements), compared left to right.

**Explanation:** One ID beats any number of classes. `!important` beats all normal declarations, which is why it should be rare.

**Example:**

| Selector | Score |
|---|---|
| `p` | (0,0,0,1) |
| `.btn` | (0,0,1,0) |
| `nav .item a` | (0,0,1,2) |
| `#nav .item a` | (0,1,1,1) |
| `style="…"` | (1,0,0,0) |

**Say it like this:** "Specificity is a score where IDs beat classes and classes beat elements. I avoid IDs in CSS so overrides stay easy."

---

**Q19. What is the specificity of `:is()`, `:where()` and `:not()`?**

**Short answer:** `:is()` and `:not()` take the specificity of their most specific argument; `:where()` always has zero.

**Explanation:** That makes `:where()` perfect for base and library styles that consumers should override easily with a single class.

**Example:**

```css
:where(.btn) { padding: 8px; }        /* (0,0,0,0) — any class overrides */
:is(#header, .nav) a { color: red; }  /* takes #header's ID specificity */
```

**Say it like this:** "In a component library I wrap base styles in `:where()`, so app teams can override them without specificity fights."

---

**Q20. What are media query basics?**

**Short answer:** `@media` applies styles conditionally, based on width, colour scheme, motion preference, input type or print.

**Explanation:** Use `min-width` queries for mobile-first layouts, and user-preference queries for accessibility and dark mode.

**Example:**

```css
@media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (prefers-color-scheme: dark) { :root { --bg: #111; } }
@media (prefers-reduced-motion: reduce) { * { animation: none; } }
@media (hover: hover) and (pointer: fine) { .row:hover { background: #f5f5f5; } }
```

**Say it like this:** "Media queries aren't only about width. I also use them for dark mode, reduced motion and touch vs mouse."

---

## 🟡 Level 2 — Intermediate: Layout

**Q21. What are the core Flexbox properties?**

**Short answer:** On the container: `display: flex`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `gap`. On items: `flex-grow`, `flex-shrink`, `flex-basis` (or `flex`), `align-self`, `order`.

**Explanation:** `justify-content` aligns along the main axis (the direction of the row or column), and `align-items` along the cross axis. `margin-left: auto` on an item pushes it to the far end.

**Example:**

```css
.controls { display: flex; justify-content: center; align-items: center; gap: 12px; }
.controls .end-call { margin-left: auto; }
```

**Say it like this:** "Flex for one-dimensional layouts like the call control bar: centre the items, use `gap` for spacing, and `margin-left: auto` to push 'End call' to the right."

---

**Q22. `flex: 1` vs `flex: auto` vs `flex: none`?**

**Short answer:** `flex: 1` shares space equally, ignoring content size; `flex: auto` starts from content size then shares leftover space; `flex: none` is rigid.

**Explanation:** `flex: 1` = `1 1 0%`, `flex: auto` = `1 1 auto`, `flex: none` = `0 0 auto`.

**Example:** Three tabs with `flex: 1` are all the same width; with `flex: auto`, a tab with a long label gets more width.

**Say it like this:** "For equal-width tabs I use `flex: 1`; for items that should size to content and then stretch I use `flex: auto`."

---

**Q23. Why does a flex item overflow when it contains long text?**

**Short answer:** Flex items default to `min-width: auto`, so they won't shrink below their content. Set `min-width: 0` on the item.

**Explanation:** After that, the text can truncate or wrap. It's one of the most common flexbox bugs.

**Example:**

```css
.row { display: flex; }
.row .email { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

**Say it like this:** "A long email address pushed a whole row off-screen on mobile. `min-width: 0` on the flex child solved it."

---

**Q24. What are the core Grid concepts?**

**Short answer:** Tracks (`grid-template-columns/rows`), the `fr` unit, `repeat()` and `minmax()`, `gap`, named areas and line-based placement.

**Explanation:** `grid-column: 1 / -1` spans all columns. `grid-auto-rows` sizes rows that are created automatically.

**Example:**

```css
.dashboard { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.widget--wide { grid-column: span 8; }
.banner { grid-column: 1 / -1; }
```

**Say it like this:** "Grid gives me rows and columns together. For dashboards I use a 12-column grid and let widgets span what they need."

---

**Q25. How do you build a responsive grid without media queries?**

**Short answer:** `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`.

**Explanation:** It means: fit as many columns as possible, each at least 240px, then stretch them to fill the row. You get 1 column on phones and 4 on desktops automatically.

**Example:**

```css
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
```

**Say it like this:** "`auto-fit` with `minmax` is an intrinsic layout: the grid adapts to the space without any breakpoints."

---

**Q26. `auto-fit` vs `auto-fill`?**

**Short answer:** Both create as many columns as fit. `auto-fill` keeps empty columns; `auto-fit` collapses them so items stretch.

**Explanation:** The difference only shows when there are fewer items than columns that would fit.

**Example:** Two cards on a wide screen: with `auto-fit` they become wide; with `auto-fill` they stay at minimum width with empty space beside them.

**Say it like this:** "If I want few items to stretch across the row I use `auto-fit`; if I want consistent card widths I use `auto-fill`."

---

**Q27. Give an example of named grid areas (a dashboard).**

**Short answer:** Name regions with `grid-template-areas` and assign elements with `grid-area`.

**Explanation:** The layout reads like a picture, and switching to a mobile layout is just a different template in a media query.

**Example:**

```css
.app {
  display: grid;
  grid-template: "nav header" 64px "nav main" 1fr / 240px 1fr;
  min-height: 100dvh;
}
.nav { grid-area: nav; } .header { grid-area: header; } .main { grid-area: main; }
@media (max-width: 768px) {
  .app { grid-template: "header" 56px "main" 1fr / 1fr; }
  .nav { display: none; }
}
```

**Say it like this:** "Named areas make the app shell self-documenting, and the mobile layout is a one-line template change."

---

**Q28. Flexbox vs Grid: when do you use each?**

**Short answer:** Flexbox for one-dimensional, content-driven layouts; Grid for two-dimensional, layout-driven ones.

**Explanation:** Toolbars, nav items and centring suit flex. Page shells, card galleries and forms with aligned columns suit grid. Using both together is normal.

**Example:** BpoBox's page shell is a grid (sidebar, header, main); the filter bar inside the header is flex.

**Say it like this:** "If I care about one row or column and items size by content, I use flex. If rows and columns must line up, I use grid."

---

**Q29. How do you build a sticky-footer layout?**

**Short answer:** Make the body a grid with rows `auto 1fr auto` and `min-height: 100dvh`.

**Explanation:** The middle row stretches to fill available space, so the footer sits at the bottom on short pages and below the content on long ones.

**Example:**

```css
body { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; }
```

**Say it like this:** "Three grid rows, with the middle one at `1fr`. The footer stays at the bottom without any absolute positioning."

---

**Q30. What is margin collapsing?**

**Short answer:** Touching vertical margins of block elements merge into the larger one instead of adding up.

**Explanation:** It happens between siblings, and between a parent and its first or last child when nothing separates them. It doesn't happen in flex or grid containers, which is one reason teams use `gap`.

**Example:** `h2 { margin-bottom: 20px }` followed by `p { margin-top: 30px }` gives a 30px gap, not 50px.

**Say it like this:** "Vertical margins collapse in normal flow. I avoid surprises by using `gap` in flex and grid, or margins in one direction only."

---

**Q31. What is a block formatting context (BFC), how do you create one, and why?**

**Short answer:** An isolated layout region, created most cleanly with `display: flow-root` (also by overflow, floats, absolute positioning, flex/grid items).

**Explanation:** A BFC contains its floats, stops margins collapsing through it, and stops content wrapping around nearby floats.

**Example:**

```css
.media { display: flow-root; } /* contains the floated avatar */
.media img { float: left; margin-right: 12px; }
```

**Say it like this:** "When a container collapses around floated children, `display: flow-root` creates a BFC and fixes it without hacks."

---

**Q32. Are floats still relevant?**

**Short answer:** Mostly for wrapping text around an image. Use flex or grid for layout.

**Explanation:** Floats were the old layout tool and needed clearfix hacks. Today their one real job is text wrap, like in articles.

**Example:**

```css
.article img { float: right; margin: 0 0 1rem 1rem; max-width: 40%; }
```

**Say it like this:** "I only use floats for text wrapping around images; layout is flex and grid."

---

**Q33. How do stacking contexts and z-index work?**

**Short answer:** `z-index` only competes within the same stacking context, and many properties create a new one.

**Explanation:** Stacking contexts are created by positioned elements with a z-index, `opacity < 1`, `transform`, `filter`, `will-change`, `isolation: isolate`, `position: fixed/sticky`, and flex/grid children with a z-index.

**Example:**

```css
.header { position: relative; z-index: 10; }
.page { transform: translateZ(0); }      /* new stacking context */
.page .modal { position: fixed; z-index: 9999; } /* can never rise above .header */
```

**Say it like this:** "z-index is scoped to its stacking context, so a modal with 9999 can sit behind a header if a parent has a transform. I render modals in a portal or with `<dialog>`."

---

**Q34. What does `isolation: isolate` do?**

**Short answer:** It creates a new stacking context with no visual side effects.

**Explanation:** Putting it on a component's root keeps the component's internal z-indexes from leaking out and fighting the rest of the page.

**Example:**

```css
.video-tile { isolation: isolate; }
.video-tile .overlay { z-index: 2; } /* only competes inside the tile */
```

**Say it like this:** "I add `isolation: isolate` to components that use z-index internally, so they can't break stacking elsewhere."

---

**Q35. What commonly stops `position: sticky` from working?**

**Short answer:** An ancestor with `overflow: hidden/auto`, no `top` value, a parent that's too short, or a stretched flex item.

**Explanation:** Sticky elements stick inside their nearest scroll container and only within their parent's bounds.

**Example:**

```css
.table-wrap { max-height: 60vh; overflow: auto; } /* the scroll container */
.table-wrap th { position: sticky; top: 0; }
```

**Say it like this:** "When sticky doesn't stick, I look for an ancestor with overflow first. Usually that's the culprit."

---

## 🟡 Intermediate: Responsive and Modern CSS

**Q36. What is the mobile-first approach?**

**Short answer:** Write base styles for small screens, then add `min-width` media queries for larger ones.

**Explanation:** You write less override CSS, and low-end phones parse the least code. It also forces you to prioritise content.

**Example:**

```css
.list { display: block; }
@media (min-width: 768px) { .list { display: grid; grid-template-columns: 1fr 1fr; } }
```

**Say it like this:** "I start with the phone layout and enhance upwards; it keeps CSS smaller and the important content first."

---

**Q37. How does fluid typography with `clamp()` work?**

**Short answer:** `clamp(min, preferred, max)` scales a value smoothly between limits without breakpoints.

**Explanation:** Mixing `rem` into the preferred value keeps it responsive to user zoom, which pure `vw` values break.

**Example:**

```css
h1 { font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem); }
```

**Say it like this:** "`clamp` gives fluid headings with sensible limits, and including `rem` keeps browser zoom working."

---

**Q38. `vh` vs `svh`, `lvh` and `dvh`?**

**Short answer:** On mobile `100vh` includes the area behind the browser toolbar. `svh` is the smallest viewport, `lvh` the largest, and `dvh` updates dynamically.

**Explanation:** Use `dvh` for full-height app screens, with a `vh` fallback for older browsers.

**Example:**

```css
.call-view { height: 100vh; height: 100dvh; }
```

**Say it like this:** "The full-height call screen was cut off on iPhones with `100vh`. Switching to `100dvh` with a fallback fixed it."

---

**Q39. What are container queries?**

**Short answer:** Styles that respond to the size of a component's container rather than the viewport.

**Explanation:** The same card can be stacked in a narrow sidebar and side by side in the main area. That's ideal for design systems, where components don't know where they'll be placed.

**Example:**

```css
.card-wrap { container-type: inline-size; }
@container (min-width: 420px) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
}
```

**Say it like this:** "With media queries, a card in a sidebar thinks it's on a big screen. Container queries make it adapt to the slot it's actually in."

---

**Q40. Give examples of the `:has()` relational selector.**

**Short answer:** `:has()` styles an element based on what it contains, the "parent selector" CSS never had.

**Explanation:** Many styles that needed JavaScript class toggles can now be pure CSS. Check support for older browsers.

**Example:**

```css
.field:has(input:invalid) label { color: var(--danger); }
.card:has(img) { padding-top: 0; }
body:has(dialog[open]) { overflow: hidden; }
```

**Say it like this:** "`:has()` lets me style a parent based on its children, like highlighting a field's label when its input is invalid, with no JavaScript."

---

**Q41. What are CSS custom properties (variables)?**

**Short answer:** Variables defined with `--name`, read with `var()`, that inherit down the tree and can change at runtime.

**Explanation:** They can be overridden per element or theme, read and set from JavaScript, and they're the foundation of theming and design tokens.

**Example:**

```css
:root { --color-primary: oklch(60% 0.15 250); --radius: 8px; }
[data-theme="dark"] { --color-bg: #111; }
.btn { background: var(--color-primary); border-radius: var(--radius); }
.card { padding: var(--space, 16px); } /* fallback */
```

**Say it like this:** "CSS variables are runtime design tokens: change one variable and every component using it updates."

---

**Q42. CSS variables vs Sass variables?**

**Short answer:** Sass variables are replaced at build time; CSS variables live at runtime, cascade, and can change per element, theme or tenant without a rebuild.

**Explanation:** After compiling, a Sass variable is just a fixed value in the CSS. A CSS variable can be updated by JavaScript or overridden by a `[data-tenant]` selector.

**Example:**

```scss
$primary: #0b5fff;               // gone after build
:root { --primary: #0b5fff; }    // still there, changeable at runtime
```

**Say it like this:** "For BpoBox's multi-tenant branding, CSS variables were essential. Each tenant's colours were injected at runtime, so one build served all five tenants."

---

**Q43. What does `@property` do?**

**Short answer:** It registers a custom property with a type, so the browser can animate it.

**Explanation:** Plain variables are strings, so transitions jump. A typed `<angle>` or `<color>` property can transition smoothly, enabling things like animated gradients.

**Example:**

```css
@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.spinner { background: conic-gradient(from var(--angle), #0b5fff, transparent); animation: spin 2s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
```

**Say it like this:** "`@property` gives a variable a type, which is what makes it animatable."

---

**Q44. How does native CSS nesting work?**

**Short answer:** You can nest rules with `&` directly in CSS, as in Sass, in all modern browsers.

**Explanation:** It keeps related styles together, including states and media queries. Avoid deep nesting, because it raises specificity.

**Example:**

```css
.card {
  padding: 1rem;
  & .title { font-weight: 600; }
  &:hover { box-shadow: var(--shadow); }
  @media (min-width: 768px) { padding: 2rem; }
}
```

**Say it like this:** "Native nesting removes one reason to use Sass. I keep it shallow so specificity stays low."

---

**Q45. What are logical properties?**

**Short answer:** Properties like `margin-inline-start`, `padding-block` and `inset-inline` that use flow-relative directions instead of left, right, top and bottom.

**Explanation:** They flip automatically for right-to-left languages like Arabic and Hebrew, so you don't maintain a separate RTL stylesheet.

**Example:**

```css
.message { margin-inline-start: 1rem; border-inline-start: 3px solid var(--accent); }
```

**Say it like this:** "For a multilingual interpretation platform, logical properties mean RTL layouts work without extra CSS."

---

**Q46. What does `aspect-ratio` do?**

**Short answer:** It keeps a box's width-to-height ratio, like `aspect-ratio: 16 / 9`.

**Explanation:** It replaces the old `padding-top: 56.25%` hack and reserves space before media loads, preventing layout shift.

**Example:**

```css
.video-tile { aspect-ratio: 16 / 9; width: 100%; background: #000; }
```

**Say it like this:** "Every video tile uses `aspect-ratio: 16/9`, so the grid keeps its shape even before video arrives."

---

**Q47. What do `object-fit` and `object-position` do?**

**Short answer:** They control how an image or video fills its box: `cover` fills and crops, `contain` fits the whole thing with empty bars.

**Explanation:** `object-position` chooses which part stays visible when cropping.

**Example:**

```css
.tile video { width: 100%; height: 100%; object-fit: cover; }
.screen-share video { object-fit: contain; } /* never crop shared screens */
```

**Say it like this:** "Camera tiles use `cover` so they fill the tile; screen shares use `contain` so nothing important gets cut off."

---

**Q48. What's a good dark-mode strategy?**

**Short answer:** Semantic colour variables, the OS preference by default, a user override with `data-theme`, and `color-scheme` for native controls.

**Explanation:** Components use tokens like `--color-bg`, never raw hex, so the theme switches by changing variables. `color-scheme: light dark` makes scrollbars and form controls adapt.

**Example:**

```css
:root { --bg: #fff; --text: #111; color-scheme: light dark; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #111; --text: #eee; } }
[data-theme="dark"] { --bg: #111; --text: #eee; }
body { background: var(--bg); color: var(--text); }
```

**Say it like this:** "Dark mode is just another set of token values. Components never change; only the variables do."

---

**Q49. What are `@supports` feature queries?**

**Short answer:** They apply styles only if the browser supports a feature.

**Explanation:** This is progressive enhancement: older browsers get a working baseline and newer ones get the enhancement.

**Example:**

```css
.grid { display: flex; flex-wrap: wrap; }
@supports (display: grid) { .grid { display: grid; grid-template-columns: repeat(3, 1fr); } }
```

**Say it like this:** "I use `@supports` to adopt new features like container queries safely, with a sensible fallback."

---

**Q50. What are cascade layers?**

**Short answer:** `@layer` lets you set precedence explicitly: later layers beat earlier ones regardless of specificity, and unlayered styles beat all layers.

**Explanation:** They're great for taming third-party CSS: put the library in a low layer and your styles win without `!important`.

**Example:**

```css
@layer reset, vendor, components, utilities;
@import url("datepicker.css") layer(vendor);
@layer components { .btn { padding: 8px 16px; } }
@layer utilities { .p-0 { padding: 0; } }
```

**Say it like this:** "Layers end specificity wars. A third-party stylesheet goes in a low layer, so my component styles always win."

---

## 🟡 Intermediate: Animation and Effects

**Q51. Transition vs animation?**

**Short answer:** A transition animates between two states when a property changes; a keyframe animation runs on its own, can loop and can have many steps.

**Explanation:** Use transitions for interactive feedback (hover, open/close) and animations for continuous or multi-step effects (spinners, pulses).

**Example:**

```css
.btn { transition: background-color 150ms ease; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.speaking-dot { animation: pulse 1s infinite; }
```

**Say it like this:** "Transitions for state changes, keyframes for anything that runs on its own, like a 'live' pulse."

---

**Q52. Which properties are cheap to animate?**

**Short answer:** `transform` and `opacity`, which the GPU compositor handles without layout or paint.

**Explanation:** Animating `width`, `height`, `top`, `left` or `margin` triggers layout on every frame and janks on slow devices.

**Example:** Slide a drawer with `transform: translateX(-100%) → translateX(0)`, not by animating `left`.

**Say it like this:** "I animate only transform and opacity. On clinic tablets the difference between those and animating `left` is very visible."

---

**Q53. What does `will-change` do?**

**Short answer:** It hints that an element is about to animate, so the browser can promote it to its own layer in advance.

**Explanation:** Apply it just before an animation and remove it after. Applying it everywhere wastes GPU memory and can make things slower.

**Example:**

```js
panel.style.willChange = 'transform';
panel.addEventListener('transitionend', () => (panel.style.willChange = 'auto'), { once: true });
```

**Say it like this:** "`will-change` is a last-resort hint for a specific animation, not something to sprinkle everywhere."

---

**Q54. How do you respect reduced motion?**

**Short answer:** Use the `prefers-reduced-motion: reduce` media query to remove or shorten animations.

**Explanation:** Some users get nausea or migraines from motion (vestibular disorders). WCAG 2.3.3 covers this. Keep essential feedback but drop decorative motion.

**Example:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Say it like this:** "Speaking-indicator animations respected `prefers-reduced-motion`; users who opt out still see a static highlight."

---

**Q55. What is the View Transitions API?**

**Short answer:** `document.startViewTransition(() => updateDOM())` animates smoothly between two DOM states.

**Explanation:** The browser snapshots the old and new states and cross-fades or morphs them. Elements with the same `view-transition-name` morph into each other, like a thumbnail growing into a detail view.

**Example:**

```js
document.startViewTransition(() => {
  setSelectedCall(id);   // DOM update
});
```

**Say it like this:** "View transitions give app-like animations between states with very little code, and they degrade gracefully where unsupported."

---

**Q56. What are scroll-driven animations?**

**Short answer:** `animation-timeline: scroll()` or `view()` ties an animation's progress to scroll position.

**Explanation:** Reading-progress bars and reveal-on-scroll effects work without JavaScript scroll listeners, and they run off the main thread.

**Example:**

```css
.progress { animation: grow linear; animation-timeline: scroll(); transform-origin: left; }
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

**Say it like this:** "Scroll-driven animations replace scroll listeners for progress bars, which is smoother and cheaper."

---

**Q57. How does scroll snap work?**

**Short answer:** `scroll-snap-type` on the container and `scroll-snap-align` on items make scrolling settle on items.

**Explanation:** It gives a native, touch-friendly carousel without a JavaScript library, and keyboard and trackpad scrolling still work.

**Example:**

```css
.carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.slide { flex: 0 0 100%; scroll-snap-align: center; }
```

**Say it like this:** "For simple carousels I use scroll snap: native touch behaviour and zero JavaScript."

---

## 🔴 Level 3 — Advanced

**Q58. What is the browser's rendering pipeline for CSS?**

**Short answer:** Style calculation → layout → paint → composite.

**Explanation:** Changing a geometry property (`width`) reruns all four; a visual-only property (`color`) reruns paint and composite; `transform` or `opacity` reruns only composite.

**Example:** Changing `top` on a tooltip every mousemove triggers layout; changing `transform: translate()` only composites.

**Say it like this:** "I think about which stage a property triggers. Layout is the expensive one, so hot paths only touch transform and opacity."

---

**Q59. What is layout thrashing?**

**Short answer:** Alternating style writes and layout reads, which forces the browser to recalculate layout repeatedly.

**Explanation:** Reading `offsetHeight` or `getBoundingClientRect()` after a write forces a synchronous layout. Batch all reads, then all writes.

**Example:**

```js
// Bad
items.forEach((el) => { el.style.width = box.offsetWidth + 'px'; });
// Good
const w = box.offsetWidth;
items.forEach((el) => { el.style.width = w + 'px'; });
```

**Say it like this:** "Read first, then write. Interleaving them in a loop forces a layout per item."

---

**Q60. What do `contain` and `content-visibility` do?**

**Short answer:** `contain` isolates a subtree so its changes don't affect the rest of the page; `content-visibility: auto` skips rendering off-screen sections entirely.

**Explanation:** Pair `content-visibility` with `contain-intrinsic-size` so the scrollbar doesn't jump. On long pages it can cut rendering time dramatically.

**Example:**

```css
.call-history-section { content-visibility: auto; contain-intrinsic-size: auto 800px; }
.widget { contain: layout paint; }
```

**Say it like this:** "For long call-history pages, `content-visibility: auto` lets the browser skip off-screen sections until the user scrolls to them."

---

**Q61. What is critical CSS?**

**Short answer:** Inlining the minimum CSS needed for above-the-fold content, so the first paint doesn't wait for the full stylesheet.

**Explanation:** The rest loads asynchronously. Next.js and other SSR frameworks largely automate this; doing it by hand is error-prone.

**Example:**

```html
<style>/* header, hero and layout styles only */</style>
<link rel="stylesheet" href="/full.css" media="print" onload="this.media='all'">
```

**Say it like this:** "Critical CSS gets the first screen painted without waiting for the whole stylesheet; frameworks usually handle it for me."

---

**Q62. What CSS architecture approaches are there?**

**Short answer:** BEM naming, ITCSS/OOCSS layering, utility-first (Tailwind), CSS Modules, runtime CSS-in-JS and zero-runtime CSS-in-JS.

**Explanation:** Each solves naming and scoping differently. The trend is away from runtime CSS-in-JS towards zero-runtime options and utilities, because of performance and Server Components.

**Example:** BEM: `.card__title--large`. CSS Modules: `styles.title`. Tailwind: `class="text-lg font-semibold"`.

**Say it like this:** "For a large React app today, I'd pick Tailwind or CSS Modules with design tokens as CSS variables. Both have zero runtime cost and work with Server Components."

---

**Q63. What are the trade-offs of runtime CSS-in-JS?**

**Short answer:** Pros: prop-driven styles, co-location and easy theming. Cons: runtime cost, more JavaScript, and friction with Server Components and streaming SSR.

**Explanation:** Libraries like styled-components generate and inject styles while rendering, which adds work on every render and complicates server rendering.

**Example:** A table with 500 styled rows can spend noticeable time generating class names during render; the same table with CSS Modules has zero style cost at runtime.

**Say it like this:** "Runtime CSS-in-JS was convenient, but its render-time cost and RSC incompatibility pushed the industry to zero-runtime approaches."

---

**Q64. How does CSS Modules scoping work?**

**Short answer:** At build time, class names are rewritten to unique names per file, so classes can't clash.

**Explanation:** `composes` reuses another class and `:global()` opts out of scoping. You still write normal CSS.

**Example:**

```tsx
import styles from './Card.module.css';
<h3 className={styles.title}>…</h3>   // renders class="Card_title__x7a2"
```

**Say it like this:** "CSS Modules give normal CSS with automatic scoping, so two components can both have a `.title` class without conflicts."

---

**Q65. What does a design tokens pipeline look like?**

**Short answer:** Tokens are defined once (JSON or Figma variables) and generated into CSS variables, TypeScript constants and the Tailwind theme.

**Explanation:** Tools like Style Dictionary do the generation. Designers and developers share one source of truth, so a colour change flows everywhere.

**Example:**

```json
{ "color": { "primary": { "value": "#0b5fff" } } }
```

→ `--color-primary: #0b5fff;` in CSS and `colors.primary` in Tailwind.

**Say it like this:** "Tokens are the contract between design and code. Change them once and every platform updates."

---

**Q66. What is subgrid?**

**Short answer:** `grid-template-columns: subgrid` lets a nested element align its children to the parent grid's tracks.

**Explanation:** Card titles, bodies and buttons line up across a whole row of cards even with different content lengths.

**Example:**

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: auto 1fr auto; }
.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; }
```

**Say it like this:** "Subgrid finally solves aligning buttons across cards with different text lengths."

---

**Q67. What is anchor positioning?**

**Short answer:** Pure-CSS positioning of a tooltip or popover relative to another element, using `anchor-name`, `position-anchor` and `anchor()`.

**Explanation:** It can replace libraries like Popper or Floating UI, including flipping when there's no room. Check browser support first.

**Example:**

```css
.trigger { anchor-name: --menu-btn; }
.menu { position: absolute; position-anchor: --menu-btn; top: anchor(bottom); left: anchor(left); }
```

**Say it like this:** "Anchor positioning moves tooltip placement into CSS. Until support is universal, I'd keep Floating UI as a fallback."

---

**Q68. How does font loading affect CLS?**

**Short answer:** `font-display: swap` shows a fallback immediately and swaps later, which can shift layout; `optional` uses the web font only if it's already fast.

**Explanation:** Matching the fallback's metrics with `size-adjust` and `ascent-override` minimises shift (Next.js `next/font` does this). Preload critical fonts, self-host WOFF2 and subset characters.

**Example:**

```css
@font-face { font-family: "Inter Fallback"; src: local("Arial"); size-adjust: 107%; ascent-override: 90%; }
body { font-family: "Inter", "Inter Fallback", sans-serif; }
```

**Say it like this:** "Font swaps cause layout shift, so I use a metric-matched fallback and preload only the critical font."

---

**Q69. How do you keep responsive breakpoints maintainable?**

**Short answer:** Use a few content-driven breakpoints as tokens, and prefer container queries and intrinsic layouts over many media queries.

**Explanation:** Breakpoints chosen by device names age badly. Intrinsic tools like `minmax`, `clamp` and `auto-fit` adapt continuously.

**Example:** Three tokens (`--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1440px`) plus container queries for components.

**Say it like this:** "I add a breakpoint when the content breaks, not for a specific device, and let intrinsic layouts handle the rest."

---

**Q70. How do you write print styles?**

**Short answer:** Use `@media print` to hide navigation, show link URLs and avoid breaking cards across pages.

**Explanation:** Reports and summaries are often printed or saved as PDF, so a small print stylesheet improves them a lot.

**Example:**

```css
@media print {
  nav, .no-print { display: none; }
  a::after { content: " (" attr(href) ")"; }
  .card, tr { break-inside: avoid; }
}
```

**Say it like this:** "For the QA report page, a short print stylesheet made the PDF export clean without a separate template."

---

**Q71. How do you fix specificity wars in a large codebase?**

**Short answer:** Introduce cascade layers, flatten selectors to single classes, ban IDs for styling, use `:where()` for base styles, and enforce limits with Stylelint.

**Explanation:** Specificity wars escalate with `!important`. Layers and low-specificity conventions stop the escalation.

**Example:** Stylelint rule `selector-max-specificity: "0,2,0"` and `selector-max-id: 0` fail CI for overly specific selectors.

**Say it like this:** "I'd stop the arms race structurally: layers, flat class selectors, and a lint rule so it doesn't come back."

---

**Q72. How do you write accessible focus styles?**

**Short answer:** Use `:focus-visible` with a clear outline that meets 3:1 contrast, and never remove outlines without a replacement.

**Explanation:** `:focus-visible` shows the ring for keyboard users but not on mouse clicks, which keeps designers happy without hurting accessibility.

**Example:**

```css
:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
```

**Say it like this:** "Keyboard users need to see focus. `:focus-visible` gives them a strong ring without showing it on every mouse click."

---

**Q73. How do you support forced-colours (high contrast) mode?**

**Short answer:** Use `@media (forced-colors: active)` with system colour keywords, and show states with borders rather than background colour alone.

**Explanation:** Windows high-contrast mode replaces your colours, so background-only indicators (like a selected row) disappear.

**Example:**

```css
@media (forced-colors: active) {
  .tab[aria-selected="true"] { border-bottom: 3px solid Highlight; }
}
```

**Say it like this:** "In forced-colours mode backgrounds disappear, so selection and focus also need borders or outlines."

---

## 🧩 Level 4 — Scenario-Based

**Q74. A modal appears behind the header despite `z-index: 9999`.**

**Short answer:** A parent creates a stacking context, so the modal's z-index only counts inside it. Render the modal in a portal or use `<dialog>`.

**Explanation:** `transform`, `opacity`, `filter` or a z-index on an ancestor traps the modal. A portal to `document.body` or the top layer (`<dialog>`, Popover API) escapes it.

**Example:**

```tsx
return createPortal(<div className="modal">…</div>, document.body);
```

**Say it like this:** "It's a stacking-context trap, not a z-index problem. I'd move the modal out with a portal or use `<dialog>`, which renders in the top layer."

---

**Q75. A flex row overflows on mobile because of a long email address.**

**Short answer:** Add `min-width: 0` to the flex child, plus `overflow-wrap: anywhere` or `text-overflow: ellipsis`.

**Explanation:** Flex items won't shrink below their content by default, so the long word forces the overflow.

**Example:**

```css
.user-row .email { min-width: 0; overflow-wrap: anywhere; }
```

**Say it like this:** "Classic flexbox `min-width: auto` issue. `min-width: 0` lets it shrink, then I choose wrapping or truncation."

---

**Q76. A `position: sticky` table header doesn't stick.**

**Short answer:** An ancestor probably has `overflow: hidden`, or `top` isn't set. Make the table wrapper the scroll container and set `top: 0` on the `th` elements.

**Explanation:** Sticky works relative to the nearest scroll container, so you need to control which element scrolls.

**Example:**

```css
.table-wrap { max-height: 70vh; overflow: auto; }
.table-wrap th { position: sticky; top: 0; background: var(--surface); }
```

**Say it like this:** "I'd check for an overflow ancestor first, then make the table wrapper the intended scroll container."

---

**Q77. A 100vh section is cut off on iPhone.**

**Short answer:** Use `height: 100dvh`, with `100vh` as a fallback.

**Explanation:** `100vh` on iOS includes the area behind Safari's toolbar; `dvh` tracks the visible viewport.

**Example:**

```css
.call-view { height: 100vh; height: 100dvh; }
```

**Say it like this:** "That's the mobile viewport unit problem. `100dvh` fixes it, with `vh` as a fallback for older browsers."

---

**Q78. Text over a video tile isn't readable.**

**Short answer:** Add a gradient scrim behind the text and check it meets 4.5:1 contrast.

**Explanation:** Video backgrounds change constantly, so you can't rely on the video being dark. A scrim guarantees contrast; text-shadow alone isn't enough.

**Example:**

```css
.tile .name { background: linear-gradient(transparent, rgb(0 0 0 / 0.7)); color: #fff; padding: 8px; }
```

**Say it like this:** "You can't control what's behind the name label, so a dark gradient scrim guarantees readable text."

---

**Q79. The theme switch flashes the wrong theme on page load.**

**Short answer:** Apply the saved theme in a tiny inline script in `<head>` before the first paint, and set `color-scheme`.

**Explanation:** If the theme is applied after React hydrates, the page first paints with the default theme, then flips.

**Example:**

```html
<script>
  try { document.documentElement.dataset.theme = localStorage.getItem('theme') ?? 'light'; } catch {}
</script>
```

**Say it like this:** "The flash happens because the theme is applied too late. A blocking inline script in the head sets it before the first paint."

---

**Q80. The CSS bundle is 600 KB and mostly unused.**

**Short answer:** Measure with the Coverage tab, split CSS per route, remove unused libraries, fix Tailwind content scanning, and inline critical CSS.

**Explanation:** Unused CSS still has to be downloaded and parsed, and it blocks rendering. Usually one or two libraries or a misconfigured scan are responsible.

**Example:** DevTools Coverage showed 85% of CSS unused; most came from a full icon font and an unused component library, removing which cut the bundle to 90 KB.

**Say it like this:** "I'd start with the Coverage tab to find what's unused, then remove or split it per route."

---

**Q81. Animations stutter on low-end Android phones.**

**Short answer:** Animate only transform and opacity, avoid animating shadows and blur, reduce layers, respect reduced motion, and profile with CPU throttling.

**Explanation:** Low-end GPUs and CPUs can't redo layout and paint at 60 fps. Throttling CPU 4–6x in DevTools reproduces the problem on a laptop.

**Example:** Replacing an animated `box-shadow` pulse on the speaking indicator with a `transform: scale()` on a pseudo-element made it smooth.

**Say it like this:** "I profile with CPU throttling, find which property triggers layout or paint, and switch the animation to transform and opacity."

---

**Q82. The design system must support five tenants' brand colours without rebuilding.**

**Short answer:** Components use only semantic tokens; at startup the tenant config sets those CSS variables on `:root`; each palette is checked for contrast.

**Explanation:** Semantic tokens (`--color-primary`, `--color-on-primary`) decouple components from specific colours, so re-theming is data, not code.

**Example:**

```js
for (const [k, v] of Object.entries(tenant.theme)) document.documentElement.style.setProperty(`--${k}`, v);
```

**Say it like this:** "This is what we did on BpoBox: one build, five brands. The tenant config sets about 15 CSS variables at boot, and every component uses semantic tokens."

---

**Q83. Build a responsive video grid for 1 to 12 participants.**

**Short answer:** A CSS grid with `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`, 16:9 tiles with `aspect-ratio`, and `object-fit: cover` on video.

**Explanation:** `auto-fit` adjusts the column count to the screen; `min(280px, 100%)` stops overflow on tiny screens. A speaker layout switches the container class to one large tile plus a filmstrip.

**Example:**

```css
.grid { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
.tile { position: relative; aspect-ratio: 16 / 9; background: #000; border-radius: 12px; overflow: hidden; }
.tile video { width: 100%; height: 100%; object-fit: cover; }
.tile[data-speaking="true"] { outline: 3px solid var(--speaking); }
```

**Say it like this:** "An intrinsic grid handles 1 to 12 tiles with no breakpoints, and a data attribute drives the speaking highlight."

---

## 🎯 From Your Resume

**Q84. "How did you theme BpoBox for multiple tenants with Radix?"**

**Short answer:** Radix is unstyled, so we styled it with semantic CSS variables set per tenant at login, and used Radix's data attributes for states.

**Explanation:** Radix gives behaviour and accessibility; we brought the visuals. Tenant config set variables on `:root`; selectors like `[data-state="open"]` and `[data-highlighted]` handled states without extra React logic.

**Example:**

```css
.menu-item[data-highlighted] { background: var(--color-primary-subtle); }
.switch[data-state="checked"] { background: var(--color-primary); }
```

**Say it like this:** "Radix handled accessibility and behaviour, semantic CSS variables handled each tenant's brand, and Radix's data attributes drove the state styles."

---

**Q85. "How did you keep the InterpretIQ call controls accessible over live video?"**

**Short answer:** A solid control-bar background, a 3:1 focus outline, touch targets of at least 44px, and states shown with icons and labels, not colour alone.

**Explanation:** Video is unpredictable: a bright wall behind someone ruins the contrast of a transparent bar. Muted and camera-off states change icon and label too.

**Example:**

```css
.control-bar { background: rgb(17 17 17 / 0.92); }
.control-bar button { min-width: 44px; min-height: 44px; }
.control-bar button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
```

**Say it like this:** "Because video changes constantly, the control bar had its own solid background, large targets and a strong focus ring, and states never relied on colour alone."

---

**Q86. "How did you handle responsive design for hospital tablets?"**

**Short answer:** Landscape and portrait layouts, container queries for the participant panel, `100dvh` for the call view, safe-area insets in PWA mode, and large touch targets.

**Explanation:** As an installed PWA, the app runs edge to edge, so `env(safe-area-inset-*)` keeps controls clear of system bars. Clinicians often use gloves, so targets were generous.

**Example:**

```css
.call-view { height: 100dvh; padding-bottom: env(safe-area-inset-bottom); }
.panel-wrap { container-type: inline-size; }
```

**Say it like this:** "We designed for both orientations, used container queries for the docked panel, `100dvh` for full height and safe-area insets for the installed PWA, with touch targets sized for gloved hands."
