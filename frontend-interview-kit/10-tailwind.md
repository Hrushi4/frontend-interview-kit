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

## 🟢 Level 1 — Basics

**Q1. What is Tailwind CSS?**

**Short answer:** A utility-first CSS framework. You compose small, single-purpose classes (`flex`, `p-4`, `text-sm`) in your markup instead of writing custom CSS for each component.

**Say it like this:** "Tailwind gives me a design system as utility classes. I build UI by composing them right in the JSX, so there's no switching between files, no naming classes, and the spacing and colours stay consistent automatically."

---

**Q2. Utility-first vs component CSS like Bootstrap?**

**Short answer:** Bootstrap gives you prebuilt components (`.btn`, `.card`) with a fixed look. Tailwind gives you building blocks and a token system, and you build your own components, so the design is fully custom.

---

**Q3. What are Tailwind's advantages?**

**Short answer:**

- No time spent naming classes.
- A consistent spacing and colour scale.
- A tiny production CSS file.
- Styles live next to the markup.
- Fast iteration.
- Easy responsive and state variants.
- No runtime cost.

---

**Q4. What are its disadvantages?**

**Short answer:**

- Long class lists that can look messy.
- A learning curve for the class names.
- You need component abstractions to reuse styles.
- Dynamically built class names aren't detected.

**Say it like this:** "The common complaint is 'ugly HTML'. The answer is that you don't repeat class lists. You extract components like `<Button>` with variants, so the long list lives in one place."

---

**Q5. How do you install Tailwind v4 in a Vite or Next.js app?**

**Short answer:** Install `tailwindcss` with the `@tailwindcss/vite` plugin (or the PostCSS plugin for Next.js), then add one line to your CSS:

```css
@import "tailwindcss";
```

---

**Q6. How does the spacing scale work?**

**Short answer:** Spacing utilities are multiples of a base unit: `p-4` is `1rem` (16px) and `p-2` is `0.5rem`. Variants include `px-`, `py-`, `pt-`, `m-`, `gap-` and `space-x-`. Negative margins look like `-mt-2`.

---

**Q7. What are the sizing utilities?**

**Short answer:** `w-full`, `w-1/2`, `max-w-screen-lg`, `h-dvh`, `min-h-screen`, and `size-10`, which sets width and height together.

---

**Q8. What are the typography utilities?**

**Short answer:** `text-sm/6` sets the font size and line height together. Others include `font-semibold`, `tracking-tight`, `leading-relaxed`, `truncate` (one line with "…"), `line-clamp-2` (two lines with "…") and `text-balance` (balanced line breaks in headings).

---

**Q9. How do colours work?**

**Short answer:** A palette with shades from 50 to 950: `bg-slate-900`, `text-emerald-600`, `border-gray-200`. Add an opacity modifier with a slash: `bg-black/50`.

---

**Q10. What are the flex and grid utilities?**

```html
<div class="flex items-center justify-between gap-2">…</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="md:col-span-2">Main</div><aside>Side</aside>
</div>
```

---

**Q11. How do responsive prefixes work?**

**Short answer:** Tailwind is **mobile-first**. Classes without a prefix apply at all sizes, and `sm:`, `md:`, `lg:`, `xl:` and `2xl:` apply *from that breakpoint upwards*. `max-md:` targets screens below a breakpoint.

```html
<div class="flex flex-col md:flex-row">   <!-- column on mobile, row from md up -->
```

---

**Q12. What state variants are there?**

**Short answer:** `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `checked:`, `first:`, `last:`, `odd:`, `placeholder:` and `invalid:`.

```html
<button class="bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 disabled:opacity-50">Save</button>
```

---

**Q13. How does dark mode work?**

**Short answer:** Write `dark:bg-slate-900`. By default it follows the OS `prefers-color-scheme`. For a user toggle, switch to a class- or attribute-based strategy (`data-theme="dark"` on `<html>`).

---

**Q14. What are arbitrary values?**

**Short answer:** Square brackets let you use one-off values: `top-[117px]`, `bg-[#0b5]`, `grid-cols-[240px_1fr]`, `w-[calc(100%-2rem)]`. They're an escape hatch. If you use them a lot, it usually means a token is missing from your theme.

---

**Q15. What is Preflight?**

**Short answer:** Tailwind's base reset. It removes default margins, sets `box-sizing: border-box`, removes list styles and makes images block-level, so you start from a consistent baseline.

---

## 🟡 Level 2 — Intermediate

**Q16. How does Tailwind generate only the CSS you use?**

**Short answer:** It scans your source files for strings that look like class names and generates rules only for those. Tailwind v4 detects source files automatically, while v3 uses the `content` array in its config.

---

**Q17. Why don't dynamic classes like `` `bg-${color}-500` `` work?**

**Short answer:** The scanner only sees complete strings in your code. `bg-${color}-500` never appears in full, so the CSS for `bg-red-500` is never generated.

**Fix:** map values to *complete* class names:

```ts
const statusColor = {
  live: 'bg-emerald-500',
  reconnecting: 'bg-amber-500',
  failed: 'bg-red-500',
} as const;

<span className={statusColor[status]} />
```

Alternatively, safelist the classes (`@source inline(...)` in v4, or `safelist` in v3).

**Say it like this:** "Tailwind is a build-time scanner, not a runtime. Class names must appear in full somewhere in the source, so I use lookup maps for dynamic styles."

---

**Q18. How do you customise the theme in v4?**

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(62% 0.16 160);
  --font-sans: "Inter", system-ui, sans-serif;
  --breakpoint-3xl: 120rem;
  --radius-card: 12px;
}
```

**Short answer:** In v4 you define tokens as CSS variables inside `@theme`. This example generates `bg-brand`, `text-brand`, `font-sans`, the `3xl:` variant and `rounded-card`. The tokens are also available as normal CSS variables (`var(--color-brand)`).

---

**Q19. How do you customise the theme in v3?**

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { brand: '#0b5fff' } } },
};
```

---

**Q20. When do you use `@apply`?**

**Short answer:** It composes utilities inside CSS. It's useful for base element styles or for overriding third-party widgets. Overusing it brings back the problems Tailwind solves (naming, separate files), so prefer extracting React components.

```css
.prose-link { @apply text-brand underline underline-offset-2 hover:no-underline; }
```

---

**Q21. What are the group and peer variants?**

```html
<!-- style a child based on the PARENT's hover -->
<a class="group">
  <span class="group-hover:underline">Call with Maria</span>
</a>

<!-- style an element based on a SIBLING's state -->
<input class="peer" required />
<p class="hidden peer-invalid:block text-red-600">This field is required</p>
```

**Short answer:** `group-*` reacts to a parent's state and `peer-*` reacts to a previous sibling's state. Named groups (`group/item` with `group-hover/item:`) handle nested groups.

---

**Q22. What are the `has-*`, `aria-*` and `data-*` variants?**

```html
<label class="has-[:checked]:bg-blue-50">…</label>
<button class="aria-pressed:bg-red-600" aria-pressed="true">Mute</button>
<svg class="aria-expanded:rotate-180">…</svg>
<div class="data-[state=open]:animate-in">…</div>
```

**Short answer:** They style elements straight from accessibility and state attributes. Your ARIA state and your visual state then can't drift apart.

**Say it like this:** "I style toggles with `aria-pressed:` instead of a separate `isActive` class. The accessible state is the visual state, so they can never disagree."

---

**Q23. How do container queries work in Tailwind?**

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row">…</div>
</div>
```

**Short answer:** They're built into v4. Mark the parent with `@container`, then children use `@sm:` and `@md:` variants based on the *container's* width rather than the viewport's.

---

**Q24. How do you manage conditional classes and conflicts?**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

<button className={cn('px-4 py-2 rounded-md', isActive && 'bg-brand text-white', className)} />
```

**Short answer:** `clsx` handles the conditions. `tailwind-merge` resolves conflicts, so if the component has `p-2` and the parent passes `p-4`, only `p-4` stays. Without it, both classes would be in the HTML and the CSS order would decide.

---

**Q25. How do you build component variants with `cva`?**

```ts
import { cva, type VariantProps } from 'class-variance-authority';

export const button = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
  {
    variants: {
      intent: {
        primary: 'bg-brand text-white hover:bg-brand/90',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'hover:bg-slate-100',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', icon: 'size-10' },
    },
    defaultVariants: { intent: 'primary', size: 'md' },
  },
);

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof button>;
export function Button({ intent, size, className, ...rest }: ButtonProps) {
  return <button className={cn(button({ intent, size }), className)} {...rest} />;
}

<Button intent="danger" size="sm">End call</Button>
```

**Short answer:** `cva` (class-variance-authority) maps typed props to class strings, giving you a design-system API (`intent`, `size`) on top of Tailwind.

---

**Q26. What are the options for reusing styles?**

**Short answer:** In order of preference: React components, `cva` variants, `@apply` for base layers, and custom utilities with `@utility` in v4.

---

**Q27. How do you create custom utilities and variants in v4?**

```css
@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

Usage: `class="scrollbar-hidden theme-midnight:bg-indigo-950"`.

---

**Q28. How do animations work?**

**Short answer:** There are built-in animations (`animate-spin`, `animate-pulse`, `animate-bounce`), and you can define custom keyframes in the theme. The `motion-safe:` and `motion-reduce:` variants respect the user's reduced-motion setting.

```html
<span class="motion-safe:animate-pulse">● Live</span>
```

---

**Q29. Which accessibility helpers does Tailwind have?**

**Short answer:** `sr-only` (hidden visually but read by screen readers), `not-sr-only`, `focus-visible:ring-2`, `motion-reduce:transition-none` and the `forced-colors:` variant.

```html
<button><svg aria-hidden="true">…</svg><span class="sr-only">Mute microphone</span></button>
```

---

**Q30. What do the typography and forms plugins do?**

**Short answer:** `@tailwindcss/typography` adds `prose` classes that style rendered markdown or CMS content (headings, lists, code), which is perfect for LLM chat output. The forms plugin normalises form controls so they're easy to style.

---

## 🔴 Level 3 — Advanced

**Q31. How do you use design tokens with Tailwind for multiple brands or tenants?**

```css
@theme {
  --color-primary: var(--tenant-primary);
  --color-surface: var(--tenant-surface);
}
:root { --tenant-primary: #0b5fff; --tenant-surface: #ffffff; }
[data-tenant="acme"] { --tenant-primary: #e11d48; }
```

**Short answer:** Define **semantic tokens** (`primary`, `surface`) that point to CSS variables, and set those variables per tenant at runtime. Components use `bg-primary`, never raw palette colours like `bg-blue-600`, so re-branding needs no rebuild.

**Say it like this:** "One build serves every tenant. The tenant config sets a handful of CSS variables at login, and since every component uses semantic classes like `bg-primary`, the whole UI re-brands instantly."

---

**Q32. How do you combine dark mode with tenant themes?**

**Short answer:** Give each semantic token a light and a dark value (for example `--surface`), and combine those with the tenant's accent colour. Check contrast for *every* combination, and test with a theme switcher in Storybook.

---

**Q33. How do you use Tailwind in a component library consumed by several apps?**

**Short answer:** Ship components with Tailwind classes plus a shared theme CSS file. Consumer apps must scan the library's built files (`@source "../node_modules/@org/ui"`), or the library ships precompiled CSS. Add a prefix if it has to coexist with other CSS frameworks.

---

**Q34. How does Tailwind use cascade layers?**

**Short answer:** v4 uses native `@layer theme, base, components, utilities`. Put custom component styles in `@layer components`, so utility classes can still override them.

---

**Q35. What are the performance considerations?**

**Short answer:** The output CSS is small, and the main cost is long class strings in HTML and JavaScript. There's **no runtime cost**, so it works perfectly with React Server Components and streaming. Runtime CSS-in-JS libraries, by contrast, generate styles while rendering.

---

**Q36. How do you lint and format Tailwind classes?**

**Short answer:** `prettier-plugin-tailwindcss` sorts classes into a consistent order, and ESLint plugins flag conflicting or invalid classes.

---

**Q37. What is shadcn/ui, and what are its trade-offs?**

**Short answer:** A collection of copy-paste components built on Radix, Tailwind and `cva`. A CLI copies the source code into your repo. You fully own and can customise everything, and the primitives are accessible. The downside is that you maintain upgrades yourself, since there's no `npm update`.

---

**Q38. What are the key changes when migrating from v3 to v4?**

**Short answer:**

- CSS-first configuration (`@theme` instead of `tailwind.config.js`).
- Automatic content detection.
- A new `@import "tailwindcss"` syntax.
- Some renamed utilities.
- Modern CSS underneath (cascade layers, `@property`, `color-mix`).

Run the official upgrade tool, then review the visual diffs.

---

**Q39. Can you use Tailwind with CSS Modules or other CSS?**

**Short answer:** Yes, but keep one primary approach. In v4, use `@reference` inside module files to access theme values.

---

**Q40. How do you keep long class lists readable?**

**Short answer:** Extract components, use variants, and avoid one-off arbitrary values. Split classes across lines by concern inside `cn()`:

```tsx
className={cn(
  'flex items-center gap-2',          // layout
  'px-4 py-2 rounded-md',             // spacing + shape
  'bg-primary text-white',            // colour
  'hover:bg-primary/90 disabled:opacity-50', // states
)}
```

---

## 🧩 Level 4 — Scenario-Based

**Q41. The production build is missing some classes that work locally.**

**Answer:** Either the class names are built dynamically or come from data or a CMS, or some source files aren't being scanned (for example, a package in `node_modules`). Use complete class names in maps, add `@source` for the missing paths, or safelist the classes.

---

**Q42. Two classes conflict when a parent passes `className` to a Button.**

**Answer:** Merge them inside the component with `tailwind-merge`, using `cn(base, className)`, so the parent's override wins predictably.

---

**Q43. Designers changed the brand colour, and you'd have to update 300 files.**

**Answer:** Use semantic tokens (`bg-primary`) from the start, so a brand change is one variable. For an existing codebase, migrate raw palette classes to semantic ones with a codemod (a find-and-replace script).

---

**Q44. Status badges need colours based on values from the API.**

```ts
const badge: Record<CallStatus, string> = {
  scored: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
};
<span className={badge[status] ?? 'bg-slate-100 text-slate-800'}>{label}</span>
```

**Answer:** A typed map of complete class strings, with a fallback for unknown statuses.

---

**Q45. Rich LLM markdown output needs styling.**

**Answer:** Use `prose` with `dark:prose-invert`, constrain the width (`max-w-prose`), and **sanitise** the HTML before rendering it.

---

**Q46. A modal built with Radix needs open and close animations.**

```html
<Dialog.Content class="data-[state=open]:animate-in data-[state=closed]:animate-out
                       data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
                       motion-reduce:animate-none">
```

**Answer:** Radix sets `data-state="open"` or `"closed"`, so Tailwind variants animate from it. Use the tailwindcss-animate plugin or custom keyframes, and always respect `motion-reduce`.

---

## 🎯 From Your Resume

**Q47. "How did you style Radix components in BpoBox?"**

```tsx
<DropdownMenu.Item
  className="px-3 py-2 rounded outline-none data-[highlighted]:bg-slate-100 data-[disabled]:opacity-50"
/>
<Switch.Root className="w-10 h-6 rounded-full bg-slate-300 data-[state=checked]:bg-primary" />
```

**Say it like this:** "Radix handles behaviour and accessibility and exposes state as data attributes, like `data-highlighted` or `data-state="checked"`. Tailwind's `data-[…]` variants style those states directly, with no extra React state or class logic. All the keyboard and focus behaviour came free from Radix."

---

**Q48. "How did you give each tenant its own branding?"**

**Say it like this:** "The tenant config loaded at login set a small set of CSS variables: primary, surface, accent and logo. Tailwind's semantic tokens pointed at those variables, so `bg-primary` meant each tenant's own brand colour. There was no rebuild per tenant, and we checked each tenant's palette for WCAG contrast."

---

**Q49. "Did you use Tailwind on InterpretIQ or the shared component library?"**

**Answer guidance:** Answer truthfully about which styling approach each product used and why. If they differed, explain how the shared library stayed compatible. Exposing design tokens as CSS variables works with *any* styling approach (Tailwind, CSS Modules or plain CSS), so it bridges the products.
