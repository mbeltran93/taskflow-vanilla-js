// Cliente HTTP minimo para hablar con el mock backend (json-server).
// No usa ninguna libreria: fetch nativo + async/await.

// En desarrollo normal apunta a http://localhost:3001 (npm run server).
// Los tests end-to-end (Playwright) levantan su propia copia de json-server
// en otro puerto y sobreescriben esto con la env var VITE_API_URL para no
// tocar nunca el db.json real. Ver playwright.config.js.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) {
    let message = `Error ${res.status} al llamar ${path}`;
    try {
      const body = await res.json();
      if (body && body.message) message = body.message;
    } catch {
      /* respuesta sin json, se mantiene el mensaje generico */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---------- Users / auth ----------

export function findUserByEmail(email) {
  const query = `/users?email=${encodeURIComponent(email)}`;
  return request(query).then((users) => users[0] ?? null);
}

// ---------- Projects ----------

export function getProjectsByOwner(ownerId) {
  return request(`/projects?ownerId=${encodeURIComponent(ownerId)}`);
}

export function getProject(projectId) {
  return request(`/projects/${projectId}`);
}

// ---------- Tasks ----------

export function getTasksByProject(projectId) {
  return request(`/tasks?projectId=${encodeURIComponent(projectId)}`);
}

export function createTask(task) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(task)
  });
}

export function updateTask(id, patch) {
  return request(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}

export { API_URL };
