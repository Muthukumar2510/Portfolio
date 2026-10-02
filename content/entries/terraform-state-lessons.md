---
title: Three Terraform state mistakes I made so you don't have to
type: note
summary: Locking, drift, and the day a stray terraform destroy almost ruined a Friday.
date: 2025-10-02
---

Placeholder. Blog posts are plain Markdown: headings, lists, links, and code blocks all work.

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tf-state"
    dynamodb_table = "tf-locks"
  }
}
```
