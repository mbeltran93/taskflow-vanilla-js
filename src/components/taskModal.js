import { validateTaskInput } from "../logic.js";

/**
 * Abre un modal para crear o editar una tarea.
 * `task` es null para creacion, o el objeto tarea para edicion.
 * `onSubmit(values)` se llama con { title, description } cuando el form
 * es valido y el usuario confirma.
 */
export function openTaskModal({ task = null, onSubmit }) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h2>${task ? "Editar tarea" : "Nueva tarea"}</h2>
      <form novalidate>
        <div class="field">
          <label for="task-title">Titulo</label>
          <input id="task-title" name="title" type="text" maxlength="120" required />
        </div>
        <div class="field">
          <label for="task-desc">Descripcion</label>
          <textarea id="task-desc" name="description" rows="3"></textarea>
        </div>
        <p class="form-error" data-role="error"></p>
        <div class="modal__actions">
          <button type="button" class="btn btn--ghost" data-role="cancel">Cancelar</button>
          <button type="submit" class="btn">${task ? "Guardar" : "Crear"}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  const titleInput = backdrop.querySelector("#task-title");
  const descInput = backdrop.querySelector("#task-desc");
  const errorEl = backdrop.querySelector('[data-role="error"]');
  const form = backdrop.querySelector("form");

  titleInput.value = task?.title ?? "";
  descInput.value = task?.description ?? "";
  titleInput.focus();

  function close() {
    backdrop.remove();
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }
  document.addEventListener("keydown", onKeydown);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector('[data-role="cancel"]').addEventListener("click", close);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const error = validateTaskInput(title);
    if (error) {
      errorEl.textContent = error;
      return;
    }
    onSubmit({ title, description });
    close();
  });

  return close;
}

export function confirmDialog(message) {
  return window.confirm(message);
}
