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

## 3. Notebook entries — one file each in `content/entries/`

Everything in the Lab is an entry. Copy an existing file, rename it, and set `type` at the top:

| `type` | For | Useful fields |
|---|---|---|
| `build` | something you made | `status` (live/building/archived), `role`, `stack`, `metrics`, `repo`, `github`, `featured: true` |
| `teardown` | how a product or connection works | `diagram` (a name from `content/diagrams.js`), `embed: trace` for the live request map |
| `sketch` | a UI design study | before/after images in the media folder |
| `note` | writing, talks and events | `event: true` + `location` for events (photo collage, Talks & moments) |

All entries take `title`, `summary`, `date`, `stack` and `draft: true` (visible only on your machine).
Write the story below the `---` in plain Markdown: the problem, what you decided and why, what broke, what you learned.
Entries live at `/lab/<file-name>`; old `/projects/…` and `/writing/…` links redirect there.

## 4. Diagrams — `content/diagrams.js`

Describe a system as data (nodes, links, handwritten notes) and the site draws it. See `/design` for the vocabulary.
Name a diagram in an entry's `diagram:` field to put it at the top of that entry.

**Or just write it as text** in the entry's front matter. The layout is automatic:

```yaml
diagram: |
  You (user) -> DNS : lookup
  DNS -> Vercel edge (cloud) : PoP
  Vercel edge -> /api/trace : HTTPS !
  /api/trace -> Redis (store) : ping ~
  note: static pages stop here @ Vercel edge
```

`(user)`, `(store)`, `(cloud)`, `(circle)` set the shape; `: label` names a link; `!` marks the important path,
`~` a dashed one; `note: text @ Node` adds a handwritten note. The entry's share image draws the same diagram.

## 5. From your phone — GitHub issue → entry

Open a new issue with the **New notebook entry** template (works in the GitHub mobile app): pick a type, write the
story, drag in photos, and optionally write a diagram as above. A workflow turns it into a pull request with the entry,
the photos (location data stripped) and the diagram; merge it to publish.

## 6. Photos — `public/media/`

| Put the file here | It appears |
|---|---|
| `public/media/profile/` (one photo) | Your framed portrait in the hero |
| `public/media/entries/<entry-file-name>/` | Cover + gallery on that entry (`cover.jpg` or the first file is the cover); events show a collage and appear in **Talks & moments** |
| `public/media/certs/<id>.png` | The official badge on that certification (download it from Credly) |

The folder name must match the Markdown file name without `.md`
(`content/entries/kubecon-india-2025.md` → `public/media/entries/kubecon-india-2025/`).

**Then run `npm run media`.** It removes location and camera data (GPS), fixes rotation, caps the size, and
records the images. CI refuses unprocessed photos, and a GitHub workflow also processes them for you on push.

### Getting a sharp portrait
- Use the original file from your camera or phone, at least **1200 × 1200 px**. It is shown as a circle, so keep your face centred with some space around it.
- Face in the upper third, plain background, soft daylight.
- JPEG or WebP. The pipeline keeps the portrait at higher quality (92) than other photos, and the page serves it
  at quality 90 at 2× the displayed size, so it stays crisp on retina screens.
- Until you add one, a dashed "Your photo goes here" box shows on your machine only — visitors never see it.

## 7. Logos — `content/brands.js`
Add a tool's simple-icons slug and run `npm run brands`. For logos simple-icons doesn't have, drop the official
SVG into `public/brands/` and set `source: 'local'`.
