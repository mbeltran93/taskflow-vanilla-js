// Router muy simple basado en location.hash. No hay libreria de routing:
// cada ruta es un patron con segmentos ":param" y un handler que recibe
// los params ya parseados.

const routes = [];

export function addRoute(pattern, handler) {
  const paramNames = [];
  const regexStr = pattern
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  routes.push({ regex: new RegExp(`^${regexStr}$`), paramNames, handler });
}

function resolve() {
  const hash = location.hash.replace(/^#/, "") || "/login";

  for (const route of routes) {
    const match = hash.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      route.handler(params);
      return;
    }
  }

  navigate("/login");
}

export function navigate(path) {
  if (location.hash.replace(/^#/, "") === path) {
    resolve();
  } else {
    location.hash = path;
  }
}

export function startRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}
