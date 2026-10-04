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

## 🟢 More Basics

**Q19. What does the `@Injectable()` decorator do?**

**Short answer:** It marks a class as a provider that Nest's DI container can create and inject.

**Explanation:** It also lets Nest read constructor parameter types through TypeScript metadata.

**Example:** `@Injectable() export class ScoringService {}`.

**Say it like this:** "Injectable registers a class with the DI container so others can ask for it in their constructors."

---

**Q20. How do you read route params, query and body in Nest?**

**Short answer:** With parameter decorators: `@Param()`, `@Query()`, `@Body()`, `@Headers()`, `@Req()`.

**Explanation:** Combine with pipes for validation and conversion (`ParseIntPipe`, `ParseUUIDPipe`, DTOs).

**Example:** `@Get(':id') get(@Param('id', ParseUUIDPipe) id: string, @Query() q: ListCallsQuery) {}`.

**Say it like this:** "Decorators pull values out of the request, and pipes validate them before my code sees them."

---

**Q21. How do you set status codes and headers in Nest?**

**Short answer:** `@HttpCode(204)`, `@Header('Cache-Control', 'no-store')`, or throw `HttpException`s for errors.

**Explanation:** Avoid using the raw response object unless needed (it bypasses interceptors).

**Example:** `@Delete(':id') @HttpCode(204) remove(@Param('id') id: string) { return this.svc.remove(id); }`.

**Say it like this:** "Decorators set status and headers declaratively, and I avoid the raw response so interceptors still work."

---

**Q22. What built-in HTTP exceptions does Nest provide?**

**Short answer:** `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException` and others, all extending `HttpException`.

**Explanation:** Throw them from services or create domain exceptions mapped by a filter.

**Example:** `throw new NotFoundException('Call not found')`.

**Say it like this:** "Nest's exceptions map straight to status codes, so services can signal 404 or 409 cleanly."

---

**Q23. What is the Nest CLI used for?**

**Short answer:** Generating modules, controllers, services and resources with consistent structure, plus building and running the app.

**Explanation:** `nest g resource calls` scaffolds a full CRUD feature.

**Example:** `nest g module scoring && nest g service scoring`.

**Say it like this:** "The CLI keeps structure consistent across the team, which is half the value of Nest."

---

**Q24. What is `main.ts` responsible for?**

**Short answer:** Bootstrapping: creating the app, global pipes, filters and interceptors, CORS, security middleware, versioning, Swagger, and listening on a port.

**Explanation:** Also enable shutdown hooks for graceful shutdown.

**Example:**

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.enableShutdownHooks();
await app.listen(3000);
```

**Say it like this:** "main.ts wires the global behaviour once: validation, security, docs and graceful shutdown."

---

## 🟡 More Intermediate

**Q25. How do you implement JWT authentication with Passport in Nest?**

**Short answer:** A `JwtStrategy` validates the token and returns the user; `AuthGuard('jwt')` protects routes; a global guard plus a `@Public()` decorator makes secure-by-default.

**Explanation:** Secure-by-default means new routes are protected unless explicitly public.

**Example:**

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }
  canActivate(ctx: ExecutionContext) {
    return this.reflector.get<boolean>('isPublic', ctx.getHandler()) || super.canActivate(ctx);
  }
}
```

**Say it like this:** "Auth is a global guard, so every new route is protected by default and public routes must opt out explicitly."

---

**Q26. How do you create a custom decorator like `@CurrentUser()`?**

**Short answer:** `createParamDecorator` that reads `request.user` from the execution context.

**Explanation:** Cleaner and more testable than reaching for `@Req()`.

**Example:**

```ts
export const CurrentUser = createParamDecorator((_d, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user);
```

**Say it like this:** "A small param decorator gives handlers the user directly, without touching the raw request."

---

**Q27. How does Swagger/OpenAPI work in Nest?**

**Short answer:** `@nestjs/swagger` builds an OpenAPI document from controllers, DTOs and decorators like `@ApiProperty`, served at `/docs`.

**Explanation:** The CLI plugin can infer most DTO properties automatically.

**Example:** `SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, new DocumentBuilder().addBearerAuth().build()))`.

**Say it like this:** "The OpenAPI spec comes from the code, so docs stay accurate and the frontend can generate types from it."

---

**Q28. How do you implement caching in Nest?**

**Short answer:** `@nestjs/cache-manager` with a Redis store, `CacheInterceptor` for GET routes, or manual caching in services.

**Explanation:** Include tenant and user in cache keys where responses differ.

**Example:** `@UseInterceptors(CacheInterceptor) @CacheTTL(60) @Get('leaderboard')`.

**Say it like this:** "Simple GET caching via an interceptor, and manual caching where the key needs tenant or user context."

---

**Q29. How do you schedule cron jobs in Nest?**

**Short answer:** `@nestjs/schedule` with `@Cron()`, `@Interval()` and `@Timeout()` decorators.

**Explanation:** With multiple instances, every instance runs the cron, so use a distributed lock or a dedicated worker.

**Example:** `@Cron('0 2 * * *') async nightlyAggregates() { if (await lock.acquire('nightly')) await this.agg.run(); }`.

**Say it like this:** "Cron decorators are easy, but with several replicas I make sure only one runs the job, using a lock or a single scheduler."

---

**Q30. How do you use events inside a Nest app?**

**Short answer:** `@nestjs/event-emitter` for in-process events (`@OnEvent`), or queues and brokers for cross-service or durable events.

**Explanation:** In-process events decouple modules but are lost on crash.

**Example:** `this.events.emit('scorecard.finalised', { id })`; a notifications listener sends emails.

**Say it like this:** "In-process events decouple modules; anything that must not be lost goes through a queue."

---

**Q31. What are dynamic modules (`forRoot`, `forRootAsync`)?**

**Short answer:** Modules configured at import time, returning providers based on options; `forRootAsync` builds options from injected config.

**Explanation:** Used for database, cache and client libraries.

**Example:** `TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (c) => ({ url: c.get('DATABASE_URL') }) })`.

**Say it like this:** "Dynamic modules let reusable modules take configuration, usually from ConfigService."

---

**Q32. How do you version APIs in Nest?**

**Short answer:** `app.enableVersioning({ type: VersioningType.URI })` and `@Version('2')` on controllers or routes.

**Explanation:** Header or media-type versioning are also supported.

**Example:** `@Controller({ path: 'calls', version: '2' })`.

**Say it like this:** "Nest has versioning built in, so v1 and v2 controllers can live side by side cleanly."

---

**Q33. How do you handle file uploads in Nest?**

**Short answer:** `FileInterceptor` with Multer options and `ParseFilePipe` validators for size and type, or presigned S3 URLs for large files.

**Explanation:** Keep files out of memory for big uploads.

**Example:** `@UseInterceptors(FileInterceptor('file')) upload(@UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 5e6 })] })) f)`.

**Say it like this:** "Small uploads use the interceptor with validators; large ones go straight to S3 via presigned URLs."

---

## 🔴 More Advanced

**Q34. How do you implement rate limiting in Nest?**

**Short answer:** `@nestjs/throttler` with a Redis storage for multiple instances, plus per-route overrides with `@Throttle()`.

**Explanation:** Key by user for authenticated routes.

**Example:** `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])` with `@Throttle({ default: { limit: 5, ttl: 60_000 } })` on login.

**Say it like this:** "The throttler module with Redis storage gives shared limits, tighter on auth routes."

---

**Q35. How do you build GraphQL APIs in Nest?**

**Short answer:** `@nestjs/graphql` with Apollo or Mercurius, code-first `@ObjectType`, `@Resolver`, `@Query`, `@Mutation` and `@ResolveField`, guards for auth and DataLoaders in context.

**Explanation:** Guards need `GqlExecutionContext` to read the request.

**Example:** `@ResolveField(() => Brand) brand(@Parent() c: Campaign, @Context('loaders') l) { return l.brand.load(c.brandId); }`.

**Say it like this:** "Same modules and services as REST, but resolvers instead of controllers, with DataLoaders to avoid N+1."

---

**Q36. How do you handle transactions across services in Nest?**

**Short answer:** Start the transaction in the use-case service and pass the transaction client (or use CLS-based transactional decorators) to repositories.

**Explanation:** `@nestjs-cls/transactional` propagates the transaction implicitly.

**Example:** `@Transactional() async finalise(id) { await this.scorecards.finalise(id); await this.audit.log(id); }`.

**Say it like this:** "The use case owns the transaction, and repositories join it, so either everything is saved or nothing is."

---

**Q37. How do you structure a large Nest codebase?**

**Short answer:** Feature modules with clear public exports, a shared or core module for cross-cutting concerns, and layering inside each feature (controller, service, repository, DTOs).

**Explanation:** Lint rules (or Nx boundaries) stop features importing each other's internals.

**Example:** `src/modules/{calls,scorecards,tenants,auth}`, `src/common/{filters,guards,interceptors}`.

**Say it like this:** "Features are modules with explicit exports, and lint rules enforce the boundaries as the codebase grows."

---

**Q38. How do you use Prisma with Nest?**

**Short answer:** A `PrismaService` extending `PrismaClient`, injected into repositories; migrations via Prisma Migrate; extensions for tenant filtering.

**Explanation:** Connect in `onModuleInit` and use shutdown hooks.

**Example:** `@Injectable() export class PrismaService extends PrismaClient implements OnModuleInit { async onModuleInit() { await this.$connect(); } }`.

**Say it like this:** "Prisma becomes one injectable service, and repositories use it, so swapping or mocking it is easy."

---

## 🧩 More Scenarios

**Q39. A guard can't find `request.user`. Why?**

**Short answer:** Guard order: the roles guard ran before the authentication guard, or auth isn't applied to that route.

**Explanation:** Global guards run before controller and route guards, in registration order.

**Example:** Register `JwtAuthGuard` before `RolesGuard` in `APP_GUARD` providers.

**Say it like this:** "Roles need an authenticated user, so authentication must run first. It's usually a guard-order problem."

---

**Q40. A provider can't be resolved ("Nest can't resolve dependencies of X"). How do you fix it?**

**Short answer:** Make sure the provider is in the module's `providers`, or exported from another module that's imported, and check injection tokens and circular imports.

**Explanation:** The error message names the missing dependency index.

**Example:** `CallsService` used in `ScoringModule` but `CallsModule` didn't export it.

**Say it like this:** "That error almost always means a provider isn't exported or the module isn't imported. The message tells you which one."

---

**Q41. Validation isn't running on nested objects. Why?**

**Short answer:** `class-validator` needs `@ValidateNested()` and `@Type(() => Child)` from `class-transformer` for nested DTOs.

**Explanation:** Without `@Type`, the nested object stays a plain object and isn't validated.

**Example:** `@ValidateNested({ each: true }) @Type(() => AnswerDto) answers: AnswerDto[];`.

**Say it like this:** "Nested DTOs need both ValidateNested and Type, otherwise they silently skip validation."

---

## 🎯 From Your Resume

**Q42. "What did you build with NestJS at Slaylink?"**

**Short answer:** Describe the real features: [for example the creator and brand campaign APIs] with NestJS, GraphQL and MongoDB, organised in modules.

**Explanation:** Mention resolvers, guards for auth, and how you structured modules. Be honest about scale and what you'd improve.

**Example:** "A `CampaignsModule` with a GraphQL resolver, a service and a Mongoose model, protected by a JWT guard."

**Say it like this:** "At Slaylink I built [campaign and profile features] in NestJS with GraphQL and MongoDB. The module structure made it easy for interns to add features in the same pattern, which mattered because I was also assigning their tasks."
