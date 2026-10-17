
import { useEffect, useMemo, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { getProjects } from "../api";
import SiteLayout from "../components/SiteLayout";

const filters = [
  { label: "All", value: "all" },
  { label: "Event", value: "event" },
  { label: "Street", value: "street" },
  { label: "Cosplay", value: "cosplay" },
  { label: "Portrait", value: "portrait" },
];

const categoryPatterns = {
  event: /event|concert|ceremony|documentation/i,
  street: /street|urban|city/i,
  cosplay: /cosplay|costume/i,
  portrait: /portrait|people|person/i,
};

export default function GalleryPhoto() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let alive = true;

    async function loadPhotos() {
      try {
        const data = await getProjects();

        const photos = (Array.isArray(data) ? data : []).filter((p) =>
          /photo|photography|street|cosplay|event|portrait/i.test(
            `${p.main_category || ""} ${p.sub_category || ""}`
          )
        );

        if (alive) setItems(photos);
      } catch (err) {
        if (alive) setError(err.message || "Gagal memuat galeri.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadPhotos();

    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (activeFilter === "all") return items;

    const pattern = categoryPatterns[activeFilter];

    return items.filter((p) =>
      pattern.test(
        `${p.main_category || ""} ${p.sub_category || ""} ${p.title || ""}`
      )
    );
  }, [items, activeFilter]);

  useEffect(() => {
    if (!selected) return;

    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <SiteLayout pageClass="content-page">
      <main className="page-main section-shell">
        <div className="page-eyebrow">SELECTED WORKS · 03</div>

        <h1 className="page-title">
          Frames of life.
          <br />
          <span className="text-accent">Moments with meaning.</span>
        </h1>

        <p className="page-lead">
          Event, street, and portrait photography with attention to
          composition, atmosphere, and color.
        </p>

        <section className="photo-gallery-content">
          <div className="filter-row" aria-label="Filter fotografi">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-chip ${
                  activeFilter === filter.value ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {!loading && !error && (
            <p className="gallery3d-count">
              {visible.length} PHOTOS
            </p>
          )}

          {loading ? (
            <p className="state-message">Memuat foto...</p>
          ) : error ? (
            <p className="state-message" role="alert">
              Foto belum dapat dimuat: {error}
            </p>
          ) : visible.length > 0 ? (
            <div className="photo-grid">
              {visible.map((p) => (
                <button
                  type="button"
                  className="photo-card"
                  key={p.id || p.slug}
                  onClick={() => setSelected(p)}
                >
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    loading="lazy"
                  />

                  <span className="photo-overlay">
                    <span>
                      <small>{p.sub_category || "PHOTOGRAPHY"}</small>
                      <strong>{p.title}</strong>
                    </span>
                    <ArrowUpRight size={20} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <h2>Belum ada foto di kategori ini.</h2>
              <p>Coba pilih kategori lain atau All.</p>
            </div>
          )}
        </section>
      </main>

      {selected && (
        <div
          className="lightbox-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelected(null)}
              aria-label="Tutup detail"
            >
              <X />
            </button>

            <img src={selected.thumbnail_url} alt={selected.title} />

            <div className="lightbox-caption">
              <span>{selected.sub_category || "Photography"}</span>
              <h2>{selected.title}</h2>
              <p>{selected.description || ""}</p>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
