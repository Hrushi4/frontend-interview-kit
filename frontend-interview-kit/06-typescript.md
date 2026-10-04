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

## 🟢 Level 1 — Basics

**Q1. What is TypeScript and why use it?**

**Short answer:** A typed superset of JavaScript that compiles to plain JavaScript. It catches errors at build time, makes refactoring safe, gives great IDE support, and documents intent. The types are erased at runtime.

**Say it like this:** "TypeScript adds a static type system on top of JavaScript. Its biggest value for me is refactoring: in a large React codebase I can rename a field or change an API shape, and the compiler shows me every place that breaks before users see it."

---

**Q2. What's the difference between compile time and runtime in TypeScript?**

**Short answer:** TypeScript checks types only during compilation. At runtime the types no longer exist. Data from APIs, `localStorage`, URL params or LLMs is unverified, so validate it with Zod or Valibot.

**Example:**

```ts
type User = { name: string };
const user = JSON.parse(localStorage.getItem('user')!) as User; // TS trusts you
user.name.toUpperCase();   // crashes at runtime if stored data was { }
```

**Say it like this:** "TypeScript protects code I wrote, not data I receive. At every boundary, like an API response or LLM output, I validate with a Zod schema and derive the type from that schema, so the type and the runtime check can't drift apart."

---

**Q3. What are the basic types?**

**Short answer:** `string`, `number`, `boolean`, `bigint`, `symbol`, `null` and `undefined`. Also arrays (`string[]` or `Array<string>`), tuples (`[string, number]`), `object`, and the special types `unknown`, `any`, `never` and `void`.

---

**Q4. What is type inference?**

**Short answer:** TypeScript works out types from values, so you don't have to write them everywhere.

```ts
let count = 5;              // number
const status = 'live';      // literal type 'live'
const ids = [1, 2, 3];      // number[]
```

**Best practice:** annotate function parameters, return types of public functions, and exported APIs. Let inference handle local variables.

---

**Q5. `type` vs `interface`?**

| | `interface` | `type` |
|---|---|---|
| Object shapes | ✅ | ✅ |
| Unions, primitives, tuples | ❌ | ✅ |
| Declaration merging (re-opening) | ✅ | ❌ |
| Extending | `extends` | `&` intersection |
| Mapped and conditional types | ❌ | ✅ |

**Example:**

```ts
interface User { id: string; name: string }
interface User { email: string }        // merges → User has id, name, email

type Status = 'idle' | 'live';          // only `type` can do unions
type Admin = User & { permissions: string[] };
```

**Say it like this:** "Both describe object shapes. I use `interface` for public object contracts, since it can be extended and merged, which suits libraries. I use `type` for unions and computed types. Consistency within the codebase matters more than which one you pick."

---

**Q6. How do you declare optional and readonly properties?**

```ts
interface User {
  readonly id: string;   // can't be reassigned
  name: string;
  email?: string;        // may be missing (string | undefined)
}
```

---

**Q7. What are union types?**

**Short answer:** A value that can be one of several types.

```ts
type Status = 'idle' | 'connecting' | 'live' | 'ended';
function show(id: string | number) { … }
```

---

**Q8. What are intersection types?**

**Short answer:** A value that has *all* the members of the combined types.

```ts
type Timestamps = { createdAt: Date; updatedAt: Date };
type Call = { id: string; duration: number } & Timestamps;
```

---

**Q9. What are literal types?**

**Short answer:** Types representing one exact value. `const x = 'a'` is inferred as the literal type `'a'`, while `let x = 'a'` is widened to `string`, because it could change.

---

**Q10. `any` vs `unknown`?**

**Short answer:** `any` switches off type checking, and it spreads silently through your code. `unknown` accepts any value but forces you to *narrow* it before use. That makes it the safe choice for external input.

```ts
function handle(value: unknown) {
  value.toUpperCase();                        // ❌ error: must narrow first
  if (typeof value === 'string') value.toUpperCase(); // ✅
}

function bad(value: any) {
  value.foo.bar.baz();                        // compiles, crashes at runtime
}
```

**Say it like this:** "`any` means 'trust me, don't check'. `unknown` means 'I don't know yet, make me check'. I ban `any` with an ESLint rule and use `unknown` for anything external, like a caught error or a parsed JSON value."

---

**Q11. `void` vs `undefined` vs `never`?**

**Short answer:**

- `void`: the function's return value should be ignored.
- `undefined`: the function literally returns `undefined`.
- `never`: the function never returns at all (it always throws or loops forever), or the value is impossible.

```ts
function log(msg: string): void { console.log(msg); }
function fail(msg: string): never { throw new Error(msg); }
```

---

**Q12. How do you type functions?**

```ts
function add(a: number, b: number): number { return a + b; }
const greet = (name: string, title?: string): string => `${title ?? ''} ${name}`.trim();
type Handler = (event: CustomEvent) => void;
```

---

**Q13. Optional vs default parameters?**

**Short answer:** `(x?: number)` means `x` may be `undefined`. `(x = 10)` infers `number` and uses 10 when no value is passed.

---

**Q14. What are type assertions (`as`)?**

**Short answer:** They tell the compiler "trust me, it's this type", with **no runtime check**.

```ts
const video = document.getElementById('local-video') as HTMLVideoElement;
```

Avoid double assertions (`x as unknown as Y`) except in tests, because they hide real errors. Prefer narrowing or validation.

---

**Q15. What is the non-null assertion `!`?**

**Short answer:** `ref.current!.play()` tells TypeScript the value isn't `null` or `undefined`. Use it sparingly. If you're wrong, it crashes at runtime. Prefer `if (ref.current) …` or optional chaining.

---

**Q16. Enums vs union literals?**

**Short answer:** Enums generate a runtime JavaScript object. Numeric enums have quirks, such as reverse mappings and accepting any number. Prefer string unions, or `as const` objects when you need runtime values too.

```ts
// Instead of: enum Role { Admin = 'admin', QA = 'qa' }
const Role = { Admin: 'admin', QA: 'qa', Agent: 'agent' } as const;
type Role = (typeof Role)[keyof typeof Role];   // 'admin' | 'qa' | 'agent'

function canScore(role: Role) { return role !== Role.Agent; }
```

---

**Q17. Arrays vs tuples?**

**Short answer:** `number[]` is any length. A tuple has a fixed length and a fixed type at each position, and elements can be named: `[lat: number, lng: number]`. `readonly string[]` prevents mutation.

```ts
const [value, setValue] = useState(0);   // useState returns a tuple
```

---

**Q18. What is an index signature?**

```ts
type ScoresByAgent = { [agentId: string]: number };
// same as
type ScoresByAgent2 = Record<string, number>;
```

---

**Q19. Which `tsconfig.json` options matter most?**

**Short answer:**

- `target`: which JavaScript version to output.
- `module`, and `moduleResolution: "bundler"` for Vite or Next.js.
- `strict`.
- `jsx: "react-jsx"`.
- `paths` and `baseUrl`: import aliases like `@/components`.
- `noEmit`: when a bundler does the compiling.
- `skipLibCheck`: speed.
- `isolatedModules`: required by esbuild and SWC.
- `esModuleInterop`.

---

**Q20. What does `strict: true` enable?**

**Short answer:** `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict` and `useUnknownInCatchVariables`.

**Say it like this:** "`strictNullChecks` alone prevents the most common runtime error in JavaScript, 'cannot read property of undefined'. I wouldn't start a project without `strict` on."

---

## 🟡 Level 2 — Intermediate

**Q21. What narrowing techniques are there?**

**Short answer:** `typeof`, `instanceof`, the `in` operator, equality checks, truthiness checks, checking a discriminant property, `Array.isArray`, user-defined type guards and assertion functions.

```ts
function format(input: string | number | Date | null) {
  if (input == null) return '—';
  if (typeof input === 'number') return input.toFixed(2);
  if (input instanceof Date) return input.toISOString();
  return input.trim();          // TS knows: string
}
```

---

**Q22. What is a user-defined type guard?**

```ts
type ApiError = { status: number; message: string };

function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}

try { … } catch (e) {
  if (isApiError(e)) toast(e.message);   // e is ApiError here
}
```

**Short answer:** A function whose return type is `value is Type`. When it returns true, TypeScript narrows the value in that branch.

---

**Q23. What is an assertion function?**

```ts
function assertDefined<T>(v: T, msg = 'Expected value'): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg);
}

const room = getRoom();
assertDefined(room, 'Room not ready');
room.connect();   // room is non-null after this line
```

**Short answer:** It throws if a condition fails, and narrows the type for the rest of the scope.

---

**Q24. What are discriminated unions, and how do you check exhaustiveness?**

```ts
type CallState =
  | { status: 'idle' }
  | { status: 'connecting'; attempt: number }
  | { status: 'live'; roomId: string; startedAt: number }
  | { status: 'failed'; error: string };

function label(s: CallState): string {
  switch (s.status) {
    case 'idle':       return 'Ready';
    case 'connecting': return `Connecting (attempt ${s.attempt})`;
    case 'live':       return `Live in ${s.roomId}`;
    case 'failed':     return `Failed: ${s.error}`;
    default: {
      const _exhaustive: never = s;   // error if a case is missing
      return _exhaustive;
    }
  }
}
```

**Explanation:** Every member shares a literal field (`status`), the *discriminant*. Checking it narrows to exactly one member, so `s.roomId` is only accessible when `status === 'live'`. The `never` default makes the compiler fail when someone adds a new status and forgets to handle it.

**Say it like this:** "Discriminated unions make impossible states impossible. With separate booleans like `isLoading`, `isError` and `isLive`, nothing stops two from being true at once. With a union, the call is in exactly one state, and each state carries only the data valid for it. I used this for the LiveKit call lifecycle."

---

**Q25. Why use generics?**

**Short answer:** Generics let you write reusable code that *keeps the relationship* between input and output types.

```ts
function first<T>(items: T[]): T | undefined { return items[0]; }
first([1, 2]);        // number | undefined
first(['a', 'b']);    // string | undefined
```

**Explanation:** Without generics you'd have to use `any` (and lose all typing) or write one function per type. A generic is like a function parameter, but for types.

---

**Q26. What are generic constraints?**

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((i) => i[key]);
}
pluck([{ id: 'a', score: 90 }], 'score'); // number[]
pluck([{ id: 'a' }], 'nope');             // ❌ 'nope' is not a key

function getId<T extends { id: string }>(x: T) { return x.id; }
```

**Short answer:** `extends` limits which types are allowed, so you can safely use their properties.

---

**Q27. What are default generic parameters?**

```ts
interface ApiResponse<T = unknown> { data: T; error?: string }
const r: ApiResponse = { data: null };          // T = unknown
const u: ApiResponse<User> = { data: user };
```

---

**Q28. How do `keyof`, `typeof` and indexed access work?**

```ts
const config = { theme: 'dark', retries: 3 };
type Config = typeof config;        // { theme: string; retries: number }
type ConfigKey = keyof Config;      // 'theme' | 'retries'
type Retries = Config['retries'];   // number

type Calls = { id: string; score: number }[];
type Call = Calls[number];          // the element type of the array
```

**Short answer:** `typeof` gets the type of a value, `keyof` gets a union of a type's keys, and `T['key']` looks up a property's type.

---

**Q29. Which built-in utility types should you know?**

| Utility | What it does | Example |
|---|---|---|
| `Partial<T>` / `Required<T>` | all properties optional / required | `Partial<User>` for update payloads |
| `Readonly<T>` | all properties readonly | immutable state |
| `Pick<T, K>` / `Omit<T, K>` | keep / remove properties | `Omit<User, 'password'>` |
| `Record<K, V>` | object with keys K and values V | `Record<Role, Permission[]>` |
| `Exclude<U, X>` / `Extract<U, X>` | filter union members | `Exclude<Status, 'ended'>` |
| `NonNullable<T>` | remove null and undefined | |
| `ReturnType<F>` / `Parameters<F>` | function return / params | `ReturnType<typeof useCall>` |
| `Awaited<T>` | unwrap a Promise | `Awaited<ReturnType<typeof fetchUser>>` |
| `NoInfer<T>` | block inference at a position | |

**Example:**

```ts
type User = { id: string; name: string; email: string; password: string };
type PublicUser = Omit<User, 'password'>;
type UserUpdate = Partial<Pick<User, 'name' | 'email'>>;
```

---

**Q30. What does `as const` do?**

**Short answer:** It infers the narrowest possible type: literal values and readonly arrays and objects. It's very useful for creating union types from a list of values.

```ts
const PERMISSIONS = ['calls:read', 'calls:score', 'users:manage'] as const;
type Permission = (typeof PERMISSIONS)[number];
// 'calls:read' | 'calls:score' | 'users:manage'
```

**Say it like this:** "I define the list once as a runtime array with `as const` and derive the union type from it. The dropdown options and the type can never drift apart."

---

**Q31. What is the `satisfies` operator?**

```ts
const routes = {
  home: '/',
  calls: '/calls',
  call: '/calls/:id',
} satisfies Record<string, `/${string}`>;

routes.call;   // keeps literal type '/calls/:id' and autocompletes keys
```

**Short answer:** `satisfies` checks that a value matches a type *without widening* the value's own inferred type. A plain annotation (`const routes: Record<string, string>`) would lose the specific keys and literal values.

---

**Q32. What are function overloads?**

```ts
function parse(input: string): Date;
function parse(input: number): Date;
function parse(input: string | number) { return new Date(input); }
```

**Short answer:** Several call signatures for one implementation. Prefer unions or generics when they can express the same thing.

---

**Q33. What type does optional chaining produce?**

**Short answer:** `user?.address?.city` has type `string | undefined`, and you must handle the `undefined` case.

---

**Q34. What are type-only imports and exports?**

**Short answer:** `import type { User } from './types'` is erased completely from the JavaScript output. It avoids accidental runtime imports and circular dependencies, and the `verbatimModuleSyntax` option requires it.

---

**Q35. How do classes work in TypeScript?**

```ts
abstract class Shape { abstract area(): number; }

class Session implements Disposable {
  #secret = '';                                 // runtime-private
  constructor(private readonly id: string,       // parameter property
              protected ttl = 3600) {}
  [Symbol.dispose]() { /* cleanup */ }
}
```

**Short answer:** `public`, `private` and `protected` are checked at compile time only, while `#private` is enforced at runtime. You also get `readonly`, parameter properties, `abstract` classes and `implements`.

---

**Q36. What is the type of a caught error?**

**Short answer:** With `useUnknownInCatchVariables` (part of `strict`), `catch (e)` gives `e` the type `unknown`, because anything can be thrown. Narrow it first:

```ts
catch (e) {
  const message = e instanceof Error ? e.message : String(e);
}
```

---

**Q37. What are declaration files (`.d.ts`)?**

**Short answer:** Files that describe types for JavaScript code. Use `@types/*` packages for popular libraries, `declare module 'legacy-lib'` for untyped packages, and `declare global` to extend globals:

```ts
declare global {
  interface Window { analytics: { track(event: string): void } }
}
```

---

**Q38. What is module augmentation?**

```ts
import '@tanstack/react-table';
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> { align?: 'left' | 'right' }
}
```

**Short answer:** Adding fields to a library's types from your own code. Here, every table column can now have `meta.align`.

---

**Q39. How do you type environment variables?**

```ts
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LIVEKIT_URL: string;
}
```

**Explanation:** Types don't prove the variables are actually set, so also validate them at startup:

```ts
const env = z.object({ VITE_API_URL: z.string().url() }).parse(import.meta.env);
```

---

**Q40. How do you type `fetch` responses safely?**

```ts
import { z } from 'zod';

const CallSchema = z.object({
  id: z.string(),
  agent: z.string(),
  score: z.number().nullable(),
});
type Call = z.infer<typeof CallSchema>;          // type derived from the schema

async function getCalls(): Promise<Call[]> {
  const res = await fetch('/api/calls');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return z.array(CallSchema).parse(await res.json()); // throws if shape is wrong
}
```

**Say it like this:** "The schema is the single source of truth. Zod validates at runtime, and `z.infer` gives me the TypeScript type. If the backend changes shape, we get a clear validation error at the boundary instead of a mysterious crash deep in the UI."

---

## 🔴 Level 3 — Advanced (Type-Level Programming)

**What is "type-level programming"?** Using TypeScript's type system like a small programming language: loops (mapped types), if/else (conditional types), pattern matching (`infer`) and string manipulation (template literal types). Senior interviews ask you to read these, and sometimes to write simple ones.

**Q41. What are mapped types?**

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Mutable<T>  = { -readonly [K in keyof T]: T[K] };   // remove readonly
type Optional<T> = { [K in keyof T]+?: T[K] };           // add optional
```

**Short answer:** A loop over keys that builds a new type. `Partial`, `Readonly` and `Record` are all mapped types.

---

**Q42. What is key remapping with `as`?**

```ts
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
type G = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
```

**Short answer:** `as` renames keys or filters them out: mapping a key to `never` removes it.

---

**Q43. What are conditional types?**

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<'hi'>;  // true
type B = IsString<42>;    // false
```

**Short answer:** If/else for types: `T extends U ? X : Y`.

---

**Q44. What does `infer` do?**

```ts
type ElementType<T> = T extends readonly (infer U)[] ? U : never;
type PromiseValue<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;

type X = ElementType<string[]>;           // string
type Y = PromiseValue<Promise<number>>;   // number
```

**Short answer:** It captures part of a type during a conditional match, like a pattern-matching variable.

---

**Q45. What are distributive conditional types?**

**Short answer:** When a conditional type checks a bare type parameter, it's applied to each union member separately:

```ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>;      // string[] | number[]   (distributed)

type ToArrayND<T> = [T] extends [any] ? T[] : never;
type R2 = ToArrayND<string | number>;   // (string | number)[]   (not distributed)
```

Wrapping in a tuple (`[T]`) turns distribution off.

---

**Q46. What are template literal types?**

```ts
type CallEvent = 'join' | 'leave';
type Handler = `on${Capitalize<CallEvent>}`;            // 'onJoin' | 'onLeave'
type ApiPath = `/api/${'calls' | 'users'}/${string}`;   // pattern-matched strings
```

---

**Q47. What are recursive types?**

```ts
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };
```

---

**Q48. How do you extract route params from a path string?**

```ts
type Params<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof Params<Rest>]: string }
    : P extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

type T = Params<'/tenants/:tenantId/calls/:callId'>;
// { tenantId: string; callId: string }
```

**Explanation:** Template literal pattern matching plus recursion. Routers such as React Router and TanStack Router use this to type `useParams`.

---

**Q49. Implement `Pick`, `Omit`, `Exclude`, `ReturnType` and `Awaited` yourself.**

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends PropertyKey> = MyPick<T, MyExclude<keyof T, K>>;
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;
```

---

**Q50. What are branded (nominal) types?**

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'TenantId'>;
type UserId = Brand<string, 'UserId'>;

const asTenantId = (s: string) => s as TenantId;   // ideally validate here
function getCalls(tenant: TenantId) {}

const userId = 'u_123' as UserId;
getCalls(userId);   // ❌ compile error — prevents mixing IDs
```

**Short answer:** Structural typing treats all strings as the same type. A brand makes `TenantId` and `UserId` incompatible even though both are strings at runtime.

**Say it like this:** "In a multi-tenant app, passing a user ID where a tenant ID is expected could leak data. Branded types turn that mistake into a compile error at zero runtime cost."

---

**Q51. What are covariance and contravariance?**

**Short answer:**

- **Covariant** (arrays when reading, return types): a `Dog[]` can be used where an `Animal[]` is expected.
- **Contravariant** (function parameters, under `strictFunctionTypes`): a handler that accepts any `Animal` can be used where a `Dog` handler is expected, but not the other way round.
- **Bivariant:** method-shorthand parameters are checked both ways. This is an unsound legacy behaviour.

You can annotate variance explicitly on generic parameters with `in` and `out`.

---

**Q52. What does structural typing imply?**

**Short answer:** Types are compatible if their shapes match, whatever their names. Excess property checks apply only to *fresh object literals*:

```ts
type P = { x: number };
const a: P = { x: 1, y: 2 };      // ❌ excess property (fresh literal)
const tmp = { x: 1, y: 2 };
const b: P = tmp;                  // ✅ allowed (not fresh)
```

Use brands when you need nominal behaviour.

---

**Q53. What is `never` useful for besides exhaustiveness checks?**

**Short answer:** Filtering keys in mapped types, impossible branches, functions that always throw, and forbidding properties: `{ a: string; b?: never }` means `b` must not be passed.

---

**Q54. How do you make mutually exclusive props (XOR)?**

```ts
type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);

type LinkOrButton = XOR<{ href: string }, { onClick: () => void }>;
const a: LinkOrButton = { href: '/x' };                          // ✅
const b: LinkOrButton = { href: '/x', onClick: () => {} };       // ❌
```

---

**Q55. What are `const` type parameters?**

```ts
function tuple<const T extends readonly unknown[]>(x: T) { return x; }
const t = tuple(['a', 1]);   // readonly ['a', 1] — no `as const` needed at the call site
```

---

**Q56. What does `NoInfer` do?**

```ts
function setDefault<T>(values: T[], fallback: NoInfer<T>) {}
setDefault(['a', 'b'], 'c');   // ✅
setDefault(['a', 'b'], 1);     // ❌ — without NoInfer, T would widen to string | number
```

---

**Q57. How do complex types affect performance?**

**Short answer:** Deeply recursive conditional types slow down the compiler and the IDE. Prefer interfaces over large intersections, limit recursion depth, enable `skipLibCheck`, use project references, and profile with `tsc --extendedDiagnostics` or `--generateTrace`.

---

**Q58. How do project references work in a monorepo?**

**Short answer:** Set `composite: true` and list `references` so each package builds incrementally. Share a `tsconfig.base.json`, and use `paths` or workspace packages for internal imports.

---

**Q59. How do you emit declarations for a component library?**

**Short answer:** Set `declaration: true` and `declarationMap: true`, use `exports` in `package.json` with a `types` condition, and don't export types from internal file paths. Consumers should import only from the public entry point.

---

**Q60. When are `unique symbol`, abstract constructor types and `this` types used?**

**Short answer:** In library-level patterns: fluent builders (methods returning `this`), mixins (abstract constructor types), and guaranteed-unique keys (`unique symbol`).

---

## ⚛️ TypeScript with React

**Q61. How do you type props and children?**

```tsx
type CardProps = {
  title: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

function Card({ title, footer, children }: CardProps) {
  return (<section><h2>{title}</h2>{children}{footer}</section>);
}
```

**Short answer:** Use a props type with `React.ReactNode` for anything renderable. `React.FC` works but isn't needed, and explicit props are clearer.

---

**Q62. How do you extend native element props?**

```tsx
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'ghost';
};

function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button data-variant={variant} {...rest} />;
}
// <Button type="submit" disabled aria-label="Save" /> — all native props work
```

**Note:** In React 19, `ref` is a normal prop, so `ComponentProps<'button'>` includes it.

---

**Q63. Which React event types should you know?**

**Short answer:** `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`, `React.KeyboardEvent<HTMLDivElement>` and `React.MouseEvent<HTMLButtonElement>`.

```tsx
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);
```

---

**Q64. How do you type `useState`?**

```tsx
const [user, setUser] = useState<User | null>(null);
const [call, setCall] = useState<CallState>({ status: 'idle' });   // discriminated union
```

**Short answer:** Give the type explicitly when the initial value doesn't show the full type (like `null` or an empty array).

---

**Q65. How do you type `useRef`?**

```tsx
const videoRef = useRef<HTMLVideoElement>(null);              // DOM ref
const timerRef = useRef<number | undefined>(undefined);       // mutable value
```

---

**Q66. How do you type `useReducer`?**

```ts
type Action =
  | { type: 'join'; roomId: string }
  | { type: 'leave' }
  | { type: 'fail'; error: string };

function reducer(state: CallState, action: Action): CallState {
  switch (action.type) {
    case 'join': return { status: 'live', roomId: action.roomId, startedAt: Date.now() };
    case 'leave': return { status: 'idle' };
    case 'fail': return { status: 'failed', error: action.error };
  }
}
```

---

**Q67. How do you build a typed context with a guard hook?**

```tsx
const RoomCtx = createContext<RoomApi | null>(null);

export function useRoom() {
  const ctx = useContext(RoomCtx);
  if (!ctx) throw new Error('useRoom must be used inside <RoomProvider>');
  return ctx;   // typed as RoomApi, never null
}
```

**Explanation:** Consumers never have to null-check, and misuse fails loudly in development.

---

**Q68. How do you write a generic component?**

```tsx
type TableProps<Row> = {
  rows: Row[];
  columns: { key: keyof Row; header: string }[];
  getRowId: (row: Row) => string;
};

function Table<Row>({ rows, columns, getRowId }: TableProps<Row>) {
  return (
    <table>
      <tbody>
        {rows.map((r) => (
          <tr key={getRowId(r)}>
            {columns.map((c) => <td key={String(c.key)}>{String(r[c.key])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

<Table rows={calls} columns={[{ key: 'agent', header: 'Agent' }]} getRowId={(c) => c.id} />
// key: 'agnt' → compile error
```

---

**Q69. How do you type a polymorphic `as` prop?**

```tsx
type PolyProps<E extends React.ElementType> = { as?: E } & Omit<React.ComponentPropsWithoutRef<E>, 'as'>;

function Text<E extends React.ElementType = 'span'>({ as, ...rest }: PolyProps<E>) {
  const Component = as ?? 'span';
  return <Component {...rest} />;
}

<Text as="label" htmlFor="email">Email</Text>   // label props are type-checked
```

---

**Q70. How do you type a custom hook's return value?**

**Short answer:** Return a tuple with `as const` for two values (`return [value, setValue] as const`). For three or more, return a named object, which is clearer at the call site.

---

**Q71. How do you type Redux Toolkit?**

```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
```

---

**Q72. How do you type forms with Zod and React Hook Form?**

```ts
const ScoreFormSchema = z.object({
  callId: z.string(),
  score: z.number().min(0).max(100),
  comment: z.string().optional(),
});
type ScoreForm = z.infer<typeof ScoreFormSchema>;

const form = useForm<ScoreForm>({ resolver: zodResolver(ScoreFormSchema) });
```

**Short answer:** One schema gives you validation rules, error messages and the TypeScript type.

---

## 🧩 Level 4 — Scenario-Based

**Q73. The API sometimes returns `score: null`, and the UI crashes even though the types say `number`.**

**Answer:** The type was a promise nobody checked. Fix it in four steps:

1. Validate at the boundary with Zod, so bad data fails loudly where it enters.
2. Correct the type to `number | null`.
3. Handle `null` in the UI (show "Not scored").
4. Prevent drift by generating types from the OpenAPI schema and adding a contract test.

**Say it like this:** "The types lied because they were written by hand and never checked. I'd make the runtime schema the source of truth and derive the type from it."

---

**Q74. A refactor renamed a status from `'live'` to `'connected'`, and some screens silently broke.**

**Answer:** The status strings were compared directly all over the code (`if (status === 'live')`). Model the status as a union type with exhaustive `switch` statements and a `never` default, and put the status helpers in one place. A rename then becomes a compile error everywhere it matters.

---

**Q75. Developers keep passing `userId` where `tenantId` is expected.**

**Answer:** Use branded types (Q50), created only by validating constructor functions, for example `parseTenantId(raw)`.

---

**Q76. What's your plan for migrating a large JavaScript codebase to TypeScript?**

**Answer:**

1. Turn on `allowJs` (and `checkJs` for gradual checking), so JS and TS coexist.
2. Convert leaf modules first (utils, API clients), then move up to components.
3. Start with lenient settings and tighten `strict` flags directory by directory.
4. Block *new* `any` with ESLint (`@typescript-eslint/no-explicit-any`).
5. Generate API types from OpenAPI early. It gives the biggest win fastest.
6. Track the `any` count as a metric and celebrate it going down.

---

**Q77. Type-checking is slow in CI and the IDE lags.**

**Answer:** Enable `skipLibCheck`, use project references with incremental builds, avoid giant unions and deeply recursive types, split huge barrel files (`index.ts` re-exporting everything), and profile with `--generateTrace`.

---

**Q78. A component should accept `href` or `onClick`, but never both.**

**Answer:** Use XOR props (Q54), or a discriminated union on a `kind` field: `{ kind: 'link'; href } | { kind: 'button'; onClick }`.

---

**Q79. You need types shared between a FastAPI or NestJS backend and a React frontend.**

**Answer:** Generate them from the API contract. Use openapi-typescript or Orval from the OpenAPI spec, or GraphQL Code Generator for GraphQL. In a NestJS + React monorepo, a shared `contracts` package of Zod schemas can validate on both sides.

---

**Q80. An LLM returns JSON for a QA scorecard, but sometimes fields are missing.**

**Answer:** Never trust it with `as`.

```ts
const result = ScorecardSchema.safeParse(JSON.parse(llmText));
if (!result.success) {
  // retry once, sending result.error back to the model in the prompt,
  // then fall back to "needs human review"
}
```

**Say it like this:** "LLM output is untrusted input. We validated every scorecard with Zod. On failure we retried once with the validation error in the prompt, and then routed the call to human review. A bad score never reached the UI."

---

## 🎯 From Your Resume

**Q81. "How did you type RBAC permissions so the UI can't check a permission that doesn't exist?"**

```ts
const ROLE_PERMISSIONS = {
  admin: ['calls:read', 'calls:score', 'users:manage', 'tenant:configure'],
  qa: ['calls:read', 'calls:score'],
  agent: ['calls:read:own'],
} as const satisfies Record<string, readonly string[]>;

type Role = keyof typeof ROLE_PERMISSIONS;                    // 'admin' | 'qa' | 'agent'
type Permission = (typeof ROLE_PERMISSIONS)[Role][number];    // union of all permission strings

export const can = (role: Role, permission: Permission) =>
  (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(permission);

can('qa', 'calls:score');    // ✅
can('qa', 'calls:scroe');    // ❌ compile error — typo caught
```

**Say it like this:** "The permission map is defined once with `as const` and `satisfies`, and the `Role` and `Permission` types are derived from it. A typo in a permission string is a compile error. But the UI check is only for UX. The FastAPI backend enforces every permission on every request."

---

**Q82. "How did you type the LiveKit connection lifecycle?"**

**Say it like this:** "As a discriminated union: idle, checking-devices, connecting, connected, reconnecting, disconnected and failed. Each state carries only its own data. For example, `reconnecting` has an attempt count and `failed` has an error. A reducer with an exhaustive switch handles the typed events, so adding a new state forced us to handle it in every screen."

---

**Q83. "How did you keep FastAPI and React in sync?"**

**Say it like this:** "FastAPI generates an OpenAPI schema automatically. We generated TypeScript types and a typed client from it, and CI failed if the generated files were out of date. For critical responses, such as AI scores, we also validated at runtime with Zod, because generated types still only describe the contract and don't enforce it."
