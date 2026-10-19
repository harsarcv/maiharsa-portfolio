
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
    getContactMessages,
    markContactRead,
    markContactUnread,
    deleteContactMessage,
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

const createEmptyExperience = () => ({
    organization: "",
    role_title: "",
    exp_type: "Organization",
    period: "",
    description: "",
    highlights: "",
    display_order: 0,
});

const createEmptyFurokidz = () => ({
    title: "",
    platform: "Instagram",
    content_url: "",
    thumbnail_url: "",
    views_count: "",
    published_at: "",
    display_order: 0,
});

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Projects
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState(createEmptyProject);
    const [editingId, setEditingId] = useState(null);
    const [image, setImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState("Semua");

    // Login
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // Experiences
    const [experiences, setExperiences] = useState([]);
    const [experienceForm, setExperienceForm] = useState(
        createEmptyExperience
    );
    const [editingExperienceId, setEditingExperienceId] = useState(null);
    const [experienceSaving, setExperienceSaving] = useState(false);
    const [experienceMessage, setExperienceMessage] = useState("");

    // Furokidz
    const [furokidzItems, setFurokidzItems] = useState([]);
    const [furokidzForm, setFurokidzForm] = useState(
        createEmptyFurokidz
    );
    const [editingFurokidzId, setEditingFurokidzId] = useState(null);
    const [furokidzImage, setFurokidzImage] = useState(null);
    const [furokidzSaving, setFurokidzSaving] = useState(false);
    const [furokidzMessage, setFurokidzMessage] = useState("");

    // Contact inbox
    const [contactMessages, setContactMessages] = useState([]);
    const [contactMessage, setContactMessage] = useState("");
    const [contactLoading, setContactLoading] = useState(false);

    const isPhotography = form.main_category === "Photography";

    useEffect(() => {
        const previews = galleryImages.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setPhotoPreviews(previews);

        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [galleryImages]);

    // =========================================================
    // PROJECT HELPERS
    // =========================================================

    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    function resetForm() {
        setForm(createEmptyProject());
        setEditingId(null);
        setImage(null);
        setGalleryImages([]);
    }

    function handleCategoryChange(category) {
        setForm((previous) => ({
            ...previous,
            main_category: category,
            sub_category: categories[category]?.[0] || "",
            media_urls:
                category === "Photography"
                    ? ""
                    : previous.media_urls,
            video_embed_url:
                category === "Filmmaking"
                    ? previous.video_embed_url
                    : "",
        }));

        // Photography hanya menggunakan satu thumbnail.
        if (category === "Photography") {
            setGalleryImages([]);
        }
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

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function uploadImage(file) {
        const result = await uploadProjectImage(file);
        return result.imageUrl;
    }

    async function loadProjects() {
        const result = await getAdminProjects();

        const data = Array.isArray(result)
            ? result
            : result.data || result.projects || [];

        setProjects(data);
    }

    async function handleSave(event) {
        event.preventDefault();
        setMessage("");

        if (isPhotography) {
            const selectedPhotos = editingId
                ? (image ? [image] : [])
                : galleryImages;

            if (editingId && selectedPhotos.length === 0 && !form.thumbnail_url) {
                setMessage("Pilih foto baru atau batalkan edit.");
                return;
            }

            if (!editingId && selectedPhotos.length === 0) {
                setMessage("Pilih satu atau beberapa foto terlebih dahulu.");
                return;
            }

            setSaving(true);

            try {
                if (editingId) {
                    const thumbnailUrl = image
                        ? await uploadImage(image)
                        : form.thumbnail_url;

                    const payload = {
                        ...form,
                        title: form.title || `Foto ${editingId}`,
                        slug: form.slug || `photo-${editingId}`,
                        main_category: "Photography",
                        sub_category: "Other",
                        description: "Photography",
                        role: "",
                        tools: [],
                        thumbnail_url: thumbnailUrl,
                        media_urls: [],
                        video_embed_url: "",
                        project_year: new Date().getFullYear(),
                        display_order: Number(form.display_order) || 0,
                        is_featured: false,
                    };

                    await saveProject(editingId, payload);
                    await loadProjects();
                    resetForm();
                    setMessage("Foto berhasil diperbarui.");
                } else {
                    let savedCount = 0;

                    for (let index = 0; index < selectedPhotos.length; index += 1) {
                        const file = selectedPhotos[index];
                        const uploadedUrl = await uploadImage(file);
                        const fileTitle = file.name.replace(/\.[^/.]+$/, "").trim() || "Foto";
                        const uniqueSuffix = `${Date.now()}-${index + 1}`;

                        const payload = {
                            ...form,
                            title: fileTitle,
                            slug: `${slugify(fileTitle) || "photo"}-${uniqueSuffix}`,
                            main_category: "Photography",
                            sub_category: "Other",
                            description: "Photography",
                            role: "",
                            tools: [],
                            thumbnail_url: uploadedUrl,
                            media_urls: [],
                            video_embed_url: "",
                            project_year: new Date().getFullYear(),
                            display_order: (Number(form.display_order) || 0) + index,
                            is_featured: false,
                        };

                        await saveProject(null, payload);
                        savedCount += 1;
                    }

                    await loadProjects();
                    resetForm();
                    setMessage(`${savedCount} foto berhasil ditambahkan sebagai card terpisah.`);
                }
            } catch (error) {
                setMessage(error.message || "Gagal menyimpan foto.");
            } finally {
                setSaving(false);
            }

            return;
        }

        setSaving(true);

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
                description: form.description?.trim() || "",
                tools: form.tools
                    .split(",")
                    .map((tool) => tool.trim())
                    .filter(Boolean),
                media_urls: mediaUrls,
                project_year: form.project_year ? Number(form.project_year) : null,
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
            setMessage(error.message || "Gagal menyimpan proyek.");
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
            setMessage(error.message || "Gagal menghapus proyek.");
        }
    }

    // =========================================================
    // EXPERIENCE HELPERS
    // =========================================================

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

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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
                display_order:
                    Number(experienceForm.display_order) || 0,
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
            setExperienceMessage(
                error.message || "Gagal menyimpan pengalaman."
            );
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

            if (editingExperienceId === item.id) {
                resetExperienceForm();
            }

            setExperienceMessage("Pengalaman berhasil dihapus.");
        } catch (error) {
            setExperienceMessage(
                error.message || "Gagal menghapus pengalaman."
            );
        }
    }

    // =========================================================
    // FUROKIDZ HELPERS
    // =========================================================

    const updateFurokidzField = (field, value) => {
        setFurokidzForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    async function loadFurokidz() {
        const result = await getAdminFurokidz();

        setFurokidzItems(
            Array.isArray(result)
                ? result
                : result.data || result.items || []
        );
    }

    function resetFurokidzForm() {
        setFurokidzForm(createEmptyFurokidz());
        setEditingFurokidzId(null);
        setFurokidzImage(null);
    }

    function editFurokidz(item) {
        setEditingFurokidzId(item.id);

        setFurokidzForm({
            title: item.title || "",
            platform: item.platform || "Instagram",
            content_url: item.content_url || "",
            thumbnail_url: item.thumbnail_url || "",
            views_count: item.views_count || "",
            published_at: item.published_at
                ? String(item.published_at).slice(0, 10)
                : "",
            display_order: item.display_order ?? 0,
        });

        setFurokidzImage(null);
        setFurokidzMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSaveFurokidz(event) {
        event.preventDefault();

        setFurokidzSaving(true);
        setFurokidzMessage("");

        try {
            let thumbnailUrl = furokidzForm.thumbnail_url;

            if (furokidzImage) {
                thumbnailUrl = await uploadImage(furokidzImage);
            }

            const wasEditing = Boolean(editingFurokidzId);

            await saveFurokidz(editingFurokidzId, {
                ...furokidzForm,
                thumbnail_url: thumbnailUrl,
                published_at: furokidzForm.published_at || null,
                display_order:
                    Number(furokidzForm.display_order) || 0,
            });

            await loadFurokidz();
            resetFurokidzForm();

            setFurokidzMessage(
                wasEditing
                    ? "Konten Furokidz berhasil diperbarui."
                    : "Konten Furokidz berhasil ditambahkan."
            );
        } catch (error) {
            setFurokidzMessage(
                error.message || "Gagal menyimpan konten."
            );
        } finally {
            setFurokidzSaving(false);
        }
    }

    async function handleDeleteFurokidz(item) {
        if (!window.confirm(`Hapus konten "${item.title}"?`)) {
            return;
        }

        try {
            await deleteFurokidz(item.id);
            await loadFurokidz();

            if (editingFurokidzId === item.id) {
                resetFurokidzForm();
            }

            setFurokidzMessage("Konten Furokidz berhasil dihapus.");
        } catch (error) {
            setFurokidzMessage(
                error.message || "Gagal menghapus konten."
            );
        }
    }

    // =========================================================
    // CONTACT INBOX HELPERS
    // =========================================================

    async function loadContactMessages() {
        setContactLoading(true);

        try {
            const data = await getContactMessages();

            setContactMessages(
                Array.isArray(data)
                    ? data
                    : data.data || data.messages || []
            );

            setContactMessage("");
        } catch (error) {
            setContactMessage(
                error.message || "Gagal memuat pesan."
            );
        } finally {
            setContactLoading(false);
        }
    }

    async function handleToggleRead(item) {
        try {
            if (item.is_read) {
                await markContactUnread(item.id);
            } else {
                await markContactRead(item.id);
            }

            await loadContactMessages();
        } catch (error) {
            setContactMessage(
                error.message || "Gagal memperbarui status pesan."
            );
        }
    }

    async function handleDeleteContact(item) {
        const confirmed = window.confirm(
            `Hapus pesan dari "${item.sender_name}"?`
        );

        if (!confirmed) return;

        try {
            await deleteContactMessage(item.id);
            await loadContactMessages();

            setContactMessage("Pesan berhasil dihapus.");
        } catch (error) {
            setContactMessage(
                error.message || "Gagal menghapus pesan."
            );
        }
    }

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    useEffect(() => {
        checkAdmin()
            .then(async () => {
                setLoggedIn(true);

                await Promise.all([
                    loadProjects(),
                    loadExperiences(),
                    loadFurokidz(),
                    loadContactMessages(),
                ]);
            })
            .catch(() => {
                setLoggedIn(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    async function handleLogin(event) {
        event.preventDefault();
        setMessage("");

        try {
            await adminLogin({
                username,
                password,
            });

            setLoggedIn(true);
            setPassword("");

            await Promise.all([
                loadProjects(),
                loadExperiences(),
                loadFurokidz(),
                loadContactMessages(),
            ]);
        } catch (error) {
            setMessage(error.message || "Login gagal.");
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
            setContactMessages([]);

            resetForm();
            resetExperienceForm();
            resetFurokidzForm();
        }
    }

    const visibleProjects =
        filter === "Semua"
            ? projects
            : projects.filter(
                (project) => project.main_category === filter
            );

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main className="admin-page">
                Memuat dashboard...
            </main>
        );
    }

    // =========================================================
    // LOGIN PAGE
    // =========================================================

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

                    {message && (
                        <p role="alert">{message}</p>
                    )}

                    <button type="submit">
                        Login
                    </button>

                    <a href="/">
                        Kembali ke portofolio
                    </a>
                </form>
            </main>
        );
    }

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    return (
        <main className="admin-page">
            <style>{`
                .admin-photo-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 16px;
                    align-items: start;
                    margin-top: 18px;
                }

                .admin-photo-project {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 100%;
                    min-width: 0;
                    padding: 10px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #fff;
                    box-sizing: border-box;
                }

                .admin-photo-project > img,
                .admin-photo-placeholder {
                    display: block;
                    width: 100%;
                    aspect-ratio: 4 / 5;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .admin-photo-placeholder {
                    display: grid;
                    place-items: center;
                    background: #f1f1f1;
                    color: #555;
                    font-size: 13px;
                    text-align: center;
                }

                .admin-photo-project .admin-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .admin-photo-project .admin-actions > button {
                    flex: 1;
                    min-width: 0;
                }

                @media (max-width: 1000px) {
                    .admin-photo-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 700px) {
                    .admin-photo-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 10px;
                    }
                }

                @media (max-width: 420px) {
                    .admin-photo-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 7px;
                    }

                    .admin-photo-project {
                        padding: 6px;
                    }
                }
            `}</style>
            <header className="admin-header">
                <div>
                    <h1>Portfolio Admin</h1>
                    <p>Kelola karya portofolio kamu.</p>
                </div>

                <div className="admin-actions">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Lihat portofolio
                    </a>

                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {message && (
                <p
                    className="admin-message"
                    role="status"
                >
                    {message}
                </p>
            )}

            {/* =================================================
                CONTACT INBOX
            ================================================= */}

            <section className="admin-panel">
                <h2>
                    Inbox Contact (
                    {
                        contactMessages.filter(
                            (item) => !item.is_read
                        ).length
                    }{" "}
                    belum dibaca)
                </h2>

                <p>
                    Pesan yang dikirim melalui formulir Contact
                    portofolio.
                </p>

                {contactMessage && (
                    <p
                        className="admin-message"
                        role="status"
                    >
                        {contactMessage}
                    </p>
                )}

                <button
                    type="button"
                    onClick={loadContactMessages}
                    disabled={contactLoading}
                >
                    {contactLoading
                        ? "Memuat..."
                        : "Refresh pesan"}
                </button>

                {contactLoading && (
                    <p>Memuat pesan...</p>
                )}

                {!contactLoading &&
                    contactMessages.length === 0 && (
                        <p>Belum ada pesan masuk.</p>
                    )}

                {contactMessages.map((item) => (
                    <article
                        className="admin-project"
                        key={item.id}
                    >
                        <div className="admin-project-info">
                            <strong>
                                {item.sender_name}
                                {!item.is_read && " · BARU"}
                            </strong>

                            <span>{item.inquiry_type}</span>

                            <a
                                href={`mailto:${item.sender_email}`}
                            >
                                {item.sender_email}
                            </a>

                            <small>
                                {new Date(
                                    item.submitted_at
                                ).toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </small>

                            <p
                                style={{
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {item.message}
                            </p>
                        </div>

                        <div className="admin-actions">
                            <button
                                type="button"
                                onClick={() =>
                                    handleToggleRead(item)
                                }
                            >
                                {item.is_read
                                    ? "Tandai belum dibaca"
                                    : "Tandai dibaca"}
                            </button>

                            <a
                                className="button-secondary"
                                href={`mailto:${item.sender_email}?subject=${encodeURIComponent(
                                    `Re: ${item.inquiry_type} - Portfolio`
                                )}`}
                            >
                                Balas email
                            </a>

                            <button
                                type="button"
                                onClick={() =>
                                    handleDeleteContact(item)
                                }
                            >
                                Hapus
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {/* =================================================
                FUROKIDZ CONTENT
            ================================================= */}

            <section className="admin-panel">
                <h2>Furokidz Content</h2>

                <p>
                    Kelola konten yang tampil pada halaman
                    Furokidz.
                </p>

                {furokidzMessage && (
                    <p
                        className="admin-message"
                        role="status"
                    >
                        {furokidzMessage}
                    </p>
                )}

                <form
                    className="admin-form"
                    onSubmit={handleSaveFurokidz}
                >
                    <h3>
                        {editingFurokidzId
                            ? "Edit Konten Furokidz"
                            : "Tambah Konten Furokidz"}
                    </h3>

                    <div className="admin-fields">
                        <label>
                            Judul konten
                            <input
                                value={furokidzForm.title}
                                onChange={(event) =>
                                    updateFurokidzField(
                                        "title",
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label>
                            Platform
                            <select
                                value={furokidzForm.platform}
                                onChange={(event) =>
                                    updateFurokidzField(
                                        "platform",
                                        event.target.value
                                    )
                                }
                                required
                            >
                                <option>Instagram</option>
                                <option>YouTube</option>
                                <option>TikTok</option>
                                <option>Vimeo</option>
                                <option>Other</option>
                            </select>
                        </label>

                        <label>
                            URL konten
                            <input
                                type="url"
                                value={furokidzForm.content_url}
                                onChange={(event) =>
                                    updateFurokidzField(
                                        "content_url",
                                        event.target.value
                                    )
                                }
                                placeholder="https://..."
                                required
                            />
                        </label>

                        <label>
                            Jumlah views
                            <input
                                value={furokidzForm.views_count}
                                onChange={(event) =>
                                    updateFurokidzField(
                                        "views_count",
                                        event.target.value
                                    )
                                }
                                placeholder="Contoh: 12.5K"
                            />
                        </label>

                        <label>
                            Tanggal publikasi
                            <input
                                type="date"
                                value={furokidzForm.published_at}
                                onChange={(event) =>
                                    updateFurokidzField(
                                        "published_at",
                                        event.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            Urutan tampilan
                            <input
                                type="number"
                                value={furokidzForm.display_order}
                                onChange={(event) =>
                                    updateFurokidzField(
                                        "display_order",
                                        event.target.value
                                    )
                                }
                            />
                        </label>
                    </div>

                    <label>
                        Upload thumbnail
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setFurokidzImage(
                                    event.target.files?.[0] || null
                                )
                            }
                        />
                    </label>

                    {furokidzForm.thumbnail_url && (
                        <img
                            className="admin-preview"
                            src={furokidzForm.thumbnail_url}
                            alt="Thumbnail Furokidz"
                        />
                    )}

                    <label>
                        URL thumbnail
                        (opsional jika upload gambar)
                        <input
                            type="url"
                            value={furokidzForm.thumbnail_url}
                            onChange={(event) =>
                                updateFurokidzField(
                                    "thumbnail_url",
                                    event.target.value
                                )
                            }
                            placeholder="https://..."
                        />
                    </label>

                    <div className="admin-actions">
                        <button
                            type="submit"
                            disabled={furokidzSaving}
                        >
                            {furokidzSaving
                                ? "Menyimpan..."
                                : editingFurokidzId
                                    ? "Simpan Perubahan"
                                    : "Tambah Konten"}
                        </button>

                        {editingFurokidzId && (
                            <button
                                type="button"
                                onClick={resetFurokidzForm}
                            >
                                Batal Edit
                            </button>
                        )}
                    </div>
                </form>

                <h3>
                    Daftar Konten ({furokidzItems.length})
                </h3>

                {furokidzItems.length === 0 && (
                    <p>Belum ada konten Furokidz.</p>
                )}

                {furokidzItems.map((item) => (
                    <article
                        className="admin-project"
                        key={item.id}
                    >
                        {item.thumbnail_url && (
                            <img
                                src={item.thumbnail_url}
                                alt=""
                            />
                        )}

                        <div className="admin-project-info">
                            <strong>{item.title}</strong>

                            <span>
                                {item.platform}
                                {item.views_count
                                    ? ` · ${item.views_count} views`
                                    : ""}
                            </span>

                            <small>{item.content_url}</small>
                        </div>

                        <div className="admin-actions">
                            <button
                                type="button"
                                onClick={() =>
                                    editFurokidz(item)
                                }
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleDeleteFurokidz(item)
                                }
                            >
                                Hapus
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {/* =================================================
                EXPERIENCE & ORGANIZATION
            ================================================= */}

            <section className="admin-panel">
                <h2>Experience & Organization</h2>

                <p>
                    Kelola pengalaman dan organisasi yang tampil
                    di halaman About.
                </p>

                {experienceMessage && (
                    <p
                        className="admin-message"
                        role="status"
                    >
                        {experienceMessage}
                    </p>
                )}

                <form
                    className="admin-form"
                    onSubmit={handleSaveExperience}
                >
                    <h3>
                        {editingExperienceId
                            ? "Edit Pengalaman"
                            : "Tambah Pengalaman"}
                    </h3>

                    <div className="admin-fields">
                        <label>
                            Organisasi / Perusahaan
                            <input
                                value={experienceForm.organization}
                                onChange={(event) =>
                                    updateExperienceField(
                                        "organization",
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label>
                            Jabatan / Peran
                            <input
                                value={experienceForm.role_title}
                                onChange={(event) =>
                                    updateExperienceField(
                                        "role_title",
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label>
                            Jenis pengalaman
                            <select
                                value={experienceForm.exp_type}
                                onChange={(event) =>
                                    updateExperienceField(
                                        "exp_type",
                                        event.target.value
                                    )
                                }
                                required
                            >
                                <option value="Organization">
                                    Organization
                                </option>
                                <option value="Work">Work</option>
                                <option value="Volunteer">
                                    Volunteer
                                </option>
                                <option value="Freelance">
                                    Freelance
                                </option>
                                <option value="Internship">
                                    Internship
                                </option>
                                <option value="Committee">
                                    Committee
                                </option>
                                <option value="Other">Other</option>
                            </select>
                        </label>

                        <label>
                            Periode
                            <input
                                value={experienceForm.period}
                                onChange={(event) =>
                                    updateExperienceField(
                                        "period",
                                        event.target.value
                                    )
                                }
                                placeholder="Contoh: 2024 – 2025"
                                required
                            />
                        </label>

                        <label>
                            Urutan tampilan
                            <input
                                type="number"
                                value={experienceForm.display_order}
                                onChange={(event) =>
                                    updateExperienceField(
                                        "display_order",
                                        event.target.value
                                    )
                                }
                            />
                        </label>
                    </div>

                    <label>
                        Deskripsi
                        <textarea
                            rows="4"
                            value={experienceForm.description}
                            onChange={(event) =>
                                updateExperienceField(
                                    "description",
                                    event.target.value
                                )
                            }
                            required
                        />
                    </label>

                    <label>
                        Pencapaian / highlight
                        (satu poin per baris)
                        <textarea
                            rows="4"
                            value={experienceForm.highlights}
                            onChange={(event) =>
                                updateExperienceField(
                                    "highlights",
                                    event.target.value
                                )
                            }
                            placeholder={
                                "Mengelola kegiatan organisasi\nMelakukan kurasi karya"
                            }
                        />
                    </label>

                    <div className="admin-actions">
                        <button
                            type="submit"
                            disabled={experienceSaving}
                        >
                            {experienceSaving
                                ? "Menyimpan..."
                                : editingExperienceId
                                    ? "Simpan Perubahan"
                                    : "Tambah Pengalaman"}
                        </button>

                        {editingExperienceId && (
                            <button
                                type="button"
                                onClick={resetExperienceForm}
                            >
                                Batal Edit
                            </button>
                        )}
                    </div>
                </form>

                <h3>
                    Daftar Pengalaman ({experiences.length})
                </h3>

                {experiences.length === 0 && (
                    <p>Belum ada pengalaman ditambahkan.</p>
                )}

                {experiences.map((item) => (
                    <article
                        className="admin-project"
                        key={item.id}
                    >
                        <div className="admin-project-info">
                            <strong>
                                {item.role_title} — {item.organization}
                            </strong>

                            <span>
                                {item.period} · {item.exp_type}
                            </span>

                            <p>{item.description}</p>

                            {Array.isArray(item.highlights) &&
                                item.highlights.length > 0 && (
                                    <ul>
                                        {item.highlights.map(
                                            (highlight, index) => (
                                                <li
                                                    key={`${item.id}-highlight-${index}`}
                                                >
                                                    {highlight}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                        </div>

                        <div className="admin-actions">
                            <button
                                type="button"
                                onClick={() =>
                                    editExperience(item)
                                }
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleDeleteExperience(item)
                                }
                            >
                                Hapus
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {/* =================================================
                PROJECT FORM
                PHOTOGRAPHY = SINGLE PHOTO MODE
                OTHER CATEGORIES = FULL FORM
            ================================================= */}

            <form
                className="admin-panel admin-form"
                onSubmit={handleSave}
            >
                <h2>
                    {editingId ? "Edit Proyek" : "Tambah Proyek"}
                </h2>

                {isPhotography && (
                    <p>
                        Upload foto langsung. Cukup pilih subkategori
                        dan satu foto; judul dibuat otomatis dari nama file.
                    </p>
                )}

                <div className="admin-fields">
                    {/* Judul dan slug hanya untuk kategori lain */}
                    {!isPhotography && (
                        <>
                            <label>
                                Judul karya
                                <input
                                    value={form.title}
                                    onChange={(event) => {
                                        const title =
                                            event.target.value;

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
                        </>
                    )}

                    {/* Kategori utama selalu ditampilkan */}
                    <label>
                        Kategori Utama
                        <select
                            value={form.main_category}
                            onChange={(event) =>
                                handleCategoryChange(
                                    event.target.value
                                )
                            }
                            required
                        >
                            <option value="3D Art">3D Art</option>
                            <option value="Filmmaking">
                                Filmmaking
                            </option>
                            <option value="Photography">
                                Photography
                            </option>
                        </select>
                    </label>

                    {/* Foto tidak memerlukan pilihan subkategori */}
                    {!isPhotography && (
                        <label>
                            Subkategori
                            <select
                                value={form.sub_category}
                                onChange={(event) =>
                                    updateField("sub_category", event.target.value)
                                }
                                required
                            >
                                {(categories[form.main_category] || []).map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                                {form.sub_category &&
                                    !(categories[form.main_category] || []).includes(form.sub_category) && (
                                        <option value={form.sub_category}>{form.sub_category}</option>
                                    )}
                            </select>
                        </label>
                    )}

                    {/* Field tambahan hanya untuk kategori lain */}
                    {!isPhotography && (
                        <>
                            <label>
                                Role
                                <input
                                    value={form.role}
                                    onChange={(event) =>
                                        updateField(
                                            "role",
                                            event.target.value
                                        )
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
                                        updateField(
                                            "project_year",
                                            event.target.value
                                        )
                                    }
                                />
                            </label>

                            <label>
                                Tools (pisahkan dengan koma)
                                <input
                                    value={form.tools}
                                    onChange={(event) =>
                                        updateField(
                                            "tools",
                                            event.target.value
                                        )
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
                                        updateField(
                                            "display_order",
                                            event.target.value
                                        )
                                    }
                                />
                            </label>
                        </>
                    )}
                </div>

                {/* =================================================
                    PHOTOGRAPHY FORM
                ================================================= */}

                {isPhotography ? (
                    <>
                        <p>
                            Pilih banyak foto sekaligus. Setiap foto akan disimpan
                            sendiri dan muncul sebagai card terpisah di website.
                        </p>
                        <label>
                            {editingId ? "Ganti foto" : "Pilih foto (bisa banyak)"}
                            <input
                                type="file"
                                accept="image/*"
                                multiple={!editingId}
                                onChange={(event) => {
                                    const files = Array.from(event.target.files || []);
                                    if (editingId) {
                                        setImage(files[0] || null);
                                        setGalleryImages([]);
                                    } else {
                                        setGalleryImages(files);
                                        setImage(null);
                                    }
                                }}
                                required={editingId ? !form.thumbnail_url : true}
                            />
                        </label>

                        {!editingId && galleryImages.length > 0 && (
                            <div>
                                <p>{galleryImages.length} foto dipilih.</p>
                                <div className="admin-photo-grid">
                                    {photoPreviews.map((preview, index) => (
                                        <div className="admin-photo-project" key={`${preview.file.name}-${preview.file.lastModified}-${index}`}>
                                            <img
                                                src={preview.url}
                                                alt="Preview foto yang akan diunggah"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {editingId && form.thumbnail_url && (
                            <div>
                                <img
                                    className="admin-preview"
                                    src={form.thumbnail_url}
                                    alt="Foto saat ini"
                                />
                                {image && <p>Foto baru dipilih: {image.name}</p>}
                            </div>
                        )}
                    </>

                ) : (
                    <>
                        {/* =================================================
                            FULL FORM FOR 3D ART AND FILMMAKING
                        ================================================= */}

                        <label>
                            Deskripsi
                            <textarea
                                rows="4"
                                value={form.description}
                                onChange={(event) =>
                                    updateField(
                                        "description",
                                        event.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            Upload thumbnail karya
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setImage(
                                        event.target.files?.[0] || null
                                    )
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
                                    updateField(
                                        "thumbnail_url",
                                        event.target.value
                                    )
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
                                URL gambar galeri
                                (satu URL per baris)
                                <textarea
                                    rows="4"
                                    value={form.media_urls}
                                    onChange={(event) =>
                                        updateField(
                                            "media_urls",
                                            event.target.value
                                        )
                                    }
                                    placeholder={
                                        "https://...\nhttps://..."
                                    }
                                />
                            </label>
                        )}

                        <label>
                            Upload gambar galeri
                            (opsional, bisa pilih beberapa)
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) =>
                                    setGalleryImages(
                                        Array.from(
                                            event.target.files || []
                                        )
                                    )
                                }
                            />
                        </label>

                        {galleryImages.length > 0 && (
                            <p>
                                {galleryImages.length} gambar dipilih.
                            </p>
                        )}
                    </>
                )}

                {/* Fotografi hanya membutuhkan kategori, subkategori, dan foto */}
                {!isPhotography && (
                    <label className="admin-checkbox">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(event) =>
                                updateField(
                                    "is_featured",
                                    event.target.checked
                                )
                            }
                        />
                        Proyek unggulan
                    </label>
                )}

                <div className="admin-actions">
                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Menyimpan..."
                            : editingId
                                ? "Simpan Perubahan"
                                : "Tambah Proyek"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                        >
                            Batal Edit
                        </button>
                    )}
                </div>
            </form>

            {/* =================================================
                PROJECT LIST
            ================================================= */}

            <section className="admin-panel">
                <h2>
                    Daftar Proyek ({projects.length})
                </h2>

                <label>
                    Filter kategori
                    <select
                        value={filter}
                        onChange={(event) =>
                            setFilter(event.target.value)
                        }
                    >
                        <option value="Semua">
                            Semua kategori
                        </option>
                        <option value="3D Art">3D Art</option>
                        <option value="Filmmaking">
                            Filmmaking
                        </option>
                        <option value="Photography">
                            Photography
                        </option>
                    </select>
                </label>

                {visibleProjects.length === 0 && (
                    <p>
                        Belum ada proyek pada kategori ini.
                    </p>
                )}

                <div className={filter === "Photography" ? "admin-photo-grid" : ""}>
                {visibleProjects.map((project) =>
                    project.main_category === "Photography" ? (
                        <article
                            className="admin-project admin-photo-project"
                            key={project.id}
                        >
                            {project.thumbnail_url ? (
                                <img
                                    src={project.thumbnail_url}
                                    alt="Foto Photography"
                                />
                            ) : (
                                <div className="admin-photo-placeholder">
                                    Foto belum tersedia
                                </div>
                            )}

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    onClick={() => editProject(project)}
                                >
                                    Ganti Foto
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(project)}
                                >
                                    Hapus
                                </button>
                            </div>
                        </article>
                    ) : (
                        <article
                            className="admin-project"
                            key={project.id}
                        >
                            {project.thumbnail_url && (
                                <img
                                    src={project.thumbnail_url}
                                    alt=""
                                />
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
                    )
                )}
                </div>
            </section>
        </main>
    );
}
