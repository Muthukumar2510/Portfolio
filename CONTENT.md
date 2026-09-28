# Adding your own content

Everything you see on the site comes from two folders: **`content/`** (words and facts) and
**`public/media/`** (photos). You never need to touch a component. After any change, run `npm run check`,
then commit — the site deploys on its own.

## 1. About you — `content/profile.js`

| Field | What it's for |
|---|---|
| `name`, `title`, `location`, `timezone` | Header, hero, footer, the local-time line on the contact form |
| `headline` | The big line in the hero ("I build and run cloud platforms.") |
| `bio` | First paragraph shows in the hero, all paragraphs in About |
| `status` | "Open to new opportunities" — leave empty to hide it |
| `email`, `resumeUrl`, `bookingUrl` | Contact buttons (put your résumé at `public/resume.pdf`) |
| `replyTime` | "Replies within a day or two" |
| `socials` | One line per network; leave `url` empty to hide it |
| `formspreeId` | Optional: messages post straight to you instead of opening the visitor's mail app |

## 2. Career — `content/experience.js`, `content/skills.js`, `content/certifications.js`

- **Experience**: newest first. Each role: `version` (a label like v3.0), `role`, `company`, `period` (e.g. "2023 — Present"), and 2–3 `highlights` that say
  what changed because of you (numbers beat adjectives).
- **Skills**: groups of tools with a `level` from 0–100. Logos appear automatically for known tools.
- **Certifications**: `id`, `name`, `issuer`, `date`, `expires`, `url` (your Credly link). Valid/expired is worked out from the dates.

## 3. Projects — one file per project in `content/projects/`

Copy an existing file (e.g. `this-site.md`), rename it, and edit the top block:
`title`, `summary`, `status`, `date`, `role`, `stack`, `metrics`, `featured: true` for the one on top.
Write the story below the `---` in plain Markdown: the problem, what you decided and why, what changed.

## 4. Writing and events — one file per post in `content/posts/`

Same idea: `title`, `type` (`blog` or `event`), `summary`, `date`, `location`, then the text.
`draft: true` keeps it visible only on your machine.

## 5. Photos — `public/media/`

| Put the file here | It appears |
|---|---|
| `public/media/profile/` (one photo) | Your framed portrait in the hero |
| `public/media/projects/<project-file-name>/` | Cover + gallery on that project (first file alphabetically is the cover) |
| `public/media/posts/<post-file-name>/` | Collage on that post and in **Talks & moments** |
| `public/media/certs/<id>.png` | The official badge on that certification (download it from Credly) |

The folder name must match the Markdown file name without `.md`
(`content/posts/kubecon-india-2025.md` → `public/media/posts/kubecon-india-2025/`).

**Then run `npm run media`.** It removes location and camera data (GPS), fixes rotation, caps the size, and
records the images. CI refuses unprocessed photos, and a GitHub workflow also processes them for you on push.

### Getting a sharp portrait
- Use the original file from your camera or phone, at least **1200 × 1500 px**, roughly **4:5 portrait**.
- Face in the upper third, plain background, soft daylight.
- JPEG or WebP. The pipeline keeps the portrait at higher quality (92) than other photos, and the page serves it
  at quality 90 at 2× the displayed size, so it stays crisp on retina screens.
- Until you add one, a dashed "Your photo goes here" box shows on your machine only — visitors never see it.

## 6. Logos — `content/brands.js`
Add a tool's simple-icons slug and run `npm run brands`. For logos simple-icons doesn't have, drop the official
SVG into `public/brands/` and set `source: 'local'`.
