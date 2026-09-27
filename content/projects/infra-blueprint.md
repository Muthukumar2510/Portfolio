---
title: Infra Blueprint
summary: Terraform modules for a multi-account AWS landing zone, with guardrails built in.
status: live
featured: true
date: 2025-03-01
role: Lead engineer
duration: 4 months
stack: [Terraform, AWS Organizations, GitHub Actions, OPA]
repo: https://github.com/muthukumar2510
live: ""
album: ""
# Optional clickable diagram. col/row place each box on a grid; links draw arrows.
architecture:
  nodes:
    - { id: dev, label: Engineer, sub: pull request, col: 0, row: 0, note: "Placeholder. Teams request a new account by opening a pull request with a few lines of config." }
    - { id: ci, label: GitHub Actions, sub: plan + policy, col: 1, row: 0, note: "Placeholder. CI runs terraform plan and OPA policy checks; nothing merges without passing both." }
    - { id: tf, label: Terraform, sub: modules, col: 2, row: 0, note: "Placeholder. Versioned modules create the account, networking, and baseline guardrails." }
    - { id: org, label: AWS Organizations, sub: OUs + SCPs, col: 2, row: 1, note: "Placeholder. Service control policies block risky actions at the organisation level." }
    - { id: acct, label: New account, sub: ready in 20 min, col: 1, row: 1, note: "Placeholder. The team gets a working account with logging, SSO and budgets already set up." }
  links:
    - [dev, ci]
    - [ci, tf]
    - [tf, org]
    - [org, acct]
metrics:
  - label: New account setup
    value: 2 days → 20 min
  - label: Teams onboarded
    value: "6"
  - label: Policy violations in prod
    value: "0"
---

## The problem

Placeholder. Describe the situation before this project. Who was affected, what was slow or risky, and why it mattered to the business.

## What I built

Placeholder. Explain the solution in plain words first, then the key technical decisions. Mention what you chose *not* to do and why.

## Architecture

Placeholder. Walk through the main components. A diagram screenshot in this project's media folder will appear in the gallery below.

## Results

Placeholder. Concrete outcomes: time saved, cost reduced, incidents avoided. The numbers in `metrics` at the top of this file show as cards.

## What I learned

Placeholder. One or two honest lessons: what you'd do differently next time.
