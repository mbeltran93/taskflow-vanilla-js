let hideTimer = null;

export function showToast(message, { error = false } = {}) {
  let el = document.querySelector(".toast");
  if (el) el.remove();

  el = document.createElement("div");
  el.className = `toast${error ? " toast--error" : ""}`;
  el.textContent = message;
  document.body.appendChild(el);

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => el.remove(), 3200);
}
