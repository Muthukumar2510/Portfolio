// next.config.js
module.exports = {
  reactStrictMode: true,
};

// pages/index.js
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Muthukumar Natarajan | Cloud Engineer</title>
        <meta name="description" content="Portfolio of Muthukumar Natarajan, a Cloud Engineer specializing in cloud solutions, DevOps, and automation." />
      </Head>

      <Navbar />

      <main className="main">
        <section className="hero">
          <h1>Hi, I'm Muthukumar Natarajan</h1>
          <p>Cloud Engineer | DevOps Enthusiast | Problem Solver</p>
          <a href="#projects" className="btn">View My Work</a>
        </section>

        <section id="projects" className="projects">
          <h2>Projects</h2>
          <div className="project-grid">
            <div className="project-card">
              <h3>Project 1</h3>
              <p>Description of your project...</p>
            </div>
            <div className="project-card">
              <h3>Project 2</h3>
              <p>Description of your project...</p>
            </div>
          </div>
        </section>

        <section id="about" className="about">
          <h2>About Me</h2>
          <p>I am a Cloud Engineer with expertise in cloud architecture, DevOps, and automation. I love solving complex problems and building scalable solutions.</p>
        </section>

        <section id="contact" className="contact">
          <h2>Contact Me</h2>
          <p>Feel free to reach out via email: <a href="mailto:muthukumar@example.com">muthukumar@example.com</a></p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Muthukumar Natarajan</h1>
      <div className="links">
        <Link href="#projects">Projects</Link>
        <Link href="#about">About</Link>
        <Link href="#contact">Contact</Link>
      </div>
    </nav>
  );
}

// components/Footer.js
export default function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 Muthukumar Natarajan. All rights reserved.</p>
    </footer>
  );
}

// styles/globals.css
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f9;
}

.navbar {
  background-color: #333;
  color: #fff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar .links a {
  color: #fff;
  margin-left: 1rem;
  text-decoration: none;
}

.main {
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.projects, .about, .contact {
  margin-top: 4rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
