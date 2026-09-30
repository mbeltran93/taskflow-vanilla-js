import { getProjectsByOwner } from "../api.js";
import { showToast } from "../components/toast.js";

export async function renderProjects(root, user) {
  root.innerHTML = `
    <div class="page-header">
      <h1>Tus proyectos</h1>
    </div>
    <div id="projects-slot">
      <p class="empty-state">Cargando proyectos...</p>
    </div>
  `;

  const slot = root.querySelector("#projects-slot");

  try {
    const projects = await getProjectsByOwner(user.id);

    if (projects.length === 0) {
      slot.innerHTML = `<p class="empty-state">Todavia no tenes proyectos asignados.</p>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "projects-grid";

    for (const project of projects) {
      const a = document.createElement("a");
      a.className = "project-card";
      a.href = `#/board/${project.id}`;
      a.innerHTML = `
        <h3></h3>
        <p></p>
        <div class="project-card__meta">Ver tablero →</div>
      `;
      a.querySelector("h3").textContent = project.name;
      a.querySelector("p").textContent = project.description ?? "";
      grid.appendChild(a);
    }

    slot.innerHTML = "";
    slot.appendChild(grid);
  } catch (err) {
    slot.innerHTML = `<p class="empty-state">No se pudieron cargar los proyectos.</p>`;
    showToast("Error cargando proyectos. ¿Esta corriendo json-server?", {
      error: true
    });
    console.error(err);
  }
}
