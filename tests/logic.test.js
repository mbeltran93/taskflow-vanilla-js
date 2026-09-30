import { describe, it, expect } from "vitest";
import {
  groupTasksByStatus,
  nextStatus,
  isValidStatus,
  validateLoginInput,
  validateTaskInput,
  sanitizeUser,
  sortByCreatedAt
} from "../src/logic.js";

describe("groupTasksByStatus", () => {
  it("agrupa tareas en las tres columnas", () => {
    const tasks = [
      { id: "1", status: "TODO" },
      { id: "2", status: "IN_PROGRESS" },
      { id: "3", status: "DONE" },
      { id: "4", status: "TODO" }
    ];
    const groups = groupTasksByStatus(tasks);
    expect(groups.TODO).toHaveLength(2);
    expect(groups.IN_PROGRESS).toHaveLength(1);
    expect(groups.DONE).toHaveLength(1);
  });

  it("ignora tareas con status desconocido", () => {
    const tasks = [{ id: "1", status: "ARCHIVED" }];
    const groups = groupTasksByStatus(tasks);
    expect(groups.TODO).toHaveLength(0);
    expect(groups.IN_PROGRESS).toHaveLength(0);
    expect(groups.DONE).toHaveLength(0);
  });

  it("devuelve arrays vacios para una lista vacia", () => {
    const groups = groupTasksByStatus([]);
    expect(groups).toEqual({ TODO: [], IN_PROGRESS: [], DONE: [] });
  });
});

describe("nextStatus", () => {
  it("avanza de TODO a IN_PROGRESS", () => {
    expect(nextStatus("TODO")).toBe("IN_PROGRESS");
  });

  it("avanza de IN_PROGRESS a DONE", () => {
    expect(nextStatus("IN_PROGRESS")).toBe("DONE");
  });

  it("se queda en DONE (no da la vuelta)", () => {
    expect(nextStatus("DONE")).toBe("DONE");
  });

  it("devuelve el mismo valor para un status desconocido", () => {
    expect(nextStatus("WHATEVER")).toBe("WHATEVER");
  });
});

describe("isValidStatus", () => {
  it("acepta los tres status validos", () => {
    expect(isValidStatus("TODO")).toBe(true);
    expect(isValidStatus("IN_PROGRESS")).toBe(true);
    expect(isValidStatus("DONE")).toBe(true);
  });

  it("rechaza status invalidos", () => {
    expect(isValidStatus("DOING")).toBe(false);
    expect(isValidStatus("")).toBe(false);
  });
});

describe("validateLoginInput", () => {
  it("exige email", () => {
    expect(validateLoginInput("", "demo1234")).toMatch(/email/i);
  });

  it("exige formato de email valido", () => {
    expect(validateLoginInput("no-es-email", "demo1234")).toMatch(/valido/i);
  });

  it("exige contraseña de al menos 4 caracteres", () => {
    expect(validateLoginInput("a@b.com", "123")).toMatch(/contraseña/i);
  });

  it("devuelve null cuando todo es valido", () => {
    expect(validateLoginInput("a@b.com", "demo1234")).toBeNull();
  });
});

describe("validateTaskInput", () => {
  it("exige titulo", () => {
    expect(validateTaskInput("   ")).toMatch(/titulo/i);
  });

  it("rechaza titulos demasiado largos", () => {
    expect(validateTaskInput("x".repeat(200))).toMatch(/largo/i);
  });

  it("acepta un titulo valido", () => {
    expect(validateTaskInput("Hacer el deploy")).toBeNull();
  });
});

describe("sanitizeUser", () => {
  it("quita el password del usuario", () => {
    const user = { id: "u1", name: "Ana", email: "a@b.com", password: "secreto" };
    const clean = sanitizeUser(user);
    expect(clean).not.toHaveProperty("password");
    expect(clean).toEqual({ id: "u1", name: "Ana", email: "a@b.com" });
  });

  it("devuelve null si el usuario es null", () => {
    expect(sanitizeUser(null)).toBeNull();
  });
});

describe("sortByCreatedAt", () => {
  it("ordena de mas viejo a mas nuevo", () => {
    const tasks = [
      { id: "b", createdAt: "2026-01-02T00:00:00.000Z" },
      { id: "a", createdAt: "2026-01-01T00:00:00.000Z" }
    ];
    const sorted = sortByCreatedAt(tasks);
    expect(sorted.map((t) => t.id)).toEqual(["a", "b"]);
  });

  it("no muta el array original", () => {
    const tasks = [
      { id: "b", createdAt: "2026-01-02T00:00:00.000Z" },
      { id: "a", createdAt: "2026-01-01T00:00:00.000Z" }
    ];
    sortByCreatedAt(tasks);
    expect(tasks.map((t) => t.id)).toEqual(["b", "a"]);
  });
});
