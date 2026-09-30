import {
  getProject,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask
} from "../api.js";
import { STATUSES, STATUS_LABELS, groupTasksByStatus, sortByCreatedAt } from "../logic.js";
import { createTaskCard } from "../components/taskCard.js";
import { openTaskModal, confirmDialog } from "../components/taskModal.js";
import { showToast } from "../components/toast.js";

export async function renderBoard(root, user, projectId) {
  root.innerHTML = `<p class="empty-state">Cargando tablero...</p>`;

  let project;
  let tasks;
  try {
    [project, tasks] = await Promise.all([
      getProject(projectId),
      getTasksByProject(projectId)
    ]);
  } catch (err) {
    root.innerHTML = `<p class="empty-state">No se pudo cargar el proyecto.</p>`;
    showToast("Error cargando el tablero. ¿Esta corriendo json-server?", {
      error: true
    });
    console.error(err);
    return;
  }

  root.innerHTML = `
    <div class="board-header">
      <a class="back-link" href="#/projects">&larr; Proyectos</a>
      <h1></h1>
    </div>
    <div class="board" id="board"></div>
  `;
  root.querySelector(".board-header h1").textContent = project.name;

  const board = root.querySelector("#board");

  const state = { tasks: sortByCreatedAt(tasks) };

  function persistMove(task, newStatus) {
    const previous = task.status;
    task.status = newStatus; // optimista
    renderColumns();
    updateTask(task.id, { status: newStatus }).catch((err) => {
      task.status = previous; // revertir si falla
      renderColumns();
      showToast("No se pudo mover la tarea.", { error: true });
      console.error(err);
    });
  }

  function handleEdit(task) {
    openTaskModal({
      task,
      onSubmit: async ({ title, description }) => {
        const previous = { ...task };
        task.title = title;
        task.description = description;
        renderColumns();
        try {
          await updateTask(task.id, { title, description });
          showToast("Tarea actualizada.");
        } catch (err) {
          Object.assign(task, previous);
          renderColumns();
          showToast("No se pudo guardar la tarea.", { error: true });
          console.error(err);
        }
      }
    });
  }

  function handleDelete(task) {
    if (!confirmDialog(`¿Eliminar la tarea "${task.title}"?`)) return;
    const idx = state.tasks.findIndex((t) => t.id === task.id);
    const [removed] = state.tasks.splice(idx, 1);
    renderColumns();
    deleteTask(task.id).catch((err) => {
      state.tasks.splice(idx, 0, removed);
      renderColumns();
      showToast("No se pudo eliminar la tarea.", { error: true });
      console.error(err);
    });
  }

  function handleCreate(status) {
    openTaskModal({
      onSubmit: async ({ title, description }) => {
        const tempId = `tmp-${Date.now()}`;
        const optimisticTask = {
          id: tempId,
          projectId,
          title,
          description,
          status,
          createdAt: new Date().toISOString()
        };
        state.tasks.push(optimisticTask);
        renderColumns();
        try {
          const saved = await createTask({
            projectId,
            title,
            description,
            status,
            createdAt: optimisticTask.createdAt
          });
          const idx = state.tasks.findIndex((t) => t.id === tempId);
          state.tasks[idx] = saved;
          renderColumns();
          showToast("Tarea creada.");
        } catch (err) {
          state.tasks = state.tasks.filter((t) => t.id !== tempId);
          renderColumns();
          showToast("No se pudo crear la tarea.", { error: true });
          console.error(err);
        }
      }
    });
  }

  function renderColumns() {
    const groups = groupTasksByStatus(state.tasks);
    board.innerHTML = "";

    for (const status of STATUSES) {
      const column = document.createElement("section");
      column.className = "column";
      column.dataset.status = status;
      column.innerHTML = `
        <div class="column__header">
          <span class="column__title">${STATUS_LABELS[status]}</span>
          <span class="column__count">${groups[status].length}</span>
        </div>
        <div class="column__list"></div>
        <button type="button" class="column__add">+ Agregar tarea</button>
      `;

      const list = column.querySelector(".column__list");
      for (const task of groups[status]) {
        list.appendChild(
          createTaskCard(task, {
            onEdit: handleEdit,
            onDelete: handleDelete,
            onMove: (t, newStatus) => persistMove(t, newStatus)
          })
        );
      }

      column
        .querySelector(".column__add")
        .addEventListener("click", () => handleCreate(status));

      // Drag & drop nativo HTML5 sobre la columna
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        column.classList.add("drag-over");
      });
      column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drag-over");
        const taskId = e.dataTransfer.getData("text/plain");
        const task = state.tasks.find((t) => t.id === taskId);
        if (task && task.status !== status) {
          persistMove(task, status);
        }
      });

      board.appendChild(column);
    }
  }

  renderColumns();
}
