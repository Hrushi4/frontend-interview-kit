# 08 — MongoDB

MongoDB powered your Blood Bank and Quiz App (with Mongoose) and the Slaylink platform. Expect document modelling, indexing, aggregation and the trade-offs against SQL.

**How this file is organised**

- **Part A — Understand the topic:** documents and collections, embedding vs referencing, indexes and the aggregation pipeline, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### What is MongoDB?

A **document database**. Instead of rows in tables, it stores JSON-like **documents** (BSON) in **collections**. Documents in one collection can have different fields, and related data can be **embedded** inside a document instead of joined from another table.

```json
{
  "_id": "q_17",
  "title": "JavaScript basics",
  "createdBy": "teacher_4",
  "questions": [
    { "text": "What is a closure?", "options": ["…"], "answer": 2 }
  ]
}
```

### Embed or reference?

| Embed when | Reference when |
|---|---|
| data is read together | data is read separately or shared |
| the child list is small and bounded | the list grows without limit |
| the child belongs to one parent | many parents point to it |

The rule: **model for your queries**. A document has a 16 MB limit, so unbounded arrays (every donation a donor ever made) belong in their own collection.

### Indexes and aggregation

Indexes work like in SQL (B-trees, compound indexes, the order of fields matters). The **aggregation pipeline** processes documents through stages like `$match`, `$group`, `$lookup` (a join) and `$sort`.

### Consistency

Single-document writes are atomic. Multi-document **transactions** exist (on replica sets) but cost more, so good modelling keeps related writes in one document.

### Why interviewers ask about it

They check whether you can model data well for MongoDB rather than treating it as schemaless JSON storage, and whether you know when a relational database would be the better fit.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. MongoDB vs a relational database: when do you choose each?**

**Short answer:** MongoDB for flexible, document-shaped data read as a whole; PostgreSQL for relational data with joins, constraints and complex transactions.

**Explanation:** Many apps are fine with either. Strong consistency across many entities and reporting usually favours SQL.

**Example:** A quiz with its questions embedded is a natural document; billing with invoices, payments and refunds is naturally relational.

**Say it like this:** "I choose by data shape and access pattern. Self-contained documents fit Mongo; data with lots of relationships and invariants fits Postgres."

---

**Q2. What is a document and a collection?**

**Short answer:** A document is a BSON record (like a JSON object) with an `_id`; a collection is a group of documents, like a table without a fixed schema.

**Explanation:** "Schemaless" doesn't mean no schema; validate with Mongoose schemas or MongoDB's JSON Schema validation.

**Example:** `db.donors.insertOne({ name: "Asha", bloodGroup: "O+", city: "Pune" })`.

**Say it like this:** "Mongo doesn't force a schema, so I enforce one myself with Mongoose or collection validation."

---

**Q3. What is Mongoose?**

**Short answer:** An ODM for Node that adds schemas, validation, middleware hooks, population of references and a model API on top of the MongoDB driver.

**Explanation:** Use `.lean()` for read-only queries to skip document overhead.

**Example:**

```js
const Donation = model('Donation', new Schema({
  donor: { type: Schema.Types.ObjectId, ref: 'Donor', required: true, index: true },
  units: { type: Number, min: 1, required: true },
  donatedAt: { type: Date, default: Date.now },
}));
```

**Say it like this:** "Mongoose gives me schemas and validation on top of Mongo. For read-heavy endpoints I use lean queries to keep them fast."

---

**Q4. Embedding vs referencing?**

**Short answer:** Embed small, bounded data that's read with its parent; reference large, growing or shared data.

**Explanation:** Unbounded arrays hit the 16 MB limit and make updates slow.

**Example:** Quiz questions embedded in the quiz; student attempts in their own collection referencing the quiz.

**Say it like this:** "Questions live inside the quiz because they're always read together. Attempts grow forever, so they get their own collection."

---

## 🟡 Level 2 — Intermediate

**Q5. How do indexes work in MongoDB?**

**Short answer:** B-tree indexes on fields, compound indexes (order matters, with equality, sort, range ordering), plus unique, TTL, text and geospatial indexes.

**Explanation:** Check with `.explain('executionStats')`; look for `COLLSCAN` and the ratio of documents examined to returned.

**Example:** `db.donations.createIndex({ hospitalId: 1, donatedAt: -1 })` for "this hospital's recent donations".

**Say it like this:** "Same rules as SQL: index real query patterns with equality fields first, then the sort, and verify with explain."

---

**Q6. What is the aggregation pipeline?**

**Short answer:** A sequence of stages that filter, transform, group and join documents, run inside the database.

**Explanation:** Put `$match` early to use indexes and reduce data before `$group` or `$lookup`.

**Example:**

```js
db.attempts.aggregate([
  { $match: { quizId, submittedAt: { $gte: since } } },
  { $group: { _id: '$studentId', avgScore: { $avg: '$score' }, attempts: { $sum: 1 } } },
  { $sort: { avgScore: -1 } },
]);
```

**Say it like this:** "The quiz results report was an aggregation pipeline: match the quiz, group by student, sort by average score."

---

**Q7. What is `$lookup`, and when is it a smell?**

**Short answer:** A left outer join to another collection; frequent heavy `$lookup`s suggest the data might be better modelled differently, or as relational data.

**Explanation:** `$lookup` on unindexed fields is slow.

**Example:** Joining donations to donors for a report is fine; joining five collections on every page load is a smell.

**Say it like this:** "An occasional lookup is fine. If every request needs several joins, the model or the database choice is wrong."

---

**Q8. How do transactions work in MongoDB?**

**Short answer:** Multi-document ACID transactions on replica sets and sharded clusters, using sessions; they're slower, so prefer single-document atomic updates.

**Explanation:** Atomic operators (`$inc`, `$push`, `$set` with conditions) cover many cases.

**Example:**

```js
await Inventory.updateOne({ _id: bankId, units: { $gte: 2 } }, { $inc: { units: -2 } });
```

**Say it like this:** "I design so most writes touch one document with atomic operators, and use transactions only when several documents truly must change together."

---

**Q9. What are write concern and read concern?**

**Short answer:** Write concern sets how many replicas must acknowledge a write (`w: "majority"` for durability); read concern sets what consistency reads see.

**Explanation:** `w: 1` is faster but can lose writes on failover.

**Example:** Donations use `w: "majority"`; analytics events could use `w: 1`.

**Say it like this:** "Important writes wait for a majority of replicas, so a failover can't lose them."

---

**Q10. How do you paginate large collections?**

**Short answer:** Range-based (cursor) pagination on an indexed field like `_id` or `createdAt`, not `skip()` for deep pages.

**Explanation:** `skip(100000)` still walks 100,000 documents.

**Example:** `find({ _id: { $lt: lastSeenId } }).sort({ _id: -1 }).limit(50)`.

**Say it like this:** "skip gets slower with depth, so I page by the last seen ID instead."

---

## 🔴 Level 3 — Advanced

**Q11. How does sharding work?**

**Short answer:** Data is split across shards by a shard key; a router (`mongos`) sends queries to the right shard.

**Explanation:** A good shard key has high cardinality, spreads writes evenly, and matches common queries. Monotonic keys (timestamps) create hot shards unless hashed.

**Example:** Shard calls by `{ tenantId: 1, _id: 1 }` so each tenant's queries usually hit one shard.

**Say it like this:** "The shard key is the most important decision, because changing it later is painful. I pick it from the main query pattern."

---

**Q12. What are replica sets?**

**Short answer:** A primary plus secondaries that copy its data; if the primary fails, the secondaries elect a new one automatically.

**Explanation:** Reads from secondaries can be stale.

**Example:** A three-member replica set survives one node failure.

**Say it like this:** "Replica sets give automatic failover. I read from the primary unless slightly stale data is acceptable."

---

**Q13. How do you handle schema changes in MongoDB?**

**Short answer:** Version documents (`schemaVersion`), make code handle both shapes, migrate lazily on read or with a background script.

**Explanation:** No `ALTER TABLE` doesn't mean no migrations; it means you manage them in code.

**Example:** `if (doc.schemaVersion === 1) doc = upgradeV1toV2(doc)`.

**Say it like this:** "Flexible schemas still need migrations. I version documents and upgrade them safely."

---

## 🧩 Level 4 — Scenario-Based

**Q14. A query got slow as the collection grew to millions of documents. What do you do?**

**Short answer:** `explain()` to find collection scans, add the right compound index, project only needed fields, and fix unbounded arrays or deep `skip`.

**Explanation:** Also check working set fits in RAM.

**Example:** `find({ hospitalId, status })` sorted by date had no index → compound index `(hospitalId, status, date)`.

**Say it like this:** "explain shows whether it's scanning. Usually one compound index matching the filter and sort fixes it."

---

**Q15. A document hit the 16 MB limit. What went wrong?**

**Short answer:** An unbounded embedded array, such as every event or comment ever, stored inside one document.

**Explanation:** Move the array to its own collection, or use the bucket pattern (documents per day or per 100 items).

**Example:** Donation history moved from `donor.donations[]` into a `donations` collection.

**Say it like this:** "That's the classic unbounded-array mistake. Growing lists get their own collection."

---

## 🎯 From Your Resume

**Q16. "How did you model the Blood Bank data in MongoDB?"**

**Short answer:** Separate collections for donors, hospitals, organisations, donations and inventory, with references, because donation history grows without bound.

**Explanation:** Inventory updates used atomic `$inc` with conditions so stock couldn't go negative.

**Example:** `donations: { donorId, organisationId, bloodGroup, units, date }` with an index on `(organisationId, date)`.

**Say it like this:** "Each role had its own collection, donations referenced donors because history grows forever, and inventory changes were atomic increments with a check, so stock couldn't go below zero."

---

**Q17. "Would you use MongoDB again for those projects?"**

**Short answer:** For quick prototypes, yes; for the inventory and reporting side, PostgreSQL would give stronger guarantees and easier reporting.

**Explanation:** Showing that you'd choose differently with hindsight demonstrates judgement.

**Example:** Monthly consumption reports across hospitals are simple GROUP BY queries in SQL.

**Say it like this:** "Mongo let us move fast. With what I know now, the inventory and reporting needs are relational, so I'd use Postgres for those."
