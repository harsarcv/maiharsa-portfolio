
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import SiteLayout from "../components/SiteLayout";
import { getFurokidzHighlights } from "../api";

function safeEmbed(url) {
  if (!url) return "";

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    }

    if (host.endsWith("youtube.com")) {
      const id =
        u.searchParams.get("v") ||
        u.pathname.split("/").filter(Boolean).pop();

      return id
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : "";
    }

    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }

  return "";
}

export default function Furokidz() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Semua");

  useEffect(() => {
    let alive = true;

    getFurokidzHighlights()
      .then((data) => {
        if (alive) setItems(data);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const platforms = useMemo(() => {
    return [
      "Semua",
      ...new Set(
        items
          .map((item) => item.platform?.trim())
          .filter(Boolean)
      ),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedPlatform === "Semua") return items;

    return items.filter(
      (item) =>
        item.platform?.trim() === selectedPlatform
    );
  }, [items, selectedPlatform]);

  return (
    <SiteLayout pageClass="content-page furokidz-page">
      <main className="page-main section-shell">
        <div className="page-eyebrow">
          CREATIVE MEDIA · COMMUNITY · POP CULTURE
        </div>

        <h1 className="page-title">
          Welcome to the world of
          <br />
          <span className="furokidz-word">Furokidz.</span>
        </h1>

        <div className="furokidz-hero-panel">

          <div className="furokidz-symbol">
            <img
              src="/images/furokidz-logo.jpg"
              alt="Logo Furokidz"
              className="furokidz-logo"
            />
            <span>✳</span>
          </div>


          <div>
            <span className="section-kicker">
              A CREATIVE PLAYGROUND
            </span>

            <h2>Ideas, fandom, and stories made to be shared.</h2>

            <p>
              Furokidz adalah ruang media kreatif untuk merayakan
              pop culture melalui konten, video, dan ide visual.
              Maiharsa berperan sebagai Founder, Creative Director,
              dan Video Editor.
            </p>

            <a
              className="button-primary"
              href="https://www.instagram.com/furokidz/"
              target="_blank"
              rel="noreferrer"
            >
              Follow Furokidz <ArrowUpRight size={17} />
            </a>
          </div>
        </div>

        <section className="page-section">
          <span className="section-kicker">FEATURED CONTENT</span>
          <h2>From our channels.</h2>

          {loading ? (
            <p className="state-message">Memuat konten…</p>
          ) : error ? (
            <p className="state-message" role="alert">
              Konten belum dapat dimuat: {error}
            </p>
          ) : items.length ? (
            <>
              <div className="furokidz-filters">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    className={`furokidz-filter ${selectedPlatform === platform
                        ? "active"
                        : ""
                      }`}
                    onClick={() => setSelectedPlatform(platform)}
                    aria-pressed={selectedPlatform === platform}
                  >
                    {platform}
                    {platform === "Semua" && (
                      <span className="filter-count">
                        {items.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {filteredItems.length ? (
                <div className="media-grid">
                  {filteredItems.map((item, i) => {
                    const embed = safeEmbed(item.content_url);

                    return (
                      <article
                        className="media-card"
                        key={item.id ?? `${item.title}-${i}`}
                      >
                        <div className="media-frame">
                          {embed ? (
                            <iframe
                              src={embed}
                              title={item.title}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          ) : item.thumbnail_url ? (
                            <a
                              href={
                                item.content_url ||
                                "https://www.instagram.com/furokidz/"
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                loading="lazy"
                              />
                            </a>
                          ) : (
                            <div className="media-placeholder">
                              <Play size={30} />
                            </div>
                          )}
                        </div>

                        <div className="media-card-body">
                          <div className="media-meta">
                            {item.platform || "Featured content"}
                            {item.views_count != null &&
                              ` · ${item.views_count} views`}
                          </div>

                          <h2>{item.title}</h2>

                          {item.published_at && (
                            <p>
                              {new Date(
                                item.published_at
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                              })}
                            </p>
                          )}

                          <a
                            className="text-link"
                            href={
                              item.content_url ||
                              "https://www.instagram.com/furokidz/"
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open content <ArrowUpRight size={16} />
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-panel">
                  <h2>Belum ada konten di platform ini.</h2>
                  <p>Pilih platform lain untuk melihat konten.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-panel">
              <h2>Featured content coming soon.</h2>
              <p>
                Konten unggulan akan muncul setelah URL dan metadata
                ditambahkan ke tabel furokidz_highlights.
              </p>
            </div>
          )}
        </section>
      </main>
    </SiteLayout>
  );
}
