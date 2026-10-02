import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import ListPage from '../components/layout/ListPage';
import Blueprint from '../components/ui/Blueprint';
import Note from '../components/ui/Note';
import { DIAGRAMS, legend } from '../content/diagrams';
import { getSiteData } from '../lib/content';
import { getDesignTokens } from '../lib/designTokens';
import styles from '../styles/pages/DesignPage.module.css';

// The living design system: every token (read from styles/tokens.css at build time), the type, the diagram
// language, and the journal of design decisions (content/design-log.md).
export default function DesignPage({ tokens, logHtml }) {
  const type = tokens.groups.find((g) => g.title === 'Type');
  return (
    <ListPage
      title="Design"
      intro={`How this notebook is drawn. ${tokens.count} design tokens, one ink, one diagram language. Everything below is read from the code at build time, so it can't drift.`}
    >
      <section className={styles.block} aria-labelledby="d-ink">
        <h2 id="d-ink" className={styles.h2}>Paper &amp; ink</h2>
        <p className={styles.lead}>Light theme is cream paper, dark theme is a blueprint. One ink for structure, one signal colour for what matters.</p>
        <ul className={styles.swatches}>
          {tokens.colours.map((c) => (
            <li key={c.name} className={styles.swatch}>
              <span className={styles.chip} style={{ '--c': `var(${c.name})` }} />
              <code>{c.name}</code>
              <span className={styles.values}>
                {c.light}
                {c.dark && c.dark !== c.light ? ` · ${c.dark}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="d-type">
        <h2 id="d-type" className={styles.h2}>Type</h2>
        <div className={styles.fonts}>
          <p className={styles.sans}>Sans: for reading. Google Sans.</p>
          <p className={styles.mono}>Mono: labels, data, code.</p>
          <Note point="left">Handwriting: notes only</Note>
        </div>
        <ul className={styles.scale}>
          {type?.tokens
            .filter((t) => t.name.startsWith('--text-'))
            .map((t) => (
              <li key={t.name}>
                <span className={styles.specimen} style={{ '--size': `var(${t.name})` }}>
                  Aa
                </span>
                <code>{t.name}</code>
                <span className={styles.values}>{t.value}</span>
              </li>
            ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="d-diagrams">
        <h2 id="d-diagrams" className={styles.h2}>Diagram language</h2>
        <p className={styles.lead}>
          Every drawing is data in <code>content/diagrams.js</code>, drawn by <code>lib/diagram.js</code>. The same description makes the figure, the
          watermark behind a section and share images.
        </p>
        <Blueprint diagram={legend} />
        {Object.entries(DIAGRAMS).map(([key, d]) => (
          <div key={key} className={styles.diagram}>
            <Blueprint diagram={d} />
          </div>
        ))}
      </section>

      {tokens.groups
        .filter((g) => g.title !== 'Type')
        .map((g) => (
          <section key={g.title} className={styles.block} aria-label={g.title}>
            <h2 className={styles.h2}>{g.title}</h2>
            <ul className={styles.list}>
              {g.tokens.map((t) => (
                <li key={t.name}>
                  {g.title === 'Space' && <span className={styles.bar} style={{ '--w': `var(${t.name})` }} />}
                  {g.title === 'Radius' && <span className={styles.corner} style={{ '--r': `var(${t.name})` }} />}
                  <code>{t.name}</code>
                  <span className={styles.values}>{t.value}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <section className={styles.block} aria-labelledby="d-log">
        <h2 id="d-log" className={styles.h2}>Decisions</h2>
        <div className={`prose ${styles.log}`} dangerouslySetInnerHTML={{ __html: logHtml }} />
      </section>
    </ListPage>
  );
}

export function getStaticProps() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'content/design-log.md'), 'utf8');
  return { props: { site: getSiteData(), tokens: getDesignTokens(), logHtml: marked.parse(matter(raw).content) } };
}
