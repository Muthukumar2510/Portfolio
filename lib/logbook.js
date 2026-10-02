import fs from 'fs';
import path from 'path';
import { getEntries } from './content';
import { getChangelog } from './github';

// The Log writes itself at build time from three real sources, newest first:
//   commits to this site's repo (GitHub API), notebook entries (content/entries), and dated design decisions
//   (content/design-log.md "## YYYY-MM-DD · Title" headings). Nothing here is typed by hand.
function designDecisions() {
  const file = path.join(process.cwd(), 'content/design-log.md');
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/^## (\d{4}-\d{2}-\d{2}) · (.+)$/gm)].map((m) => ({
    kind: 'design',
    date: m[1],
    title: m[2].trim(),
    href: '/design#d-log',
  }));
}

export async function getLogbook(limit = 60) {
  const commits = (await getChangelog(30)).map((c) => ({
    kind: 'commit',
    date: (c.date || '').slice(0, 10),
    title: c.message,
    href: c.url,
    sha: c.sha,
  }));
  const entries = getEntries().map((e) => ({ kind: e.type, date: e.date, title: e.title, href: `/lab/${e.slug}` }));
  const all = [...commits, ...entries, ...designDecisions()]
    .filter((i) => /^\d{4}-\d{2}-\d{2}$/.test(i.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);

  // Group by month for the page ("2026-10" → items).
  const months = [];
  for (const item of all) {
    const key = item.date.slice(0, 7);
    if (months[months.length - 1]?.key !== key) months.push({ key, items: [] });
    months[months.length - 1].items.push(item);
  }
  return { months, counts: { commits: commits.length, entries: entries.length, design: all.filter((i) => i.kind === 'design').length } };
}
