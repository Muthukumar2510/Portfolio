# Everything this site runs on, as code. The /infra page draws this file.

# Serverless Redis: visitor counts, who's online, uptime checks, quality scores.
resource "upstash_redis_database" "portfolio" {
  database_name  = "portfolio"
  region         = "global"
  primary_region = var.redis_primary_region
  tls            = true
}

# The Next.js app, built and deployed from the GitHub repo on every push.
resource "vercel_project" "portfolio" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "${var.github_owner}/${var.github_repo}"
  }
}

# Redis REST credentials for the site's API routes.
resource "vercel_project_environment_variable" "redis_url" {
  project_id = vercel_project.portfolio.id
  key        = "UPSTASH_REDIS_REST_URL"
  value      = "https://${upstash_redis_database.portfolio.endpoint}"
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "redis_token" {
  project_id = vercel_project.portfolio.id
  key        = "UPSTASH_REDIS_REST_TOKEN"
  value      = upstash_redis_database.portfolio.rest_token
  target     = ["production", "preview"]
  sensitive  = true
}

# Optional custom domain.
resource "vercel_project_domain" "custom" {
  count      = var.custom_domain == "" ? 0 : 1
  project_id = vercel_project.portfolio.id
  domain     = var.custom_domain
}

# The same Redis credentials for the Monitor and Quality workflows.
resource "github_actions_secret" "redis_url" {
  repository      = var.github_repo
  secret_name     = "UPSTASH_REDIS_REST_URL"
  plaintext_value = "https://${upstash_redis_database.portfolio.endpoint}"
}

resource "github_actions_secret" "redis_token" {
  repository      = var.github_repo
  secret_name     = "UPSTASH_REDIS_REST_TOKEN"
  plaintext_value = upstash_redis_database.portfolio.rest_token
}

# Where the synthetic monitor points.
resource "github_actions_variable" "site_url" {
  repository    = var.github_repo
  variable_name = "SITE_URL"
  value         = var.custom_domain == "" ? var.site_url : "https://${var.custom_domain}"
}
