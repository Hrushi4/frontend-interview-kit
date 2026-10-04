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

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is HTML?**

**Short answer:** HyperText Markup Language, the language that describes the structure and meaning of web content. The browser parses it into the DOM.

**Explanation:** HTML says what each piece of content *is* (a heading, a list, a button). CSS controls how it looks and JavaScript how it behaves. Correct HTML gives you accessibility, SEO and built-in browser behaviour for free.

**Example:**

```html
<article>
  <h2>Interpreter joined</h2>
  <p>Maria joined at <time datetime="2026-10-04T10:30">10:30</time>.</p>
</article>
```

**Say it like this:** "HTML defines what each piece of content *is*: a heading, a list, a form, a button. CSS styles it and JavaScript adds behaviour, but good HTML gives you accessibility and SEO for free."

---

**Q2. Write a minimal valid HTML5 document.**

**Short answer:** A doctype, an `<html lang>` element, a `<head>` with charset, viewport and title, and a `<body>`.

**Explanation:** The doctype turns on standards mode, `lang` helps screen readers, the charset must come early, the viewport makes mobile layouts work, and the title appears in tabs, bookmarks and search results.

**Example:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Call History – InterpretIQ</title>
</head>
<body>
  <main><h1>Call history</h1></main>
</body>
</html>
```

**Say it like this:** "Doctype for standards mode, `lang` for screen readers, charset first, the viewport tag for mobile, a meaningful title, and a `main` landmark in the body. Every line has a reason."

---

**Q3. What is the purpose of `<!DOCTYPE html>`?**

**Short answer:** It tells the browser to use standards mode. Without it, browsers switch to quirks mode, which emulates old layout bugs.

**Explanation:** Quirks mode exists for 1990s pages. It changes things like the box model and table sizing, so layouts break in surprising ways if you forget the doctype.

**Example:** A page without the doctype might calculate `width` including padding in some cases, so a 300px box suddenly measures differently than in your CSS.

**Say it like this:** "The doctype switches the browser into standards mode. Without it you get quirks mode and inconsistent layout, so it's always the first line."

---

**Q4. Why set `lang` on `<html>`?**

**Short answer:** Screen readers use it to choose pronunciation and voice; translation tools and search engines use it too.

**Explanation:** For a phrase in another language, set `lang` on that element so it's pronounced correctly. WCAG requires the page language (3.1.1) and changes of language (3.1.2).

**Example:**

```html
<html lang="en">
  <p>The interpreter said <span lang="es">Buenos días</span>.</p>
</html>
```

**Say it like this:** "On an interpretation platform this really matters. If Spanish text is marked `lang="es"`, the screen reader pronounces it correctly instead of reading it with English rules."

---

**Q5. Element vs tag vs attribute?**

**Short answer:** A tag is the markup (`<p>`). An element is the opening tag, its content and the closing tag together. An attribute is extra information on the opening tag.

**Explanation:** In the DOM, an element becomes a node object, and attributes become properties you can read in JavaScript (with some name differences, such as `class` → `className`).

**Example:** In `<a href="/calls">Calls</a>`, `<a>` is the tag, the whole line is the element, and `href` is an attribute.

**Say it like this:** "The tag is the syntax, the element is the whole thing including content, and attributes configure it, like `href` on a link."

---

**Q6. What are void (self-closing) elements?**

**Short answer:** Elements that can't have content or a closing tag: `<img>`, `<br>`, `<hr>`, `<input>`, `<meta>`, `<link>` and `<source>`.

**Explanation:** In HTML the trailing slash (`<img />`) is optional and ignored. In JSX it's required, because JSX follows XML-style rules.

**Example:**

```html
<img src="avatar.png" alt="Dr. Patel">
<input type="email" name="email">
```

**Say it like this:** "Void elements like `img` and `input` have no content and no closing tag. In JSX I still self-close them because JSX requires it."

---

**Q7. Block vs inline elements?**

**Short answer:** Block elements start on a new line and take the full available width. Inline elements flow within a line of text and ignore width, height and vertical margins.

**Explanation:** `display: inline-block` flows inline but respects width and height. CSS can change how any element displays, but its *semantic* meaning stays the same.

**Example:** `div`, `p`, `h1`, `section` are block; `span`, `a`, `strong`, `em` are inline. A `<span>` with `width: 200px` ignores the width until you make it `inline-block`.

**Say it like this:** "Block elements stack and take full width; inline elements flow with text. If I need a badge with padding and a fixed size inside text, I use `inline-block` or `inline-flex`."

---

**Q8. What is semantic HTML and why does it matter?**

**Short answer:** Using elements that describe their purpose (`header`, `nav`, `main`, `article`, `section`, `aside`, `footer`, `button`) instead of generic `div`s.

**Explanation:** You get accessibility (landmarks and roles screen readers can navigate), built-in behaviour (keyboard support, form submission), better SEO, and more readable code.

**Example:**

```html
<!-- Bad -->
<div class="btn" onclick="save()">Save</div>
<!-- Good -->
<button type="button" onclick="save()">Save</button>
```

**Say it like this:** "Semantic HTML is the cheapest accessibility win. A real `<button>` gives me focus, Enter and Space handling and the correct screen-reader role without writing a single line of ARIA."

---

**Q9. `<div>` vs `<span>`?**

**Short answer:** Both are non-semantic containers used for styling and layout. `div` is block-level and `span` is inline.

**Explanation:** Use them only when no semantic element fits. Screen readers announce nothing special for them, so they shouldn't carry meaning or interactivity on their own.

**Example:**

```html
<div class="toolbar">…</div>
<p>Status: <span class="badge">Live</span></p>
```

**Say it like this:** "`div` and `span` are my last resort: `div` for block layout wrappers, `span` for styling a piece of text. If something has meaning, there's usually a better element."

---

**Q10. `<section>` vs `<article>` vs `<div>`?**

**Short answer:** `<article>` is self-contained content that makes sense on its own, `<section>` is a thematic group with a heading, and `<div>` has no meaning.

**Explanation:** A rule of thumb: if you could syndicate it (a blog post, a comment, a call summary card), it's an article. If it has a heading and belongs to a larger whole, it's a section. A section with an accessible name becomes a "region" landmark.

**Example:**

```html
<section aria-labelledby="recent">
  <h2 id="recent">Recent calls</h2>
  <article><h3>Call with Maria</h3>…</article>
</section>
```

**Say it like this:** "Article for standalone items like a call card, section for a titled group like 'Recent calls', and div purely for layout."

---

**Q11. What are the rules for headings?**

**Short answer:** One logical `<h1>` per page, no skipped levels (h2 → h4) just for size, and CSS for styling.

**Explanation:** Headings form the page outline. Many screen-reader users press "H" to jump between headings, so a broken hierarchy makes the page hard to navigate.

**Example:**

```html
<h1>Call history</h1>
  <h2>Today</h2>
    <h3>Call with Maria</h3>
  <h2>Yesterday</h2>
```

**Say it like this:** "Headings are navigation for screen-reader users, so I pick the level by structure and size them with CSS."

---

**Q12. `<b>` vs `<strong>`, and `<i>` vs `<em>`?**

**Short answer:** `<strong>` means importance and `<em>` means emphasis; `<b>` and `<i>` are purely visual.

**Explanation:** `<strong>` and `<em>` carry meaning that assistive tech and search engines can use. `<b>` and `<i>` are for stylistic offsets like a product name or a foreign word.

**Example:**

```html
<p><strong>Do not</strong> share this link with patients.</p>
<p>The term <i lang="la">ad hoc</i> means…</p>
```

**Say it like this:** "I use `strong` when the text is genuinely important, like a warning, and `b` only when I want bold styling with no extra meaning."

---

**Q13. What kinds of lists does HTML have?**

**Short answer:** `<ul>` (unordered), `<ol>` (ordered) with `<li>` items, and `<dl>` (description list) with `<dt>` terms and `<dd>` descriptions.

**Explanation:** Screen readers announce "list, 3 items", which tells users how much content there is. Removing list styles with CSS can make Safari drop list semantics, so add `role="list"` if needed.

**Example:**

```html
<dl>
  <dt>Duration</dt><dd>12 min</dd>
  <dt>Language</dt><dd>Spanish</dd>
</dl>
```

**Say it like this:** "Navigation menus and card grids are lists, so I mark them up as lists. Screen readers then announce how many items there are."

---

**Q14. What are the essential parts of an anchor (`<a>`)?**

**Short answer:** `href` sets the destination. For new tabs use `target="_blank"` with `rel="noopener noreferrer"`. Other options are `download`, `mailto:` and `tel:`.

**Explanation:** A link without `href` isn't focusable or announced as a link. Links navigate; buttons perform actions. Opening a new tab should be announced to users.

**Example:**

```html
<a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
  Help docs <span class="visually-hidden">(opens in new tab)</span>
</a>
```

**Say it like this:** "If it goes somewhere it's a link with an `href`; if it does something it's a button. For new tabs I add `rel=noopener` and tell screen-reader users it opens a new tab."

---

**Q15. Which attributes does `<img>` require?**

**Short answer:** `src` and `alt`. Also add `width` and `height` so the browser reserves space.

**Explanation:** Without dimensions the page jumps when the image loads, which hurts CLS. With `width`/`height`, modern browsers compute the aspect ratio before download.

**Example:**

```html
<img src="/avatars/maria.jpg" alt="Maria Lopez, interpreter" width="96" height="96">
```

**Say it like this:** "Every image gets `alt` for accessibility and `width` and `height` so the layout doesn't shift while it loads."

---

**Q16. What are the rules for `alt` text?**

**Short answer:** Describe a meaningful image's purpose, use `alt=""` for decorative images, describe the action for functional images, and don't start with "image of".

**Explanation:** Screen readers already say "image", so "image of" is redundant. An empty `alt` tells them to skip the image; a missing `alt` makes them read the file name.

**Example:**

```html
<img src="avatar.png" alt="Dr. Patel, interpreter">
<img src="divider.svg" alt="">
<a href="/search"><img src="search.svg" alt="Search"></a>
```

**Say it like this:** "I ask what the image communicates in context. A decorative divider gets empty alt, and a search icon inside a link gets 'Search', because that's what it does."

---

**Q17. Write a basic accessible form.**

**Short answer:** Labels linked to inputs, the right input types, `name` attributes, `autocomplete`, and a real submit button.

**Explanation:** Labels give inputs accessible names and bigger click targets. `type="email"` adds validation and the right mobile keyboard. `autocomplete` helps password managers, and `name` is what gets submitted.

**Example:**

```html
<form action="/login" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />
  <label for="password">Password</label>
  <input id="password" name="password" type="password" required autocomplete="current-password" />
  <button type="submit">Sign in</button>
</form>
```

**Say it like this:** "Every input has a visible label tied by `for`/`id`, the correct type and autocomplete, and the form submits with a real button, so it works with keyboard, password managers and screen readers."

---

**Q18. Why does `name` matter on inputs?**

**Short answer:** `name` is the key sent with the form data. An input without a `name` isn't submitted at all.

**Explanation:** It's also how `FormData` and libraries like React Hook Form find the value. Radio buttons sharing a `name` form a group where only one can be selected.

**Example:**

```js
const data = Object.fromEntries(new FormData(form)); // { email: "...", password: "..." }
```

**Say it like this:** "The `name` attribute is the field's key in the submitted data. Forget it and the value silently never reaches the server."

---

**Q19. GET vs POST for form submission?**

**Short answer:** GET puts data in the URL, which suits searches and filters. POST sends data in the body, which suits creating or changing data and anything sensitive.

**Explanation:** URLs end up in browser history, server logs and analytics, so passwords or patient data must never go in a GET. GET requests should never change data.

**Example:** `/calls?status=flagged&agent=asha` (GET, bookmarkable filter) vs `POST /scorecards` with a JSON body.

**Say it like this:** "GET for reading and shareable filters, POST for changes and sensitive data, because URLs end up in logs."

---

**Q20. What is the default `type` of a `<button>`?**

**Short answer:** Inside a form it's `submit`. Always write `type="button"` for buttons that shouldn't submit.

**Explanation:** Forgetting this is a classic bug: a "toggle password visibility" button submits the whole form.

**Example:**

```html
<form>
  <input type="password" />
  <button type="button" onclick="togglePassword()">Show</button>
  <button type="submit">Sign in</button>
</form>
```

**Say it like this:** "Buttons default to submit inside forms, so I always set `type` explicitly to avoid accidental submissions."

---

**Q21. `id` vs `class`?**

**Short answer:** An `id` must be unique on the page and is used for anchors, label targets and ARIA references. A `class` is reusable and used for styling and grouping.

**Explanation:** Avoid styling by `id`, because its high specificity makes CSS hard to override. In reusable components, generate unique IDs (`useId`) so two instances don't clash.

**Example:**

```html
<label for="email">Email</label><input id="email" class="input input--large">
```

**Say it like this:** "IDs are for unique references like labels and ARIA; classes are for styling. In React components I generate IDs with `useId` so they stay unique."

---

**Q22. What are `data-*` attributes?**

**Short answer:** Custom attributes for storing extra information on elements, read in JavaScript through `dataset`.

**Explanation:** They're also handy as test hooks (`data-testid`) and styling hooks (`[data-status="missed"]`), and Radix uses them to expose state (`data-state="open"`).

**Example:**

```html
<li data-call-id="42" data-status="missed">Call with Maria</li>
<script>li.dataset.callId; // "42"</script>
```

**Say it like this:** "`data-*` attributes attach custom data to elements. I also use them for state-based styling, like Radix's `data-state`."

---

**Q23. What are HTML entities?**

**Short answer:** Codes for reserved or special characters: `&lt;` (<), `&gt;` (>), `&amp;` (&), `&quot;` ("), `&nbsp;` (non-breaking space).

**Explanation:** They let you show characters that would otherwise be parsed as HTML. Escaping `<` as `&lt;` is exactly what prevents injected HTML, which is how frameworks protect against XSS.

**Example:** `<p>Use &lt;button&gt; for actions</p>` displays "Use <button> for actions". `10&nbsp;min` keeps "10 min" on one line.

**Say it like this:** "Entities escape special characters. It's the same mechanism React uses when it escapes text to prevent XSS."

---

**Q24. Why must `<meta charset="utf-8">` come first in `<head>`?**

**Short answer:** The browser needs the encoding before it parses any text, and the charset must appear within the first 1024 bytes.

**Explanation:** If the browser guesses the wrong encoding, characters like ₹, é or non-Latin scripts show as garbage, and it may have to re-parse the page.

**Example:** A Hindi or Spanish UI string renders as "Ã©" junk when the charset is missing or too late.

**Say it like this:** "Charset goes first so the browser decodes text correctly from the start. It matters for any multilingual app."

---

**Q25. What does the meta viewport tag do?**

**Short answer:** `width=device-width, initial-scale=1` tells mobile browsers to use the real device width instead of rendering a 980px desktop page and shrinking it.

**Explanation:** Without it, media queries don't work as expected on phones. Never add `user-scalable=no` or `maximum-scale=1`, because blocking zoom fails accessibility (WCAG 1.4.4).

**Example:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Say it like this:** "The viewport tag makes responsive CSS work on phones. I never disable zoom, because low-vision users rely on it."

---

## 🟡 Level 2 — Intermediate

**Q26. Script loading: default vs `async` vs `defer` vs `type="module"`?**

**Short answer:** A normal script blocks parsing. `async` downloads in parallel and runs as soon as it's ready (order not kept). `defer` downloads in parallel and runs in order after parsing. Modules are deferred by default.

**Explanation:**

| Attribute | Download | When it runs | Order kept? |
|---|---|---|---|
| none | blocks parsing | immediately | yes |
| `async` | in parallel | as soon as downloaded | no |
| `defer` | in parallel | after parsing, before `DOMContentLoaded` | yes |
| `type="module"` | in parallel | deferred | yes |

**Example:**

```html
<script src="/app.js" defer></script>
<script src="https://analytics.example.com/a.js" async></script>
```

**Say it like this:** "I use `defer` for application scripts because they don't block parsing and run in order once the DOM is ready. I use `async` only for independent scripts like analytics."

---

**Q27. `DOMContentLoaded` vs `load`?**

**Short answer:** `DOMContentLoaded` fires when the HTML is parsed and deferred scripts have run. `load` fires when everything, including images, iframes and fonts, has finished.

**Explanation:** Most app initialisation should run on `DOMContentLoaded` (or simply with `defer`). Waiting for `load` delays interactivity until every image has downloaded.

**Example:**

```js
document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('load', () => console.log('all images loaded'));
```

**Say it like this:** "`DOMContentLoaded` means the DOM is ready; `load` means every resource is ready. I initialise on the first and almost never need the second."

---

**Q28. What are resource hints?**

**Short answer:** `preconnect` opens connections early, `dns-prefetch` does only the DNS lookup, `preload` fetches a resource needed now, `prefetch` fetches something for the next page, and `modulepreload` preloads JS modules.

**Explanation:** They let the browser start network work before it would normally discover it. Use them sparingly: preloading too much competes with truly critical resources.

**Example:**

```html
<link rel="preconnect" href="https://api.interpretiq.com" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/call-summary.js">
```

**Say it like this:** "For a video app, I preconnect to the signalling and media servers so join is faster, preload the main font and hero image, and prefetch the next screen's code."

---

**Q29. What does `fetchpriority` do?**

**Short answer:** It hints at loading priority: `high` for the LCP image, `low` for things like below-the-fold carousel slides.

**Explanation:** Browsers guess priorities, and they often guess wrong for images. Telling them which image is the LCP element can noticeably improve LCP.

**Example:**

```html
<img src="hero.avif" alt="…" fetchpriority="high" width="1200" height="600">
<img src="slide-4.avif" alt="…" fetchpriority="low" loading="lazy">
```

**Say it like this:** "I mark the main hero image with `fetchpriority="high"`, so the browser downloads it before less important images."

---

**Q30. Responsive images: `srcset`/`sizes` vs `<picture>`?**

**Short answer:** `srcset` with `sizes` lets the browser choose the right resolution. `<picture>` provides format fallbacks (AVIF → WebP → JPEG) or different crops per breakpoint.

**Explanation:** `sizes` tells the browser how wide the image will display, so it can pick the smallest file that looks sharp. `<picture>` gives you control when you need a specific file.

**Example:**

```html
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 50vw" alt="Interpreter on a call" width="800" height="450">

<picture>
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="Interpreter on a call">
</picture>
```

**Say it like this:** "A phone shouldn't download a 1600px image. `srcset` with `sizes` lets the browser pick, and `<picture>` gives me AVIF with fallbacks."

---

**Q31. What does `loading="lazy"` do?**

**Short answer:** Native lazy loading: images and iframes load only when they're near the viewport.

**Explanation:** It saves bandwidth and speeds up the initial load with no JavaScript. Never lazy-load the LCP or hero image, because that delays the most important paint.

**Example:**

```html
<img src="call-thumb.jpg" alt="" loading="lazy" width="320" height="180">
<iframe src="https://maps.example.com" loading="lazy" title="Clinic location"></iframe>
```

**Say it like this:** "Everything below the fold gets `loading=lazy`; the hero image never does."

---

**Q32. Which HTML5 input types and attributes should you know?**

**Short answer:** Types like `email`, `tel`, `url`, `number`, `date`, `search` and `file`; attributes like `required`, `pattern`, `min`, `max`, `minlength`, `maxlength`, `autocomplete`, `inputmode` and `enterkeyhint`.

**Explanation:** The right type gives free validation and the right mobile keyboard. A placeholder is not a label: it disappears when typing and often has poor contrast.

**Example:**

```html
<input type="tel" name="phone" autocomplete="tel" enterkeyhint="next">
<input type="number" name="score" min="0" max="100" step="1">
```

**Say it like this:** "Choosing the right input type is free UX: validation, the right keyboard and autofill. And I never use a placeholder as a label."

---

**Q33. `inputmode` vs `type`?**

**Short answer:** `type` changes behaviour and validation. `inputmode` changes only the on-screen keyboard.

**Explanation:** `type="number"` adds spinners, drops leading zeros and changes values on scroll, which is bad for codes. `type="text" inputmode="numeric"` gives a number pad without those quirks.

**Example:**

```html
<input type="text" inputmode="numeric" autocomplete="one-time-code" pattern="\d{6}">
```

**Say it like this:** "For OTPs and card numbers I use `inputmode=numeric` on a text input, not `type=number`, because they aren't numbers you do maths with."

---

**Q34. Which `autocomplete` values matter?**

**Short answer:** `email`, `name`, `tel`, `street-address`, `current-password`, `new-password` and `one-time-code`.

**Explanation:** They let browsers and password managers fill fields correctly, and WCAG 1.3.5 requires them for personal data fields. `new-password` makes managers suggest a strong password.

**Example:**

```html
<input name="password" type="password" autocomplete="new-password">
<input name="otp" autocomplete="one-time-code">
```

**Say it like this:** "Correct `autocomplete` values make forms faster, help password managers, and are a WCAG requirement for personal data."

---

**Q35. What is the native validation API?**

**Short answer:** Methods and properties like `checkValidity()`, `validity`, and `setCustomValidity()`, plus the `:invalid` and `:user-invalid` CSS pseudo-classes.

**Explanation:** You can rely on built-in validation, or set `novalidate` on the form and show your own accessible messages while still using the `validity` flags.

**Example:**

```js
const input = document.querySelector('#email');
input.checkValidity();               // true/false
input.validity.valueMissing;         // specific reason
input.setCustomValidity('Use your work email');
form.noValidate = true;              // take control of the UI
```

**Say it like this:** "The browser already knows if a field is invalid. I often use `novalidate` for custom, accessible error messages but still read the native `validity` state."

---

**Q36. What are `fieldset` and `legend` for?**

**Short answer:** They group related controls, and the `legend` names the group.

**Explanation:** For radio groups, the question is the legend, so a screen reader says "Preferred language, group, Spanish, radio button 1 of 3". Without it users hear only "Spanish".

**Example:**

```html
<fieldset>
  <legend>Preferred language</legend>
  <label><input type="radio" name="lang" value="es"> Spanish</label>
  <label><input type="radio" name="lang" value="hi"> Hindi</label>
</fieldset>
```

**Say it like this:** "Radio groups always get a `fieldset` and `legend`, so screen-reader users hear the question, not just the options."

---

**Q37. What are the two ways to associate a `<label>` with an input?**

**Short answer:** Use `for` pointing to the input's `id`, or wrap the input inside the label.

**Explanation:** Both give the input its accessible name, and clicking the label focuses the input, which makes a bigger click target, especially for checkboxes.

**Example:**

```html
<label for="name">Name</label> <input id="name">
<label><input type="checkbox"> Remember me</label>
```

**Say it like this:** "I link labels with `for`/`id`, or wrap the input. Either way the field is announced correctly and the label is clickable."

---

**Q38. What is the `<dialog>` element?**

**Short answer:** A native modal. `showModal()` gives a backdrop, moves focus inside, closes on Escape, and makes the rest of the page inert.

**Explanation:** That's all accessibility work you'd otherwise build by hand. `<form method="dialog">` closes the dialog and sets `returnValue` to the clicked button's value.

**Example:**

```html
<dialog id="confirm">
  <p>End the call for everyone?</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="end">End call</button>
  </form>
</dialog>
<script>confirm.showModal();</script>
```

**Say it like this:** "Native `<dialog>` with `showModal()` handles focus trapping, Escape and an inert background, so I prefer it over a custom div modal."

---

**Q39. What are `<details>` and `<summary>`?**

**Short answer:** A native expand/collapse (disclosure) widget that's keyboard accessible with no JavaScript.

**Explanation:** It announces its expanded state automatically, and it can be styled. It suits FAQs, advanced settings and diagnostics panels.

**Example:**

```html
<details>
  <summary>Call diagnostics</summary>
  <p>Packet loss: 0.2%</p>
</details>
```

**Say it like this:** "For simple show/hide content I use `details`/`summary`. It's accessible out of the box and needs no JavaScript."

---

**Q40. What are `<template>` and `<slot>`?**

**Short answer:** `<template>` holds inert markup that you clone with JavaScript. `<slot>` is a placeholder inside a Shadow DOM where a component's children appear.

**Explanation:** Template content isn't rendered, its images don't load and its scripts don't run until you clone it. Slots are how Web Components accept content, similar to `children` in React.

**Example:**

```html
<template id="row"><li class="call"></li></template>
<script>
  const li = row.content.cloneNode(true);
  list.append(li);
</script>
```

**Say it like this:** "`template` is reusable inert markup; `slot` is the Web Components version of React's `children`."

---

**Q41. Which iframe attributes matter?**

**Short answer:** `sandbox` (restricts scripts, forms and navigation), `allow` (permissions like camera), `loading="lazy"`, `referrerpolicy`, and `title`, which accessibility requires.

**Explanation:** `sandbox` with no value blocks almost everything; add back only what's needed (`allow-scripts`, `allow-forms`). Never combine `allow-scripts` and `allow-same-origin` for untrusted same-origin content.

**Example:**

```html
<iframe src="https://widget.partner.com" title="Partner scheduling widget"
        sandbox="allow-scripts allow-forms" allow="camera 'none'" loading="lazy"></iframe>
```

**Say it like this:** "Third-party iframes get a `title`, lazy loading, and a sandbox with only the permissions they need."

---

**Q42. Compare the web storage options.**

**Short answer:** Cookies are small and sent with every request; localStorage persists; sessionStorage lasts for the tab; IndexedDB is large and asynchronous.

**Explanation:**

| | Size | Lifetime | Sent to server | JS can read |
|---|---|---|---|---|
| Cookie | ~4 KB | until expiry | yes | unless `HttpOnly` |
| localStorage | ~5–10 MB | until cleared | no | yes |
| sessionStorage | ~5 MB | until tab closes | no | yes |
| IndexedDB | large | until cleared | no | yes (async) |

**Example:** Theme preference → localStorage. Session → HttpOnly cookie. Offline drafts of non-sensitive data → IndexedDB. Patient data → none of them.

**Say it like this:** "JWTs and patient data should never sit in localStorage, because any XSS can read it. I use HttpOnly, Secure, SameSite cookies for auth, and localStorage only for harmless preferences."

---

**Q43. Explain the critical rendering path.**

**Short answer:** HTML → DOM; CSS → CSSOM; DOM + CSSOM → render tree → layout → paint → composite.

**Explanation:** CSS blocks rendering and synchronous scripts block parsing. To speed up the first paint: inline critical CSS, defer scripts, and preload key resources.

**Example:** A 300 KB render-blocking stylesheet in `<head>` delays the first paint until it downloads, even though the HTML arrived quickly.

**Say it like this:** "The browser needs both the DOM and CSSOM before it can paint, so I keep critical CSS small, defer scripts, and preload what the first view needs."

---

**Q44. Reflow vs repaint?**

**Short answer:** A reflow (layout) recalculates size and position, which is expensive. A repaint redraws pixels without geometry changes. `transform` and `opacity` changes can skip both.

**Explanation:** Changing `width`, `top` or `font-size`, or reading `offsetHeight` right after writing styles, triggers layout. That's why animations should use `transform` and `opacity`.

**Example:** Sliding a drawer with `left: -300px → 0` reflows every frame; `transform: translateX(-100%) → 0` only composites.

**Say it like this:** "Layout is the expensive step, so I animate with transform and opacity and avoid reading layout right after writing styles."

---

**Q45. What are the SEO basics in HTML?**

**Short answer:** A unique `<title>` and meta description, semantic headings, descriptive link text, `alt` text, a canonical URL, Open Graph tags, structured data, and real `<a href>` links.

**Explanation:** Crawlers follow `<a href>` links, not JavaScript click handlers, and rely on headings and titles to understand pages. Server-rendered HTML is easier for them than client-only rendering.

**Example:**

```html
<title>Medical Interpreting in Spanish | InterpretIQ</title>
<meta name="description" content="Book a certified Spanish medical interpreter in minutes.">
<link rel="canonical" href="https://interpretiq.com/spanish">
```

**Say it like this:** "SEO starts with good HTML: unique titles, real links, semantic headings and server-rendered content for public pages."

---

## 🟡 Accessibility (a11y) — Asked Heavily Because of Your WCAG Work

**Q46. What is WCAG and what are its levels?**

**Short answer:** The Web Content Accessibility Guidelines. Its principles are POUR (Perceivable, Operable, Understandable, Robust), and its levels are A, AA and AAA.

**Explanation:** AA is the common legal and contractual target. Examples: Perceivable = alt text and captions; Operable = keyboard access; Understandable = clear errors; Robust = valid markup that works with assistive tech.

**Example:** A video call app at AA needs captions, full keyboard operation, 4.5:1 text contrast and announcements for status changes like "Reconnecting".

**Say it like this:** "We targeted WCAG 2.1 AA, the common requirement for healthcare. In practice that meant keyboard access everywhere, 4.5:1 text contrast, screen-reader announcements for call events, and captions."

---

**Q47. What is the first rule of ARIA?**

**Short answer:** Don't use ARIA if a native HTML element does the job.

**Explanation:** ARIA only changes what screen readers *announce*. It adds no keyboard behaviour or focus. `<div role="button">` still needs `tabindex` and Enter/Space handlers, so just use `<button>`. Wrong ARIA is worse than none.

**Example:**

```html
<!-- Needs tabindex + key handlers + role -->
<div role="button" tabindex="0" onkeydown="…" onclick="…">Save</div>
<!-- Does all of it for free -->
<button type="button" onclick="…">Save</button>
```

**Say it like this:** "No ARIA is better than bad ARIA. I reach for native elements first and use ARIA only for patterns HTML doesn't have, like tabs or comboboxes."

---

**Q48. Give examples of ARIA roles, states and properties.**

**Short answer:** Roles like `dialog`, `tablist`, `tab`, `alert`; states like `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-invalid`; properties like `aria-label`, `aria-describedby`, `aria-controls`.

**Explanation:** Roles say what something *is*; states change during interaction and must be updated by your code; properties describe relationships and names.

**Example:**

```html
<button aria-expanded="false" aria-controls="filters">Filters</button>
<div id="filters" hidden>…</div>
```

**Say it like this:** "Roles describe the widget, states like `aria-expanded` must stay in sync with the UI, and properties connect labels and descriptions."

---

**Q49. `aria-label` vs `aria-labelledby` vs `aria-describedby`?**

**Short answer:** `aria-label` gives a name as a string, `aria-labelledby` takes the name from visible elements, and `aria-describedby` adds extra description read after the name.

**Explanation:** Prefer `aria-labelledby` when there's visible text, because it stays in sync with what sighted users see. Use `aria-describedby` for hints and error messages.

**Example:**

```html
<button aria-label="Close dialog">×</button>
<section aria-labelledby="h-calls"><h2 id="h-calls">Calls</h2></section>
<input id="pw" aria-describedby="pw-hint"><p id="pw-hint">At least 12 characters</p>
```

**Say it like this:** "Label is the name, labelledby borrows a visible name, and describedby adds the hint or error that's read after the name."

---

**Q50. What are live regions?**

**Short answer:** Areas whose changes screen readers announce automatically. `aria-live="polite"` waits for a pause; `assertive` interrupts. `role="status"` is polite, `role="alert"` is assertive.

**Explanation:** The live region must already exist in the DOM before its content changes. If you create the element and its text at the same moment, nothing is announced.

**Example:**

```html
<div role="status" id="announcer" class="visually-hidden"></div>
<script>announcer.textContent = 'Interpreter joined the call';</script>
```

**Say it like this:** "For call events like 'Interpreter joined' I write into a polite live region that's rendered on page load, so screen-reader users hear what sighted users see."

---

**Q51. What's on a keyboard accessibility checklist?**

**Short answer:** Everything reachable with Tab in a logical order, visible focus, Enter/Space activation, Escape to close overlays, arrow keys inside composite widgets, and no keyboard traps.

**Explanation:** The only intentional trap is focus inside an open modal, and even that must close with Escape. Testing is simple: unplug the mouse and complete every critical flow.

**Example:** In the call screen, Tab reaches mute, camera, chat and leave in order; M toggles mute; Escape closes the chat panel and returns focus to the chat button.

**Say it like this:** "My test is to put the mouse away and complete the join-call flow. If I get stuck or lose the focus ring, it's a bug."

---

**Q52. What do the `tabindex` values mean?**

**Short answer:** `0` puts an element in the natural tab order, `-1` makes it focusable only by script, and positive values force an order and should never be used.

**Explanation:** `-1` is useful for moving focus to a heading or dialog programmatically. Positive values jump ahead of everything else and create a confusing order.

**Example:**

```html
<h1 tabindex="-1" id="page-title">Call history</h1>
<script>document.getElementById('page-title').focus();</script>
```

**Say it like this:** "I only use `0` and `-1`: zero for custom widgets that must be tabbable, minus one for programmatic focus. Positive values are a red flag."

---

**Q53. What is a roving tabindex?**

**Short answer:** In a composite widget, only the active item has `tabindex="0"` and the rest `-1`; arrow keys move focus within the widget, so it's one Tab stop.

**Explanation:** Without it, a toolbar with 8 buttons costs keyboard users 8 Tab presses to get past. This is the WAI-ARIA pattern for tabs, toolbars, menus and grids.

**Example:** In the call control toolbar, Tab lands on "Mute", the right arrow moves to "Camera", and Tab again leaves the toolbar.

**Say it like this:** "A toolbar should be a single Tab stop. Roving tabindex lets arrow keys move inside it, which is how native widgets behave."

---

**Q54. How do you manage focus on a single-page app route change?**

**Short answer:** Move focus to the new page's `<h1>` (with `tabindex="-1"`) and update `document.title`.

**Explanation:** A full page load resets focus and announces the title, but a SPA doesn't. Without this, screen-reader users don't know the page changed and focus stays on the old link.

**Example:**

```tsx
useEffect(() => {
  document.title = `${pageTitle} – InterpretIQ`;
  headingRef.current?.focus();
}, [pathname]);
```

**Say it like this:** "After each route change I update the title and move focus to the main heading, so screen-reader users hear the new page."

---

**Q55. What are the colour contrast requirements at level AA?**

**Short answer:** 4.5:1 for normal text; 3:1 for large text (24px+, or 18.66px+ bold) and for UI components and focus indicators.

**Explanation:** Check contrast at the design-token level so every component inherits valid colours, and check each tenant's palette in multi-brand apps.

**Example:** Grey `#999` on white is about 2.8:1 and fails for body text; `#595959` on white is about 7:1 and passes.

**Say it like this:** "4.5:1 for text and 3:1 for controls and focus rings. We validated our design tokens once, so every component was compliant by default."

---

**Q56. Why not rely on colour alone? Give an example.**

**Short answer:** Colour-blind users (about 1 in 12 men) may not see the difference, so add text or icons.

**Explanation:** WCAG 1.4.1 requires information not be conveyed by colour alone. Errors need text, status badges need labels, and charts need labels or patterns.

**Example:** Instead of a red border only: a red border **plus** "⚠ Email is required". A "live" status shows a dot **and** the word "Live".

**Say it like this:** "Every colour signal gets a second cue, an icon or text, so the meaning survives for colour-blind users and in high-contrast mode."

---

**Q57. How do you build an accessible icon-only button?**

**Short answer:** A real `<button>` with an `aria-label` (or visually hidden text), a toggle state if relevant, and the icon hidden from assistive tech.

**Explanation:** The SVG is decorative here, so `aria-hidden="true"` stops it being read. `aria-pressed` announces "toggle button, pressed".

**Example:**

```html
<button type="button" aria-label="Mute microphone" aria-pressed="false">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>
```

**Say it like this:** "Icon buttons get a text name and the icon is hidden. For toggles like mute I add `aria-pressed` so the state is announced."

---

**Q58. How do you make form errors accessible?**

**Short answer:** Show the message inline and link it with `aria-describedby`, set `aria-invalid="true"`, show a summary on submit, and move focus to the first invalid field.

**Explanation:** This way the error is announced when the user reaches the field, and they're taken straight to the problem after submitting.

**Example:**

```html
<label for="email">Email</label>
<input id="email" aria-invalid="true" aria-describedby="email-err">
<p id="email-err">Enter an email like name@clinic.com</p>
```

**Say it like this:** "Errors are linked to their field with `aria-describedby`, say how to fix the problem, and on submit focus moves to the first invalid field."

---

**Q59. What is a skip link?**

**Short answer:** The first focusable element on the page, visible on focus, that lets keyboard users jump past the navigation to the main content.

**Explanation:** Without it, keyboard users tab through every nav link on every page. WCAG 2.4.1 requires a way to bypass repeated blocks.

**Example:**

```html
<a href="#main" class="skip-link">Skip to main content</a>
<main id="main" tabindex="-1">…</main>
```

**Say it like this:** "A skip link is a one-line fix that saves keyboard users dozens of Tab presses on every page."

---

**Q60. How do you test accessibility?**

**Short answer:** Automated tools (axe, Lighthouse) plus manual testing: keyboard-only, screen readers (NVDA, VoiceOver), 200% zoom, reduced motion and high-contrast mode.

**Explanation:** Automated tools catch about 30–40% of issues, like missing labels or contrast. They can't tell whether focus goes to the right place or announcements make sense.

**Example:**

```ts
import { axe } from 'vitest-axe';
expect(await axe(container)).toHaveNoViolations();
```

**Say it like this:** "axe runs in CI so regressions fail the build, but every critical flow also gets a manual keyboard and screen-reader pass."

---

**Q61. Captions vs transcripts vs audio description?**

**Short answer:** Captions are timed text of the audio shown during video; a transcript is the full text available separately; audio description narrates important visuals for blind users.

**Explanation:** Captions serve deaf and hard-of-hearing users in real time; transcripts are searchable and skimmable; audio description covers visual information that isn't spoken.

**Example:** In a recorded interpretation session, live captions appear during playback, a downloadable transcript is available afterwards, and on-screen text like "consent form shown" would need description.

**Say it like this:** "Captions for real-time access, transcripts for searching and review, and audio description when visuals carry meaning that isn't spoken."

---

## 🔴 Level 3 — Advanced

**Q62. How does the browser parse HTML?**

**Short answer:** A tokenizer turns the text into tokens, and tree construction builds the DOM. A preload scanner reads ahead to start downloading resources while the parser is blocked.

**Explanation:** The parser is very forgiving and fixes broken markup. The preload scanner is why resources declared directly in HTML load faster than ones injected by JavaScript.

**Example:** An image in the HTML is found by the preload scanner immediately; the same image added by a React component is only discovered after the JS bundle runs.

**Say it like this:** "The preload scanner finds resources early, so anything critical should be discoverable in the initial HTML rather than injected by JavaScript."

---

**Q63. Why can `document.write` hurt performance?**

**Short answer:** It blocks the parser and defeats the preload scanner; Chrome may even block it on slow connections.

**Explanation:** It's a legacy API, often used by old ad and analytics snippets. Modern code uses DOM APIs or `async` scripts.

**Example:** `document.write('<script src="ads.js"></script>')` forces the parser to stop and download the script before continuing.

**Say it like this:** "I avoid `document.write` entirely; it blocks parsing and is a common cause of slow third-party scripts."

---

**Q64. What is the Shadow DOM, and why use it?**

**Short answer:** An encapsulated DOM subtree attached to an element, with scoped styles and IDs.

**Explanation:** Styles inside don't leak out and outside styles don't leak in (except inherited properties and CSS variables). It's used by Web Components and for widgets embedded in host pages you don't control.

**Example:**

```js
const host = document.querySelector('#widget');
const root = host.attachShadow({ mode: 'open' });
root.innerHTML = '<style>p { color: teal }</style><p>Isolated</p>';
```

**Say it like this:** "Shadow DOM gives true style isolation. For the airline widgets embedded in someone else's pages, isolation like that stops host CSS breaking our UI."

---

**Q65. What is the Custom Elements lifecycle?**

**Short answer:** `connectedCallback` (added to the page), `disconnectedCallback` (removed), `attributeChangedCallback` (observed attribute changed) and `adoptedCallback` (moved to another document).

**Explanation:** Clean up listeners in `disconnectedCallback`, and list the attributes you care about in `observedAttributes`. Avoid `innerHTML` with attribute values to prevent XSS.

**Example:**

```js
class CallBadge extends HTMLElement {
  static observedAttributes = ['status'];
  connectedCallback() { this.attachShadow({ mode: 'open' }); this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    if (!this.shadowRoot) return;
    const span = document.createElement('span');
    span.textContent = this.getAttribute('status') ?? '';
    this.shadowRoot.replaceChildren(span);
  }
}
customElements.define('call-badge', CallBadge);
```

**Say it like this:** "It's like mount, unmount and props-changed in React. I render with `textContent`, not `innerHTML`, so attribute values can't inject HTML."

---

**Q66. What is Declarative Shadow DOM?**

**Short answer:** `<template shadowrootmode="open">` inside an element lets the server render a shadow root without JavaScript.

**Explanation:** Before it, Web Components needed JavaScript to create their shadow DOM, so they couldn't be server-rendered. Now they can show styled content before JS loads.

**Example:**

```html
<call-badge>
  <template shadowrootmode="open"><span>Live</span></template>
</call-badge>
```

**Say it like this:** "Declarative Shadow DOM makes server-side rendering possible for Web Components."

---

**Q67. What does the `inert` attribute do?**

**Short answer:** It makes a whole subtree non-interactive (no focus, no clicks) and hides it from assistive technology.

**Explanation:** It's the clean way to block the background when a custom modal or drawer is open. Native `<dialog>` with `showModal()` does it for you.

**Example:**

```html
<main inert>…</main>
<div role="dialog" aria-modal="true">…</div>
```

**Say it like this:** "When a custom drawer is open I set `inert` on the rest of the page, so keyboard and screen-reader users can't wander behind it."

---

**Q68. What is the Popover API?**

**Short answer:** Native popovers via `popover` and `popovertarget`, rendered in the top layer, closing on outside click or Escape, with no JavaScript.

**Explanation:** The top layer sits above everything, so there are no z-index battles. It's good for menus, tooltips with content and pickers.

**Example:**

```html
<button popovertarget="menu">Options</button>
<div popover id="menu">…</div>
```

**Say it like this:** "The Popover API gives light-dismiss and top-layer rendering natively, removing a lot of custom dropdown code."

---

**Q69. What does a PWA need?**

**Short answer:** HTTPS, a web app manifest, a service worker (with a fetch handler for offline) and icons.

**Explanation:** In return you get installation to the home screen or desktop, an offline app shell, push notifications (with permission) and full-screen launch.

**Example:** InterpretIQ installs on clinic tablets as a standalone app and opens instantly from the cached shell.

**Say it like this:** "A PWA needs HTTPS, a manifest and a service worker. We used it so clinics could install InterpretIQ on tablets and open it quickly on poor Wi-Fi."

---

**Q70. What are the key fields in a web app manifest?**

**Short answer:** `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color` and `icons` (including a maskable icon).

**Explanation:** `display: standalone` hides the browser UI. The background colour and icon form the splash screen; maskable icons fit Android's adaptive shapes.

**Example:**

```json
{
  "name": "InterpretIQ", "short_name": "IIQ", "start_url": "/", "display": "standalone",
  "theme_color": "#0b5fff", "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Say it like this:** "The manifest makes the app installable: name, start URL, standalone display and proper icons."

---

**Q71. Describe the service worker lifecycle.**

**Short answer:** Register → install (precache) → waiting (the old worker still controls pages) → activate (clean old caches) → handle fetch and push events.

**Explanation:** `skipWaiting()` and `clients.claim()` take over immediately, but a page may then run old HTML with new JavaScript. A safer UX is a "New version available — Reload" banner.

**Example:**

```js
self.addEventListener('install', (e) => e.waitUntil(caches.open('v2').then((c) => c.addAll(['/', '/app.js']))));
self.addEventListener('activate', (e) => e.waitUntil(caches.delete('v1')));
```

**Say it like this:** "New service workers wait until old tabs close. Instead of forcing updates mid-call, we showed a 'new version, reload' prompt."

---

**Q72. What are the service worker caching strategies?**

**Short answer:** Cache-first for hashed assets, network-first for HTML, stale-while-revalidate for semi-static data, and network-only for authenticated or sensitive APIs.

**Explanation:**

| Strategy | Use for |
|---|---|
| Cache-first | `app.3f2a.js`, fonts |
| Network-first | HTML pages |
| Stale-while-revalidate | avatars, config |
| Network-only | authenticated APIs, PHI |

**Example:** With Workbox: `registerRoute(({request}) => request.destination === 'script', new CacheFirst())`.

**Say it like this:** "Hashed assets are cache-first, HTML network-first, and anything with patient data is network-only and never cached."

---

**Q73. Which permission-related APIs should you know?**

**Short answer:** `getUserMedia` (camera/mic, HTTPS required), Notifications and Geolocation; the `Permissions-Policy` header controls which origins and iframes may request them.

**Explanation:** Browsers show prompts only after a user gesture in practice, and a denied prompt is hard to undo, so ask at the right moment with context.

**Example:**

```text
Permissions-Policy: camera=(self), microphone=(self), geolocation=()
```

**Say it like this:** "We only allowed camera and microphone for our own origin, and asked for them on the pre-join screen after explaining why."

---

**Q74. What is structured data (JSON-LD)?**

**Short answer:** Machine-readable data in a `<script type="application/ld+json">` tag, using schema.org vocabulary, so search engines can show rich results.

**Explanation:** It describes entities like organisations, products, FAQs or events. It doesn't change the page visually.

**Example:**

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization", "name": "InterpretIQ", "url": "https://interpretiq.com" }
</script>
```

**Say it like this:** "JSON-LD tells search engines what the page is about in a structured way, which can unlock rich results."

---

**Q75. What are Open Graph and Twitter cards?**

**Short answer:** `og:title`, `og:description`, `og:image` and `og:url` meta tags that control link previews in WhatsApp, Slack and LinkedIn.

**Explanation:** Without them, apps guess and often show a random image or no preview. Twitter/X has its own `twitter:card` tags but falls back to Open Graph.

**Example:**

```html
<meta property="og:title" content="Book a medical interpreter in minutes">
<meta property="og:image" content="https://interpretiq.com/og.png">
```

**Say it like this:** "Open Graph tags make shared links look professional, which matters for marketing pages."

---

**Q76. What are `rel="canonical"` and `hreflang`?**

**Short answer:** `canonical` says which URL is the main version of duplicate pages; `hreflang` lists language or region versions of a page.

**Explanation:** Duplicate URLs (tracking params, filters) split SEO ranking; canonical consolidates it. `hreflang` helps search engines show the right language to each user.

**Example:**

```html
<link rel="canonical" href="https://interpretiq.com/pricing">
<link rel="alternate" hreflang="es" href="https://interpretiq.com/es/precios">
```

**Say it like this:** "Canonical prevents duplicate-content problems, and hreflang points each country to the right language version."

---

**Q77. Can you set a Content Security Policy with a `<meta>` tag?**

**Short answer:** Mostly yes, but `frame-ancestors` and reporting only work as HTTP headers, so prefer headers.

**Explanation:** A meta CSP also applies only after the parser reaches it. Headers protect the whole response from the first byte.

**Example:**

```text
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
```

**Say it like this:** "I set CSP as a response header, because clickjacking protection through `frame-ancestors` doesn't work in a meta tag."

---

**Q78. Why does `rel="noopener"` matter?**

**Short answer:** Without it, a page opened with `target="_blank"` gets `window.opener` and can redirect your original tab to a phishing page ("reverse tabnabbing").

**Explanation:** Modern browsers default to `noopener` for `_blank`, but writing it explicitly protects older browsers and makes intent clear. `noreferrer` also hides the referrer.

**Example:**

```js
// on the malicious page:
window.opener.location = 'https://fake-login.example';
```

**Say it like this:** "`noopener` cuts the link back to our tab, so an external page can't silently redirect users to a fake login."

---

## 🧩 Level 4 — Scenario-Based

**Q79. A designer gave you a clickable card with a title, an image and a "Share" button. How do you mark it up accessibly?**

**Short answer:** Make the title the link and stretch its click area over the card with CSS; keep "Share" as a separate button above that area.

**Explanation:** Wrapping the whole card in `<a>` would nest a button inside a link, which is invalid, and the link name would be the whole card's text.

**Example:**

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

**Say it like this:** "The title is the real link, a pseudo-element makes the whole card clickable, and the Share button sits above it, so there are no nested interactive elements."

---

**Q80. Screen-reader users report that the "Saved" toast is never announced.**

**Short answer:** The live region was probably created at the same moment as its text. Render an empty `role="status"` container on page load and insert the text later.

**Explanation:** Screen readers only announce *changes* to a live region they already know about. A brand-new element with text already inside isn't a change.

**Example:**

```html
<div role="status" id="toast-region"></div>
<script>setTimeout(() => (toastRegion.textContent = 'Saved'), 0);</script>
```

**Say it like this:** "Live regions must exist before their content changes. I render the toast container on load and only update its text."

---

**Q81. Your custom dropdown fails an accessibility audit.**

**Short answer:** Use a native `<select>` if possible; otherwise implement the WAI-ARIA combobox/listbox pattern or use a tested headless library.

**Explanation:** The pattern needs roles (`combobox`, `listbox`, `option`), `aria-expanded`, `aria-activedescendant`, keyboard support (arrows, Home/End, typeahead, Enter, Escape) and focus return on close.

**Example:** On BpoBox, replacing a hand-built agent dropdown with a Radix Select fixed keyboard navigation and screen-reader announcements in one change.

**Say it like this:** "Writing an accessible combobox from scratch is a week of work and still easy to get wrong. On BpoBox we used Radix primitives so keyboard handling and ARIA came built in."

---

**Q82. Mobile users get a number spinner and the wrong keyboard for a 6-digit OTP.**

**Short answer:** Use `type="text"` with `inputmode="numeric"`, `autocomplete="one-time-code"`, a `pattern` and `maxlength`.

**Explanation:** `type="number"` adds spinners and drops leading zeros. This combination gives a number pad and SMS autofill on iOS and Android.

**Example:**

```html
<input type="text" inputmode="numeric" autocomplete="one-time-code" pattern="\d{6}" maxlength="6">
```

**Say it like this:** "OTPs aren't numbers, they're codes. A text input with `inputmode=numeric` and `one-time-code` gives the right keyboard and autofill."

---

**Q83. The page jumps around while images load.**

**Short answer:** Reserve space with `width`/`height` attributes or CSS `aspect-ratio`, and don't insert banners above existing content.

**Explanation:** This is Cumulative Layout Shift. The browser can't reserve space for content of unknown size, so give it the dimensions up front.

**Example:**

```css
.thumb { aspect-ratio: 16 / 9; width: 100%; }
```

**Say it like this:** "Layout shift comes from content without reserved space. Dimensions on every image and embed fix most of it."

---

**Q84. A third-party widget must be embedded without breaking your styles or reading your cookies.**

**Short answer:** Put it in a sandboxed iframe served from a different origin. If you trust the code and only need style isolation, Shadow DOM is enough.

**Explanation:** A different origin isolates the DOM, cookies and storage. Shadow DOM isolates only styles; the script could still read the page.

**Example:**

```html
<iframe src="https://widgets.partner.com/scheduler" sandbox="allow-scripts allow-forms" title="Scheduler"></iframe>
```

**Say it like this:** "For untrusted code, isolation has to be at the origin level with a sandboxed iframe. Shadow DOM is only a styling boundary."

---

**Q85. Marketing wants the hero image to load faster.**

**Short answer:** Preload it with `fetchpriority="high"`, serve AVIF/WebP at the right size, use a CDN, don't lazy-load it, and use `<img>` rather than a CSS background.

**Explanation:** The hero is usually the LCP element. CSS background images are discovered only after the CSS loads, which adds delay.

**Example:**

```html
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
<img src="/hero.avif" alt="…" width="1200" height="600" fetchpriority="high">
```

**Say it like this:** "The hero is the LCP element, so I make it discoverable in HTML, prioritise it, and serve the smallest modern format."

---

**Q86. Users must be able to install the app on clinic tablets and reopen it quickly on poor Wi-Fi.**

**Short answer:** Make it a PWA: a manifest for installation and a service worker that precaches the app shell, with network-only for authenticated and PHI APIs and an offline page.

**Explanation:** The shell opens instantly from cache; live data still needs the network. The offline page explains that calls need a connection instead of showing a browser error.

**Example:** Workbox precaches `index.html`, JS, CSS and icons; `/api/*` routes use `NetworkOnly`.

**Say it like this:** "That's exactly what we did for InterpretIQ: installable PWA, cached shell for instant start, and no caching of anything with patient data."

---

## 🎯 From Your Resume

**Q87. "InterpretIQ is WCAG compliant. Show me how you'd make the call screen accessible."**

**Short answer:** Accessible controls, full keyboard support, live-region announcements, captions, reduced motion, and deliberate focus management.

**Explanation:** Controls are real buttons with `aria-pressed` and labels; the focus ring keeps 3:1 contrast over video; shortcuts don't clash with screen-reader keys; a polite live region announces joins, reconnects and recording; focus moves to the call on join and to a summary heading on end.

**Example:**

```html
<button aria-pressed="true" aria-keyshortcuts="M">
  <svg aria-hidden="true">…</svg><span class="visually-hidden">Unmute microphone</span>
</button>
<div role="status" class="visually-hidden">Interpreter joined the call</div>
```

**Say it like this:** "I'd cover five areas: real toggle buttons with clear labels, keyboard shortcuts, live announcements for call events, captions with reduced-motion support, and focus that moves to the call on join and to the summary when it ends."

---

**Q88. "How did you verify WCAG compliance?"**

**Short answer:** In layers: axe in CI, Lighthouse, contrast checks on design tokens, and manual keyboard and screen-reader passes on critical flows.

**Explanation:** Automated checks stop regressions; manual passes catch focus and announcement problems tools miss. A PR checklist kept accessibility part of every change.

**Example:** A real bug: the reconnect banner appeared visually but was never announced, because its live region was created together with the text. Rendering the region on load fixed it. *(Replace with a bug you actually fixed.)*

**Say it like this:** "axe ran in CI, contrast was checked at the token level, and login, join and end-call flows got manual NVDA and VoiceOver passes. One real bug we caught was a reconnect banner that was never announced."

---

**Q89. "How do you request camera and microphone access in a PWA without users denying it?"**

**Short answer:** Explain first, ask on a click, preview the devices, and handle denial and missing devices gracefully.

**Explanation:** Asking on page load gets reflexive denials, and a denied permission is hard to undo. Handle `NotAllowedError` with browser-specific steps and `NotFoundError` with an audio-only option.

**Example:**

```js
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
} catch (e) {
  if (e.name === 'NotAllowedError') showPermissionHelp();
  if (e.name === 'NotFoundError') offerAudioOnly();
}
```

**Say it like this:** "Never ask on page load. A pre-permission screen explains why, the browser prompt appears only after 'Enable camera', and we handle denial with clear recovery steps."

---

**Q90. "What did the service worker cache, and what must it never cache?"**

**Short answer:** It cached the app shell and hashed static assets; it never cached authenticated API responses, recordings, transcripts or anything with PHI.

**Explanation:** Clinic tablets are shared devices, so a cached patient record is a data leak. Caches were cleared on logout as an extra safeguard.

**Example:** Workbox precache for `/`, JS, CSS, fonts and icons; `NetworkOnly` for `/api/*`; `caches.keys().then(ks => ks.forEach(k => caches.delete(k)))` on logout.

**Say it like this:** "Only the shell and static assets were cached, for fast startup. Anything with patient data was network-only, and we cleared caches on logout because tablets are shared."
