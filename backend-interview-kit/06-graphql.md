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

## 🟢 More Basics

**Q16. What are scalar types in GraphQL?**

**Short answer:** Built-in `Int`, `Float`, `String`, `Boolean` and `ID`, plus custom scalars like `DateTime`, `JSON` or `Email`.

**Explanation:** Custom scalars validate and serialise values consistently.

**Example:** `scalar DateTime` with a resolver that parses and serialises ISO strings.

**Say it like this:** "Custom scalars like DateTime keep formats consistent across the whole schema."

---

**Q17. What are input types?**

**Short answer:** Types used as arguments to mutations and queries, defined with `input`; they can't contain output-only fields or resolvers.

**Explanation:** One input object per mutation keeps signatures stable as fields are added.

**Example:** `input UpdateProfileInput { phone: String, address: AddressInput }` → `updateProfile(input: UpdateProfileInput!)`.

**Say it like this:** "Mutations take a single input object, so adding a field later doesn't break callers."

---

**Q18. What are enums, interfaces and unions?**

**Short answer:** Enums restrict values to a set; interfaces define shared fields implemented by types; unions say a field can be one of several types.

**Explanation:** Clients use `__typename` and fragments to handle interfaces and unions.

**Example:** `union SearchResult = Call | Agent | Report`.

**Say it like this:** "Enums for fixed values, interfaces for shared shapes, unions when a field can be different types."

---

**Q19. What are fragments?**

**Short answer:** Reusable sets of fields that queries can include, often colocated with the UI component that needs them.

**Explanation:** Inline fragments (`... on Call`) select fields on specific types in unions.

**Example:** `fragment CallSummary on Call { id startedAt score }`.

**Say it like this:** "Fragments let each component declare its own data needs, and the page query composes them."

---

**Q20. What are variables, and why use them?**

**Short answer:** Values passed separately from the query text, typed in the operation signature.

**Explanation:** They enable caching of parsed queries, persisted queries, and avoid string concatenation (injection).

**Example:** `query Call($id: ID!) { call(id: $id) { id } }` with `{ "id": "c_42" }`.

**Say it like this:** "The query text stays constant and values go in variables, which is safer and cacheable."

---

**Q21. What is introspection, and should it be enabled in production?**

**Short answer:** A built-in query that returns the schema; tools rely on it. Disable it for public production APIs or restrict it to authenticated developers.

**Explanation:** Introspection makes it easier for attackers to map your API, though it's not a security boundary itself.

**Example:** Enabled in dev and staging; disabled in prod with persisted queries.

**Say it like this:** "Introspection is great for tooling, but on a public production API I turn it off and rely on persisted queries."

---

## 🟡 More Intermediate

**Q22. How do subscriptions work, and how do you scale them?**

**Short answer:** Clients subscribe over WebSocket (graphql-ws); the server pushes results when events are published, using a pub/sub backend (Redis) across instances.

**Explanation:** Authorise each subscription and filter events per user or tenant.

**Example:** `subscription { callScored(tenantId: $t) { id score } }` backed by Redis pub/sub.

**Say it like this:** "Subscriptions are WebSockets plus pub/sub; across instances Redis fans events out, and every subscription is authorised."

---

**Q23. How do you design mutations well?**

**Short answer:** Name by intent (`finaliseScorecard`, not `updateScorecard`), take one input object, and return the changed object plus typed errors.

**Explanation:** Returning the changed object lets client caches update automatically.

**Example:** `finaliseScorecard(input: { id }): FinaliseScorecardPayload { scorecard { id status } errors { field message } }`.

**Say it like this:** "Mutations are named after the business action and return what changed, so the client cache stays correct."

---

**Q24. How do you handle file uploads with GraphQL?**

**Short answer:** Usually not through GraphQL: get a presigned URL from a mutation, upload directly to storage, then confirm with another mutation.

**Explanation:** The multipart request spec exists but complicates CSRF and gateways.

**Example:** `createUploadUrl(fileName)` → PUT to S3 → `attachRecording(callId, key)`.

**Say it like this:** "GraphQL handles metadata; the bytes go straight to S3 with a presigned URL."

---

**Q25. How do you do field-level authorisation?**

**Short answer:** Check permissions in the field resolver (or with a schema directive) and return null or an error for sensitive fields.

**Explanation:** Make sensitive fields nullable so a denied field doesn't break the whole object.

**Example:** `Patient.notes` resolver returns null unless the user is the assigned provider.

**Say it like this:** "Sensitive fields check permission in their own resolver, and they're nullable so denial is graceful."

---

**Q26. What are persisted queries?**

**Short answer:** Clients send a hash or ID instead of the full query text; the server looks up a registered query.

**Explanation:** Smaller requests, GET-friendly for CDN caching, and an allowlist that blocks arbitrary queries.

**Example:** `GET /graphql?id=7f3a…&variables=…`.

**Say it like this:** "Persisted queries make GraphQL cacheable over GET and lock production to queries we've approved."

---

**Q27. How do you test a GraphQL API?**

**Short answer:** Unit test resolvers and services, integration test operations against a test server and database, and check schema changes against client operations in CI.

**Explanation:** Snapshot the schema to catch unintended changes.

**Example:** `server.executeOperation({ query, variables }, { contextValue: { user } })`.

**Say it like this:** "I test operations end to end with a real context and database, and CI flags any breaking schema change."

---

**Q28. How do you monitor GraphQL in production?**

**Short answer:** Per-operation and per-resolver metrics (latency, errors), operation names required, tracing with OpenTelemetry, and schema usage analytics.

**Explanation:** HTTP metrics alone are useless with one endpoint.

**Example:** Dashboard of p95 latency by `operationName`.

**Say it like this:** "With one endpoint, monitoring must be per operation and per resolver, otherwise everything looks like one URL."

---

## 🔴 More Advanced

**Q29. How does Apollo Client's normalised cache work?**

**Short answer:** It splits responses into objects keyed by `__typename:id`, so any query that returns the same object updates it everywhere.

**Explanation:** Mutations that return updated objects refresh all views; lists need cache updates or refetches.

**Example:** Updating a passenger's name in one widget updates the booking summary automatically.

**Say it like this:** "Normalisation means one copy per object, so an update anywhere shows up everywhere."

---

**Q30. How do you implement query cost analysis?**

**Short answer:** Assign a cost to each field (higher for lists and expensive resolvers), multiply by list size arguments, and reject or throttle queries above a budget.

**Explanation:** Rate limit by cost per minute instead of request count.

**Example:** `calls(first: 100) { scorecards(first: 10) { … } }` costs 100 × 10 = 1,000 points.

**Say it like this:** "Each query gets a price before it runs, and clients have a budget, which stops expensive queries without blocking normal use."

---

**Q31. What is the difference between schema stitching and federation?**

**Short answer:** Stitching merges schemas at a gateway with manual configuration; federation has subgraphs declare how types connect (`@key`), and a router composes them.

**Explanation:** Federation is the modern standard for multi-team graphs.

**Example:** `type Booking @key(fields: "id")` extended by the Loyalty subgraph with `points`.

**Say it like this:** "Federation lets each team own part of the graph declaratively; stitching needs the gateway to know everything."

---

**Q32. How do you handle errors in federated graphs?**

**Short answer:** Each subgraph returns errors with codes; the router merges partial data and errors; nullable fields from flaky subgraphs keep responses usable.

**Explanation:** Timeouts per subgraph prevent one slow team's service from stalling everything.

**Example:** Loyalty subgraph down → `points: null` with an error, booking still displayed.

**Say it like this:** "Subgraph failures should degrade one field, not the whole page."

---

## 🧩 More Scenarios

**Q33. A mobile app on an old version breaks after a schema change. What went wrong?**

**Short answer:** A field was removed or changed while old clients still used it; the schema check didn't use real client operations.

**Explanation:** Mobile apps live for months, so deprecate and track usage before removal.

**Example:** Removing `Booking.seat` broke app version 3.2, still used by 15% of users.

**Say it like this:** "Mobile clients stick around, so removals wait until usage data shows nobody still queries the field."

---

**Q34. Response times vary hugely between identical-looking queries. Why?**

**Short answer:** Different variables (list sizes, user data volume), cache hits vs misses, or DataLoader batching not kicking in for some paths.

**Explanation:** Trace with variables (redacted) to compare.

**Example:** Users with thousands of bookings hit an unpaginated nested list.

**Say it like this:** "Same query, different data: unbounded nested lists usually explain it, so every list gets pagination."

---

**Q35. The team wants to expose the database schema directly as GraphQL (auto-generated). Is that a good idea?**

**Short answer:** Fine for internal prototyping; risky for public APIs because it couples clients to tables and makes authorisation harder.

**Explanation:** Design the schema around client needs and domain concepts.

**Example:** Hasura or PostGraphile with strict permission rules for an internal admin tool.

**Say it like this:** "Generated APIs are quick for internal tools, but a public schema should model the domain, not mirror tables."

---

## 🎯 From Your Resume

**Q36. "Why did the airline site use GraphQL, and what were the challenges?"**

**Short answer:** It aggregated many backend services into the exact shape each widget needed; challenges were N+1 on the server, caching, partial errors and query cost.

**Explanation:** As a frontend developer there, focus on what you saw: Apollo cache, handling partial data, and coordinating schema changes.

**Example:** "The booking widget needed data from bookings, loyalty and flights in one query; Apollo's normalised cache kept the profile and booking views in sync."

**Say it like this:** "GraphQL let each widget fetch exactly its data in one round trip. The hard parts were caching, handling partial errors gracefully, and keeping expensive queries under control."

---

**Q37. "How did you build GraphQL APIs with NestJS at Slaylink?"**

**Short answer:** Code-first resolvers with NestJS decorators, services behind them, MongoDB through Mongoose, and guards for auth.

**Explanation:** Mention DataLoader if you used it; if not, say how you'd add it now.

**Example:** `@Resolver(() => Campaign)` with a `@ResolveField()` for the brand, batched with DataLoader [if used].

**Say it like this:** "I built code-first resolvers in NestJS backed by services and Mongoose. Looking back, the first thing I'd check in that code is N+1 on nested fields, and I'd add DataLoader where needed."
