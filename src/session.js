// Maneja la sesion del usuario logueado usando localStorage.
// El mock backend (json-server) no soporta JWT real, asi que el "login"
// consiste en validar email+password contra /users y persistir el usuario
// (sin el password) en localStorage.

import { sanitizeUser } from "./logic.js";

const STORAGE_KEY = "taskflow_user";

export function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeUser(user)));
}

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
