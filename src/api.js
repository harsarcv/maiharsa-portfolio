
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

// ================================
// PUBLIC API
// ================================

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let message = `Permintaan gagal (${response.status})`;

    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => ({}));
      message = body.message || message;
    }

    throw new Error(message);
  }

  if (options.raw) return response;

  return contentType.includes("application/json")
    ? response.json()
    : response;
}

export async function getProjects({ featured, category, sub } = {}) {
  const params = new URLSearchParams();

  if (featured !== undefined) {
    params.set("featured", String(featured));
  }

  if (category) params.set("category", category);
  if (sub) params.set("sub", sub);

  const suffix = params.toString();
  const result = await request(
    `/projects${suffix ? `?${suffix}` : ""}`
  );

  return result.data || [];
}

export async function getProject(slug) {
  const result = await request(
    `/projects/${encodeURIComponent(slug)}`
  );

  return result.data;
}

export async function getExperiences() {
  const result = await request("/about");
  return result.data || [];
}

export async function getFurokidzHighlights() {
  const result = await request("/furokidz");
  return result.data || [];
}

export async function sendContact(payload) {
  return request("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCvDownloadUrl() {
  return `${API_BASE_URL}/cv/download`;
}

// ================================
// ADMIN API
// ================================

async function adminRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Gagal (${response.status})`);
  }

  return data;
}

// ADMIN AUTH

export function adminLogin(payload) {
  return adminRequest("/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function checkAdmin() {
  return adminRequest("/admin/me");
}

export function adminLogout() {
  return adminRequest("/admin/logout", {
    method: "POST",
  });
}

// ADMIN PROJECTS

export async function getAdminProjects() {
  const result = await adminRequest("/projects");
  return result.data || result.projects || result;
}

export function saveProject(id, payload) {
  return adminRequest(
    id ? `/admin/projects/${id}` : "/admin/projects",
    {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteProject(id) {
  return adminRequest(`/admin/projects/${id}`, {
    method: "DELETE",
  });
}

// UPLOAD GAMBAR


export async function uploadProjectImage(file) {
  // Minta signature dari backend
  const auth = await adminRequest("/admin/upload-signature", {
    method: "POST",
  });

  // Upload file langsung dari browser ke Cloudinary
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", auth.apiKey);
  body.append("timestamp", String(auth.timestamp));
  body.append("signature", auth.signature);
  body.append("folder", auth.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`,
    {
      method: "POST",
      body,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Gagal mengunggah gambar ke Cloudinary."
    );
  }

  return {
    imageUrl: result.secure_url,
  };
}


// ADMIN EXPERIENCES
// Path diperbaiki: /api/admin/experiences

export async function getAdminExperiences() {
  const result = await adminRequest("/admin/experiences");
  return result.data || [];
}

export function saveExperience(id, payload) {
  return adminRequest(
    id
      ? `/admin/experiences/${id}`
      : "/admin/experiences",
    {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteExperience(id) {
  return adminRequest(`/admin/experiences/${id}`, {
    method: "DELETE",
  });
}

// ADMIN FUROKIDZ

export async function getAdminFurokidz() {
  const result = await adminRequest("/admin/furokidz");
  return result.data || result.items || [];
}

export function saveFurokidz(id, payload) {
  return adminRequest(
    id
      ? `/admin/furokidz/${id}`
      : "/admin/furokidz",
    {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteFurokidz(id) {
  return adminRequest(`/admin/furokidz/${id}`, {
    method: "DELETE",
  });
}


export async function getContactMessages() {
  const result = await adminRequest("/admin/contact-messages");
  return result.data || [];
}

export function markContactRead(id) {
  return adminRequest(`/admin/contact-messages/${id}/read`, {
    method: "PATCH",
  });
}

export function markContactUnread(id) {
  return adminRequest(`/admin/contact-messages/${id}/unread`, {
    method: "PATCH",
  });
}

export function deleteContactMessage(id) {
  return adminRequest(`/admin/contact-messages/${id}`, {
    method: "DELETE",
  });
}

