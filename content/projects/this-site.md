---
title: This website
summary: A portfolio that runs like production. Live request tracing, synthetic monitoring, CI quality gates, and a photo pipeline, on a $0/month serverless stack.
status: live
date: 2026-09-27
role: Design, build, operate
duration: Ongoing
stack: [Next.js, Vercel, Upstash Redis, GitHub Actions, Lighthouse]
github: Muthukumar2510/Portfolio
repo: https://github.com/Muthukumar2510/Portfolio
live: ""
album: ""
architecture:
  nodes:
    - { id: git, label: GitHub, sub: content + code, col: 0, row: 0, note: "Every change, including a new blog post or photo, is a commit. Pull requests are the only way in." }
    - { id: ci, label: GitHub Actions, sub: CI + quality gates, col: 1, row: 0, note: "Builds the site, checks design tokens, strips photo metadata, and runs Lighthouse and a link checker. Scores below the budget block the merge." }
    - { id: vercel, label: Vercel, sub: build + edge, col: 2, row: 0, note: "Merges to main deploy automatically. Static pages are served from the edge; API routes run as serverless functions." }
    - { id: redis, label: Upstash Redis, sub: serverless, col: 2, row: 1, note: "Stores visitor counts, who's online (sorted sets with expiry), uptime checks (capped list) and the latest quality scores." }
    - { id: mon, label: Monitor cron, sub: every 15 min, col: 1, row: 1, note: "A scheduled workflow checks the live site from outside and records the result. A failure fails the job, and that's the alert." }
    - { id: you, label: Visitor, sub: your browser, col: 3, row: 0, note: "You. The home page traces your request through this exact path and measures it." }
  links:
    - [git, ci]
    - [ci, vercel]
    - [vercel, you]
    - [vercel, redis]
    - [mon, vercel]
    - [mon, redis]
metrics:
  - label: Hosting cost
    value: $0 / month
  - label: Uptime checks per day
    value: "96"
  - label: Quality gates per PR
    value: "5"
---

## Why

A portfolio usually *describes* skills. I wanted this one to *demonstrate* them: the site itself is the proof. It's built, deployed, monitored and costed the same way I'd run a production service.

## What's running

- **Live request trace.** The home page calls `/api/trace`, which reads Vercel's routing headers to show which edge location served you and how long each hop took.
- **Synthetic monitoring.** A GitHub Actions cron job checks the site every 15 minutes and writes results to a capped Redis list. The [status page](/status) computes uptime windows, p50/p95 latency and incidents from it.
- **Quality gates.** Every pull request runs a design-token lint, a photo metadata check, a production build, Lighthouse with a score budget, and a crawler that fails on broken internal links. The latest scores are published to the site.
- **Photo pipeline.** Pushed photos are automatically stripped of GPS and camera metadata, resized, and given blurred placeholders.
- **Security.** A strict Content-Security-Policy (hash-based, no inline scripts), HSTS, and locked-down permissions.

## Decisions

- **Serverless over a VM.** Traffic is spiky and tiny, so scale-to-zero means no idle cost.
- **Redis over a database.** Every stored value is a counter, a sorted set or a capped list. Upstash's HTTP API needs no connection pooling from serverless functions.
- **GitHub Actions for monitoring.** An outside-in check from a different provider than the host is more honest than a site checking itself.
- **Content as files.** Markdown and a manifest in the repo mean every change is reviewed, versioned and reversible.
