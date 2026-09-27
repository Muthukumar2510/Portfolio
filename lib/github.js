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

const statsCache = new Map();

// Live facts about a project's repo for its card and page: stars, languages, last push, CI state.
// Memoised per build process so many pages don't multiply API calls. Fails soft to null.
export function getRepoStats(repo) {
  if (!repo) return Promise.resolve(null);
  if (!statsCache.has(repo)) statsCache.set(repo, fetchRepoStats(repo));
  return statsCache.get(repo);
}

async function fetchRepoStats(repo) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const get = async (p) => {
    const r = await fetch(`https://api.github.com/repos/${repo}${p}`, { headers });
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  };
  try {
    const [info, langs] = await Promise.all([get(''), get('/languages')]);
    let ci = null;
    try {
      const runs = await get(`/commits/${info.default_branch}/check-runs?per_page=50`);
      const list = runs.check_runs || [];
      if (list.length) {
        ci = list.some((c) => c.status !== 'completed')
          ? 'running'
          : list.every((c) => ['success', 'skipped', 'neutral'].includes(c.conclusion))
            ? 'passing'
            : 'failing';
      }
    } catch {}
    const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
    return {
      url: info.html_url,
      stars: info.stargazers_count,
      forks: info.forks_count,
      openIssues: info.open_issues_count,
      pushedAt: info.pushed_at,
      languages: Object.entries(langs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 100) })),
      ci,
    };
  } catch {
    return null;
  }
}

// Attach live stats to every project that declares `github: owner/repo`.
export async function withRepoStats(projects) {
  return Promise.all(projects.map(async (p) => (p.github ? { ...p, repoStats: await getRepoStats(p.github) } : p)));
}
