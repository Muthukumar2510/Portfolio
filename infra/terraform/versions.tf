terraform {
  required_version = ">= 1.6"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.0"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.5"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

# Credentials come from the environment, never from files:
#   VERCEL_API_TOKEN, UPSTASH_EMAIL, UPSTASH_API_KEY, GITHUB_TOKEN
provider "vercel" {}

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}

provider "github" {
  owner = var.github_owner
}
