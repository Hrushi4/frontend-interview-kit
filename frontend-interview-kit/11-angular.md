# 11 — Angular (Optional — only if the JD asks)

Angular isn't on your resume. If a role needs it, say so honestly, show you understand the concepts, and map them to what you know from React/Redux. Don't claim production experience you don't have.

Levels: **🟢 Basic → 🟡 Intermediate → 🔴 Advanced → 🧩 Scenario → 🔁 React ↔ Angular mapping**

---

## 🟢 Level 1 — Basics

**1. What is Angular?**
A full TypeScript framework by Google: components, dependency injection, router, forms, HTTP client, testing utilities and CLI built in.

**2. AngularJS vs Angular?**
AngularJS (1.x) is the legacy JavaScript framework (end of life). Angular (2+) is a TypeScript rewrite with components and a different architecture.

**3. Building blocks?**
Components, templates, directives, pipes, services, dependency injection, router, (NgModules in legacy code; standalone components now default).

**4. Component anatomy?**
```ts
@Component({
  selector: 'app-call-card',
  standalone: true,
  imports: [DatePipe],
  template: `<h3>{{ call().agent }}</h3><p>{{ call().startedAt | date:'short' }}</p>`,
})
export class CallCardComponent { call = input.required<Call>(); }
```

**5. Data binding types?**
Interpolation `{{ value }}`, property binding `[disabled]="isBusy"`, event binding `(click)="join()"`, two-way `[(ngModel)]="email"` (banana in a box).

**6. Directives — types?**
Components (directives with templates), attribute directives (`ngClass`, `ngStyle`, custom highlight), structural directives (`*ngIf`, `*ngFor` — legacy; replaced by built-in control flow).

**7. Built-in control flow?**
```html
@if (calls().length) { <app-call-list [calls]="calls()" /> } @else { <p>No calls</p> }
@for (call of calls(); track call.id) { <app-call-card [call]="call" /> } @empty { <p>Empty</p> }
@switch (status()) { @case ('live') { <live-badge/> } @default { <idle-badge/> } }
```

**8. Pipes?**
Transform values in templates: `date`, `currency`, `async`, `json`, custom pipes. Pure pipes run only when inputs change.

**9. Services and DI?**
```ts
@Injectable({ providedIn: 'root' })
export class CallsService { private http = inject(HttpClient); list() { return this.http.get<Call[]>('/api/calls'); } }
```

**10. Lifecycle hooks?**
`ngOnChanges` → `ngOnInit` → `ngDoCheck` → `ngAfterContentInit` → `ngAfterContentChecked` → `ngAfterViewInit` → `ngAfterViewChecked` → `ngOnDestroy`.

**11. Constructor vs `ngOnInit`?**
Constructor for DI; `ngOnInit` for initialization that needs inputs set.

**12. Inputs and outputs?**
Parent → child: `input()` / `@Input()`. Child → parent: `output()` / `@Output() EventEmitter`. Two-way: `model()`.

**13. Angular CLI commands?**
`ng new`, `ng serve`, `ng generate component|service|guard`, `ng build`, `ng test`, `ng update`.

---

## 🟡 Level 2 — Intermediate

**14. Standalone components vs NgModules?**
Standalone components import their own dependencies; no NgModule needed. NgModules still exist in older apps for grouping declarations/providers.

**15. Signals?**
```ts
count = signal(0);
double = computed(() => this.count() * 2);
constructor() { effect(() => console.log('count', this.count())); }
increment() { this.count.update(c => c + 1); }
```
Fine-grained reactivity; templates re-render only what depends on changed signals.

**16. RxJS — Observable vs Promise?**
Observable: lazy, can emit many values, cancellable (unsubscribe), composable operators. Promise: eager, single value, not cancellable.

**17. Key RxJS operators and when to use them?**
| Operator | Use |
|---|---|
| `map`, `filter`, `tap` | transform, filter, side effects |
| `switchMap` | cancel previous inner request (search typeahead) |
| `mergeMap` | run in parallel |
| `concatMap` | queue in order (save sequence) |
| `exhaustMap` | ignore new while busy (submit button) |
| `debounceTime`, `distinctUntilChanged` | input handling |
| `catchError`, `retry({ count, delay })` | errors/retries |
| `combineLatest`, `forkJoin`, `withLatestFrom` | combine streams |
| `shareReplay` | cache and share HTTP result |
| `takeUntilDestroyed` | auto-unsubscribe |

**18. Subjects?**
Subject (multicast, no initial value), BehaviorSubject (current value, emits latest to new subscribers — simple state store), ReplaySubject (replays N values), AsyncSubject (last value on complete).

**19. Avoiding memory leaks with subscriptions?**
`async` pipe in templates, `takeUntilDestroyed()`, `toSignal()`, or explicit unsubscribe in `ngOnDestroy`.

**20. Change detection — how it works?**
Zone.js patches async APIs and triggers change detection after each async event; Angular checks the component tree top-down. `OnPush` components are checked only when inputs change by reference, an event fires inside them, an observable bound with `async` emits, or signals they read change. Zoneless mode relies on signals and explicit triggers.

**21. Routing?**
```ts
export const routes: Routes = [
  { path: 'calls', loadComponent: () => import('./calls.component').then(m => m.CallsComponent), canActivate: [authGuard] },
  { path: 'admin', loadChildren: () => import('./admin/routes'), canMatch: [roleGuard('admin')] },
  { path: '**', component: NotFoundComponent },
];
```

**22. Functional guards and resolvers?**
```ts
export const authGuard: CanActivateFn = () => inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/login']);
```

**23. HTTP interceptors?**
```ts
export const authInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true })).pipe(catchError(err => { if (err.status === 401) inject(AuthService).logout(); return throwError(() => err); }));
```

**24. Reactive forms vs template-driven forms?**
Reactive: form model in TypeScript (`FormGroup`, `FormControl`, typed forms), validators, easy to test and dynamic. Template-driven: `ngModel`, simpler, less control.

**25. Custom validators?**
Sync `(control) => ValidationErrors | null`; async validators return Observable — e.g., check username availability.

**26. Content projection?**
`<ng-content>` and multi-slot `<ng-content select="[header]">`. Similar to React children/slots.

**27. ViewChild / ContentChild?**
Query elements/components in the template or projected content; signal versions `viewChild()`, `contentChild()`.

**28. `@defer` blocks?**
```html
@defer (on viewport) { <heavy-chart /> } @placeholder { <skeleton /> } @loading { <spinner /> }
```
Lazy-load parts of a template on triggers (viewport, idle, interaction, timer).

**29. Testing in Angular?**
TestBed for component tests, `HttpTestingController` for HTTP, Jasmine/Karma (legacy) or Jest/Vitest, Cypress/Playwright for E2E.

---

## 🔴 Level 3 — Advanced

**30. DI hierarchy?**
Environment injectors (root, route-level) and element injectors (component providers). Resolution walks up the element tree then environment injectors. `providedIn: 'root'` for app singletons; component-level providers for per-instance services.

**31. Injection tokens and multi providers?**
`InjectionToken<Config>('config')` for non-class values; `multi: true` to register multiple implementations (e.g., interceptors historically).

**32. AOT vs JIT compilation?**
AOT compiles templates at build time — smaller bundles, faster startup, template errors caught at build. JIT compiles in the browser (dev/legacy).

**33. SSR and hydration in Angular?**
Angular SSR renders on the server; non-destructive hydration reuses DOM; incremental hydration with `@defer` triggers in newer versions.

**34. NgRx — architecture?**
Store, actions, reducers, selectors (memoized), effects (side effects with RxJS), entity adapter. Signal Store as a lighter signals-based alternative.

**35. Performance techniques?**
OnPush everywhere, signals, `track` in `@for`, `@defer`, lazy routes, pure pipes instead of template method calls, avoid heavy work in templates, zoneless where possible, virtual scrolling (CDK).

**36. Angular CDK?**
Behaviour primitives without styles: overlay, a11y (focus trap, live announcer), drag-drop, virtual scroll, portals — comparable to Radix/React Aria.

**37. Micro-frontends with Angular?**
Module Federation / Native Federation; share Angular core as singleton; or Angular Elements (Web Components) for framework-agnostic embedding.

**38. Security in Angular?**
Automatic sanitization of bound HTML/URLs/styles; `DomSanitizer.bypassSecurityTrust*` is dangerous; built-in XSRF token support in HttpClient; CSP compatibility (nonce support).

---

## 🧩 Level 4 — Scenario-based

**39. Typeahead fires requests for every key and shows stale results.**
`valueChanges.pipe(debounceTime(250), distinctUntilChanged(), switchMap(q => this.api.search(q)))` — switchMap cancels previous.

**40. Double-submitting a form creates duplicates.**
`exhaustMap` on submit stream, disable button while pending.

**41. Component doesn't update when an object property changes under OnPush.**
Mutation keeps the same reference. Use immutable updates or signals.

**42. App is slow with a 10,000-row list.**
CDK virtual scroll, `track` by id, OnPush rows, pagination.

**43. Memory grows as users navigate.**
Subscriptions not cleaned up. Use `async` pipe, `takeUntilDestroyed`, `toSignal`.

---

## 🔁 React ↔ Angular mapping (use this to answer from your strengths)

| React | Angular |
|---|---|
| Component function | `@Component` class |
| props | `input()` / `@Input` |
| callback props | `output()` / `@Output` |
| useState | `signal()` |
| useMemo | `computed()` |
| useEffect | `effect()` / lifecycle hooks |
| Context | DI services |
| React Router | Angular Router |
| Redux Toolkit | NgRx / Signal Store |
| TanStack Query | HttpClient + RxJS (`shareReplay`) or TanStack Query Angular |
| React.lazy / Suspense | `loadComponent` / `@defer` |
| React Hook Form | Reactive Forms |
| Radix UI | Angular CDK |
| RTL | Angular Testing Library / TestBed |

**44. "React vs Angular — which would you choose?"**
Angular: large teams wanting one opinionated, batteries-included framework with strong conventions. React: flexibility, huge ecosystem, choose libraries per need. Both handle enterprise apps; team skills and existing code usually decide.
