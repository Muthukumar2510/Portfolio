---
title: Design decisions
---

One entry per design decision: what changed, why, and what I learned. Newest first.

## 2026-10-02 · Diagrams as code

Every drawing now starts as data in `content/diagrams.js` and is drawn by one engine (`lib/diagram.js`).
The same description renders the entry figure, the faint watermark behind a section and, later, share images.
**Learned:** a small visual language (box, store, cloud, user, one lit path, handwritten notes) is enough for most
systems, and consistency comes for free when nothing is drawn by hand.

## 2026-10-02 · Calm is fast

Scrolling the home page kept a phone's main thread 89% busy. Switching parts off one at a time found the cause:
endless animations that kept running off screen (the infrastructure map) and a looping highlight on the drawings.
Pausing the first off screen and removing the second brought it to 20%.
**Learned:** measure before guessing. The frosted header I suspected first was not the problem.

## 2026-10-02 · One grid, one ink

The page had a grid on the paper and another grid inside every card, plus a blue-violet-teal gradient on drawings.
Now the paper is the only grid and drawings use a single ink colour, with `--signal` reserved for what matters.
**Learned:** texture works once. Repeated, it turns into noise.

## 2026-10-02 · A notebook, not a résumé

The site moves from a hiring page to a lab notebook: builds, teardowns and UI sketches, with a quiet colophon
for who I am. The craft should show in the details rather than in a list of claims.
