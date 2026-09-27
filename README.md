# Portfolio: Muthukumar Natarajan

A personal site for a cloud engineer. It opens with an interactive particle illustration (cloud → initials → Kubernetes) that reacts to your cursor, then shows projects, experience, writing and events. A hidden terminal drops down when you press the backtick key (`).

## Where everything lives

All text is in `content/`, and all photos are in `public/media/`. You never need to edit layout code to change what the site says.

| What | Where |
| --- | --- |
| Name, bio, email, socials, resume/booking links | `content/profile.js` |
| Skills (status board) | `content/skills.js` |
| Work history (deployment log) | `content/experience.js` |
| A project (one file each) | `content/projects/<name>.md` |
| A blog post or event (one file each) | `content/posts/<name>.md` |
| Photos for a project | `public/media/projects/<name>/` |
| Photos for a post or event | `public/media/posts/<name>/` |
| Resume | `public/resume.pdf` |
| Colors | `styles/globals.css` (top of the file) |

### Add a project
1. Copy `content/projects/infra-blueprint.md` to `content/projects/my-project.md` and fill it in. The top section sets title, summary, status, role, stack, links and metrics; the rest is the write-up in Markdown.
2. Optional: create `public/media/projects/my-project/` and drop in screenshots. A file named `cover.jpg` (or `.png`) becomes the cover image. Every other image goes into the photo collage.

The new project appears on the home page, in the terminal (`projects`), and in the Ctrl/⌘+K search automatically.

### Add a blog post or event
Same steps, in `content/posts/` and `public/media/posts/<name>/`. Set `type: blog` or `type: event` at the top of the file. For events, paste a Google Photos share link into `album:` to add a "View the full album" button. Put your best photos in the folder so they show as a collage. Google Photos links can't be embedded as images reliably.

Photos are resized, compressed and lazy-loaded automatically. Any size or orientation works, and they're shown in order of filename (`01.jpg`, `02.jpg`, …).

## Live visitor counter
The header shows how many people are on the site right now. Clicking it shows today, the last 7 days and the all-time total. It uses a free Upstash Redis database: in Vercel, go to **Storage → Create → Upstash for Redis** and connect it to this project. Vercel adds the environment variables and the counter appears on the next deploy. Until then it stays hidden.

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
Interactive particle hero, drop-down terminal (press ` and try `help`), Ctrl/⌘+K search, a spotlight and tilt on cards when you hover them, magnetic buttons, light and dark themes, drafted-email contact, a detailed page per project, photo collages with a full-screen viewer, and a live visitor count. There are a few easter eggs too, for example `sudo hire-me` or the Konami code.
