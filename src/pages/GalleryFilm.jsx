
import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import SiteLayout from "../components/SiteLayout";
import { getProjects } from "../api";

function videoEmbed(url) {
  if (!url) return "";

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const parts = u.pathname.split("/").filter(Boolean);

    // YouTube short link
    if (host === "youtu.be") {
      const id = parts[0];
      return id
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : "";
    }

    // YouTube standard, shorts, and embed links
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      let id = "";

      if (parts[0] === "embed" || parts[0] === "shorts") {
        id = parts[1] || "";
      } else {
        id = u.searchParams.get("v") || "";
      }

      return id
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : "";
    }

    // Vimeo
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id =
        host === "player.vimeo.com" && parts[0] === "video"
          ? parts[1]
          : parts[0];

      return id ? `https://player.vimeo.com/video/${id}` : "";
    }

    // Instagram Reels and posts
    if (host === "instagram.com" || host === "instagr.am") {
      const type = parts[0];
      const id = parts[1];

      if (
        ["reel", "reels", "p", "tv"].includes(type) &&
        id
      ) {
        return `https://www.instagram.com/${type}/${id}/embed/`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

function isVideoProject(project) {
  return (
    /film|video|filmmaking|aftermovie|motion/i.test(
      `${project.main_category || ""} ${project.sub_category || ""}`
    ) || Boolean(project.video_embed_url)
  );
}

export default function GalleryFilm() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    getProjects()
      .then((data) => {
        if (alive) {
          setItems(
            (Array.isArray(data) ? data : []).filter(isVideoProject)
          );
        }
      })
      .catch((err) => {
        if (alive) {
          setError(err.message || "Terjadi kesalahan.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <SiteLayout pageClass="content-page">
      <main className="page-main section-shell">
        <div className="page-eyebrow">SELECTED WORKS · 02</div>

        <h1 className="page-title">
          Moving images.
          <br />
          <span className="text-accent">Stories in motion.</span>
        </h1>

        <p className="page-lead">
          Film, aftermovie, and video projects—each piece tells a
          story through direction, editing, and rhythm.
        </p>

        {loading ? (
          <p className="state-message">Memuat video…</p>
        ) : error ? (
          <p className="state-message" role="alert">
            Video belum dapat dimuat: {error}
          </p>
        ) : items.length > 0 ? (
          <div className="media-grid">
            {items.map((project) => {
              const embed = videoEmbed(project.video_embed_url);

              return (
                <article
                  className="media-card"
                  key={project.id || project.slug}
                >

                  <div className="media-frame">
                    {project.thumbnail_url ? (
                      <a
                        href={project.video_embed_url || "#"}
                        target={project.video_embed_url ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        aria-label={`Tonton ${project.title || "video"}`}
                        className="media-thumbnail-link"
                      >
                        <img
                          src={project.thumbnail_url}
                          alt={project.title || "Thumbnail karya"}
                          loading="lazy"
                        />
                        <span className="media-play-button">
                          <Play size={28} fill="currentColor" />
                        </span>
                      </a>
                    ) : (
                      <div className="media-placeholder">
                        <Play size={30} />
                        <span>Thumbnail belum tersedia</span>
                      </div>
                    )}
                  </div>


                  <div className="media-card-body">
                    <div className="media-meta">
                      {project.project_year || ""}
                      {project.sub_category
                        ? ` · ${project.sub_category}`
                        : ""}
                    </div>

                    <h2>{project.title}</h2>

                    <p>{project.description || ""}</p>

                    <p className="media-role">
                      {project.role || ""}
                      {Array.isArray(project.tools) &&
                        project.tools.length > 0
                        ? ` · ${project.tools.join(", ")}`
                        : ""}
                    </p>

                    {project.video_embed_url && (
                      <a
                        className="text-link"
                        href={project.video_embed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch on platform <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-panel">
            <Play size={26} />
            <h2>Video projects will appear here.</h2>
            <p>
              Tambahkan proyek kategori Filmmaking melalui Admin,
              lalu isi link video Instagram, YouTube, atau Vimeo.
              Untuk Instagram, unggah thumbnail secara manual agar
              gambar preview tetap tersedia.
            </p>
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
