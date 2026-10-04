# 03 — HTML, Accessibility and Browser Basics

**How this file is organised**

- **Part A — Understand the topic:** what HTML is, how the browser turns it into a page, semantics, accessibility and PWAs, explained simply.
- **Part B — Interview questions and answers:** Basic → Intermediate → Accessibility → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example** and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is HTML?

HTML (HyperText Markup Language) describes the **structure and meaning** of content on a web page. It says "this is a heading, this is a list, this is a button, this is the main content". CSS decides how it looks and JavaScript decides how it behaves. HTML is the foundation that both of them work on.

```html
<article>
  <h2>Interpreter joined</h2>
  <p>Maria joined the call at <time datetime="2026-10-04T10:30">10:30</time>.</p>
  <button type="button">Open chat</button>
</article>
```

### How the browser turns HTML into pixels (the critical rendering path)

1. **Parse HTML** into the **DOM** (Document Object Model), a tree of objects.
2. **Parse CSS** into the **CSSOM**, a tree of style rules.
3. Combine them into the **render tree**, which holds only visible elements with their computed styles.
4. **Layout** (reflow): calculate the size and position of every box.
5. **Paint:** fill in pixels (text, colours, borders, images).
6. **Composite:** combine painted layers on the GPU and show them on screen.

Two important consequences:

- **CSS blocks rendering.** The browser won't paint until the CSS has loaded, to avoid a flash of unstyled content.
- **Normal `<script>` blocks parsing.** The parser stops, downloads and runs the script, then continues. That's why we use `defer` or `async`.

### Semantic HTML

"Semantic" means choosing elements by **meaning**, not appearance. A `<button>` is a button and a `<nav>` is navigation. Semantics give you three things for free:

- **Accessibility:** screen readers announce "button" or "navigation landmark", and users can jump between landmarks and headings.
- **Built-in behaviour:** a `<button>` is focusable, works with Enter and Space, and submits forms. A `<div onclick>` does none of this.
- **SEO:** search engines understand the page structure.

Page layout landmarks:

```html
<header>…logo, top nav…</header>
<nav aria-label="Main">…</nav>
<main>
  <h1>Call history</h1>
  <section aria-labelledby="recent"><h2 id="recent">Recent calls</h2>…</section>
</main>
<aside>…filters…</aside>
<footer>…</footer>
```

### Accessibility (a11y)

Accessibility means people with disabilities can use your product. That includes blind users with screen readers, keyboard-only users, low-vision users who zoom, deaf users who need captions, and people with cognitive or motion sensitivities.

- **WCAG** (Web Content Accessibility Guidelines) is the standard. Its four principles are **POUR**: Perceivable, Operable, Understandable and Robust.
- Conformance levels are A, AA and AAA. **AA** is the usual legal and contractual target, especially in healthcare.
- **ARIA** (Accessible Rich Internet Applications) attributes add semantics when HTML has no native element, for example `role="tablist"`. The first rule of ARIA: if a native element exists, use it.

### Browser storage at a glance

Cookies (small, sent to the server on every request), `localStorage` (persistent), `sessionStorage` (per tab), and IndexedDB (large, asynchronous). Any JavaScript on the page can read localStorage, sessionStorage and IndexedDB, including malicious injected scripts. **Never store tokens or patient data there.**

### Progressive Web Apps (PWA)

A PWA is a website that behaves like an installed app. It needs three things:

1. **HTTPS.**
2. **A web app manifest** (name, icons, start URL, display mode).
3. **A service worker:** a script that sits between the page and the network. It can cache files so the app shell loads instantly and works offline.

### Why interviewers ask about HTML

HTML questions look easy, but they reveal whether you build **accessible, fast, correct** pages or just stack divs. Your resume mentions a WCAG-compliant PWA in healthcare, so expect deep accessibility and PWA questions.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is HTML?**

**Short answer:** HyperText Markup Language, the language that describes the structure and meaning of web content. The browser parses it into the DOM.

**Say it like this:** "HTML defines what each piece of content *is*: a heading, a list, a form, a button. CSS styles it and JavaScript adds behaviour, but good HTML gives you accessibility and SEO for free."

---

**Q2. Write a minimal valid HTML5 document.**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Call History – InterpretIQ</title>
</head>
<body>
  <main>
    <h1>Call history</h1>
  </main>
</body>
</html>
```

**Explanation:** The doctype turns on standards mode. `lang` helps screen readers, the charset must come early, the viewport makes mobile layouts work, and the title appears in tabs, bookmarks and search results.

---

**Q3. What is the purpose of `<!DOCTYPE html>`?**

**Short answer:** It tells the browser to use **standards mode**. Without it, browsers switch to **quirks mode**, which emulates old 1990s layout bugs (for example, a different box model).

---

**Q4. Why set `lang` on `<html>`?**

**Short answer:** Screen readers use it to choose the correct pronunciation and voice. Translation tools and search engines use it too. For a phrase in another language, set `lang` on that element: `<span lang="es">Hola</span>`.

**Say it like this:** "On an interpretation platform this really matters. If Spanish text is marked `lang="es"`, the screen reader pronounces it correctly instead of reading it with English rules."

---

**Q5. Element vs tag vs attribute?**

**Short answer:** A *tag* is the markup (`<p>`). An *element* is the opening tag, its content and the closing tag together. An *attribute* is extra information on the opening tag (`class`, `id`, `href`).

**Example:** In `<a href="/calls">Calls</a>`, `<a>` is the tag, the whole line is the element, and `href` is an attribute.

---

**Q6. What are void (self-closing) elements?**

**Short answer:** Elements that can't have content or a closing tag: `<img>`, `<br>`, `<hr>`, `<input>`, `<meta>`, `<link>` and `<source>`.

---

**Q7. Block vs inline elements?**

**Short answer:** Block elements (`div`, `p`, `h1`, `section`, `ul`) start on a new line and take the full available width. Inline elements (`span`, `a`, `strong`, `em`) flow within a line of text and ignore `width`, `height` and vertical margins.

**Explanation:** `display: inline-block` flows inline but respects width and height. CSS can change any element's display, but the *semantic* meaning stays the same.

---

**Q8. What is semantic HTML and why does it matter?**

**Short answer:** Using elements that describe their purpose (`header`, `nav`, `main`, `article`, `section`, `aside`, `footer`, `figure`, `time`, `button`) instead of generic `div`s.

**Explanation:** The benefits:

1. **Accessibility:** landmarks and headings let screen-reader users jump around the page.
2. **Built-in behaviour:** keyboard support, form submission, focus.
3. **SEO:** clearer structure for crawlers.
4. **Readability** for other developers.

**Example:**

```html
<!-- Bad -->
<div class="header"><div class="nav">…</div></div>
<div class="btn" onclick="save()">Save</div>

<!-- Good -->
<header><nav aria-label="Main">…</nav></header>
<button type="button" onclick="save()">Save</button>
```

**Say it like this:** "Semantic HTML is the cheapest accessibility win. A real `<button>` gives me focus, Enter and Space handling and the correct screen-reader role without writing a single line of ARIA."

---

**Q9. `<div>` vs `<span>`?**

**Short answer:** Both are non-semantic containers used for styling and layout. `div` is block-level and `span` is inline.

---

**Q10. `<section>` vs `<article>` vs `<div>`?**

**Short answer:**

- `<article>`: self-contained content that makes sense on its own (a blog post, a comment, a product card, a call summary).
- `<section>`: a thematic group of content, usually with a heading.
- `<div>`: no meaning, just a styling or layout wrapper.

**Tip:** If you could syndicate it (put it in an RSS feed), it's an article. If it has a heading and belongs to a larger whole, it's a section.

---

**Q11. What are the rules for headings?**

**Short answer:** Use one logical `<h1>` per page, don't skip levels (h2 → h4) just for size, and use CSS for styling. Headings form the page outline that screen-reader users navigate by. Many of them press "H" to jump from heading to heading.

---

**Q12. `<b>` vs `<strong>`, and `<i>` vs `<em>`?**

**Short answer:** `<strong>` means importance and `<em>` means emphasis. Both carry meaning. `<b>` and `<i>` are purely visual (bold and italic) with no extra meaning.

---

**Q13. What kinds of lists does HTML have?**

**Short answer:** `<ul>` for unordered lists and `<ol>` for ordered lists, both with `<li>` items. `<dl>` is a description list, with `<dt>` for the term and `<dd>` for its description.

**Example:**

```html
<dl>
  <dt>Duration</dt><dd>12 min</dd>
  <dt>Language</dt><dd>Spanish</dd>
</dl>
```

Screen readers announce "list, 3 items", which helps users understand the structure.

---

**Q14. What are the essential parts of an anchor (`<a>`)?**

**Short answer:** `href` sets the destination. For new tabs use `target="_blank"` with `rel="noopener noreferrer"`. Other options are `download`, `mailto:` and `tel:` links.

**Example:**

```html
<a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
  Help docs <span class="visually-hidden">(opens in new tab)</span>
</a>
```

**Explanation:** `noopener` stops the new page from controlling your tab through `window.opener` (see Q78).

---

**Q15. Which attributes does `<img>` require?**

**Short answer:** `src` and `alt`. Also add `width` and `height` so the browser reserves space and the page doesn't jump (layout shift, which hurts CLS).

---

**Q16. What are the rules for `alt` text?**

**Short answer:**

- **Meaningful image:** describe its *purpose* in context.
- **Decorative image:** use `alt=""` so screen readers skip it.
- **Functional image** (an icon inside a link or button): describe the action, such as `alt="Search"`.
- Don't start with "image of", because screen readers already say "image".

**Example:** `<img src="avatar.png" alt="Dr. Patel, interpreter">` and `<img src="divider.svg" alt="">`.

---

**Q17. Write a basic accessible form.**

```html
<form action="/login" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />

  <label for="password">Password</label>
  <input id="password" name="password" type="password" required
         autocomplete="current-password" />

  <button type="submit">Sign in</button>
</form>
```

**Explanation:** Labels are linked to inputs with `for`/`id`. `type="email"` brings validation and the right mobile keyboard, `autocomplete` helps password managers, and `name` is what gets sent to the server.

---

**Q18. Why does `name` matter on inputs?**

**Short answer:** `name` is the key sent with the form data. An input without a `name` isn't submitted at all.

---

**Q19. GET vs POST for form submission?**

**Short answer:** GET puts the data in the URL (`/search?q=maria`), which makes it bookmarkable and suits searches and filters. POST sends the data in the request body, which suits creating or changing data and anything sensitive. Never send passwords with GET, because URLs end up in logs and history.

---

**Q20. What is the default `type` of a `<button>`?**

**Short answer:** Inside a form it's `submit`. Always write `type="button"` for buttons that shouldn't submit (toggle, open menu); otherwise clicking them submits the form unexpectedly.

---

**Q21. `id` vs `class`?**

**Short answer:** An `id` must be unique on the page and is used for anchors (`#main`), label targets and ARIA references. A `class` is reusable and used for styling and grouping.

---

**Q22. What are `data-*` attributes?**

**Short answer:** Custom attributes for storing extra information on elements.

**Example:**

```html
<li data-call-id="42" data-status="missed">Call with Maria</li>
```

```js
li.dataset.callId;  // "42"
```

They're also handy as test hooks (`data-testid`) and styling hooks (`[data-status="missed"]`).

---

**Q23. What are HTML entities?**

**Short answer:** Codes for reserved or special characters: `&lt;` (<), `&gt;` (>), `&amp;` (&), `&quot;` ("), `&nbsp;` (non-breaking space).

---

**Q24. Why must `<meta charset="utf-8">` come first in `<head>`?**

**Short answer:** The browser needs to know the text encoding before it parses any text. The charset must appear within the first 1024 bytes, or characters may be garbled (for example, ₹ or é showing as junk).

---

**Q25. What does the meta viewport tag do?**

**Short answer:** `<meta name="viewport" content="width=device-width, initial-scale=1">` tells mobile browsers to use the real device width. Without it, they render a 980px-wide desktop page and shrink it. Never add `user-scalable=no` or `maximum-scale=1`, because blocking zoom fails accessibility.

---

## 🟡 Level 2 — Intermediate

**Q26. Script loading: default vs `async` vs `defer` vs `type="module"`?**

**Short answer:**

| Attribute | Download | When it runs | Order kept? |
|---|---|---|---|
| none | blocks HTML parsing | immediately | yes |
| `async` | in parallel | as soon as downloaded (pauses parsing) | no |
| `defer` | in parallel | after HTML is parsed, before `DOMContentLoaded` | yes |
| `type="module"` | in parallel | deferred by default | yes |

**Example:**

```html
<script src="/app.js" defer></script>            <!-- app code, needs the DOM -->
<script src="https://analytics.js" async></script> <!-- independent -->
```

**Say it like this:** "I use `defer` for application scripts because they don't block parsing and run in order once the DOM is ready. I use `async` only for independent scripts like analytics, where the order doesn't matter."

---

**Q27. `DOMContentLoaded` vs `load`?**

**Short answer:** `DOMContentLoaded` fires when the HTML is parsed and deferred scripts have run. `load` fires later, when *everything* (images, iframes, stylesheets, fonts) has finished loading.

---

**Q28. What are resource hints?**

**Short answer:**

- `preconnect`: opens the DNS, TCP and TLS connection to an important origin early (API, CDN, media server).
- `dns-prefetch`: DNS lookup only. It's a cheaper fallback.
- `preload`: fetches a resource needed *on this page* right away (LCP image, font). Requires `as`.
- `prefetch`: low-priority fetch for something likely needed on the *next* page.
- `modulepreload`: preloads JavaScript modules.

**Example:**

```html
<link rel="preconnect" href="https://api.interpretiq.com" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/call-summary.js">
```

**Say it like this:** "For a video app, I preconnect to the signalling and media servers so the join is faster. I preload the main font and the hero image, and prefetch the next screen's code."

---

**Q29. What does `fetchpriority` do?**

**Short answer:** It hints at loading priority. `<img fetchpriority="high">` suits the LCP (largest) image, and `fetchpriority="low"` suits below-the-fold carousel images.

---

**Q30. Responsive images: `srcset`/`sizes` vs `<picture>`?**

**Example:**

```html
<!-- Resolution switching: browser picks the best size -->
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw"
     alt="Interpreter on a video call" width="800" height="450">

<!-- Format fallback / art direction -->
<picture>
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="Interpreter on a video call">
</picture>
```

**Short answer:** `srcset` + `sizes` lets the browser choose the right *resolution* for the screen. `<picture>` provides *format* fallbacks (AVIF, then WebP, then JPEG) or a different crop per breakpoint (art direction).

**Say it like this:** "A phone shouldn't download a 1600px image. `srcset` with `sizes` lets the browser pick, which can save hundreds of KB on mobile."

---

**Q31. What does `loading="lazy"` do?**

**Short answer:** Native lazy loading. Images and iframes load only when they're near the viewport. **Never** lazy-load the LCP or hero image, because it delays the most important paint.

---

**Q32. Which HTML5 input types and attributes should you know?**

**Short answer:** Types: `email`, `tel`, `url`, `number`, `range`, `date`, `time`, `color`, `search` and `file`. Attributes: `required`, `pattern`, `min`, `max`, `step`, `minlength`, `maxlength`, `placeholder`, `autocomplete`, `inputmode` and `enterkeyhint`.

**Tip:** A placeholder is *not* a label. It disappears when the user types and often has poor contrast.

---

**Q33. `inputmode` vs `type`?**

**Short answer:** `type` changes behaviour and validation. `inputmode` changes *only* the on-screen keyboard. For an OTP, use `type="text" inputmode="numeric"`. That gives a number pad without the quirks of `type="number"` (spinners, removed leading zeros, scroll-to-change).

---

**Q34. Which `autocomplete` values matter?**

**Short answer:** `email`, `name`, `tel`, `street-address`, `current-password`, `new-password` and `one-time-code`. They let browsers and password managers fill fields correctly, and WCAG 1.3.5 requires them for personal data fields.

---

**Q35. What is the native validation API?**

**Example:**

```js
const input = document.querySelector('#email');
input.checkValidity();          // true/false
input.validity.valueMissing;    // specific reason
input.setCustomValidity('Use your work email');
form.noValidate = true;         // take full control with custom UI
```

CSS: `:invalid`, and `:user-invalid` (only after the user has interacted).

---

**Q36. What are `fieldset` and `legend` for?**

**Short answer:** They group related controls, such as a radio group or an address block. The `legend` names the group, so a screen reader says "Preferred language, group, Spanish, radio button 1 of 3".

---

**Q37. What are the two ways to associate a `<label>` with an input?**

```html
<label for="name">Name</label> <input id="name">     <!-- 1. for/id -->
<label>Name <input></label>                          <!-- 2. wrapping -->
```

Clicking the label focuses the input (a bigger click target), and screen readers announce the label.

---

**Q38. What is the `<dialog>` element?**

```html
<dialog id="confirm">
  <p>End the call for everyone?</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="end">End call</button>
  </form>
</dialog>
<script>
  confirm.showModal();
  confirm.addEventListener('close', () => console.log(confirm.returnValue));
</script>
```

**Short answer:** A native modal. `showModal()` gives you a backdrop, moves focus inside, closes on Escape and makes the rest of the page inert. All of that is accessibility work you'd otherwise build by hand.

---

**Q39. What are `<details>` and `<summary>`?**

**Short answer:** A native expand/collapse (disclosure) widget. It's keyboard accessible with no JavaScript.

```html
<details><summary>Call diagnostics</summary><p>Packet loss: 0.2%</p></details>
```

---

**Q40. What are `<template>` and `<slot>`?**

**Short answer:** `<template>` holds inert markup that you clone with JavaScript. It isn't rendered and its scripts don't run. `<slot>` is a placeholder inside a Shadow DOM where the component's children are displayed.

---

**Q41. Which iframe attributes matter?**

**Short answer:** `sandbox` (restricts scripts, forms and top navigation), `allow="camera; microphone"` (permissions), `loading="lazy"`, `referrerpolicy`, and `title`, which accessibility requires.

---

**Q42. Compare the web storage options.**

| | Size | Lifetime | Sent to server | JS can read |
|---|---|---|---|---|
| Cookie | ~4 KB | until expiry | with every request | yes, unless `HttpOnly` |
| localStorage | ~5–10 MB | until cleared | no | yes |
| sessionStorage | ~5 MB | until the tab closes | no | yes |
| IndexedDB | hundreds of MB+ | until cleared | no | yes (async API) |

**Say it like this:** "JWTs and patient data should never sit in localStorage, because any XSS can read it. I use HttpOnly, Secure, SameSite cookies for auth, and localStorage only for harmless preferences like the theme."

---

**Q43. Explain the critical rendering path.**

**Short answer:** HTML → DOM; CSS → CSSOM; DOM + CSSOM → render tree → layout → paint → composite. CSS blocks rendering and synchronous scripts block parsing. To speed up the first paint: inline critical CSS, defer scripts, and preload key resources.

---

**Q44. Reflow vs repaint?**

**Short answer:** A reflow (layout) recalculates the size and position of elements, which is expensive and can cascade to the whole page. A repaint redraws pixels without any change in geometry, for example a colour change. Changes to `transform` and `opacity` can skip both and run on the GPU compositor, which is why animations should use them.

**Example of what triggers reflow:** changing `width`, `top` or `font-size`, or reading `offsetHeight` right after writing styles (forced synchronous layout).

---

**Q45. What are the SEO basics in HTML?**

**Short answer:** A unique `<title>` and meta description per page, semantic headings, descriptive link text (not "click here"), `alt` text, a canonical URL, Open Graph tags, structured data (JSON-LD), and real `<a href>` links that crawlers can follow.

---

## 🟡 Accessibility (a11y) — Asked Heavily Because of Your WCAG Work

**Q46. What is WCAG and what are its levels?**

**Short answer:** The Web Content Accessibility Guidelines from the W3C. Its principles are **POUR**: Perceivable, Operable, Understandable and Robust. It has three levels: A (minimum), AA (the usual legal and contractual target) and AAA (enhanced).

**Example of each principle:**

- **Perceivable:** alt text and captions.
- **Operable:** keyboard access and no seizure-inducing flashes.
- **Understandable:** clear errors and consistent navigation.
- **Robust:** valid markup that works with assistive technology.

**Say it like this:** "We targeted WCAG 2.1 AA, the common requirement for healthcare. In practice that meant keyboard access everywhere, 4.5:1 text contrast, screen-reader announcements for call events, and captions."

---

**Q47. What is the first rule of ARIA?**

**Short answer:** Don't use ARIA if a native HTML element does the job. ARIA changes only what screen readers *announce*. It adds no keyboard behaviour or focus. `<div role="button">` still needs `tabindex`, plus Enter and Space handlers, so just use `<button>`.

**Say it like this:** "No ARIA is better than bad ARIA. I reach for native elements first and use ARIA only for patterns HTML doesn't have, like tabs or comboboxes."

---

**Q48. Give examples of ARIA roles, states and properties.**

**Short answer:**

- **Roles:** `dialog`, `tablist`, `tab`, `tabpanel`, `alert`, `status`, `menu`.
- **States:** `aria-expanded`, `aria-pressed`, `aria-checked`, `aria-selected`, `aria-busy`, `aria-invalid`.
- **Properties:** `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-live`.

---

**Q49. `aria-label` vs `aria-labelledby` vs `aria-describedby`?**

**Example:**

```html
<button aria-label="Close dialog">×</button>                 <!-- name from a string -->

<section aria-labelledby="h-calls"><h2 id="h-calls">Calls</h2></section> <!-- name from element -->

<input id="pw" aria-describedby="pw-hint">
<p id="pw-hint">At least 12 characters</p>                      <!-- extra description -->
```

**Short answer:** `aria-label` sets the accessible name as a string, and `aria-labelledby` takes it from visible element(s), which is preferred because it stays in sync. `aria-describedby` adds extra information that's read after the name, such as hints and errors.

---

**Q50. What are live regions?**

**Short answer:** Areas whose changes screen readers announce automatically. `aria-live="polite"` waits until the user is idle and `assertive` interrupts. `role="status"` is polite and `role="alert"` is assertive.

**Example:**

```html
<!-- Rendered empty on page load -->
<div role="status" id="announcer" class="visually-hidden"></div>
<script>
  announcer.textContent = 'Interpreter joined the call';
</script>
```

**Gotcha:** The live region must already exist in the DOM *before* its content changes. If you create the element and its text at the same moment, nothing is announced.

---

**Q51. What's on a keyboard accessibility checklist?**

**Short answer:**

- Everything interactive is reachable with Tab, in a logical order.
- Focus is always visible.
- Enter and Space activate buttons, and Enter follows links.
- Escape closes dialogs, menus and popovers.
- Arrow keys move inside composite widgets (tabs, menus, radio groups).
- There are no keyboard traps, except an intentional focus trap inside a modal.

---

**Q52. What do the `tabindex` values mean?**

**Short answer:** `0` puts the element in the natural tab order. `-1` makes it focusable by script only, which is useful for moving focus to a heading or dialog. Positive values (`1`, `2`…) force an order and should never be used, because they break the natural flow.

---

**Q53. What is a roving tabindex?**

**Short answer:** In a composite widget (toolbar, tablist, grid), only the active item has `tabindex="0"` and the rest have `-1`. Arrow keys move focus within the widget, so the whole widget is a single Tab stop.

**Example:** A call control toolbar: Tab lands on "Mute", the right arrow moves to "Camera", and Tab again leaves the toolbar.

---

**Q54. How do you manage focus on a single-page app route change?**

**Short answer:** A full page load resets focus, but a SPA doesn't. After navigating, move focus to the new page's `<h1>` (with `tabindex="-1"`) and update `document.title`, so screen-reader users know the page changed.

```js
useEffect(() => {
  document.title = `${pageTitle} – InterpretIQ`;
  headingRef.current?.focus();
}, [pathname]);
```

---

**Q55. What are the colour contrast requirements at level AA?**

**Short answer:** 4.5:1 for normal text. 3:1 for large text (24px and up, or 18.66px bold and up), and for UI components and focus indicators.

---

**Q56. Why not rely on colour alone? Give an example.**

**Short answer:** About 1 in 12 men has some colour-vision deficiency. A red border alone doesn't communicate an error, so add an icon and text ("⚠ Email is required"). Charts need labels or patterns as well as colours.

---

**Q57. How do you build an accessible icon-only button?**

```html
<button type="button" aria-label="Mute microphone" aria-pressed="false">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>
```

**Explanation:** The button gets its name from `aria-label`, `aria-pressed` announces "toggle button, not pressed", and the SVG is hidden from assistive technology because it's decorative here.

---

**Q58. How do you make form errors accessible?**

**Short answer:** Show the message inline and link it to the field with `aria-describedby`, and set `aria-invalid="true"`. On submit, show an error summary at the top with links to each field, and move focus to the first invalid field.

```html
<label for="email">Email</label>
<input id="email" aria-invalid="true" aria-describedby="email-err">
<p id="email-err">Enter an email like name@clinic.com</p>
```

---

**Q59. What is a skip link?**

**Short answer:** The first focusable element on the page. It lets keyboard users jump past the navigation, and it's visible only on focus.

```html
<a href="#main" class="skip-link">Skip to main content</a>
…
<main id="main" tabindex="-1">…</main>
```

---

**Q60. How do you test accessibility?**

**Short answer:**

- **Automated:** axe-core (jest-axe in unit tests, @axe-core/playwright in E2E) and Lighthouse. These catch roughly 30–40% of issues.
- **Manual:** a keyboard-only pass; screen readers (NVDA with Chrome or Firefox on Windows, VoiceOver with Safari on Mac and iOS); 200% zoom; `prefers-reduced-motion`; Windows high-contrast mode.

**Say it like this:** "Automated tools catch missing labels and contrast problems, but not whether focus goes to the right place after a dialog closes. So every critical flow also got a manual keyboard and screen-reader pass."

---

**Q61. Captions vs transcripts vs audio description?**

**Short answer:** Captions are timed text of the audio, shown during the video. A transcript is the full text available separately. Audio description is narration of important visual information for blind users.

---

## 🔴 Level 3 — Advanced

**Q62. How does the browser parse HTML?**

**Short answer:** A tokenizer turns the HTML text into tokens, then tree construction builds the DOM. The parser is very forgiving and recovers from errors. A **preload scanner** reads ahead to discover images, scripts and CSS while the main parser is blocked by a script, so downloads start early.

---

**Q63. Why can `document.write` hurt performance?**

**Short answer:** It blocks the parser and defeats the preload scanner, and Chrome may block it on slow connections. Use DOM APIs instead.

---

**Q64. What is the Shadow DOM, and why use it?**

**Short answer:** An encapsulated DOM subtree attached to an element. Styles inside don't leak out and outside styles don't leak in (except inherited properties and CSS variables). Use it for Web Components and for widgets embedded into host pages you don't control.

---

**Q65. What is the Custom Elements lifecycle?**

```js
class CallBadge extends HTMLElement {
  static observedAttributes = ['status'];
  connectedCallback() {               // added to the page
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  attributeChangedCallback() {         // an observed attribute changed
    this.render();
  }
  disconnectedCallback() {}            // removed — clean up listeners
  render() {
    if (!this.shadowRoot) return;
    const span = document.createElement('span');
    span.textContent = this.getAttribute('status') ?? '';  // safe, no innerHTML
    this.shadowRoot.replaceChildren(span);
  }
}
customElements.define('call-badge', CallBadge);
// usage: <call-badge status="live"></call-badge>
```

---

**Q66. What is Declarative Shadow DOM?**

**Short answer:** `<template shadowrootmode="open">` inside an element lets the server render a shadow root without JavaScript. This makes server-side rendering possible for Web Components.

---

**Q67. What does the `inert` attribute do?**

**Short answer:** It makes a whole subtree non-interactive (no focus, no clicks) and hides it from assistive technology. Put it on the background content when you show a custom modal.

---

**Q68. What is the Popover API?**

```html
<button popovertarget="menu">Options</button>
<div popover id="menu">…</div>
```

**Short answer:** Native popovers that render in the browser's "top layer" (no z-index battles) and close when you click outside or press Escape, with no JavaScript.

---

**Q69. What does a PWA need?**

**Short answer:** HTTPS, a web app manifest, a service worker (with a fetch handler for offline support) and icons. You get installation to the home screen or desktop, an offline app shell, push notifications (with permission) and full-screen app-like launching.

---

**Q70. What are the key fields in a web app manifest?**

```json
{
  "name": "InterpretIQ",
  "short_name": "IIQ",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0b5fff",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

**Q71. Describe the service worker lifecycle.**

**Short answer:** register → **install** (precache files) → **waiting** (the old service worker still controls open pages) → **activate** (delete old caches) → handle `fetch` and `push` events.

**Explanation:** `skipWaiting()` and `clients.claim()` make a new version take over immediately, but a page can then end up running old HTML with new JavaScript. A better UX is a "New version available — Reload" banner.

---

**Q72. What are the service worker caching strategies?**

| Strategy | How it works | Use for |
|---|---|---|
| Cache-first | serve from cache, else network | hashed static assets (`app.3f2a.js`) |
| Network-first | try network, fall back to cache | HTML pages |
| Stale-while-revalidate | serve cache now, update in background | avatars, config |
| Network-only | never cache | authenticated APIs, PHI, payments |

---

**Q73. Which permission-related APIs should you know?**

**Short answer:** `getUserMedia` (camera and microphone; needs HTTPS), Notifications and Geolocation. The `Permissions-Policy` HTTP header controls which origins and iframes may request them, for example `Permissions-Policy: camera=(self)`.

---

**Q74. What is structured data (JSON-LD)?**

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization", "name": "InterpretIQ" }
</script>
```

It helps search engines show rich results such as ratings, FAQs and events.

---

**Q75. What are Open Graph and Twitter cards?**

**Short answer:** `og:title`, `og:description`, `og:image` and `og:url` meta tags control how a link preview looks in WhatsApp, Slack, LinkedIn and others.

---

**Q76. What are `rel="canonical"` and `hreflang`?**

**Short answer:** `canonical` tells search engines which URL is the main version of duplicate pages. `hreflang` lists language or region versions of a page (`en-IN`, `es-US`).

---

**Q77. Can you set a Content Security Policy with a `<meta>` tag?**

**Short answer:** Mostly yes, but `frame-ancestors` (clickjacking protection) and reporting only work as HTTP headers. Prefer headers.

---

**Q78. Why does `rel="noopener"` matter?**

**Short answer:** Without it, a page opened with `target="_blank"` gets `window.opener` and can redirect *your* original tab to a phishing page. This attack is called "reverse tabnabbing". Modern browsers default to `noopener`, but writing it explicitly is good practice.

---

## 🧩 Level 4 — Scenario-Based

**Q79. A designer gave you a clickable card with a title, an image and a "Share" button. How do you mark it up accessibly?**

**Answer:** Don't wrap the whole card in an `<a>`, because nesting a button inside a link is invalid and confusing. Make the title the link, and stretch its click area over the card with CSS. Keep "Share" as a separate button placed above that area.

```html
<article class="card">
  <img src="…" alt="">
  <h3><a href="/calls/42" class="card-link">Call with Maria</a></h3>
  <button type="button" class="share">Share</button>
</article>
```

```css
.card { position: relative; }
.card-link::after { content: ""; position: absolute; inset: 0; }
.share { position: relative; z-index: 1; }
```

---

**Q80. Screen-reader users report that the "Saved" toast is never announced.**

**Answer:** The live region was probably created at the same moment as its text, and screen readers only announce *changes* to an existing region. Render an empty `role="status"` container on page load and insert the text later.

---

**Q81. Your custom dropdown fails an accessibility audit.**

**Answer:** First, could a native `<select>` work? If not, implement the WAI-ARIA combobox/listbox pattern:

- Roles: `combobox`, `listbox`, `option`.
- `aria-expanded` and `aria-activedescendant`.
- Keys: arrows, Home/End, typeahead, Enter, Escape.
- Return focus to the trigger when it closes.

Or use a tested headless library such as Radix or Headless UI.

**Say it like this:** "Writing an accessible combobox from scratch is a week of work and still easy to get wrong. On BpoBox we used Radix primitives so keyboard handling and ARIA came built in."

---

**Q82. Mobile users get a number spinner and the wrong keyboard for a 6-digit OTP.**

```html
<input type="text" inputmode="numeric" autocomplete="one-time-code"
       pattern="\d{6}" maxlength="6">
```

This gives a number pad and SMS autofill on iOS and Android, with no spinner and no lost leading zeros.

---

**Q83. The page jumps around while images load.**

**Answer:** Reserve the space. Set `width` and `height` attributes (or CSS `aspect-ratio`) on images, embeds and ads, and don't insert banners above existing content. This fixes CLS (Cumulative Layout Shift).

---

**Q84. A third-party widget must be embedded without breaking your styles or reading your cookies.**

**Answer:** Put it in a sandboxed iframe served from a *different origin*. That isolates styles, the DOM and cookies. If you trust the code and only need style isolation, Shadow DOM is enough.

---

**Q85. Marketing wants the hero image to load faster.**

**Answer:**

- Preload it and set `fetchpriority="high"`.
- Serve AVIF or WebP at the right size (`srcset`/`sizes`).
- Serve it from a CDN.
- Don't lazy-load it.
- Use an `<img>` rather than a CSS background image, which the browser discovers late.

---

**Q86. Users must be able to install the app on clinic tablets and reopen it quickly on poor Wi-Fi.**

**Answer:** Make it a PWA. The manifest enables installation, and the service worker precaches the app shell so it opens instantly. Use network-only for authenticated and PHI APIs, and show an offline page explaining that calls need a connection.

---

## 🎯 From Your Resume

**Q87. "InterpretIQ is WCAG compliant. Show me how you'd make the call screen accessible."**

**Say it like this:**

"I'd cover five areas:

1. **Controls:** real `<button>`s for mute and camera with `aria-pressed`, clear `aria-label`s, and a visible focus ring with 3:1 contrast even over video.
2. **Keyboard:** documented shortcuts that don't clash with screen-reader keys, and Escape to close side panels.
3. **Announcements:** a polite live region for 'Interpreter joined', 'Reconnecting…' and 'Recording started'.
4. **Media:** captions or a live transcript option, and speaking animations that respect `prefers-reduced-motion`.
5. **Focus:** focus moves to the call region on join, and to a summary heading when the call ends."

---

**Q88. "How did you verify WCAG compliance?"**

**Say it like this:** "In layers. axe ran in CI through jest-axe and Playwright, so regressions failed the build. Lighthouse covered page-level checks. We checked contrast at the design-token level, so every component inherited valid colours. Critical flows (login, joining a call, ending a call) got manual keyboard and NVDA/VoiceOver passes, and the PR template had an accessibility checklist. One real bug: our reconnect banner appeared visually but was never announced. I fixed it by rendering the live region on load."

*(Replace the example with a bug you actually fixed.)*

---

**Q89. "How do you request camera and microphone access in a PWA without users denying it?"**

**Say it like this:** "Never ask on page load. First a pre-permission screen explains why we need the camera. The browser prompt appears only when the user clicks 'Enable camera'. Then a device check shows a preview. If permission is denied (`NotAllowedError`), we show browser-specific steps to re-enable it. If no device is found (`NotFoundError`), we offer an audio-only join. We remember the chosen device IDs for next time."

---

**Q90. "What did the service worker cache, and what must it never cache?"**

**Say it like this:** "Only the app shell and hashed static assets (JS, CSS, fonts, icons), so the app opens fast on clinic tablets. It must never cache authenticated API responses, recordings, transcripts or anything containing PHI, because a cache on a shared tablet is a data leak. We also cleared all caches on logout."
