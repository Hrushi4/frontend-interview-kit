# 10 — Tailwind CSS

> Tailwind v4 moved configuration into CSS (`@theme`). Many companies still run v3 (`tailwind.config.js`). Know both.

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is Tailwind CSS?**
A utility-first CSS framework: small, single-purpose classes (`flex`, `p-4`, `text-sm`) composed in markup instead of writing custom CSS per component.

**2. Utility-first vs component CSS (Bootstrap)?**
Bootstrap gives prebuilt components (`.btn`, `.card`). Tailwind gives building blocks and a design token system; you build your own components.

**3. Advantages?**
No naming, consistent spacing/colour scale, tiny production CSS (only used classes), styles co-located with markup, fast iteration, easy responsive/state variants.

**4. Disadvantages?**
Long class lists, learning curve, needs component abstraction for reuse, harder to read for some, dynamic class names not detected.

**5. Installing in a Vite/Next app (v4)?**
Install `tailwindcss` (+ `@tailwindcss/vite` or PostCSS plugin), then in CSS: `@import "tailwindcss";`.

**6. Spacing scale?**
`p-4` = 1rem (based on a spacing unit); `px-`, `py-`, `pt-`, `m-`, `space-x-`, `gap-`. Negative margins `-mt-2`.

**7. Sizing?**
`w-full`, `w-1/2`, `max-w-screen-lg`, `h-dvh`, `min-h-screen`, `size-10` (width + height).

**8. Typography?**
`text-sm/6` (size/line-height), `font-semibold`, `tracking-tight`, `leading-relaxed`, `truncate`, `line-clamp-2`, `text-balance`.

**9. Colours?**
`bg-slate-900`, `text-emerald-600`, opacity modifier `bg-black/50`, `ring-blue-500`, `border-gray-200`.

**10. Flex & grid utilities?**
`flex items-center justify-between gap-2`, `grid grid-cols-1 md:grid-cols-3 gap-4`, `col-span-2`, `place-items-center`.

**11. Responsive prefixes?**
Mobile-first: unprefixed applies to all; `sm:`, `md:`, `lg:`, `xl:`, `2xl:` apply at min-width and up. `max-md:` targets below a breakpoint.

**12. State variants?**
`hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `checked:`, `first:`, `last:`, `odd:`, `placeholder:`, `invalid:`.

**13. Dark mode?**
`dark:bg-slate-900`. Default follows `prefers-color-scheme`; can switch to class/attribute-based strategy for user toggles.

**14. Arbitrary values?**
`top-[117px]`, `bg-[#0b5]`, `grid-cols-[240px_1fr]`, `w-[calc(100%-2rem)]`. Escape hatch — frequent use signals missing tokens.

**15. Preflight?**
Tailwind's base reset (normalizes margins, sets `box-sizing: border-box`, removes list styles, makes images block).

---

## 🟡 Level 2 — Intermediate

**16. How does Tailwind generate only the CSS you use?**
It scans your source files for class-name strings and generates matching rules. v4 auto-detects sources; v3 uses the `content` array.

**17. Why don't dynamic classes like `` `bg-${color}-500` `` work?**
The scanner sees only complete strings. Use a lookup map of full class names:
```ts
const statusColor = { live: 'bg-emerald-500', reconnecting: 'bg-amber-500', failed: 'bg-red-500' } as const;
```
Or safelist (`@source inline(...)` in v4 / `safelist` in v3).

**18. Customizing the theme (v4)?**
```css
@import "tailwindcss";
@theme {
  --color-brand: oklch(62% 0.16 160);
  --font-sans: "Inter", system-ui, sans-serif;
  --breakpoint-3xl: 120rem;
  --radius-card: 12px;
}
```
Generates `bg-brand`, `font-sans`, `3xl:`, `rounded-card`. Tokens are also exposed as CSS variables.

**19. Customizing the theme (v3)?**
`tailwind.config.js` → `theme.extend.colors.brand = '...'`.

**20. `@apply` — when?**
Compose utilities inside CSS for base element styles or third-party overrides. Overuse recreates the problems Tailwind solves; prefer components.

**21. Group and peer variants?**
```html
<a class="group"><span class="group-hover:underline">Title</span></a>
<input class="peer" required /><p class="hidden peer-invalid:block">Required</p>
```
Named groups: `group/item` + `group-hover/item:`.

**22. `has-*` and `aria-*`, `data-*` variants?**
`has-[:checked]:bg-blue-50`, `aria-pressed:bg-red-600`, `aria-expanded:rotate-180`, `data-[state=open]:animate-in` — style from accessibility/state attributes directly.

**23. Container queries?**
v4 built-in: `@container` on parent, children use `@sm:`, `@md:` variants. Components respond to their own width.

**24. Managing conditional classes and conflicts?**
`clsx` for conditions + `tailwind-merge` to resolve conflicts (`p-2` vs `p-4` → last wins):
```ts
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
<button className={cn('px-4 py-2 rounded-md', isActive && 'bg-brand text-white', className)} />
```

**25. Component variants with `cva`?**
```ts
export const button = cva('inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50', {
  variants: {
    intent: { primary: 'bg-brand text-white hover:bg-brand/90', danger: 'bg-red-600 text-white', ghost: 'hover:bg-slate-100' },
    size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', icon: 'size-10' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

**26. Reusing styles — options?**
Components (best), `cva` variants, `@apply` for base layers, plugins/utilities via `@utility` (v4).

**27. Custom utilities and variants (v4)?**
```css
@utility scrollbar-hidden { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

**28. Animations?**
Built-ins `animate-spin`, `animate-pulse`; custom keyframes in theme; `motion-safe:` / `motion-reduce:` variants.

**29. Accessibility helpers?**
`sr-only`, `not-sr-only`, `focus-visible:ring-2`, `motion-reduce:transition-none`, `forced-colors:` variant.

**30. Typography plugin & forms plugin?**
`prose` classes for rendered markdown (LLM output, articles); forms plugin normalizes form controls.

---

## 🔴 Level 3 — Advanced

**31. Design tokens with Tailwind for multiple brands/tenants?**
Define semantic tokens referencing CSS variables, switch variables at runtime:
```css
@theme { --color-primary: var(--tenant-primary); --color-surface: var(--tenant-surface); }
:root { --tenant-primary: #0b5; --tenant-surface: #fff; }
[data-tenant="acme"] { --tenant-primary: #e11d48; }
```
Components use `bg-primary`, never raw palette colours.

**32. Dark mode + tenant theme combined?**
Semantic tokens per mode (`--surface` light/dark) × tenant accent; ensure contrast for every combination; test with Storybook theme switcher.

**33. Tailwind in a component library consumed by multiple apps?**
Ship components with Tailwind classes and a shared preset/theme CSS; consumer apps must scan the library's dist files (`@source "../node_modules/@org/ui"`), or ship precompiled CSS. Use a prefix to avoid conflicts if mixed with other CSS.

**34. Cascade layers in Tailwind?**
v4 uses native `@layer theme, base, components, utilities`. Put custom component styles in `@layer components` so utilities override them.

**35. Performance considerations?**
Output CSS is small; main costs are long class strings in HTML/JS. No runtime cost — works well with RSC and streaming (unlike runtime CSS-in-JS).

**36. Linting and formatting?**
`prettier-plugin-tailwindcss` sorts classes consistently; ESLint plugins flag conflicting/invalid classes.

**37. shadcn/ui — what is it and trade-offs?**
Copy-paste components built on Radix + Tailwind + cva, placed into your repo. Pros: full ownership, accessible primitives. Cons: you maintain upgrades yourself.

**38. Migrating v3 → v4 key changes?**
CSS-first config, automatic content detection, new import syntax, some renamed utilities, modern CSS features (cascade layers, `@property`, color-mix). Use the upgrade tool and review visual diffs.

**39. Using Tailwind with CSS Modules or other CSS?**
Possible but keep one primary approach; use `@reference` (v4) to access theme in module files.

**40. Readability strategy for long class lists?**
Extract components, group with `cn()` across lines by concern (layout, spacing, colour, state), use variants, avoid one-off arbitrary values.

---

## 🧩 Level 4 — Scenario-based

**41. Production build is missing some classes that work locally.**
Class names built dynamically or from data/CMS; source files not scanned (e.g., a package in node_modules). Use full class names/maps, add `@source`, or safelist.

**42. Two classes conflict when a parent passes `className` to a Button.**
Merge with `tailwind-merge` inside the component (`cn(base, className)`).

**43. Designers changed brand colour; you must update 300 files.**
Use semantic tokens (`bg-primary`) from the start; change one variable. Migrate raw palette usages with a codemod.

**44. Status badges need colours based on API values.**
Map statuses to complete class strings in a typed object; fallback class for unknown statuses.

**45. Rich LLM markdown output needs styling.**
`prose` with dark mode `dark:prose-invert`, constrain width, sanitize HTML before rendering.

**46. A modal built with Radix needs open/close animations.**
`data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 zoom-in-95` (via tailwindcss-animate or custom keyframes); respect `motion-reduce`.

---

## 🎯 From Your Resume

**47. "How did you style Radix components in BpoBox?"**
Radix exposes state via data attributes; Tailwind variants style them directly:
```tsx
<DropdownMenu.Item className="px-3 py-2 rounded data-[highlighted]:bg-slate-100 data-[disabled]:opacity-50 outline-none" />
<Switch.Root className="w-10 h-6 rounded-full bg-slate-300 data-[state=checked]:bg-primary" />
```

**48. "How did you give each tenant its own branding?"**
Tenant config loaded at boot sets CSS variables; Tailwind semantic tokens point to those variables; no rebuild per tenant; contrast checked per tenant palette.

**49. "Did you use Tailwind on InterpretIQ / the shared component library?"**
Answer truthfully about which styling approach each product used and why; if mixed, explain how the shared library stays compatible (tokens as CSS variables usable from any styling approach).
