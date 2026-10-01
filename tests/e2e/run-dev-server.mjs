// Levanta el dev server de Vite para los tests e2e usando la API de Node de
// Vite en vez del CLI, para poder forzar `open: false` (no tiene sentido
// abrir una ventana de navegador real en cada corrida de tests) sin tocar
// la config de `npm run dev` que usan los humanos.
import { createServer } from "vite";

const port = process.env.PORT ? Number(process.env.PORT) : 5183;

const server = await createServer({
  server: { port, open: false, strictPort: true }
});

await server.listen();
server.printUrls();

function shutdown() {
  server.close().finally(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
