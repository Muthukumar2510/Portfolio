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

Replace `public/resume.pdf` with your resume. Theme colors are in `styles/globals.css`.

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploy
Import the repo into Vercel. No settings are needed.
