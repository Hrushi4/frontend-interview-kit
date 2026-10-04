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

## 🧩 Scenario-Based

**Q17. A deploy caused errors in production. What do you do?**

**Short answer:** Roll back first (previous image or task definition), confirm recovery, then investigate with logs and metrics, and add a test or check that would have caught it.

**Explanation:** Rollback must be one command or one click.

**Example:** Revert the ECS service to the previous task definition revision; error rate returns to normal in 2 minutes.

**Say it like this:** "Mitigate first: roll back. Then find the root cause and close the gap in the pipeline so it can't ship again."

---

**Q18. Builds take 25 minutes. How do you speed them up?**

**Short answer:** Cache dependencies and Docker layers, run jobs in parallel, run only affected tests in monorepos, and use bigger runners for heavy steps.

**Explanation:** Measure each step first.

**Example:** Docker layer cache in GitHub Actions (`cache-from: type=gha`) cut image builds from 8 minutes to 1.

**Say it like this:** "I time each step, then cache and parallelise the slowest ones. Usually it's dependency installs and Docker layers."

---

## 🎯 From Your Resume

**Q19. "Walk me through the AWS infrastructure you designed for self-hosted LiveKit."**

**Short answer:** Dockerised LiveKit on EC2 across AZs with host networking, Redis (ElastiCache) for routing, an ALB for WSS signalling, TURN on 443, autoscaling on CPU and participants, CloudFront for static assets, Prometheus and Grafana for monitoring, and CI/CD that builds images and does draining deploys.

**Explanation:** Be clear about what was implemented versus designed, and present the 40% and 10x as projections.

**Example:** "Images built in GitHub Actions, pushed to ECR, rolled out node by node with draining."

**Say it like this:** "I designed it so media nodes scale horizontally behind Redis routing, deploys drain rooms instead of dropping calls, and everything is observable in Grafana. The 40% cost cut and 10x capacity are projections from a cost model, which we planned to validate with load tests."

---

**Q20. "What shell scripts have you written?"**

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
