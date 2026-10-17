
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import "./App.css";
import { getProjects, getFurokidzHighlights } from "./api";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import Gallery3D from "./pages/Gallery3D";
import About from "./pages/About";
import GalleryFilm from "./pages/GalleryFilm";
import GalleryPhoto from "./pages/GalleryPhoto";
import Furokidz from "./pages/Furokidz";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

function HomePage() {
  const [dbProjects, setDbProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [furokidzHighlights, setFurokidzHighlights] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const response = await getProjects({ featured: true });

        if (!cancelled) {
          setDbProjects(response);
        }
      } catch (error) {
        if (!cancelled) {
          setProjectsError(error.message);
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getFurokidzHighlights()
      .then((data) => { if (!cancelled) setFurokidzHighlights(data.slice(0, 1)); })
      .catch(() => { if (!cancelled) setFurokidzHighlights([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <SiteLayout pageClass="home-page" isHome>
      <main>
        {/* HERO */}
        <section className="hero section-shell" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              CREATIVE PORTFOLIO · 2026
            </div>

            <h1>
              Ideas into
              <br />
              <span className="headline-accent">visual</span> stories
              <span className="headline-period">.</span>
            </h1>

            <p className="hero-description">
              I&apos;m Maiharsa Muara — a creative exploring the intersection of
              design, 3D art, filmmaking, videography, photography, and technology.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#work">
                Explore my work <ArrowDownRight size={18} />
              </a>
              <a className="button-secondary" href="#about">
                More about me
              </a>
            </div>

            <div className="hero-meta">
              <span>DESIGNER</span>
              <span className="meta-separator">/</span>
              <span>VISUAL CREATOR</span>
              <span className="meta-separator">/</span>
              <span>DEVELOPER</span>
            </div>
          </div>

          {/* Abstract artwork placeholder */}
          <div className="hero-art" aria-label="Creative work showcase">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="art-note note-top">
              <span className="note-star">✳</span>
              <span>
                MAKE IT
                <br />
                MATTER.
              </span>
            </div>

            <div className="art-panel panel-blue">
              <img
                src="/images/harsa.png"
                alt="Foto Maiharsa Muara"
                className="hero-art-image"
              />
            </div>

            <div className="art-panel panel-pink">
              <img
                src="/images/3d.png"
                alt="Foto Maiharsa Muara"
                className="hero-art-image"
              />
            </div>

            <div className="art-panel panel-orange">
              <img
                src="/images/foto.jpg"
                alt="Foto Maiharsa Muara"
                className="hero-art-image"
              />
            </div>

            <div className="art-sticker">
              <span>CREATIVE</span>
              <strong>BY NATURE.</strong>
              <ArrowUpRight size={19} />
            </div>

            <div className="art-caption">
              <span>INDEPENDENT CREATIVE</span>
              <span>EST. 2024</span>
            </div>
          </div>

          <a className="scroll-indicator" href="#work">
            <span className="scroll-line" />
            SCROLL TO EXPLORE
          </a>
        </section>

        {/* WORK */}
        <section className="work-section section-shell" id="work">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SELECTED DIRECTIONS</span>
              <h2>
                Things I <span className="text-accent">create.</span>
              </h2>
            </div>
            <p>A mix of disciplines, connected by curiosity.</p>
          </div>

          <div className="project-grid">
            {projectsLoading && <p>Loading creative works...</p>}

            {!projectsLoading && projectsError && (
              <p role="alert">{projectsError}</p>
            )}

            {!projectsLoading &&
              !projectsError &&
              dbProjects.map((project, index) => (
                <article
                  className="project-card"
                  key={project.id}
                >
                  <div className="project-visual">
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="project-info">
                    <span className="project-category">
                      {project.main_category}
                    </span>

                    <h3>{project.title}</h3>
                    {project.role && <p className="project-role">{project.role}</p>}
                    <p>{project.description}</p>
                  </div>
                </article>
              ))}

            {!projectsLoading &&
              !projectsError &&
              dbProjects.length === 0 && furokidzHighlights.length === 0 && (
                <p className="projects-empty">
                  Selected creative works will be showcased here soon.
                </p>
              )}
            {furokidzHighlights.map((item, index) => (
              <article className="project-card" key={`furokidz-${item.title}-${index}`}>
                <a className="project-visual" href={item.content_url || "https://www.instagram.com/furokidz/"} target="_blank" rel="noreferrer" aria-label={`Buka ${item.title}`}>
                  {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} loading="lazy" /> : <div className="project-visual-fallback">FUROKIDZ</div>}
                </a>
                <div className="project-info">
                  <span className="project-category">FUROKIDZ · {item.platform || "FEATURED CONTENT"}</span>
                  <h3>{item.title}</h3>
                  <p>Featured content from Furokidz.</p>
                </div>
              </article>
            ))}
          </div>
          <div className="work-gallery-link">
          </div>
        </section>

        {/* ABOUT */}
        <section className="about-section section-shell" id="about">
          <span className="section-kicker">A LITTLE ABOUT ME</span>

          <div className="about-content">
            <h2>
              Curious by default.
              <br />
              <span className="text-muted">Creative by practice.</span>
            </h2>

            <div className="about-description">
              <p>
                I enjoy turning ideas into experiences — whether through
                3D visuals, photography, film, or digital products.
              </p>
              <p>
                My process is a balance between experimentation, attention
                to detail, and a willingness to keep learning.
              </p>
              <a className="text-link" href="#contact">
                Get to know me <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* FUROKIDZ */}
        <section className="furokidz-section section-shell" id="furokidz">
          <div className="furokidz-copy">
            <span className="section-kicker">CREATIVE COLLABORATION</span>

            <h2>
              A little world
              <br />
              called <span className="furokidz-word">Furokidz.</span>
            </h2>

            <p>
              A creative space for playful ideas, visual experiments, and
              projects made with imagination.
            </p>

            <a className="button-primary" href="#contact">
              Let&apos;s collaborate <ArrowUpRight size={17} />
            </a>
          </div>


          <div className="furokidz-art">
            <img
              src="/images/banner-furokidz.png"
              alt="Furokidz"
              className="furokidz-art-image"
            />
          </div>

        </section>

        {/* CONTACT */}
        <section className="contact-section section-shell" id="contact">
          <span className="section-kicker">YOUR TURN</span>

          <h2>
            Have an idea?
            <br />
            <span className="text-accent">Let&apos;s make it real.</span>
          </h2>

          <p>
            Open to creative collaborations, projects, and new opportunities.
          </p>

          <a className="button-primary" href="mailto:harsa310504@gmail.com">
            Say hello <ArrowUpRight size={18} />
          </a>
        </section>

      </main>
    </SiteLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio/3d-art" element={<Gallery3D />} />
        <Route path="/portfolio/filmmaking" element={<GalleryFilm />} />
        <Route path="/portfolio/photography" element={<GalleryPhoto />} />
        <Route path="/furokidz" element={<Furokidz />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
