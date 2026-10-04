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

## 🟢 Level 1 — Basics

**Q1. What are the three ways to add CSS?**

**Short answer:** Inline (`style="..."`), internal (a `<style>` tag), and external (`<link rel="stylesheet" href="...">`). External stylesheets are preferred because the browser can cache them and reuse them across pages.

**Explanation:** Inline styles have the highest specificity, which makes them hard to override, so use them only for truly dynamic values (for example, a progress-bar width set by JavaScript).

---

**Q2. What types of selectors are there?**

**Short answer:**

| Selector | Example | Matches |
|---|---|---|
| Element | `p` | all paragraphs |
| Class | `.btn` | elements with class="btn" |
| ID | `#main` | the element with id="main" |
| Attribute | `[type="email"]` | inputs of type email |
| Descendant | `nav a` | any `a` inside `nav` |
| Child | `ul > li` | direct children only |
| Adjacent sibling | `h2 + p` | the `p` right after an `h2` |
| General sibling | `h2 ~ p` | all `p` siblings after an `h2` |
| Pseudo-class | `a:hover` | a state |
| Pseudo-element | `p::first-line` | a part of an element |

---

**Q3. Explain the box model.**

**Short answer:** Every element is a box of content → padding → border → margin. With the default `box-sizing: content-box`, padding and border are *added* to the declared width.

**Example:**

```css
.box { width: 200px; padding: 20px; border: 5px solid; }
/* content-box: total visible width = 200 + 40 + 10 = 250px */
/* border-box:  total visible width = 200px (content shrinks to 150px) */
```

**Say it like this:** "Every element is content, padding, border and margin. I always set `box-sizing: border-box` globally so `width` means the full visible width, which makes layouts predictable."

---

**Q4. Why set `box-sizing: border-box` globally?**

```css
*, *::before, *::after { box-sizing: border-box; }
```

**Short answer:** With it, `width: 50%` plus padding still equals exactly 50%, so two columns fit side by side without the maths breaking.

---

**Q5. Margin vs padding?**

**Short answer:** Padding is space *inside* the border. It shows the element's background and increases the clickable area. Margin is space *outside* the border. It's transparent, it can be negative, and vertical margins can collapse (see Q30).

---

**Q6. What are the common `display` values?**

**Short answer:** `block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `none`, `contents` (the element's box disappears but its children remain), and `flow-root` (creates a new block formatting context).

---

**Q7. `inline` vs `inline-block`?**

**Short answer:** `inline` ignores width, height and vertical margins. `inline-block` sits in a line of text like inline, but respects width, height, padding and margins like a block. That makes it useful for badges or buttons inside text.

---

**Q8. What units are there?**

**Short answer:**

- **Absolute:** `px`.
- **Relative:**
  - `%`: relative to the parent.
  - `em`: relative to the element's own font size. Nested `em`s compound.
  - `rem`: relative to the root (`html`) font size.
  - `vw` and `vh`: 1% of the viewport width and height.
  - `ch`: the width of the "0" character, useful for readable line lengths (`max-width: 65ch`).
  - `fr`: a fraction of the free space in a grid.

---

**Q9. When do you use `rem` and when `em`?**

**Short answer:** Use `rem` for font sizes and the spacing scale. It's predictable and respects the user's browser font setting. Use `em` for things that should scale with the component's own text, like button padding or an icon next to text.

**Example:**

```css
.btn { font-size: 1rem; padding: 0.5em 1em; }   /* padding grows if font grows */
.btn--large { font-size: 1.25rem; }              /* padding scales automatically */
```

**Say it like this:** "I use `rem` for the global scale, so if a user sets a larger default font in their browser, everything scales with it, which is an accessibility win. I use `em` inside components so padding scales with the component's font size."

---

**Q10. What colour formats are there?**

**Short answer:** Named colours (`red`), hex (`#0a7`), `rgb()`, `hsl()`, and the modern `oklch()`. `oklch()` is perceptually uniform: changing lightness looks consistent across hues, which makes it ideal for generating design-token palettes. Alpha uses a slash: `rgb(0 0 0 / 50%)`.

---

**Q11. Explain the `position` values.**

**Short answer:**

- `static`: the default normal flow. `top` and `left` do nothing.
- `relative`: offsets the element from where it would normally be, and keeps its space. It also becomes the reference point for absolutely positioned children.
- `absolute`: removed from the flow and positioned relative to the nearest *positioned* ancestor.
- `fixed`: positioned relative to the viewport and stays put when scrolling. The exception is an ancestor with `transform` or `filter`, which becomes the reference instead.
- `sticky`: behaves like relative until you scroll past a threshold (for example `top: 0`), then sticks inside its parent.

**Example:**

```css
.tile { position: relative; }
.tile .name-badge { position: absolute; bottom: 8px; left: 8px; }
.table thead th { position: sticky; top: 0; }
```

---

**Q12. `display: none` vs `visibility: hidden` vs `opacity: 0`?**

| | Takes up space? | Clickable? | Read by screen readers? |
|---|---|---|---|
| `display: none` | no | no | no |
| `visibility: hidden` | yes | no | no |
| `opacity: 0` | yes | **yes** | **yes** |

**Tip:** To hide something visually but keep it for screen readers, use a "visually-hidden" utility class:

```css
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

---

**Q13. Pseudo-classes vs pseudo-elements?**

**Short answer:** Pseudo-classes (one colon) select an element in a certain *state*: `:hover`, `:focus-visible`, `:checked`, `:disabled`, `:nth-child(2n)`, `:not()`. Pseudo-elements (two colons) target or create a *part* of an element: `::before`, `::after`, `::placeholder`, `::selection`, `::marker`.

---

**Q14. How do you centre things?**

**Short answer:**

- Text: `text-align: center`.
- A block with a known width: `margin-inline: auto`.
- Anything, both horizontally and vertically:

```css
.parent { display: grid; place-items: center; }
/* or */
.parent { display: flex; justify-content: center; align-items: center; }
```

---

**Q15. What are the `overflow` values?**

**Short answer:** `visible` (default), `hidden`, `scroll`, `auto` (scrollbars only when needed) and `clip`. To truncate one line with "…":

```css
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
```

For multi-line truncation, use `-webkit-line-clamp: 2` with `display: -webkit-box`.

---

**Q16. What is the cascade?**

**Short answer:** The algorithm that decides which rule wins when several target the same element. In order: origin and `!important`, then cascade layers, then specificity, then source order (last one wins).

**Say it like this:** "When two rules conflict, the browser checks importance, then layers, then specificity, and finally which one came last. Most real bugs are specificity problems, which is why I keep selectors flat, usually a single class."

---

**Q17. Which properties inherit?**

**Short answer:** Typography properties inherit: `color`, `font-*`, `line-height`, `text-align`, `visibility`. Box properties don't: `margin`, `padding`, `border`, `background`, `width`. You control this with `inherit` (take the parent's value), `initial` (the spec default), `unset` (inherit if the property naturally inherits, otherwise initial) and `revert` (the browser default).

---

**Q18. How is specificity calculated?**

**Short answer:** As a score of (inline styles, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Compare from left to right.

**Example:**

| Selector | Score |
|---|---|
| `p` | (0,0,0,1) |
| `.btn` | (0,0,1,0) |
| `nav .item a` | (0,0,1,2) |
| `#nav .item a` | (0,1,1,1) |
| `style="…"` | (1,0,0,0) |

One ID beats any number of classes. `!important` beats all of them, which is why it should be rare.

---

**Q19. What is the specificity of `:is()`, `:where()` and `:not()`?**

**Short answer:** `:is()` and `:not()` take the specificity of their *most specific* argument. `:where()` always has **zero** specificity, so it's perfect for base and library styles that consumers can easily override.

```css
:where(.btn) { padding: 8px; }   /* (0,0,0,0) — any class can override */
```

---

**Q20. What are media query basics?**

```css
@media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (prefers-color-scheme: dark) { :root { --bg: #111; } }
@media (prefers-reduced-motion: reduce) { * { animation: none; } }
@media (hover: hover) and (pointer: fine) { .row:hover { background: #f5f5f5; } }
```

**Explanation:** Media queries respond to more than width: colour scheme, motion preference, input type (touch vs mouse), and print.

---

## 🟡 Level 2 — Intermediate: Layout

**Q21. What are the core Flexbox properties?**

**Short answer:**

- **Container:** `display: flex`, `flex-direction` (row or column), `flex-wrap`, `justify-content` (aligns along the main axis), `align-items` (aligns along the cross axis), `gap`.
- **Items:** `flex-grow`, `flex-shrink`, `flex-basis` (or the shorthand `flex`), `align-self`, `order`.

**Example (a call control bar):**

```css
.controls { display: flex; justify-content: center; align-items: center; gap: 12px; }
.controls .end-call { margin-left: auto; }   /* pushes it to the far right */
```

---

**Q22. `flex: 1` vs `flex: auto` vs `flex: none`?**

**Short answer:**

- `flex: 1` = `1 1 0%`: items share the space *equally*, ignoring their content size.
- `flex: auto` = `1 1 auto`: items start at their content size, then share the leftover space.
- `flex: none` = `0 0 auto`: rigid; it neither grows nor shrinks.

**Example:** Three tabs with `flex: 1` are all the same width. With `flex: auto`, a long label gets a wider tab.

---

**Q23. Why does a flex item overflow when it contains long text?**

**Short answer:** Flex items default to `min-width: auto`, which means they refuse to shrink smaller than their content. Set `min-width: 0` on the item so it can shrink, then truncate or wrap the text.

```css
.row { display: flex; }
.row .email { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

**Say it like this:** "This is the most common flexbox bug I've fixed. A long email address pushed the whole row off-screen on mobile, and `min-width: 0` on the flex child solved it."

---

**Q24. What are the core Grid concepts?**

**Short answer:** `grid-template-columns` and `grid-template-rows` define tracks. `fr` divides free space, `repeat()` and `minmax()` build flexible tracks, and `gap` sets the gutters. `grid-template-areas` names regions. Line-based placement (`grid-column: 1 / -1` spans all columns) positions items, and `grid-auto-rows` sizes rows created automatically.

---

**Q25. How do you build a responsive grid without media queries?**

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
```

**Explanation:** "Fit as many columns as possible, each at least 240px wide, and stretch them to fill the row." You get 1 column on a phone, 2 on a tablet and 4 on a desktop, all automatically.

---

**Q26. `auto-fit` vs `auto-fill`?**

**Short answer:** Both create as many columns as will fit. `auto-fill` keeps empty columns, so items stay at their minimum size. `auto-fit` collapses empty columns, so existing items stretch to fill the row. With only two cards on a wide screen, `auto-fit` makes them wide, while `auto-fill` leaves empty space.

---

**Q27. Give an example of named grid areas (a dashboard).**

```css
.app {
  display: grid;
  grid-template:
    "nav header" 64px
    "nav main"   1fr
    / 240px 1fr;
  min-height: 100dvh;
}
.nav    { grid-area: nav; }
.header { grid-area: header; }
.main   { grid-area: main; }

@media (max-width: 768px) {
  .app { grid-template: "header" 56px "main" 1fr / 1fr; }
  .nav { display: none; }
}
```

**Explanation:** The layout reads like a picture, and changing it for mobile is just a different template.

---

**Q28. Flexbox vs Grid: when do you use each?**

**Short answer:** Flexbox is one-dimensional and content-driven: toolbars, nav items, centring a single thing. Grid is two-dimensional and layout-driven: page shells, card galleries, forms with aligned columns. Using both together is normal, for example a Grid page with Flex toolbars inside.

**Say it like this:** "If I care about a single row or column and items should size by content, I use flex. If I need rows *and* columns to line up, I use grid."

---

**Q29. How do you build a sticky-footer layout?**

```css
body { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; }
/* header, main (stretches), footer */
```

---

**Q30. What is margin collapsing?**

**Short answer:** When vertical margins of block elements touch (adjacent siblings, or a parent and its first or last child with no border or padding between them), they merge into the larger of the two instead of adding up.

**Example:** `h2 { margin-bottom: 20px }` followed by `p { margin-top: 30px }` gives a 30px gap, not 50px.

**Explanation:** It doesn't happen inside flex or grid containers, or when the parent creates a block formatting context. This is one reason many teams use `gap` instead of margins.

---

**Q31. What is a block formatting context (BFC), how do you create one, and why?**

**Short answer:** A BFC is an isolated layout region. Create one with `display: flow-root` (the cleanest way), `overflow` set to anything except visible, floats, absolute positioning, or flex/grid items. A BFC contains its floats, stops margins collapsing through it, and stops content wrapping around nearby floats.

---

**Q32. Are floats still relevant?**

**Short answer:** Mostly just for wrapping text around an image. Clear them with `clear: both`, or give the parent `display: flow-root`. Use flex or grid for layout.

---

**Q33. How do stacking contexts and z-index work?**

**Short answer:** `z-index` only competes *within the same stacking context*. A new stacking context is created by:

- a positioned element with a `z-index` value
- `opacity` below 1
- `transform`, `filter` or `will-change`
- `isolation: isolate`
- `position: fixed` or `sticky`
- flex and grid children with a `z-index`

**Example (the classic bug):**

```css
.header { position: relative; z-index: 10; }
.page { transform: translateZ(0); }       /* creates a stacking context */
.page .modal { position: fixed; z-index: 9999; }
/* The modal can never rise above .header: its 9999 only counts inside .page,
   and .page itself sits at the root level below the header. */
```

**Say it like this:** "z-index isn't global. It's scoped to the stacking context, so a modal with z-index 9999 can still sit behind a header if a parent has a transform. I fix it by rendering the modal in a portal at the body level, or with `<dialog>`, which uses the browser's top layer."

---

**Q34. What does `isolation: isolate` do?**

**Short answer:** It creates a new stacking context with no visual side effects. Put it on a component's root so the component's internal z-indexes can't leak out and fight with the rest of the page.

---

**Q35. What commonly stops `position: sticky` from working?**

**Short answer:**

1. An ancestor has `overflow: hidden` or `auto`, so the element sticks to *that* scroll container instead of the page.
2. No `top` (or `bottom`) value is set.
3. The parent is too short, so there's no room to stick.
4. In a flex container, the item is stretched to full height.

---

## 🟡 Intermediate: Responsive and Modern CSS

**Q36. What is the mobile-first approach?**

**Short answer:** Write base styles for small screens, then add `min-width` media queries for larger screens. You end up with less override CSS, and low-end phones parse the least code.

```css
.list { display: block; }
@media (min-width: 768px) { .list { display: grid; grid-template-columns: 1fr 1fr; } }
```

---

**Q37. How does fluid typography with `clamp()` work?**

```css
h1 { font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem); }
/* never smaller than 1.5rem, never larger than 2.5rem, scales in between */
```

**Short answer:** `clamp(min, preferred, max)` gives smooth scaling without breakpoints. Mixing `rem` into the preferred value keeps it responsive to the user's zoom.

---

**Q38. `vh` vs `svh`, `lvh` and `dvh`?**

**Short answer:** On mobile, `100vh` includes the area behind the browser's address bar, so content gets cut off. `svh` is the smallest viewport (address bar shown), `lvh` the largest (address bar hidden), and `dvh` is dynamic: it updates as the bar shows and hides.

```css
.call-view { height: 100vh; height: 100dvh; }  /* fallback first */
```

---

**Q39. What are container queries?**

```css
.card-wrap { container-type: inline-size; }

@container (min-width: 420px) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
}
```

**Short answer:** A component responds to the width of its *container* rather than the viewport. The same card can be stacked in a narrow sidebar and side-by-side in the main area.

**Say it like this:** "Container queries are ideal for design systems, because a component doesn't know where it'll be placed. With media queries a card in a sidebar thinks it's on a big screen. With container queries it adapts to the slot it's actually in."

---

**Q40. Give examples of the `:has()` relational selector.**

```css
.field:has(input:invalid) label { color: var(--danger); }  /* style the parent by child state */
.card:has(img) { padding-top: 0; }
body:has(dialog[open]) { overflow: hidden; }               /* lock scroll when a modal is open */
```

**Short answer:** `:has()` is the "parent selector" CSS lacked for 20 years. Many styles that needed JavaScript class toggles are now pure CSS.

---

**Q41. What are CSS custom properties (variables)?**

```css
:root {
  --color-primary: oklch(60% 0.15 250);
  --radius: 8px;
}
[data-theme="dark"] { --color-bg: #111; --color-text: #eee; }

.btn { background: var(--color-primary); border-radius: var(--radius); }
.card { padding: var(--space, 16px); }  /* fallback value */
```

**Short answer:** Variables can be defined on any element, inherit down the tree, can be read and changed by JavaScript (`el.style.setProperty('--x', '10px')`), and update live. That makes them the foundation of theming.

---

**Q42. CSS variables vs Sass variables?**

**Short answer:** Sass variables are replaced at *build time*. They become fixed values and vanish from the output. CSS variables live at *runtime*: they cascade, can be overridden per element, and can change per tenant or theme without a rebuild.

**Say it like this:** "For BpoBox's multi-tenant branding, CSS variables were essential. Each tenant's colours were injected at runtime, so one build served all five tenants. With Sass we'd have needed one build per tenant."

---

**Q43. What does `@property` do?**

**Short answer:** It registers a custom property with a type, for example `<color>` or `<length>`. The browser can then *animate* it, which plain variables can't, because they're just strings.

```css
@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.spinner { background: conic-gradient(from var(--angle), …); animation: spin 2s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
```

---

**Q44. How does native CSS nesting work?**

```css
.card {
  padding: 1rem;
  & .title { font-weight: 600; }
  &:hover { box-shadow: var(--shadow); }
  @media (min-width: 768px) { padding: 2rem; }
}
```

It now works in all modern browsers without Sass.

---

**Q45. What are logical properties?**

**Short answer:** `margin-inline-start`, `padding-block` and `inset-inline` instead of left, right, top and bottom. They flip automatically for right-to-left languages like Arabic and Hebrew. That matters for an interpretation platform.

---

**Q46. What does `aspect-ratio` do?**

**Short answer:** `aspect-ratio: 16 / 9` keeps a box's proportions. It replaces the old "padding-top: 56.25%" hack for video tiles and thumbnails.

---

**Q47. What do `object-fit` and `object-position` do?**

**Short answer:** They control how an `<img>` or `<video>` fills its box. `cover` fills it and crops the overflow (for video tiles), and `contain` fits the whole thing and leaves empty bars (for a screen share, where nothing should be cut off).

---

**Q48. What's a good dark-mode strategy?**

**Short answer:**

1. Define colours as semantic CSS variables (`--color-bg`, `--color-text`).
2. Default to the operating system preference with `prefers-color-scheme`.
3. Let users override it with a `data-theme` attribute on `<html>`.
4. Set `color-scheme: light dark` so native form controls and scrollbars adapt too.

```css
:root { --bg: #fff; --text: #111; color-scheme: light dark; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #111; --text: #eee; } }
[data-theme="dark"] { --bg: #111; --text: #eee; }
body { background: var(--bg); color: var(--text); }
```

---

**Q49. What are `@supports` feature queries?**

```css
@supports (container-type: inline-size) {
  .card-wrap { container-type: inline-size; }
}
```

**Short answer:** They apply styles only if the browser supports a feature. This is progressive enhancement: old browsers get a working basic layout, and new ones get the enhanced version.

---

**Q50. What are cascade layers?**

```css
@layer reset, base, components, utilities;

@layer components { .btn { padding: 8px 16px; } }
@layer utilities  { .p-0 { padding: 0; } }   /* wins, because it's a later layer */
```

**Short answer:** Layers let you set precedence explicitly. A later layer beats an earlier one *regardless of specificity*, and unlayered styles beat all layers. They're great for taming third-party CSS: put the library in a low layer and your styles always win.

---

## 🟡 Intermediate: Animation and Effects

**Q51. Transition vs animation?**

**Short answer:** A transition animates between two states when a property changes, for example on hover. A keyframe animation runs on its own, can loop, and can have many steps.

```css
.btn { transition: background-color 150ms ease; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.speaking-dot { animation: pulse 1s infinite; }
```

---

**Q52. Which properties are cheap to animate?**

**Short answer:** `transform` and `opacity`. The GPU compositor handles them without layout or paint. Animating `width`, `height`, `top`, `left` or `margin` triggers layout on every frame and causes jank on slow devices.

**Example:** Slide a drawer in with `transform: translateX(-100%) → translateX(0)`, not by changing `left`.

---

**Q53. What does `will-change` do?**

**Short answer:** It hints that an element is about to animate, so the browser can move it onto its own GPU layer ahead of time. Apply it just before the animation and remove it afterwards. Applying it everywhere wastes memory and can make things slower.

---

**Q54. How do you respect reduced motion?**

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

**Explanation:** Some users get nausea or migraines from motion (vestibular disorders). WCAG 2.3.3 covers this.

---

**Q55. What is the View Transitions API?**

**Short answer:** `document.startViewTransition(() => updateDOM())` animates smoothly between two DOM states, for example morphing a thumbnail into a detail view. Cross-document view transitions also work for multi-page apps.

---

**Q56. What are scroll-driven animations?**

**Short answer:** `animation-timeline: scroll()` or `view()` ties an animation's progress to scroll position. Reading-progress bars and reveal-on-scroll effects work without JavaScript scroll listeners.

---

**Q57. How does scroll snap work?**

```css
.carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.slide { flex: 0 0 100%; scroll-snap-align: center; }
```

**Short answer:** It gives you a native, touch-friendly carousel without a JavaScript library.

---

## 🔴 Level 3 — Advanced

**Q58. What is the browser's rendering pipeline for CSS?**

**Short answer:** Style calculation → layout → paint → composite. Changing a geometry property (`width`) reruns all four steps. A visual-only property (`color`) reruns paint and composite, and `transform` or `opacity` reruns only composite.

---

**Q59. What is layout thrashing?**

**Short answer:** Alternating style writes and layout reads in a loop. Each read (`offsetHeight`, `getBoundingClientRect`) after a write forces the browser to calculate layout immediately.

```js
// Bad: forces layout on every iteration
items.forEach(el => { el.style.width = box.offsetWidth + 'px'; });
// Good: read once, then write
const w = box.offsetWidth;
items.forEach(el => { el.style.width = w + 'px'; });
```

---

**Q60. What do `contain` and `content-visibility` do?**

**Short answer:** `contain: layout paint style` isolates a subtree so its changes don't affect the rest of the page. `content-visibility: auto` skips rendering off-screen sections entirely, and `contain-intrinsic-size` reserves their space. On long pages this can cut rendering time dramatically.

```css
.call-history-section { content-visibility: auto; contain-intrinsic-size: auto 800px; }
```

---

**Q61. What is critical CSS?**

**Short answer:** Inline the minimum CSS needed for above-the-fold content in `<head>`, so the first paint doesn't wait for the full stylesheet. Load the rest asynchronously. Next.js and other SSR frameworks largely automate this.

---

**Q62. What CSS architecture approaches are there?**

**Short answer:**

- **BEM:** a naming convention, `.card__title--large`.
- **ITCSS / OOCSS:** layered architectures.
- **Utility-first:** Tailwind.
- **CSS Modules:** class names scoped per file.
- **Runtime CSS-in-JS:** styled-components, Emotion.
- **Zero-runtime CSS-in-JS:** vanilla-extract, Panda, Linaria.

**Say it like this:** "For a large React app today, I'd pick Tailwind or CSS Modules with design tokens as CSS variables. Both have zero runtime cost and work with Server Components."

---

**Q63. What are the trade-offs of runtime CSS-in-JS?**

**Short answer:** Pros: styles that depend on props, co-located code, and easy theming. Cons: runtime cost (styles are generated and injected during render), more JavaScript, and friction with React Server Components and streaming SSR. The industry has moved toward zero-runtime solutions and utility CSS.

---

**Q64. How does CSS Modules scoping work?**

**Short answer:** At build time, `.title` in `Card.module.css` is rewritten to a unique name like `Card_title__x7a2`, so classes can't clash between files. `composes` reuses another class, and `:global(.foo)` opts out of scoping.

```tsx
import styles from './Card.module.css';
<h3 className={styles.title}>…</h3>
```

---

**Q65. What does a design tokens pipeline look like?**

**Short answer:** Tokens such as colours, spacing and radii are defined once, in JSON or Figma variables. A tool like Style Dictionary generates CSS variables, TypeScript constants and the Tailwind theme from them, and components consume only the tokens. Designers and developers share a single source of truth.

---

**Q66. What is subgrid?**

**Short answer:** `grid-template-columns: subgrid` lets a nested element align its children to the *parent* grid's tracks. For example, card titles, bodies and buttons line up across a whole row of cards, even when the content lengths differ.

---

**Q67. What is anchor positioning?**

**Short answer:** Pure-CSS positioning of a tooltip or popover relative to another element, using `anchor-name`, `position-anchor` and `anchor()`. It removes the need for libraries like Popper or Floating UI. Check browser support before relying on it.

---

**Q68. How does font loading affect CLS?**

**Short answer:** `font-display: swap` shows a fallback font immediately and swaps in the web font later, which can shift the layout. `optional` uses the web font only if it's already fast. To reduce shift, match the fallback font's metrics with `size-adjust` and `ascent-override` (Next.js `next/font` does this automatically). Also preload critical fonts, self-host WOFF2, and subset the characters.

---

**Q69. How do you keep responsive breakpoints maintainable?**

**Short answer:** Use a few content-driven breakpoints stored as tokens. Prefer container queries and intrinsic layouts (`minmax`, `clamp`, `auto-fit`) over many fixed media queries.

---

**Q70. How do you write print styles?**

```css
@media print {
  nav, .no-print { display: none; }
  a::after { content: " (" attr(href) ")"; }
  .card, tr { break-inside: avoid; }
}
```

---

**Q71. How do you fix specificity wars in a large codebase?**

**Short answer:** Introduce cascade layers, flatten selectors to a single class, ban IDs for styling, use `:where()` for base styles, and enforce a maximum specificity with Stylelint.

---

**Q72. How do you write accessible focus styles?**

```css
:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
```

**Short answer:** Never use `outline: none` without a visible replacement. `:focus-visible` shows the ring for keyboard users but not on mouse clicks. The ring needs 3:1 contrast against what's around it.

---

**Q73. How do you support forced-colours (high contrast) mode?**

**Short answer:** `@media (forced-colors: active)` detects Windows high-contrast mode. The system replaces your colours, so use system colour keywords (`CanvasText`, `ButtonText`, `Highlight`) and show states with borders, not background colour alone.

---

## 🧩 Level 4 — Scenario-Based

**Q74. A modal appears behind the header despite `z-index: 9999`.**

**Answer:** A parent of the modal creates a stacking context (through `transform`, `opacity`, `filter` or `z-index`), so the modal's z-index only counts inside that parent. Fix it by rendering the modal through a React portal into `document.body`, or by using `<dialog>` or the Popover API, which render in the browser's top layer above everything.

---

**Q75. A flex row overflows on mobile because of a long email address.**

**Answer:** Set `min-width: 0` on the flex child, plus `overflow-wrap: anywhere` to wrap or `text-overflow: ellipsis` to truncate (see Q23).

---

**Q76. A `position: sticky` table header doesn't stick.**

**Answer:** An ancestor likely has `overflow: hidden`, or `top` isn't set. Make the table wrapper the scroll container (`overflow: auto; max-height: …`) and apply `position: sticky; top: 0` to the `th` elements.

---

**Q77. A 100vh section is cut off on iPhone.**

**Answer:** `100vh` includes the area behind Safari's toolbar. Use `height: 100vh; height: 100dvh;`, where the first line is a fallback for older browsers.

---

**Q78. Text over a video tile isn't readable.**

**Answer:** Add a gradient scrim behind the text (`linear-gradient(transparent, rgb(0 0 0 / 0.7))`) and check that it meets 4.5:1 contrast. A small text-shadow can help, but the scrim does the real work.

---

**Q79. The theme switch flashes the wrong theme on page load.**

**Answer:** The saved theme is applied too late, after React hydrates. Add a tiny inline script in `<head>` that reads the saved preference and sets `data-theme` on `<html>` *before* the first paint. Also set `color-scheme`.

```html
<script>
  try { document.documentElement.dataset.theme = localStorage.getItem('theme') ?? 'light'; } catch {}
</script>
```

---

**Q80. The CSS bundle is 600 KB and mostly unused.**

**Answer:**

- Split CSS per route.
- Remove unused component libraries.
- Make sure Tailwind's content scanning covers the right files.
- Audit third-party CSS.
- Inline critical CSS.
- Use the Chrome DevTools **Coverage** tab to measure how much CSS is actually used.

---

**Q81. Animations stutter on low-end Android phones.**

**Answer:**

- Animate only `transform` and `opacity`.
- Avoid animating `box-shadow`, `filter: blur` or `width`.
- Reduce the number of layers.
- Respect reduced motion.
- Profile with CPU throttling (4–6x) in DevTools.

---

**Q82. The design system must support five tenants' brand colours without rebuilding.**

**Answer:**

- Components use only **semantic tokens** (`--color-primary`, `--color-surface`, `--color-on-primary`), never raw hex values.
- At startup, the app loads the tenant config and sets those variables on `:root`.
- Each tenant palette is checked for contrast, ideally automatically.

**Say it like this:** "This is what we did on BpoBox: one build, five brands. The tenant config sets about 15 CSS variables at boot, and because every component used semantic tokens, re-theming needed no code changes."

---

**Q83. Build a responsive video grid for 1 to 12 participants.**

```css
.grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
}
.tile {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.tile video { width: 100%; height: 100%; object-fit: cover; }
.tile[data-speaking="true"] { outline: 3px solid var(--speaking); }
```

**Explanation:** `auto-fit` + `minmax` adjusts the number of columns to the screen. `min(280px, 100%)` stops overflow on tiny screens, and `aspect-ratio` keeps tiles 16:9. For a "spotlight" layout, switch to one large tile plus a filmstrip by toggling a class on the container.

---

## 🎯 From Your Resume

**Q84. "How did you theme BpoBox for multiple tenants with Radix?"**

**Say it like this:** "Radix primitives are unstyled. They give you behaviour and accessibility, and you bring the styles. We styled every component with semantic CSS variables. At login the tenant config set those variables on `:root`, so each tenant saw their brand. For states we used Radix's data attributes, like `[data-state="open"]` and `[data-highlighted]`, so we didn't need extra class logic."

---

**Q85. "How did you keep the InterpretIQ call controls accessible over live video?"**

**Say it like this:** "Video is unpredictable. A white wall behind someone ruins the contrast of a transparent control bar. So the bar had a solid background, the focus outline met 3:1 contrast, and touch targets were at least 44px. Muted and camera-off states changed the icon *and* the label, not just the colour, so they never relied on colour alone."

---

**Q86. "How did you handle responsive design for hospital tablets?"**

**Say it like this:** "We designed for landscape and portrait, used container queries so the participant panel adapted when docked, and used `100dvh` for the full-height call view. Because it ran as an installed PWA, we added safe-area insets (`env(safe-area-inset-bottom)`) so controls weren't hidden under system bars. Touch targets were large, because clinicians often use gloves."
