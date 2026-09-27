import profile from '../content/profile';

// Recent commits of this site's repo, fetched at build time (and refreshed via ISR). Fails soft to [].
export async function getChangelog(limit = 6) {
  if (!profile.repo) return [];
  try {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const r = await fetch(`https://api.github.com/repos/${profile.repo}/commits?per_page=${limit * 3}`, { headers });
    if (!r.ok) return [];
    const commits = await r.json();
    return commits
      .filter((c) => c.parents?.length === 1)
      .slice(0, limit)
      .map((c) => ({
        sha: c.sha.slice(0, 7),
        url: c.html_url,
        message: c.commit.message.split('\n')[0],
        date: c.commit.author?.date || c.commit.committer?.date,
      }));
  } catch {
    return [];
  }
}
