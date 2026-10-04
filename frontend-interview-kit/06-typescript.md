# 06 — TypeScript

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced (type-level) → ⚛️ TS with React → 🧩 Scenario → 🎯 From Your Resume**

---

## 🟢 Level 1 — Basics

**1. What is TypeScript and why use it?**
A typed superset of JavaScript compiled to JS. Catches errors at build time, enables better refactoring and IDE help, documents intent. Types are erased at runtime.

**2. Compile-time vs runtime?**
TS checks types during compilation only. Data from APIs, `localStorage`, URL params or LLMs is unverified at runtime — validate it (Zod, Valibot).

**3. Basic types?**
`string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`, arrays `string[]` / `Array<string>`, tuples `[string, number]`, `object`, `unknown`, `any`, `never`, `void`.

**4. Type inference?**
TS infers types from values: `let n = 5` → number. Annotate function parameters and public APIs; let inference handle the rest.

**5. `type` vs `interface`?**
| | interface | type |
|---|---|---|
| Object shapes | ✅ | ✅ |
| Unions/intersections/primitives/tuples | ❌ | ✅ |
| Declaration merging | ✅ | ❌ |
| `extends` | ✅ | via `&` |
| Mapped/conditional types | ❌ | ✅ |
Common convention: interface for public object contracts and library APIs; type for unions and computed types. Consistency matters more than the choice.

**6. Optional and readonly properties?**
```ts
interface User { readonly id: string; name: string; email?: string; }
```

**7. Union types?**
`type Status = 'idle' | 'connecting' | 'live' | 'ended';` — value is one of them.

**8. Intersection types?**
`type Admin = User & { permissions: string[] };` — value has all members.

**9. Literal types?**
`let dir: 'left' | 'right'`; `const x = 'a'` is inferred as literal `'a'`, `let x = 'a'` as `string`.

**10. `any` vs `unknown`?**
any turns off checking and spreads silently. unknown accepts anything but forces narrowing before use — the safe choice for external input.

**11. `void` vs `undefined` vs `never`?**
void = return value is ignored; undefined = literally returns undefined; never = function never returns (throws, infinite loop) or impossible state.

**12. Function typing?**
```ts
function add(a: number, b: number): number { return a + b; }
const greet = (name: string, title?: string): string => `${title ?? ''} ${name}`;
type Handler = (event: CustomEvent) => void;
```

**13. Optional vs default parameters?**
`(x?: number)` — may be undefined. `(x = 10)` — type inferred as number, default applied.

**14. Type assertions (`as`)?**
`const el = document.getElementById('v') as HTMLVideoElement;` — tells the compiler to trust you; no runtime check. Avoid double assertions (`as unknown as X`) except in tests.

**15. Non-null assertion `!`?**
`ref.current!.play()` — asserts not null/undefined. Use sparingly; prefer narrowing.

**16. Enums vs union literals?**
Enums emit runtime objects (numeric enums have reverse mappings and weak type safety). Prefer string unions or `as const` objects:
```ts
const Role = { Admin: 'admin', QA: 'qa', Agent: 'agent' } as const;
type Role = typeof Role[keyof typeof Role];
```

**17. Arrays vs tuples?**
`number[]` any length. `[lat: number, lng: number]` fixed length with named elements. `readonly string[]` prevents mutation.

**18. Object index signature?**
`type Dict = { [key: string]: number }` or `Record<string, number>`.

**19. `tsconfig.json` key options?**
`target`, `module`, `moduleResolution` (`bundler`), `strict`, `jsx` (`react-jsx`), `paths`/`baseUrl`, `noEmit` (when a bundler compiles), `skipLibCheck`, `isolatedModules`, `esModuleInterop`.

**20. What does `strict: true` enable?**
`strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables`.

---

## 🟡 Level 2 — Intermediate

**21. Narrowing techniques?**
`typeof`, `instanceof`, `in` operator, equality checks, truthiness, discriminant property checks, `Array.isArray`, user-defined type guards, assertion functions.

**22. User-defined type guard?**
```ts
function isApiError(e: unknown): e is { status: number; message: string } {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}
```

**23. Assertion function?**
```ts
function assertDefined<T>(v: T, msg = 'Expected value'): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg);
}
```

**24. Discriminated unions + exhaustive check?**
```ts
type CallState =
  | { status: 'idle' }
  | { status: 'connecting'; attempt: number }
  | { status: 'live'; roomId: string; startedAt: number }
  | { status: 'failed'; error: string };

function label(s: CallState): string {
  switch (s.status) {
    case 'idle': return 'Ready';
    case 'connecting': return `Connecting (attempt ${s.attempt})`;
    case 'live': return `Live in ${s.roomId}`;
    case 'failed': return `Failed: ${s.error}`;
    default: { const _exhaustive: never = s; return _exhaustive; }
  }
}
```
Adding a new status causes a compile error until handled.

**25. Generics — why?**
Reusable code that preserves type relationships.
```ts
function first<T>(xs: T[]): T | undefined { return xs[0]; }
const n = first([1, 2]); // number | undefined
```

**26. Generic constraints?**
```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] { return items.map(i => i[key]); }
function withId<T extends { id: string }>(x: T) { return x.id; }
```

**27. Default generic parameters?**
`interface ApiResponse<T = unknown> { data: T; error?: string }`.

**28. `keyof`, `typeof`, indexed access?**
```ts
const config = { theme: 'dark', retries: 3 };
type Config = typeof config;             // { theme: string; retries: number }
type ConfigKey = keyof Config;           // 'theme' | 'retries'
type Retries = Config['retries'];        // number
type Item = Calls[number];               // element type of an array
```

**29. Built-in utility types?**
| Utility | Purpose |
|---|---|
| `Partial<T>` / `Required<T>` | make all props optional / required |
| `Readonly<T>` | readonly props |
| `Pick<T, K>` / `Omit<T, K>` | select / remove props |
| `Record<K, V>` | object with keys K |
| `Exclude<U, X>` / `Extract<U, X>` | filter union members |
| `NonNullable<T>` | remove null/undefined |
| `ReturnType<F>` / `Parameters<F>` | function return / params |
| `Awaited<T>` | unwrap promise |
| `InstanceType<C>` / `ConstructorParameters<C>` | class types |
| `NoInfer<T>` | block inference from a position |

**30. `as const`?**
Infers the narrowest literal, readonly type.
```ts
const PERMISSIONS = ['calls:read', 'calls:score', 'users:manage'] as const;
type Permission = typeof PERMISSIONS[number];
```

**31. `satisfies` operator?**
Validates against a type while keeping the specific inferred type.
```ts
const routes = { home: '/', calls: '/calls', call: '/calls/:id' } satisfies Record<string, `/${string}`>;
routes.call; // still the literal type, autocompletes keys
```

**32. Function overloads?**
```ts
function parse(input: string): Date;
function parse(input: number): Date;
function parse(input: string | number) { return new Date(input); }
```
Prefer unions or generics when possible.

**33. Optional chaining types?**
`user?.address?.city` gives `string | undefined` — handle it.

**34. Type-only imports/exports?**
`import type { User } from './types'` — erased fully, avoids runtime cycles; required with `verbatimModuleSyntax`.

**35. Classes in TS?**
Access modifiers `public`/`private`/`protected` (compile-time only), `#private` (runtime), `readonly`, parameter properties, `abstract` classes, `implements` interfaces.

**36. `unknown` in catch clauses?**
With `useUnknownInCatchVariables`, `catch (e)` is unknown → narrow: `if (e instanceof Error) e.message`.

**37. Declaration files (`.d.ts`)?**
Describe types for JS code. `declare module 'legacy-lib'` for untyped packages; `@types/*` packages; `declare global { interface Window { analytics: Analytics } }` to extend globals.

**38. Module augmentation?**
```ts
import '@tanstack/react-table';
declare module '@tanstack/react-table' { interface ColumnMeta<TData, TValue> { align?: 'left' | 'right' } }
```

**39. Typing environment variables?**
```ts
// vite-env.d.ts
interface ImportMetaEnv { readonly VITE_API_URL: string; readonly VITE_LIVEKIT_URL: string }
```
Still validate at startup (Zod) — types don't prove they're set.

**40. Typing `fetch` responses safely?**
```ts
const CallSchema = z.object({ id: z.string(), agent: z.string(), score: z.number().nullable() });
type Call = z.infer<typeof CallSchema>;
async function getCalls(): Promise<Call[]> {
  const res = await fetch('/api/calls');
  return z.array(CallSchema).parse(await res.json());
}
```

---

## 🔴 Level 3 — Advanced (type-level programming)

**41. Mapped types?**
```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Optionalize<T> = { [K in keyof T]+?: T[K] };
```

**42. Key remapping with `as`?**
```ts
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
```

**43. Conditional types?**
`type IsString<T> = T extends string ? true : false;`

**44. `infer`?**
```ts
type ElementType<T> = T extends readonly (infer U)[] ? U : never;
type PromiseValue<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;
```

**45. Distributive conditional types?**
Conditionals over a naked type parameter distribute across unions: `ToArray<string | number>` → `string[] | number[]`. Wrap in a tuple `[T] extends [U]` to disable.

**46. Template literal types?**
```ts
type Event = 'join' | 'leave';
type Handler = `on${Capitalize<Event>}`;           // 'onJoin' | 'onLeave'
type ApiPath = `/api/${'calls' | 'users'}/${string}`;
```

**47. Recursive types?**
```ts
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };
```

**48. Extract route params from a path string?**
```ts
type Params<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}` ? { [K in Param | keyof Params<Rest>]: string }
  : P extends `${string}:${infer Param}` ? { [K in Param]: string }
  : {};
type T = Params<'/tenants/:tenantId/calls/:callId'>; // { tenantId: string; callId: string }
```

**49. Implement `Pick`, `Omit`, `Exclude` yourself?**
```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends PropertyKey> = MyPick<T, MyExclude<keyof T, K>>;
type MyReturnType<F> = F extends (...a: any[]) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;
```

**50. Branded (nominal) types?**
```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'TenantId'>;
type UserId = Brand<string, 'UserId'>;
const asTenantId = (s: string) => s as TenantId;
function getCalls(tenant: TenantId) {}
// getCalls(userId) → compile error; prevents mixing IDs in multi-tenant code
```

**51. Variance — covariance and contravariance?**
Arrays/return types are covariant (a `Dog[]` is usable as `Animal[]` for reading). Function parameters are contravariant under `strictFunctionTypes` (a handler accepting `Animal` can be used where a `Dog` handler is expected, not vice versa). Method shorthand params are bivariant (unsound legacy). Explicit annotations `in`/`out` on generic params exist for clarity.

**52. Structural typing — implications?**
Types are compatible if shapes match, regardless of name. Excess property checks apply only to fresh object literals. Use brands for nominal behaviour.

**53. `never` uses beyond exhaustiveness?**
Filtering in mapped types, impossible branches, functions that throw, forbidding props: `{ a: string; b?: never }` (mutually exclusive props).

**54. Mutually exclusive props (XOR)?**
```ts
type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);
type ButtonProps = XOR<{ href: string }, { onClick: () => void }>;
```

**55. `const` type parameters?**
`function tuple<const T extends readonly unknown[]>(x: T) { return x; }` — infers literal readonly types without `as const` at call sites.

**56. `NoInfer`?**
Prevents a parameter from contributing to inference: `function setDefault<T>(values: T[], fallback: NoInfer<T>)`.

**57. Performance of complex types?**
Deeply recursive conditional types slow the compiler and IDE. Prefer interfaces over large intersections, cap recursion, use `skipLibCheck`, project references, `tsc --extendedDiagnostics` / `--generateTrace` to profile.

**58. Project references and monorepos?**
`composite: true` + `references` for incremental builds across packages; shared `tsconfig.base.json`; `paths` for internal packages.

**59. Declaration emit for a component library?**
`declaration: true`, `declarationMap: true`, `exports` in package.json with `types` conditions, avoid exporting types from internal paths.

**60. `unique symbol`, `abstract` constructors, `this` types — when used?**
Library-level patterns: fluent builders (`this` return type), mixins (abstract constructor types), unique keys (`unique symbol`).

---

## ⚛️ TypeScript with React

**61. Typing props and children?**
```tsx
type CardProps = { title: string; footer?: React.ReactNode; children: React.ReactNode };
function Card({ title, footer, children }: CardProps) { /* ... */ }
```
`React.FC` is fine but not needed; explicit props are clearer.

**62. Extending native element props?**
```tsx
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'ghost' };
function Button({ variant = 'primary', ...rest }: ButtonProps) { return <button data-variant={variant} {...rest} />; }
```
React 19: `ComponentProps<'button'>` includes `ref` as a normal prop.

**63. Event types?**
`React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`, `React.KeyboardEvent<HTMLDivElement>`, `React.MouseEvent<HTMLButtonElement>`.

**64. `useState` typing?**
`useState<User | null>(null)`; `useState<CallState>({ status: 'idle' })` with discriminated unions to make impossible states impossible.

**65. `useRef` typing?**
DOM ref: `useRef<HTMLVideoElement>(null)`. Mutable value: `useRef<number | undefined>(undefined)`.

**66. `useReducer` typing?**
```ts
type Action = { type: 'join'; roomId: string } | { type: 'leave' } | { type: 'fail'; error: string };
function reducer(state: CallState, action: Action): CallState { /* switch on action.type */ }
```

**67. Typed context with guard hook?**
```tsx
const RoomCtx = createContext<RoomApi | null>(null);
export function useRoom() { const c = useContext(RoomCtx); if (!c) throw new Error('useRoom must be inside RoomProvider'); return c; }
```

**68. Generic components?**
```tsx
type TableProps<Row> = { rows: Row[]; columns: { key: keyof Row; header: string }[]; getRowId: (r: Row) => string };
function Table<Row>({ rows, columns, getRowId }: TableProps<Row>) { /* ... */ }
```

**69. Polymorphic `as` prop?**
```tsx
type PolyProps<E extends React.ElementType> = { as?: E } & Omit<React.ComponentPropsWithoutRef<E>, 'as'>;
function Text<E extends React.ElementType = 'span'>({ as, ...rest }: PolyProps<E>) { const C = as ?? 'span'; return <C {...rest} />; }
```

**70. Typing custom hooks' return values?**
Return tuples `as const` (`return [value, setValue] as const`) or named objects for 3+ values.

**71. Typing Redux Toolkit?**
```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
```

**72. Typing forms with Zod + React Hook Form?**
```ts
const ScoreForm = z.object({ callId: z.string(), score: z.number().min(0).max(100), comment: z.string().optional() });
type ScoreForm = z.infer<typeof ScoreForm>;
const form = useForm<ScoreForm>({ resolver: zodResolver(ScoreForm) });
```

---

## 🧩 Level 4 — Scenario-based

**73. The API sometimes returns `score: null` and the UI crashes despite types saying `number`.**
Types lied — the contract was never validated. Add runtime validation at the boundary, fix the type to `number | null`, handle null in UI, add a contract test or generate types from the OpenAPI schema.

**74. A refactor renamed a status from `'live'` to `'connected'`; some screens silently broke.**
Model status as a union and use exhaustive `switch` with `never`; avoid raw string comparisons scattered around; derive helpers from a single source.

**75. Developers keep passing `userId` where `tenantId` is expected.**
Branded types for IDs; constructors that validate and brand.

**76. Migrating a large JS codebase to TS — plan?**
`allowJs` + `checkJs` gradually; convert leaf modules first; start with `strict: false` and ratchet flags per directory; ban new `any` via ESLint (`@typescript-eslint/no-explicit-any`); generate API types; track `any` count as a metric.

**77. Type-checking is slow in CI and the IDE lags.**
`skipLibCheck`, project references with incremental builds, avoid giant unions/recursive types, split barrel files, profile with `--generateTrace`.

**78. A component accepts `href` OR `onClick`, never both.**
XOR props (Q54) or a discriminated union on a `kind` field.

**79. You need types shared between FastAPI/NestJS backend and React frontend.**
Generate from OpenAPI (openapi-typescript, Orval) or GraphQL codegen; for NestJS + TS monorepo, share a `contracts` package with Zod schemas used on both sides.

**80. An LLM returns JSON for a QA scorecard; sometimes fields are missing.**
Zod schema → `safeParse` → on failure: retry with error feedback in the prompt, or fall back to "needs human review"; never cast with `as`.

---

## 🎯 From Your Resume

**81. "How did you type RBAC permissions so the UI can't check a non-existent permission?"**
```ts
const ROLE_PERMISSIONS = {
  admin: ['calls:read', 'calls:score', 'users:manage', 'tenant:configure'],
  qa: ['calls:read', 'calls:score'],
  agent: ['calls:read:own'],
} as const satisfies Record<string, readonly string[]>;

type Role = keyof typeof ROLE_PERMISSIONS;
type Permission = (typeof ROLE_PERMISSIONS)[Role][number];

export const can = (role: Role, p: Permission) => (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(p);
```
Typos in permission strings become compile errors. Server remains the real enforcement.

**82. "How did you type the LiveKit connection lifecycle?"**
Discriminated union of states (idle / checking-devices / connecting / connected / reconnecting / disconnected / failed) + typed events; reducer with exhaustive switch.

**83. "How did you keep FastAPI and React in sync?"**
OpenAPI schema from FastAPI → generated TS types/client → Zod for critical responses; CI fails if generated types are out of date.
