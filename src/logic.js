// Funciones puras (sin DOM, sin fetch) para poder testearlas facilmente.

export const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export const STATUS_LABELS = {
  TODO: "Por hacer",
  IN_PROGRESS: "En progreso",
  DONE: "Hecho"
};

/**
 * Agrupa una lista de tareas por su status en un objeto
 * { TODO: [...], IN_PROGRESS: [...], DONE: [...] }.
 * Las tareas con un status desconocido se ignoran.
 */
export function groupTasksByStatus(tasks) {
  const groups = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const task of tasks) {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  }
  return groups;
}

/**
 * Devuelve el siguiente status en el flujo TODO -> IN_PROGRESS -> DONE.
 * Si ya esta en DONE, se queda en DONE (no da la vuelta).
 */
export function nextStatus(status) {
  const idx = STATUSES.indexOf(status);
  if (idx === -1 || idx === STATUSES.length - 1) return status;
  return STATUSES[idx + 1];
}

/**
 * Valida que el status sea uno de los permitidos.
 */
export function isValidStatus(status) {
  return STATUSES.includes(status);
}

/**
 * Valida los campos minimos de un formulario de login.
 * Devuelve un string de error, o null si es valido.
 */
export function validateLoginInput(email, password) {
  if (!email || !email.trim()) return "El email es obligatorio.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "El email no es valido.";
  if (!password || password.length < 4) {
    return "La contraseña debe tener al menos 4 caracteres.";
  }
  return null;
}

/**
 * Valida los campos minimos de un formulario de tarea.
 */
export function validateTaskInput(title) {
  if (!title || !title.trim()) return "El titulo es obligatorio.";
  if (title.trim().length > 120) return "El titulo es demasiado largo.";
  return null;
}

/**
 * Quita el password de un objeto usuario antes de guardarlo en localStorage
 * o mostrarlo en la UI.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

/**
 * Ordena tareas por fecha de creacion ascendente (mas viejas primero).
 */
export function sortByCreatedAt(tasks) {
  return [...tasks].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
}
