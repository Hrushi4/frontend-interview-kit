# 05 — JavaScript

**How this file is organised**

- **Part A — Understand the topic:** how JavaScript works (types, scope, closures, `this`, prototypes, and the event loop), explained simply with diagrams.
- **Part B — Interview questions and answers:** Basics → Functions and Scope → Objects and Prototypes → Async → Advanced → Polyfills → Output Questions → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example** and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is JavaScript?

JavaScript is the programming language of the web. It runs in every browser, where engines like V8 (Chrome), SpiderMonkey (Firefox) and JavaScriptCore (Safari) execute it. It also runs on servers through Node.js, Deno and Bun. It is:

- **Dynamically typed:** variables don't have fixed types. `let x = 1; x = "hi";` is allowed.
- **Single-threaded:** your code runs on one main thread, one statement at a time.
- **Asynchronous:** slow work such as network calls and timers happens in the background, and the results come back later as callbacks or promises.
- **Garbage-collected:** memory is freed automatically when nothing references it any more.
- **Multi-paradigm:** you can write procedural, object-oriented (prototypes and classes) or functional code.

### Values and types

There are 7 **primitive** types, which are immutable and compared by value: `string`, `number`, `bigint`, `boolean`, `undefined`, `null` and `symbol`. Everything else is an **object** (arrays, functions, dates, maps), and objects are compared by reference.

```js
'a' === 'a'          // true  (primitives: same value)
{} === {}            // false (objects: different references)
const a = [1]; const b = a; b.push(2); // a is now [1, 2] — same object
```

### Scope and closures

**Scope** is where a variable can be accessed. JavaScript uses **lexical scope**: what a function can see depends on *where it was written*, not where it's called.

A **closure** is a function that "remembers" variables from the scope where it was created, even after that outer function has finished.

```js
function makeCounter() {
  let count = 0;                 // private variable
  return () => ++count;          // this inner function closes over `count`
}
const next = makeCounter();
next(); // 1
next(); // 2  — count survived because the closure keeps it alive
```

Closures power React hooks, debounce, memoize, module privacy and event handlers.

### `this`

`this` is decided by **how a function is called**, not where it's defined. The exception is arrow functions, which use the `this` of their surrounding code. The four rules are covered in Q37.

### Prototypes

Objects inherit from other objects through a hidden link called the **prototype**. When you read `obj.x` and `obj` has no `x`, JavaScript looks at its prototype, then the prototype's prototype, until it reaches `null`. This is the **prototype chain**. `class` syntax is a friendlier way to write prototype-based code.

### The event loop: how a single thread does async work

```text
 Call Stack (runs your code)          Web APIs / Node APIs
 ┌──────────────┐                     (timers, fetch, DOM events)
 │ main()       │ ── setTimeout ──►   timer runs in background
 └──────────────┘                            │
        ▲                                    ▼
        │                    ┌───────────────────────────────┐
        │                    │ Microtask queue (promises)     │  ← drained FIRST, completely
        └── event loop ◄─────┤ Task queue (timers, events)    │  ← one task per loop
                             └───────────────────────────────┘
```

The loop repeats these steps:

1. Run the current synchronous code until the call stack is empty.
2. Run **all** microtasks (promise callbacks, `await` continuations).
3. Let the browser render if needed.
4. Take **one** task (macrotask) from the task queue, such as a timer or click handler, and go back to step 1.

That's why `Promise.then` callbacks always run before `setTimeout(…, 0)` callbacks.

### Asynchronous code evolution

1. **Callbacks:** `getUser(id, (err, user) => …)`. Nested callbacks become "callback hell".
2. **Promises:** `getUser(id).then(…).catch(…)`. Chainable, with a single error path.
3. **async/await:** `const user = await getUser(id)`. Reads like synchronous code but is promise-based underneath.

### Why interviewers ask about JavaScript

JavaScript is never skipped, even for senior roles. Expect:

- Concept questions: closures, `this`, the event loop, prototypes.
- Output prediction puzzles: "What does this print?"
- Polyfills: "Implement `Promise.all`, debounce, `bind`."
- Real-world async questions: race conditions, cancellation, retries, memory leaks.

---

## Part B — Interview Questions and Answers

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is JavaScript and where does it run?**

**Short answer:** A dynamic, single-threaded, garbage-collected language. It runs in browsers (V8, SpiderMonkey, JavaScriptCore) and on servers (Node.js, Deno, Bun).

**Explanation:** It's dynamically typed, uses an event loop for asynchronous work, and supports procedural, object-oriented (prototypes) and functional styles. The same language runs the UI and, with Node, the backend.

**Example:** In BpoBox, React runs in the browser's V8 engine while a NestJS service runs the same language on Node.

**Say it like this:** "JavaScript is the language of the browser. It's dynamically typed and runs on a single thread, with an event loop for async work. I use it on both sides: React in the browser and Node or NestJS on the server."

---

**Q2. What are the data types?**

**Short answer:** Seven primitives (`string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`) and objects (arrays, functions, dates, maps, sets).

**Explanation:** Primitives are immutable and copied by value. Objects are mutable and shared by reference, which is why mutating state in React causes bugs.

**Example:**

```js
let s = 'hi'; let t = s; t += '!';    // s is still 'hi'
let o = { n: 1 }; let p = o; p.n = 2; // o.n is now 2 — same object
```

**Say it like this:** "Seven primitives plus objects. The key practical difference is that primitives copy by value while objects are shared by reference."

---

**Q3. Which `typeof` results should you remember?**

**Short answer:** `typeof null` is `'object'`, `typeof []` is `'object'`, `typeof function(){}` is `'function'`, `typeof NaN` is `'number'`, and an undeclared variable gives `'undefined'` without throwing.

**Explanation:** `typeof null` is a historical bug kept for compatibility. Use `Array.isArray` for arrays and `x === null` for null.

**Example:**

```js
typeof null      // 'object'
typeof []        // 'object'  → Array.isArray([]) is true
typeof NaN       // 'number'
typeof 10n       // 'bigint'
```

**Say it like this:** "`typeof` is fine for primitives, but it says 'object' for null and arrays, so I use `Array.isArray` and `=== null` for those."

---

**Q4. `null` vs `undefined`?**

**Short answer:** `undefined` means "not set yet"; `null` means "intentionally empty".

**Explanation:** JavaScript produces `undefined` for unassigned variables, missing properties and functions with no return. Developers use `null` on purpose. `null == undefined` is true, but `===` is false.

**Example:**

```js
let a;              // undefined
({}).x;             // undefined
let user = null;    // explicitly "no user"
```

**Say it like this:** "`undefined` is the language saying 'nothing here yet'; `null` is me saying 'deliberately empty'."

---

**Q5. `var` vs `let` vs `const`?**

**Short answer:** `var` is function-scoped and hoisted as `undefined`; `let` and `const` are block-scoped and in the TDZ until declared; `const` can't be reassigned.

**Explanation:** `const` prevents reassignment, not mutation: object contents can still change. `var` leaks out of blocks, causing bugs like the loop-closure problem.

**Example:**

```js
if (true) { var a = 1; let b = 2; }
a; // 1
b; // ReferenceError
const user = { name: 'A' };
user.name = 'B';   // allowed
user = {};         // TypeError
```

**Say it like this:** "I use `const` by default, `let` when I need to reassign, and never `var`, because it ignores block scope."

---

**Q6. What is the Temporal Dead Zone (TDZ)?**

**Short answer:** The period between entering a block and the line where a `let` or `const` is declared; accessing the variable then throws a `ReferenceError`.

**Explanation:** `let` and `const` are hoisted but not initialised. The TDZ stops you using a variable before its declaration, which `var` silently allowed.

**Example:**

```js
{
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 5;
}
```

**Say it like this:** "`let` and `const` are hoisted but unusable until their line runs. That's the TDZ, and it turns silent `undefined` bugs into clear errors."

---

**Q7. What is hoisting?**

**Short answer:** Before code runs, declarations are registered in their scope. Function declarations are fully usable, `var` is `undefined`, and `let`/`const`/`class` are in the TDZ.

**Explanation:** Function expressions follow their variable's rules, so `var f = function(){}` is `undefined` before its line, and calling it throws "not a function".

**Example:**

```js
sayHi();                       // works
function sayHi() {}
greet();                       // TypeError: greet is not a function
var greet = function () {};
```

**Say it like this:** "Hoisting registers declarations early. Function declarations are callable before their line; `var` is undefined; `let` and `const` throw."

---

**Q8. `==` vs `===`?**

**Short answer:** `===` compares without type conversion; `==` converts types first and gives surprising results.

**Explanation:** `'1' == 1` and `0 == ''` are true. The only common, intentional use of `==` is `x == null`, which checks for both null and undefined.

**Example:**

```js
'1' == 1          // true
0 == ''           // true
null == undefined // true
'1' === 1         // false
```

**Say it like this:** "I always use `===`. The only `==` I allow is `x == null`, as a shortcut for null-or-undefined."

---

**Q9. What are truthy and falsy values?**

**Short answer:** Falsy: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy, including `'0'`, `[]` and `{}`.

**Explanation:** This matters in conditions and in JSX: `{count && <Badge />}` renders "0" when count is 0.

**Example:**

```jsx
{count && <Badge />}      // renders "0" when count is 0
{count > 0 && <Badge />}  // correct
```

**Say it like this:** "Eight falsy values, everything else truthy. In React I compare explicitly, so a zero never renders as text."

---

**Q10. What are template literals?**

**Short answer:** Strings in backticks with `${expression}` interpolation and multiple lines.

**Explanation:** Tagged templates pass the string parts and values to a function, which libraries like styled-components and `gql` use.

**Example:**

```js
const msg = `Hello ${user.name}, you have ${calls.length} calls`;
const query = gql`query { calls { id } }`;
```

**Say it like this:** "Template literals make string building readable, and tagged templates power things like GraphQL queries."

---

**Q11. Function declaration vs function expression vs arrow function?**

**Short answer:** Declarations are hoisted; expressions aren't usable before their line; arrow functions are concise expressions with no own `this` or `arguments`, no `prototype`, and can't be used with `new`.

**Explanation:** Arrows inherit `this` from the surrounding code, which makes them ideal for callbacks. Named declarations appear clearly in stack traces.

**Example:**

```js
function add(a, b) { return a + b; }       // declaration
const sub = function (a, b) { return a - b; }; // expression
const mul = (a, b) => a * b;              // arrow
```

**Say it like this:** "I use arrow functions for callbacks because they inherit `this`, and declarations for top-level utilities."

---

**Q12. What are default parameters, rest and spread?**

**Short answer:** Defaults apply when an argument is `undefined`; rest collects remaining items into an array; spread expands an array or object into individual items.

**Explanation:** Spread makes shallow copies, and when merging objects the later properties win.

**Example:**

```js
function join(room, role = 'guest', ...extras) {}
const merged = { ...defaults, ...overrides };
Math.max(...nums);
```

**Say it like this:** "Rest gathers, spread expands. I use object spread for immutable updates, remembering it's only a shallow copy."

---

**Q13. What is destructuring?**

**Short answer:** Unpacking values from objects and arrays into variables, with defaults, renaming, nesting and rest.

**Explanation:** It makes function parameters and props readable and gives defaults in one place.

**Example:**

```js
const { id: callId, user: { name = 'Anonymous' } = {}, ...rest } = payload;
const [first, , third] = list;
[a, b] = [b, a]; // swap
```

**Say it like this:** "Destructuring lets me pull out exactly what I need, with defaults, which is how I handle props in every component."

---

**Q14. What are optional chaining and nullish coalescing?**

**Short answer:** `?.` returns `undefined` instead of throwing when the value before it is null or undefined; `??` provides a default only for null or undefined.

**Explanation:** Unlike `||`, `??` keeps valid falsy values like `0` and `''`.

**Example:**

```js
user?.profile?.email
callbacks.onEnd?.()
const volume = settings.volume ?? 50;  // keeps 0
const bad = settings.volume || 50;     // 0 becomes 50
```

**Say it like this:** "`?.` avoids 'cannot read property of undefined', and `??` gives defaults without clobbering a legitimate zero."

---

**Q15. Which array methods mutate and which don't?**

**Short answer:** Mutating: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`. Non-mutating: `map`, `filter`, `reduce`, `slice`, `concat`, `flat`, `toSorted`, `toReversed`, `toSpliced`, `with`.

**Explanation:** React and Redux need new references to detect changes, so mutating state in place causes missed renders.

**Example:**

```js
const sorted = calls.toSorted((a, b) => b.score - a.score); // original untouched
const sorted2 = [...calls].sort((a, b) => b.score - a.score);
```

**Say it like this:** "In React state I never call `sort` directly; I use `toSorted` or copy first, because mutation hides changes from React."

---

**Q16. `map` vs `forEach`?**

**Short answer:** `map` returns a new array of transformed values; `forEach` returns `undefined` and is for side effects.

**Explanation:** Neither can be stopped early with `break`; use `for...of`, `some` or `every` for that. Using `map` just for side effects is a code smell.

**Example:**

```js
const names = calls.map((c) => c.agent);
calls.forEach((c) => console.log(c.id));
```

**Say it like this:** "`map` when I want a new array, `forEach` for side effects, and `for...of` when I need to stop early or await."

---

**Q17. `find`, `findIndex`, `some`, `every`, `includes` and `indexOf`?**

**Short answer:** `find` returns the first match, `findIndex` its index, `some` whether any match, `every` whether all match, `includes` whether a value exists (NaN-safe), and `indexOf` its index (not NaN-safe).

**Explanation:** `find`, `some` and `every` take predicates; `includes` and `indexOf` compare values. `some` and `every` stop as soon as the answer is known.

**Example:**

```js
calls.find((c) => c.id === id);
calls.some((c) => c.flagged);
[NaN].includes(NaN); // true
[NaN].indexOf(NaN);  // -1
```

**Say it like this:** "I pick the method that says what I mean: `some` for 'is there any', `find` for 'give me the first', `includes` for simple membership."

---

**Q18. `for...in` vs `for...of`?**

**Short answer:** `for...in` loops over an object's enumerable keys (including inherited ones); `for...of` loops over the values of iterables.

**Explanation:** Don't use `for...in` on arrays: keys are strings and extra properties can appear. For objects, `Object.entries` with `for...of` is clearer.

**Example:**

```js
for (const key in { a: 1 }) console.log(key);           // 'a'
for (const v of [10, 20]) console.log(v);               // 10, 20
for (const [k, v] of Object.entries(obj)) console.log(k, v);
```

**Say it like this:** "`for...of` for values of arrays and maps; for objects I use `Object.entries` with `for...of`."

---

**Q19. How do you work with object keys?**

**Short answer:** `Object.keys`, `Object.values`, `Object.entries`, `Object.fromEntries`, the `in` operator, and `Object.hasOwn`.

**Explanation:** `in` includes inherited properties; `Object.hasOwn` checks own properties only and is the modern, safe replacement for `hasOwnProperty`.

**Example:**

```js
Object.fromEntries(Object.entries(scores).filter(([, v]) => v > 80));
Object.hasOwn(config, 'theme');
```

**Say it like this:** "Entries and fromEntries let me map and filter objects like arrays, and `Object.hasOwn` is how I check keys safely."

---

**Q20. Shallow vs deep copy?**

**Short answer:** A shallow copy (spread, `Object.assign`, `slice`) copies only the top level; a deep copy duplicates everything. `structuredClone()` is the modern deep copy.

**Explanation:** `JSON.parse(JSON.stringify(x))` turns Dates into strings, drops `undefined` and functions, and fails on cycles. `structuredClone` handles Date, Map, Set and cycles.

**Example:**

```js
const a = { user: { name: 'A' } };
const shallow = { ...a };
shallow.user.name = 'B';           // a.user.name is ALSO 'B'
const deep = structuredClone(a);
```

**Say it like this:** "Spread only copies one level, so nested updates must copy each level, or I use `structuredClone` for a real deep copy."

---

**Q21. Is JavaScript pass-by-value or pass-by-reference?**

**Short answer:** Always pass-by-value, but for objects the value being copied is a reference.

**Explanation:** So mutating a property inside a function is visible outside, but reassigning the parameter isn't.

**Example:**

```js
function update(u) { u.name = 'B'; u = { name: 'C' }; }
const user = { name: 'A' };
update(user);
user.name; // 'B'
```

**Say it like this:** "It's pass-by-value where the value of an object is a reference: you can mutate what it points to, but not rebind the caller's variable."

---

**Q22. What should you know about strings?**

**Short answer:** Strings are immutable; every method returns a new string.

**Explanation:** Useful methods include `slice`, `split`, `trim`, `padStart`, `includes`, `startsWith`, `replaceAll`, `at(-1)`, `localeCompare` and `normalize`. `localeCompare` sorts names correctly in different languages.

**Example:**

```js
String(7).padStart(2, '0');                     // "07"
names.sort((a, b) => a.localeCompare(b, 'es')); // locale-aware sort
```

**Say it like this:** "Strings never change in place. For user-facing sorting I use `localeCompare`, which matters for a multilingual product."

---

**Q23. What are the common number pitfalls?**

**Short answer:** Floating-point errors (`0.1 + 0.2`), the safe-integer limit (2^53 − 1), `parseInt` without a radix, and odd conversions like `Number('')` being 0.

**Explanation:** For money use integer minor units; for large IDs use strings or `BigInt`. `parseInt('12px', 10)` gives 12, but `Number('12px')` gives NaN.

**Example:**

```js
0.1 + 0.2;                    // 0.30000000000000004
Number.MAX_SAFE_INTEGER + 2;  // inaccurate
parseInt('08', 10);           // 8
```

**Say it like this:** "I store money in paise or cents, keep big IDs as strings, and always pass a radix to `parseInt`."

---

**Q24. How do you check for `NaN`?**

**Short answer:** Use `Number.isNaN(x)`, not the global `isNaN`, which converts its argument first.

**Explanation:** `NaN` is the only value not equal to itself. `Object.is(NaN, NaN)` is true.

**Example:**

```js
isNaN('abc');          // true (coerced)
Number.isNaN('abc');   // false
Number.isNaN(NaN);     // true
```

**Say it like this:** "`Number.isNaN` is strict, so it only says true for an actual NaN."

---

**Q25. What is the DOM?**

**Short answer:** The Document Object Model, a tree of objects representing the page, which JavaScript reads and changes.

**Explanation:** APIs like `querySelector`, `createElement`, `append`, `classList` and `textContent` manipulate it. React manages the DOM for you, but understanding it matters for refs, performance and debugging.

**Example:**

```js
const li = document.createElement('li');
li.textContent = 'Call with Maria';
document.querySelector('#calls').append(li);
```

**Say it like this:** "The DOM is the live tree the browser renders. React updates it for me, but I still work with it directly through refs for focus, media and measurements."

---

**Q26. `innerHTML` vs `textContent` vs `innerText`?**

**Short answer:** `innerHTML` parses HTML (an XSS risk with user data), `textContent` sets plain text (fast and safe), and `innerText` respects CSS but triggers layout.

**Explanation:** Never put untrusted data into `innerHTML`. `textContent` is the safe default for text.

**Example:**

```js
el.textContent = userComment;  // safe
el.innerHTML = userComment;    // dangerous: <img onerror=…> would run
```

**Say it like this:** "For user data I always use `textContent`; `innerHTML` with untrusted input is an XSS hole."

---

**Q27. How do you add and remove event listeners?**

**Short answer:** `addEventListener(type, handler, options)` and `removeEventListener` with the same function reference, or an `AbortController` signal.

**Explanation:** A signal removes many listeners with one `abort()`. `passive: true` promises no `preventDefault`, which keeps scrolling smooth; `once: true` removes the listener after the first call.

**Example:**

```js
const ctrl = new AbortController();
window.addEventListener('resize', onResize, { signal: ctrl.signal, passive: true });
window.addEventListener('keydown', onKey, { signal: ctrl.signal });
ctrl.abort(); // removes both
```

**Say it like this:** "I use an AbortController signal for listeners, so cleanup is one `abort()` call, which pairs nicely with React effect cleanup."

---

**Q28. What are event bubbling and capturing?**

**Short answer:** An event travels down from `window` to the target (capture), then back up (bubble). Listeners run in the bubble phase by default.

**Explanation:** `stopPropagation()` stops the journey; `preventDefault()` cancels the browser's default action, such as submitting a form. Pass `{ capture: true }` to listen in the capture phase.

**Example:**

```text
window → document → body → ul → li (target) → ul → body → document → window
```

**Say it like this:** "Events capture down and bubble up. Bubbling is what makes event delegation possible."

---

**Q29. What is event delegation?**

**Short answer:** Put one listener on a parent and work out which child was clicked from `event.target`.

**Explanation:** It uses fewer listeners and works for children added later. `closest()` finds the relevant ancestor of the clicked element.

**Example:**

```js
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-call-id]');
  if (item) openCall(item.dataset.callId);
});
```

**Say it like this:** "For a list of a thousand calls I attach one listener to the list instead of a thousand. React does something similar internally."

---

**Q30. `setTimeout` vs `setInterval`?**

**Short answer:** `setTimeout` runs once after at least N ms; `setInterval` repeats every N ms. Both return an ID to clear.

**Explanation:** Delays are minimums: a busy main thread delays them, nested timeouts clamp to 4 ms, and background tabs throttle them. Intervals can drift or overlap if callbacks are slow.

**Example:**

```js
const id = setInterval(refreshStatus, 5000);
clearInterval(id);
```

**Say it like this:** "Timers are 'not before' guarantees, not exact. For accurate clocks I calculate elapsed time from `performance.now()`."

---

## 🟡 Level 2 — Intermediate: Functions, Scope and `this`

**Q31. What types of scope are there?**

**Short answer:** Global, module, function and block scope.

**Explanation:** JavaScript is lexically scoped: what a function can see depends on where it's written. Each ES module has its own scope, so top-level variables don't leak to `window`.

**Example:**

```js
const a = 1;            // module scope
function f() {
  const b = 2;          // function scope
  if (true) { const c = 3; } // block scope
}
```

**Say it like this:** "Scope is decided by where code is written, not where it's called, and modules give every file its own scope."

---

**Q32. What is the scope chain?**

**Short answer:** Variable lookup walks from the current scope outwards to global; the first match wins.

**Explanation:** If nothing matches, you get a `ReferenceError` (or an accidental global in sloppy mode). Inner variables can shadow outer ones with the same name.

**Example:**

```js
const role = 'admin';
function check() {
  const role = 'qa';     // shadows outer role
  return () => role;     // finds 'qa' first
}
```

**Say it like this:** "Lookups go inside-out through enclosing scopes. That chain is also what closures keep alive."

---

**Q33. What is a closure, and what are its use cases?**

**Short answer:** A function together with the variables it captured from where it was defined, which stay alive as long as the function does.

**Explanation:** Closures give private state, factories, memoisation caches, debounce timers, partial application and React hooks. Stale closures are a common React bug.

**Example:**

```js
function createCounter() {
  let count = 0;
  return { inc: () => ++count, get: () => count };
}
const c = createCounter(); c.inc(); c.get(); // 1
```

**Say it like this:** "A closure is a function that remembers its birthplace. `debounce` is a closure holding a timer ID; in React, stale closures are why effects sometimes see old state."

---

**Q34. What is the classic closure-in-a-loop problem?**

**Short answer:** With `var`, all callbacks share one variable and see its final value; `let` creates a new binding per iteration.

**Explanation:** By the time the timeouts run, the `var` loop has finished and `i` is 3. The pre-ES6 fix was an IIFE capturing the value.

**Example:**

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2
```

**Say it like this:** "`var` has one binding for the whole loop; `let` gets a fresh binding per iteration, so each callback captures its own value."

---

**Q35. How can closures cause memory leaks?**

**Short answer:** A closure keeps everything it captured reachable, so a long-lived closure holding large data or DOM nodes prevents garbage collection.

**Explanation:** Common culprits are event listeners and intervals that are never removed, and caches that hold closures.

**Example:**

```js
function attach() {
  const huge = new Array(1e6).fill('x');
  window.addEventListener('resize', () => console.log(huge.length)); // never removed
}
```

**Say it like this:** "A listener that's never removed keeps its whole closure alive. That's why every effect that subscribes must clean up."

---

**Q36. What is an IIFE?**

**Short answer:** An Immediately Invoked Function Expression: `(function () { … })();`, which creates a private scope right away.

**Explanation:** Before ES modules it was the standard way to avoid polluting globals (the "module pattern"). Today modules do this automatically.

**Example:**

```js
const counter = (function () {
  let count = 0;
  return { inc: () => ++count };
})();
```

**Say it like this:** "IIFEs were how we got private scope before modules. I mostly see them in older code or quick scripts now."

---

**Q37. How is `this` determined?**

**Short answer:** By how a function is called: `new` → the new object; `call/apply/bind` → the object passed; `obj.method()` → `obj`; a plain call → `undefined` in strict mode. Arrow functions use the surrounding `this`.

**Explanation:** The rules are applied in that priority order. Arrows ignore all of them, which is why they're great for callbacks inside methods.

**Example:**

```js
const user = {
  name: 'Asha',
  regular() { return this.name; },
  arrow: () => this?.name,
};
user.regular(); // 'Asha'
user.arrow();   // undefined
```

**Say it like this:** "`this` is decided at call time: `new`, then explicit binding, then 'left of the dot', then the default. Arrow functions take `this` from where they're written."

---

**Q38. Give an example of losing `this`, and how to fix it.**

**Short answer:** Passing a method as a callback detaches it from its object; fix it with an arrow wrapper or `bind`.

**Explanation:** `setTimeout(btn.click)` passes only the function, so when it's called later there's no object to the left of the dot.

**Example:**

```js
const btn = { label: 'Join', click() { console.log(this.label); } };
setTimeout(btn.click);             // undefined
setTimeout(() => btn.click());     // 'Join'
setTimeout(btn.click.bind(btn));   // 'Join'
```

**Say it like this:** "Passing `obj.method` passes just the function, so `this` is lost. An arrow wrapper keeps the 'left of the dot' call."

---

**Q39. `call` vs `apply` vs `bind`?**

**Short answer:** All set `this`. `call` invokes now with arguments listed; `apply` invokes now with an array; `bind` returns a new function with `this` (and optional arguments) fixed.

**Explanation:** `bind` is useful for callbacks and partial application; `apply` was common before spread syntax.

**Example:**

```js
function greet(g, p) { return `${g}, ${this.name}${p}`; }
greet.call({ name: 'Asha' }, 'Hi', '!');
greet.apply({ name: 'Asha' }, ['Hi', '!']);
const hi = greet.bind({ name: 'Asha' }, 'Hi'); hi('?');
```

**Say it like this:** "`call` and `apply` run immediately and differ only in how arguments are passed; `bind` gives me a new function for later."

---

**Q40. Arrow functions in class fields vs prototype methods?**

**Short answer:** A class-field arrow is created per instance with `this` bound; a prototype method is shared but needs binding when passed around.

**Explanation:** Arrow fields cost memory per instance and can't be overridden through the prototype, but they're convenient for event handlers.

**Example:**

```js
class Player {
  onEnd = () => this.reset();   // bound, per instance
  reset() {}                    // shared on prototype
}
```

**Say it like this:** "Arrow fields are handy for handlers in class components; regular methods are cheaper when I don't pass them around."

---

**Q41. What are higher-order functions?**

**Short answer:** Functions that take functions as arguments or return functions.

**Explanation:** `map`, `filter`, `debounce`, Express middleware and React higher-order components are all examples. They let you reuse behaviour around any function.

**Example:**

```js
const withLogging = (fn) => (...args) => { console.log('call', args); return fn(...args); };
const loggedSave = withLogging(saveScore);
```

**Say it like this:** "A higher-order function wraps or produces other functions. Debounce and middleware are everyday examples."

---

**Q42. What are pure functions and side effects?**

**Short answer:** A pure function returns the same output for the same input and changes nothing outside itself; side effects are network calls, DOM changes, mutations and logging.

**Explanation:** Pure functions are easy to test, cache and reason about. Redux reducers, selectors and React render logic must be pure.

**Example:**

```js
const addTax = (amount) => amount * 1.18;         // pure
let total = 0; const add = (x) => (total += x);   // impure
```

**Say it like this:** "I keep business logic pure and push side effects to the edges: effects, handlers and thunks."

---

**Q43. Currying vs partial application?**

**Short answer:** Currying turns `f(a, b, c)` into `f(a)(b)(c)`; partial application fixes some arguments and returns a function for the rest.

**Explanation:** Both create specialised functions from general ones. In practice partial application (via `bind` or closures) is more common in app code.

**Example:**

```js
const curry = (fn) => function c(...a) { return a.length >= fn.length ? fn(...a) : (...b) => c(...a, ...b); };
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3); // 6
const logInfo = console.log.bind(console, '[INFO]'); // partial application
```

**Say it like this:** "Currying is one argument at a time; partial application pre-fills some arguments. I use the second for things like pre-configured loggers."

---

**Q44. What is function composition?**

**Short answer:** Combining small functions so one's output feeds the next; `pipe` runs left to right, `compose` right to left.

**Explanation:** It builds complex transformations from simple, testable steps.

**Example:**

```js
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const toSlug = pipe((s) => s.trim(), (s) => s.toLowerCase(), (s) => s.replace(/\s+/g, '-'));
toSlug('  Call Summary Report '); // "call-summary-report"
```

**Say it like this:** "Composition lets me build a transformation from tiny functions, each easy to test on its own."

---

**Q45. What is the `arguments` object?**

**Short answer:** An array-like object with all arguments passed to a regular (non-arrow) function.

**Explanation:** It isn't a real array, and arrow functions don't have it. Rest parameters (`...args`) give a real array and are preferred.

**Example:**

```js
function oldSum() { return Array.from(arguments).reduce((a, b) => a + b, 0); }
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
```

**Say it like this:** "`arguments` is legacy; I use rest parameters, which are a real array and work in arrow functions."

---

**Q46. How do recursion and stack limits interact?**

**Short answer:** Each call adds a stack frame, and very deep recursion (around 10,000 frames) throws `RangeError: Maximum call stack size exceeded`.

**Explanation:** JavaScript engines generally don't do tail-call optimisation, so for deep or unknown depths convert recursion to a loop with an explicit stack.

**Example:**

```js
function countNodes(root) {
  let n = 0; const stack = [root];
  while (stack.length) { const node = stack.pop(); n++; stack.push(...node.children); }
  return n;
}
```

**Say it like this:** "Recursion is fine for shallow trees; for deep DOM or data trees I use an explicit stack to avoid overflow."

---

## 🟡 Intermediate: Objects, Prototypes and Classes

**Q47. What is the prototype chain?**

**Short answer:** Every object links to a prototype; when a property isn't found on the object, JavaScript looks up the chain until it finds it or reaches `null`.

**Explanation:** Methods like `array.map` live on `Array.prototype`, not on each array. This is how inheritance works in JavaScript.

**Example:**

```js
const animal = { breathes: true };
const dog = Object.create(animal);
dog.breathes;                          // true, from the prototype
Object.getPrototypeOf(dog) === animal; // true
```

**Say it like this:** "Objects delegate missing properties to their prototype. Classes are built on this same mechanism."

---

**Q48. `__proto__` vs `prototype`?**

**Short answer:** `prototype` is a property of constructors that becomes the `[[Prototype]]` of instances; `__proto__` is a legacy accessor for an object's own prototype.

**Explanation:** Use `Object.getPrototypeOf` and `Object.create` instead of `__proto__`.

**Example:**

```js
function User() {}
const u = new User();
Object.getPrototypeOf(u) === User.prototype; // true
```

**Say it like this:** "`prototype` belongs to the constructor; each instance's internal prototype points to it. I use `Object.getPrototypeOf` rather than `__proto__`."

---

**Q49. What does `new` do?**

**Short answer:** It creates an object linked to `Constructor.prototype`, calls the constructor with `this` set to it, and returns it (unless the constructor returns another object).

**Explanation:** Being able to implement it shows you understand prototypes and `this`.

**Example:**

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const result = Ctor.apply(obj, args);
  return result !== null && typeof result === 'object' ? result : obj;
}
```

**Say it like this:** "`new` is three steps: create a linked object, run the constructor on it, return it."

---

**Q50. Are ES6 classes just syntax sugar?**

**Short answer:** Mostly. They're built on prototypes, with real differences: strict mode, TDZ, mandatory `new`, private `#fields` and `static` blocks.

**Explanation:** Calling a class without `new` throws, and private fields can't be accessed outside the class at all.

**Example:**

```js
class A {}
A();          // TypeError: Class constructor A cannot be invoked without 'new'
```

**Say it like this:** "Classes are prototypes with nicer syntax, plus a few real features like true private fields."

---

**Q51. How does inheritance work with classes?**

**Short answer:** `extends` sets up the prototype chain, `super()` calls the parent constructor, and `super.method()` calls the parent's method.

**Explanation:** You must call `super()` before using `this` in a subclass constructor.

**Example:**

```js
class Participant {
  constructor(id) { this.id = id; }
  describe() { return `Participant ${this.id}`; }
}
class Interpreter extends Participant {
  constructor(id, language) { super(id); this.language = language; }
  describe() { return `${super.describe()} (interprets ${this.language})`; }
}
```

**Say it like this:** "`extends` and `super` wire up prototypes for me. In React I rarely use inheritance, preferring composition."

---

**Q52. What are private fields?**

**Short answer:** `#field` members that are truly private, enforced by the engine.

**Explanation:** Unlike the `_name` convention, they can't be read from outside at all. `#x in obj` checks whether an object has the private field.

**Example:**

```js
class Session {
  #token;
  constructor(t) { this.#token = t; }
  get isActive() { return Boolean(this.#token); }
}
```

**Say it like this:** "`#` fields give real encapsulation, which is useful for things like an SDK wrapper holding a token."

---

**Q53. What are getters and setters?**

**Short answer:** Computed properties that look like normal properties; setters are a good place for validation.

**Explanation:** Use them sparingly: hidden work behind property access can surprise readers.

**Example:**

```js
class Temperature {
  #c = 0;
  get fahrenheit() { return this.#c * 9 / 5 + 32; }
  set fahrenheit(f) { if (typeof f !== 'number') throw new TypeError(); this.#c = (f - 32) * 5 / 9; }
}
```

**Say it like this:** "Getters expose derived values and setters validate input, while the API still looks like plain properties."

---

**Q54. What are property descriptors?**

**Short answer:** `Object.defineProperty` controls whether a property is writable, enumerable, configurable, or computed with getters and setters.

**Explanation:** It's how you make read-only properties or hide properties from `Object.keys`. Frameworks use it for reactivity in older systems.

**Example:**

```js
Object.defineProperty(config, 'version', { value: '1.4.0', writable: false, enumerable: true });
```

**Say it like this:** "Descriptors give fine control over a property, like making a config value read-only."

---

**Q55. `Object.freeze` vs `Object.seal` vs `Object.preventExtensions`?**

**Short answer:** `preventExtensions` blocks adding properties; `seal` also blocks removing; `freeze` also blocks changing values.

**Explanation:** All three are shallow: nested objects can still change.

**Example:**

```js
const cfg = Object.freeze({ api: '/v1', flags: { beta: true } });
cfg.api = '/v2';         // ignored (throws in strict mode)
cfg.flags.beta = false;  // still works — shallow
```

**Say it like this:** "Freeze is shallow, so for true immutability I rely on patterns like Immer rather than freezing everything."

---

**Q56. Composition vs inheritance?**

**Short answer:** Prefer composing small pieces (functions, hooks, mixins) over deep class hierarchies.

**Explanation:** Inheritance couples child classes to parent internals and makes changes risky. React favours composition: children, hooks and wrapper components.

**Example:** Instead of `AdminTable extends Table extends BaseList`, compose `<Table>` with a `usePermissions()` hook and an `actions` slot.

**Say it like this:** "I compose behaviour from small hooks and components; inheritance trees get brittle quickly."

---

**Q57. `Map` vs a plain object?**

**Short answer:** `Map` accepts any key type, keeps insertion order, has `size`, and is optimised for frequent adds and deletes; objects are JSON-friendly but have string keys and prototype clashes.

**Explanation:**

| | `Map` | Object |
|---|---|---|
| Key types | anything | strings, symbols |
| Size | `map.size` | `Object.keys(o).length` |
| JSON | needs conversion | native |

**Example:**

```js
const participants = new Map();
participants.set(p.sid, p); participants.delete(p.sid);
```

**Say it like this:** "For a lookup that changes often, like participants keyed by ID during a call, I use a Map. For data in Redux or JSON, plain objects."

---

**Q58. What is a `Set` useful for?**

**Short answer:** Storing unique values with O(1) membership checks.

**Explanation:** It dedupes arrays and tracks selections cheaply. Newer methods like `union` and `intersection` exist; check support.

**Example:**

```js
const unique = [...new Set(['a', 'b', 'a'])];
const selected = new Set(); selected.add(id); selected.has(id);
```

**Say it like this:** "I use a Set for selected rows in tables: adding, removing and checking are all constant time."

---

**Q59. What are `WeakMap`, `WeakSet` and `WeakRef`?**

**Short answer:** Collections whose object keys are held weakly, so entries disappear when the key is garbage-collected.

**Explanation:** They're for attaching metadata to objects or DOM nodes without leaking memory. They can't be iterated, because contents can vanish at any time.

**Example:**

```js
const meta = new WeakMap();
meta.set(videoElement, { attachedAt: Date.now() });
```

**Say it like this:** "WeakMap lets me attach data to DOM nodes without preventing their cleanup."

---

**Q60. What are Symbols?**

**Short answer:** Unique values used as property keys that never clash with other keys.

**Explanation:** Well-known symbols customise built-in behaviour: `Symbol.iterator` makes objects iterable, `Symbol.asyncIterator` enables `for await`, and `Symbol.toPrimitive` controls conversion.

**Example:**

```js
const range = { *[Symbol.iterator]() { yield 1; yield 2; } };
[...range]; // [1, 2]
```

**Say it like this:** "Symbols are guaranteed-unique keys, and well-known symbols let my objects plug into language features like `for...of`."

---

**Q61. What are the JSON gotchas?**

**Short answer:** `JSON.stringify` drops `undefined`, functions and symbols, turns Dates into strings, and throws on cycles and BigInt.

**Explanation:** Dates don't come back as Dates after parsing. Use the `replacer` and `reviver` arguments for custom handling.

**Example:**

```js
JSON.stringify({ a: undefined, b: () => 1, d: new Date(0) });
// '{"d":"1970-01-01T00:00:00.000Z"}'
JSON.parse(text, (k, v) => (k === 'createdAt' ? new Date(v) : v));
```

**Say it like this:** "JSON silently drops undefined and turns Dates into strings, so I revive dates explicitly or validate with a schema."

---

## 🟡 Intermediate: Asynchronous JavaScript

**Q62. Why is JavaScript asynchronous if it's single-threaded?**

**Short answer:** Your code runs on one thread, but the runtime does slow work (network, timers, I/O) in the background and queues callbacks when it finishes.

**Explanation:** The event loop runs those callbacks when the call stack is empty, so the UI isn't frozen while waiting for the network.

**Example:** While `fetch('/api/calls')` waits 400 ms, the user can still type and scroll; the `.then` callback runs when the response arrives.

**Say it like this:** "JavaScript is single-threaded, but `fetch` and timers are handled by the browser in the background. The event loop brings results back to my code when the stack is empty."

---

**Q63. Explain the event loop precisely.**

**Short answer:** Run the current task until the stack is empty, run all microtasks, let the browser render, then take the next task and repeat.

**Explanation:** Microtasks (promise callbacks) are drained completely before any rendering or next macrotask, which is why a resolved promise always beats `setTimeout(…, 0)`.

**Example:**

```js
console.log('1 sync');
setTimeout(() => console.log('4 task'), 0);
Promise.resolve().then(() => console.log('3 microtask'));
console.log('2 sync');
```

**Say it like this:** "Synchronous code first, then the entire microtask queue, then maybe a render, then one macrotask like a timer. That's why promises log before zero-delay timeouts."

---

**Q64. Give examples of microtasks and macrotasks.**

**Short answer:** Microtasks: `.then/.catch/.finally`, code after `await`, `queueMicrotask`, `MutationObserver`. Macrotasks: `setTimeout`, `setInterval`, `MessageChannel`, I/O, UI events.

**Explanation:** Knowing which queue a callback goes into lets you predict ordering in output puzzles and avoid UI starvation.

**Example:** `button.click()` handler (task) → inside it `await save()` (rest runs as a microtask) → `setTimeout(showToast)` (next task).

**Say it like this:** "Promise work is microtasks and runs as soon as the stack clears; timers and events are macrotasks that wait their turn."

---

**Q65. Can microtasks block rendering?**

**Short answer:** Yes. The microtask queue must be empty before rendering, so an endless chain of microtasks freezes the page.

**Explanation:** Recursive promise chains never yield to rendering or input. Long synchronous work inside microtasks has the same effect.

**Example:**

```js
function loop() { Promise.resolve().then(loop); }
loop(); // page freezes
```

**Say it like this:** "Microtasks don't yield to rendering, so heavy or infinite promise chains freeze the UI just like a long loop."

---

**Q66. How did async code evolve from callbacks to promises to async/await?**

**Short answer:** Callbacks led to nesting and repeated error handling; promises gave chaining and one error path; async/await makes promise code read top to bottom.

**Explanation:** async/await is just promises underneath, so you still need `Promise.all` for parallel work and `try/catch` for errors.

**Example:**

```js
getUser(id).then((u) => getCalls(u.id)).then(render).catch(handle);   // promises
try { const u = await getUser(id); render(await getCalls(u.id)); } catch (e) { handle(e); } // async/await
```

**Say it like this:** "Callbacks became promises for composability, and async/await made promises readable. Under the hood it's the same mechanism."

---

**Q67. What are the states of a promise?**

**Short answer:** `pending`, then either `fulfilled` (with a value) or `rejected` (with a reason). Once settled it never changes.

**Explanation:** Calling `resolve` or `reject` again after settling does nothing. Handlers attached after settling still run, asynchronously.

**Example:**

```js
const p = new Promise((res) => { res(1); res(2); });
p.then(console.log); // 1
```

**Say it like this:** "A promise settles exactly once, which is what makes it safe to share between consumers."

---

**Q68. What are the promise chaining rules?**

**Short answer:** Each `.then` returns a new promise. Returning a value fulfils it, returning a promise waits for it, and throwing rejects it. `.catch` recovers, and `.finally` runs either way and passes the result through.

**Explanation:** Forgetting to `return` inside `.then` is a classic bug: the chain continues without waiting.

**Example:**

```js
fetchUser()
  .then((u) => fetchCalls(u.id))   // returned promise is awaited
  .catch(() => [])                 // recover with empty list
  .finally(() => setLoading(false));
```

**Say it like this:** "Every `then` makes a new promise; return values flow down the chain and thrown errors jump to the next `catch`."

---

**Q69. What are the promise combinators?**

**Short answer:** `all` (all fulfil, fails fast), `allSettled` (wait for all, never rejects), `race` (first to settle), `any` (first to fulfil, `AggregateError` if all fail).

**Explanation:**

| Method | Use case |
|---|---|
| `all` | load user + calls + settings together |
| `allSettled` | send 10 notifications and report failures |
| `race` | a request vs a timeout |
| `any` | fastest of several mirrors |

**Example:**

```js
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms));
await Promise.race([fetch('/api/report'), timeout(5000)]);
```

**Say it like this:** "`all` when everything is required, `allSettled` when partial success is fine, `race` for timeouts and `any` for 'first success wins'."

---

**Q70. What is `Promise.withResolvers()`?**

**Short answer:** It returns `{ promise, resolve, reject }`, so you can resolve a promise from outside its constructor.

**Explanation:** It's the "deferred" pattern, useful when the resolving event happens somewhere else, like an SDK callback. Check runtime support.

**Example:**

```js
const { promise, resolve } = Promise.withResolvers();
room.once('connected', resolve);
await promise;
```

**Say it like this:** "`withResolvers` is a clean way to turn an event into a promise without nesting code inside the constructor."

---

**Q71. How do you handle errors with async/await?**

**Short answer:** Wrap awaits in `try/catch`, or attach `.catch` to the returned promise; report unhandled rejections globally.

**Explanation:** An unawaited rejected promise fires `unhandledrejection`, which should be sent to Sentry. Catch at the level where you can do something useful.

**Example:**

```js
try { await submitScore(data); } catch (e) { showError(e); }
window.addEventListener('unhandledrejection', (e) => Sentry.captureException(e.reason));
```

**Say it like this:** "I catch errors where I can recover or show a message, and a global `unhandledrejection` handler reports anything I missed."

---

**Q72. Sequential vs parallel awaits?**

**Short answer:** Independent requests should start together with `Promise.all` instead of being awaited one after another.

**Explanation:** Two sequential 400 ms requests take 800 ms; in parallel they take about 400 ms.

**Example:**

```js
const user = await getUser(); const calls = await getCalls();            // ~800ms
const [user2, calls2] = await Promise.all([getUser(), getCalls()]);     // ~400ms
```

**Say it like this:** "On a dashboard I cut load time almost in half just by wrapping three independent fetches in `Promise.all`."

---

**Q73. What happens with `await` inside loops?**

**Short answer:** `for...of` with `await` runs items sequentially; `forEach(async …)` doesn't wait at all.

**Explanation:** `forEach` ignores returned promises. Use `Promise.all(items.map(…))` for parallel work, or a pool for limited concurrency.

**Example:**

```js
items.forEach(async (i) => await save(i)); console.log('done'); // logs before saves finish
for (const i of items) await save(i);                           // sequential
await Promise.all(items.map((i) => save(i)));                   // parallel
```

**Say it like this:** "`forEach` with async is a classic bug. I choose `for...of` for sequential or `Promise.all` for parallel, deliberately."

---

**Q74. What is top-level await?**

**Short answer:** In ES modules you can use `await` outside any function; modules importing it wait until it finishes.

**Explanation:** It's useful for loading config before the app starts, but a slow top-level await delays everything that depends on that module.

**Example:**

```js
// config.js
export const config = await fetch('/config.json').then((r) => r.json());
```

**Say it like this:** "Top-level await is handy for startup config, but I keep it fast because it blocks every dependent module."

---

**Q75. How do you cancel work with `AbortController`?**

**Short answer:** Pass `controller.signal` to `fetch` (or listeners) and call `abort()`; the fetch rejects with an `AbortError`.

**Explanation:** `AbortSignal.timeout(ms)` gives a built-in timeout, and `AbortSignal.any` combines signals. Ignore `AbortError` in your error handling.

**Example:**

```js
const ctrl = new AbortController();
fetch('/api/search?q=maria', { signal: ctrl.signal })
  .catch((e) => { if (e.name !== 'AbortError') throw e; });
ctrl.abort();
fetch(url, { signal: AbortSignal.timeout(5000) });
```

**Say it like this:** "In React effects I create an AbortController and abort it in the cleanup, so an old request can never overwrite newer data."

---

**Q76. What are the `fetch` gotchas?**

**Short answer:** It doesn't reject on HTTP errors, doesn't send cookies cross-origin by default, has no timeout, and its body can be read only once.

**Explanation:** Always check `res.ok`, set `credentials` when needed, add an abort timeout, and use `res.clone()` to read the body twice.

**Example:**

```js
async function http(url, options) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.status === 204 ? null : res.json();
}
```

**Say it like this:** "The biggest gotcha is that a 500 doesn't reject. My fetch wrapper checks `res.ok` and throws a typed error."

---

**Q77. Debounce vs throttle: definitions and implementations?**

**Short answer:** Debounce waits until events stop for N ms, then runs once; throttle runs at most once every N ms during continuous events.

**Explanation:** Debounce suits search inputs and autosave; throttle suits scroll, resize and analytics. Both are closures holding a timer.

**Example:**

```js
function debounce(fn, ms) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}
```

**Say it like this:** "Debounce is 'wait until the user stops typing'; throttle is 'at most once every 100 ms while scrolling'."

---

**Q78. How do you retry with exponential backoff and jitter?**

**Short answer:** Retry failed calls with growing delays (300 ms, 600 ms, 1.2 s…) plus randomness, and don't retry errors that won't fix themselves.

**Explanation:** Jitter stops thousands of clients retrying at the same instant. Don't retry 400/401/403, or non-idempotent requests without an idempotency key.

**Example:**

```js
async function retry(fn, { tries = 4, base = 300, max = 5000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (attempt >= tries - 1 || [400, 401, 403].includes(err.status)) throw err;
      const delay = Math.min(max, base * 2 ** attempt) * (0.5 + Math.random() / 2);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
```

**Say it like this:** "Backoff with jitter for transient failures, a retry limit, and no retries for auth or validation errors."

---

**Q79. What are generators and async generators?**

**Short answer:** `function*` yields values lazily; `async function*` yields values over time, consumed with `for await...of`.

**Explanation:** They model paginated APIs and streams naturally: the consumer pulls the next page only when ready.

**Example:**

```js
async function* pages(url) {
  let next = url;
  while (next) { const res = await (await fetch(next)).json(); yield res.items; next = res.nextPage; }
}
for await (const items of pages('/api/calls')) render(items);
```

**Say it like this:** "Async generators turn paginated APIs into a simple loop, and the consumer controls the pace."

---

**Q80. What is the iterator protocol?**

**Short answer:** An object is iterable if `[Symbol.iterator]()` returns an iterator whose `next()` gives `{ value, done }`.

**Explanation:** That's what spread, destructuring and `for...of` use. Generators are the easiest way to implement it.

**Example:**

```js
const range = { from: 1, to: 3, *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i; } };
[...range]; // [1, 2, 3]
```

**Say it like this:** "Implementing `Symbol.iterator` makes my objects work with `for...of` and spread, and a generator makes it a few lines."

---

## 🔴 Level 3 — Advanced

**Q81. What are the execution context and the call stack?**

**Short answer:** Each function call creates an execution context (variables, scope chain, `this`), pushed onto the call stack and popped when it returns.

**Explanation:** Each context has a creation phase (hoisting, memory setup) and an execution phase (running the code). Stack traces show this stack.

**Example:** `main() → loadCalls() → parse()` — if `parse` throws, the stack trace lists all three frames.

**Say it like this:** "Every call pushes a context with its own variables and `this`; the stack is what you see in an error trace."

---

**Q82. Lexical environment vs variable environment?**

**Short answer:** The lexical environment holds `let`, `const` and function bindings for a block; the variable environment holds `var` bindings.

**Explanation:** Each environment links to its outer one, forming the chain closures use to find variables.

**Example:** In `function f() { var a; { let b; } }`, `a` is in f's variable environment, while `b` is in the inner block's lexical environment.

**Say it like this:** "Environments are linked scopes; closures keep a reference to that chain, which is why they can read outer variables later."

---

**Q83. How does garbage collection work in V8?**

**Short answer:** Objects unreachable from the roots are collected. V8 is generational: a fast, frequent young-generation collector and an incremental mark-sweep-compact old generation.

**Explanation:** Most objects die young, so collecting the young generation often is cheap. Long pauses are avoided by doing old-generation work incrementally and concurrently.

**Example:** Temporary arrays created in a render are collected quickly; a cache that keeps growing moves to the old generation and is never freed if still referenced.

**Say it like this:** "GC frees what's unreachable, so leaks are really 'things still referenced'. The fix is always removing the reference."

---

**Q84. What are the common frontend memory leaks?**

**Short answer:** Listeners and intervals never removed, detached DOM nodes still referenced, unbounded caches or arrays, closures holding large data, unclosed sockets or media streams, and SDK instances re-created on every mount.

**Explanation:** Diagnose with heap snapshots: take one, repeat the action, take another, compare, and inspect retainers of growing or "Detached" objects.

**Example:** On a long call, memory grew because audio-level listeners were added on every render and never removed.

**Say it like this:** "Heap snapshots showed thousands of audio-level listeners. Moving the subscription into a `useEffect` with cleanup fixed it."

---

**Q85. How does V8 optimise code?**

**Short answer:** It interprets first (Ignition), then compiles hot code through faster tiers (Sparkplug, Maglev, TurboFan), using hidden classes and inline caches for fast property access.

**Explanation:** Keep object shapes consistent (same properties, same order), avoid `delete` on hot objects, and keep functions monomorphic (same argument types).

**Example:**

```js
function makePoint(x, y) { return { x, y }; }  // consistent shape
const p = makePoint(1, 2); p.z = 3;            // changes shape → slower access
```

**Say it like this:** "V8 rewards predictable code: consistent object shapes and stable types keep hot paths optimised."

---

**Q86. What are the type coercion rules (`ToPrimitive`)?**

**Short answer:** Objects convert via `Symbol.toPrimitive`, then `valueOf`, then `toString`. With `+`, a string on either side means concatenation; other arithmetic converts to numbers.

**Explanation:** This explains puzzles like `[] + {}`. In real code, convert explicitly with `Number()` or `String()`.

**Example:**

```js
[] + {}     // "[object Object]"
'5' - 2     // 3
'5' + 2     // "52"
true + 1    // 2
```

**Say it like this:** "Plus with a string concatenates; other operators convert to numbers. In real code I convert explicitly to avoid surprises."

---

**Q87. What does strict mode change?**

**Short answer:** Silent errors throw, `this` is `undefined` in plain calls, `with` is banned, and duplicate parameter names aren't allowed.

**Explanation:** ES modules and classes are always strict, so modern code gets it automatically.

**Example:**

```js
'use strict';
undeclared = 5;  // ReferenceError instead of creating a global
```

**Say it like this:** "Strict mode turns silent mistakes into errors, and since modules are strict by default, all modern code benefits."

---

**Q88. ES modules vs CommonJS?**

**Short answer:** ESM uses static `import`/`export` with live bindings and supports tree-shaking and top-level await; CommonJS uses dynamic, synchronous `require` with copied values.

**Explanation:** Because ESM imports are static, bundlers can see what's used and drop the rest.

**Example:**

```js
import debounce from 'lodash-es/debounce'; // tree-shakable
const _ = require('lodash');               // whole library
```

**Say it like this:** "ESM imports are static, so bundlers can tree-shake unused code. That's why I prefer libraries that ship ESM."

---

**Q89. What is dynamic import?**

**Short answer:** `import()` loads a module on demand and returns a promise; bundlers put it in a separate chunk.

**Explanation:** It's the basis of code splitting: heavy features load only when needed.

**Example:**

```js
const { Room } = await import('livekit-client'); // loaded when the user reaches pre-join
```

**Say it like this:** "We loaded the video SDK with dynamic import on the pre-join screen, so it never weighed down the dashboard bundle."

---

**Q90. How do modules handle circular dependencies?**

**Short answer:** ESM supports cycles through live bindings, but reading a binding before its module finishes evaluating throws a TDZ error.

**Explanation:** Fix it by moving shared code into a third module or accessing the import lazily inside a function.

**Example:** `a.js` imports `b.js` which imports `a.js` and immediately reads `a`'s exported constant → "Cannot access before initialization". Moving that constant to `constants.js` breaks the cycle.

**Say it like this:** "Circular imports usually signal mixed responsibilities. I extract the shared piece into its own module."

---

**Q91. What are Proxy and Reflect?**

**Short answer:** A Proxy intercepts operations on an object (get, set, has, delete); Reflect provides the default behaviour for each.

**Explanation:** Vue and MobX use proxies for reactivity, and Immer uses them to let you "mutate" a draft safely. Other uses are validation and logging.

**Example:**

```js
const state = new Proxy({}, {
  set(target, key, value) { console.log('set', key, value); return Reflect.set(target, key, value); },
});
state.status = 'connected';
```

**Say it like this:** "Proxies are how Immer gives Redux Toolkit its 'mutable' syntax while still producing immutable updates."

---

**Q92. What are tagged templates?**

**Short answer:** A function placed before a template literal, which receives the string parts and values separately.

**Explanation:** styled-components, `gql` and safe HTML or SQL builders use them to process or escape values.

**Example:**

```js
const safe = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (i < vals.length ? escapeHtml(vals[i]) : ''), '');
safe`<p>${userInput}</p>`;
```

**Say it like this:** "Tagged templates let a library see each interpolated value separately, which is how safe builders escape them."

---

**Q93. What are Web Workers?**

**Short answer:** Separate threads with their own event loop and no DOM access, communicating through `postMessage`.

**Explanation:** Use them for heavy work (parsing big files, computation, encryption, audio processing) so the main thread stays responsive. Transfer `ArrayBuffer`s to avoid copying.

**Example:**

```js
const worker = new Worker(new URL('./parse.worker.js', import.meta.url), { type: 'module' });
worker.postMessage(hugeCsvText);
worker.onmessage = (e) => setRows(e.data);
```

**Say it like this:** "Anything CPU-heavy that would cause a long task goes to a worker, so typing and clicking stay instant."

---

**Q94. `requestAnimationFrame` vs `setTimeout` for animation?**

**Short answer:** `requestAnimationFrame` runs right before the next paint, synced to the display, and pauses in background tabs; `setTimeout` isn't synced to frames.

**Explanation:** rAF is the right place for visual updates and for batching many DOM writes into one per frame.

**Example:**

```js
let raf = 0;
const loop = () => { updateMeter(); raf = requestAnimationFrame(loop); };
raf = requestAnimationFrame(loop);
```

**Say it like this:** "For anything visual, like a mic level meter, I use rAF so it updates exactly once per frame."

---

**Q95. What are `requestIdleCallback`, `scheduler.postTask` and `scheduler.yield`?**

**Short answer:** APIs for scheduling non-urgent work: idle-time callbacks, prioritised tasks, and yielding inside long tasks so input can be handled.

**Explanation:** Yielding regularly in long work improves INP. Fall back to `setTimeout(…, 0)` where they're unsupported.

**Example:**

```js
const yieldToMain = () => globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r, 0));
async function processAll(items) {
  let deadline = performance.now() + 50;
  for (const item of items) {
    process(item);
    if (performance.now() > deadline) { await yieldToMain(); deadline = performance.now() + 50; }
  }
}
```

**Say it like this:** "I break long work into ~50 ms slices and yield between them, so clicks and typing never wait behind it."

---

**Q96. Which Observer APIs should you know?**

**Short answer:** `IntersectionObserver` (visibility), `ResizeObserver` (element size), `MutationObserver` (DOM changes) and `PerformanceObserver` (performance entries).

**Explanation:** They replace polling and scroll listeners with efficient callbacks.

**Example:**

```js
const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: '200px' });
io.observe(sentinel);
```

**Say it like this:** "IntersectionObserver powers infinite scroll and pausing off-screen video tiles without any scroll listeners."

---

**Q97. How do browser tabs communicate with each other?**

**Short answer:** `BroadcastChannel`, the `storage` event, a `SharedWorker`, or service worker messages.

**Explanation:** Typical uses: log out all tabs at once, sync preferences, and elect one leader tab to own a WebSocket.

**Example:**

```js
const channel = new BroadcastChannel('auth');
channel.postMessage({ type: 'logout' });
channel.onmessage = (e) => { if (e.data.type === 'logout') redirectToLogin(); };
```

**Say it like this:** "BroadcastChannel makes logout instant across tabs, which matters on shared clinic computers."

---

**Q98. How do you use `postMessage` securely?**

**Short answer:** Check `event.origin` against an allowlist, validate the message shape, and always send with an exact `targetOrigin`.

**Explanation:** Any window can post to you, so unchecked messages are an injection point. Sending with `'*'` can leak data to whatever origin is loaded.

**Example:**

```js
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://widget.partner.com') return;
  if (typeof e.data?.type !== 'string') return;
  handle(e.data);
});
```

**Say it like this:** "Every message handler checks the origin and validates the payload, and I never send sensitive data to `'*'`."

---

**Q99. What is the Streams API?**

**Short answer:** `ReadableStream`, `TransformStream` and `TextDecoderStream` let you process data piece by piece as it arrives, with backpressure.

**Explanation:** You don't wait for the whole response, which is ideal for LLM tokens or large downloads.

**Example:**

```js
const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
for (;;) { const { value, done } = await reader.read(); if (done) break; append(value); }
```

**Say it like this:** "Streams let me show AI tokens as they arrive instead of waiting for the full response."

---

**Q100. What can't `structuredClone` copy?**

**Short answer:** Functions, DOM nodes, and class identity (instances come back as plain objects); older runtimes can't clone Errors.

**Explanation:** It handles Dates, Maps, Sets, typed arrays and cycles, which covers most data.

**Example:**

```js
structuredClone({ fn: () => 1 });  // DataCloneError
structuredClone(new Map([[1, 'a']])); // works
```

**Say it like this:** "`structuredClone` is my default deep copy for data, but it won't copy functions or keep class prototypes."

---

**Q101. Which `Intl` APIs should you know?**

**Short answer:** `DateTimeFormat`, `NumberFormat`, `RelativeTimeFormat`, `PluralRules`, `ListFormat`, `Collator` and `Segmenter`.

**Explanation:** They give locale-aware formatting with no library, which matters for multilingual products.

**Example:**

```js
new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(1234.5); // ₹1,234.50
new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-3, 'minute');          // "3 minutes ago"
```

**Say it like this:** "I use `Intl` for dates, currency and 'time ago' instead of shipping a date library."

---

**Q102. How do you handle dates and time zones?**

**Short answer:** Store and send UTC ISO strings, and format for display with `Intl.DateTimeFormat` and an explicit `timeZone`.

**Explanation:** A `Date` is milliseconds since 1970 UTC; display converts to local time. Parsing strings without an offset is ambiguous. Temporal fixes most `Date` problems.

**Example:**

```js
new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: clinic.tz })
  .format(new Date('2026-10-04T05:00:00Z'));
```

**Say it like this:** "UTC everywhere in data, and time zones only at display, using the user's or the clinic's configured zone."

---

**Q103. What are good error-handling patterns?**

**Short answer:** Custom error classes, `cause` for wrapping, global handlers reporting to Sentry, React error boundaries, and friendly user messages.

**Explanation:** Typed errors let the UI branch (401 vs 500); `cause` keeps the original stack when you add context.

**Example:**

```js
class HttpError extends Error {
  constructor(status, message, options) { super(message, options); this.name = 'HttpError'; this.status = status; }
}
try { await joinRoom(); } catch (err) { throw new Error('Join failed', { cause: err }); }
```

**Say it like this:** "Users get a clear message and a retry; logs get the full typed error with its cause."

---

## ⚙️ Polyfills and Implementations (Very Frequently Asked)

**What is a polyfill?** Code that implements a built-in feature yourself, either for older browsers or to prove you understand how it works. Interviewers use these to check your grasp of `this`, closures, prototypes and promises. Explain what the original does, write it, then mention edge cases.

**Q104. Implement `Array.prototype.map`.**

**Short answer:** Loop over the array, call the callback with `(element, index, array)` and `thisArg`, and collect the results in a new array.

**Explanation:** The real `map` skips holes in sparse arrays (`i in this`), validates the callback, and never mutates the original.

**Example:**

```js
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this);
  }
  return result;
};
[1, 2, 3].myMap((x) => x * 2); // [2, 4, 6]
```

**Say it like this:** "It's a loop that calls the callback with element, index and array, uses `thisArg` for `this`, skips holes, and returns a new array."

---

**Q105. Implement `Array.prototype.filter`.**

**Short answer:** Loop, call the predicate, and push the elements for which it returns truthy into a new array.

**Explanation:** Like `map`, it skips holes and supports `thisArg`. The result can be shorter than the input.

**Example:**

```js
Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};
```

**Say it like this:** "Filter is a loop that keeps elements where the predicate is truthy, returning a new array."

---

**Q106. Implement `Array.prototype.reduce`.**

**Short answer:** Start from the initial value (or the first element), and for each element set `acc = callback(acc, element, index, array)`.

**Explanation:** Use rest parameters to tell "no initial value" from an initial value of `undefined`. An empty array with no initial value must throw.

**Example:**

```js
Array.prototype.myReduce = function (callback, ...initial) {
  let i = 0, acc;
  if (initial.length) acc = initial[0];
  else {
    while (i < this.length && !(i in this)) i++;
    if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i++];
  }
  for (; i < this.length; i++) if (i in this) acc = callback(acc, this[i], i, this);
  return acc;
};
```

**Say it like this:** "The tricky part is the initial value: with none, the first element becomes the accumulator, and an empty array throws."

---

**Q107. Implement `Array.prototype.flat`.**

**Short answer:** Recursively concatenate nested arrays up to the given depth; an iterative stack version handles any depth without recursion limits.

**Explanation:** The default depth is 1; `Infinity` flattens everything.

**Example:**

```js
function flat(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, v) => acc.concat(Array.isArray(v) ? flat(v, depth - 1) : v), [])
    : arr.slice();
}
function flatDeep(arr) {
  const stack = [...arr], out = [];
  while (stack.length) { const v = stack.pop(); Array.isArray(v) ? stack.push(...v) : out.push(v); }
  return out.reverse();
}
```

**Say it like this:** "Recursion with a depth counter, or an explicit stack for unlimited depth without stack overflow."

---

**Q108. Implement `Function.prototype.bind` (including support for `new`).**

**Short answer:** Return a function that calls the original with the bound `this` and preset arguments, unless it's called with `new`.

**Explanation:** When called with `new`, `this` is the new instance, so the bound context is ignored. Linking the prototype keeps `instanceof` working.

**Example:**

```js
Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  function bound(...args) {
    return fn.apply(this instanceof bound ? this : ctx, [...preset, ...args]);
  }
  bound.prototype = Object.create(fn.prototype);
  return bound;
};
```

**Say it like this:** "Bind is a closure over the function, the context and preset args. The detail most people miss is that `new` overrides the bound `this`."

---

**Q109. Implement `call` and `apply`.**

**Short answer:** Temporarily attach the function to the context object under a unique Symbol key, call it as a method, then delete it.

**Explanation:** Calling it as `ctx[key]()` uses the "left of the dot" rule to set `this`. Primitives are boxed with `Object()`.

**Example:**

```js
Function.prototype.myCall = function (ctx = globalThis, ...args) {
  const key = Symbol('fn');
  ctx = Object(ctx);
  ctx[key] = this;
  try { return ctx[key](...args); } finally { delete ctx[key]; }
};
Function.prototype.myApply = function (ctx, args = []) { return this.myCall(ctx, ...args); };
```

**Say it like this:** "The trick is making the function a temporary method of the object, so the normal method-call rule sets `this`."

---

**Q110. Implement `Promise.all`, `allSettled`, `race` and `any`.**

**Short answer:** Wrap each input with `Promise.resolve`, track results by index, and settle the outer promise according to each combinator's rule.

**Explanation:** Results must keep input order, an empty array resolves immediately for `all`, and `any` rejects with an `AggregateError` when everything fails.

**Example:**

```js
const all = (ps) => new Promise((resolve, reject) => {
  const results = []; let done = 0;
  if (!ps.length) return resolve(results);
  ps.forEach((p, i) => Promise.resolve(p).then((v) => { results[i] = v; if (++done === ps.length) resolve(results); }, reject));
});
const allSettled = (ps) => Promise.all(ps.map((p) => Promise.resolve(p).then(
  (value) => ({ status: 'fulfilled', value }), (reason) => ({ status: 'rejected', reason }))));
const race = (ps) => new Promise((res, rej) => ps.forEach((p) => Promise.resolve(p).then(res, rej)));
const any = (ps) => new Promise((resolve, reject) => {
  const errors = []; let failed = 0;
  if (!ps.length) return reject(new AggregateError([], 'All promises were rejected'));
  ps.forEach((p, i) => Promise.resolve(p).then(resolve, (e) => {
    errors[i] = e; if (++failed === ps.length) reject(new AggregateError(errors, 'All promises were rejected'));
  }));
});
```

**Say it like this:** "The key details are preserving order by index, handling non-promise values with `Promise.resolve`, and the empty-array edge case."

---

**Q111. Implement a minimal Promise (asked at senior level).**

**Short answer:** Track state, value and handlers; settle only once; `then` returns a new promise whose callbacks run as microtasks; adopt returned thenables.

**Explanation:** These four rules are what make chaining and ordering work exactly like native promises.

**Example:**

```js
class MyPromise {
  #state = 'pending'; #value; #handlers = [];
  constructor(executor) {
    const settle = (state, value) => {
      if (this.#state !== 'pending') return;
      if (state === 'fulfilled' && value && typeof value.then === 'function') {
        return value.then((v) => settle('fulfilled', v), (e) => settle('rejected', e));
      }
      this.#state = state; this.#value = value; this.#handlers.forEach((h) => h());
    };
    try { executor((v) => settle('fulfilled', v), (e) => settle('rejected', e)); } catch (e) { settle('rejected', e); }
  }
  then(onF, onR) {
    return new MyPromise((resolve, reject) => {
      const run = () => queueMicrotask(() => {
        const cb = this.#state === 'fulfilled' ? onF : onR;
        if (typeof cb !== 'function') return (this.#state === 'fulfilled' ? resolve : reject)(this.#value);
        try { resolve(cb(this.#value)); } catch (e) { reject(e); }
      });
      this.#state === 'pending' ? this.#handlers.push(run) : run();
    });
  }
  catch(onR) { return this.then(undefined, onR); }
  finally(cb) { return this.then((v) => { cb(); return v; }, (e) => { cb(); throw e; }); }
}
```

**Say it like this:** "A promise settles once, `then` returns a new promise for chaining, callbacks are always async microtasks, and returned thenables are adopted."

---

**Q112. Implement a deep clone that handles cycles, Date, Map and Set.**

**Short answer:** Recurse through the value, use a WeakMap of already-copied objects to handle cycles, and special-case built-ins.

**Explanation:** Primitives return as-is; Date, RegExp, Map and Set need their own constructors; `Reflect.ownKeys` copies symbol keys too.

**Example:**

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) { const m = new Map(); seen.set(value, m); value.forEach((v, k) => m.set(deepClone(k, seen), deepClone(v, seen))); return m; }
  if (value instanceof Set) { const s = new Set(); seen.set(value, s); value.forEach((v) => s.add(deepClone(v, seen))); return s; }
  const out = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, out);
  for (const key of Reflect.ownKeys(value)) out[key] = deepClone(value[key], seen);
  return out;
}
```

**Say it like this:** "In real code I'd use `structuredClone`, but the key ideas are recursion, a WeakMap for cycles, and special cases for built-ins."

---

**Q113. Implement deep equality.**

**Short answer:** Use `Object.is` for primitives and identical references, then compare prototypes, key counts and each key recursively.

**Explanation:** `Object.is` handles `NaN`. Checking prototypes stops an array equalling an object with the same keys.

**Example:**

```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const ka = Reflect.ownKeys(a), kb = Reflect.ownKeys(b);
  return ka.length === kb.length && ka.every((k) => deepEqual(a[k], b[k]));
}
```

**Say it like this:** "Identity first, then same prototype, same keys, and recursive comparison of each value."

---

**Q114. Implement memoize.**

**Short answer:** Wrap the function with a Map cache keyed by the arguments; return the cached result when the key exists.

**Explanation:** For async functions, cache the promise (so concurrent calls share one request) and delete it on rejection. Add an LRU limit to avoid unbounded growth.

**Example:**

```js
function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {
    const key = keyFn(...args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}
```

**Say it like this:** "Memoize is a closure over a cache. For async functions I cache the promise to dedupe in-flight calls, and evict on errors."

---

**Q115. Implement `once`.**

**Short answer:** A closure with a `called` flag that runs the function the first time and returns the cached result afterwards.

**Explanation:** It's useful for one-time initialisation, like setting up an SDK or analytics.

**Example:**

```js
const once = (fn) => {
  let called = false, result;
  return function (...args) { if (!called) { called = true; result = fn.apply(this, args); } return result; };
};
const init = once(() => console.log('SDK initialised'));
init(); init(); // logs once
```

**Say it like this:** "A flag in a closure guarantees the function body runs exactly once."

---

**Q116. Implement infinite currying: `sum(1)(2)(3)()`.**

**Short answer:** Return a function that adds the next argument, and return the total when called with no argument.

**Explanation:** Each call creates a new closure holding the running total.

**Example:**

```js
const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
sum(1)(2)(3)(); // 6
```

**Say it like this:** "Each call returns a new function remembering the running total, and an empty call ends the chain."

---

**Q117. Implement an event emitter (on, off, once, emit).**

**Short answer:** A Map from event names to Sets of handlers; `on` adds and returns an unsubscribe function, `emit` calls a copy of the handlers.

**Explanation:** Copying before iterating keeps it safe if a handler unsubscribes during emit. `once` wraps the handler to remove itself.

**Example:**

```js
class Emitter {
  #map = new Map();
  on(e, fn) { if (!this.#map.has(e)) this.#map.set(e, new Set()); this.#map.get(e).add(fn); return () => this.off(e, fn); }
  off(e, fn) { this.#map.get(e)?.delete(fn); }
  once(e, fn) { const off = this.on(e, (...a) => { off(); fn(...a); }); return off; }
  emit(e, ...a) { [...(this.#map.get(e) ?? [])].forEach((fn) => fn(...a)); }
}
```

**Say it like this:** "Returning an unsubscribe function from `on` makes cleanup in React effects trivial, the same pattern LiveKit's event API uses."

---

**Q118. Implement a `getElementsByClassName`-style DOM traversal.**

**Short answer:** Walk the element tree recursively (or with a stack) and collect elements whose `classList` contains the class.

**Explanation:** Use `children` (elements only), not `childNodes`, which includes text nodes.

**Example:**

```js
function byClass(root, className) {
  const out = [];
  (function walk(node) {
    for (const child of node.children) { if (child.classList.contains(className)) out.push(child); walk(child); }
  })(root);
  return out;
}
```

**Say it like this:** "It's a depth-first traversal of the DOM tree, which shows trees aren't just an algorithms topic for frontend work."

---

**Q119. Implement `setInterval` using `setTimeout`, correcting for drift.**

**Short answer:** Schedule each tick with `setTimeout`, measure how late it ran, and shorten the next delay to compensate.

**Explanation:** `setInterval` drifts over time and can stack callbacks when they're slow. A call timer showing "12:34" must stay accurate.

**Example:**

```js
function interval(fn, ms) {
  let expected = performance.now() + ms, id;
  const step = () => {
    const drift = performance.now() - expected;
    fn(); expected += ms;
    id = setTimeout(step, Math.max(0, ms - drift));
  };
  id = setTimeout(step, ms);
  return () => clearTimeout(id);
}
```

**Say it like this:** "I chain timeouts and subtract the drift, so the timer stays aligned with real time."

---

**Q120. Implement a concurrency-limited task runner.**

**Short answer:** Start N workers that each pull the next task from a shared index until none are left.

**Explanation:** It keeps exactly N requests in flight, which respects rate limits better than `Promise.all` over hundreds of requests. Results keep their original order.

**Example:**

```js
async function runWithLimit(tasks, limit) {
  const results = []; let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      try { results[i] = { ok: true, value: await tasks[i]() }; }
      catch (e) { results[i] = { ok: false, error: e }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

**Say it like this:** "N workers pulling from a shared index keeps exactly N requests in flight, which is gentler on the server."

---

**Q121. Implement `get(obj, path, default)`.**

**Short answer:** Split the path into keys (handling `[0]` brackets), walk the object, and return the default if you hit null or undefined.

**Explanation:** Optional chaining covers most cases now, but string paths are still common in form libraries and table column configs.

**Example:**

```js
const get = (obj, path, def) => {
  const keys = Array.isArray(path) ? path : path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (const k of keys) { if (cur == null) return def; cur = cur[k]; }
  return cur === undefined ? def : cur;
};
get({ call: { participants: [{ name: 'Maria' }] } }, 'call.participants[0].name'); // "Maria"
```

**Say it like this:** "Normalise the path into keys, walk safely, and fall back to the default on any missing step."

---

**Q122. Implement a classnames helper.**

**Short answer:** Accept strings, arrays and objects; keep strings, recurse into arrays, keep object keys with truthy values, and join with spaces.

**Explanation:** It's what `clsx` does, and Tailwind's `cn()` adds conflict resolution on top.

**Example:**

```js
const cx = (...args) => args.flatMap((a) =>
  typeof a === 'string' ? a : Array.isArray(a) ? cx(...a) : a && typeof a === 'object' ? Object.keys(a).filter((k) => a[k]) : []
).filter(Boolean).join(' ');
cx('btn', { 'btn--active': true, 'btn--disabled': false }, ['lg']); // "btn btn--active lg"
```

**Say it like this:** "It normalises mixed inputs into one class string, which is exactly what `clsx` does under my `cn()` helper."

---

## 🧠 Output Questions (Predict Before Reading the Answer)

**How to solve these:** run the code like the engine: synchronous code first, then all microtasks, then one macrotask. Track hoisting and `this` carefully, and say your reasoning out loud.

**Q123. What does this print?**

**Short answer:** `A F C E D B`

**Explanation:** A and F are synchronous. The microtask queue holds C and E; running C queues D, so the order is C, E, D. B is a macrotask, so it runs last.

**Example:**

```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C')).then(() => console.log('D'));
queueMicrotask(() => console.log('E'));
console.log('F');
```

**Say it like this:** "Sync first: A, F. Then microtasks in order: C and E, and C's chain adds D at the end. The timeout B comes last."

---

**Q124. What does this print?**

**Short answer:** `3 1 4 2`

**Explanation:** An async function runs synchronously until its first `await`; the rest becomes a microtask that runs after the current synchronous code.

**Example:**

```js
async function f() { console.log(1); await null; console.log(2); }
console.log(3); f(); console.log(4);
```

**Say it like this:** "3 is sync, then f starts and logs 1, the await pauses it, 4 logs, and 2 runs as a microtask."

---

**Q125. What does this print?**

**Short answer:** `x undefined`

**Explanation:** The regular method gets `this` from the object. The arrow function uses the surrounding module `this`, which is undefined.

**Example:**

```js
const obj = { name: 'x', regular() { return this.name; }, arrow: () => this?.name };
console.log(obj.regular(), obj.arrow());
```

**Say it like this:** "Arrow functions don't get `this` from the object they're defined in, so `arrow` sees the outer `this`."

---

**Q126. What do these print?**

**Short answer:** `"string"`, `[1, 10, 2]`, `[1, 2, 3]`, `[1, NaN, NaN]`.

**Explanation:** `typeof 1` is "number" and `typeof "number"` is "string". Default `sort` compares strings. `map` passes `(value, index)`, so `parseInt('2', 1)` and `parseInt('3', 2)` are invalid.

**Example:**

```js
console.log(typeof typeof 1);
console.log([10, 1, 2].sort());
console.log(['1', '2', '3'].map(Number));
console.log(['1', '2', '3'].map(parseInt));
```

**Say it like this:** "Default sort is lexicographic, so numbers need a comparator, and `map(parseInt)` breaks because the index becomes the radix."

---

**Q127. What does this print?**

**Short answer:** `2`

**Explanation:** `b` points to the original object, which was mutated to `n: 2`. Reassigning `a` to a new object doesn't affect `b`.

**Example:**

```js
let a = { n: 1 }; let b = a; a.n = 2; a = { n: 3 };
console.log(b.n);
```

**Say it like this:** "Mutation through `a` is visible through `b`, but rebinding `a` just points `a` elsewhere."

---

**Q128. What does this print?**

**Short answer:** `hoisted undefined`

**Explanation:** Function declarations are fully hoisted; `var` is hoisted with the value `undefined`.

**Example:**

```js
console.log(foo()); console.log(bar);
function foo() { return 'hoisted'; }
var bar = 1;
```

**Say it like this:** "The function is callable before its line; the `var` exists but is still undefined."

---

**Q129. What does this print?**

**Short answer:** `a 0 '' undefined`

**Explanation:** `||` skips falsy values; `??` skips only null and undefined; `&&` returns the first falsy value; `?.` on null returns undefined.

**Example:**

```js
console.log(0 || 'a', 0 ?? 'a', '' && 'b', null?.x);
```

**Say it like this:** "The difference between `||` and `??` is exactly the zero case: `??` keeps it."

---

**Q130. What does this print?**

**Short answer:** `handled`

**Explanation:** `.catch` returns a promise fulfilled with its handler's return value, so the next `.then` receives `'handled'`.

**Example:**

```js
const p = Promise.reject(new Error('x'));
p.catch(() => 'handled').then((v) => console.log(v));
```

**Say it like this:** "A catch that returns a value recovers the chain, so the following then sees that value."

---

**Q131. What does this print?**

**Short answer:** `0 1 2`

**Explanation:** `bind({ i })` creates a new object each iteration, capturing the current value of `i`, even though `i` is a `var`.

**Example:**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () { console.log(this.i); }.bind({ i }), 0);
}
```

**Say it like this:** "The object `{ i }` is created at bind time, so each callback has its own snapshot."

---

**Q132. What do these print?**

**Short answer:** `true`, then `false true`, then `0.30000000000000004`.

**Explanation:** `![]` is `false`, so `[] == false`; both become `0`. `NaN` isn't equal to itself, but `Object.is` says it is. Floating-point can't represent 0.1 exactly.

**Example:**

```js
console.log([] == ![]);
console.log(NaN === NaN, Object.is(NaN, NaN));
console.log(0.1 + 0.2);
```

**Say it like this:** "These show why I use `===`, `Number.isNaN` and integer cents in real code."

---

## 🧩 Level 4 — Scenario-Based

**Q133. A search box fires a request on every keystroke and sometimes shows stale results.**

**Short answer:** Debounce the input, abort the previous request, and cache results.

**Explanation:** There are two problems: too many requests, and a race condition where a slow response for "ma" overwrites the result for "maria". Debouncing fixes the first; aborting (or ignoring out-of-date responses) fixes the second.

**Example:**

```js
let controller;
async function search(q) {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
    render(await res.json());
  } catch (e) { if (e.name !== 'AbortError') showError(e); }
}
const onInput = debounce((e) => search(e.target.value), 250);
```

**Say it like this:** "Debouncing reduces requests, but it doesn't fix the race. I abort the previous request, so only the latest query can update the UI."

---

**Q134. The page gets slower the longer a call runs.**

**Short answer:** Suspect a memory leak or unbounded growth, confirm with heap snapshots, then clean up and cap.

**Explanation:** Usual causes are listeners added every render, intervals never cleared, ever-growing arrays (chat, audio samples) and thousands of DOM nodes.

**Example:** Cap chat history at the last 200 messages, virtualise the list, and move subscriptions into effects with cleanup.

**Say it like this:** "I'd compare heap snapshots over time, find what keeps growing, then add cleanup, caps on buffers and virtualisation."

---

**Q135. Clicking "Submit" twice creates two records.**

**Short answer:** Disable the button while pending, guard with an in-flight promise, and send an idempotency key the server deduplicates on.

**Explanation:** Client guards stop most double clicks, but retries and network duplicates need the server-side idempotency key.

**Example:**

```js
let inFlight;
function submit(data) {
  inFlight ??= api('/scorecards', { method: 'POST', body: JSON.stringify(data),
    headers: { 'Idempotency-Key': data.clientId } }).finally(() => (inFlight = null));
  return inFlight;
}
```

**Say it like this:** "The UI prevents double clicks, but only an idempotency key makes duplicates impossible across retries."

---

**Q136. Parsing a 50 MB JSON file of call analytics freezes the UI.**

**Short answer:** Parse it in a Web Worker, or better, don't send 50 MB to the browser: paginate or aggregate on the server.

**Explanation:** `JSON.parse` on 50 MB is a multi-second long task on the main thread. The best fix is reducing the data.

**Example:** Replace `GET /analytics/raw` with `GET /analytics/summary?range=30d`, which returns the 2 KB of aggregates the charts actually show.

**Say it like this:** "A worker hides the freeze, but the real fix is sending only what the UI displays."

---

**Q137. You need to call 200 APIs, but the server allows only 5 concurrent requests.**

**Short answer:** Use a concurrency-limited pool of 5, with backoff on HTTP 429 that respects `Retry-After`.

**Explanation:** `Promise.all` over 200 would fire everything at once and get rate-limited.

**Example:** `await runWithLimit(ids.map((id) => () => retry(() => api(`/calls/${id}`))), 5);` (see Q120 and Q78).

**Say it like this:** "A pool of five workers plus retry with backoff stays within the limit and still finishes quickly."

---

**Q138. Users in different time zones see the wrong call times.**

**Short answer:** Store and send UTC ISO strings, and format with `Intl.DateTimeFormat` and an explicit time zone.

**Explanation:** Parsing strings without an offset (`'2026-10-04 10:00'`) is interpreted as local time and differs between machines.

**Example:**

```js
new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone: clinic.timeZone }).format(new Date(call.startedAt));
```

**Say it like this:** "UTC in data, time zone only at display, using the viewer's or the clinic's configured zone."

---

**Q139. Billing totals show floating-point errors.**

**Short answer:** Store money as integer minor units (paise or cents) and format only for display.

**Explanation:** Binary floating point can't represent 0.1 exactly, so sums drift. Integers are exact; a decimal library is the alternative.

**Example:**

```js
const totalPaise = items.reduce((s, i) => s + i.pricePaise * i.qty, 0);
new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPaise / 100);
```

**Say it like this:** "Money is always integers in the smallest unit; decimals appear only when formatting."

---

**Q140. An event handler runs, but `this` is undefined.**

**Short answer:** The method was detached when passed as a callback; fix it with an arrow wrapper, `bind` or a class-field arrow.

**Explanation:** Passing `obj.method` passes only the function, so the call has no object to the left of the dot.

**Example:**

```js
button.addEventListener('click', player.stop);           // this is undefined/button
button.addEventListener('click', () => player.stop());   // fixed
```

**Say it like this:** "It's the detached-method problem; an arrow wrapper keeps the method call on its object."

---

**Q141. An `async` callback inside `forEach` doesn't wait before the next line runs.**

**Short answer:** `forEach` ignores returned promises; use `for...of` with `await` or `await Promise.all(items.map(...))`.

**Explanation:** Choose sequential when order or rate limits matter, parallel when the operations are independent.

**Example:**

```js
for (const c of calls) await archive(c);           // sequential
await Promise.all(calls.map((c) => archive(c)));   // parallel
```

**Say it like this:** "`forEach` doesn't await. I pick `for...of` or `Promise.all` depending on whether order matters."

---

**Q142. A third-party script sometimes throws and breaks your app's startup.**

**Short answer:** Load it async, wrap your integration in `try/catch`, put it behind a feature flag, and filter its errors from monitoring.

**Explanation:** The app must work even if the script never loads. Isolating it means a vendor outage isn't your outage.

**Example:**

```js
try { window.chatWidget?.init({ tenant }); } catch (e) { reportNonFatal(e); }
```

**Say it like this:** "Third-party code is untrusted for reliability too. It loads async, sits behind a flag and can never block our startup."

---

## 🎯 From Your Resume

**Q143. "How do you consume an SSE stream that needs a bearer token?"**

**Short answer:** `EventSource` can't send custom headers, so either use cookie auth or read the stream with `fetch` and a body reader.

**Explanation:** The fetch approach also supports POST bodies and cancellation. Split the decoded text on blank lines to get complete SSE events, keeping any partial event in a buffer.

**Example:**

```js
async function streamChat(body, onToken, signal) {
  const res = await fetch('/api/compliance-chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), credentials: 'include', signal,
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const events = buffer.split('\n\n'); buffer = events.pop() ?? '';
    for (const evt of events) {
      const data = evt.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart()).join('\n');
      if (data === '[DONE]') return;
      if (data) onToken(data);
    }
  }
}
```

**Say it like this:** "`EventSource` can't set an Authorization header, so for the compliance chat I used fetch with a stream reader, buffering partial events, with an AbortSignal for the Stop button."

---

**Q144. "How do you avoid memory leaks with LiveKit and media streams?"**

**Short answer:** Strict cleanup on leave or unmount: disconnect the room, remove listeners, stop local tracks, detach media elements, clear timers and revoke object URLs.

**Explanation:** Stopping tracks is what turns off the camera light. Keeping the Room outside React state stops re-renders creating duplicate connections.

**Example:**

```js
return () => {
  room.removeAllListeners();
  room.localParticipant.trackPublications.forEach((p) => p.track?.stop());
  room.disconnect();
  clearTimeout(reconnectTimer);
};
```

**Say it like this:** "Every resource I open in an effect is closed in its cleanup: listeners, tracks, the room connection and timers."

---

**Q145. "How did you implement reconnect logic on the client?"**

**Short answer:** Rely on the SDK's resume first, show a non-blocking banner, then rejoin with backoff and a fresh token, and give up after N attempts with a clear Rejoin button.

**Explanation:** Brief blips are handled by an ICE restart. Full drops need a new connection; jitter prevents synchronized retries. Every attempt is logged, which is how the 99% figure was measured.

**Example:**

```js
room.on(RoomEvent.Reconnecting, () => setBanner('Reconnecting…'));
room.on(RoomEvent.Reconnected, () => setBanner(null));
room.on(RoomEvent.Disconnected, () => rejoinWithBackoff({ maxAttempts: 5, getToken: fetchToken }));
```

**Say it like this:** "Resume first, then rejoin with backoff and a fresh token, with the video kept mounted and a clear way out if it fails. We logged every attempt, which is how we measured 99% reconnect success."

---

**Q146. "How did Celery workers give you 5x throughput?" (a JavaScript-adjacent follow-up)**

**Short answer:** The pipeline was I/O-bound, so processing chunks concurrently across more workers overlapped the waiting time.

**Explanation:** Sequential per-chunk API calls wasted time waiting on transcription and the LLM. It's the same principle as `Promise.all` vs sequential awaits. Measured as calls processed per hour on the same workload.

**Example:** 10 chunks × 4 s sequentially = 40 s per call; with concurrency 5 and batching, the same call finishes in about 8 s.

**Say it like this:** "Most time was waiting on APIs, not CPU. Overlapping that waiting with parallel workers multiplied throughput, the same idea as `Promise.all` in JavaScript."
