variable "github_owner" {
  description = "GitHub user or org that owns the repository."
  type        = string
  default     = "Muthukumar2510"
}

variable "github_repo" {
  description = "Repository name."
  type        = string
  default     = "Portfolio"
}

variable "project_name" {
  description = "Vercel project name."
  type        = string
  default     = "portfolio"
}

variable "site_url" {
  description = "Public URL the monitor should check (no trailing slash)."
  type        = string
  default     = "https://portfolio-ntci.vercel.app"
}

variable "custom_domain" {
  description = "Optional custom domain, e.g. muthukumar.dev. Empty = none."
  type        = string
  default     = ""
}

variable "redis_primary_region" {
  description = "Upstash primary region (closest to most visitors)."
  type        = string
  default     = "ap-south-1"
}

variable "upstash_email" {
  description = "Upstash account email (set TF_VAR_upstash_email)."
  type        = string
  sensitive   = true
}

variable "upstash_api_key" {
  description = "Upstash management API key (set TF_VAR_upstash_api_key)."
  type        = string
  sensitive   = true
}
