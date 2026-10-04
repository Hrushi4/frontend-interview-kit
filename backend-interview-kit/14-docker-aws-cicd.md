# 14 — Docker, AWS and CI/CD

Your resume lists AWS, Docker, GitHub Actions and Shell Scripting, and describes designing self-hosted LiveKit infrastructure on AWS with Docker, CI/CD, caching, CDN and monitoring. Expect practical questions on containers, core AWS services and deployment pipelines.

**How this file is organised**

- **Part A — Understand the topic:** containers, the core AWS services, and how CI/CD pipelines work, explained simply.
- **Part B — Interview questions and answers:** Docker → AWS → CI/CD → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### Containers in one paragraph

A **container** packages an app with everything it needs (runtime, libraries, config) so it runs the same on a laptop, in CI and in production. A **Dockerfile** describes how to build the **image**; a **container** is a running instance of it. Containers share the host's kernel, so they're much lighter than virtual machines.

### Core AWS services you should know

| Service | What it does |
|---|---|
| EC2 | virtual machines |
| ECS / Fargate | run containers (Fargate: no servers to manage) |
| EKS | managed Kubernetes |
| Lambda | run functions on demand |
| S3 | object storage (files, recordings, backups, static sites) |
| RDS / Aurora | managed PostgreSQL and MySQL |
| ElastiCache | managed Redis |
| SQS / SNS | queues / pub-sub notifications |
| CloudFront | CDN |
| ALB / NLB | load balancers (HTTP / TCP-UDP) |
| VPC | private network, subnets, security groups |
| IAM | who can do what |
| CloudWatch | logs, metrics, alarms |
| Secrets Manager | secrets storage and rotation |

### A typical deployment

```text
Users → CloudFront (static React) 
      → ALB → ECS services (API containers, in private subnets, 2+ AZs)
                  → RDS PostgreSQL (Multi-AZ)   → ElastiCache Redis   → S3
```

### CI/CD

- **CI (continuous integration):** on every push or pull request, install, lint, type-check, test and build automatically.
- **CD (continuous delivery/deployment):** after merging, build an image, push it to a registry, and deploy, ideally with zero downtime and an easy rollback.

### Why interviewers ask about it

Seniors are expected to ship and run what they build. Interviewers check that you understand how code gets to production safely and what the infrastructure looks like underneath.

---

## Part B — Interview Questions and Answers

## 🐳 Docker

**Q1. Container vs virtual machine?**

**Short answer:** Containers share the host OS kernel and isolate processes; VMs run a full guest OS on a hypervisor. Containers start faster and are smaller.

**Explanation:** VMs isolate more strongly; containers are better for packaging and density.

**Example:** An API container starts in a second; an EC2 instance takes a minute or more.

**Say it like this:** "Containers isolate the app, VMs isolate the whole machine. We run containers on top of VMs for packaging and density."

---

**Q2. Write a good production Dockerfile for a Node API.**

**Short answer:** Multi-stage build, a small base image, dependencies installed before copying source (for layer caching), production dependencies only, and a non-root user.

**Explanation:** Use `.dockerignore` to keep `node_modules`, `.git` and secrets out of the build context.

**Example:**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Say it like this:** "Multi-stage keeps build tools out of the final image, dependency layers are cached, and the app runs as a non-root user."

---

**Q3. How does Docker layer caching work?**

**Short answer:** Each instruction creates a layer; if an instruction and its inputs haven't changed, Docker reuses the cached layer. Order from least to most frequently changed.

**Explanation:** Copying the whole source before `npm ci` invalidates the dependency layer on every code change.

**Example:** `COPY package*.json` then `RUN npm ci` then `COPY . .` → code changes don't reinstall dependencies.

**Say it like this:** "Put what changes rarely at the top. Dependencies before source code is the biggest build-time win."

---

**Q4. What is Docker Compose used for?**

**Short answer:** Defining and running multi-container setups for local development and tests: the API, PostgreSQL, Redis and workers with one command.

**Explanation:** Not usually for production at scale (ECS, Kubernetes instead).

**Example:**

```yaml
services:
  api: { build: ., ports: ["3000:3000"], env_file: .env, depends_on: [db, redis] }
  worker: { build: ., command: npm run worker, depends_on: [redis] }
  db: { image: postgres:16, environment: { POSTGRES_PASSWORD: dev } }
  redis: { image: redis:7 }
```

**Say it like this:** "Compose gives every developer the whole stack with one command, which makes onboarding and integration tests easy."

---

**Q5. How do you keep container images secure?**

**Short answer:** Minimal base images, pinned versions, non-root users, no secrets in images, image scanning in CI, and regular rebuilds for patches.

**Explanation:** Secrets passed at build time can end up in layers; inject them at runtime.

**Example:** Trivy or ECR scanning fails the pipeline on critical vulnerabilities.

**Say it like this:** "Small, non-root, scanned images with secrets injected at runtime, never baked in."

---

## ☁️ AWS

**Q6. ECS Fargate vs EC2 vs Lambda: when do you use each?**

**Short answer:** Fargate for containerised services without managing servers; EC2 when you need host control (special networking, GPUs, UDP-heavy media); Lambda for event-driven, short tasks.

**Explanation:** LiveKit nodes need host networking and large UDP port ranges, which suits EC2.

**Example:** API on Fargate, LiveKit SFU on EC2, S3-triggered thumbnail generation on Lambda.

**Say it like this:** "Fargate is my default for services; EC2 when I need control over the network like for media servers; Lambda for small event-driven jobs."

---

**Q7. Explain a VPC, subnets and security groups.**

**Short answer:** A VPC is your private network; public subnets have internet access via an internet gateway, private subnets don't; security groups are instance-level firewalls.

**Explanation:** Put databases and app servers in private subnets; only load balancers are public. Private subnets reach the internet through a NAT gateway.

**Example:** RDS security group allows port 5432 only from the API's security group.

**Say it like this:** "Only the load balancer is public. Everything else sits in private subnets, and security groups only allow traffic from the layer above."

---

**Q8. What is IAM, and what is least privilege?**

**Short answer:** IAM controls who (users, roles, services) can do what on which resources; least privilege means granting only the permissions needed.

**Explanation:** Services use roles (temporary credentials), not long-lived access keys.

**Example:** The scoring worker's task role can `s3:GetObject` on `recordings/*` only.

**Say it like this:** "Every service gets its own role with only what it needs, so a compromised worker can't read the whole account."

---

**Q9. How do you store files and serve them securely from S3?**

**Short answer:** Private buckets, access through presigned URLs or CloudFront with signed URLs, encryption at rest, versioning and lifecycle rules.

**Explanation:** Block public access at the account level. Lifecycle rules move old recordings to cheaper storage classes.

**Example:** Call recordings in a private bucket; the API returns a 5-minute presigned URL to authorised reviewers.

**Say it like this:** "Buckets are private, access is a short-lived signed URL issued after a permission check, and old data moves to cheaper storage automatically."

---

**Q10. How do you make an AWS setup highly available?**

**Short answer:** Spread services across at least two availability zones, use Multi-AZ databases, health-checked load balancers, autoscaling, and backups tested by restoring.

**Explanation:** Multi-region is for disaster recovery requirements beyond that.

**Example:** ECS service with tasks in two AZs, RDS Multi-AZ, S3 (multi-AZ by default).

**Say it like this:** "Two AZs for everything stateful and stateless, plus backups we've actually restored."

---

**Q11. How do you control AWS costs?**

**Short answer:** Right-size instances, autoscale, use Savings Plans or Spot for suitable workloads, lifecycle policies on storage, watch data transfer, and tag resources for cost reports.

**Explanation:** Data transfer and NAT gateway charges often surprise teams.

**Example:** Your LiveKit cost model compared managed per-minute pricing with EC2, bandwidth and operations time.

**Say it like this:** "I model cost before building and tag everything, so we can see which feature or tenant drives the bill."

---

**Q12. What is infrastructure as code?**

**Short answer:** Defining infrastructure in version-controlled code (Terraform, CloudFormation, CDK) so it's reviewable, repeatable and reproducible.

**Explanation:** No manual console changes in production; changes go through pull requests and a plan step.

**Example:** `terraform plan` output posted on the pull request for review before `apply`.

**Say it like this:** "Infrastructure changes go through code review like application code, so environments are reproducible and changes are traceable."

---

## 🚀 CI/CD

**Q13. What does a good CI pipeline include?**

**Short answer:** Install with a lockfile, lint, type-check, unit and integration tests, build, security scans, and caching to keep it fast; required to pass before merge.

**Explanation:** Fast feedback (under 10 minutes) keeps developers using it.

**Example:**

```yaml
on: [pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    services: { postgres: { image: postgres:16, env: { POSTGRES_PASSWORD: test }, ports: ["5432:5432"] } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint && npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build
```

**Say it like this:** "Every pull request runs lint, types, tests against a real database and a build, and merging is blocked until it's green."

---

**Q14. What deployment strategies do you know?**

**Short answer:** Rolling (replace instances gradually), blue-green (switch traffic between two environments), and canary (send a small percentage to the new version first).

**Explanation:** All need health checks and automatic rollback triggers on error rate.

**Example:** ECS rolling deploy with minimum healthy 100%, and a CloudWatch alarm that rolls back if 5xx errors spike.

**Say it like this:** "Rolling is the default; canary for risky changes. Either way, health checks and an error-rate alarm decide whether it rolls back automatically."

---

**Q15. How do you run database migrations in a pipeline?**

**Short answer:** Run migrations as a separate step before deploying the new code, with backward-compatible changes so old and new versions both work.

**Explanation:** Never deploy a migration that breaks the currently running version.

**Example:** Pipeline: build image → run `migrate` task → deploy service.

**Say it like this:** "Migrations run first and are always compatible with the running version, so a rollback of code never needs a rollback of the schema."

---

**Q16. How do you manage environments and secrets in CI/CD?**

**Short answer:** Separate environments (dev, staging, prod) with their own secrets in a secret manager, GitHub environments with required approvals for production, and OIDC to assume AWS roles instead of stored keys.

**Explanation:** OIDC federation removes long-lived AWS keys from GitHub.

**Example:** `aws-actions/configure-aws-credentials` with `role-to-assume` and `id-token: write` permission.

**Say it like this:** "CI never stores AWS keys. It assumes a role through OIDC, and production deploys need an approval."

---

## 🐳 More Docker

**Q17. What is the difference between `CMD` and `ENTRYPOINT`?**

**Short answer:** `ENTRYPOINT` sets the executable; `CMD` sets default arguments (or the default command) that can be overridden at runtime.

**Explanation:** Use the exec form (`["node", "main.js"]`) so signals reach your process.

**Example:** `ENTRYPOINT ["node"]` + `CMD ["dist/main.js"]`; run `docker run img dist/worker.js` for the worker.

**Say it like this:** "Exec form matters: with the shell form, SIGTERM doesn't reach Node and graceful shutdown breaks."

---

**Q18. Why does PID 1 matter in containers?**

**Short answer:** The process with PID 1 must handle signals and reap zombie processes; Node and Python don't do that by default.

**Explanation:** Use `--init` or `tini` when the app spawns child processes.

**Example:** `docker run --init api` or `ENTRYPOINT ["/sbin/tini", "--", "node", "main.js"]`.

**Say it like this:** "PID 1 has special duties; tini handles them so signals and child processes behave."

---

**Q19. What is a `.dockerignore` file?**

**Short answer:** It excludes files from the build context, making builds faster and keeping secrets and junk out of images.

**Explanation:** Always exclude `node_modules`, `.git`, `.env` and test output.

**Example:** `node_modules\n.git\n.env*\ncoverage\n`.

**Say it like this:** ".dockerignore keeps builds fast and stops a local .env from ending up inside an image."

---

**Q20. What are Docker volumes and bind mounts?**

**Short answer:** Volumes are Docker-managed persistent storage; bind mounts map a host directory into the container.

**Explanation:** In production, keep containers stateless; data goes to managed services.

**Example:** Bind mount source code for hot reload in development; a volume for local Postgres data.

**Say it like this:** "Mounts are for development and local databases; production containers are stateless."

---

**Q21. How do container health checks work?**

**Short answer:** A command or HTTP check the orchestrator runs periodically; failing checks restart the container or remove it from load balancing.

**Explanation:** Keep liveness checks cheap and independent of dependencies.

**Example:** `HEALTHCHECK CMD wget -qO- http://localhost:3000/healthz || exit 1`.

**Say it like this:** "Health checks let the platform heal itself, but they must check the process, not every dependency."

---

**Q22. How do you reduce Docker image size?**

**Short answer:** Multi-stage builds, slim or distroless base images, production dependencies only, and cleaning package caches in the same layer.

**Explanation:** Smaller images deploy faster and have fewer vulnerabilities.

**Example:** Moving from `node:22` (1 GB) to `node:22-alpine` multi-stage (150 MB).

**Say it like this:** "Small images mean faster deploys and less attack surface."

---

## ☁️ More AWS

**Q23. What are the main S3 storage classes?**

**Short answer:** Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive, trading access cost and speed against storage cost.

**Explanation:** Lifecycle rules move data automatically.

**Example:** Recordings: Standard for 30 days → IA → Glacier after 90 days.

**Say it like this:** "Storage class follows access patterns, and lifecycle rules make it automatic."

---

**Q24. What is CloudFront, and how do you use it with an API?**

**Short answer:** AWS's CDN; it caches static content at the edge and can front APIs for TLS, compression, WAF and caching of public GETs.

**Explanation:** Forward auth headers and disable caching for personalised responses.

**Example:** `/assets/*` cached for a year; `/api/*` passed through with no caching.

**Say it like this:** "CloudFront caches what's public and protects the rest with TLS and WAF at the edge."

---

**Q25. What is RDS vs Aurora?**

**Short answer:** RDS runs standard PostgreSQL or MySQL on managed instances; Aurora is AWS's compatible engine with distributed storage, faster failover and up to 15 replicas.

**Explanation:** Aurora costs more but scales reads and recovers faster.

**Example:** Aurora PostgreSQL for a growing multi-tenant SaaS.

**Say it like this:** "RDS for standard needs, Aurora when we need fast failover and many read replicas."

---

**Q26. What is SQS vs SNS vs EventBridge?**

**Short answer:** SQS is a queue (one consumer per message), SNS is pub/sub fan-out, EventBridge is an event bus with content-based routing and SaaS integrations.

**Explanation:** SNS → multiple SQS queues is a common fan-out pattern.

**Example:** `call.scored` published to SNS, delivered to notification and analytics queues.

**Say it like this:** "SQS for work, SNS for fan-out, EventBridge for routing events by content across services."

---

**Q27. What is AWS Lambda good and bad at?**

**Short answer:** Good for event-driven, spiky, short tasks with no servers to manage; bad for long-running work, steady heavy load, and connection-heavy workloads (database connections, WebSockets).

**Explanation:** Cold starts and 15-minute limits matter; use RDS Proxy for database access.

**Example:** S3 upload → Lambda generates a waveform preview.

**Say it like this:** "Lambda shines for small event-driven tasks; steady or long-running workloads fit containers better."

---

**Q28. How do you give an EC2 or ECS workload access to AWS services?**

**Short answer:** IAM roles (instance profiles or task roles) that provide temporary credentials automatically.

**Explanation:** Never put access keys in environment variables or images.

**Example:** ECS task role allows `secretsmanager:GetSecretValue` for one secret ARN.

**Say it like this:** "Workloads get roles, not keys, so credentials rotate automatically and can't leak from config."

---

**Q29. What is a NAT gateway, and why does it cost money?**

**Short answer:** It lets private subnet resources reach the internet; AWS charges per hour and per GB processed.

**Explanation:** Use VPC endpoints for S3 and other AWS services to avoid NAT data charges.

**Example:** An S3 gateway endpoint cut NAT costs for recording downloads.

**Say it like this:** "NAT data charges add up quietly; VPC endpoints for S3 are an easy saving."

---

**Q30. How do you monitor AWS infrastructure?**

**Short answer:** CloudWatch metrics, logs and alarms, plus Prometheus/Grafana for app metrics, CloudTrail for API audit, and cost alerts.

**Explanation:** Alarm on user-facing symptoms and resource saturation.

**Example:** Alarm on ALB 5xx rate, RDS CPU and free storage, and queue age.

**Say it like this:** "CloudWatch covers the infrastructure, CloudTrail covers who changed what, and app metrics go to Grafana."

---

**Q31. What is AWS WAF?**

**Short answer:** A web application firewall on CloudFront, ALB or API Gateway that blocks common attacks, bad bots and abusive IPs, with rate-based rules.

**Explanation:** Managed rule sets cover OWASP basics.

**Example:** Rate-based rule on `/auth/login` at 100 requests per 5 minutes per IP.

**Say it like this:** "WAF stops obvious attacks at the edge before they reach the application."

---

## 🚀 More CI/CD

**Q32. What is trunk-based development?**

**Short answer:** Everyone merges small changes to the main branch frequently, using feature flags for unfinished work.

**Explanation:** Reduces merge conflicts and enables continuous delivery.

**Example:** Pull requests open for less than a day, merged behind a flag.

**Say it like this:** "Small, frequent merges behind flags keep main always releasable."

---

**Q33. How do you build once and deploy to many environments?**

**Short answer:** Build one immutable image per commit, tag it with the commit SHA, and promote the same image from staging to production with different config.

**Explanation:** Rebuilding per environment risks differences.

**Example:** `api:3f2a1c9` deployed to staging, then the same tag to production after approval.

**Say it like this:** "What we tested in staging is exactly what runs in production: same image, different config."

---

**Q34. What are preview environments?**

**Short answer:** Temporary environments created per pull request for testing and review, destroyed on merge.

**Explanation:** Useful for frontend and API changes reviewed by product teams.

**Example:** Each PR gets `pr-123.preview.example.com` with a seeded database.

**Say it like this:** "Preview environments let reviewers try a change before it merges."

---

**Q35. How do you secure the CI/CD pipeline itself?**

**Short answer:** Least-privilege tokens, OIDC to cloud, pinned action versions (by SHA), protected branches, required reviews, and secrets scoped to environments.

**Explanation:** The pipeline can deploy to production, so it's a high-value target.

**Example:** `uses: actions/checkout@<full-sha>` instead of a floating tag.

**Say it like this:** "The pipeline has production power, so it gets the same least-privilege treatment as production."

---

## 🧩 More Scenarios

**Q36. A container keeps restarting in production. How do you debug it?**

**Short answer:** Check exit codes and logs, health check failures, OOM kills, missing config or secrets, and recent changes.

**Explanation:** Exit code 137 usually means OOM-killed.

**Example:** A new env variable name wasn't set in production, so startup validation failed.

**Say it like this:** "Exit code and the last log lines usually explain it: OOM, failed config validation, or a failing health check."

---

**Q37. The AWS bill jumped 40% this month. How do you investigate?**

**Short answer:** Cost Explorer by service and tag, look for new resources, data transfer and NAT charges, oversized instances and unattached volumes.

**Explanation:** Tagging by team and feature makes this fast.

**Example:** A debug log level sent gigabytes to CloudWatch Logs.

**Say it like this:** "Cost Explorer by tag finds the culprit quickly; it's often logs, data transfer or something left running."

---

**Q38. A deployment succeeded, but users still get the old frontend. Why?**

**Short answer:** CDN or browser caching of `index.html`, or the service worker serving cached assets.

**Explanation:** Cache hashed assets forever but `index.html` with `no-cache`; invalidate the CDN on deploy.

**Example:** `aws cloudfront create-invalidation --paths /index.html`.

**Say it like this:** "Hashed assets can be cached forever, but the entry HTML must always be revalidated."

---

## 🧩 Scenario-Based

**Q39. A deploy caused errors in production. What do you do?**

**Short answer:** Roll back first (previous image or task definition), confirm recovery, then investigate with logs and metrics, and add a test or check that would have caught it.

**Explanation:** Rollback must be one command or one click.

**Example:** Revert the ECS service to the previous task definition revision; error rate returns to normal in 2 minutes.

**Say it like this:** "Mitigate first: roll back. Then find the root cause and close the gap in the pipeline so it can't ship again."

---

**Q40. Builds take 25 minutes. How do you speed them up?**

**Short answer:** Cache dependencies and Docker layers, run jobs in parallel, run only affected tests in monorepos, and use bigger runners for heavy steps.

**Explanation:** Measure each step first.

**Example:** Docker layer cache in GitHub Actions (`cache-from: type=gha`) cut image builds from 8 minutes to 1.

**Say it like this:** "I time each step, then cache and parallelise the slowest ones. Usually it's dependency installs and Docker layers."

---

## 🎯 From Your Resume

**Q41. "Walk me through the AWS infrastructure you designed for self-hosted LiveKit."**

**Short answer:** Dockerised LiveKit on EC2 across AZs with host networking, Redis (ElastiCache) for routing, an ALB for WSS signalling, TURN on 443, autoscaling on CPU and participants, CloudFront for static assets, Prometheus and Grafana for monitoring, and CI/CD that builds images and does draining deploys.

**Explanation:** Be clear about what was implemented versus designed, and present the 40% and 10x as projections.

**Example:** "Images built in GitHub Actions, pushed to ECR, rolled out node by node with draining."

**Say it like this:** "I designed it so media nodes scale horizontally behind Redis routing, deploys drain rooms instead of dropping calls, and everything is observable in Grafana. The 40% cost cut and 10x capacity are projections from a cost model, which we planned to validate with load tests."

---

**Q42. "What shell scripts have you written?"**

**Short answer:** Describe real ones: deploy helpers, database backup and restore, log extraction, environment setup. [Use your real examples.]

**Explanation:** Mention `set -euo pipefail` and idempotency.

**Example:**

```bash
#!/usr/bin/env bash
set -euo pipefail
pg_dump "$DATABASE_URL" | gzip > "backup-$(date +%F).sql.gz"
aws s3 cp "backup-$(date +%F).sql.gz" "s3://$BACKUP_BUCKET/db/"
```

**Say it like this:** "I write small scripts for repetitive ops work, like backups and deploy helpers, always with strict mode so a failed step stops the script instead of continuing silently."
