# 12 — Real-Time Backends: WebSocket, SSE and WebRTC Infrastructure

Your resume combines real-time video on LiveKit (150 concurrent sessions, 99% reconnect success, under 5 s join), an SSE compliance chat, and a self-hosted LiveKit design on AWS. Backend interviews will ask how real-time servers scale and stay reliable.

**How this file is organised**

- **Part A — Understand the topic:** polling, SSE, WebSocket and WebRTC, how real-time servers scale, and how an SFU like LiveKit works, explained simply.
- **Part B — Interview questions and answers:** Basics → Intermediate → Advanced → Scenario → From Your Resume.

Each answer has a **Short answer** (say this first), an **Explanation**, an **Example**, and a **Say it like this** sample answer.

---

## Part A — Understand the Topic

### Ways to push data to clients

| Technique | Direction | Notes |
|---|---|---|
| Short polling | client asks every N seconds | simple, wasteful |
| Long polling | client asks, server holds until data | works everywhere |
| **SSE** | server → client | one-way stream over HTTP, auto-reconnect |
| **WebSocket** | both ways | persistent connection, custom protocol |
| **WebRTC** | peer-to-peer or via SFU | audio and video, low latency, UDP |

### Why real-time servers are different

A normal API request lasts milliseconds. A real-time connection lasts **minutes or hours**, so:

- each server holds thousands of open connections (memory, file descriptors);
- a message for user A may arrive at server 1 while A is connected to server 2, so you need a **pub/sub backplane** (Redis, NATS);
- load balancers must support long-lived connections (and sticky sessions for some protocols);
- deploys must drain connections gracefully, and clients must reconnect.

### WebRTC and SFUs

In a group video call, sending every stream to every participant directly doesn't scale. An **SFU** (Selective Forwarding Unit) like LiveKit receives each participant's media once and forwards it to the others, choosing quality per receiver (simulcast). The signalling (who's in the room, tracks) happens over WebSocket; media flows over UDP, or over **TURN** relays when networks block UDP.

```text
Patient ─┐                  ┌─▶ Provider
Provider ─┼─▶  LiveKit SFU ─┼─▶ Interpreter
Interpreter ┘ (forwards)    └─▶ Patient
```

### Why interviewers ask about it

Real-time features are where scaling and reliability get hard. They want to know you can choose the right transport, scale connections across servers, and handle disconnects gracefully.

---

## Part B — Interview Questions and Answers

## 🟢 Level 1 — Basics

**Q1. SSE vs WebSocket: how do you choose?**

**Short answer:** SSE for one-way server-to-client streams over plain HTTP (with automatic reconnect); WebSocket for two-way, low-latency messaging.

**Explanation:** SSE works through most proxies and HTTP/2 multiplexes many streams. `EventSource` can't set custom headers, so use cookies or `fetch` streaming.

**Example:** The compliance chat streams LLM tokens with SSE; a collaborative editor uses WebSocket.

**Say it like this:** "If only the server talks, SSE is simpler. If both sides send frequently, WebSocket."

---

**Q2. How does SSE work on the server?**

**Short answer:** Respond with `Content-Type: text/event-stream`, keep the connection open, and write `data: ...\n\n` frames; send heartbeats to keep proxies from closing it.

**Explanation:** Include `id:` so a reconnecting client sends `Last-Event-ID` and can resume.

**Example:**

```python
async def stream(request):
    async def gen():
        async for token in llm.stream(prompt):
            if await request.is_disconnected(): break
            yield f"data: {json.dumps({'t': token})}\n\n"
        yield "event: done\ndata: {}\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
```

**Say it like this:** "SSE is a long HTTP response of small events. I stop generating when the client disconnects so we don't pay for tokens nobody reads."

---

**Q3. What is a WebSocket handshake?**

**Short answer:** An HTTP request with `Upgrade: websocket` that the server accepts with 101 Switching Protocols; after that, both sides exchange frames over the same TCP connection.

**Explanation:** Authenticate during the handshake (cookie or short-lived token), and check the `Origin` header.

**Example:** `wss://api.example.com/ws?ticket=abc` where the ticket is a one-time token from an authenticated API call.

**Say it like this:** "The connection starts as HTTP and upgrades. I authenticate at that point and reject unknown origins."

---

**Q4. What are STUN and TURN?**

**Short answer:** STUN tells a client its public address for NAT traversal; TURN relays media when direct or UDP connections are blocked.

**Explanation:** Hospital and corporate networks often block UDP, so TURN over TLS on port 443 is essential.

**Example:** InterpretIQ clients on restrictive hospital Wi-Fi connected via TURN/TLS on 443.

**Say it like this:** "STUN helps peers find each other; TURN carries the media when the network won't allow anything else, which is common in hospitals."

---

## 🟡 Level 2 — Intermediate

**Q5. How do you scale WebSocket servers horizontally?**

**Short answer:** Run many instances behind a load balancer and use a pub/sub backplane (Redis, NATS) so a message published on one instance reaches clients on all instances.

**Explanation:** Keep connection state minimal per instance; store presence in Redis with TTLs.

**Example:** Server 1 receives "call scored" and publishes to `tenant:1`; servers 2 and 3 forward it to their connected tenant-1 clients.

**Say it like this:** "Each server only knows its own connections, so a shared pub/sub layer fans messages out to whichever server holds the user."

---

**Q6. How do you handle authentication and authorisation on long-lived connections?**

**Short answer:** Authenticate at connect, re-check or close when tokens expire or permissions change, and authorise every subscription (room or channel) server-side.

**Explanation:** A connection opened before a user was removed must not keep receiving data.

**Example:** On role revocation, publish `user:42:revoke`; servers close that user's sockets.

**Say it like this:** "Authenticating once isn't enough for hours-long connections. Subscriptions are authorised and connections are closed when access changes."

---

**Q7. How do clients and servers handle reconnection?**

**Short answer:** Clients reconnect with exponential backoff and jitter, resume from the last event ID or resync state; servers support resume and send heartbeats to detect dead connections.

**Explanation:** Avoid a thundering herd when a server restarts and thousands of clients reconnect at once.

**Example:** SSE `Last-Event-ID` resumes the stream from the missed event.

**Say it like this:** "Reconnects are normal, so clients back off with jitter and resume where they left off, and the server can replay what was missed."

---

**Q8. How do you deploy real-time servers without dropping users?**

**Short answer:** Drain: stop sending new connections to the old instance, tell clients to reconnect elsewhere (or let them finish), then shut it down after a timeout.

**Explanation:** For video SFUs, wait for active rooms to end or migrate them before terminating.

**Example:** LiveKit nodes are marked draining in the load balancer and terminated only when their rooms are empty or a max drain time passes.

**Say it like this:** "Real-time deploys are about draining: no new sessions on the old node, and it only shuts down when its sessions are done."

---

**Q9. What load balancer settings matter for real-time traffic?**

**Short answer:** Support for WebSocket upgrades, long idle timeouts, sticky sessions if needed, health checks, and for WebRTC, UDP and TLS passthrough or direct node access.

**Explanation:** AWS ALB supports WebSocket; NLB is used for UDP or TCP passthrough.

**Example:** ALB for LiveKit signalling (WSS); media on the nodes' public UDP ports, plus TURN/TLS on 443.

**Say it like this:** "Signalling goes through a normal HTTPS load balancer; media needs direct UDP to the nodes or TURN, which a typical HTTP load balancer can't carry."

---

## 🔴 Level 3 — Advanced

**Q10. How does an SFU like LiveKit scale to many rooms?**

**Short answer:** Each room is hosted on one node, Redis tracks which node hosts each room, and new rooms are placed on the least-loaded node; large rooms can span nodes.

**Explanation:** Capacity depends on bandwidth and CPU per stream; simulcast and dynacast reduce load by sending only layers that someone is watching.

**Example:** A three-way interpretation call uses little capacity; a 50-person webinar needs careful layer selection.

**Say it like this:** "Rooms are distributed across nodes through Redis routing, and simulcast means the server only forwards the quality each viewer actually needs."

---

**Q11. How do you measure real-time reliability?**

**Short answer:** Track connect success rate, time to connect (join latency), reconnect success, packet loss, jitter, and server CPU and bandwidth per node.

**Explanation:** Collect client-side metrics too; server metrics alone miss network problems.

**Example:** Join latency = Join click to first remote video frame; reconnect success = reconnected within N seconds ÷ all reconnect attempts.

**Say it like this:** "I measure what users feel: how fast they join and how often a dropped connection recovers on its own, plus server load per node."

---

**Q12. How do you prevent one tenant or user from overwhelming a real-time server?**

**Short answer:** Limit connections per user, messages per second per connection, message size, and subscriptions per connection; disconnect abusers.

**Explanation:** Backpressure: if a slow client can't keep up, drop or close instead of buffering forever.

**Example:** Max 5 connections per user and 20 messages per second; slow consumers are disconnected after their buffer exceeds 1 MB.

**Say it like this:** "Every real-time server needs per-connection limits and must drop slow consumers, or one bad client exhausts memory for everyone."

---

## 🧩 Level 4 — Scenario-Based

**Q13. Users on hospital Wi-Fi can't join calls but everyone else can. What's wrong?**

**Short answer:** UDP or non-standard ports are blocked, so media can't flow; TURN over TLS on port 443 is missing or misconfigured.

**Explanation:** Check ICE candidate types in client logs; if only relay candidates could work, TURN is required.

**Example:** Adding TURN/TLS on 443 with a valid certificate fixed the joins.

**Say it like this:** "When only restrictive networks fail, it's almost always UDP being blocked, and TURN over 443 is the fix."

---

**Q14. After a deploy, thousands of clients reconnect at once and overload the server. How do you prevent it?**

**Short answer:** Client backoff with jitter, gradual draining of old instances, connection rate limits, and scaling up before deploying.

**Explanation:** This is a thundering herd problem.

**Example:** Spread reconnects over 30 seconds with random jitter.

**Say it like this:** "Jitter and gradual draining turn a reconnect stampede into a steady trickle."

---

## 🎯 From Your Resume

**Q15. "How did your SSE compliance chat work on the backend?"**

**Short answer:** The backend authenticated the user, retrieved tenant- and role-filtered call data in the query, built the prompt, and streamed LLM tokens as SSE events, stopping when the client disconnected.

**Explanation:** Mention heartbeats, timeouts, logging without PHI, and why SSE over WebSocket.

**Example:** `event: token` frames, a final `event: done` with citations.

**Say it like this:** "The answer streamed token by token over SSE. Retrieval was filtered by tenant in the query, and the server stopped generating if the user closed the chat, which also saved cost."

---

**Q16. "Explain your self-hosted LiveKit design on AWS."**

**Short answer:** SFU nodes on EC2 with host networking and a UDP port range, Redis for room routing, a load balancer for WSS signalling, TURN/TLS on 443, autoscaling on CPU and participants, Prometheus and Grafana, and Docker images deployed through CI/CD with draining.

**Explanation:** Present cost savings (40%) and capacity (10x) as projections with their assumptions.

**Example:**

```text
Clients ─WSS─▶ ALB ─▶ LiveKit nodes (EC2, UDP 50000–60000) ◀─▶ Redis
        └─TURN/TLS :443 ─▶ TURN servers
Prometheus ◀─ metrics ─ nodes → Grafana dashboards + alerts
```

**Say it like this:** "Nodes on EC2 with direct UDP for media, Redis to route rooms, WSS signalling behind a load balancer, TURN on 443 for hospital networks, and autoscaling with draining. The 40% saving and 10x capacity are projections from a cost model that we planned to validate with load tests."

---

**Q17. "How did you get 99% reconnect success?"**

**Short answer:** Mostly client-side resume-first logic, supported by the server side: TURN over TLS, stable node routing, short reconnect windows, and fresh tokens on full rejoin.

**Explanation:** Explain the metric definition and how it was measured.

**Example:** ICE restart first, full rejoin with backoff second; tokens issued with enough TTL to cover reconnects.

**Say it like this:** "Reconnection works in layers: try to resume the same session, then rejoin with a fresh token. The infrastructure side, mainly TURN on 443, is what made it work on hospital networks."
