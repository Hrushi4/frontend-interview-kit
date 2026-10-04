# 06 — TypeScript

**How this file is organised**

- **Part A — Understand the topic:** what TypeScript is, how its type system thinks, and the key concepts, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced (type-level) → TypeScript with React → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is TypeScript?

TypeScript (TS) is JavaScript with **types** added. You write `.ts` or `.tsx` files, and the TypeScript compiler (or a bundler like Vite, esbuild or SWC) checks the types and then strips them out, leaving plain JavaScript that browsers run.

```ts
function totalMinutes(calls: { minutes: number }[]): number {
  return calls.reduce((sum, c) => sum + c.minutes, 0);
}
totalMinutes([{ minutes: '5' }]); // ❌ compile error: string is not assignable to number
```

### Why teams use it

- **Catches bugs before runtime:** typos, null access, wrong arguments.
- **Fearless refactoring:** rename a field and the compiler shows every place to update.
- **Better editor help:** autocomplete, inline docs, go-to-definition.
- **Self-documenting code:** a function's signature tells you what it expects and returns.

### The most important idea: types disappear at runtime

TypeScript checks your code **only while compiling**. At runtime it's plain JavaScript, and the types are gone. So if an API returns `null` where your type says `number`, TypeScript can't stop the crash. Data from outside your code (APIs, localStorage, URL params, LLM output) must be **validated at runtime** with a library like Zod.

### Structural typing

TypeScript compares types by their **shape**, not their name. If two types have the same properties, they're compatible:

```ts
type Point = { x: number; y: number };
type Coord = { x: number; y: number };
const p: Point = { x: 1, y: 2 };
const c: Coord = p;   // ✅ fine — same shape
```

### The building blocks

| Concept | Example | Meaning |
|---|---|---|
| Primitive types | `string`, `number`, `boolean` | basic values |
| Union | `'idle' \| 'live'` | one of these |
| Intersection | `User & { role: Role }` | all of these combined |
| Literal type | `'admin'` | exactly this value |
| Generic | `Array<T>`, `Promise<T>` | a type with a type parameter, like a function for types |
| Narrowing | `if (typeof x === 'string')` | TS refines the type inside a branch |
| Utility types | `Partial<T>`, `Pick<T, K>` | built-in type transformers |

### `strict` mode

`"strict": true` in `tsconfig.json` turns on the checks that make TypeScript worth using. The most important is `strictNullChecks`, which forces you to handle `null` and `undefined`. Always enable it on new projects.

### Why interviewers ask about TypeScript

For senior roles, interviewers check four things:

1. You can **model a domain** with types so impossible states can't be written (discriminated unions).
2. You can write **generic, reusable** code.
3. You know the **limits**: runtime validation, `any` vs `unknown`.
4. You can read advanced types: mapped, conditional, `infer`.

---

## Part B — Interview Questions and Answers

Every answer below has four parts: **Short answer** (say this first), **Explanation** (add if asked for more), **Example** (code or a real situation) and **Say it like this** (a sample spoken answer).

## 🟢 Level 1 — Basics

**Q1. What is TypeScript and why use it?**

**Short answer:** A typed superset of JavaScript that compiles to plain JavaScript, catching errors at build time.

**Explanation:** It makes refactoring safe, gives strong IDE support and documents intent. Types are erased at runtime, so they cost nothing in the browser.

**Example:**

```ts
function totalMinutes(calls: { minutes: number }[]) { return calls.reduce((s, c) => s + c.minutes, 0); }
totalMinutes([{ minutes: '5' }]); // ❌ compile error
```

**Say it like this:** "Its biggest value for me is refactoring: I change an API shape and the compiler shows every place that breaks before users see it."

---

**Q2. What's the difference between compile time and runtime in TypeScript?**

**Short answer:** TypeScript checks types only while compiling; at runtime the types are gone.

**Explanation:** Data from APIs, `localStorage`, URL params or LLMs is unverified, so validate it with Zod or Valibot at the boundary.

**Example:**

```ts
type User = { name: string };
const user = JSON.parse(localStorage.getItem('user')!) as User; // TS trusts you
user.name.toUpperCase(); // crashes if stored data was {}
```

**Say it like this:** "TypeScript protects code I wrote, not data I receive. At every boundary I validate with a Zod schema and derive the type from it."

---

**Q3. What are the basic types?**

**Short answer:** `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`, arrays, tuples, `object`, and the special types `unknown`, `any`, `never` and `void`.

**Explanation:** Arrays are written `string[]` or `Array<string>`; tuples fix length and position types, like `[string, number]`.

**Example:**

```ts
let id: string = 'c1';
let scores: number[] = [80, 92];
let pair: [lat: number, lng: number] = [19.07, 72.87];
```

**Say it like this:** "The primitives map to JavaScript's, plus special types like `unknown` for safe input and `never` for impossible cases."

---

**Q4. What is type inference?**

**Short answer:** TypeScript works out types from values, so you don't annotate everything.

**Explanation:** Annotate function parameters, public return types and exports; let inference handle local variables. `const` infers literal types, `let` widens.

**Example:**

```ts
let count = 5;          // number
const status = 'live';  // 'live'
const ids = [1, 2, 3];  // number[]
```

**Say it like this:** "I annotate the boundaries of functions and modules and let inference handle the inside, which keeps code clean but safe."

---

**Q5. `type` vs `interface`?**

**Short answer:** Both describe object shapes. Only `type` can express unions, tuples and mapped or conditional types; only `interface` supports declaration merging.

**Explanation:**

| | `interface` | `type` |
|---|---|---|
| Object shapes | ✅ | ✅ |
| Unions, tuples, primitives | ❌ | ✅ |
| Declaration merging | ✅ | ❌ |
| Extending | `extends` | `&` |

**Example:**

```ts
interface User { id: string; name: string }
interface User { email: string }          // merges
type Status = 'idle' | 'live';            // only type can do this
type Admin = User & { permissions: string[] };
```

**Say it like this:** "I use `interface` for public object contracts and `type` for unions and computed types. Consistency in the codebase matters more than the choice."

---

**Q6. How do you declare optional and readonly properties?**

**Short answer:** Use `?` for optional and `readonly` for properties that can't be reassigned.

**Explanation:** An optional property has type `T | undefined`, so you must handle the missing case. `readonly` is compile-time only.

**Example:**

```ts
interface User {
  readonly id: string;
  name: string;
  email?: string;
}
```

**Say it like this:** "IDs are `readonly` so nobody reassigns them by accident, and optional fields force me to handle the missing case."

---

**Q7. What are union types?**

**Short answer:** A value that can be one of several types, written with `|`.

**Explanation:** You narrow a union before using type-specific features. Literal unions are a great alternative to enums.

**Example:**

```ts
type Status = 'idle' | 'connecting' | 'live' | 'ended';
function show(id: string | number) { return typeof id === 'number' ? id.toFixed() : id; }
```

**Say it like this:** "Unions model 'one of these'. Combined with narrowing, they make invalid values impossible to pass."

---

**Q8. What are intersection types?**

**Short answer:** A value that has all the members of the combined types, written with `&`.

**Explanation:** Intersections combine reusable pieces, like timestamps or tenant info. Conflicting property types intersect to `never`.

**Example:**

```ts
type Timestamps = { createdAt: Date; updatedAt: Date };
type Call = { id: string; duration: number } & Timestamps;
```

**Say it like this:** "Intersections let me compose types from small reusable parts, like adding timestamps to any entity."

---

**Q9. What are literal types?**

**Short answer:** Types representing one exact value, like `'admin'` or `42`.

**Explanation:** `const x = 'a'` infers `'a'`; `let x = 'a'` widens to `string` because it can change. Unions of literals model fixed sets of values.

**Example:**

```ts
let dir: 'left' | 'right' = 'left';
dir = 'up'; // ❌
```

**Say it like this:** "Literal unions are how I type things like roles and statuses, so typos become compile errors."

---

**Q10. `any` vs `unknown`?**

**Short answer:** `any` switches off type checking and spreads silently; `unknown` accepts anything but forces you to narrow before use.

**Explanation:** `unknown` is the safe type for external input and caught errors. `any` should be banned with ESLint.

**Example:**

```ts
function handle(value: unknown) {
  value.toUpperCase();                                  // ❌ must narrow
  if (typeof value === 'string') value.toUpperCase();   // ✅
}
```

**Say it like this:** "`any` means 'don't check'; `unknown` means 'make me check'. I ban `any` and use `unknown` for anything external."

---

**Q11. `void` vs `undefined` vs `never`?**

**Short answer:** `void` means the return value should be ignored; `undefined` means it literally returns undefined; `never` means it never returns or the value is impossible.

**Explanation:** `never` is used for functions that always throw and for exhaustiveness checks.

**Example:**

```ts
function log(msg: string): void { console.log(msg); }
function fail(msg: string): never { throw new Error(msg); }
```

**Say it like this:** "`void` is 'ignore the result', `never` is 'this can't happen', which I use for exhaustive switches."

---

**Q12. How do you type functions?**

**Short answer:** Annotate parameters and, for public functions, the return type; use function type aliases for callbacks.

**Explanation:** Explicit return types catch accidental changes to what a function returns.

**Example:**

```ts
function add(a: number, b: number): number { return a + b; }
type Handler = (event: CustomEvent) => void;
const greet = (name: string, title?: string): string => `${title ?? ''} ${name}`.trim();
```

**Say it like this:** "Parameters are always typed, and public functions get explicit return types so their contract can't drift silently."

---

**Q13. Optional vs default parameters?**

**Short answer:** `x?: number` may be `undefined`; `x = 10` infers `number` and uses 10 when nothing is passed.

**Explanation:** Inside the function, an optional parameter must be handled as possibly undefined, while a defaulted one never is.

**Example:**

```ts
function page(size?: number) { return size ?? 20; }
function page2(size = 20) { return size; } // size: number
```

**Say it like this:** "Defaults are usually cleaner than optionals, because inside the function the value is always defined."

---

**Q14. What are type assertions (`as`)?**

**Short answer:** They tell the compiler to treat a value as a type, with no runtime check.

**Explanation:** Use them sparingly, for things TypeScript can't know, like a specific DOM element type. Avoid double assertions (`as unknown as X`) outside tests.

**Example:**

```ts
const video = document.getElementById('local-video') as HTMLVideoElement;
```

**Say it like this:** "An assertion is me overriding the compiler, so I only use it when I genuinely know more than it does."

---

**Q15. What is the non-null assertion `!`?**

**Short answer:** It tells TypeScript a value isn't null or undefined.

**Explanation:** If you're wrong, it crashes at runtime. Prefer narrowing (`if (ref.current)`) or optional chaining.

**Example:**

```ts
ref.current!.play();           // risky
ref.current?.play();           // safe
```

**Say it like this:** "I treat `!` as a code smell and narrow instead, because it hides real null cases."

---

**Q16. Enums vs union literals?**

**Short answer:** Enums generate runtime objects with some quirks; string unions or `as const` objects are usually better.

**Explanation:** Numeric enums accept any number and have reverse mappings. `as const` objects give both runtime values and a derived union type.

**Example:**

```ts
const Role = { Admin: 'admin', QA: 'qa', Agent: 'agent' } as const;
type Role = (typeof Role)[keyof typeof Role]; // 'admin' | 'qa' | 'agent'
```

**Say it like this:** "I prefer `as const` objects over enums: plain JavaScript at runtime and a precise union type at compile time."

---

**Q17. Arrays vs tuples?**

**Short answer:** Arrays have any length and one element type; tuples have a fixed length and a type per position.

**Explanation:** Tuples can name their elements for readability. `readonly string[]` prevents mutation.

**Example:**

```ts
const [value, setValue] = useState(0);         // useState returns a tuple
type Point = [lat: number, lng: number];
```

**Say it like this:** "Tuples are for small fixed groups, like what `useState` returns; for anything bigger, an object with names is clearer."

---

**Q18. What is an index signature?**

**Short answer:** A type for objects with arbitrary keys: `{ [key: string]: number }` or `Record<string, number>`.

**Explanation:** Accessing a key returns `number`, even if it doesn't exist; `noUncheckedIndexedAccess` makes it `number | undefined`, which is safer.

**Example:**

```ts
type ScoresByAgent = Record<string, number>;
const scores: ScoresByAgent = { asha: 88 };
```

**Say it like this:** "`Record` types lookup maps, and I enable `noUncheckedIndexedAccess` so missing keys are handled."

---

**Q19. Which `tsconfig.json` options matter most?**

**Short answer:** `target`, `module`, `moduleResolution`, `strict`, `jsx`, `paths`, `noEmit`, `skipLibCheck`, `isolatedModules` and `esModuleInterop`.

**Explanation:** `moduleResolution: "bundler"` suits Vite and Next.js; `noEmit` is used when a bundler compiles; `isolatedModules` is required by esbuild and SWC.

**Example:**

```json
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
  "strict": true, "jsx": "react-jsx", "noEmit": true, "paths": { "@/*": ["./src/*"] } } }
```

**Say it like this:** "The non-negotiable is `strict: true`; the rest mostly align TypeScript with the bundler."

---

**Q20. What does `strict: true` enable?**

**Short answer:** `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict` and `useUnknownInCatchVariables`.

**Explanation:** `strictNullChecks` alone prevents the most common runtime error: reading a property of undefined.

**Example:**

```ts
const user = users.find((u) => u.id === id);
user.name; // ❌ with strict: 'user' is possibly 'undefined'
```

**Say it like this:** "I wouldn't start a project without strict mode; null checks alone prevent a whole class of production crashes."

---

## 🟡 Level 2 — Intermediate

**Q21. What narrowing techniques are there?**

**Short answer:** `typeof`, `instanceof`, `in`, equality checks, truthiness, discriminant checks, `Array.isArray`, type guards and assertion functions.

**Explanation:** After a check, TypeScript refines the type inside that branch.

**Example:**

```ts
function format(input: string | number | Date | null) {
  if (input == null) return '—';
  if (typeof input === 'number') return input.toFixed(2);
  if (input instanceof Date) return input.toISOString();
  return input.trim(); // string
}
```

**Say it like this:** "Narrowing is TypeScript following my `if` statements, so each branch knows the exact type."

---

**Q22. What is a user-defined type guard?**

**Short answer:** A function returning `value is Type`; when it returns true, TypeScript narrows the value.

**Explanation:** It's useful for checking unknown errors or API shapes, but the guard's logic must actually be correct, because TypeScript trusts it.

**Example:**

```ts
type ApiError = { status: number; message: string };
function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}
```

**Say it like this:** "Type guards wrap a runtime check so the compiler knows the result, which is great for caught errors."

---

**Q23. What is an assertion function?**

**Short answer:** A function that throws if a condition fails and narrows the type for the rest of the scope.

**Explanation:** Its return type is `asserts v is T` (or `asserts condition`). It replaces repeated `if (!x) throw` blocks.

**Example:**

```ts
function assertDefined<T>(v: T, msg = 'Expected value'): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg);
}
assertDefined(room, 'Room not ready');
room.connect();
```

**Say it like this:** "An assertion function is a guard clause the compiler understands: after it, the value is non-null."

---

**Q24. What are discriminated unions, and how do you check exhaustiveness?**

**Short answer:** Unions where each member has a shared literal field (the discriminant); a `never` default in a switch makes the compiler fail when a case is missing.

**Explanation:** Each state carries only its own data, so impossible states can't be represented, and adding a state forces every switch to handle it.

**Example:**

```ts
type CallState =
  | { status: 'idle' }
  | { status: 'connecting'; attempt: number }
  | { status: 'live'; roomId: string }
  | { status: 'failed'; error: string };

function label(s: CallState): string {
  switch (s.status) {
    case 'idle': return 'Ready';
    case 'connecting': return `Connecting (${s.attempt})`;
    case 'live': return `Live in ${s.roomId}`;
    case 'failed': return `Failed: ${s.error}`;
    default: { const _x: never = s; return _x; }
  }
}
```

**Say it like this:** "Discriminated unions make impossible states impossible. I used one for the LiveKit call lifecycle, and new states were compile errors until every screen handled them."

---

**Q25. Why use generics?**

**Short answer:** To write reusable code that keeps the relationship between input and output types.

**Explanation:** Without generics you'd use `any` and lose typing, or duplicate the function per type. A generic is a type parameter, like a function parameter for types.

**Example:**

```ts
function first<T>(items: T[]): T | undefined { return items[0]; }
first([1, 2]);     // number | undefined
first(['a']);      // string | undefined
```

**Say it like this:** "Generics let one function work for many types while still returning the exact type you passed in."

---

**Q26. What are generic constraints?**

**Short answer:** `extends` limits which types a generic accepts, so you can safely use their properties.

**Explanation:** `K extends keyof T` is the classic pattern for typed property access.

**Example:**

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] { return items.map((i) => i[key]); }
pluck([{ id: 'a', score: 90 }], 'score'); // number[]
pluck([{ id: 'a' }], 'nope');             // ❌
```

**Say it like this:** "Constraints say 'any type, as long as it has this shape', which keeps generics flexible but safe."

---

**Q27. What are default generic parameters?**

**Short answer:** A fallback type used when the caller doesn't specify one: `<T = unknown>`.

**Explanation:** They make generic types convenient to use without forcing every caller to pass a type argument.

**Example:**

```ts
interface ApiResponse<T = unknown> { data: T; error?: string }
const r: ApiResponse = { data: null };
const u: ApiResponse<User> = { data: user };
```

**Say it like this:** "Defaults make generic APIs ergonomic: simple cases need no type argument."

---

**Q28. How do `keyof`, `typeof` and indexed access work?**

**Short answer:** `typeof` gets the type of a value, `keyof` gets a union of a type's keys, and `T['key']` looks up a property's type.

**Explanation:** Together they derive types from existing values, so you don't duplicate definitions.

**Example:**

```ts
const config = { theme: 'dark', retries: 3 };
type Config = typeof config;
type ConfigKey = keyof Config;     // 'theme' | 'retries'
type Retries = Config['retries'];  // number
type Call = Calls[number];         // element type of an array
```

**Say it like this:** "I derive types from the source of truth with `typeof` and `keyof` instead of writing them twice."

---

**Q29. Which built-in utility types should you know?**

**Short answer:** `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited` and `NoInfer`.

**Explanation:** They transform existing types, for example deriving an update payload or a public user type.

**Example:**

```ts
type User = { id: string; name: string; email: string; password: string };
type PublicUser = Omit<User, 'password'>;
type UserUpdate = Partial<Pick<User, 'name' | 'email'>>;
type Data = Awaited<ReturnType<typeof fetchUser>>;
```

**Say it like this:** "Utility types let me derive variants of one model, like a public user without the password, so they never drift."

---

**Q30. What does `as const` do?**

**Short answer:** It infers the narrowest type: literal values and readonly arrays and objects.

**Explanation:** It's the standard way to create a union type from a runtime list of values.

**Example:**

```ts
const PERMISSIONS = ['calls:read', 'calls:score', 'users:manage'] as const;
type Permission = (typeof PERMISSIONS)[number];
```

**Say it like this:** "I define the list once with `as const` and derive the union from it, so dropdown options and the type can't drift apart."

---

**Q31. What is the `satisfies` operator?**

**Short answer:** It checks that a value matches a type without widening the value's own inferred type.

**Explanation:** A plain annotation would lose the specific keys and literal values; `satisfies` keeps them while still validating.

**Example:**

```ts
const routes = { home: '/', calls: '/calls', call: '/calls/:id' } satisfies Record<string, `/${string}`>;
routes.call; // still '/calls/:id', with autocomplete for keys
```

**Say it like this:** "`satisfies` validates a config object against a type but keeps its precise inferred type, so I get both safety and autocomplete."

---

**Q32. What are function overloads?**

**Short answer:** Several call signatures for one implementation.

**Explanation:** They're useful when the return type depends on the argument type in ways a union can't express. Prefer unions or generics when they can.

**Example:**

```ts
function parse(input: string): Date;
function parse(input: number): Date;
function parse(input: string | number) { return new Date(input); }
```

**Say it like this:** "Overloads describe several valid ways to call a function; I reach for them only when generics can't express it."

---

**Q33. What type does optional chaining produce?**

**Short answer:** The property type plus `undefined`: `user?.address?.city` is `string | undefined`.

**Explanation:** You must handle the undefined case, often with `??` for a default.

**Example:**

```ts
const city = user?.address?.city ?? 'Unknown';
```

**Say it like this:** "Optional chaining adds `undefined` to the type, and `??` gives the fallback in one expression."

---

**Q34. What are type-only imports and exports?**

**Short answer:** `import type { User } from './types'` is erased completely from the JavaScript output.

**Explanation:** It prevents accidental runtime imports and circular dependencies, and `verbatimModuleSyntax` requires it.

**Example:**

```ts
import type { CallState } from './callMachine';
export type { CallState };
```

**Say it like this:** "Type-only imports guarantee a types file never ends up in the bundle or creates a runtime cycle."

---

**Q35. How do classes work in TypeScript?**

**Short answer:** They add access modifiers (`public`, `private`, `protected`), `readonly`, parameter properties, `abstract` classes and `implements`.

**Explanation:** TypeScript's `private` is compile-time only; JavaScript's `#private` is enforced at runtime.

**Example:**

```ts
class Session {
  #secret = '';
  constructor(private readonly id: string, protected ttl = 3600) {}
}
```

**Say it like this:** "Parameter properties remove boilerplate, and for real privacy I use `#` fields rather than the `private` keyword."

---

**Q36. What is the type of a caught error?**

**Short answer:** With `useUnknownInCatchVariables` (part of strict), it's `unknown`, because anything can be thrown.

**Explanation:** Narrow before using it, with `instanceof Error` or a type guard.

**Example:**

```ts
try { await save(); } catch (e) {
  const message = e instanceof Error ? e.message : String(e);
}
```

**Say it like this:** "Caught errors are `unknown`, so I narrow them, because JavaScript lets you throw anything, even a string."

---

**Q37. What are declaration files (`.d.ts`)?**

**Short answer:** Files that describe types for JavaScript code, with no implementation.

**Explanation:** Use `@types/*` packages for popular libraries, `declare module 'x'` for untyped ones, and `declare global` to extend globals.

**Example:**

```ts
declare global {
  interface Window { analytics: { track(event: string): void } }
}
```

**Say it like this:** "Declaration files add types to JavaScript I don't control, like a third-party analytics global."

---

**Q38. What is module augmentation?**

**Short answer:** Adding fields to a library's types from your own code by redeclaring its module.

**Explanation:** It's how you extend library extension points, like column metadata in TanStack Table.

**Example:**

```ts
import '@tanstack/react-table';
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> { align?: 'left' | 'right' }
}
```

**Say it like this:** "Augmentation lets me add typed fields to a library's interfaces without forking it."

---

**Q39. How do you type environment variables?**

**Short answer:** Declare them (for Vite, in `ImportMetaEnv`), and also validate them at startup.

**Explanation:** Types don't prove the variables are actually set in a given deployment. A Zod check at boot fails fast with a clear message.

**Example:**

```ts
interface ImportMetaEnv { readonly VITE_API_URL: string; readonly VITE_LIVEKIT_URL: string }
const env = z.object({ VITE_API_URL: z.string().url() }).parse(import.meta.env);
```

**Say it like this:** "Typed env vars help autocomplete, but a startup validation is what catches a missing variable in a real deploy."

---

**Q40. How do you type `fetch` responses safely?**

**Short answer:** Validate the response with a Zod schema and derive the type from that schema.

**Explanation:** The schema is the single source of truth: the runtime check and the type can't drift apart.

**Example:**

```ts
const CallSchema = z.object({ id: z.string(), agent: z.string(), score: z.number().nullable() });
type Call = z.infer<typeof CallSchema>;
async function getCalls(): Promise<Call[]> {
  const res = await fetch('/api/calls');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return z.array(CallSchema).parse(await res.json());
}
```

**Say it like this:** "If the backend changes shape, we get a clear validation error at the boundary instead of a mysterious crash deep in the UI."

---

## 🔴 Level 3 — Advanced (Type-Level Programming)

**Q41. What are mapped types?**

**Short answer:** Types that loop over keys to build a new type: `{ [K in keyof T]: … }`.

**Explanation:** `Partial`, `Readonly` and `Record` are mapped types. Modifiers `+?`, `-?`, `+readonly` and `-readonly` add or remove optionality and readonly.

**Example:**

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

**Say it like this:** "A mapped type is a for-loop over keys at the type level."

---

**Q42. What is key remapping with `as`?**

**Short answer:** `as` in a mapped type renames keys or filters them out (mapping to `never` removes a key).

**Explanation:** Combined with template literal types it can generate getter names or pick keys by value type.

**Example:**

```ts
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
```

**Say it like this:** "Key remapping lets a mapped type rename or filter keys, like generating `getName` from `name`."

---

**Q43. What are conditional types?**

**Short answer:** If/else for types: `T extends U ? X : Y`.

**Explanation:** They power utilities like `Exclude`, `NonNullable` and `ReturnType`.

**Example:**

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<'hi'>; // true
type B = IsString<42>;   // false
```

**Say it like this:** "Conditional types choose a type based on another type, which is how most built-in utilities work."

---

**Q44. What does `infer` do?**

**Short answer:** It captures part of a type during a conditional match, like a pattern-matching variable.

**Explanation:** It extracts element types, promise values, function arguments and return types.

**Example:**

```ts
type ElementType<T> = T extends readonly (infer U)[] ? U : never;
type PromiseValue<T> = T extends Promise<infer V> ? V : T;
type X = ElementType<string[]>; // string
```

**Say it like this:** "`infer` says 'match this shape and give me the piece inside', like unwrapping a Promise type."

---

**Q45. What are distributive conditional types?**

**Short answer:** A conditional type on a bare type parameter is applied to each union member separately.

**Explanation:** Wrapping in a tuple (`[T] extends [U]`) turns distribution off when you want to treat the union as a whole.

**Example:**

```ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>;      // string[] | number[]
type ToArrayND<T> = [T] extends [any] ? T[] : never;
type R2 = ToArrayND<string | number>;   // (string | number)[]
```

**Say it like this:** "Conditionals distribute over unions by default, which is how `Exclude` filters members; a tuple wrapper stops it."

---

**Q46. What are template literal types?**

**Short answer:** String types built from other types with template syntax.

**Explanation:** They type event names, CSS values and API paths precisely.

**Example:**

```ts
type CallEvent = 'join' | 'leave';
type Handler = `on${Capitalize<CallEvent>}`;           // 'onJoin' | 'onLeave'
type ApiPath = `/api/${'calls' | 'users'}/${string}`;
```

**Say it like this:** "Template literal types let me type string patterns, like handler names generated from event names."

---

**Q47. What are recursive types?**

**Short answer:** Types that refer to themselves, for nested structures like JSON or deep partials.

**Explanation:** Keep recursion bounded where possible, because very deep recursion slows the compiler.

**Example:**

```ts
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
```

**Say it like this:** "Recursive types describe nested data like JSON or a settings tree, but I keep them simple for compiler performance."

---

**Q48. How do you extract route params from a path string?**

**Short answer:** Use template literal pattern matching with `infer` and recursion.

**Explanation:** Routers like React Router and TanStack Router use this to type `useParams`, so a typo in a param name is a compile error.

**Example:**

```ts
type Params<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof Params<Rest>]: string }
    : P extends `${string}:${infer Param}` ? { [K in Param]: string } : {};
type T = Params<'/tenants/:tenantId/calls/:callId'>; // { tenantId: string; callId: string }
```

**Say it like this:** "The type parses the path string itself, so route params are typed directly from the route definition."

---

**Q49. Implement `Pick`, `Omit`, `Exclude`, `ReturnType` and `Awaited` yourself.**

**Short answer:** Mapped types for Pick and Omit, conditional types for Exclude, and `infer` for ReturnType and Awaited.

**Explanation:** Writing them shows you understand the building blocks rather than memorising utilities.

**Example:**

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends PropertyKey> = MyPick<T, MyExclude<keyof T, K>>;
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;
```

**Say it like this:** "Pick is a mapped type, Exclude a distributive conditional, Omit combines both, and ReturnType uses `infer`."

---

**Q50. What are branded (nominal) types?**

**Short answer:** A string or number type tagged with a phantom brand, so `TenantId` and `UserId` are incompatible even though both are strings.

**Explanation:** Structural typing treats all strings as equal; a brand restores nominal behaviour at zero runtime cost. Create branded values through validating functions.

**Example:**

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'TenantId'>;
type UserId = Brand<string, 'UserId'>;
function getCalls(tenant: TenantId) {}
getCalls('u_123' as UserId); // ❌
```

**Say it like this:** "In a multi-tenant app, passing a user ID where a tenant ID is expected could leak data, so brands make that a compile error."

---

**Q51. What are covariance and contravariance?**

**Short answer:** Covariant positions (return types, reading arrays) accept subtypes; contravariant positions (function parameters under `strictFunctionTypes`) accept supertypes.

**Explanation:** A handler that accepts any `Animal` can be used where a `Dog` handler is expected, but not the reverse. Method-shorthand parameters are bivariant, a legacy unsound behaviour.

**Example:**

```ts
type Handler<T> = (value: T) => void;
const handleAnimal: Handler<Animal> = () => {};
const h: Handler<Dog> = handleAnimal; // ✅ contravariance
```

**Say it like this:** "Outputs can be more specific, inputs more general. That's why callback parameter types sometimes surprise people."

---

**Q52. What does structural typing imply?**

**Short answer:** Types are compatible if their shapes match, regardless of names; excess property checks apply only to fresh object literals.

**Explanation:** It makes TypeScript flexible but means different concepts with the same shape are interchangeable unless you brand them.

**Example:**

```ts
type P = { x: number };
const a: P = { x: 1, y: 2 };   // ❌ excess property (fresh literal)
const tmp = { x: 1, y: 2 };
const b: P = tmp;              // ✅ allowed
```

**Say it like this:** "TypeScript compares shapes, not names; when names matter, like IDs, I use branded types."

---

**Q53. What is `never` useful for besides exhaustiveness checks?**

**Short answer:** Filtering keys in mapped types, impossible branches, functions that always throw, and forbidding properties.

**Explanation:** `b?: never` means "this property must not be passed", which helps model mutually exclusive props.

**Example:**

```ts
type LinkOnly = { href: string; onClick?: never };
```

**Say it like this:** "`never` is the empty type, so I use it to say 'this can't exist', from exhaustive switches to forbidden props."

---

**Q54. How do you make mutually exclusive props (XOR)?**

**Short answer:** Build a union where each side forbids the other's keys with `?: never`.

**Explanation:** Without it, a component accepting `href | onClick` allows both at once.

**Example:**

```ts
type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);
type LinkOrButton = XOR<{ href: string }, { onClick: () => void }>;
```

**Say it like this:** "An XOR type makes passing both `href` and `onClick` a compile error, so the component's contract is clear."

---

**Q55. What are `const` type parameters?**

**Short answer:** `<const T>` makes a generic infer literal, readonly types without callers writing `as const`.

**Explanation:** It's useful for helpers that take configuration arrays or objects.

**Example:**

```ts
function tuple<const T extends readonly unknown[]>(x: T) { return x; }
const t = tuple(['a', 1]); // readonly ['a', 1]
```

**Say it like this:** "`const` type parameters give precise literal types from config helpers without burdening callers."

---

**Q56. What does `NoInfer` do?**

**Short answer:** It stops a parameter contributing to generic inference.

**Explanation:** Without it, a default value can widen the inferred type instead of being checked against it.

**Example:**

```ts
function setDefault<T>(values: T[], fallback: NoInfer<T>) {}
setDefault(['a', 'b'], 1); // ❌ instead of widening T to string | number
```

**Say it like this:** "`NoInfer` tells TypeScript to infer from one argument and only check the other."

---

**Q57. How do complex types affect performance?**

**Short answer:** Deeply recursive conditional types and huge unions slow down the compiler and IDE.

**Explanation:** Prefer interfaces over big intersections, limit recursion, enable `skipLibCheck`, use project references, and profile with `--extendedDiagnostics` or `--generateTrace`.

**Example:** `tsc --generateTrace ./trace` revealed one route-params type taking seconds; simplifying it fixed the slow editor.

**Say it like this:** "Type cleverness has a cost, so when the IDE gets slow I profile the compiler instead of guessing."

---

**Q58. How do project references work in a monorepo?**

**Short answer:** Each package sets `composite: true`, and dependents list it in `references`, so builds are incremental.

**Explanation:** TypeScript only rebuilds changed packages, and boundaries between packages become explicit. Share settings with a base tsconfig.

**Example:**

```json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "composite": true }, "references": [{ "path": "../ui" }] }
```

**Say it like this:** "Project references keep a monorepo's type-checking fast and make package dependencies explicit."

---

**Q59. How do you emit declarations for a component library?**

**Short answer:** Enable `declaration` and `declarationMap`, export types through `package.json` `exports` with a `types` condition, and expose only the public entry point.

**Explanation:** Consumers then get types, go-to-definition into your source, and no imports from internal paths.

**Example:**

```json
{ "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } } }
```

**Say it like this:** "A library ships its `.d.ts` files with proper `exports`, so consumers get types and only the public API."

---

**Q60. When are `unique symbol`, abstract constructor types and `this` types used?**

**Short answer:** In library patterns: guaranteed-unique keys, mixins, and fluent builders whose methods return `this`.

**Explanation:** `this` return types keep chaining typed in subclasses; abstract constructor types let mixins accept abstract classes.

**Example:**

```ts
class QueryBuilder {
  where(clause: string): this { /* … */ return this; }
}
```

**Say it like this:** "These are mostly for library authors; in app code I'd mostly see `this` types in fluent builders."

---

## ⚛️ TypeScript with React

**Q61. How do you type props and children?**

**Short answer:** Write a props type and use `React.ReactNode` for anything renderable.

**Explanation:** `React.FC` works but isn't needed; explicit props on a function are clearer and handle generics better.

**Example:**

```tsx
type CardProps = { title: string; footer?: React.ReactNode; children: React.ReactNode };
function Card({ title, footer, children }: CardProps) {
  return (<section><h2>{title}</h2>{children}{footer}</section>);
}
```

**Say it like this:** "Props get an explicit type, and `ReactNode` covers anything React can render."

---

**Q62. How do you extend native element props?**

**Short answer:** Intersect `React.ComponentPropsWithoutRef<'button'>` (or `ComponentProps` in React 19) with your own props.

**Explanation:** Every native prop (type, disabled, aria-*) then works and is type-checked, and you spread the rest onto the element.

**Example:**

```tsx
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'ghost' };
function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button data-variant={variant} {...rest} />;
}
```

**Say it like this:** "Design-system components extend native props, so consumers get every HTML attribute with types for free."

---

**Q63. Which React event types should you know?**

**Short answer:** `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`, `React.KeyboardEvent<HTMLDivElement>` and `React.MouseEvent<HTMLButtonElement>`.

**Explanation:** The generic parameter types `e.currentTarget`, so you get the right properties, like `value` on an input.

**Example:**

```tsx
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);
```

**Say it like this:** "React's event types are generic over the element, which gives me typed `currentTarget` properties."

---

**Q64. How do you type `useState`?**

**Short answer:** Pass a type argument when the initial value doesn't show the full type, like `null` or an empty array.

**Explanation:** Using a discriminated union for complex state prevents impossible combinations.

**Example:**

```tsx
const [user, setUser] = useState<User | null>(null);
const [call, setCall] = useState<CallState>({ status: 'idle' });
```

**Say it like this:** "When the initial value is `null` or `[]`, I tell `useState` the real type, otherwise TypeScript infers something too narrow."

---

**Q65. How do you type `useRef`?**

**Short answer:** `useRef<HTMLVideoElement>(null)` for DOM refs, and `useRef<T | undefined>(undefined)` for mutable values.

**Explanation:** The DOM form gives a ref object React manages; the mutable form lets you assign `.current` yourself.

**Example:**

```tsx
const videoRef = useRef<HTMLVideoElement>(null);
const timerRef = useRef<number | undefined>(undefined);
```

**Say it like this:** "DOM refs start as `null` with the element type; mutable refs include `undefined` in their type."

---

**Q66. How do you type `useReducer`?**

**Short answer:** Type the state and make actions a discriminated union, so each action's payload is checked.

**Explanation:** The reducer's switch narrows each action, and a missing case can be caught with `never`.

**Example:**

```ts
type Action = { type: 'join'; roomId: string } | { type: 'leave' } | { type: 'fail'; error: string };
function reducer(state: CallState, action: Action): CallState {
  switch (action.type) {
    case 'join': return { status: 'live', roomId: action.roomId };
    case 'leave': return { status: 'idle' };
    case 'fail': return { status: 'failed', error: action.error };
  }
}
```

**Say it like this:** "Actions as a discriminated union mean every dispatch is checked and every case has the right payload."

---

**Q67. How do you build a typed context with a guard hook?**

**Short answer:** Create the context with `null` as the default and expose a hook that throws if used outside the provider.

**Explanation:** Consumers then get a non-null type and misuse fails loudly in development.

**Example:**

```tsx
const RoomCtx = createContext<RoomApi | null>(null);
export function useRoom() {
  const ctx = useContext(RoomCtx);
  if (!ctx) throw new Error('useRoom must be used inside <RoomProvider>');
  return ctx;
}
```

**Say it like this:** "The guard hook removes null checks from every consumer and catches a missing provider immediately."

---

**Q68. How do you write a generic component?**

**Short answer:** Add a type parameter to the component function and use it in the props.

**Explanation:** A generic table then type-checks column keys against the row type.

**Example:**

```tsx
type TableProps<Row> = { rows: Row[]; columns: { key: keyof Row; header: string }[]; getRowId: (r: Row) => string };
function Table<Row>({ rows, columns, getRowId }: TableProps<Row>) {
  return <table><tbody>{rows.map((r) => <tr key={getRowId(r)}>{columns.map((c) => <td key={String(c.key)}>{String(r[c.key])}</td>)}</tr>)}</tbody></table>;
}
```

**Say it like this:** "A generic table catches a misspelled column key at compile time."

---

**Q69. How do you type a polymorphic `as` prop?**

**Short answer:** Make the component generic over `React.ElementType` and take the props of whichever element is passed.

**Explanation:** `<Text as="label" htmlFor="x">` then checks `htmlFor` against label props.

**Example:**

```tsx
type PolyProps<E extends React.ElementType> = { as?: E } & Omit<React.ComponentPropsWithoutRef<E>, 'as'>;
function Text<E extends React.ElementType = 'span'>({ as, ...rest }: PolyProps<E>) {
  const C = as ?? 'span';
  return <C {...rest} />;
}
```

**Say it like this:** "Polymorphic components keep semantics flexible while still type-checking the chosen element's props."

---

**Q70. How do you type a custom hook's return value?**

**Short answer:** Return a tuple with `as const` for two values, or a named object for three or more.

**Explanation:** Without `as const`, a returned array is inferred as a union array and loses position types.

**Example:**

```ts
function useToggle(initial = false) {
  const [on, set] = useState(initial);
  return [on, () => set((v) => !v)] as const;
}
```

**Say it like this:** "Tuples need `as const` to keep their positions typed; for more values I return an object."

---

**Q71. How do you type Redux Toolkit?**

**Short answer:** Derive `RootState` and `AppDispatch` from the store and create typed hooks.

**Explanation:** Then every selector and dispatch is typed without annotating them individually.

**Example:**

```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
```

**Say it like this:** "The store is the source of truth for its types; components use the typed hooks."

---

**Q72. How do you type forms with Zod and React Hook Form?**

**Short answer:** Define a Zod schema, infer the form type from it, and pass `zodResolver` to `useForm`.

**Explanation:** One schema gives validation rules, error messages and the TypeScript type.

**Example:**

```ts
const ScoreFormSchema = z.object({ callId: z.string(), score: z.number().min(0).max(100), comment: z.string().optional() });
type ScoreForm = z.infer<typeof ScoreFormSchema>;
const form = useForm<ScoreForm>({ resolver: zodResolver(ScoreFormSchema) });
```

**Say it like this:** "For scorecards one Zod schema drove both validation and types, so they could never disagree."

---

## 🧩 Level 4 — Scenario-Based

**Q73. The API sometimes returns `score: null`, and the UI crashes even though the types say `number`.**

**Short answer:** Validate at the boundary, correct the type to `number | null`, handle null in the UI, and generate types from the API contract.

**Explanation:** Hand-written types are promises nobody checks. Runtime validation makes bad data fail loudly where it enters.

**Example:** `score: z.number().nullable()` in the schema, and the UI shows "Not scored" when it's null.

**Say it like this:** "The types lied because they were written by hand. I'd make the runtime schema the source of truth and derive the type from it."

---

**Q74. A refactor renamed a status from `'live'` to `'connected'`, and some screens silently broke.**

**Short answer:** Model status as a union with exhaustive switches and central helpers, so renames become compile errors.

**Explanation:** Raw string comparisons scattered around the code (`status === 'live'`) can't be checked once a status is renamed if they're typed as `string`.

**Example:** `type Status = 'idle' | 'connected' | 'ended'` plus `isActive(status)` helper; the old `'live'` comparisons now fail to compile.

**Say it like this:** "With a typed union, a rename shows every place to update before it ships."

---

**Q75. Developers keep passing `userId` where `tenantId` is expected.**

**Short answer:** Use branded types created only by validating constructor functions.

**Explanation:** Both are strings structurally; the brand makes them incompatible at compile time with no runtime cost.

**Example:**

```ts
const parseTenantId = (raw: string): TenantId => { if (!raw.startsWith('t_')) throw new Error(); return raw as TenantId; };
```

**Say it like this:** "Branded IDs turn a potential data-leak bug into a compile error."

---

**Q76. What's your plan for migrating a large JavaScript codebase to TypeScript?**

**Short answer:** Incrementally: `allowJs`, convert leaf modules first, tighten strictness gradually, block new `any`, and generate API types early.

**Explanation:** A big-bang migration stalls feature work. Tracking the `any` count shows progress.

**Example:** Week 1: tsconfig with `allowJs` and API types from OpenAPI. Weeks 2–6: utils and API clients converted. Then components, with `strict` enabled folder by folder.

**Say it like this:** "I'd migrate leaf-first and tighten gradually, so the team keeps shipping features while type coverage rises."

---

**Q77. Type-checking is slow in CI and the IDE lags.**

**Short answer:** Enable `skipLibCheck`, use project references, simplify heavy types, split barrel files, and profile with `--generateTrace`.

**Explanation:** A few expensive types or huge barrel files often cause most of the slowdown.

**Example:** Replacing a 300-export `index.ts` barrel with direct imports cut editor latency noticeably.

**Say it like this:** "I'd measure with the compiler trace and fix the hotspots rather than turning checks off."

---

**Q78. A component should accept `href` or `onClick`, but never both.**

**Short answer:** Use an XOR props type or a discriminated union on a `kind` field.

**Explanation:** It makes the component's contract explicit and catches invalid usage at compile time.

**Example:**

```ts
type Props = { kind: 'link'; href: string } | { kind: 'button'; onClick: () => void };
```

**Say it like this:** "A union of the two shapes means the component can't be used with both, so its behaviour is unambiguous."

---

**Q79. You need types shared between a FastAPI or NestJS backend and a React frontend.**

**Short answer:** Generate them from the API contract: OpenAPI generators or GraphQL codegen, or a shared Zod package in a TS monorepo.

**Explanation:** Generated types stay in sync automatically; CI can fail when generated files are out of date.

**Example:** `npx openapi-typescript http://localhost:8000/openapi.json -o src/api/schema.ts` in a CI step.

**Say it like this:** "Types come from the contract, not from memory, and CI fails if they're stale."

---

**Q80. An LLM returns JSON for a QA scorecard, but sometimes fields are missing.**

**Short answer:** Validate with Zod's `safeParse`, retry once with the error in the prompt, then fall back to human review. Never cast with `as`.

**Explanation:** LLM output is untrusted input, so it gets the same validation as any external data.

**Example:**

```ts
const result = ScorecardSchema.safeParse(JSON.parse(llmText));
if (!result.success) return retryOrHumanReview(callId, result.error);
```

**Say it like this:** "Every scorecard was validated with Zod; failures got one retry with the validation error, then human review. A bad score never reached the UI."

---

## 🎯 From Your Resume

**Q81. "How did you type RBAC permissions so the UI can't check a permission that doesn't exist?"**

**Short answer:** Define the role-permission map once with `as const` and `satisfies`, derive `Role` and `Permission` types from it, and type the `can()` helper with them.

**Explanation:** A typo in a permission string becomes a compile error. The UI check is UX only; the server enforces every permission.

**Example:**

```ts
const ROLE_PERMISSIONS = {
  admin: ['calls:read', 'calls:score', 'users:manage'],
  qa: ['calls:read', 'calls:score'],
  agent: ['calls:read:own'],
} as const satisfies Record<string, readonly string[]>;
type Role = keyof typeof ROLE_PERMISSIONS;
type Permission = (typeof ROLE_PERMISSIONS)[Role][number];
export const can = (role: Role, p: Permission) => (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(p);
```

**Say it like this:** "Roles and permissions are derived from one map, so a misspelled permission is a compile error. The FastAPI backend still enforces every permission on every request."

---

**Q82. "How did you type the LiveKit connection lifecycle?"**

**Short answer:** As a discriminated union of states, with a reducer over typed events and an exhaustive switch.

**Explanation:** Each state carries only its own data (reconnecting has an attempt count, failed has an error), and adding a state forced every screen to handle it.

**Example:**

```ts
type Conn =
  | { status: 'idle' } | { status: 'checkingDevices' } | { status: 'connecting' }
  | { status: 'connected'; roomId: string } | { status: 'reconnecting'; attempt: number }
  | { status: 'failed'; error: string };
```

**Say it like this:** "The call lifecycle was a typed state machine: impossible states couldn't be written, and new states were compile errors until handled."

---

**Q83. "How did you keep FastAPI and React in sync?"**

**Short answer:** FastAPI's OpenAPI schema generated TypeScript types and a client, CI failed on stale types, and critical responses were also validated with Zod.

**Explanation:** Generated types describe the contract but don't enforce it at runtime, so high-risk data like AI scores got runtime validation too.

**Example:** A CI job regenerates `schema.ts` and runs `git diff --exit-code`; a backend field rename fails the frontend build.

**Say it like this:** "Types were generated from FastAPI's OpenAPI spec and checked in CI, and AI scores were validated at runtime because generated types don't enforce anything."
