// Crea el elemento DOM de una tarjeta de tarea a partir del <template>
// definido en index.html. Los callbacks se reciben desde afuera (boardView)
// para no acoplar este componente al fetch/API.

export function createTaskCard(task, { onEdit, onDelete, onMove }) {
  const template = document.getElementById("tpl-task-card");
  const node = template.content.firstElementChild.cloneNode(true);

  node.dataset.taskId = task.id;
  node.querySelector(".card__title").textContent = task.title;

  const descEl = node.querySelector(".card__description");
  if (task.description && task.description.trim()) {
    descEl.textContent = task.description;
  } else {
    descEl.remove();
  }

  const select = node.querySelector('[data-action="move"]');
  select.value = task.status;
  select.addEventListener("change", () => onMove(task, select.value));
  select.addEventListener("click", (e) => e.stopPropagation());

  node
    .querySelector('[data-action="edit"]')
    .addEventListener("click", () => onEdit(task));

  node
    .querySelector('[data-action="delete"]')
    .addEventListener("click", () => onDelete(task));

  // Drag and drop nativo HTML5
  node.addEventListener("dragstart", (e) => {
    node.classList.add("dragging");
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  });
  node.addEventListener("dragend", () => {
    node.classList.remove("dragging");
  });

  return node;
}
