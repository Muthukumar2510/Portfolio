---
type: teardown
title: What happens when you open this page
summary: One request, followed from your browser to the edge, into a serverless function and out to Redis, with the real numbers measured while you read.
date: 2026-10-02
diagram: request
embed: trace
stack: [DNS, Vercel Edge, Serverless functions, Upstash Redis]
---

Every page on this site is static HTML, built ahead of time and copied to Vercel's edge network. When you
open one, three things happen before anything is drawn:

1. **DNS.** Your browser asks for the address behind the domain. The answer points at Vercel's network,
   which routes you to a nearby point of presence (PoP).
2. **The edge.** The PoP already holds a copy of the page, so it answers straight away. For static pages,
   that is the whole trip: no server runs, nothing is computed.
3. **The page wakes up.** Once loaded, the page calls `/api/trace`. That one request does go further.

## The traced request

`/api/trace` is a serverless function. It reads the `x-vercel-id` header the edge adds to every request.
Its first segment names the PoP that received you, and the function's own region tells which data centre
it ran in. It then pings Redis (Upstash, over HTTPS) and times the round trip.

The live diagram below is drawn from that response: your edge, the function's region, the Redis time and
how long the function took overall.

## What I learned building it

- The edge and the function are often in different places. Static pages are served near you; the
  function runs in one region. That gap is visible in the numbers.
- Headers are free telemetry. Most of this teardown is just reading what the platform already tells you.
- Fail soft: when Redis isn't configured, the endpoint returns `null` and the page says so instead of
  inventing a number.
