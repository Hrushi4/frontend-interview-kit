# 04 — NestJS

NestJS is on your resume from Slaylink and your current skills list. It's popular in companies that want structured TypeScript backends, so expect questions on modules, dependency injection and the request lifecycle.

**How this file is organised**

- **Part A — Understand the topic:** what NestJS adds on top of Express, its building blocks, and the request lifecycle, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is NestJS?

NestJS is a TypeScript framework for building server-side applications. It runs on Express (or Fastify) underneath, and adds an **opinionated structure** inspired by Angular: modules, dependency injection, decorators and a defined request lifecycle.

### The building blocks

| Block | Purpose |
|---|---|
| **Module** | groups related controllers and providers (`CallsModule`) |
| **Controller** | handles routes and HTTP details |
| **Provider / Service** | business logic, injected where needed |
| **Pipe** | transforms and validates input |
| **Guard** | decides whether a request may proceed (auth, roles) |
| **Interceptor** | wraps the handler: logging, caching, response mapping, timeouts |
| **Exception filter** | turns errors into HTTP responses |
| **Middleware** | runs before route matching, like Express middleware |

### The request lifecycle

```text
Middleware → Guards → Interceptors (before) → Pipes → Controller handler → Service
          → Interceptors (after) → Exception filters (if anything threw) → Response
```

### Dependency injection

You declare what a class needs in its constructor; Nest creates and passes in the instances. This makes swapping implementations (a fake repository in tests) easy.

```ts
@Injectable()
export class CallsService {
  constructor(private readonly repo: CallsRepository, private readonly queue: ScoringQueue) {}
}
```

### Why interviewers ask about it

Teams choose NestJS for consistency across many developers. Interviewers check that you understand *where* each concern belongs (guard vs pipe vs interceptor) and how DI helps testing.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is NestJS, and why use it over plain Express?**

**Short answer:** A structured TypeScript framework on top of Express or Fastify, with modules, dependency injection and a clear request lifecycle.

**Explanation:** Express leaves architecture to each team; Nest gives conventions, so a new developer knows where validation, auth and logic live.

**Example:** Every feature has a module, controller, service and DTOs, so code reviews focus on logic, not structure.

**Say it like this:** "Nest trades some flexibility for consistency. For a team of several developers, that consistency saves more time than it costs."

---

**Q2. What is a module?**

**Short answer:** A class decorated with `@Module` that groups controllers and providers, and declares what it imports and exports.

**Explanation:** Providers are private to a module unless exported. Global modules (config, database) should be rare.

**Example:**

```ts
@Module({ imports: [DatabaseModule], controllers: [CallsController], providers: [CallsService], exports: [CallsService] })
export class CallsModule {}
```

**Say it like this:** "Modules are feature boundaries. Exports are the module's public API, which keeps features from reaching into each other's internals."

---

**Q3. Controllers vs providers?**

**Short answer:** Controllers handle HTTP (routes, params, status codes); providers (services, repositories) hold logic and are injected.

**Explanation:** Keep controllers thin so logic can be reused from queues, cron jobs or GraphQL resolvers.

**Example:**

```ts
@Controller('calls')
export class CallsController {
  constructor(private readonly calls: CallsService) {}
  @Get(':id') get(@Param('id', ParseUUIDPipe) id: string) { return this.calls.get(id); }
}
```

**Say it like this:** "The controller translates HTTP into a service call; the service doesn't know HTTP exists."

---

**Q4. How does dependency injection work in Nest?**

**Short answer:** Nest reads constructor parameter types, finds the matching providers in the module's scope, and creates singletons by default.

**Explanation:** Custom providers (`useValue`, `useFactory`, `useClass`) let you inject config, clients or test doubles. Scopes: default singleton, request-scoped, or transient.

**Example:**

```ts
{ provide: 'REDIS', useFactory: (cfg: ConfigService) => new Redis(cfg.get('REDIS_URL')), inject: [ConfigService] }
```

**Say it like this:** "DI means classes ask for what they need instead of building it, so in tests I can hand them fakes."

---

**Q5. What are DTOs, and how is validation done?**

**Short answer:** Data Transfer Objects describe the request shape; `ValidationPipe` with `class-validator` decorators validates and transforms them.

**Explanation:** Enable `whitelist: true` and `forbidNonWhitelisted: true` to strip or reject unknown fields.

**Example:**

```ts
export class CreateScoreDto {
  @IsUUID() callId: string;
  @IsInt() @Min(0) @Max(100) score: number;
  @IsOptional() @IsString() @MaxLength(500) comment?: string;
}
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
```

**Say it like this:** "DTOs plus a global ValidationPipe mean bad input is rejected before my code runs, and unknown fields can't sneak through."

---

## 🟡 Level 2 — Intermediate

**Q6. Guards vs middleware vs interceptors vs pipes?**

**Short answer:** Middleware runs before routing; guards decide access; pipes validate and transform arguments; interceptors wrap the handler for cross-cutting behaviour.

**Explanation:** Guards know which handler will run (via `ExecutionContext`), so they can read metadata like required roles. Middleware can't.

**Example:** Auth in a guard, input validation in a pipe, request timing in an interceptor, raw body capture for webhooks in middleware.

**Say it like this:** "Access is a guard, input is a pipe, wrapping behaviour is an interceptor, and anything before routing is middleware."

---

**Q7. How do you implement role-based access control?**

**Short answer:** A custom `@Roles()` decorator sets metadata, and a `RolesGuard` reads it with `Reflector` and compares it to the user's roles.

**Explanation:** For resource-level checks (does this user own this scorecard?), check in the service or query, not only in the guard.

**Example:**

```ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    return !roles || roles.includes(ctx.switchToHttp().getRequest().user.role);
  }
}
```

**Say it like this:** "Roles go in metadata with a decorator and a guard enforces them. Ownership is checked deeper, in the query, because a guard can't know which record you're touching."

---

**Q8. How do exception filters work?**

**Short answer:** They catch thrown exceptions and turn them into responses; Nest has a built-in filter for `HttpException`, and you can add custom ones.

**Explanation:** A global filter can map database errors (unique violation → 409) and add a request ID.

**Example:**

```ts
@Catch(QueryFailedError)
export class DbExceptionFilter implements ExceptionFilter {
  catch(e: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    res.status(e.code === '23505' ? 409 : 500).json({ error: e.code === '23505' ? 'Already exists' : 'Internal error' });
  }
}
```

**Say it like this:** "Services throw meaningful exceptions, and one global filter owns the response format, so every endpoint fails the same way."

---

**Q9. What do interceptors let you do?**

**Short answer:** Run code before and after a handler using RxJS: logging, timing, response mapping, caching, and timeouts.

**Explanation:** Because they wrap the handler's observable, they can transform the result or catch errors.

**Example:**

```ts
intercept(ctx: ExecutionContext, next: CallHandler) {
  const start = Date.now();
  return next.handle().pipe(tap(() => metrics.observe(ctx.getHandler().name, Date.now() - start)), timeout(10_000));
}
```

**Say it like this:** "Interceptors are where cross-cutting behaviour lives: timing, response shaping and timeouts, without touching each handler."

---

**Q10. How do you manage configuration?**

**Short answer:** `@nestjs/config` with a validated schema, injected through `ConfigService`, with secrets from environment variables or a secret manager.

**Explanation:** Validation at boot fails the deploy if a variable is missing.

**Example:** `ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({ DATABASE_URL: Joi.string().uri().required() }) })`.

**Say it like this:** "Config is validated on boot and injected like any other dependency, so tests can override it easily."

---

**Q11. How do you connect to a database in Nest?**

**Short answer:** Through an ORM module (TypeORM, Prisma, MikroORM) or a query builder, wrapped in repositories that services depend on.

**Explanation:** Use migrations, never `synchronize: true` in production. Transactions go in the service layer.

**Example:** A `CallsRepository` class wraps Prisma calls; tests replace it with an in-memory fake.

**Say it like this:** "The database sits behind a repository, migrations are versioned, and schema sync is never on in production."

---

**Q12. How do you test NestJS code?**

**Short answer:** Unit tests with `Test.createTestingModule` and mocked providers; e2e tests with Supertest against the app and a test database.

**Explanation:** `overrideProvider` swaps real dependencies for fakes.

**Example:**

```ts
const mod = await Test.createTestingModule({ providers: [CallsService, { provide: CallsRepository, useValue: fakeRepo }] }).compile();
const svc = mod.get(CallsService);
```

**Say it like this:** "DI makes testing straightforward: unit tests get fake repositories, and e2e tests hit a real test database through HTTP."

---

## 🔴 Level 3 — Advanced

**Q13. What are circular dependencies and how do you fix them?**

**Short answer:** Two providers or modules depending on each other; `forwardRef` is a workaround, but the real fix is extracting the shared logic or using events.

**Explanation:** Circular dependencies usually signal a design problem in module boundaries.

**Example:** `CallsService` and `ScoresService` both needed each other; moving shared logic to `ScoringPolicyService` broke the cycle.

**Say it like this:** "forwardRef makes it work, but a cycle tells me two modules are too tangled. I extract the shared part or communicate with events."

---

**Q14. Request-scoped providers: when and what's the cost?**

**Short answer:** A new instance per request, useful for per-request context like tenant; the cost is that every dependent becomes request-scoped too, which is slower.

**Explanation:** Prefer `AsyncLocalStorage` (for example `nestjs-cls`) for context, keeping providers singletons.

**Example:** Tenant ID stored in CLS at the start of the request, read by the repository to filter queries.

**Say it like this:** "Request scope spreads through the dependency tree and slows things down, so I use AsyncLocalStorage for request context instead."

---

**Q15. How does Nest support microservices and queues?**

**Short answer:** `@nestjs/microservices` provides transports (Redis, NATS, Kafka, RabbitMQ, gRPC), and `@nestjs/bullmq` handles background jobs.

**Explanation:** Message patterns map to handlers, similar to controllers. For jobs, processors handle retries and backoff.

**Example:**

```ts
@Processor('scoring')
export class ScoringProcessor extends WorkerHost {
  async process(job: Job<{ callId: string }>) { await this.scoring.score(job.data.callId); }
}
```

**Say it like this:** "Nest gives the same structure to queue consumers as to HTTP controllers, so the scoring worker looks just like an endpoint."

---

**Q16. How do you build a multi-tenant API in Nest?**

**Short answer:** Resolve the tenant from the token or subdomain in a guard or middleware, store it in request context, and enforce it in every query (or with PostgreSQL row-level security).

**Explanation:** Defence in depth: application filters plus database-level RLS.

**Example:** A Prisma extension adds `where: { tenantId }` to every query automatically.

**Say it like this:** "The tenant comes from the verified token, never from the request body, and every query is filtered by it automatically."

---

## 🧩 Level 4 — Scenario-Based

**Q17. A NestJS app takes 20 seconds to start. What do you check?**

**Short answer:** Eager module initialisation (connections, warm-ups), heavy imports, request-scoped providers, and blocking work in `onModuleInit`.

**Explanation:** Use lazy-loaded modules and make warm-ups asynchronous where possible.

**Example:** A module loaded a large ML model in its constructor; moving it to a separate worker fixed startup.

**Say it like this:** "Slow startup usually means something heavy runs in a constructor or onModuleInit. I profile boot and move that work off the critical path."

---

**Q18. Validation passes in the controller, but the service still gets bad data from a queue. Why?**

**Short answer:** ValidationPipe only runs on HTTP (and configured transports); queue messages bypass it, so validate at every entry point.

**Explanation:** Queue consumers, cron jobs and webhooks are entry points too.

**Example:** Validate the job payload with a schema at the start of `process()`.

**Say it like this:** "Every entry point validates its own input. A queue message is just as untrusted as an HTTP body."

---

## 🎯 From Your Resume

**Q19. "What did you build with NestJS at Slaylink?"**

**Short answer:** Describe the real features: [for example the creator and brand campaign APIs] with NestJS, GraphQL and MongoDB, organised in modules.

**Explanation:** Mention resolvers, guards for auth, and how you structured modules. Be honest about scale and what you'd improve.

**Example:** "A `CampaignsModule` with a GraphQL resolver, a service and a Mongoose model, protected by a JWT guard."

**Say it like this:** "At Slaylink I built [campaign and profile features] in NestJS with GraphQL and MongoDB. The module structure made it easy for interns to add features in the same pattern, which mattered because I was also assigning their tasks."
