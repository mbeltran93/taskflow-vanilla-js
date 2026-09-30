import { getSession, clearSession } from "./session.js";
import { addRoute, startRouter, navigate } from "./router.js";
import { renderLogin } from "./views/loginView.js";
import { renderProjects } from "./views/projectsView.js";
import { renderBoard } from "./views/boardView.js";

const appRoot = document.getElementById("app");
const topbar = document.getElementById("topbar");
const userNameEl = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");

function updateTopbar() {
  const user = getSession();
  if (user) {
    topbar.hidden = false;
    userNameEl.textContent = user.name;
  } else {
    topbar.hidden = true;
  }
}

function requireAuth(handler) {
  return (params) => {
    const user = getSession();
    if (!user) {
      navigate("/login");
      return;
    }
    updateTopbar();
    handler(params, user);
  };
}

addRoute("/login", () => {
  const user = getSession();
  if (user) {
    navigate("/projects");
    return;
  }
  updateTopbar();
  renderLogin(appRoot);
});

addRoute(
  "/projects",
  requireAuth((_, user) => renderProjects(appRoot, user))
);

addRoute(
  "/board/:projectId",
  requireAuth(({ projectId }, user) => renderBoard(appRoot, user, projectId))
);

logoutBtn.addEventListener("click", () => {
  clearSession();
  navigate("/login");
});

startRouter();
