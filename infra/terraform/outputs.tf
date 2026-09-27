output "vercel_project_id" {
  value = vercel_project.portfolio.id
}

output "redis_endpoint" {
  value = upstash_redis_database.portfolio.endpoint
}

output "monitored_url" {
  value = github_actions_variable.site_url.value
}
