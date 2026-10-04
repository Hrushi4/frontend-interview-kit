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

## 🟢 Level 1 — Basics

**Q1. What is JavaScript and where does it run?**

**Short answer:** A dynamic, single-threaded, garbage-collected language. It runs in browsers (V8, SpiderMonkey, JavaScriptCore) and on servers (Node.js, Deno, Bun).

**Say it like this:** "JavaScript is the language of the browser. It's dynamically typed and runs on a single thread, with an event loop that handles async work. I use it on both sides: React in the browser and Node or NestJS on the server."

---

**Q2. What are the data types?**

**Short answer:** Seven primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `null` and `symbol`. Everything else is an `object`, including arrays, functions, dates, maps and sets.

**Explanation:** Primitives are immutable and copied by value. Objects are mutable and shared by reference.

**Example:**

```js
let s = 'hi'; let t = s; t += '!';   // s is still 'hi'
let o = { n: 1 }; let p = o; p.n = 2; // o.n is now 2 — same object
```

---

**Q3. Which `typeof` results should you remember?**

**Short answer:**

```js
typeof null            // 'object'   (a famous historical bug)
typeof []              // 'object'   → use Array.isArray([])
typeof function(){}    // 'function'
typeof NaN             // 'number'
typeof undefined       // 'undefined'
typeof undeclaredVar   // 'undefined' (doesn't throw)
typeof 10n             // 'bigint'
typeof Symbol()        // 'symbol'
```

**Say it like this:** "`typeof` is fine for primitives, but it says 'object' for `null` and arrays. I use `Array.isArray` for arrays and `x === null` for null."

---

**Q4. `null` vs `undefined`?**

**Short answer:** `undefined` means "not set yet": a declared variable with no value, a missing property, or a function with no return. `null` means "intentionally empty", set on purpose by a developer.

**Example:**

```js
let a;               // undefined
const o = {}; o.x;   // undefined
let user = null;     // explicitly "no user"

null == undefined    // true  (loose equality treats them as equal)
null === undefined   // false
```

---

**Q5. `var` vs `let` vs `const`?**

| | Scope | Hoisting | Re-declare | Re-assign |
|---|---|---|---|---|
| `var` | function | hoisted, set to `undefined` | yes | yes |
| `let` | block `{ }` | hoisted, but in the TDZ | no | yes |
| `const` | block `{ }` | hoisted, but in the TDZ | no | no (but object contents can change) |

**Example:**

```js
if (true) { var a = 1; let b = 2; }
console.log(a); // 1   — var ignores block scope
console.log(b); // ReferenceError

const user = { name: 'A' };
user.name = 'B';     // allowed — mutating the object
user = {};           // TypeError — reassigning the variable
```

**Say it like this:** "I use `const` by default, `let` when I need to reassign, and never `var`. `var` is function-scoped and leaks out of blocks, which causes bugs like the classic loop closure problem."

---

**Q6. What is the Temporal Dead Zone (TDZ)?**

**Short answer:** The period between entering a block and the line where a `let` or `const` variable is declared. Accessing the variable during that period throws a `ReferenceError`.

```js
{
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 5;
}
```

**Explanation:** `let` and `const` *are* hoisted, since the engine knows about them, but they aren't initialised. This stops you from using a variable before it's declared, which `var` silently allowed.

---

**Q7. What is hoisting?**

**Short answer:** Before code runs, JavaScript registers all declarations in their scope, as if they were moved to the top. What's available depends on the type of declaration.

| Declaration | Before its line, it is… |
|---|---|
| `function foo() {}` | fully usable (callable) |
| `var x` | `undefined` |
| `let` / `const` / `class` | in the TDZ, so accessing it throws |
| `const f = () => {}` | follows `const` rules (TDZ) |

```js
sayHi();                  // works
function sayHi() { console.log('hi'); }

greet();                  // TypeError: greet is not a function (var greet = undefined)
var greet = function () {};
```

---

**Q8. `==` vs `===`?**

**Short answer:** `===` compares without converting types (strict equality). `==` converts types first (loose equality), which gives surprising results.

```js
'1' == 1          // true
0 == ''           // true
null == 0         // false
null == undefined // true
'1' === 1         // false
```

**Say it like this:** "I always use `===`. The only `==` I allow is `x == null`, a neat shortcut that checks for both null and undefined."

---

**Q9. What are truthy and falsy values?**

**Short answer:** The falsy values are `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN`. *Everything* else is truthy, including `'0'`, `'false'`, `[]` and `{}`.

**Example (a common bug):**

```js
const count = 0;
if (count) { … }         // skipped! 0 is falsy
{count && <Badge />}      // React renders "0" on screen
{count > 0 && <Badge />}  // correct
```

---

**Q10. What are template literals?**

**Short answer:** Strings in backticks that support `${expression}` interpolation and multiple lines. *Tagged templates* (`` gql`query…` ``, `` styled.div`…` ``) pass the parts to a function.

```js
const msg = `Hello ${user.name}, you have ${calls.length} calls`;
```

---

**Q11. Function declaration vs function expression vs arrow function?**

**Short answer:**

- **Declaration** (`function f() {}`) is hoisted, so you can call it before its line.
- **Expression** (`const f = function () {}`) isn't usable before its line.
- **Arrow** (`const f = () => {}`) is a concise expression. It has no own `this` or `arguments`, no `prototype`, and can't be used with `new`.

**Say it like this:** "I use arrow functions for callbacks, because they inherit `this` and are concise. I use declarations for top-level utilities, where hoisting and a name in stack traces help."

---

**Q12. What are default parameters, rest and spread?**

```js
function join(room, role = 'guest', ...extras) {}   // default + rest
const merged = { ...defaults, ...overrides };        // spread objects (later wins)
const copy = [...arr];                               // shallow copy
Math.max(...nums);                                   // spread into arguments
```

**Short answer:** A default parameter applies when the argument is `undefined`. Rest *collects* the remaining items into an array, and spread *expands* an array or object into individual items.

---

**Q13. What is destructuring?**

```js
const { id, user: { name = 'Anonymous' } = {}, ...rest } = payload;
const [first, , third] = list;   // skip the second item
let a = 1, b = 2;
[a, b] = [b, a];                 // swap
```

**Short answer:** Destructuring unpacks values from objects and arrays into variables, with support for defaults, renaming (`{ id: callId }`), nesting and rest.

---

**Q14. What are optional chaining and nullish coalescing?**

**Short answer:** `?.` stops and returns `undefined` if the value before it is `null` or `undefined`, instead of throwing. `??` gives a default only for `null` or `undefined`, unlike `||`, which also replaces `0`, `''` and `false`.

```js
user?.profile?.email        // no "Cannot read properties of undefined"
callbacks.onEnd?.()         // call only if it exists
const volume = settings.volume ?? 50;   // keeps 0 if the user chose 0
const volume2 = settings.volume || 50;  // bug: 0 becomes 50
```

---

**Q15. Which array methods mutate and which don't?**

**Short answer:**

- **Mutating:** `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`.
- **Non-mutating** (return a new array): `map`, `filter`, `reduce`, `slice`, `concat`, `flat`, plus the newer `toSorted`, `toReversed`, `toSpliced` and `with`.

**Say it like this:** "In React and Redux, state must not be mutated, so I use `toSorted()` instead of `sort()`, or copy first with `[...arr].sort()`."

---

**Q16. `map` vs `forEach`?**

**Short answer:** `map` returns a new array of transformed values. `forEach` returns `undefined` and is used only for side effects. Neither can be stopped early with `break`. For that, use `for...of`, `some` or `every`.

---

**Q17. `find`, `findIndex`, `some`, `every`, `includes` and `indexOf`?**

**Short answer:**

- `find`: the first matching element, or `undefined`.
- `findIndex`: its index, or -1.
- `some`: whether at least one element matches.
- `every`: whether all elements match.
- `includes`: whether a value is present. It handles `NaN` correctly.
- `indexOf`: the index of a value, or -1. It fails for `NaN`.

```js
[NaN].includes(NaN)   // true
[NaN].indexOf(NaN)    // -1
```

---

**Q18. `for...in` vs `for...of`?**

**Short answer:** `for...in` loops over an object's enumerable **keys**, including inherited ones. `for...of` loops over the **values** of iterables (arrays, strings, Maps, Sets).

```js
for (const key in { a: 1, b: 2 }) console.log(key);   // a, b
for (const value of [10, 20]) console.log(value);      // 10, 20
```

Don't use `for...in` on arrays: it gives string indexes and can include extra properties.

---

**Q19. How do you work with object keys?**

```js
Object.keys(o); Object.values(o); Object.entries(o);
Object.fromEntries([['a', 1]]);      // { a: 1 }
'key' in o;                          // includes inherited keys
Object.hasOwn(o, 'key');             // own keys only (modern, preferred)
```

---

**Q20. Shallow vs deep copy?**

**Short answer:** A shallow copy (spread, `Object.assign`, `slice`) copies only the top level, so nested objects are still shared. A deep copy duplicates everything. `structuredClone()` is the modern built-in, and it handles Date, Map, Set and circular references.

```js
const a = { user: { name: 'A' } };
const shallow = { ...a };
shallow.user.name = 'B';     // a.user.name is ALSO 'B'

const deep = structuredClone(a);
deep.user.name = 'C';        // a is unaffected
```

**Explanation:** `JSON.parse(JSON.stringify(x))` is an older trick. It turns Dates into strings, drops `undefined` and functions, and throws on circular references.

---

**Q21. Is JavaScript pass-by-value or pass-by-reference?**

**Short answer:** Always pass-by-value. For objects, the value being copied *is a reference*. So mutating a property inside a function is visible outside it, but reassigning the parameter is not.

```js
function update(u) { u.name = 'B'; u = { name: 'C' }; }
const user = { name: 'A' };
update(user);
console.log(user.name); // 'B'
```

---

**Q22. What should you know about strings?**

**Short answer:** Strings are immutable: every method returns a new string. Useful methods include `slice`, `split`, `trim`, `padStart`, `includes`, `startsWith`, `replaceAll`, `at(-1)` (the last character), `localeCompare` (locale-aware sorting) and `normalize`.

---

**Q23. What are the common number pitfalls?**

**Short answer:**

- Floating point: `0.1 + 0.2 === 0.30000000000000004`. For money, store integer paise or cents.
- `Number.MAX_SAFE_INTEGER` is 2^53 − 1. Use `BigInt` beyond that, for example for large IDs.
- `parseInt` should always get a radix: `parseInt('08', 10)`.
- `Number('')` is `0`, `Number('12px')` is `NaN` and `parseInt('12px', 10)` is `12`.

---

**Q24. How do you check for `NaN`?**

**Short answer:** `Number.isNaN(x)` is strict. The global `isNaN(x)` converts its argument first, so `isNaN('abc')` is `true`. `NaN` is the only value not equal to itself. `Object.is(NaN, NaN)` is `true`.

---

**Q25. What is the DOM?**

**Short answer:** The Document Object Model, a tree of objects representing the page. JavaScript reads and changes it with APIs like `querySelector`, `createElement`, `append`, `classList` and `textContent`.

---

**Q26. `innerHTML` vs `textContent` vs `innerText`?**

**Short answer:** `innerHTML` parses its value as HTML, which is an **XSS risk** with user data. `textContent` sets plain text: it's fast and safe. `innerText` respects CSS (it ignores hidden text) but triggers layout, so it's slower.

```js
el.textContent = userComment;   // safe — shown as text
el.innerHTML = userComment;     // dangerous — <img onerror=…> would run
```

---

**Q27. How do you add and remove event listeners?**

```js
const ctrl = new AbortController();
button.addEventListener('click', onClick, { once: false, passive: true, signal: ctrl.signal });
// later — removes every listener registered with this signal
ctrl.abort();
```

**Short answer:** To remove a listener with `removeEventListener`, you need the *same function reference*. With an `AbortController` signal, one `abort()` removes many listeners. `passive: true` tells the browser you won't call `preventDefault()`, which makes scrolling smoother.

---

**Q28. What are event bubbling and capturing?**

**Short answer:** An event travels **down** from `window` to the target (the capture phase), hits the target, then travels back **up** (the bubble phase). Listeners run in the bubble phase by default. `stopPropagation()` stops the journey, and `preventDefault()` cancels the browser's default action (submitting a form, following a link).

```text
window → document → body → ul → li (target) → ul → body → document → window
         (capture phase ↓)              (bubble phase ↑)
```

---

**Q29. What is event delegation?**

**Short answer:** Put one listener on a parent element and work out which child was clicked from `event.target`. It uses fewer listeners and works for children added later.

```js
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-call-id]');
  if (!item) return;
  openCall(item.dataset.callId);
});
```

**Say it like this:** "For a list of 1,000 calls, I attach one listener to the list instead of 1,000 to the rows. React does something similar internally: it attaches listeners at the root."

---

**Q30. `setTimeout` vs `setInterval`?**

**Short answer:** `setTimeout` runs once after *at least* N ms. `setInterval` repeats every N ms. Both return an ID you pass to `clearTimeout` or `clearInterval`. Delays are minimums, not guarantees: a busy main thread delays them, nested timeouts are clamped to at least 4 ms, and background tabs throttle them heavily.

---

## 🟡 Level 2 — Intermediate: Functions, Scope and `this`

**Q31. What types of scope are there?**

**Short answer:** Global, module, function and block. JavaScript uses lexical scoping: a function's scope is set by where it's written in the code.

---

**Q32. What is the scope chain?**

**Short answer:** When you use a variable, JavaScript looks in the current scope, then the enclosing scope, and so on out to global. The first match wins. If none is found, you get a `ReferenceError` (or an accidental global in sloppy mode).

---

**Q33. What is a closure, and what are its use cases?**

**Short answer:** A closure is a function together with the variables it captured from the scope where it was defined. Those variables stay alive as long as the function exists.

**Use cases:**

- private state
- factory functions
- memoization caches
- debounce and throttle timers
- partial application
- React hooks
- event handlers that remember data

```js
function createCounter() {
  let count = 0;                       // private: nothing outside can touch it
  return {
    inc: () => ++count,
    get: () => count,
  };
}
const c = createCounter();
c.inc(); c.inc();
c.get(); // 2
```

**Say it like this:** "A closure is a function that remembers its birthplace. `debounce` is a closure: the returned function remembers the timer ID between calls. In React, stale closures are a common bug, where a `useEffect` callback still sees old state because it closed over an earlier render."

---

**Q34. What is the classic closure-in-a-loop problem?**

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2
```

**Short answer:** `var` creates *one* `i` shared by all the callbacks, and by the time they run the loop has finished, so `i` is 3. `let` creates a *new* binding for each iteration, so each callback captures its own value. The pre-ES6 fix was an IIFE: `(function (j) { setTimeout(() => console.log(j)); })(i)`.

---

**Q35. How can closures cause memory leaks?**

**Short answer:** A closure keeps everything it captured reachable. A long-lived closure (an event listener, an interval or a cache entry) that references a large object or a DOM node stops it being garbage-collected.

```js
function attach() {
  const hugeData = new Array(1e6).fill('x');
  window.addEventListener('resize', () => console.log(hugeData.length));
  // never removed → hugeData lives forever
}
```

---

**Q36. What is an IIFE?**

**Short answer:** An Immediately Invoked Function Expression: `(function () { … })();`. It creates a private scope right away. Before ES modules it was the standard way to avoid polluting globals (the "module pattern").

---

**Q37. How is `this` determined?**

**Short answer:** It depends on how the function is called. In priority order:

1. **`new Fn()`:** `this` is the newly created object.
2. **`fn.call(obj)`, `fn.apply(obj)` or `fn.bind(obj)`:** `this` is the object you pass.
3. **`obj.method()`:** `this` is `obj` (whatever is left of the dot).
4. **A plain call `fn()`:** `this` is `undefined` in strict mode, or `globalThis` in sloppy mode.

**Arrow functions** ignore all four rules and use `this` from the surrounding code.

```js
const user = {
  name: 'Asha',
  regular() { return this.name; },
  arrow: () => this?.name,
};
user.regular(); // 'Asha'     — rule 3
user.arrow();   // undefined  — arrow uses the outer (module) this
```

**Say it like this:** "`this` is decided at call time: `new`, then explicit binding, then 'left of the dot', then the default. Arrow functions take `this` from where they're written, which is why they're great for callbacks inside methods."

---

**Q38. Give an example of losing `this`, and how to fix it.**

```js
const btn = { label: 'Join', click() { console.log(this.label); } };
setTimeout(btn.click);            // undefined — the method was detached from btn
setTimeout(() => btn.click());    // fix 1: arrow wrapper keeps "btn." in the call
setTimeout(btn.click.bind(btn));  // fix 2: bind returns a function with this fixed
```

**Explanation:** Passing `btn.click` passes only the function, not the object, so when it's called later rule 4 applies.

---

**Q39. `call` vs `apply` vs `bind`?**

**Short answer:** All three set `this`.

- `call(thisArg, a, b)` calls the function now, with arguments listed one by one.
- `apply(thisArg, [a, b])` calls it now, with the arguments as an array.
- `bind(thisArg, a)` doesn't call anything. It returns a *new function* with `this` and any given arguments fixed.

```js
function greet(greeting, punct) { return `${greeting}, ${this.name}${punct}`; }
greet.call({ name: 'Asha' }, 'Hi', '!');     // "Hi, Asha!"
greet.apply({ name: 'Asha' }, ['Hi', '!']);  // "Hi, Asha!"
const hi = greet.bind({ name: 'Asha' }, 'Hi');
hi('?');                                      // "Hi, Asha?"
```

---

**Q40. Arrow functions in class fields vs prototype methods?**

**Short answer:** `handle = () => {}` as a class field creates a separate function *per instance* with `this` permanently bound. That's convenient for callbacks, but it costs memory per instance and can't be overridden through the prototype. A normal method is shared on the prototype, but it needs binding when you pass it around.

---

**Q41. What are higher-order functions?**

**Short answer:** Functions that take functions as arguments or return functions. Examples: `map`, `filter`, `debounce`, Express middleware, React higher-order components.

---

**Q42. What are pure functions and side effects?**

**Short answer:** A pure function always returns the same output for the same input and changes nothing outside itself. Side effects are things like network calls, DOM changes, mutating arguments or logging. Pure functions are easy to test, cache and reason about. Redux reducers, selectors and React render logic should be pure.

```js
const addTax = (amount) => amount * 1.18;      // pure
let total = 0; const add = (x) => (total += x); // impure: changes outside state
```

---

**Q43. Currying vs partial application?**

**Short answer:** Currying turns `f(a, b, c)` into `f(a)(b)(c)`, one argument at a time. Partial application fixes *some* arguments and returns a function that takes the rest.

```js
const curry = (fn) => function c(...args) {
  return args.length >= fn.length ? fn(...args) : (...more) => c(...args, ...more);
};
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3); // 6
add3(1, 2)(3); // 6

const logInfo = console.log.bind(console, '[INFO]');   // partial application
```

---

**Q44. What is function composition?**

```js
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const toSlug = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/\s+/g, '-'),
);
toSlug('  Call Summary Report '); // "call-summary-report"
```

**Short answer:** Combining small functions so the output of one becomes the input of the next. `pipe` runs them left to right and `compose` runs them right to left.

---

**Q45. What is the `arguments` object?**

**Short answer:** An array-like object holding all the arguments passed to a regular (non-arrow) function. It isn't a real array. Prefer rest parameters (`...args`), which give you a real array.

---

**Q46. How do recursion and stack limits interact?**

**Short answer:** Every function call adds a frame to the call stack, and very deep recursion (around 10,000 frames, depending on the engine) throws `RangeError: Maximum call stack size exceeded`. For deep trees, convert the recursion to a loop with an explicit stack array.

---

## 🟡 Intermediate: Objects, Prototypes and Classes

**Q47. What is the prototype chain?**

**Short answer:** Every object has a hidden link (`[[Prototype]]`) to another object. When a property isn't found on the object itself, JavaScript follows the link, and keeps going until it finds the property or reaches `null`.

```js
const animal = { breathes: true };
const dog = Object.create(animal);   // dog's prototype is animal
dog.barks = true;
dog.breathes;  // true — found on the prototype
Object.getPrototypeOf(dog) === animal; // true
```

---

**Q48. `__proto__` vs `prototype`?**

**Short answer:** `prototype` is a property of *constructor functions and classes*: it becomes the `[[Prototype]]` of objects created with `new`. `__proto__` is a legacy accessor that reads or sets *an object's own* `[[Prototype]]`. Use `Object.getPrototypeOf` instead.

```js
function User() {}
const u = new User();
Object.getPrototypeOf(u) === User.prototype; // true
```

---

**Q49. What does `new` do?**

**Short answer:**

1. Creates an empty object linked to `Constructor.prototype`.
2. Calls the constructor with `this` set to that object.
3. Returns the object, unless the constructor explicitly returns a different object.

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const result = Ctor.apply(obj, args);
  return result !== null && typeof result === 'object' ? result : obj;
}
```

---

**Q50. Are ES6 classes just syntax sugar?**

**Short answer:** Mostly. They're built on prototypes, with some real differences: class bodies are always in strict mode, classes sit in the TDZ until declared, they must be called with `new`, and they support truly private `#fields` and `static` blocks.

---

**Q51. How does inheritance work with classes?**

```js
class Participant {
  constructor(id) { this.id = id; }
  describe() { return `Participant ${this.id}`; }
}

class Interpreter extends Participant {
  constructor(id, language) {
    super(id);                 // must call before using `this`
    this.language = language;
  }
  describe() { return `${super.describe()} (interprets ${this.language})`; }
}

new Interpreter(7, 'Spanish').describe(); // "Participant 7 (interprets Spanish)"
```

---

**Q52. What are private fields?**

**Short answer:** `#token` fields are truly private and enforced by the engine. The `_token` convention is only a naming hint. `#x in obj` checks whether an object has the private field.

```js
class Session {
  #token;
  constructor(t) { this.#token = t; }
  get isActive() { return Boolean(this.#token); }
}
new Session('abc').#token; // SyntaxError
```

---

**Q53. What are getters and setters?**

```js
class Temperature {
  #c = 0;
  get fahrenheit() { return this.#c * 9 / 5 + 32; }
  set fahrenheit(f) {
    if (typeof f !== 'number') throw new TypeError('number expected');
    this.#c = (f - 32) * 5 / 9;
  }
}
```

**Short answer:** They're computed properties that look like normal properties. A setter is a good place for validation.

---

**Q54. What are property descriptors?**

**Short answer:** `Object.defineProperty(obj, 'x', { value, writable, enumerable, configurable, get, set })` controls exactly how a property behaves, for example making it read-only or hiding it from `Object.keys`.

---

**Q55. `Object.freeze` vs `Object.seal` vs `Object.preventExtensions`?**

| | Add properties | Remove properties | Change values |
|---|---|---|---|
| `preventExtensions` | no | yes | yes |
| `seal` | no | no | yes |
| `freeze` | no | no | no |

All three are **shallow**: nested objects can still change.

---

**Q56. Composition vs inheritance?**

**Short answer:** Prefer building behaviour from small, composable pieces (functions, hooks, mixins) over deep class hierarchies. Inheritance couples child classes to parent internals. React itself favours composition: children, hooks and wrapper components.

---

**Q57. `Map` vs a plain object?**

| | `Map` | Object |
|---|---|---|
| Key types | anything (objects too) | strings and symbols |
| Order | insertion order | mostly insertion order (integer keys first) |
| Size | `map.size` | `Object.keys(o).length` |
| Frequent add/delete | optimised | slower |
| JSON | needs conversion | native |
| Prototype key clashes | none | possible (`'constructor'`) |

**Say it like this:** "For a lookup that changes often, like participants keyed by ID during a call, I use a Map. For data that's serialised to JSON or stored in Redux, I use plain objects."

---

**Q58. What is a `Set` useful for?**

**Short answer:** It stores unique values with fast O(1) membership checks.

```js
const unique = [...new Set(['a', 'b', 'a'])];   // ['a', 'b']
const selected = new Set(); selected.add(id); selected.has(id);
```

Newer Set methods include `union`, `intersection` and `difference`. Check browser support before using them.

---

**Q59. What are `WeakMap`, `WeakSet` and `WeakRef`?**

**Short answer:** Their keys must be objects, and they hold those keys *weakly*. When nothing else references a key object, its entry disappears automatically. They're good for attaching metadata to DOM nodes or objects without causing memory leaks. They can't be iterated.

```js
const meta = new WeakMap();
meta.set(videoElement, { attachedAt: Date.now() });
// when videoElement is removed and garbage-collected, the entry vanishes
```

---

**Q60. What are Symbols?**

**Short answer:** Unique values used as property keys that can never clash with other keys. *Well-known symbols* customise built-in behaviour: `Symbol.iterator` (makes an object work with `for...of`), `Symbol.asyncIterator` and `Symbol.toPrimitive`.

---

**Q61. What are the JSON gotchas?**

**Short answer:** `JSON.stringify` drops `undefined`, functions and symbols. It turns Dates into ISO strings (which don't come back as Dates), and throws on circular references and on BigInt. Use the `replacer` and `reviver` arguments for custom handling.

```js
JSON.stringify({ a: undefined, b: () => 1, d: new Date(0) });
// '{"d":"1970-01-01T00:00:00.000Z"}'
```

---

## 🟡 Intermediate: Asynchronous JavaScript

**Q62. Why is JavaScript asynchronous if it's single-threaded?**

**Short answer:** Your code runs on one thread, but the *runtime* (the browser or Node) does slow work in the background: network requests, timers, file I/O. When that work finishes, the runtime queues a callback, and the event loop runs it on the main thread once it's free.

**Say it like this:** "JavaScript itself is single-threaded, but `fetch` and timers are handled by the browser in the background. The event loop brings the results back to my code when the call stack is empty, so the UI never freezes waiting for the network."

---

**Q63. Explain the event loop precisely.**

**Short answer:**

1. Run the current task (the script, an event handler or a timer callback) until the call stack is empty.
2. Run **all** microtasks (promise reactions, `queueMicrotask`, `MutationObserver`), including any queued while draining.
3. The browser may render: `requestAnimationFrame` callbacks, then style, layout and paint.
4. Take the **next** task from the task queues and repeat.

**Example:**

```js
console.log('1 sync');
setTimeout(() => console.log('4 task'), 0);
Promise.resolve().then(() => console.log('3 microtask'));
console.log('2 sync');
// 1 sync, 2 sync, 3 microtask, 4 task
```

**Say it like this:** "The event loop runs synchronous code first, then drains the entire microtask queue, then possibly renders, then takes one macrotask like a timer. That's why a resolved promise always logs before a zero-delay `setTimeout`."

---

**Q64. Give examples of microtasks and macrotasks.**

**Short answer:**

- **Microtasks:** `.then`, `.catch`, `.finally`, the code after an `await`, `queueMicrotask`, `MutationObserver`.
- **Macrotasks (tasks):** `setTimeout`, `setInterval`, `MessageChannel`, I/O callbacks, UI events (click, keydown).

---

**Q65. Can microtasks block rendering?**

**Short answer:** Yes. The microtask queue must be *completely* empty before the browser can render or handle the next event, so an endless chain of microtasks freezes the page.

```js
function loop() { Promise.resolve().then(loop); }
loop(); // page freezes — rendering never gets a turn
```

---

**Q66. How did async code evolve from callbacks to promises to async/await?**

```js
// 1. Callbacks — nesting and repeated error handling
getUser(id, (err, user) => {
  if (err) return handle(err);
  getCalls(user.id, (err, calls) => {
    if (err) return handle(err);
    render(calls);
  });
});

// 2. Promises — flat chain, one error path
getUser(id).then(u => getCalls(u.id)).then(render).catch(handle);

// 3. async/await — reads top to bottom
try {
  const user = await getUser(id);
  render(await getCalls(user.id));
} catch (e) { handle(e); }
```

**Short answer:** Callbacks led to deep nesting and inconsistent error handling. Promises gave chaining and a single error path, and async/await makes promise code read like synchronous code.

---

**Q67. What are the states of a promise?**

**Short answer:** `pending`, then either `fulfilled` (it has a value) or `rejected` (it has a reason). Once it's settled, its state never changes.

---

**Q68. What are the promise chaining rules?**

**Short answer:**

- Each `.then` returns a *new* promise.
- If the handler returns a value, the next promise fulfils with that value.
- If the handler returns a promise, the chain waits for it.
- If the handler throws, the next promise rejects.
- `.catch` handles any rejection from earlier in the chain. After it, the chain continues normally.
- `.finally` runs either way and passes the original value or error through.

```js
fetchUser()
  .then(user => user.id)            // returns a value
  .then(id => fetchCalls(id))       // returns a promise → waits
  .then(calls => { if (!calls.length) throw new Error('none'); return calls; })
  .catch(err => [])                 // recovers with an empty array
  .finally(() => setLoading(false));
```

---

**Q69. What are the promise combinators?**

| Method | Resolves when | Rejects when | Use case |
|---|---|---|---|
| `Promise.all` | all fulfil (array of values) | the first rejection | load user + calls + settings together |
| `Promise.allSettled` | all settle (array of `{status, value/reason}`) | never | send 10 notifications, report which failed |
| `Promise.race` | the first one settles | the first one settles with a rejection | timeout vs request |
| `Promise.any` | the first one fulfils | all reject (`AggregateError`) | fastest of several mirrors |

**Example (a timeout with `race`):**

```js
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms));
const data = await Promise.race([fetch('/api/report'), timeout(5000)]);
```

---

**Q70. What is `Promise.withResolvers()`?**

**Short answer:** It returns `{ promise, resolve, reject }`, which is handy when the code that resolves the promise lives somewhere other than where the promise is created (the "deferred" pattern). Check runtime support.

```js
const { promise, resolve } = Promise.withResolvers();
room.once('connected', resolve);
await promise;
```

---

**Q71. How do you handle errors with async/await?**

**Short answer:** Wrap awaits in `try/catch`, or attach `.catch` to the promise the async function returns. Unhandled rejections trigger the `unhandledrejection` event on `window`, so report those to Sentry.

```js
window.addEventListener('unhandledrejection', (e) => Sentry.captureException(e.reason));
```

---

**Q72. Sequential vs parallel awaits?**

```js
// Slow: two round trips one after another (≈ 400ms + 400ms)
const user = await getUser();
const calls = await getCalls();

// Fast: both requests at once (≈ 400ms)
const [user2, calls2] = await Promise.all([getUser(), getCalls()]);
```

**Short answer:** If the requests don't depend on each other, start them together with `Promise.all`.

**Say it like this:** "A common performance bug is awaiting independent requests one after another. On a dashboard I cut load time almost in half just by wrapping three independent fetches in `Promise.all`."

---

**Q73. What happens with `await` inside loops?**

**Short answer:** `for...of` with `await` runs the items **sequentially**, which is fine when you mean it, for example to respect a rate limit. `array.forEach(async …)` does **not** wait at all, which is a classic bug. For parallel work, use `await Promise.all(items.map(async …))`. For limited parallelism, use a pool (Q120).

```js
items.forEach(async (i) => await save(i));
console.log('done');   // runs BEFORE any save finishes

for (const i of items) await save(i);           // sequential
await Promise.all(items.map((i) => save(i)));   // parallel
```

---

**Q74. What is top-level await?**

**Short answer:** Inside ES modules you can use `await` outside any function. Modules that import this module wait until it finishes. It's useful for loading config before the app starts.

---

**Q75. How do you cancel work with `AbortController`?**

```js
const ctrl = new AbortController();

fetch('/api/search?q=maria', { signal: ctrl.signal })
  .then((r) => r.json())
  .catch((e) => { if (e.name !== 'AbortError') throw e; });

ctrl.abort();                                // cancel it

fetch(url, { signal: AbortSignal.timeout(5000) });               // built-in timeout
fetch(url, { signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(5000)]) }); // either one
```

**Short answer:** Pass `signal` to `fetch` or `addEventListener`, then call `abort()`. Cancelled fetches reject with an `AbortError`, which you usually ignore.

**Say it like this:** "In React effects I create an AbortController and abort in the cleanup function. That way, if the user navigates away or changes the filter, the old request can't overwrite new data."

---

**Q76. What are the `fetch` gotchas?**

**Short answer:**

1. It **doesn't reject on HTTP errors** like 404 or 500, only on network failures. Always check `res.ok`.
2. It doesn't send cookies cross-origin unless you set `credentials: 'include'`.
3. It has no built-in timeout. Use `AbortSignal.timeout`.
4. The body can be read only once. Use `res.clone()` if you need it twice.

```js
async function http(url, options) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body });
  }
  return res.status === 204 ? null : res.json();
}
```

---

**Q77. Debounce vs throttle: definitions and implementations?**

**Short answer:** **Debounce** waits until events *stop* for N ms, then runs once. Use it for search inputs and the end of a resize. **Throttle** runs at most once every N ms *during* continuous events. Use it for scroll, mousemove and analytics.

```text
Events:    x x x x x x . . . . x x . . . .
Debounce:                    ✓           ✓   (after quiet period)
Throttle:  ✓     ✓     ✓     ✓     ✓         (regular intervals)
```

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
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer); timer = null; last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => { last = Date.now(); timer = null; fn.apply(this, args); }, remaining);
    }
  };
}
```

**Say it like this:** "Debounce is 'wait until the user stops typing'. Throttle is 'at most once every 100 ms while scrolling'. Both are closures holding a timer between calls."

---

**Q78. How do you retry with exponential backoff and jitter?**

```js
async function retry(fn, { tries = 4, base = 300, max = 5000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const fatal = err.status === 401 || err.status === 403 || err.status === 400;
      if (attempt >= tries - 1 || fatal) throw err;
      const delay = Math.min(max, base * 2 ** attempt) * (0.5 + Math.random() / 2); // jitter
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
```

**Short answer:** Wait longer after each failure (300 ms, 600 ms, 1.2 s…), with randomness ("jitter") so thousands of clients don't retry at the same instant (the "thundering herd" problem). Don't retry auth errors or validation errors. Don't blindly retry non-idempotent requests like a payment, unless they carry an idempotency key.

---

**Q79. What are generators and async generators?**

**Short answer:** `function*` produces values lazily with `yield`. `async function*` yields values over time, and `for await...of` consumes them. They're perfect for paginated APIs and streams.

```js
async function* pages(url) {
  let next = url;
  while (next) {
    const res = await (await fetch(next)).json();
    yield res.items;
    next = res.nextPage;
  }
}
for await (const items of pages('/api/calls')) render(items);
```

---

**Q80. What is the iterator protocol?**

**Short answer:** An object is *iterable* if it has a `[Symbol.iterator]()` method that returns an *iterator*: an object with `next()` returning `{ value, done }`. That's what makes spread, destructuring and `for...of` work.

```js
const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i; },
};
[...range]; // [1, 2, 3]
```

---

## 🔴 Level 3 — Advanced

**Q81. What are the execution context and the call stack?**

**Short answer:** Each function call creates an *execution context* holding its variables, its scope chain and its `this` value. Contexts are pushed onto the *call stack* and popped when the function returns. Each context has a **creation phase**, where hoisting happens and memory is set up, and an **execution phase**, where the code runs line by line.

---

**Q82. Lexical environment vs variable environment?**

**Short answer:** The lexical environment holds `let`, `const` and function bindings for the current block. The variable environment holds `var` bindings. Each links to its outer environment, and that chain is how closures find variables.

---

**Q83. How does garbage collection work in V8?**

**Short answer:** Objects that can't be reached from the "roots" (globals and the current stack) are garbage. V8 is generational. New objects go into the **young generation**, which is collected often and quickly, because most objects die young. Survivors move to the **old generation**, which is collected with mark-sweep-compact, done incrementally and concurrently to avoid long pauses.

---

**Q84. What are the common frontend memory leaks?**

**Short answer:**

- Listeners on `window` or `document` that are never removed.
- `setInterval` calls that are never cleared.
- **Detached DOM nodes** that are removed from the page but still referenced in JavaScript.
- Unbounded caches, maps or arrays (chat messages, logs).
- Closures capturing large data.
- WebSocket, SSE or MediaStream connections that are never closed.
- Third-party SDK instances re-created on every mount.

**How to diagnose:** In Chrome DevTools, open the Memory panel. Take a heap snapshot, repeat the action several times (open and close a call), take another snapshot, and compare. Look for growing counts and "Detached" elements, and check their *retainers* to see who is holding them.

**Say it like this:** "On a long video call, memory grew steadily. Heap snapshots showed thousands of audio-level listeners. We were subscribing on every render and never unsubscribing. Moving the subscription into a `useEffect` with a cleanup function fixed it."

---

**Q85. How does V8 optimise code?**

**Short answer:** V8 starts with the Ignition interpreter, then compiles hot code with faster tiers (Sparkplug and Maglev), and finally uses the TurboFan optimising compiler. It uses **hidden classes** (object shapes) and **inline caches** to make property access fast. To help it: create objects with the same properties in the same order, avoid `delete` on hot objects, and keep functions *monomorphic* (always called with the same types).

---

**Q86. What are the type coercion rules (`ToPrimitive`)?**

**Short answer:** An object is converted to a primitive using `Symbol.toPrimitive` first, then `valueOf`, then `toString`. With `+`, if either side is a string, the operands are concatenated; other arithmetic converts to numbers.

```js
[] + {}        // "[object Object]"   ('' + '[object Object]')
[] + []        // ""
{} + []        // 0 at statement start ({} is a block), "[object Object]" in an expression
'5' - 2        // 3
'5' + 2        // "52"
true + 1       // 2
```

---

**Q87. What does strict mode change?**

**Short answer:** Silent errors now throw: assigning to an undeclared variable or to a read-only property. `this` is `undefined` in plain function calls, `with` is banned, and duplicate parameter names aren't allowed. ES modules and classes are always strict.

---

**Q88. ES modules vs CommonJS?**

| | ESM | CommonJS |
|---|---|---|
| Syntax | `import` / `export` | `require` / `module.exports` |
| Loading | static, async, analysable at build time | dynamic, synchronous |
| Bindings | live (you see updates) | copied values |
| Tree-shaking | yes | limited |
| Top-level await | yes | no |

**Say it like this:** "ESM imports are static, so bundlers can tree-shake unused code. That's why I prefer libraries that ship ESM, like `lodash-es` over `lodash`."

---

**Q89. What is dynamic import?**

```js
const { Room } = await import('livekit-client');
```

**Short answer:** `import()` loads a module on demand and returns a promise. Bundlers put the module in a separate chunk, which is the basis of code splitting. A good example is loading the heavy video SDK only when the user clicks "Join".

---

**Q90. How do modules handle circular dependencies?**

**Short answer:** ESM supports cycles through live bindings, but reading a binding before its module has finished evaluating throws a TDZ error. Fix it by moving the shared code into a third module, or by accessing the import lazily inside a function.

---

**Q91. What are Proxy and Reflect?**

**Short answer:** A `Proxy` wraps an object and intercepts operations like get, set, has and delete. `Reflect` provides the default behaviour for each operation. Vue and MobX use Proxy for reactivity, and Immer uses it to let you "mutate" a draft safely. Other uses are validation and logging.

```js
const state = new Proxy({}, {
  set(target, key, value) {
    console.log(`set ${String(key)} =`, value);
    return Reflect.set(target, key, value);
  },
});
state.status = 'connected';   // logs: set status = connected
```

---

**Q92. What are tagged templates?**

**Short answer:** A function placed before a template literal. It receives the string parts and the interpolated values separately. styled-components (`` styled.div`…` ``) and GraphQL's `gql` use them, and so do safe HTML or SQL builders that escape the values.

---

**Q93. What are Web Workers?**

**Short answer:** A separate thread with its own event loop and no DOM access. It communicates with the page through `postMessage`: data is copied with structured clone, or `ArrayBuffer`s are *transferred* with zero copy. Use workers for parsing big files, heavy computation, encryption and audio processing. A `SharedWorker` is shared across tabs, and `SharedArrayBuffer` needs cross-origin isolation.

```js
// main.js
const worker = new Worker(new URL('./parse.worker.js', import.meta.url), { type: 'module' });
worker.postMessage(hugeCsvText);
worker.onmessage = (e) => setRows(e.data);

// parse.worker.js
self.onmessage = (e) => self.postMessage(parseCsv(e.data));
```

---

**Q94. `requestAnimationFrame` vs `setTimeout` for animation?**

**Short answer:** `requestAnimationFrame` runs right before the next paint, synced to the display's refresh rate (60 or 120 Hz), and it pauses in background tabs. Use it for visual updates and for batching DOM writes. `setTimeout` isn't synced to frames, so animations stutter.

---

**Q95. What are `requestIdleCallback`, `scheduler.postTask` and `scheduler.yield`?**

**Short answer:** Tools for scheduling non-urgent work. `requestIdleCallback` runs work when the browser is idle. `scheduler.postTask` schedules tasks with a priority. `scheduler.yield()` pauses a long task to let the browser handle user input, which improves INP. Check support and fall back to `setTimeout(…, 0)`.

```js
const yieldToMain = () =>
  globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r, 0));

async function processAll(items) {
  let deadline = performance.now() + 50;          // work in ~50ms slices
  for (const item of items) {
    process(item);
    if (performance.now() > deadline) {
      await yieldToMain();                        // let clicks/typing run
      deadline = performance.now() + 50;
    }
  }
}
```

---

**Q96. Which Observer APIs should you know?**

**Short answer:**

- `IntersectionObserver`: is an element visible? Use it for lazy loading, infinite scroll, ad impressions and pausing off-screen videos.
- `ResizeObserver`: an element changed size. Use it for responsive components and charts.
- `MutationObserver`: the DOM changed. Use it to react to third-party widgets.
- `PerformanceObserver`: performance entries such as LCP, long tasks and layout shifts.

```js
const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) loadMore();
}, { rootMargin: '200px' });
io.observe(sentinelElement);
```

---

**Q97. How do browser tabs communicate with each other?**

**Short answer:** Through `BroadcastChannel`, the `storage` event (fired in *other* tabs when localStorage changes), a `SharedWorker`, or a service worker's `postMessage`. Typical uses are logging out of all tabs at once, and electing one "leader" tab to own a single WebSocket.

```js
const channel = new BroadcastChannel('auth');
channel.postMessage({ type: 'logout' });
channel.onmessage = (e) => { if (e.data.type === 'logout') redirectToLogin(); };
```

---

**Q98. How do you use `postMessage` securely?**

**Short answer:** When receiving, always check `event.origin` against an allowlist and validate the shape of the message. When sending, pass the exact `targetOrigin`, and never `'*'` for sensitive data.

```js
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://widget.partner.com') return;
  if (typeof e.data?.type !== 'string') return;
  …
});
```

---

**Q99. What is the Streams API?**

**Short answer:** `ReadableStream`, `TransformStream` and `TextDecoderStream` let you process data piece by piece as it arrives, with backpressure, instead of waiting for the whole response. Typical uses are streaming LLM tokens and large CSV downloads.

---

**Q100. What can't `structuredClone` copy?**

**Short answer:** Functions, DOM nodes and class identity (class instances come back as plain objects). Older runtimes also can't clone Errors.

---

**Q101. Which `Intl` APIs should you know?**

```js
new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(date);
new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(1234.5); // ₹1,234.50
new Intl.NumberFormat('en', { notation: 'compact' }).format(40000);                     // "40K"
new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-3, 'minute');           // "3 minutes ago"
new Intl.ListFormat('en').format(['Asha', 'Ravi', 'Maria']);                            // "Asha, Ravi, and Maria"
```

**Short answer:** Built-in, locale-aware formatting for dates, numbers, currency, relative times, plurals, lists and sorting (`Collator`), with no library needed.

---

**Q102. How do you handle dates and time zones?**

**Short answer:** A `Date` stores milliseconds since 1970 in UTC, and displaying it converts to the local time zone. Send ISO strings with an offset or `Z` to APIs (`2026-10-04T10:30:00Z`). Format with `Intl.DateTimeFormat` and an explicit `timeZone`. The new **Temporal** API fixes most `Date` problems; check support or use a polyfill.

---

**Q103. What are good error-handling patterns?**

```js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = 'HttpError';
    this.status = status;
  }
}

try {
  await joinRoom();
} catch (err) {
  throw new Error('Join failed', { cause: err });  // keeps the original error
}
```

**Short answer:**

- Create custom error classes for categories (HTTP, validation).
- Use `cause` to wrap errors without losing the original.
- Add global handlers (`window.onerror`, `unhandledrejection`) that report to Sentry.
- Use React error boundaries for rendering errors.
- Show users friendly messages, and send the technical details to logs.

---

## ⚙️ Polyfills and Implementations (Very Frequently Asked)

**What is a polyfill?** Code that implements a built-in feature yourself, either for older browsers or to prove you understand how it works. Interviewers ask these to check your grasp of `this`, closures, prototypes and promises. For each one, first explain *what the original does*, then write it, then mention the edge cases.

**Q104. Implement `Array.prototype.map`.**

```js
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) {                        // skip holes in sparse arrays, like the real map
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};

[1, 2, 3].myMap((x) => x * 2); // [2, 4, 6]
```

**Points to mention:** the callback receives `(element, index, array)`, `thisArg` sets `this` inside the callback, and the original array is never changed.

---

**Q105. Implement `Array.prototype.filter`.**

```js
Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};
```

---

**Q106. Implement `Array.prototype.reduce`.**

```js
Array.prototype.myReduce = function (callback, ...initial) {
  let i = 0;
  let acc;
  if (initial.length) {
    acc = initial[0];
  } else {
    while (i < this.length && !(i in this)) i++;          // find first real element
    if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i++];
  }
  for (; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
};

[1, 2, 3].myReduce((sum, x) => sum + x, 0); // 6
```

**Edge case to mention:** with no initial value, `reduce` uses the first element, and an empty array with no initial value throws. That's why `...initial` is used: it distinguishes "no initial value" from an initial value of `undefined`.

---

**Q107. Implement `Array.prototype.flat`.**

```js
// Recursive with depth
function flat(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, v) => acc.concat(Array.isArray(v) ? flat(v, depth - 1) : v), [])
    : arr.slice();
}
flat([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]

// Iterative, infinite depth, no recursion limit
function flatDeep(arr) {
  const stack = [...arr];
  const out = [];
  while (stack.length) {
    const v = stack.pop();
    Array.isArray(v) ? stack.push(...v) : out.push(v);
  }
  return out.reverse();
}
```

---

**Q108. Implement `Function.prototype.bind` (including support for `new`).**

```js
Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  function bound(...args) {
    // if called with `new`, `this` is the new instance — ignore ctx
    return fn.apply(this instanceof bound ? this : ctx, [...preset, ...args]);
  }
  bound.prototype = Object.create(fn.prototype);
  return bound;
};

const user = { name: 'Asha' };
function hello(greeting) { return `${greeting}, ${this.name}`; }
hello.myBind(user, 'Hi')(); // "Hi, Asha"
```

---

**Q109. Implement `call` and `apply`.**

```js
Function.prototype.myCall = function (ctx = globalThis, ...args) {
  const key = Symbol('fn');          // unique key, can't clash with existing properties
  ctx = Object(ctx);                 // box primitives
  ctx[key] = this;                   // temporarily make the function a method of ctx
  try {
    return ctx[key](...args);        // call as ctx.method() → this = ctx
  } finally {
    delete ctx[key];
  }
};

Function.prototype.myApply = function (ctx, args = []) {
  return this.myCall(ctx, ...args);
};
```

**Explanation:** The trick uses the "left of the dot" rule. Attaching the function to the object and calling it as a method sets `this`.

---

**Q110. Implement `Promise.all`, `allSettled`, `race` and `any`.**

```js
const all = (promises) => new Promise((resolve, reject) => {
  const results = [];
  let done = 0;
  if (!promises.length) return resolve(results);
  promises.forEach((p, i) => {
    Promise.resolve(p).then((value) => {
      results[i] = value;                 // keep original order
      if (++done === promises.length) resolve(results);
    }, reject);                           // first rejection rejects all
  });
});

const allSettled = (promises) => Promise.all(promises.map((p) =>
  Promise.resolve(p).then(
    (value) => ({ status: 'fulfilled', value }),
    (reason) => ({ status: 'rejected', reason }),
  )));

const race = (promises) => new Promise((resolve, reject) => {
  promises.forEach((p) => Promise.resolve(p).then(resolve, reject));
});

const any = (promises) => new Promise((resolve, reject) => {
  const errors = [];
  let rejected = 0;
  if (!promises.length) return reject(new AggregateError([], 'All promises were rejected'));
  promises.forEach((p, i) => {
    Promise.resolve(p).then(resolve, (e) => {
      errors[i] = e;
      if (++rejected === promises.length) reject(new AggregateError(errors, 'All promises were rejected'));
    });
  });
});
```

**Points to mention:** `Promise.resolve(p)` handles non-promise values, results keep the input order even though promises finish in any order, and an empty array resolves immediately.

---

**Q111. Implement a minimal Promise (asked at senior level).**

```js
class MyPromise {
  #state = 'pending';
  #value;
  #handlers = [];

  constructor(executor) {
    const settle = (state, value) => {
      if (this.#state !== 'pending') return;               // settle only once
      if (state === 'fulfilled' && value && typeof value.then === 'function') {
        return value.then((v) => settle('fulfilled', v), (e) => settle('rejected', e)); // adopt thenables
      }
      this.#state = state;
      this.#value = value;
      this.#handlers.forEach((h) => h());
    };
    try {
      executor((v) => settle('fulfilled', v), (e) => settle('rejected', e));
    } catch (e) {
      settle('rejected', e);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const run = () => queueMicrotask(() => {             // callbacks are always async
        const cb = this.#state === 'fulfilled' ? onFulfilled : onRejected;
        if (typeof cb !== 'function') {
          return (this.#state === 'fulfilled' ? resolve : reject)(this.#value); // pass through
        }
        try { resolve(cb(this.#value)); } catch (e) { reject(e); }
      });
      this.#state === 'pending' ? this.#handlers.push(run) : run();
    });
  }

  catch(onRejected) { return this.then(undefined, onRejected); }

  finally(cb) {
    return this.then(
      (v) => { cb(); return v; },
      (e) => { cb(); throw e; },
    );
  }

  static resolve(v) { return v instanceof MyPromise ? v : new MyPromise((r) => r(v)); }
}
```

**Key ideas to explain:** a promise settles only once, `then` returns a new promise (which is what makes chaining work), callbacks run as microtasks, and a returned thenable is "adopted".

---

**Q112. Implement a deep clone that handles cycles, Date, Map and Set.**

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;    // primitives
  if (seen.has(value)) return seen.get(value);                      // circular reference
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) {
    const m = new Map(); seen.set(value, m);
    value.forEach((v, k) => m.set(deepClone(k, seen), deepClone(v, seen)));
    return m;
  }
  if (value instanceof Set) {
    const s = new Set(); seen.set(value, s);
    value.forEach((v) => s.add(deepClone(v, seen)));
    return s;
  }
  const out = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, out);
  for (const key of Reflect.ownKeys(value)) out[key] = deepClone(value[key], seen); // includes symbols
  return out;
}
```

**Say it like this:** "In real code I'd use `structuredClone`, but the key ideas are recursion, a WeakMap to handle circular references, and special cases for built-ins like Date and Map."

---

**Q113. Implement deep equality.**

```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;                         // handles NaN and identical refs
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  return keysA.length === keysB.length && keysA.every((k) => deepEqual(a[k], b[k]));
}
deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
```

---

**Q114. Implement memoize.**

```js
function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {
    const key = keyFn(...args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

const slowSquare = (n) => { for (let i = 0; i < 1e8; i++); return n * n; };
const fastSquare = memoize(slowSquare);
fastSquare(9); // slow the first time
fastSquare(9); // instant — from cache
```

**Async version tip:** cache the *promise*, so concurrent calls share one request, and delete the entry if it rejects so errors aren't cached forever. Also mention an LRU limit to avoid unbounded growth.

---

**Q115. Implement `once`.**

```js
const once = (fn) => {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
};
const init = once(() => console.log('SDK initialised'));
init(); init(); // logs once
```

---

**Q116. Implement infinite currying: `sum(1)(2)(3)()`.**

```js
const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
sum(1)(2)(3)(); // 6
```

---

**Q117. Implement an event emitter (on, off, once, emit).**

```js
class Emitter {
  #map = new Map();

  on(event, fn) {
    if (!this.#map.has(event)) this.#map.set(event, new Set());
    this.#map.get(event).add(fn);
    return () => this.off(event, fn);           // unsubscribe function
  }

  off(event, fn) { this.#map.get(event)?.delete(fn); }

  once(event, fn) {
    const off = this.on(event, (...args) => { off(); fn(...args); });
    return off;
  }

  emit(event, ...args) {
    [...(this.#map.get(event) ?? [])].forEach((fn) => fn(...args)); // copy: safe if handlers unsubscribe
  }
}

const bus = new Emitter();
const off = bus.on('participantJoined', (p) => console.log(p.name));
bus.emit('participantJoined', { name: 'Maria' });
off();
```

---

**Q118. Implement a `getElementsByClassName`-style DOM traversal.**

```js
function byClass(root, className) {
  const out = [];
  (function walk(node) {
    for (const child of node.children) {
      if (child.classList.contains(className)) out.push(child);
      walk(child);
    }
  })(root);
  return out;
}
```

---

**Q119. Implement `setInterval` using `setTimeout`, correcting for drift.**

```js
function interval(fn, ms) {
  let expected = performance.now() + ms;
  let id;
  const step = () => {
    const drift = performance.now() - expected;  // how late we are
    fn();
    expected += ms;
    id = setTimeout(step, Math.max(0, ms - drift)); // shorten the next wait to catch up
  };
  id = setTimeout(step, ms);
  return () => clearTimeout(id);
}
```

**Why:** `setInterval` can drift over time, and it can stack callbacks if they're slow. A call timer showing "12:34" must stay accurate.

---

**Q120. Implement a concurrency-limited task runner.**

```js
async function runWithLimit(tasks, limit) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;                     // claim the next task (safe: single thread)
      try { results[i] = { ok: true, value: await tasks[i]() }; }
      catch (e) { results[i] = { ok: false, error: e }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// 200 uploads, max 5 at a time
await runWithLimit(files.map((f) => () => upload(f)), 5);
```

**Say it like this:** "I start N workers, and each pulls the next task from a shared index until none are left. That keeps exactly N requests in flight, which is gentler on the server than `Promise.all` over 200 requests."

---

**Q121. Implement `get(obj, path, default)`.**

```js
const get = (obj, path, defaultValue) => {
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
};

get({ call: { participants: [{ name: 'Maria' }] } }, 'call.participants[0].name'); // "Maria"
```

---

**Q122. Implement a classnames helper.**

```js
const cx = (...args) =>
  args
    .flatMap((a) =>
      typeof a === 'string' ? a
      : Array.isArray(a) ? cx(...a)
      : a && typeof a === 'object' ? Object.keys(a).filter((k) => a[k])
      : [])
    .filter(Boolean)
    .join(' ');

cx('btn', { 'btn--active': isActive, 'btn--disabled': false }, ['lg']); // "btn btn--active lg"
```

---

## 🧠 Output Questions (Predict Before Reading the Answer)

**How to solve these:** run through the code like the engine does. Synchronous code runs first, then *all* microtasks, then *one* macrotask. Track hoisting and `this` carefully, and say your reasoning out loud.

**Q123.**

```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C')).then(() => console.log('D'));
queueMicrotask(() => console.log('E'));
console.log('F');
```

**Output:** `A F C E D B`

**Why:** A and F are synchronous. The microtask queue then holds [C, E]. Running C queues D, so the order is C, E, D. B is a macrotask, so it runs last.

---

**Q124.**

```js
async function f() { console.log(1); await null; console.log(2); }
console.log(3); f(); console.log(4);
```

**Output:** `3 1 4 2`

**Why:** An async function runs synchronously until its first `await`. Everything after the `await` becomes a microtask.

---

**Q125.**

```js
const obj = { name: 'x', regular() { return this.name; }, arrow: () => this?.name };
console.log(obj.regular(), obj.arrow());
```

**Output:** `x undefined`

**Why:** Arrow functions don't get `this` from the object. They use the module or global `this`.

---

**Q126.**

```js
console.log(typeof typeof 1);          // "string"
console.log([10, 1, 2].sort());        // [1, 10, 2]
console.log(['1', '2', '3'].map(Number));   // [1, 2, 3]
console.log(['1', '2', '3'].map(parseInt)); // [1, NaN, NaN]
```

**Why:**

- `typeof 1` is `"number"`, and `typeof "number"` is `"string"`.
- The default `sort` compares values as **strings**, so "10" comes before "2". Use `(a, b) => a - b` for numbers.
- `map` passes `(value, index)`, so the calls are `parseInt('2', 1)` and `parseInt('3', 2)`, and both are invalid radixes or digits.

---

**Q127.**

```js
let a = { n: 1 }; let b = a; a.n = 2; a = { n: 3 };
console.log(b.n);
```

**Output:** `2`

**Why:** `b` points to the original object, which was mutated to `n: 2`. Reassigning `a` to a new object doesn't affect `b`.

---

**Q128.**

```js
console.log(foo()); console.log(bar);
function foo() { return 'hoisted'; }
var bar = 1;
```

**Output:** `hoisted undefined`

**Why:** Function declarations are fully hoisted. `var` is hoisted as `undefined`.

---

**Q129.**

```js
console.log(0 || 'a', 0 ?? 'a', '' && 'b', null?.x);
```

**Output:** `a 0 '' undefined`

**Why:** `||` skips falsy values, while `??` skips only null and undefined. `&&` returns the first falsy value (`''`), and `?.` on `null` returns `undefined`.

---

**Q130.**

```js
const p = Promise.reject(new Error('x'));
p.catch(() => 'handled').then((v) => console.log(v));
```

**Output:** `handled`

**Why:** `.catch` returns a fulfilled promise with whatever its handler returns.

---

**Q131.**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () { console.log(this.i); }.bind({ i }), 0);
}
```

**Output:** `0 1 2`

**Why:** `bind({ i })` creates the object *at that moment*, capturing the current value of `i`.

---

**Q132.**

```js
console.log([] == ![]);                         // true
console.log(NaN === NaN, Object.is(NaN, NaN));  // false true
console.log(0.1 + 0.2);                         // 0.30000000000000004
```

**Why `[] == ![]` is true:** `![]` is `false` (an array is truthy), so the comparison becomes `[] == false`. Both sides convert to numbers: `[]` → `''` → `0`, and `false` → `0`. So `0 == 0`.

---

## 🧩 Level 4 — Scenario-Based

**Q133. A search box fires a request on every keystroke and sometimes shows stale results.**

**Answer:** There are two problems: too many requests, and a **race condition**. A slow response for "ma" can arrive *after* the response for "maria" and overwrite it.

1. Debounce the input (about 250 ms).
2. Abort the previous request with `AbortController` when a new one starts.
3. Alternatively, tag each request with an incrementing ID and ignore any response that isn't the latest.
4. Cache results per query, which React Query does automatically.

```js
let controller;
async function search(q) {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
    render(await res.json());
  } catch (e) {
    if (e.name !== 'AbortError') showError(e);
  }
}
const onInput = debounce((e) => search(e.target.value), 250);
```

**Say it like this:** "Debouncing reduces requests, but it doesn't fix the race. I abort the previous request, so only the latest query can update the UI."

---

**Q134. The page gets slower the longer a call runs.**

**Answer:** Suspect a memory leak or unbounded growth:

- Listeners added on every render.
- Intervals that are never cleared.
- Ever-growing arrays (chat messages, audio-level samples).
- Rendering thousands of DOM nodes.

**Diagnose** by comparing heap snapshots and checking the Performance panel. **Fix** it by cleaning up in `useEffect`, capping buffers (keep the last 200 messages), and virtualising long lists.

---

**Q135. Clicking "Submit" twice creates two records.**

**Answer:** Defend in layers:

1. Disable the button while the request is pending.
2. Guard with an in-flight flag or promise, so a second call returns the same promise.
3. **Server-side:** send an idempotency key (a UUID per attempt), which the server uses to ignore duplicates. This also covers retries and double requests over the network.

---

**Q136. Parsing a 50 MB JSON file of call analytics freezes the UI.**

**Answer:**

- Move the parsing to a **Web Worker** so the main thread stays responsive.
- Better: don't send 50 MB to the browser at all. Paginate, stream, or aggregate on the server so the client gets only what it displays.

---

**Q137. You need to call 200 APIs, but the server allows only 5 concurrent requests.**

**Answer:** Use a concurrency-limited pool (Q120) with a limit of 5, and retry with exponential backoff on HTTP 429, honouring the `Retry-After` header.

---

**Q138. Users in different time zones see the wrong call times.**

**Answer:**

- Store and send times as UTC ISO strings (`2026-10-04T05:00:00Z`).
- Format them for display with `Intl.DateTimeFormat`, using the viewer's time zone or the clinic's configured zone.
- Never parse date strings that have no offset: `new Date('2026-10-04 10:00')` is interpreted as local time, so it differs between machines.

---

**Q139. Billing totals show floating-point errors.**

**Answer:** Store money as integer minor units (paise or cents), do the maths with integers, and format only for display with `Intl.NumberFormat`. Alternatively, use a decimal library.

```js
const totalPaise = items.reduce((s, i) => s + i.pricePaise * i.qty, 0);
format(totalPaise / 100);
```

---

**Q140. An event handler runs, but `this` is undefined.**

**Answer:** The method was detached from its object when it was passed as a callback. Fix it with an arrow wrapper (`() => obj.method()`), `bind`, or a class-field arrow function.

---

**Q141. An `async` callback inside `forEach` doesn't wait before the next line runs.**

**Answer:** `forEach` ignores returned promises. Use `for...of` with `await` for sequential work, or `await Promise.all(items.map(...))` for parallel work (see Q73).

---

**Q142. A third-party script sometimes throws and breaks your app's startup.**

**Answer:**

- Load it `async` so it can't block startup.
- Wrap your integration code in `try/catch`.
- Put it behind a feature flag so you can turn it off quickly.
- Filter its errors in `window.onerror` by source, so it doesn't flood Sentry.

Your app should work even if the script never loads.

---

## 🎯 From Your Resume

**Q143. "How do you consume an SSE stream that needs a bearer token?"**

**Short answer:** The browser's `EventSource` API can't send custom headers. Either use cookie authentication (`new EventSource(url, { withCredentials: true })`), or use `fetch` with a streaming body reader. The second option also supports POST bodies and cancellation.

```js
async function streamChat(body, onToken, signal) {
  const res = await fetch('/api/compliance-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const events = buffer.split('\n\n');      // SSE events end with a blank line
    buffer = events.pop() ?? '';              // keep any partial event for next chunk
    for (const evt of events) {
      const data = evt
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trimStart())
        .join('\n');
      if (data === '[DONE]') return;
      if (data) onToken(data);
    }
  }
}
```

**Say it like this:** "`EventSource` can't set an Authorization header, so for the compliance chat I used `fetch` with a stream reader. I decode the chunks, split on blank lines to get complete SSE events, and keep any partial event in a buffer. Passing an `AbortSignal` lets the user stop generation."

---

**Q144. "How do you avoid memory leaks with LiveKit and media streams?"**

**Say it like this:** "Cleanup on leave or unmount is strict. I call `room.disconnect()`, remove every event listener I added, `stop()` all local tracks so the camera light turns off, detach media elements, clear reconnect timers, and revoke any object URLs. I keep the Room instance outside React state so re-renders never create a second connection."

---

**Q145. "How did you implement reconnect logic on the client?"**

**Say it like this:** "First, I rely on the SDK's built-in resume, which handles brief network blips with an ICE restart. I listen to connection-state events and show a non-blocking 'Reconnecting…' banner, without unmounting the video. If the connection fully drops, I rejoin with exponential backoff plus jitter, fetching a fresh token each time. After N attempts I stop and show a clear 'Rejoin' button. Every attempt is logged, which is how we measured the 99% reconnect success rate."

---

**Q146. "How did Celery workers give you 5x throughput?" (a JavaScript-adjacent follow-up)**

**Say it like this:** "The pipeline was I/O-bound: most of the time was spent waiting on transcription and LLM APIs, not on CPU. Processing chunks one by one wasted that waiting time. We moved to parallel workers with tuned concurrency and batched calls. It's the same principle as `Promise.all` vs sequential awaits in JavaScript: overlap the waiting. We measured throughput as calls processed per hour before and after."
