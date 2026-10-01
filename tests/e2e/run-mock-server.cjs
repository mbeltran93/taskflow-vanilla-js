// Levanta json-server para los tests e2e, pero NUNCA sobre el db.json real:
// copia la semilla a un archivo temporal (gitignored) y sirve esa copia.
// Asi, aunque los tests creen/editen/borren tareas via la UI real, el
// db.json del repo queda intacto siempre, sin necesidad de resetear nada
// al final.
const fs = require("fs");
const path = require("path");
const jsonServer = require("json-server");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3101;
const ROOT = path.resolve(__dirname, "../..");
const SEED_PATH = path.join(ROOT, "db.json");
const COPY_PATH = path.join(__dirname, ".db.e2e.json");

fs.copyFileSync(SEED_PATH, COPY_PATH);

const server = jsonServer.create();
const router = jsonServer.router(COPY_PATH);
const middlewares = jsonServer.defaults({ logger: false });

server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
  console.log(
    `[e2e] json-server escuchando en http://localhost:${PORT} (copia temporal de db.json, el original no se toca)`
  );
});

function shutdown() {
  server.close(() => {
    try {
      fs.unlinkSync(COPY_PATH);
    } catch {
      /* ya no existe, no pasa nada */
    }
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
