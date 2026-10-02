# Portfolio: Muthukumar Natarajan

A personal site for a cloud engineer that shows instead of tells. The home page opens with a live map of the visitor's own request travelling through this site's infrastructure (edge, function, Redis, deploy pipeline), measured in real time. Below it: projects with architecture diagrams, experience, certifications, a big-photo Moments section for events, writing, and the site's own commit history. A hidden terminal drops down when you press the backtick key (`).

**Adding your own words and photos? Start with [CONTENT.md](CONTENT.md).**

## Where everything lives

All text is in `content/`, and all photos are in `public/media/`. You never need to edit layout code to change what the site says.

| What | Where |
| --- | --- |
| Name, bio, email, socials, resume/booking links | `content/profile.js` |
| Skills (status board) | `content/skills.js` |
| Work history | `content/experience.js` |
| Certifications | `content/certifications.js` (badges in `public/media/certs/`) |
| A notebook entry: build, teardown, sketch or note (one file each) | `content/entries/<name>.md` |
| Photos for an entry | `public/media/entries/<name>/` |
| Diagrams (drawn from data) | `content/diagrams.js` |
| Handwritten notes | `content/notes.js` |
| Resume | `public/resume.pdf` |
| Design tokens (colours, spacing, type) | `styles/tokens.css` |

### Add an entry
1. Copy a file in `content/entries/` to `content/entries/my-entry.md` and set `type` (`build`, `teardown`, `sketch` or `note`). The top section sets title, summary and the type's fields; the rest is the write-up in Markdown. See `CONTENT.md` for every field.
2. Optional: create `public/media/entries/my-entry/` and drop in images (`cover.jpg` becomes the cover; events get a photo collage). Run `npm run media`.

The entry appears in the Lab (`/lab`, filterable by type), on the home page if it's among the newest, in the terminal (`lab`), in Ctrl/⌘+K search and in the RSS feed automatically.

**Google Photos:** paste a share link into `album:` to add a "View the full album" button.

### Architecture diagrams
Add an `architecture:` block to a build's front matter (see `content/entries/infra-blueprint.md`) to get a clickable diagram on its page.

Photos are resized, compressed and lazy-loaded automatically. Any size or orientation works, and they're shown in order of filename (`01.jpg`, `02.jpg`, …).

## Brand logos

Logos for socials and the tech stack live in `public/brands/` and are listed in `content/brands.js`.

- **Add one:** add its [simple-icons](https://simpleicons.org) slug to `content/brands.js`, then run `npm run brands`. The SVG file and `public/brands/manifest.json` are generated for you.
- **Use your own SVG:** set `source: 'local'` and drop `<slug>.svg` into `public/brands/`. This is how LinkedIn works.
- **Logos simple-icons doesn't carry** (AWS, Azure, OPA) show no logo, just their name, until you drop the official SVG into `public/brands/` and set `source: 'local'`. We never draw our own.

## Your photo and certification badges

- **Portrait:** put one photo in `public/media/profile/`, run `npm run media`. It appears in the hero. No photo = no portrait.
- **Badges:** on Credly open each badge → Share → Download image, save as `public/media/certs/<id>.png` (the `id` in `content/certifications.js`), run `npm run media`.

Logos are drawn with a CSS mask, so they follow the text colour and switch to the brand colour on hover. `npm run check` fails if the folder drifts from the list.

## Photos: automatic privacy and optimisation
Phone photos contain GPS location data. Every photo is cleaned automatically:
- Push photos to `public/media/…` and the **Media** GitHub workflow strips all metadata (GPS, camera, timestamps), fixes rotation, caps the size at 2400px, generates blurred loading previews, and commits the result.
- Or run `npm run media` locally before committing. CI (`npm run media:check`) refuses photos that still carry metadata.

## Drafts
Add `draft: true` to a post or project's front matter. It shows in `npm run dev` but not on the live site.

## Status page and monitoring
`/status` shows real uptime (24h/7d/30d/90d), response times, a 90-day uptime bar and incidents. A GitHub Actions job checks the site every 15 minutes. To turn it on, open the repo's **Settings → Secrets and variables → Actions**:
- **Variables:** `SITE_URL` = your live URL, e.g. `https://portfolio-ntci.vercel.app`
- **Secrets:** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (the same values Vercel shows for your Upstash database)

If the site goes down, the workflow fails and GitHub emails you. Until monitoring runs, the status bar honestly says "monitoring not connected".

## Quality gates
The **Quality** workflow builds the site in production mode and fails the pull request if any of these fail:
- Lighthouse budget (median of 3 runs per page; worst of home, an entry page and /lab): performance ≥ 85, accessibility ≥ 95, best practices ≥ 95, SEO ≥ 95
- All six security headers present, and no `'unsafe-inline'` scripts
- Zero broken internal links (crawled from the sitemap)

On `main`, the result is published to Redis and shown in the home page's **How this site runs** section. Run it locally with `npm run build && npx next start` then `BASE=http://localhost:3000 node scripts/quality.mjs`.

## Live project stats
Add `github: owner/repo` to a project's front matter to show its CI status, last push, stars and languages (fetched at build time, refreshed hourly).

## Running costs
`content/costs.js` lists each service, plan and free-tier limit. The Redis usage bar is estimated from real visitor numbers.

## Daily refresh
The **Refresh** workflow rebuilds the site every day so GitHub stats stay current. Create a Deploy Hook in Vercel (Settings → Git → Deploy Hooks) and save it as the repo secret `VERCEL_DEPLOY_HOOK`.

## Post from your phone
Open a new issue in the repo and choose **New post or event** (works in the GitHub mobile app). Fill in the title, date and story, and drag photos into the story box. A workflow turns it into a post, strips photo metadata, and opens a pull request; merge it to publish.
One-time setup: **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**. Only the repo owner can trigger it.

## Infrastructure as code
`infra/terraform/` defines everything the site runs on: the Upstash database, the Vercel project and its environment variables, an optional custom domain, and the GitHub Actions secrets and variables. CI validates it on every change, and `/infra` draws it.
To apply it (or adopt your existing setup):
```bash
cd infra/terraform
export VERCEL_API_TOKEN=… GITHUB_TOKEN=… TF_VAR_upstash_email=… TF_VAR_upstash_api_key=…
terraform init
terraform import vercel_project.portfolio <existing-project-id>   # adopt instead of recreate
terraform plan
terraform apply
```

## Outage simulation
The home page map has a **Simulate an outage** button. It plays a scripted incident (edge down → health checks fail → alert → failover to the nearest region → recovery) entirely in the browser. Nothing real is affected.

## Security
Strict security headers are set in `next.config.js`: Content-Security-Policy (only this site's own scripts), HSTS, frame blocking, and a locked-down Permissions-Policy.

## RSS
Posts are available at `/rss.xml`.

## Live visitor counter
The header shows how many people are on the site right now. Clicking it shows today, the last 7 days and the all-time total. It uses a free Upstash Redis database: in Vercel, go to **Storage → Create → Upstash for Redis** and connect it to this project. Vercel adds the environment variables and the counter appears on the next deploy. Until then it stays hidden.

## Contact form
The form works out of the box by opening the visitor's email app with their message filled in. To receive messages directly instead, create a free form at formspree.io and put its ID in `formspreeId` in `content/profile.js`.

## Rules for changing the code
See [`CLAUDE.md`](CLAUDE.md): single source of truth, shared components, and design tokens (no hard-coded colours or sizes). `npm run check` runs the token lint and the build; GitHub Actions runs it on every pull request.

## Run it on your computer
```bash
npm install
npm run dev
```
Then open http://localhost:3000. Edits to files in `content/` and `public/media/` appear when you refresh.

## Put it online (Vercel)
1. Sign in at vercel.com with GitHub.
2. **Add New → Project**, pick this repo, and click **Deploy**. No settings are needed.
3. Every push after that gets its own preview link, and pushes to `main` update the live site.

## Features
Live infrastructure map, site status bar and changelog, clickable architecture diagrams, certifications, a big-photo Moments section, list pages for projects and writing, sitemap, search-engine data and generated share images, a custom 404 page, drop-down terminal (press ` and try `help`), Ctrl/⌘+K search, a spotlight and tilt on cards when you hover them, magnetic buttons, light and dark themes, drafted-email contact, a detailed page per project, photo collages with a full-screen viewer, and a live visitor count. There are a few easter eggs too, for example `sudo hire-me` or the Konami code.
