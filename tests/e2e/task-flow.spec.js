// Suite end-to-end con Playwright: simula a un usuario real recorriendo
// toda la app en el navegador (login -> proyectos -> tablero -> crear,
// mover, editar y borrar una tarea -> logout).
//
// Corre contra una COPIA temporal de db.json (ver run-mock-server.cjs), asi
// que nunca modifica el db.json del repo, sin importar cuantas tareas se
// creen/editen/borren durante la corrida.
//
// Los tests de este archivo son secuenciales (mode: "serial") y comparten
// una misma pagina/sesion, porque representan pasos consecutivos del mismo
// flujo de usuario: si un paso falla, los siguientes se saltan en vez de
// fallar de forma confusa por un estado a medio camino.

import { test, expect } from "@playwright/test";

const USER_EMAIL = "mariana@taskflow.dev";
const USER_PASSWORD = "demo1234";
const PROJECT_NAME = "Rediseño de la web";

const TASK_TITLE = `Tarea E2E ${Date.now()}`;
const TASK_TITLE_EDITADA = `${TASK_TITLE} (editada)`;
const TASK_DESCRIPTION = "Creada por el suite end-to-end de Playwright.";

test.describe.configure({ mode: "serial" });

test.describe("Flujo completo de TaskFlow", () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("login con un usuario semilla de db.json", async () => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Ingresar a TaskFlow" })).toBeVisible();

    await page.locator("#email").fill(USER_EMAIL);
    await page.locator("#password").fill(USER_PASSWORD);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByRole("heading", { name: "Tus proyectos" })).toBeVisible();
    await expect(page.locator("#user-name")).toHaveText("Mariana Beltran");
  });

  test("ver el listado de proyectos y entrar a uno", async () => {
    const projectCard = page.locator(".project-card", { hasText: PROJECT_NAME });
    await expect(projectCard).toBeVisible();

    await projectCard.click();

    await expect(page.locator(".board-header h1")).toHaveText(PROJECT_NAME);
  });

  test("ver el tablero con sus 3 columnas", async () => {
    const columns = page.locator(".board .column");
    await expect(columns).toHaveCount(3);

    await expect(page.locator('.column[data-status="TODO"] .column__title')).toHaveText(
      "Por hacer"
    );
    await expect(
      page.locator('.column[data-status="IN_PROGRESS"] .column__title')
    ).toHaveText("En progreso");
    await expect(page.locator('.column[data-status="DONE"] .column__title')).toHaveText(
      "Hecho"
    );
  });

  test("crear una tarea nueva y verla aparecer en TODO", async () => {
    await page.locator('.column[data-status="TODO"] .column__add').click();

    await expect(page.getByRole("heading", { name: "Nueva tarea" })).toBeVisible();
    await page.locator("#task-title").fill(TASK_TITLE);
    await page.locator("#task-desc").fill(TASK_DESCRIPTION);
    await page.getByRole("button", { name: "Crear" }).click();

    const card = page.locator('.column[data-status="TODO"] .card', { hasText: TASK_TITLE });
    await expect(card).toBeVisible();
    await expect(card.locator(".card__description")).toHaveText(TASK_DESCRIPTION);
  });

  test('mover la tarea a IN_PROGRESS con el select "Mover a"', async () => {
    const card = page.locator(".card", { hasText: TASK_TITLE });
    await card.locator('[data-action="move"]').selectOption("IN_PROGRESS");

    await expect(
      page.locator('.column[data-status="IN_PROGRESS"] .card', { hasText: TASK_TITLE })
    ).toBeVisible();
    await expect(
      page.locator('.column[data-status="TODO"] .card', { hasText: TASK_TITLE })
    ).toHaveCount(0);
  });

  test("editar el titulo de la tarea y confirmar que se refleja", async () => {
    const card = page.locator(".card", { hasText: TASK_TITLE });
    await card.locator('[data-action="edit"]').click();

    await expect(page.getByRole("heading", { name: "Editar tarea" })).toBeVisible();
    const titleInput = page.locator("#task-title");
    await expect(titleInput).toHaveValue(TASK_TITLE);

    await titleInput.fill(TASK_TITLE_EDITADA);
    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(
      page.locator('.column[data-status="IN_PROGRESS"] .card', {
        hasText: TASK_TITLE_EDITADA
      })
    ).toBeVisible();
  });

  test("borrar la tarea y confirmar que desaparece", async () => {
    page.once("dialog", (dialog) => dialog.accept());

    const card = page.locator(".card", { hasText: TASK_TITLE_EDITADA });
    await card.locator('[data-action="delete"]').click();

    await expect(page.locator(".card", { hasText: TASK_TITLE_EDITADA })).toHaveCount(0);
  });

  test("logout vuelve a la pantalla de login", async () => {
    await page.locator("#logout-btn").click();

    await expect(page.getByRole("heading", { name: "Ingresar a TaskFlow" })).toBeVisible();
    await expect(page.locator("#topbar")).toBeHidden();
  });
});
