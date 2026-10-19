
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getProjects } from "../api";
import SiteLayout from "../components/SiteLayout";

const filters = [
    { label: "All", value: "all" },
    { label: "Event", value: "event" },
    { label: "Street", value: "street" },
    { label: "Cosplay", value: "cosplay" },
    { label: "Portrait", value: "portrait" },
];

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

                const photos = (Array.isArray(data) ? data : [])
                    .filter(
                        (project) =>
                            (project.main_category || "")
                                .trim()
                                .toLowerCase() === "photography" &&
                            project.thumbnail_url
                    );

                if (alive) {
                    setItems(photos);
                }
            } catch (err) {
                if (alive) {
                    setError(
                        err.message || "Gagal memuat galeri."
                    );
                }
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        }

        loadPhotos();

        return () => {
            alive = false;
        };
    }, []);

    const visible = useMemo(() => {
        if (activeFilter === "all") {
            return items;
        }

        return items.filter(
            (project) =>
                (project.sub_category || "")
                    .trim()
                    .toLowerCase() === activeFilter
        );
    }, [items, activeFilter]);

    useEffect(() => {
        if (!selected) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setSelected(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [selected]);

    return (
        <SiteLayout pageClass="content-page">
            <main className="page-main section-shell">
                <div className="page-eyebrow">
                    PHOTOGRAPHY
                </div>

                <h1 className="page-title">
                    Frames of life.
                    <br />
                    <span className="text-accent">
                        Moments with meaning.
                    </span>
                </h1>

                <p className="page-lead">
                    A collection of moments captured through my lens.
                </p>

                <section className="photo-gallery-content">
                    <div
                        className="filter-row"
                        aria-label="Filter fotografi"
                    >
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                className={`filter-chip ${
                                    activeFilter === filter.value
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveFilter(filter.value)
                                }
                                aria-pressed={
                                    activeFilter === filter.value
                                }
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
                        <p className="state-message">
                            Memuat foto...
                        </p>
                    ) : error ? (
                        <p
                            className="state-message"
                            role="alert"
                        >
                            Foto belum dapat dimuat: {error}
                        </p>
                    ) : visible.length > 0 ? (
                        <div className="photo-grid">
                            {visible.map((photo) => (
                                <button
                                    type="button"
                                    className="photo-card"
                                    key={photo.id || photo.slug}
                                    onClick={() => setSelected(photo)}
                                    aria-label="Lihat foto"
                                >
                                    <img
                                        src={photo.thumbnail_url}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-panel">
                            <h2>
                                Belum ada foto di kategori ini.
                            </h2>
                            <p>
                                Coba pilih kategori lain atau All.
                            </p>
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
                        className="lightbox-content photo-lightbox"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Preview foto"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="lightbox-close"
                            onClick={() => setSelected(null)}
                            aria-label="Tutup foto"
                        >
                            <X />
                        </button>

                        <img
                            src={selected.thumbnail_url}
                            alt=""
                        />
                    </div>
                </div>
            )}
        </SiteLayout>
    );
}
