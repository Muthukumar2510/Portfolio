# Portfolio — Professional and Personal Branding

A personal site styled like a cloud console. The hero is an interactive terminal, and every section below it can still be read without typing.

## Features
- **Interactive terminal**: `help`, `whoami`, `skills`, `experience`, `projects`, `contact`, `email`, `resume`, `theme`, `clear`, with Tab completion and ↑/↓ history
- **Command palette**: `Ctrl/⌘ + K` jumps to any section, project, or action
- **Light/dark themes**: follows the OS setting and remembers the visitor's choice
- **Smart contact**: drafted emails for hiring, collaboration, or a hello; copy-email button; optional booking link and Formspree form
- **Easter eggs**: try `sudo hire-me`, `rm -rf /`, `coffee`, or the Konami code
- Respects `prefers-reduced-motion`, works with a keyboard, and shows the deploy commit in the footer

## Edit your content
All content lives in `data/`:
- `profile.js`: name, bio, email, socials, `bookingUrl`, `formspreeId`
- `skills.js`, `experience.js`, `projects.js`

Replace `public/resume.pdf` with your resume.

## Images (no CMS or storage needed)
1. Put the file in `public/images/`, e.g. `public/images/profile.jpg` or `public/images/projects/infra-blueprint.png`.
2. Set its path in the data file: `avatar: '/images/profile.jpg'` in `profile.js`, or `image: '/images/projects/infra-blueprint.png'` on a project.

`next/image` resizes, compresses and lazy-loads them automatically. A square avatar and 16:9 project screenshots look best. If a field is empty, the site shows your initials or a generated cover instead. Theme colors are in `styles/globals.css`. Fonts are Google Sans and Google Sans Code, set in `pages/_app.js`.

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy
Import the repo into Vercel. No settings are needed.
