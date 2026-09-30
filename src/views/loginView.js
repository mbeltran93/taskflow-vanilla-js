import { findUserByEmail } from "../api.js";
import { validateLoginInput } from "../logic.js";
import { saveSession } from "../session.js";
import { navigate } from "../router.js";

export function renderLogin(root) {
  root.innerHTML = `
    <section class="auth">
      <h1>Ingresar a TaskFlow</h1>
      <p class="auth__subtitle">Tu tablero de tareas y proyectos.</p>
      <form id="login-form" novalidate>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="username" required />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
        </div>
        <p class="auth__error" id="login-error"></p>
        <button class="btn" type="submit" style="width:100%">Ingresar</button>
      </form>
      <p class="auth__hint">
        Usuarios de prueba (semilla de db.json):<br />
        mariana@taskflow.dev / demo1234<br />
        diego@taskflow.dev / demo1234
      </p>
    </section>
  `;

  const form = root.querySelector("#login-form");
  const errorEl = root.querySelector("#login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value;

    const validationError = validateLoginInput(email, password);
    if (validationError) {
      errorEl.textContent = validationError;
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const user = await findUserByEmail(email);
      if (!user || user.password !== password) {
        errorEl.textContent = "Email o contraseña incorrectos.";
        return;
      }
      saveSession(user);
      navigate("/projects");
    } catch (err) {
      errorEl.textContent =
        "No se pudo conectar con el servidor. ¿Esta corriendo json-server en el puerto 3001?";
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });
}
