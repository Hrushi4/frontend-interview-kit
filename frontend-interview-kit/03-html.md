# 03 — HTML, Accessibility & Browser Basics

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is HTML?**
HyperText Markup Language — describes the structure and meaning of content. The browser parses it into the DOM.

**2. Minimal valid HTML5 document?**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page title</title>
</head>
<body>...</body>
</html>
```

**3. Purpose of `<!DOCTYPE html>`?**
Triggers standards mode; without it browsers use quirks mode with legacy layout behaviour.

**4. Why set `lang` on `<html>`?**
Screen readers choose pronunciation; translation tools and search engines use it.

**5. Element vs tag vs attribute?**
Tag = `<p>` markup; element = opening tag + content + closing tag; attribute = extra info on the start tag (`class`, `id`, `href`).

**6. Void (self-closing) elements?**
`<img>`, `<br>`, `<hr>`, `<input>`, `<meta>`, `<link>`, `<source>` — no closing tag or children.

**7. Block vs inline elements?**
Block (`div`, `p`, `h1`, `section`) start on a new line and take full width. Inline (`span`, `a`, `strong`) flow within text and ignore width/height.

**8. Semantic HTML — meaning and benefits?**
Using elements that describe their purpose: `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`, `figure`, `time`. Benefits: accessibility (landmarks), SEO, readability, default behaviours.

**9. `<div>` vs `<span>`?**
Both are non-semantic containers; div is block, span inline.

**10. `<section>` vs `<article>` vs `<div>`?**
article = independent, self-contained (blog post, comment, product card). section = thematic grouping, usually with a heading. div = styling/layout only.

**11. Heading rules?**
One logical `<h1>` per page; don't skip levels for styling; headings form the document outline that screen-reader users navigate by.

**12. `<b>` vs `<strong>`, `<i>` vs `<em>`?**
strong/em carry meaning (importance/emphasis, announced differently); b/i are purely stylistic.

**13. Ordered, unordered, description lists?**
`<ol>`, `<ul>` with `<li>`; `<dl>` with `<dt>` term and `<dd>` description.

**14. Anchor essentials?**
`href`, `target="_blank"` with `rel="noopener noreferrer"` (prevents the new page accessing `window.opener`), `download`, `mailto:`, `tel:`.

**15. `<img>` required attributes?**
`src` and `alt`. Add `width`/`height` to prevent layout shift.

**16. `alt` text rules?**
Describe the purpose of meaningful images; `alt=""` for decorative images; don't start with "image of"; functional images (an icon inside a link) describe the action.

**17. Basic form?**
```html
<form action="/login" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />
  <button type="submit">Sign in</button>
</form>
```

**18. Why does `name` matter on inputs?**
It's the key sent with form data; without it the value isn't submitted.

**19. GET vs POST form submission?**
GET appends data to the URL (bookmarkable, for searches). POST sends a body (for mutations and sensitive data).

**20. `<button>` default type?**
`submit` inside a form — use `type="button"` for non-submitting buttons to avoid accidental submits.

**21. `id` vs `class`?**
id is unique per page (anchors, label targets, ARIA references); class is reusable for styling and grouping.

**22. `data-*` attributes?**
Custom attributes: `<li data-call-id="42">` → `el.dataset.callId`. Also useful as test hooks and styling hooks.

**23. HTML entities?**
`&lt;` `&gt;` `&amp;` `&quot;` `&nbsp;` — represent reserved characters.

**24. `<meta charset="utf-8">` — why first in head?**
The browser must know the encoding before parsing text; must appear in the first 1024 bytes.

**25. Meta viewport?**
`width=device-width, initial-scale=1` tells mobile browsers to use the device width instead of a 980px virtual viewport. Don't disable zoom (`user-scalable=no` hurts accessibility).

---

## 🟡 Level 2 — Intermediate

**26. `<script>` loading: default vs `async` vs `defer` vs `type="module"`?**
| | Download | Execute | Order |
|---|---|---|---|
| default | blocks parsing | immediately | in order |
| async | parallel | as soon as downloaded | not guaranteed |
| defer | parallel | after parsing, before DOMContentLoaded | in order |
| module | parallel (deferred by default) | after parsing | in order |
Use `defer` for app scripts, `async` for independent ones like analytics.

**27. `DOMContentLoaded` vs `load`?**
DOMContentLoaded: HTML parsed and deferred scripts run. load: all resources (images, iframes, stylesheets) finished.

**28. Resource hints?**
- `preconnect` — open DNS+TCP+TLS early to a critical origin (API, CDN, media server).
- `dns-prefetch` — DNS only, cheaper fallback.
- `preload` — fetch a resource needed for this page now (LCP image, font); needs `as`.
- `prefetch` — low-priority fetch for a likely next navigation.
- `modulepreload` — preload ES modules and their parsing.

**29. `fetchpriority`?**
`<img fetchpriority="high">` for the LCP image; `low` for below-the-fold carousels.

**30. Responsive images: `srcset`/`sizes` vs `<picture>`?**
```html
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw" alt="..." width="800" height="450">
<picture>
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="...">
</picture>
```
srcset = resolution switching; picture = format fallback or art direction.

**31. `loading="lazy"`?**
Native lazy loading for images/iframes. Never on the LCP image.

**32. HTML5 input types and attributes?**
Types: email, tel, url, number, range, date, time, color, search, file. Attributes: `required`, `pattern`, `min`, `max`, `step`, `minlength`, `maxlength`, `placeholder`, `autocomplete`, `inputmode`, `enterkeyhint`.

**33. `inputmode` vs `type`?**
`type` changes behaviour/validation; `inputmode` only changes the mobile keyboard (`numeric` for OTPs without number-spinner quirks).

**34. `autocomplete` values?**
`email`, `name`, `current-password`, `new-password`, `one-time-code`, `street-address` — improves UX and password managers.

**35. Native validation API?**
`input.checkValidity()`, `input.validity.valueMissing`, `setCustomValidity('msg')`, `:invalid`/`:user-invalid` CSS, `novalidate` on form to take control.

**36. `fieldset` and `legend`?**
Group related controls (radio groups, address blocks); legend gives the group an accessible name.

**37. `<label>` association — two ways?**
`for`/`id` or wrapping the input. Clicking the label focuses the input and screen readers announce it.

**38. `<dialog>` element?**
```html
<dialog id="d"><form method="dialog"><button>Close</button></form></dialog>
<script>d.showModal()</script>
```
`showModal()` = modal with backdrop, focus inside, Escape to close, rest of page inert.

**39. `<details>` / `<summary>`?**
Native disclosure widget, keyboard accessible, no JS.

**40. `<template>` and `<slot>`?**
Template = inert markup cloned via JS. Slot = placeholder in a Shadow DOM where light-DOM children render.

**41. iframe attributes?**
`sandbox` (restrict scripts/forms/top navigation), `allow="camera; microphone"`, `loading="lazy"`, `referrerpolicy`, `title` (required for a11y).

**42. Web storage comparison?**
| | Size | Lifetime | Sent to server | JS access |
|---|---|---|---|---|
| Cookie | ~4 KB | expiry | every request | unless httpOnly |
| localStorage | ~5–10 MB | until cleared | no | yes |
| sessionStorage | ~5 MB | tab session | no | yes |
| IndexedDB | large | until cleared | no | yes (async) |
Sensitive data (tokens, PHI) should not live in JS-readable storage.

**43. Critical rendering path?**
HTML → DOM; CSS → CSSOM; DOM + CSSOM → render tree → layout → paint → composite. CSS blocks rendering; sync scripts block parsing.

**44. Reflow vs repaint?**
Reflow (layout) recalculates geometry — expensive. Repaint redraws pixels without geometry changes. Compositor-only changes (transform, opacity) skip both.

**45. SEO basics in HTML?**
Unique `<title>` and meta description, semantic headings, descriptive link text, `alt`, canonical URL, Open Graph tags, structured data (JSON-LD), crawlable links (`<a href>` not JS click handlers).

---

## 🟡 Accessibility (a11y) — asked heavily for WCAG work

**46. What is WCAG? Levels?**
Web Content Accessibility Guidelines. Principles **POUR**: Perceivable, Operable, Understandable, Robust. Levels A, AA (common legal target), AAA.

**47. First rule of ARIA?**
Don't use ARIA if a native element exists. ARIA changes semantics only — it adds no keyboard behaviour.

**48. ARIA roles, states, properties examples?**
Roles: `dialog`, `tablist`, `tab`, `tabpanel`, `alert`, `status`. States: `aria-expanded`, `aria-pressed`, `aria-checked`, `aria-selected`, `aria-busy`. Properties: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-live`.

**49. `aria-label` vs `aria-labelledby` vs `aria-describedby`?**
label = string name; labelledby = name from other element(s); describedby = extra description (hints, error messages).

**50. Live regions?**
`aria-live="polite"` waits for the user; `assertive` interrupts. `role="status"` = polite, `role="alert"` = assertive. The region must exist in the DOM before content changes.

**51. Keyboard accessibility checklist?**
Everything reachable by Tab in logical order, visible focus, Enter/Space activate buttons, Escape closes overlays, arrow keys inside composite widgets (tabs, menus, radio groups), no keyboard traps.

**52. `tabindex` values?**
`0` = in natural order; `-1` = focusable via script only (move focus to headings/dialogs); positive values = never.

**53. Roving tabindex?**
In a widget (toolbar, tablist) only the active item has `tabindex=0`, others `-1`; arrow keys move focus. One tab stop per widget.

**54. Focus management on SPA route change?**
Move focus to the page's `<h1>` (with `tabindex="-1"`) or a skip target and announce the new page title.

**55. Colour contrast requirements (AA)?**
4.5:1 for normal text, 3:1 for large text (≥ 24px or 18.66px bold) and for UI components/focus indicators.

**56. Don't rely on colour alone — example?**
Error fields need an icon/text, not just red border; charts need patterns or labels.

**57. Accessible icon-only button?**
```html
<button type="button" aria-label="Mute microphone" aria-pressed="false">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

**58. Accessible form errors?**
Inline message linked by `aria-describedby`, `aria-invalid="true"`, summary at top with links to fields on submit, focus the first invalid field.

**59. Skip link?**
First focusable element: `<a href="#main" class="skip-link">Skip to main content</a>`, visible on focus.

**60. Testing accessibility?**
Automated: axe-core (jest-axe, Playwright axe), Lighthouse. Manual: keyboard-only pass, screen readers (NVDA + Firefox/Chrome, VoiceOver + Safari), 200% zoom, reduced motion, high contrast mode. Automated tools catch only a portion of issues.

**61. Captions vs transcripts vs audio description?**
Captions = synchronized text for audio in video; transcript = full text alternative; audio description = narration of important visuals.

---

## 🔴 Level 3 — Advanced

**62. How does the browser parse HTML?**
Tokenizer → tree construction; the parser is forgiving (error recovery). A **preload scanner** looks ahead to discover resources while the main parser is blocked by scripts.

**63. Why can `document.write` hurt performance?**
It blocks the parser and defeats the preload scanner; Chrome may block it on slow connections.

**64. Shadow DOM — what and why?**
Encapsulated DOM subtree with scoped styles and IDs. Open vs closed mode. Used by Web Components and for widget isolation in host pages you don't control.

**65. Custom Elements lifecycle?**
`connectedCallback`, `disconnectedCallback`, `attributeChangedCallback` (with `observedAttributes`), `adoptedCallback`.
```js
class CallBadge extends HTMLElement {
  static observedAttributes = ['status'];
  connectedCallback() { this.attachShadow({ mode: 'open' }); this.render(); }
  attributeChangedCallback() { this.render(); }
  render() { if (this.shadowRoot) this.shadowRoot.innerHTML = `<span>${this.getAttribute('status') ?? ''}</span>`; }
}
customElements.define('call-badge', CallBadge);
```
(Escape attribute values before using innerHTML in real code.)

**66. Declarative Shadow DOM?**
`<template shadowrootmode="open">` lets servers render shadow roots without JS — enables SSR for Web Components.

**67. `inert` attribute?**
Makes a subtree non-interactive and hidden from assistive tech — for background content behind custom modals.

**68. Popover API?**
`<div popover id="menu">` + `<button popovertarget="menu">` — top-layer popovers with light dismiss, no JS.

**69. PWA requirements?**
HTTPS, web app manifest, service worker with a fetch handler (for offline/installability criteria), icons. Benefits: install, offline shell, push notifications (permission-based), app-like launch.

**70. Manifest key fields?**
```json
{ "name": "InterpretIQ", "short_name": "IIQ", "start_url": "/", "display": "standalone",
  "theme_color": "#0b5", "background_color": "#fff",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }] }
```

**71. Service worker lifecycle?**
register → install (precache) → waiting (old SW still controls pages) → activate (clean old caches) → fetch/push events. `skipWaiting()` + `clients.claim()` take control immediately; show "new version available — reload" to avoid mixed versions.

**72. Service worker caching strategies?**
Cache-first (hashed static assets), network-first (HTML), stale-while-revalidate (semi-static content), network-only (authenticated API, sensitive data).

**73. Permissions-related HTML/APIs?**
`getUserMedia` (camera/mic — requires secure context and user gesture context in practice), Notifications, Geolocation; `Permissions-Policy` header controls which origins/iframes may request them.

**74. Structured data (JSON-LD)?**
```html
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"..."}</script>
```

**75. Open Graph / Twitter cards?**
`og:title`, `og:description`, `og:image`, `og:url` — control link previews in chat apps and social sites.

**76. `rel="canonical"` and `hreflang`?**
Canonical points duplicates to the main URL; hreflang tells search engines about language/region variants.

**77. Content Security Policy via meta?**
`<meta http-equiv="Content-Security-Policy" content="...">` works for most directives, but `frame-ancestors` and reporting must be sent as HTTP headers.

**78. Why `rel="noopener"` matters?**
Without it, the opened page gets `window.opener` and can redirect your tab (reverse tabnabbing). Modern browsers default `_blank` to noopener, but be explicit.

---

## 🧩 Level 4 — Scenario-based

**79. A designer gave you a clickable card containing a title, image, and a "Share" button. How do you mark it up accessibly?**
Make the title an `<a>` (the primary link), stretch its click area with a pseudo-element via CSS, keep "Share" a separate `<button>` with higher z-index. Avoid nesting interactive elements inside a link.

**80. Screen reader users report the toast "Saved" is never announced.**
Live region was created at the same time as content. Render an empty `role="status"` container on page load and inject text later.

**81. Your custom dropdown fails accessibility audit.**
Replace with native `<select>` if possible; else implement the combobox/listbox pattern: roles, `aria-expanded`, `aria-activedescendant`, keyboard (arrows, Home/End, typeahead, Escape), focus return — or use Radix/Headless UI.

**82. Mobile users get a number spinner and wrong keyboard for a 6-digit OTP.**
Use `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern="\d{6}"`, `maxlength="6"`.

**83. Page jumps when images load.**
Add `width`/`height` (or CSS `aspect-ratio`) so space is reserved; avoid injecting banners above content.

**84. A third-party widget must be embedded without it breaking your styles or reading your cookies.**
Sandboxed iframe on a different origin; or Shadow DOM if you trust the code and only need style isolation.

**85. Marketing wants the hero image to load faster.**
Preload it, `fetchpriority="high"`, modern formats, correct `sizes`, serve from CDN, don't lazy-load it, avoid CSS background images for the LCP element (discovered late).

**86. Users must be able to install the app on clinic tablets and reopen it quickly on bad Wi-Fi.**
PWA with manifest + service worker precaching the app shell; network-only for authenticated/PHI APIs; offline fallback page explaining connection is required for calls.

---

## 🎯 From Your Resume

**87. "InterpretIQ is WCAG compliant — show me how you'd make the call screen accessible."**
- Control bar: real `<button>`s with `aria-pressed` for mute/camera, `aria-label`s, visible focus ring with 3:1 contrast over video.
- Keyboard shortcuts (documented, not conflicting with screen-reader keys), Escape closes panels.
- Live region announcing "Interpreter joined", "Reconnecting…", "Recording started".
- Captions/transcript option; respect `prefers-reduced-motion` for speaking animations.
- Focus moves to the call region on join and to a summary heading on call end.

**88. "How did you verify WCAG compliance?"**
axe in CI + Lighthouse, manual keyboard and screen-reader passes on critical flows, contrast checks on design tokens, an accessibility checklist in PR template. Name one real issue you fixed.

**89. "How do you request camera/mic in a PWA without users denying it?"**
Pre-permission screen explaining why → request on a user click → device check preview → handle `NotAllowedError` (show OS/browser steps) and `NotFoundError` (no device) gracefully; remember chosen device IDs (non-sensitive).

**90. "What did the service worker cache — and what must it never cache?"**
Cache app shell and hashed static assets. Never cache authenticated API responses, recordings, transcripts or any PHI; clear caches on logout.
