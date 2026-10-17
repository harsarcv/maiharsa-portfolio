
import { useEffect, useState } from "react";
import {
    getAdminProjects,
    adminLogin,
    adminLogout,
    saveProject,
    deleteProject,
    uploadProjectImage,
    checkAdmin,
    getAdminExperiences,
    saveExperience,
    deleteExperience,
    getAdminFurokidz,
    saveFurokidz,
    deleteFurokidz,
} from "../api";

const categories = {
    "3D Art": [
        "Environment",
        "Object",
        "Commercial / Photobooth",
    ],
    Filmmaking: [
        "Short Film",
        "Aftermovie",
        "Cinematic",
        "Commercial",
        "Other",
    ],
    Photography: [
        "Event",
        "Street",
        "Cosplay",
        "Portrait",
        "Other",
    ],
};

const createEmptyProject = () => ({
    title: "",
    slug: "",
    main_category: "3D Art",
    sub_category: "Environment",
    description: "",
    role: "",
    tools: "",
    thumbnail_url: "",
    media_urls: "",
    video_embed_url: "",
    project_year: new Date().getFullYear(),
    is_featured: false,
    display_order: 0,
});

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}


const createEmptyExperience = () => ({
    organization: "", role_title: "", exp_type: "Organization", period: "",
    description: "", highlights: "", display_order: 0,
});

const createEmptyFurokidz = () => ({
    title: "", platform: "Instagram", content_url: "", thumbnail_url: "",
    views_count: "", published_at: "", display_order: 0,
});


export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [form, setForm] = useState(createEmptyProject);
    const [editingId, setEditingId] = useState(null);
    const [image, setImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState("Semua");

    const [experiences, setExperiences] = useState([]);
    const [experienceForm, setExperienceForm] = useState(
        createEmptyExperience
    );
    const [editingExperienceId, setEditingExperienceId] =
        useState(null);
    const [experienceSaving, setExperienceSaving] = useState(false);
    const [experienceMessage, setExperienceMessage] = useState("");
    const [furokidzItems, setFurokidzItems] = useState([]);
    const [furokidzForm, setFurokidzForm] = useState(createEmptyFurokidz);
    const [editingFurokidzId, setEditingFurokidzId] = useState(null);
    const [furokidzImage, setFurokidzImage] = useState(null);
    const [furokidzSaving, setFurokidzSaving] = useState(false);
    const [furokidzMessage, setFurokidzMessage] = useState("");


    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const updateExperienceField = (field, value) => {
        setExperienceForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    async function loadExperiences() {
        const result = await getAdminExperiences();
        const data = Array.isArray(result)
            ? result
            : result.data || result.experiences || [];
        setExperiences(data);
    }

    async function loadFurokidz() {
        const result = await getAdminFurokidz();
        setFurokidzItems(Array.isArray(result) ? result : result.data || result.items || []);
    }

    const updateFurokidzField = (field, value) => setFurokidzForm((old) => ({ ...old, [field]: value }));
    function resetFurokidzForm() {
        setFurokidzForm(createEmptyFurokidz());
        setEditingFurokidzId(null);
        setFurokidzImage(null);
    }
    function editFurokidz(item) {
        setEditingFurokidzId(item.id);
        setFurokidzForm({
            title: item.title || "", platform: item.platform || "Instagram",
            content_url: item.content_url || "", thumbnail_url: item.thumbnail_url || "",
            views_count: item.views_count || "", published_at: item.published_at ? String(item.published_at).slice(0, 10) : "",
            display_order: item.display_order ?? 0,
        });
        setFurokidzImage(null);
        setFurokidzMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    async function handleSaveFurokidz(event) {
        event.preventDefault();
        setFurokidzSaving(true);
        setFurokidzMessage("");
        try {
            let thumbnailUrl = furokidzForm.thumbnail_url;
            if (furokidzImage) thumbnailUrl = await uploadImage(furokidzImage);
            const wasEditing = Boolean(editingFurokidzId);
            await saveFurokidz(editingFurokidzId, {
                ...furokidzForm,
                thumbnail_url: thumbnailUrl,
                published_at: furokidzForm.published_at || null,
                display_order: Number(furokidzForm.display_order) || 0,
            });
            await loadFurokidz();
            resetFurokidzForm();
            setFurokidzMessage(wasEditing ? "Konten Furokidz berhasil diperbarui." : "Konten Furokidz berhasil ditambahkan.");
        } catch (error) {
            setFurokidzMessage(error.message);
        } finally {
            setFurokidzSaving(false);
        }
    }
    async function handleDeleteFurokidz(item) {
        if (!window.confirm(`Hapus konten "${item.title}"?`)) return;
        try {
            await deleteFurokidz(item.id);
            await loadFurokidz();
            if (editingFurokidzId === item.id) resetFurokidzForm();
            setFurokidzMessage("Konten Furokidz berhasil dihapus.");
        } catch (error) {
            setFurokidzMessage(error.message);
        }
    }

    function resetExperienceForm() {
        setExperienceForm(createEmptyExperience());
        setEditingExperienceId(null);
    }

    function editExperience(item) {
        setEditingExperienceId(item.id);
        setExperienceForm({
            organization: item.organization || "",
            role_title: item.role_title || "",
            exp_type: item.exp_type || "Organization",
            period: item.period || "",
            description: item.description || "",
            highlights: Array.isArray(item.highlights)
                ? item.highlights.join("\n")
                : "",
            display_order: item.display_order ?? 0,
        });
        setExperienceMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSaveExperience(event) {
        event.preventDefault();
        setExperienceSaving(true);
        setExperienceMessage("");

        try {
            const wasEditing = Boolean(editingExperienceId);
            const payload = {
                ...experienceForm,
                highlights: experienceForm.highlights
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                display_order: Number(experienceForm.display_order) || 0,
            };

            await saveExperience(editingExperienceId, payload);
            await loadExperiences();
            resetExperienceForm();
            setExperienceMessage(
                wasEditing
                    ? "Pengalaman berhasil diperbarui."
                    : "Pengalaman berhasil ditambahkan."
            );
        } catch (error) {
            setExperienceMessage(error.message);
        } finally {
            setExperienceSaving(false);
        }
    }

    async function handleDeleteExperience(item) {
        const confirmed = window.confirm(
            `Hapus pengalaman "${item.role_title} — ${item.organization}"?`
        );
        if (!confirmed) return;

        try {
            await deleteExperience(item.id);
            await loadExperiences();
            if (editingExperienceId === item.id) resetExperienceForm();
            setExperienceMessage("Pengalaman berhasil dihapus.");
        } catch (error) {
            setExperienceMessage(error.message);
        }
    }

    async function loadProjects() {
        const result = await getAdminProjects();
        const data = Array.isArray(result)
            ? result
            : result.data || result.projects || [];

        setProjects(data);
    }

    useEffect(() => {
        checkAdmin()
            .then(async () => {
                setLoggedIn(true);
                await Promise.all([loadProjects(), loadExperiences(), loadFurokidz()]);
            })
            .catch(() => setLoggedIn(false))
            .finally(() => setLoading(false));
    }, []);

    async function handleLogin(event) {
        event.preventDefault();
        setMessage("");

        try {
            await adminLogin({ username, password });
            setLoggedIn(true);
            setPassword("");
            await Promise.all([loadProjects(), loadExperiences(), loadFurokidz()]);
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function handleLogout() {
        try {
            await adminLogout();
        } finally {
            setLoggedIn(false);
            setProjects([]);
            setExperiences([]);
            setFurokidzItems([]);
            resetForm();
            resetExperienceForm();
            resetFurokidzForm();
        }
    }

    function handleCategoryChange(category) {
        setForm((previous) => ({
            ...previous,
            main_category: category,
            sub_category: categories[category]?.[0] || "",
            video_embed_url:
                category === "Filmmaking"
                    ? previous.video_embed_url
                    : previous.video_embed_url,
        }));
    }

    function editProject(project) {
        const mainCategory = categories[project.main_category]
            ? project.main_category
            : "3D Art";

        setEditingId(project.id);

        setForm({
            title: project.title || "",
            slug: project.slug || "",
            main_category: mainCategory,
            sub_category: project.sub_category || "",
            description: project.description || "",
            role: project.role || "",
            tools: (project.tools || []).join(", "),
            thumbnail_url: project.thumbnail_url || "",
            media_urls: (project.media_urls || []).join("\n"),
            video_embed_url: project.video_embed_url || "",
            project_year: project.project_year || "",
            is_featured: Boolean(project.is_featured),
            display_order: project.display_order ?? 0,
        });

        setImage(null);
        setGalleryImages([]);
        setMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        setForm(createEmptyProject());
        setEditingId(null);
        setImage(null);
        setGalleryImages([]);
    }

    async function uploadImage(file) {
        const result = await uploadProjectImage(file);
        return result.imageUrl;
    }

    async function handleSave(event) {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            let thumbnailUrl = form.thumbnail_url;

            let mediaUrls = form.media_urls
                .split("\n")
                .map((url) => url.trim())
                .filter(Boolean);

            if (image) {
                thumbnailUrl = await uploadImage(image);
            }

            if (galleryImages.length > 0) {
                const uploadedGallery = await Promise.all(
                    galleryImages.map((file) => uploadImage(file))
                );

                mediaUrls = [...mediaUrls, ...uploadedGallery];
            }

            const payload = {
                ...form,
                slug: form.slug || slugify(form.title),
                thumbnail_url: thumbnailUrl,
                tools: form.tools
                    .split(",")
                    .map((tool) => tool.trim())
                    .filter(Boolean),
                media_urls: mediaUrls,
                project_year: form.project_year
                    ? Number(form.project_year)
                    : null,
                display_order: Number(form.display_order) || 0,
                is_featured: Boolean(form.is_featured),
            };

            const wasEditing = Boolean(editingId);

            await saveProject(editingId, payload);
            await loadProjects();

            resetForm();

            setMessage(
                wasEditing
                    ? "Proyek berhasil diperbarui."
                    : "Proyek berhasil ditambahkan."
            );
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(project) {
        const confirmed = window.confirm(
            `Hapus proyek "${project.title}"?`
        );

        if (!confirmed) return;

        try {
            await deleteProject(project.id);
            await loadProjects();

            if (editingId === project.id) {
                resetForm();
            }

            setMessage("Proyek berhasil dihapus.");
        } catch (error) {
            setMessage(error.message);
        }
    }

    const visibleProjects =
        filter === "Semua"
            ? projects
            : projects.filter(
                (project) => project.main_category === filter
            );

    if (loading) {
        return (
            <main className="admin-page">
                Memuat dashboard...
            </main>
        );
    }

    if (!loggedIn) {
        return (
            <main className="admin-page">
                <form
                    className="admin-panel admin-login"
                    onSubmit={handleLogin}
                >
                    <h1>Admin Login</h1>
                    <p>Maiharsa Portfolio</p>

                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    {message && <p role="alert">{message}</p>}

                    <button type="submit">Login</button>
                    <a href="/">Kembali ke portofolio</a>
                </form>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <header className="admin-header">
                <div>
                    <h1>Portfolio Admin</h1>
                    <p>Kelola karya portofolio kamu.</p>
                </div>

                <div className="admin-actions">
                    <a href="/" target="_blank" rel="noreferrer">
                        Lihat portofolio
                    </a>

                    <button type="button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {message && (
                <p className="admin-message" role="status">
                    {message}
                </p>
            )}

            <section className="admin-panel">
                <h2>Furokidz Content</h2>
                <p>Kelola konten yang tampil pada halaman Furokidz.</p>
                {furokidzMessage && <p className="admin-message" role="status">{furokidzMessage}</p>}
                <form className="admin-form" onSubmit={handleSaveFurokidz}>
                    <h3>{editingFurokidzId ? "Edit Konten Furokidz" : "Tambah Konten Furokidz"}</h3>
                    <div className="admin-fields">
                        <label>Judul konten<input value={furokidzForm.title} onChange={(e) => updateFurokidzField("title", e.target.value)} required /></label>
                        <label>Platform<select value={furokidzForm.platform} onChange={(e) => updateFurokidzField("platform", e.target.value)} required>
                            <option>Instagram</option><option>YouTube</option><option>TikTok</option><option>Vimeo</option><option>Other</option>
                        </select></label>
                        <label>URL konten<input type="url" value={furokidzForm.content_url} onChange={(e) => updateFurokidzField("content_url", e.target.value)} placeholder="https://..." required /></label>
                        <label>Jumlah views<input value={furokidzForm.views_count} onChange={(e) => updateFurokidzField("views_count", e.target.value)} placeholder="Contoh: 12.5K" /></label>
                        <label>Tanggal publikasi<input type="date" value={furokidzForm.published_at} onChange={(e) => updateFurokidzField("published_at", e.target.value)} /></label>
                        <label>Urutan tampilan<input type="number" value={furokidzForm.display_order} onChange={(e) => updateFurokidzField("display_order", e.target.value)} /></label>
                    </div>
                    <label>Upload thumbnail<input type="file" accept="image/*" onChange={(e) => setFurokidzImage(e.target.files?.[0] || null)} /></label>
                    {furokidzForm.thumbnail_url && <img className="admin-preview" src={furokidzForm.thumbnail_url} alt="Thumbnail Furokidz" />}
                    <label>URL thumbnail (opsional jika upload gambar)<input type="url" value={furokidzForm.thumbnail_url} onChange={(e) => updateFurokidzField("thumbnail_url", e.target.value)} placeholder="https://..." /></label>
                    <div className="admin-actions">
                        <button type="submit" disabled={furokidzSaving}>{furokidzSaving ? "Menyimpan..." : editingFurokidzId ? "Simpan Perubahan" : "Tambah Konten"}</button>
                        {editingFurokidzId && <button type="button" onClick={resetFurokidzForm}>Batal Edit</button>}
                    </div>
                </form>
                <h3>Daftar Konten ({furokidzItems.length})</h3>
                {furokidzItems.length === 0 && <p>Belum ada konten Furokidz.</p>}
                {furokidzItems.map((item) => <article className="admin-project" key={item.id}>
                    {item.thumbnail_url && <img src={item.thumbnail_url} alt="" />}
                    <div className="admin-project-info"><strong>{item.title}</strong><span>{item.platform}{item.views_count ? ` · ${item.views_count} views` : ""}</span><small>{item.content_url}</small></div>
                    <div className="admin-actions"><button type="button" onClick={() => editFurokidz(item)}>Edit</button><button type="button" onClick={() => handleDeleteFurokidz(item)}>Hapus</button></div>
                </article>)}
            </section>

            <section className="admin-panel">
                <h2>Experience & Organization</h2>
                <p>Kelola pengalaman dan organisasi yang tampil di halaman About.</p>
                {experienceMessage && (
                    <p className="admin-message" role="status">
                        {experienceMessage}
                    </p>
                )}

                <form className="admin-form" onSubmit={handleSaveExperience}>
                    <h3>{editingExperienceId ? "Edit Pengalaman" : "Tambah Pengalaman"}</h3>
                    <div className="admin-fields">
                        <label>
                            Organisasi / Perusahaan
                            <input value={experienceForm.organization} onChange={(event) => updateExperienceField("organization", event.target.value)} required />
                        </label>
                        <label>
                            Jabatan / Peran
                            <input value={experienceForm.role_title} onChange={(event) => updateExperienceField("role_title", event.target.value)} required />
                        </label>
                        <label>
                            Jenis pengalaman
                            <select value={experienceForm.exp_type} onChange={(event) => updateExperienceField("exp_type", event.target.value)} required>
                                <option value="Organization">Organization</option>
                                <option value="Work">Work</option>
                                <option value="Volunteer">Volunteer</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Internship">Internship</option>
                                <option value="Committee">Committee</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        <label>
                            Periode
                            <input value={experienceForm.period} onChange={(event) => updateExperienceField("period", event.target.value)} placeholder="Contoh: 2024 – 2025" required />
                        </label>
                        <label>
                            Urutan tampilan
                            <input type="number" value={experienceForm.display_order} onChange={(event) => updateExperienceField("display_order", event.target.value)} />
                        </label>
                    </div>
                    <label>
                        Deskripsi
                        <textarea rows="4" value={experienceForm.description} onChange={(event) => updateExperienceField("description", event.target.value)} required />
                    </label>
                    <label>
                        Pencapaian / highlight (satu poin per baris)
                        <textarea rows="4" value={experienceForm.highlights} onChange={(event) => updateExperienceField("highlights", event.target.value)} placeholder={"Mengelola kegiatan organisasi\nMelakukan kurasi karya"} />
                    </label>
                    <div className="admin-actions">
                        <button type="submit" disabled={experienceSaving}>
                            {experienceSaving ? "Menyimpan..." : editingExperienceId ? "Simpan Perubahan" : "Tambah Pengalaman"}
                        </button>
                        {editingExperienceId && <button type="button" onClick={resetExperienceForm}>Batal Edit</button>}
                    </div>
                </form>

                <h3>Daftar Pengalaman ({experiences.length})</h3>
                {experiences.length === 0 && <p>Belum ada pengalaman ditambahkan.</p>}
                {experiences.map((item) => (
                    <article className="admin-project" key={item.id}>
                        <div className="admin-project-info">
                            <strong>{item.role_title} — {item.organization}</strong>
                            <span>{item.period} · {item.exp_type}</span>
                            <p>{item.description}</p>
                            {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                                <ul>{item.highlights.map((highlight, index) => <li key={`${item.id}-highlight-${index}`}>{highlight}</li>)}</ul>
                            )}
                        </div>
                        <div className="admin-actions">
                            <button type="button" onClick={() => editExperience(item)}>Edit</button>
                            <button type="button" onClick={() => handleDeleteExperience(item)}>Hapus</button>
                        </div>
                    </article>
                ))}
            </section>

            <form
                className="admin-panel admin-form"
                onSubmit={handleSave}
            >
                <h2>
                    {editingId ? "Edit Proyek" : "Tambah Proyek"}
                </h2>

                <div className="admin-fields">
                    <label>
                        Judul karya
                        <input
                            value={form.title}
                            onChange={(event) => {
                                const title = event.target.value;

                                setForm((previous) => ({
                                    ...previous,
                                    title,
                                    slug: editingId
                                        ? previous.slug
                                        : slugify(title),
                                }));
                            }}
                            required
                        />
                    </label>

                    <label>
                        Slug / URL
                        <input
                            value={form.slug}
                            onChange={(event) =>
                                updateField(
                                    "slug",
                                    slugify(event.target.value)
                                )
                            }
                            required
                        />
                    </label>

                    {/* KATEGORI UTAMA */}
                    <label>
                        Kategori Utama
                        <select
                            value={form.main_category}
                            onChange={(event) =>
                                handleCategoryChange(event.target.value)
                            }
                            required
                        >
                            <option value="3D Art">3D Art</option>
                            <option value="Filmmaking">Filmmaking</option>
                            <option value="Photography">Photography</option>
                        </select>
                    </label>

                    {/* SUBKATEGORI */}
                    <label>
                        Subkategori
                        <select
                            value={form.sub_category}
                            onChange={(event) =>
                                updateField("sub_category", event.target.value)
                            }
                            required
                        >
                            <option value="" disabled>
                                Pilih subkategori
                            </option>

                            {(categories[form.main_category] || []).map(
                                (category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                )
                            )}

                            {/* Mempertahankan subkategori lama saat mengedit */}
                            {form.sub_category &&
                                !(categories[form.main_category] || []).includes(
                                    form.sub_category
                                ) && (
                                    <option value={form.sub_category}>
                                        {form.sub_category}
                                    </option>
                                )}
                        </select>
                    </label>

                    <label>
                        Role
                        <input
                            value={form.role}
                            onChange={(event) =>
                                updateField("role", event.target.value)
                            }
                            placeholder="Contoh: 3D Artist"
                        />
                    </label>

                    <label>
                        Tahun
                        <input
                            type="number"
                            value={form.project_year}
                            onChange={(event) =>
                                updateField("project_year", event.target.value)
                            }
                        />
                    </label>

                    <label>
                        Tools (pisahkan dengan koma)
                        <input
                            value={form.tools}
                            onChange={(event) =>
                                updateField("tools", event.target.value)
                            }
                            placeholder="Blender, After Effects"
                        />
                    </label>

                    <label>
                        Urutan tampilan
                        <input
                            type="number"
                            value={form.display_order}
                            onChange={(event) =>
                                updateField("display_order", event.target.value)
                            }
                        />
                    </label>
                </div>

                <label>
                    Deskripsi
                    <textarea
                        rows="4"
                        value={form.description}
                        onChange={(event) =>
                            updateField("description", event.target.value)
                        }
                    />
                </label>

                <label>
                    Upload thumbnail karya
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            setImage(event.target.files?.[0] || null)
                        }
                    />
                </label>

                {form.thumbnail_url && (
                    <img
                        className="admin-preview"
                        src={form.thumbnail_url}
                        alt="Thumbnail karya"
                    />
                )}

                <label>
                    URL thumbnail (opsional)
                    <input
                        type="url"
                        value={form.thumbnail_url}
                        onChange={(event) =>
                            updateField("thumbnail_url", event.target.value)
                        }
                        placeholder="https://..."
                    />
                </label>

                {form.main_category === "Filmmaking" && (
                    <label>
                        Link video Instagram / YouTube
                        <input
                            type="url"
                            value={form.video_embed_url}
                            onChange={(event) =>
                                updateField(
                                    "video_embed_url",
                                    event.target.value
                                )
                            }
                            placeholder="https://..."
                        />
                    </label>
                )}

                {form.main_category === "Photography" && (
                    <label>
                        URL gambar galeri (satu URL per baris)
                        <textarea
                            rows="4"
                            value={form.media_urls}
                            onChange={(event) =>
                                updateField("media_urls", event.target.value)
                            }
                            placeholder={"https://...\nhttps://..."}
                        />
                    </label>
                )}

                <label>
                    Upload gambar galeri (opsional, bisa pilih beberapa)
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) =>
                            setGalleryImages(
                                Array.from(event.target.files || [])
                            )
                        }
                    />
                </label>

                {galleryImages.length > 0 && (
                    <p>{galleryImages.length} gambar dipilih.</p>
                )}

                <label className="admin-checkbox">
                    <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(event) =>
                            updateField("is_featured", event.target.checked)
                        }
                    />
                    Proyek unggulan
                </label>

                <div className="admin-actions">
                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Menyimpan..."
                            : editingId
                                ? "Simpan Perubahan"
                                : "Tambah Proyek"}
                    </button>

                    {editingId && (
                        <button type="button" onClick={resetForm}>
                            Batal Edit
                        </button>
                    )}
                </div>
            </form>

            <section className="admin-panel">
                <h2>Daftar Proyek ({projects.length})</h2>

                <label>
                    Filter kategori
                    <select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                    >
                        <option value="Semua">Semua kategori</option>
                        <option value="3D Art">3D Art</option>
                        <option value="Filmmaking">Filmmaking</option>
                        <option value="Photography">Photography</option>
                    </select>
                </label>

                {visibleProjects.length === 0 && (
                    <p>Belum ada proyek pada kategori ini.</p>
                )}

                {visibleProjects.map((project) => (
                    <article className="admin-project" key={project.id}>
                        {project.thumbnail_url && (
                            <img src={project.thumbnail_url} alt="" />
                        )}

                        <div className="admin-project-info">
                            <strong>{project.title}</strong>

                            <span>
                                {project.main_category}
                                {project.sub_category
                                    ? ` · ${project.sub_category}`
                                    : ""}
                            </span>

                            <small>/{project.slug}</small>

                            {project.video_embed_url && (
                                <a
                                    href={project.video_embed_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Buka video
                                </a>
                            )}
                        </div>

                        <div className="admin-actions">
                            <button
                                type="button"
                                onClick={() => editProject(project)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(project)}
                            >
                                Hapus
                            </button>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}
