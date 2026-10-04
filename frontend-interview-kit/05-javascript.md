# 05 — JavaScript

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → ⚙️ Polyfills & Implementations → 🧠 Output Questions → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is JavaScript and where does it run?**
A dynamic, single-threaded (per realm), garbage-collected language. Runs in browsers (V8, SpiderMonkey, JavaScriptCore) and servers (Node.js, Deno, Bun).

**2. Data types?**
Primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`. Everything else is an `object` (arrays, functions, dates, maps).

**3. `typeof` results to remember?**
`typeof null === 'object'` (legacy bug), `typeof [] === 'object'`, `typeof function(){} === 'function'`, `typeof NaN === 'number'`, `typeof undefined === 'undefined'`. Use `Array.isArray()` for arrays.

**4. `null` vs `undefined`?**
undefined = not assigned / missing property / no return value. null = intentional "no value". `null == undefined` is true; `===` false.

**5. `var`, `let`, `const`?**
| | Scope | Hoisted | Re-declare | Re-assign |
|---|---|---|---|---|
| var | function | yes, as undefined | yes | yes |
| let | block | yes, TDZ | no | yes |
| const | block | yes, TDZ | no | no (object contents still mutable) |

**6. What is the Temporal Dead Zone?**
The time between entering a block and the `let`/`const` declaration line; accessing the variable throws `ReferenceError`.

**7. Hoisting?**
Declarations are registered before code runs. Function declarations are fully hoisted (callable before definition); `var` hoisted as undefined; `let`/`const`/`class` hoisted into TDZ; function expressions follow their variable's rules.

**8. `==` vs `===`?**
`===` compares without type conversion. `==` coerces (`'1' == 1` true, `0 == ''` true, `null == 0` false). Use `===` except `x == null` to check null/undefined together.

**9. Truthy and falsy values?**
Falsy: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy, including `'0'`, `[]`, `{}`.

**10. Template literals?**
`` `Hello ${name}` `` — interpolation, multi-line strings, tagged templates.

**11. Function declaration vs expression vs arrow?**
Declaration is hoisted. Expression assigned to a variable. Arrow: concise, no own `this`/`arguments`/`prototype`, can't be used with `new`.

**12. Default, rest and spread?**
```js
function f(a, b = 2, ...rest) {}
const merged = { ...defaults, ...overrides };
const copy = [...arr];
Math.max(...nums);
```

**13. Destructuring?**
```js
const { id, user: { name = 'Anon' } = {}, ...others } = payload;
const [first, , third] = list;
[a, b] = [b, a]; // swap
```

**14. Optional chaining & nullish coalescing?**
`user?.profile?.email`, `fn?.()`, `arr?.[0]`. `count ?? 0` only defaults on null/undefined — unlike `count || 0` which also replaces `0` and `''`.

**15. Array methods — mutating vs non-mutating?**
Mutating: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`. Non-mutating: `map`, `filter`, `reduce`, `slice`, `concat`, `flat`, `toSorted`, `toReversed`, `toSpliced`, `with`.

**16. `map` vs `forEach`?**
map returns a new array; forEach returns undefined and is for side effects. Neither can be `break`-ed (use `for...of`, `some`, `every`).

**17. `find`, `findIndex`, `some`, `every`, `includes`, `indexOf`?**
find → first matching element; findIndex → its index; some → any match; every → all match; includes → value presence (handles NaN); indexOf → index or -1 (fails for NaN).

**18. `for...in` vs `for...of`?**
for...in iterates enumerable keys (including inherited) — for objects. for...of iterates values of iterables (arrays, strings, maps, sets).

**19. Objects — create, read, check keys?**
`Object.keys/values/entries`, `Object.fromEntries`, `'key' in obj` (includes prototype), `Object.hasOwn(obj, 'key')`.

**20. Shallow vs deep copy?**
Shallow: spread, `Object.assign`, `slice` — nested objects shared. Deep: `structuredClone()` (handles Date, Map, Set, cycles; not functions/DOM nodes). `JSON.parse(JSON.stringify())` loses Dates, undefined, functions, and fails on cycles.

**21. Pass by value or by reference?**
Always by value. For objects, the value is a reference — so mutating a property is visible to the caller, but reassigning the parameter is not.

**22. String basics?**
Immutable. Useful: `slice`, `substring`, `split`, `trim`, `padStart`, `includes`, `startsWith`, `replaceAll`, `at(-1)`, `localeCompare`, `normalize`.

**23. Number pitfalls?**
Floating point: `0.1 + 0.2 !== 0.3` (compare with tolerance or use integers/cents). `Number.MAX_SAFE_INTEGER` = 2^53 − 1 → use `BigInt` beyond. `parseInt('08')` → 8; always pass radix. `Number('')` → 0.

**24. `NaN` checks?**
`Number.isNaN(x)` (strict) vs global `isNaN(x)` (coerces first: `isNaN('abc')` true).

**25. What is the DOM?**
Document Object Model — tree of node objects representing the page; JS reads/modifies it via APIs like `querySelector`, `createElement`, `append`, `classList`, `textContent`.

**26. `innerHTML` vs `textContent` vs `innerText`?**
innerHTML parses HTML (XSS risk with untrusted data). textContent sets/gets raw text (fast, safe). innerText respects CSS visibility and triggers layout.

**27. Adding events?**
`el.addEventListener('click', handler, { once, passive, capture, signal })`. Remove with the same function reference or via `AbortController` signal.

**28. Event bubbling and capturing?**
Event travels down (capture), hits the target, then bubbles up. Listeners default to bubble phase. `stopPropagation()` stops travel; `preventDefault()` cancels default action (form submit, link navigation).

**29. Event delegation?**
One listener on a parent handles events from many children via `event.target.closest(selector)`. Fewer listeners, works for dynamically added elements.

**30. `setTimeout` vs `setInterval`?**
timeout runs once after at least N ms; interval repeats. Both return IDs to clear. Delays are minimums, not guarantees; nested timeouts clamp to ≥ 4 ms; background tabs throttle heavily.

---

## 🟡 Level 2 — Intermediate — Functions, Scope, `this`

**31. Scope types?**
Global, module, function, block. Lexical scoping: scope is determined by where code is written.

**32. Scope chain?**
Variable lookup walks from the current scope outward to global; first match wins.

**33. Closures — definition and use cases?**
A function plus the variables it captured from its lexical scope, which stay alive as long as the function does.
Uses: private state, factories, memoization, debounce/throttle, partial application, React hooks, event handlers remembering data.
```js
function createCounter() {
  let count = 0;
  return { inc: () => ++count, get: () => count };
}
```

**34. Classic closure-in-loop problem?**
```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2
```
`var` shares one binding; `let` creates a fresh binding per iteration. Pre-ES6 fix: IIFE capturing `i`.

**35. Closures and memory leaks?**
A closure keeps all captured variables reachable. Long-lived closures (listeners, timers, caches) holding large objects or DOM nodes prevent GC.

**36. IIFE?**
`(function () { /* private scope */ })();` — module pattern before ES modules.

**37. How is `this` determined?** (priority order)
1. `new` → the new object.
2. `call/apply/bind` → explicit object.
3. Called as `obj.method()` → obj.
4. Plain call → `undefined` in strict mode (`globalThis` in sloppy).
Arrow functions ignore all of these and use `this` from the enclosing scope.

**38. Losing `this` — example and fixes?**
```js
const btn = { label: 'Join', click() { console.log(this.label); } };
setTimeout(btn.click);            // undefined — method detached
setTimeout(() => btn.click());    // fix 1: arrow wrapper
setTimeout(btn.click.bind(btn));  // fix 2: bind
```

**39. `call` vs `apply` vs `bind`?**
call(thisArg, ...args) invokes now; apply(thisArg, argsArray) invokes now; bind(thisArg, ...args) returns a new function with fixed `this` (and partial args).

**40. Arrow functions in class fields vs methods?**
`handle = () => {}` creates a per-instance function with bound `this` (handy for callbacks, costs memory per instance). Prototype methods are shared but need binding when detached.

**41. Higher-order functions?**
Functions that take or return functions: `map`, `debounce`, middleware, HOCs.

**42. Pure functions and side effects?**
Pure: same input → same output, no external mutation. Easier to test, memoize and reason about (reducers, selectors, render functions).

**43. Currying vs partial application?**
Currying turns `f(a, b, c)` into `f(a)(b)(c)`. Partial application fixes some args: `const log = fn.bind(null, 'INFO')`.

**44. Function composition?**
```js
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const slug = pipe(s => s.trim(), s => s.toLowerCase(), s => s.replace(/\s+/g, '-'));
```

**45. `arguments` object?**
Array-like object of passed arguments in non-arrow functions. Prefer rest params.

**46. Recursion and stack limits?**
Each call adds a frame; deep recursion (~10k frames) throws `RangeError`. Convert to iteration with an explicit stack for deep trees.

---

## 🟡 Intermediate — Objects, Prototypes, Classes

**47. Prototype chain?**
Every object has an internal `[[Prototype]]` link. Property lookup walks the chain until found or `null`. `Object.getPrototypeOf(obj)`, `Object.create(proto)`.

**48. `__proto__` vs `prototype`?**
`prototype` is a property of constructor functions — becomes the `[[Prototype]]` of instances created with `new`. `__proto__` is the (legacy) accessor for an object's own `[[Prototype]]`.

**49. What does `new` do?**
1) Create empty object linked to `Constructor.prototype`. 2) Call constructor with `this` = that object. 3) Return the object (unless constructor returns another object).

**50. ES6 classes — syntax sugar?**
Mostly sugar over prototypes, with differences: class bodies are strict, classes aren't hoisted usably (TDZ), must be called with `new`, support `#private` fields, `static` blocks.

**51. Inheritance with classes?**
```js
class Participant { constructor(id) { this.id = id; } describe() { return `P:${this.id}`; } }
class Interpreter extends Participant {
  constructor(id, lang) { super(id); this.lang = lang; }
  describe() { return `${super.describe()} (${this.lang})`; }
}
```

**52. Private fields?**
`#token` — truly private, enforced by the engine (unlike `_token` convention). `#x in obj` checks presence.

**53. Getters/setters?**
`get fullName() {}`, `set fullName(v) {}` — computed properties with validation.

**54. Property descriptors?**
`Object.defineProperty(obj, 'x', { value, writable, enumerable, configurable, get, set })`.

**55. `Object.freeze` vs `seal` vs `preventExtensions`?**
freeze: no add/remove/change (shallow). seal: no add/remove, can change. preventExtensions: no add only.

**56. Composition vs inheritance?**
Favour composing small behaviours (functions, mixins, hooks) over deep inheritance trees — less coupling.

**57. `Map` vs plain object?**
Map: any key type, preserves insertion order, `size`, better for frequent add/remove, iterable directly. Object: string/symbol keys, JSON-friendly, prototype keys can collide (use `Object.create(null)`).

**58. `Set` uses?**
Unique values, O(1) membership: `[...new Set(arr)]` dedupes. New set methods: `union`, `intersection`, `difference` (check support).

**59. `WeakMap` / `WeakSet` / `WeakRef`?**
Keys must be objects and are held weakly — entries disappear when the key is garbage-collected. Use for metadata/caches tied to DOM nodes or objects without leaking. Not iterable.

**60. Symbols?**
Unique, non-colliding property keys; well-known symbols customize behaviour (`Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive`).

**61. JSON gotchas?**
`JSON.stringify` drops `undefined`, functions and symbols; converts Dates to strings; throws on cycles and BigInt. Use replacer/reviver for custom handling.

---

## 🟡 Intermediate — Asynchronous JavaScript

**62. Why is JS async if it's single-threaded?**
The runtime (browser/Node) does I/O, timers and network in the background, then queues callbacks for the single JS thread.

**63. Event loop — explain precisely.**
1. Run the current task (script, event callback, timer callback) until the call stack is empty.
2. Run **all** microtasks (promise reactions, `queueMicrotask`, `MutationObserver`) — including ones queued during this step.
3. Browser may render (rAF callbacks → style → layout → paint).
4. Pick the next task (macrotask) from task queues and repeat.

**64. Microtask vs macrotask examples?**
Micro: `.then/.catch/.finally`, `await` continuation, `queueMicrotask`, MutationObserver. Macro: `setTimeout`, `setInterval`, `MessageChannel`, I/O, UI events.

**65. Can microtasks starve rendering?**
Yes — an infinite chain of microtasks blocks rendering and input forever because the queue never empties.

**66. Callbacks → Promises → async/await evolution?**
Callbacks led to nesting ("callback hell") and inconsistent error handling. Promises gave chaining and one error path. async/await gives synchronous-looking code over promises.

**67. Promise states?**
pending → fulfilled or rejected (settled). Once settled it never changes.

**68. Promise chaining rules?**
Each `.then` returns a new promise resolved with the handler's return value; returning a promise waits for it; throwing rejects. `.catch` handles any earlier rejection; `.finally` runs either way and passes the value through.

**69. Promise combinators?**
| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | all fulfil (array of values) | first rejection |
| `Promise.allSettled` | all settle (array of {status, value/reason}) | never |
| `Promise.race` | first settles | first settles with rejection |
| `Promise.any` | first fulfils | all reject (`AggregateError`) |

**70. `Promise.withResolvers()`?**
Returns `{ promise, resolve, reject }` — cleaner deferred pattern (check runtime support).

**71. async/await error handling?**
`try/catch` around awaits; or `.catch` on the returned promise. Unhandled rejections fire `unhandledrejection` on `window` — report to Sentry.

**72. Sequential vs parallel awaits?**
```js
// slow: 2 network round-trips in series
const user = await getUser(); const calls = await getCalls();
// fast: in parallel
const [user, calls] = await Promise.all([getUser(), getCalls()]);
```

**73. `await` in loops?**
`for...of` with await runs sequentially (intentional for rate limits). `array.forEach(async ...)` does NOT wait — a common bug. Use `Promise.all(array.map(async ...))` or a concurrency pool.

**74. Top-level await?**
Allowed in ES modules; blocks dependent module evaluation until resolved.

**75. Cancellation with AbortController?**
```js
const ctrl = new AbortController();
fetch(url, { signal: ctrl.signal }).catch(e => { if (e.name !== 'AbortError') throw e; });
ctrl.abort();
AbortSignal.timeout(5000);              // built-in timeout signal
AbortSignal.any([userSignal, timeout]); // combine signals
```

**76. `fetch` gotchas?**
Doesn't reject on HTTP 4xx/5xx — check `res.ok`. Doesn't send cookies cross-origin unless `credentials: 'include'`. No built-in timeout. Body can be read only once (`res.clone()` to read twice).

**77. Debounce vs throttle — definitions and implementations?**
Debounce: wait until events stop for N ms (search input, resize end). Throttle: at most once per N ms (scroll, mousemove, analytics).
```js
function debounce(fn, ms, { leading = false } = {}) {
  let t;
  return function (...args) {
    const callNow = leading && !t;
    clearTimeout(t);
    t = setTimeout(() => { t = null; if (!leading) fn.apply(this, args); }, ms);
    if (callNow) fn.apply(this, args);
  };
}
function throttle(fn, ms) {
  let last = 0, timer;
  return function (...args) {
    const now = Date.now(), remaining = ms - (now - last);
    if (remaining <= 0) { clearTimeout(timer); timer = null; last = now; fn.apply(this, args); }
    else if (!timer) timer = setTimeout(() => { last = Date.now(); timer = null; fn.apply(this, args); }, remaining);
  };
}
```

**78. Retry with exponential backoff and jitter?**
```js
async function retry(fn, { tries = 4, base = 300, max = 5000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (attempt >= tries - 1 || err.status === 401 || err.status === 403) throw err;
      const delay = Math.min(max, base * 2 ** attempt) * (0.5 + Math.random() / 2);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```
Don't retry non-idempotent requests or auth errors blindly.

**79. Generators and async generators?**
`function*` yields values lazily; `async function*` + `for await...of` consumes streams (paginated APIs, SSE streams).
```js
async function* pages(url) { let next = url; while (next) { const r = await (await fetch(next)).json(); yield r.items; next = r.next; } }
for await (const items of pages('/api/calls')) render(items);
```

**80. Iterators protocol?**
An object with `[Symbol.iterator]()` returning `{ next() { return { value, done } } }`. Powers spread, destructuring, for...of.

---

## 🔴 Level 3 — Advanced

**81. Execution context and call stack?**
Each function call creates an execution context (variable environment, lexical environment, `this`). Contexts are pushed onto the call stack; creation phase sets up hoisting, execution phase runs code.

**82. Lexical environment vs variable environment?**
Lexical holds `let`/`const`/function bindings for the current block; variable environment holds `var` bindings. Each links to an outer environment — that chain is how closures resolve variables.

**83. Garbage collection in V8?**
Reachability from roots (globals, stack). Generational: young generation (scavenger, frequent, fast) and old generation (mark-sweep-compact, incremental and concurrent).

**84. Common frontend memory leaks?**
- Listeners on window/document not removed.
- `setInterval` never cleared.
- Detached DOM nodes still referenced in JS.
- Unbounded caches/maps.
- Closures capturing large data.
- WebSocket/SSE/MediaStream not closed.
- Third-party SDK instances re-created on every mount.
Diagnose: DevTools Memory → heap snapshots before/after repeating an action, look for growing "Detached" nodes and retainers.

**85. How does V8 optimize code?**
Ignition interpreter → Sparkplug/Maglev → TurboFan optimizing JIT. Hidden classes (shapes) and inline caches make property access fast. Keep object shapes consistent; avoid adding properties in different orders or deleting properties on hot objects; keep functions monomorphic.

**86. Type coercion rules (`ToPrimitive`)?**
Objects convert via `Symbol.toPrimitive`, then `valueOf`, then `toString`. `+` with any string concatenates; other arithmetic converts to number. `[] + {}` → `"[object Object]"`.

**87. Strict mode differences?**
Silent errors throw (assigning to read-only, undeclared variables), `this` undefined in plain calls, no `with`, duplicate params disallowed. ES modules and classes are strict by default.

**88. ES modules vs CommonJS?**
| | ESM | CJS |
|---|---|---|
| Syntax | import/export | require/module.exports |
| Loading | static, async, analyzable | dynamic, sync |
| Bindings | live bindings | copied values |
| Tree-shaking | yes | limited |
| Top-level await | yes | no |

**89. Dynamic import?**
`const { Room } = await import('livekit-client');` — creates a split chunk loaded on demand.

**90. Module circular dependencies?**
ESM handles cycles through live bindings, but accessing a binding before evaluation throws TDZ errors. Fix by extracting shared code or lazy access.

**91. Proxy and Reflect?**
Proxy intercepts operations (get/set/has/deleteProperty/apply). Used for reactivity (Vue, MobX), immutability helpers (Immer), validation, logging.
```js
const watched = new Proxy({}, { set(t, k, v) { console.log('set', k, v); return Reflect.set(t, k, v); } });
```

**92. Tagged templates?**
A function receives string parts and values: used by `styled-components`, `gql`, safe HTML/SQL builders.

**93. Web Workers?**
Separate thread with its own event loop, no DOM access, communicate via `postMessage` (structured clone) or transfer `ArrayBuffer`s. Use for parsing large files, heavy computation, encryption, audio processing. `SharedWorker` shares one worker across tabs; `SharedArrayBuffer` + Atomics need cross-origin isolation.

**94. `requestAnimationFrame` vs `setTimeout` for animation?**
rAF runs before the next paint, synced to display refresh, paused in background tabs. Use it for visual updates and batching DOM writes.

**95. `requestIdleCallback` and `scheduler.postTask`/`scheduler.yield`?**
Run low-priority work when idle; schedule tasks with priority; yield to the main thread inside long tasks to improve INP (check support and fallback to `setTimeout`).

**96. Observers?**
- `IntersectionObserver` — visibility (lazy load, infinite scroll, analytics impressions, pausing offscreen video).
- `ResizeObserver` — element size changes (responsive components, charts).
- `MutationObserver` — DOM changes (third-party widgets).
- `PerformanceObserver` — LCP, long tasks, layout shifts.

**97. Cross-tab communication?**
`BroadcastChannel`, `storage` event, `SharedWorker`, service worker `postMessage`. Use for sync logout, single WebSocket leader election.

**98. `postMessage` security?**
Always check `event.origin` against an allowlist and validate message shape; specify exact `targetOrigin` when sending (never `*` for sensitive data).

**99. Streams API?**
`ReadableStream`, `TransformStream`, `TextDecoderStream` — process large responses incrementally (LLM token streams, CSV downloads) with backpressure.

**100. `structuredClone` limits?**
Can't clone functions, DOM nodes, class prototypes (instances become plain objects), or Errors in older runtimes.

**101. `Intl` APIs?**
`Intl.DateTimeFormat`, `NumberFormat` (currency, compact), `RelativeTimeFormat` ("3 minutes ago"), `PluralRules`, `ListFormat`, `Collator` (locale-aware sorting), `Segmenter`.

**102. Dates and time zones?**
`Date` stores UTC milliseconds; display converts to local time. Send ISO strings with offsets to APIs; format with `Intl` and an explicit `timeZone`. The Temporal API improves this (check support/polyfill).

**103. Error handling patterns?**
Custom error classes (`class HttpError extends Error`), `error.cause` for wrapping (`new Error('Join failed', { cause: err })`), global handlers (`window.onerror`, `unhandledrejection`), error boundaries in React, user-facing messages separate from logged details.

---

## ⚙️ Polyfills & Implementations (very frequently asked)

**104. `Array.prototype.map`**
```js
Array.prototype.myMap = function (cb, thisArg) {
  if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
  const out = new Array(this.length);
  for (let i = 0; i < this.length; i++) if (i in this) out[i] = cb.call(thisArg, this[i], i, this);
  return out;
};
```

**105. `Array.prototype.filter`**
```js
Array.prototype.myFilter = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) if (i in this && cb.call(thisArg, this[i], i, this)) out.push(this[i]);
  return out;
};
```

**106. `Array.prototype.reduce`**
```js
Array.prototype.myReduce = function (cb, ...init) {
  let i = 0, acc;
  if (init.length) acc = init[0];
  else { while (i < this.length && !(i in this)) i++; if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value'); acc = this[i++]; }
  for (; i < this.length; i++) if (i in this) acc = cb(acc, this[i], i, this);
  return acc;
};
```

**107. `Array.prototype.flat`**
```js
function flat(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, v) => acc.concat(Array.isArray(v) ? flat(v, depth - 1) : v), [])
    : arr.slice();
}
// iterative (no recursion limit)
function flatDeep(arr) { const st = [...arr], out = []; while (st.length) { const v = st.pop(); Array.isArray(v) ? st.push(...v) : out.push(v); } return out.reverse(); }
```

**108. `Function.prototype.bind` (supports `new`)**
```js
Function.prototype.myBind = function (ctx, ...pre) {
  const fn = this;
  function bound(...args) { return fn.apply(this instanceof bound ? this : ctx, [...pre, ...args]); }
  bound.prototype = Object.create(fn.prototype);
  return bound;
};
```

**109. `call` and `apply`**
```js
Function.prototype.myCall = function (ctx = globalThis, ...args) {
  const key = Symbol(); ctx = Object(ctx); ctx[key] = this;
  try { return ctx[key](...args); } finally { delete ctx[key]; }
};
Function.prototype.myApply = function (ctx, args = []) { return this.myCall(ctx, ...args); };
```

**110. `Promise.all`, `allSettled`, `race`, `any`**
```js
const all = ps => new Promise((res, rej) => {
  const out = []; let n = 0; if (!ps.length) return res(out);
  ps.forEach((p, i) => Promise.resolve(p).then(v => { out[i] = v; if (++n === ps.length) res(out); }, rej));
});
const allSettled = ps => Promise.all(ps.map(p => Promise.resolve(p).then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason }))));
const race = ps => new Promise((res, rej) => ps.forEach(p => Promise.resolve(p).then(res, rej)));
const any = ps => new Promise((res, rej) => {
  const errs = []; let n = 0; if (!ps.length) return rej(new AggregateError([], 'All promises were rejected'));
  ps.forEach((p, i) => Promise.resolve(p).then(res, e => { errs[i] = e; if (++n === ps.length) rej(new AggregateError(errs, 'All promises were rejected')); }));
});
```

**111. Minimal Promise implementation (asked at senior levels)**
```js
class MyPromise {
  #state = 'pending'; #value; #handlers = [];
  constructor(executor) {
    const settle = (state, value) => {
      if (this.#state !== 'pending') return;
      if (state === 'fulfilled' && value && typeof value.then === 'function') return value.then(v => settle('fulfilled', v), e => settle('rejected', e));
      this.#state = state; this.#value = value; this.#handlers.forEach(h => h());
    };
    try { executor(v => settle('fulfilled', v), e => settle('rejected', e)); } catch (e) { settle('rejected', e); }
  }
  then(onF, onR) {
    return new MyPromise((res, rej) => {
      const run = () => queueMicrotask(() => {
        const cb = this.#state === 'fulfilled' ? onF : onR;
        if (typeof cb !== 'function') return (this.#state === 'fulfilled' ? res : rej)(this.#value);
        try { res(cb(this.#value)); } catch (e) { rej(e); }
      });
      this.#state === 'pending' ? this.#handlers.push(run) : run();
    });
  }
  catch(onR) { return this.then(undefined, onR); }
  finally(cb) { return this.then(v => { cb(); return v; }, e => { cb(); throw e; }); }
  static resolve(v) { return v instanceof MyPromise ? v : new MyPromise(r => r(v)); }
}
```

**112. Deep clone (cycles, Date, Map, Set)**
```js
function deepClone(v, seen = new WeakMap()) {
  if (v === null || typeof v !== 'object') return v;
  if (seen.has(v)) return seen.get(v);
  if (v instanceof Date) return new Date(v);
  if (v instanceof RegExp) return new RegExp(v.source, v.flags);
  if (v instanceof Map) { const m = new Map(); seen.set(v, m); v.forEach((val, k) => m.set(deepClone(k, seen), deepClone(val, seen))); return m; }
  if (v instanceof Set) { const s = new Set(); seen.set(v, s); v.forEach(val => s.add(deepClone(val, seen))); return s; }
  const out = Array.isArray(v) ? [] : Object.create(Object.getPrototypeOf(v));
  seen.set(v, out);
  for (const k of Reflect.ownKeys(v)) out[k] = deepClone(v[k], seen);
  return out;
}
```

**113. Deep equal**
```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const ka = Reflect.ownKeys(a), kb = Reflect.ownKeys(b);
  return ka.length === kb.length && ka.every(k => deepEqual(a[k], b[k]));
}
```

**114. Memoize**
```js
function memoize(fn, key = (...a) => JSON.stringify(a)) {
  const cache = new Map();
  return function (...args) { const k = key(...args); if (!cache.has(k)) cache.set(k, fn.apply(this, args)); return cache.get(k); };
}
```
For async: cache the promise (dedupes concurrent calls); delete on rejection.

**115. `once`**
```js
const once = fn => { let done = false, r; return function (...a) { if (!done) { done = true; r = fn.apply(this, a); } return r; }; };
```

**116. Curry with placeholder-free infinite sum `sum(1)(2)(3)()`**
```js
const sum = a => b => b === undefined ? a : sum(a + b);
```

**117. Event emitter (on/off/once/emit)**
```js
class Emitter {
  #m = new Map();
  on(e, fn) { if (!this.#m.has(e)) this.#m.set(e, new Set()); this.#m.get(e).add(fn); return () => this.off(e, fn); }
  off(e, fn) { this.#m.get(e)?.delete(fn); }
  once(e, fn) { const off = this.on(e, (...a) => { off(); fn(...a); }); return off; }
  emit(e, ...a) { [...(this.#m.get(e) ?? [])].forEach(fn => fn(...a)); }
}
```

**118. `getElementsByClassName`-like DOM traversal**
```js
function byClass(root, cls) {
  const out = [];
  (function walk(n) { for (const c of n.children) { if (c.classList.contains(cls)) out.push(c); walk(c); } })(root);
  return out;
}
```

**119. `setInterval` using `setTimeout` (drift-aware)**
```js
function interval(fn, ms) {
  let expected = performance.now() + ms, id;
  const step = () => { const drift = performance.now() - expected; fn(); expected += ms; id = setTimeout(step, Math.max(0, ms - drift)); };
  id = setTimeout(step, ms);
  return () => clearTimeout(id);
}
```

**120. Concurrency-limited task runner**
```js
async function runWithLimit(tasks, limit) {
  const results = []; let next = 0;
  async function worker() { while (next < tasks.length) { const i = next++; try { results[i] = { ok: true, value: await tasks[i]() }; } catch (e) { results[i] = { ok: false, error: e }; } } }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

**121. `get(obj, path, default)`**
```js
const get = (obj, path, def) => {
  const keys = Array.isArray(path) ? path : path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj; for (const k of keys) { if (cur == null) return def; cur = cur[k]; }
  return cur === undefined ? def : cur;
};
```

**122. Classnames helper**
```js
const cx = (...args) => args.flatMap(a => typeof a === 'string' ? a : Array.isArray(a) ? cx(...a) : a && typeof a === 'object' ? Object.keys(a).filter(k => a[k]) : []).filter(Boolean).join(' ');
```

---

## 🧠 Output Questions (practise predicting before reading the answer)

**123.**
```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C')).then(() => console.log('D'));
queueMicrotask(() => console.log('E'));
console.log('F');
```
→ `A F C E D B`

**124.**
```js
async function f() { console.log(1); await null; console.log(2); }
console.log(3); f(); console.log(4);
```
→ `3 1 4 2`

**125.**
```js
const obj = { name: 'x', regular() { return this.name; }, arrow: () => this?.name };
console.log(obj.regular(), obj.arrow());
```
→ `x undefined` (arrow takes module/global `this`)

**126.**
```js
console.log(typeof typeof 1); // "string"
console.log([10, 1, 2].sort()); // [1, 10, 2] — default sort is string-based
console.log(['1','2','3'].map(Number)); // [1, 2, 3]
console.log(['1','2','3'].map(parseInt)); // [1, NaN, NaN]
```

**127.**
```js
let a = { n: 1 }; let b = a; a.n = 2; a = { n: 3 };
console.log(b.n); // 2
```

**128.**
```js
console.log(foo()); console.log(bar);
function foo() { return 'hoisted'; }
var bar = 1;
```
→ `hoisted undefined`

**129.**
```js
console.log(0 || 'a', 0 ?? 'a', '' && 'b', null?.x);
```
→ `a 0 '' undefined`

**130.**
```js
const p = Promise.reject(new Error('x'));
p.catch(() => 'handled').then(v => console.log(v));
```
→ `handled`

**131.**
```js
for (var i = 0; i < 3; i++) { setTimeout(function () { console.log(this.i); }.bind({ i }), 0); }
```
→ `0 1 2` (each bind captures current value)

**132.**
```js
console.log([] == ![]); // true — ![] is false → 0; [] → '' → 0
console.log(NaN === NaN, Object.is(NaN, NaN)); // false true
console.log(0.1 + 0.2); // 0.30000000000000004
```

---

## 🧩 Level 4 — Scenario-based

**133. A search box fires a request per keystroke and sometimes shows stale results.**
Debounce input (≈250 ms), abort the previous request with `AbortController`, or tag requests with an incrementing id and ignore responses that aren't the latest; cache results per query.

**134. The page gets slower the longer a call runs.**
Suspect a leak: listeners added on every render, intervals never cleared, accumulating arrays (chat messages, audio levels). Heap snapshot comparison; cap buffers; virtualize long lists; clean up on unmount.

**135. Clicking "Submit" twice creates two records.**
Disable the button while pending, guard with an in-flight flag/promise, send an idempotency key the server deduplicates on.

**136. A heavy JSON (50 MB of call analytics) freezes the UI while parsing.**
Move parsing to a Web Worker, stream/paginate from the server, or aggregate server-side so the client never receives raw data.

**137. You need to call 200 APIs but the server rate-limits to 5 concurrent.**
Concurrency-limited pool (Q120) + retry with backoff on 429 honoring `Retry-After`.

**138. Users in different time zones see wrong call times.**
Store/transmit UTC ISO strings; format with `Intl.DateTimeFormat` using the viewer's time zone (or the clinic's configured zone); never parse date strings without offsets.

**139. Floating-point errors in billing totals.**
Use integer minor units (paise/cents), format at the edges; or a decimal library.

**140. An event handler fires but `this` is undefined.**
Method detached from its object — use an arrow function wrapper or `bind`, or class field arrows.

**141. An `async` forEach doesn't wait before the next code runs.**
Replace with `for...of` + await (sequential) or `await Promise.all(items.map(...))` (parallel).

**142. A third-party script occasionally throws and breaks your app's init.**
Load it async, wrap integration code in try/catch, isolate behind a feature flag, use `window.onerror` filtering by source to avoid noise.

---

## 🎯 From Your Resume

**143. "How do you consume an SSE stream with a bearer token?"**
`EventSource` can't set headers. Either use cookie auth (`withCredentials: true`) or `fetch` + streams:
```js
async function streamChat(body, onToken, signal) {
  const res = await fetch('/api/compliance-chat', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, credentials: 'include', signal });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const events = buffer.split('\n\n'); buffer = events.pop() ?? '';
    for (const evt of events) {
      const data = evt.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n');
      if (data === '[DONE]') return; if (data) onToken(data);
    }
  }
}
```

**144. "How do you avoid leaks with LiveKit / media streams?"**
On leave/unmount: `room.disconnect()`, remove all listeners, `track.stop()` for local tracks, detach media elements, clear reconnect timers, revoke object URLs.

**145. "How did you implement reconnect logic on the client?"**
Rely on the SDK's resume first; listen to connection state events; show non-blocking banner; if full disconnect, rejoin with exponential backoff + jitter, fetching a fresh token; give up after N attempts with a clear "Rejoin" button; log each attempt for metrics.

**146. "How did Celery workers give you 5x throughput?" (JS-adjacent follow-up)**
Explain the I/O-bound nature (transcription + LLM calls), parallel workers/concurrency, batching and avoiding sequential per-chunk calls — the same principle as `Promise.all` vs sequential awaits.
