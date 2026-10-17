import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProjects } from "../api";
import SiteLayout from "../components/SiteLayout";
import "../Gallery3D.css";

const filters = [
  { label: "All", value: "all" },
  { label: "Environment", value: "environment" },
  { label: "Object", value: "object" },
  { label: "Commercial / Photobooth", value: "commercial" },
];

export default function Gallery3D() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const data = await getProjects();
        if (!cancelled) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Gagal memuat galeri.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const galleryProjects = useMemo(
    () =>
      projects.filter((project) =>
        /3d|model|environment|object|commercial|photobooth/i.test(
          `${project.main_category || ""} ${project.sub_category || ""}`
        )
      ),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return galleryProjects;

    const patterns = {
      environment: /environment|environmental|scene|landscape/i,
      object: /object|product|prop|asset/i,
      commercial: /commercial|photobooth|booth/i,
    };

    return galleryProjects.filter((project) =>
      patterns[activeFilter]?.test(
        `${project.main_category || ""} ${project.sub_category || ""}`
      )
    );
  }, [galleryProjects, activeFilter]);

  const images = selectedProject
    ? [
        selectedProject.thumbnail_url,
        ...(Array.isArray(selectedProject.media_urls)
          ? selectedProject.media_urls
          : []),
      ].filter((url, index, all) => url && all.indexOf(url) === index)
    : [];

  function closeProject() {
    setSelectedProject(null);
    setActiveImage(0);
  }

  function changeImage(direction) {
    setActiveImage(
      (current) => (current + direction + images.length) % images.length
    );
  }

  return (
    <SiteLayout pageClass="content-page">
      <main className="page-main section-shell gallery3d-page">
        <div className="page-eyebrow">SELECTED WORKS · 01</div>

        <h1 className="page-title">
          3D Art &amp;
          <br />
          <span className="text-accent">Modeling.</span>
        </h1>

        <p className="page-lead">
          Exploring form, space, materials, and light through
          three-dimensional visual design.
        </p>

        <section className="gallery3d-content">
          <div className="gallery3d-heading">
            <div>
              <div className="page-eyebrow">THE GALLERY</div>
              <h2>Selected pieces.</h2>
            </div>

            <span className="gallery3d-count">
              {filteredProjects.length} PROJECTS
            </span>
          </div>

          <div className="gallery3d-filters" aria-label="Filter galeri">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`gallery3d-filter ${
                  activeFilter === filter.value ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading && (
            <p className="state-message">Memuat galeri...</p>
          )}

          {!loading && error && (
            <p className="state-message" role="alert">
              Galeri belum dapat dimuat: {error}
            </p>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className="gallery3d-grid">
              {filteredProjects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  className="gallery3d-card"
                  onClick={() => {
                    setSelectedProject(project);
                    setActiveImage(0);
                  }}
                >
                  <div className="gallery3d-card-image">
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      loading="lazy"
                    />
                    <span className="gallery3d-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="gallery3d-card-open">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>

                  <div className="gallery3d-card-info">
                    <div>
                      <span className="project-category">
                        {project.sub_category || project.main_category}
                      </span>
                      <h3>{project.title}</h3>
                    </div>
                    {project.project_year && (
                      <span className="gallery3d-year">
                        {project.project_year}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="empty-panel">
              <h2>No projects to display yet.</h2>
              <p>
                {galleryProjects.length === 0
                  ? "3D projects will appear here once their data and images have been added."
                  : "No projects match this category yet."}
              </p>
            </div>
          )}
        </section>

        {selectedProject && (
          <div
            className="gallery3d-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
            onClick={closeProject}
          >
            <button
              type="button"
              className="gallery3d-lightbox-close"
              onClick={closeProject}
              aria-label="Tutup galeri"
            >
              <X size={24} />
            </button>

            <div
              className="gallery3d-lightbox-content"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="gallery3d-lightbox-image">
                <img
                  src={images[activeImage]}
                  alt={`${selectedProject.title} — gambar ${activeImage + 1}`}
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery3d-lightbox-arrow previous"
                      onClick={() => changeImage(-1)}
                      aria-label="Gambar sebelumnya"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      className="gallery3d-lightbox-arrow next"
                      onClick={() => changeImage(1)}
                      aria-label="Gambar berikutnya"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <span className="gallery3d-image-counter">
                      {activeImage + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              <div className="gallery3d-lightbox-info">
                <span className="project-category">
                  {selectedProject.sub_category ||
                    selectedProject.main_category}
                </span>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.description}</p>

                {selectedProject.role && (
                  <p>
                    <strong>Role:</strong> {selectedProject.role}
                  </p>
                )}

                {Array.isArray(selectedProject.tools) &&
                  selectedProject.tools.length > 0 && (
                    <p>
                      <strong>Tools:</strong>{" "}
                      {selectedProject.tools.join(", ")}
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}
      </main>
    </SiteLayout>
  );
}