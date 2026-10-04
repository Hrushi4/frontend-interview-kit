# 06 — GraphQL

GraphQL appears twice on your resume: the airline widgets at LTIMindtree (client side) and Slaylink with NestJS (server side). Expect schema design, resolvers, the N+1 problem and security.

**How this file is organised**

- **Part A — Understand the topic:** what GraphQL is, schemas, queries, mutations, resolvers and its trade-offs, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is GraphQL?

GraphQL is a query language for APIs. There's usually **one endpoint** (`POST /graphql`), and the client sends a query describing exactly the fields it wants. The server returns that shape and nothing more.

```graphql
query {
  booking(id: "B12") {
    reference
    passengers { firstName lastName }
    flights { number departure }
  }
}
```

### The schema is the contract

The schema defines **types**, **queries** (reads), **mutations** (writes) and **subscriptions** (real-time). It's strongly typed, so clients and tools know exactly what's available.

```graphql
type Booking { id: ID!  reference: String!  passengers: [Passenger!]!  flights: [Flight!]! }
type Query { booking(id: ID!): Booking }
type Mutation { cancelBooking(id: ID!): Booking! }
```

### Resolvers

Each field has a **resolver**, a function that returns its value. The server calls resolvers for the fields in the query, nesting as needed. This flexibility causes GraphQL's classic problem: **N+1 queries**, solved by **DataLoader** batching.

### Trade-offs vs REST

| GraphQL strengths | GraphQL costs |
|---|---|
| no over- or under-fetching | HTTP caching is harder (one POST endpoint) |
| one round trip for nested data | expensive queries need cost limits |
| typed schema, great tooling | N+1 problems without batching |
| easy to evolve by adding fields | authorisation per field takes discipline |

### Why interviewers ask about it

They want to know whether you can run GraphQL safely in production, not just write queries: performance, security, caching and schema evolution.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. What is GraphQL, and how does it differ from REST?**

**Short answer:** A typed query language where clients ask for exactly the fields they need from one endpoint, instead of many fixed REST endpoints.

**Explanation:** REST shapes are decided by the server per endpoint; GraphQL shapes are decided by the client per query.

**Example:** A booking widget fetches booking, passengers and flights in one query instead of three REST calls.

**Say it like this:** "GraphQL lets the client describe the data shape it needs. It shines when many UIs need different slices of the same data."

---

**Q2. Queries vs mutations vs subscriptions?**

**Short answer:** Queries read, mutations write, subscriptions push real-time updates (usually over WebSocket).

**Explanation:** Mutations run in order; query fields can be resolved in parallel.

**Example:** `mutation { updateProfile(input: { phone: "..." }) { id phone } }` returns the updated fields.

**Say it like this:** "Queries read, mutations change and return what changed, and subscriptions push updates."

---

**Q3. What is a resolver?**

**Short answer:** A function that returns the value of a field, receiving `(parent, args, context, info)`.

**Explanation:** `context` holds per-request data like the user and DataLoaders. Keep resolvers thin and call services.

**Example:**

```ts
const resolvers = {
  Query: { booking: (_p, { id }, ctx) => ctx.bookings.getForUser(id, ctx.user) },
  Booking: { passengers: (b, _a, ctx) => ctx.loaders.passengersByBooking.load(b.id) },
};
```

**Say it like this:** "Each field has a resolver. I keep them thin and put the real logic in services, the same as with REST controllers."

---

**Q4. What does `!` mean in a schema?**

**Short answer:** Non-null: the field always has a value. `[Item!]!` is a non-null list of non-null items.

**Explanation:** Be careful: if a non-null field errors, the null bubbles up to the nearest nullable parent, which can wipe out a large part of the response.

**Example:** Making `Booking.loyaltyStatus` nullable meant a loyalty-service outage didn't break the whole booking query.

**Say it like this:** "Non-null is a promise. For fields from flaky services I keep them nullable, so one failure doesn't null out the whole response."

---

## 🟡 Level 2 — Intermediate

**Q5. What is the N+1 problem, and how does DataLoader fix it?**

**Short answer:** Fetching a list of N items, then running one query per item for a related field. DataLoader batches those into one query per request tick and caches per request.

**Explanation:** Create DataLoaders per request (in context) so caches don't leak between users.

**Example:**

```ts
const passengersByBooking = new DataLoader(async (bookingIds: string[]) => {
  const rows = await db.passenger.findMany({ where: { bookingId: { in: bookingIds } } });
  return bookingIds.map((id) => rows.filter((r) => r.bookingId === id));
});
```

**Say it like this:** "Without batching, 50 bookings means 51 queries. DataLoader collects the IDs and makes one query, and it's created per request so no data leaks across users."

---

**Q6. How do you handle authentication and authorisation?**

**Short answer:** Authenticate once per request and put the user in context; authorise in resolvers or services, including field-level rules where needed.

**Explanation:** Schema directives (`@auth(role: ADMIN)`) or middleware can enforce roles, but object-level checks belong in services.

**Example:** `Booking.paymentDetails` resolver returns null unless `ctx.user.id === booking.ownerId`.

**Say it like this:** "Auth happens once into context; permissions are checked where data is loaded, down to sensitive fields."

---

**Q7. How do you protect a GraphQL API from expensive queries?**

**Short answer:** Depth limits, query cost analysis, pagination limits, timeouts, and persisted queries in production.

**Explanation:** A deeply nested query can multiply database load exponentially.

**Example:** Reject queries deeper than 8 levels or above a cost of 1,000; require `first: <= 100` on lists.

**Say it like this:** "GraphQL gives clients power, so the server must limit it: depth, cost, page size and, ideally, only allowlisted persisted queries."

---

**Q8. How does pagination work in GraphQL?**

**Short answer:** Usually the Relay connection pattern: `edges`, `node`, `cursor` and `pageInfo { hasNextPage endCursor }`.

**Explanation:** Cursor-based, like REST cursor pagination, and supported by Apollo Client caching helpers.

**Example:**

```graphql
calls(first: 20, after: "Y3Vyc29y") { edges { node { id score } } pageInfo { hasNextPage endCursor } }
```

**Say it like this:** "I use the connection pattern: cursors for stable paging, and pageInfo so the client knows when to stop."

---

**Q9. How are errors returned?**

**Short answer:** HTTP 200 with an `errors` array alongside partial `data`; use error codes in `extensions` for the client to switch on.

**Explanation:** Business errors can also be modelled as union result types (`UpdateResult = Success | ValidationError`), which are typed.

**Example:** `{ "errors": [{ "message": "Not found", "extensions": { "code": "NOT_FOUND" } }], "data": { "booking": null } }`.

**Say it like this:** "GraphQL can return partial data with errors, so clients check both. For expected business errors I prefer typed result unions."

---

**Q10. How does caching work with GraphQL?**

**Short answer:** Client-side, Apollo's normalised cache by `__typename` and `id`; server-side, DataLoader per request, resolver-level caching in Redis, and CDN caching for persisted GET queries.

**Explanation:** Because most queries are POSTs, HTTP caching needs persisted queries sent as GET.

**Example:** Airport and fare-class lists cached in Redis for an hour at the resolver level.

**Say it like this:** "HTTP caching is harder with GraphQL, so I cache at the client with a normalised cache and at the resolver level on the server."

---

## 🔴 Level 3 — Advanced

**Q11. How do you evolve a GraphQL schema without breaking clients?**

**Short answer:** Add fields freely, mark old ones `@deprecated(reason: ...)`, track field usage, and remove only when unused.

**Explanation:** Schema registries (Apollo GraphOS, GraphQL Hive) check changes against real client operations in CI.

**Example:** `agentName: String @deprecated(reason: "Use agent { displayName }")`.

**Say it like this:** "GraphQL avoids versioning by deprecating fields and watching usage. A schema check in CI blocks changes that would break real queries."

---

**Q12. What is federation?**

**Short answer:** Combining several GraphQL services (subgraphs) into one graph through a gateway or router, with each team owning its types.

**Explanation:** Types can be extended across services with `@key`. It adds operational complexity, so use it when multiple teams own separate domains.

**Example:** Bookings, Loyalty and Flights subgraphs composed into one airline graph.

**Say it like this:** "Federation lets each team own part of one graph. It's worth it with several teams, not for one service."

---

**Q13. Code-first vs schema-first?**

**Short answer:** Schema-first writes SDL and implements resolvers; code-first generates SDL from TypeScript classes or builders (NestJS decorators, Pothos).

**Explanation:** Code-first keeps types and schema in sync in TypeScript projects; schema-first is great for design-first collaboration.

**Example:** NestJS `@ObjectType()` and `@Field()` decorators generate the schema.

**Say it like this:** "In NestJS I go code-first so the TypeScript types and schema can't drift. Schema-first is nice when designing the API with other teams first."

---

## 🧩 Level 4 — Scenario-Based

**Q14. A GraphQL endpoint is slow under load. How do you investigate?**

**Short answer:** Trace per-resolver timings, look for N+1 patterns, check DataLoader usage, query cost, and missing database indexes.

**Explanation:** Apollo tracing or OpenTelemetry shows which resolver dominates.

**Example:** Tracing showed 120 calls to the loyalty service per query; adding a DataLoader made it one.

**Say it like this:** "I trace resolvers first. Slow GraphQL is usually N+1 or one unbounded list, not GraphQL itself."

---

**Q15. Someone sends a query requesting thousands of nested items and the database spikes. What do you do?**

**Short answer:** Add depth and cost limits, cap list arguments, add timeouts, and move to persisted queries for public clients.

**Explanation:** Also rate limit by cost, not just by request count.

**Example:** A cost limit of 1,000 points, where each list item costs 1 and each nested list multiplies.

**Say it like this:** "That's a query-cost problem. I limit depth and cost and only allow known queries from production clients."

---

## 🎯 From Your Resume

**Q16. "Why did the airline site use GraphQL, and what were the challenges?"**

**Short answer:** It aggregated many backend services into the exact shape each widget needed; challenges were N+1 on the server, caching, partial errors and query cost.

**Explanation:** As a frontend developer there, focus on what you saw: Apollo cache, handling partial data, and coordinating schema changes.

**Example:** "The booking widget needed data from bookings, loyalty and flights in one query; Apollo's normalised cache kept the profile and booking views in sync."

**Say it like this:** "GraphQL let each widget fetch exactly its data in one round trip. The hard parts were caching, handling partial errors gracefully, and keeping expensive queries under control."

---

**Q17. "How did you build GraphQL APIs with NestJS at Slaylink?"**

**Short answer:** Code-first resolvers with NestJS decorators, services behind them, MongoDB through Mongoose, and guards for auth.

**Explanation:** Mention DataLoader if you used it; if not, say how you'd add it now.

**Example:** `@Resolver(() => Campaign)` with a `@ResolveField()` for the brand, batched with DataLoader [if used].

**Say it like this:** "I built code-first resolvers in NestJS backed by services and Mongoose. Looking back, the first thing I'd check in that code is N+1 on nested fields, and I'd add DataLoader where needed."
