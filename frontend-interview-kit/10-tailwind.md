# 10 — Tailwind CSS

> Tailwind v4 moved configuration into CSS (`@theme`). Many companies still run v3 (`tailwind.config.js`), so know both.

**How this file is organised**

- **Part A — Understand the topic:** what "utility-first" means, how Tailwind generates CSS, and how theming works, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is Tailwind CSS?

Tailwind is a **utility-first** CSS framework. Instead of writing a CSS class per component (`.call-card { … }`), you compose small single-purpose classes directly in your markup:

```html
<!-- Traditional CSS -->
<div class="call-card">…</div>
<style>.call-card { display:flex; padding:1rem; border-radius:.5rem; background:white; }</style>

<!-- Tailwind -->
<div class="flex p-4 rounded-lg bg-white">…</div>
```

Each class does one thing: `flex` sets `display: flex`, `p-4` sets 1rem of padding, and `rounded-lg` sets the border radius.

### How it works under the hood

1. Tailwind **scans your source files** for class names (strings like `p-4`, `md:flex`).
2. It **generates CSS only for the classes it finds**.
3. The production CSS file is tiny, often under 20 KB, because unused classes never exist.

Because it scans for *complete strings*, dynamically built class names like `` `bg-${color}-500` `` won't work. The scanner never sees the full name.

### Design tokens built in

Tailwind's classes come from a **theme**: a scale of spacing, colours, font sizes, breakpoints and radii. Everyone on the team uses `p-4`, not `padding: 17px`, so the UI stays consistent. You customise the theme with your brand tokens.

### Variants: responsive and state styles

Prefixes apply a class only in certain conditions:

- **Responsive (mobile-first):** `md:grid-cols-3` applies from the medium breakpoint upwards.
- **State:** `hover:`, `focus-visible:`, `disabled:`, `aria-pressed:`, `data-[state=open]:`.
- **Dark mode:** `dark:bg-slate-900`.

### Utility-first vs component frameworks

| | Bootstrap (component framework) | Tailwind (utility-first) |
|---|---|---|
| Gives you | ready-made `.btn`, `.card` | building blocks + design tokens |
| Look | "looks like Bootstrap" unless overridden | fully custom |
| CSS size | ships all components | only what you use |
| Customisation | override existing styles | compose from scratch |

### Why interviewers ask about Tailwind

It's now the most popular styling approach in React and Next.js. Interviewers check whether you can keep Tailwind code maintainable (components, variants, `cn()`), handle dynamic classes, build themes (multi-tenant branding), and style headless libraries like Radix, which you used on BpoBox.

---

## Part B — Interview Questions and Answers

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is Tailwind CSS?**

**Short answer:** A utility-first CSS framework where you compose small single-purpose classes in your markup.

**Explanation:** Classes come from a design-token theme, so spacing and colours stay consistent, and only the classes you use are generated.

**Example:**

```html
<div class="flex items-center gap-2 rounded-lg bg-white p-4 shadow">…</div>
```

**Say it like this:** "Tailwind gives me a design system as utility classes; I compose them in JSX without naming classes or switching files."

---

**Q2. Utility-first vs component CSS like Bootstrap?**

**Short answer:** Bootstrap gives prebuilt components with a fixed look; Tailwind gives building blocks and tokens to build your own.

**Explanation:** Bootstrap sites look alike unless heavily overridden; Tailwind designs are fully custom.

**Example:** Bootstrap: `<button class="btn btn-primary">`. Tailwind: `<button class="rounded-md bg-brand px-4 py-2 text-white">`.

**Say it like this:** "Bootstrap is a component kit; Tailwind is a design-token toolkit for building our own components."

---

**Q3. What are Tailwind's advantages?**

**Short answer:** No class naming, consistent scales, tiny production CSS, co-located styles, fast iteration, easy variants and no runtime cost.

**Explanation:** The zero runtime cost makes it a good fit for Server Components and streaming.

**Example:** A typical app ships 10–20 KB of CSS because only used classes are generated.

**Say it like this:** "Consistency, speed and a tiny CSS bundle with no runtime are why I like Tailwind."

---

**Q4. What are its disadvantages?**

**Short answer:** Long class lists, a learning curve, the need for component abstractions, and dynamic class names not being detected.

**Explanation:** The answer to "messy HTML" is extracting components with variants, so long lists live in one place.

**Example:** A 20-class button becomes `<Button intent="primary" size="sm">` using `cva`.

**Say it like this:** "The class lists are long, but I don't repeat them; they live inside components with typed variants."

---

**Q5. How do you install Tailwind v4 in a Vite or Next.js app?**

**Short answer:** Install `tailwindcss` with the Vite plugin or PostCSS plugin, then add `@import "tailwindcss";` to your CSS.

**Explanation:** v4 detects source files automatically and moves configuration into CSS.

**Example:**

```css
@import "tailwindcss";
@theme { --color-brand: #0b5fff; }
```

**Say it like this:** "In v4 setup is one import plus the bundler plugin; theme config lives in CSS."

---

**Q6. How does the spacing scale work?**

**Short answer:** Utilities like `p-4` use multiples of a base unit: `p-4` is 1rem, `p-2` is 0.5rem.

**Explanation:** Variants include `px-`, `py-`, `mt-`, `gap-` and negative margins like `-mt-2`.

**Example:** `class="px-4 py-2 mt-6 gap-3"`.

**Say it like this:** "The spacing scale keeps rhythm consistent; nobody invents `padding: 13px`."

---

**Q7. What are the sizing utilities?**

**Short answer:** `w-full`, `w-1/2`, `max-w-screen-lg`, `h-dvh`, `min-h-screen` and `size-10`.

**Explanation:** `size-*` sets width and height together, useful for icons and avatars.

**Example:** `<img class="size-10 rounded-full" …>`.

**Say it like this:** "`size-10` for square avatars and `h-dvh` for full-height mobile screens are ones I use constantly."

---

**Q8. What are the typography utilities?**

**Short answer:** `text-sm/6`, `font-semibold`, `tracking-tight`, `leading-relaxed`, `truncate`, `line-clamp-2` and `text-balance`.

**Explanation:** `text-sm/6` sets size and line height together; `line-clamp` truncates multi-line text.

**Example:** `<p class="text-sm/6 text-slate-600 line-clamp-2">{transcriptPreview}</p>`.

**Say it like this:** "`truncate` and `line-clamp` handle long agent names and transcript previews cleanly."

---

**Q9. How do colours work?**

**Short answer:** A palette with shades 50–950 (`bg-slate-900`, `text-emerald-600`) plus opacity modifiers like `bg-black/50`.

**Explanation:** For brands, define semantic colours in the theme rather than using raw palette colours everywhere.

**Example:** `class="bg-black/50 text-white"` for an overlay.

**Say it like this:** "Palette colours for prototypes, semantic tokens like `bg-primary` for real products."

---

**Q10. What are the flex and grid utilities?**

**Short answer:** Classes like `flex items-center justify-between gap-2` and `grid grid-cols-1 md:grid-cols-3 gap-4`.

**Explanation:** Responsive prefixes change layouts at breakpoints without media queries in CSS.

**Example:**

```html
<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
  <div class="md:col-span-2">Main</div><aside>Side</aside>
</div>
```

**Say it like this:** "Layouts are readable in the markup: one column on mobile, three from medium up."

---

**Q11. How do responsive prefixes work?**

**Short answer:** Mobile-first: unprefixed classes apply everywhere and `sm:`, `md:`, `lg:` apply from that breakpoint up; `max-md:` targets below.

**Explanation:** Write the mobile style first, then override for larger screens.

**Example:** `<div class="flex flex-col md:flex-row">`.

**Say it like this:** "Base classes are the mobile design; prefixes enhance it for larger screens."

---

**Q12. What state variants are there?**

**Short answer:** `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `checked:`, `first:`, `last:`, `odd:` and `invalid:`.

**Explanation:** Variants stack, like `md:hover:bg-blue-700`.

**Example:** `<button class="bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 disabled:opacity-50">Save</button>`.

**Say it like this:** "States are just prefixes, and I always include `focus-visible` styles for keyboard users."

---

**Q13. How does dark mode work?**

**Short answer:** `dark:` variants follow the OS preference by default, or a class/attribute strategy for a user toggle.

**Explanation:** With semantic CSS-variable tokens, dark mode is often just different variable values.

**Example:** `class="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"`.

**Say it like this:** "I prefer semantic tokens that switch per theme, using `dark:` only for exceptions."

---

**Q14. What are arbitrary values?**

**Short answer:** One-off values in square brackets, like `top-[117px]` or `grid-cols-[240px_1fr]`.

**Explanation:** They're an escape hatch; frequent use means the theme is missing a token.

**Example:** `class="grid grid-cols-[240px_1fr]"` for an app shell.

**Say it like this:** "Arbitrary values are fine occasionally; if they repeat, they become theme tokens."

---

**Q15. What is Preflight?**

**Short answer:** Tailwind's base reset: no default margins, `border-box`, unstyled lists and block images.

**Explanation:** It gives a consistent starting point, but means you must style headings and lists yourself (or use the typography plugin).

**Example:** An `<h1>` renders at body size until you add `text-3xl font-bold`.

**Say it like this:** "Preflight levels the playing field across browsers; I style semantics explicitly on top."

---

## 🟡 Level 2 — Intermediate

**Q16. How does Tailwind generate only the CSS you use?**

**Short answer:** It scans source files for class-name strings and generates rules only for those.

**Explanation:** v4 detects sources automatically; v3 uses the `content` array.

**Example:** If no file contains `bg-red-500`, no CSS rule for it exists in the build.

**Say it like this:** "Tailwind is a build-time scanner: unused classes never exist in the output."

---

**Q17. Why don't dynamic classes like `` `bg-${color}-500` `` work?**

**Short answer:** The scanner only sees complete strings, so the full class name never appears and its CSS isn't generated.

**Explanation:** Map values to complete class names, or safelist them.

**Example:**

```ts
const statusColor = { live: 'bg-emerald-500', reconnecting: 'bg-amber-500', failed: 'bg-red-500' } as const;
<span className={statusColor[status]} />
```

**Say it like this:** "Class names must appear in full in the source, so dynamic styles go through a lookup map."

---

**Q18. How do you customise the theme in v4?**

**Short answer:** Define tokens as CSS variables in `@theme`.

**Explanation:** Each token generates utilities and is also available as a normal CSS variable.

**Example:**

```css
@theme {
  --color-brand: oklch(62% 0.16 160);
  --font-sans: "Inter", system-ui, sans-serif;
  --radius-card: 12px;
}
```

**Say it like this:** "In v4, the theme is CSS variables, so the same tokens work in utilities and plain CSS."

---

**Q19. How do you customise the theme in v3?**

**Short answer:** Extend the theme in `tailwind.config.js`.

**Explanation:** `extend` adds to defaults; setting a key directly replaces it.

**Example:**

```js
module.exports = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: '#0b5fff' } } } };
```

**Say it like this:** "In v3 tokens live in the config's `extend` block, so the defaults stay available."

---

**Q20. When do you use `@apply`?**

**Short answer:** For base element styles or overriding third-party widgets; otherwise prefer React components.

**Explanation:** Overusing `@apply` recreates naming and separate CSS files, the problems Tailwind avoids.

**Example:**

```css
.prose-link { @apply text-brand underline underline-offset-2 hover:no-underline; }
```

**Say it like this:** "`@apply` is for the edges, like styling CMS links; components are my main reuse tool."

---

**Q21. What are the group and peer variants?**

**Short answer:** `group-*` styles a child based on a parent's state; `peer-*` styles an element based on a previous sibling's state.

**Explanation:** Named groups like `group/item` handle nesting.

**Example:**

```html
<a class="group"><span class="group-hover:underline">Call with Maria</span></a>
<input class="peer" required /><p class="hidden peer-invalid:block">Required</p>
```

**Say it like this:** "Group and peer variants handle parent- and sibling-driven styles without JavaScript."

---

**Q22. What are the `has-*`, `aria-*` and `data-*` variants?**

**Short answer:** Variants that style elements from `:has()`, ARIA attributes or data attributes.

**Explanation:** Visual state can't drift from accessible state when both come from the same attribute.

**Example:**

```html
<button class="aria-pressed:bg-red-600" aria-pressed="true">Mute</button>
<div class="data-[state=open]:animate-in">…</div>
```

**Say it like this:** "I style toggles with `aria-pressed:`, so the visual and accessible state are always the same thing."

---

**Q23. How do container queries work in Tailwind?**

**Short answer:** Mark a parent with `@container` and use `@sm:`, `@md:` variants on children.

**Explanation:** Components respond to their container's width, not the viewport.

**Example:**

```html
<div class="@container"><div class="flex flex-col @md:flex-row">…</div></div>
```

**Say it like this:** "Container variants let the same card work in a sidebar and a main column."

---

**Q24. How do you manage conditional classes and conflicts?**

**Short answer:** Use `clsx` for conditions and `tailwind-merge` to resolve conflicts, combined in a `cn()` helper.

**Explanation:** Without merging, `p-2` and `p-4` both end up in the HTML and CSS order decides.

**Example:**

```ts
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
<button className={cn('px-4 py-2', isActive && 'bg-brand text-white', className)} />
```

**Say it like this:** "`cn()` handles conditions and lets a parent's `className` override reliably."

---

**Q25. How do you build component variants with `cva`?**

**Short answer:** `cva` maps typed variant props to class strings.

**Explanation:** It gives a design-system API (`intent`, `size`) with TypeScript types derived from the config.

**Example:**

```ts
export const button = cva('inline-flex items-center rounded-md font-medium disabled:opacity-50', {
  variants: {
    intent: { primary: 'bg-brand text-white', danger: 'bg-red-600 text-white', ghost: 'hover:bg-slate-100' },
    size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

**Say it like this:** "`cva` turns Tailwind classes into a typed component API, like `<Button intent="danger" size="sm">`."

---

**Q26. What are the options for reusing styles?**

**Short answer:** Components first, then `cva` variants, then `@apply` for base layers, then custom utilities.

**Explanation:** Components keep markup, behaviour and styles together.

**Example:** `<Card>`, `<Badge variant="success">`, and a `@utility scrollbar-hidden`.

**Say it like this:** "Reuse lives in components; the CSS-level tools are for edge cases."

---

**Q27. How do you create custom utilities and variants in v4?**

**Short answer:** `@utility` defines new utility classes and `@custom-variant` defines new variants.

**Explanation:** They extend Tailwind consistently instead of writing ad-hoc CSS classes.

**Example:**

```css
@utility scrollbar-hidden { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

**Say it like this:** "When I need a reusable style Tailwind lacks, I add a proper utility rather than a one-off class."

---

**Q28. How do animations work?**

**Short answer:** Built-in animations like `animate-spin` and `animate-pulse`, custom keyframes in the theme, and `motion-safe:`/`motion-reduce:` variants.

**Explanation:** The motion variants respect the user's reduced-motion setting.

**Example:** `<span class="motion-safe:animate-pulse">● Live</span>`.

**Say it like this:** "Animations are wrapped in `motion-safe`, so users who opt out of motion don't see them."

---

**Q29. Which accessibility helpers does Tailwind have?**

**Short answer:** `sr-only`, `not-sr-only`, `focus-visible:ring-2`, `motion-reduce:` and `forced-colors:`.

**Explanation:** `sr-only` hides content visually but keeps it for screen readers.

**Example:**

```html
<button><svg aria-hidden="true">…</svg><span class="sr-only">Mute microphone</span></button>
```

**Say it like this:** "Icon buttons get `sr-only` labels, and every focusable element gets a `focus-visible` ring."

---

**Q30. What do the typography and forms plugins do?**

**Short answer:** The typography plugin's `prose` classes style rendered markdown; the forms plugin normalises form controls.

**Explanation:** `prose` is ideal for LLM chat output and CMS content you don't control.

**Example:** `<div class="prose dark:prose-invert max-w-prose">{renderedMarkdown}</div>`.

**Say it like this:** "AI chat answers render inside `prose`, so headings, lists and code look right without custom CSS."

---

## 🔴 Level 3 — Advanced

**Q31. How do you use design tokens with Tailwind for multiple brands or tenants?**

**Short answer:** Semantic tokens in the theme point to CSS variables, which each tenant sets at runtime.

**Explanation:** Components use `bg-primary`, never raw palette colours, so re-branding needs no rebuild.

**Example:**

```css
@theme { --color-primary: var(--tenant-primary); --color-surface: var(--tenant-surface); }
:root { --tenant-primary: #0b5fff; }
[data-tenant="acme"] { --tenant-primary: #e11d48; }
```

**Say it like this:** "One build serves every tenant: a few CSS variables change at login and the whole UI re-brands."

---

**Q32. How do you combine dark mode with tenant themes?**

**Short answer:** Give semantic tokens light and dark values and combine them with the tenant's accent, checking contrast for every combination.

**Explanation:** Five tenants × two modes = ten palettes to verify.

**Example:** `--surface` switches with the theme; `--primary` comes from the tenant; a Storybook toolbar previews all combinations.

**Say it like this:** "Mode controls surfaces and text, the tenant controls the accent, and we verify contrast for each combination."

---

**Q33. How do you use Tailwind in a component library consumed by several apps?**

**Short answer:** Ship components with Tailwind classes and a shared theme, and have consumers scan the library's files, or ship precompiled CSS.

**Explanation:** If consumers don't scan the library, its classes are missing in their builds.

**Example:**

```css
@import "tailwindcss";
@source "../node_modules/@org/ui";
```

**Say it like this:** "The library shares the theme, and each app scans it so its classes are generated."

---

**Q34. How does Tailwind use cascade layers?**

**Short answer:** v4 uses native `@layer theme, base, components, utilities`.

**Explanation:** Put component styles in `@layer components` so utility classes can override them.

**Example:**

```css
@layer components { .card { @apply rounded-lg p-4; } }
<div class="card p-0">  <!-- p-0 wins -->
```

**Say it like this:** "Layers guarantee utilities win over component styles, so overrides are predictable."

---

**Q35. What are the performance considerations?**

**Short answer:** Output CSS is small and there's no runtime cost; the main cost is longer class strings in HTML and JS.

**Explanation:** That makes it work well with Server Components and streaming, unlike runtime CSS-in-JS.

**Example:** Switching a dashboard from styled-components to Tailwind removed style generation from every render.

**Say it like this:** "Tailwind costs nothing at runtime, which matters for render performance and RSC."

---

**Q36. How do you lint and format Tailwind classes?**

**Short answer:** `prettier-plugin-tailwindcss` sorts classes, and ESLint plugins flag conflicts and invalid classes.

**Explanation:** Consistent order makes diffs and reviews easier.

**Example:** Prettier rewrites `class="text-white p-4 bg-brand"` into its canonical order automatically.

**Say it like this:** "Formatting is automated, so reviews never argue about class order."

---

**Q37. What is shadcn/ui, and what are its trade-offs?**

**Short answer:** Copy-paste components built on Radix, Tailwind and `cva`, added to your repo by a CLI.

**Explanation:** You own and can customise everything, with accessible primitives, but you maintain upgrades yourself.

**Example:** `npx shadcn add dialog` copies `components/ui/dialog.tsx` into the project.

**Say it like this:** "shadcn gives a fast, accessible starting point that we fully own, at the cost of no automatic updates."

---

**Q38. What are the key changes when migrating from v3 to v4?**

**Short answer:** CSS-first config with `@theme`, automatic content detection, `@import "tailwindcss"`, some renamed utilities and modern CSS features underneath.

**Explanation:** Run the upgrade tool and review visual diffs.

**Example:** `npx @tailwindcss/upgrade` converts the config and rewrites renamed classes.

**Say it like this:** "The upgrade tool does most of it; visual regression tests catch the rest."

---

**Q39. Can you use Tailwind with CSS Modules or other CSS?**

**Short answer:** Yes, but keep one primary approach; use `@reference` in module files to access theme values in v4.

**Explanation:** Mixing approaches freely makes styles hard to find and override.

**Example:**

```css
/* Chart.module.css */
@reference "../app.css";
.tooltip { @apply rounded bg-slate-900 text-white; }
```

**Say it like this:** "Tailwind is primary; CSS Modules only for rare complex cases, still using the same tokens."

---

**Q40. How do you keep long class lists readable?**

**Short answer:** Extract components, use variants, avoid one-off values, and group classes by concern inside `cn()`.

**Explanation:** Readability comes from structure, not from shorter class names.

**Example:**

```tsx
className={cn('flex items-center gap-2', 'rounded-md px-4 py-2', 'bg-primary text-white', 'hover:bg-primary/90 disabled:opacity-50')}
```

**Say it like this:** "I group classes by layout, spacing, colour and state, and anything repeated becomes a component."

---

## 🧩 Level 4 — Scenario-Based

**Q41. The production build is missing some classes that work locally.**

**Short answer:** The classes are built dynamically or live in unscanned files; use complete class names, add `@source`, or safelist.

**Explanation:** Dev mode can hide this because classes were generated earlier during development.

**Example:** Status colours built as `` `bg-${color}-100` `` were missing in production until moved to a lookup map.

**Say it like this:** "Missing classes in production almost always mean the scanner never saw the full class name."

---

**Q42. Two classes conflict when a parent passes `className` to a Button.**

**Short answer:** Merge with `tailwind-merge` inside the component using `cn(base, className)`.

**Explanation:** The parent's class then reliably wins.

**Example:** `<Button className="px-8" />` overrides the base `px-4` instead of both being applied.

**Say it like this:** "Every component merges incoming classes, so overrides behave predictably."

---

**Q43. Designers changed the brand colour, and you'd have to update 300 files.**

**Short answer:** Use semantic tokens so a brand change is one variable; migrate existing raw colours with a codemod.

**Explanation:** Raw palette classes couple every component to a specific colour.

**Example:** Replace `bg-blue-600` with `bg-primary` across the codebase with a script, then change `--color-primary` once.

**Say it like this:** "Semantic tokens turn a 300-file change into one line."

---

**Q44. Status badges need colours based on values from the API.**

**Short answer:** A typed map of complete class strings with a fallback for unknown statuses.

**Explanation:** Complete strings are detected by the scanner, and the fallback handles new statuses gracefully.

**Example:**

```ts
const badge: Record<CallStatus, string> = { scored: 'bg-emerald-100 text-emerald-800', pending: 'bg-amber-100 text-amber-800', failed: 'bg-red-100 text-red-800' };
<span className={badge[status] ?? 'bg-slate-100 text-slate-800'}>{label}</span>
```

**Say it like this:** "A typed lookup map keeps class names detectable and handles unexpected statuses."

---

**Q45. Rich LLM markdown output needs styling.**

**Short answer:** Use `prose` with `dark:prose-invert`, constrain the width, and sanitise the HTML first.

**Explanation:** `prose` styles content you don't control; sanitising prevents XSS from model output.

**Example:** `<div className="prose dark:prose-invert max-w-prose" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />`.

**Say it like this:** "Typography plugin for the look, sanitisation for safety."

---

**Q46. A modal built with Radix needs open and close animations.**

**Short answer:** Animate from Radix's `data-state` attribute with `data-[state=open]:` and `data-[state=closed]:` variants, respecting `motion-reduce`.

**Explanation:** Radix keeps the element mounted during exit animations when configured.

**Example:**

```html
<Dialog.Content class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 motion-reduce:animate-none">
```

**Say it like this:** "Radix exposes state as data attributes, so animations are just Tailwind variants."

---

## 🎯 From Your Resume

**Q47. "How did you style Radix components in BpoBox?"**

**Short answer:** With Tailwind `data-[…]` variants on Radix's state attributes and semantic tenant tokens.

**Explanation:** Radix handled behaviour and accessibility; we added only visuals, with no extra React state.

**Example:**

```tsx
<DropdownMenu.Item className="rounded px-3 py-2 outline-none data-[highlighted]:bg-slate-100 data-[disabled]:opacity-50" />
<Switch.Root className="h-6 w-10 rounded-full bg-slate-300 data-[state=checked]:bg-primary" />
```

**Say it like this:** "Radix exposed state as data attributes, and Tailwind variants styled those states with each tenant's tokens."

---

**Q48. "How did you give each tenant its own branding?"**

**Short answer:** The tenant config set CSS variables at login, and Tailwind's semantic tokens pointed to them.

**Explanation:** No rebuild per tenant, and each palette was checked for WCAG contrast.

**Example:** `bg-primary` rendered blue for one tenant and crimson for another from the same build.

**Say it like this:** "One build, many brands: a handful of CSS variables set per tenant, and every component used semantic classes."

---

**Q49. "Did you use Tailwind on InterpretIQ or the shared component library?"**

**Short answer:** Answer truthfully about which styling approach each product used and why.

**Explanation:** If they differed, explain how the shared library stayed compatible: tokens as CSS variables work with Tailwind, CSS Modules or plain CSS.

**Example:** "BpoBox used Tailwind; InterpretIQ used [CSS Modules]. Both consumed the same CSS-variable tokens, so shared components looked consistent." *(Adjust to the truth.)*

**Say it like this:** "The common layer was design tokens as CSS variables, which let both products share components regardless of styling approach."
