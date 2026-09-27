import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Chequeo de referencias entre el código y la página.
 *
 * Todo id que el código busca con getElementById, o que usa para escribir un
 * importe, tiene que existir en index.html. Si no, el resultado se calcula bien
 * pero la pantalla muestra cualquier cosa... o nada.
 *
 * Este test existe porque la versión anterior del formulario tenía filas
 * referenciadas que ya no estaban en el HTML, y nadie se enteraba.
 */

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const funciones = fs.readFileSync(new URL("../src/funciones.ts", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const formulario = fs.readFileSync(new URL("../src/formulario.ts", import.meta.url), "utf8");

/** Todos los valores de un atributo que aparecen en un archivo. */
function valoresDeAtributo(codigo: string, atributo: string): string[] {
  const patron = new RegExp(`${atributo}="([^"]+)"`, "g");
  return [...new Set([...codigo.matchAll(patron)].flatMap((m) => (m[1] ? [m[1]] : [])))];
}

/** Todos los ids que el código menciona como destino en la página. */
function idsDelCodigo(codigo: string): string[] {
  const ids = new Set<string>();
  const patrones = [
    /getElementById\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
    /\bsetTexto\(\s*["'`]([^"'`]+)["'`]/g,
    /\bmostrarFilaSi\(\s*["'`]([^"'`]+)["'`]/g,
  ];
  for (const patron of patrones) {
    for (const coincidencia of codigo.matchAll(patron)) {
      if (coincidencia[1]) ids.add(coincidencia[1]);
    }
  }
  return [...ids];
}

function existeEnLaPagina(id: string): boolean {
  return html.includes(`id="${id}"`);
}

describe("referencias entre el código y index.html", () => {
  test("el código menciona ids (si no, el test no estaría probando nada)", () => {
    assert.ok(idsDelCodigo(funciones).length > 10);
    assert.ok(idsDelCodigo(main).length > 0);
  });

  test("todos los ids que usa funciones.ts existen en la página", () => {
    const faltantes = idsDelCodigo(funciones).filter((id) => !existeEnLaPagina(id));
    assert.deepEqual(faltantes, [], `estos ids no están en index.html: ${faltantes.join(", ")}`);
  });

  test("todos los ids que usa main.ts existen en la página", () => {
    const faltantes = idsDelCodigo(main).filter((id) => !existeEnLaPagina(id));
    assert.deepEqual(faltantes, [], `estos ids no están en index.html: ${faltantes.join(", ")}`);
  });

  test("los controles del formulario también están en la página", () => {
    for (const id of ["contenedorPuestos", "btnAgregarPuesto", "btnCalcularSueldo", "mesCalculo", "antiguedad", "afiliacionSindical"]) {
      assert.ok(existeEnLaPagina(id), `falta el control ${id} en index.html`);
    }
  });

  test("cada fila de resultado que se muestra u oculta tiene su id en la página", () => {
    const filas = [...funciones.matchAll(/mostrarFilaSi\(\s*"([^"]+)"/g)].flatMap((m) =>
      m[1] ? [m[1]] : []
    );
    assert.ok(filas.length > 5, "no encontré filas para revisar");
    for (const fila of filas) {
      assert.ok(existeEnLaPagina(fila), `la fila ${fila} no está en index.html`);
    }
  });
});

describe("contrato entre las tarjetas y el código que las lee", () => {
  test("todos los data-campo que dibuja el formulario se atienden en funciones.ts", () => {
    // Si acá falta uno, el control se dibuja pero cambiar su valor no hace nada.
    const dibujados = valoresDeAtributo(formulario, "data-campo").sort();
    const atendidos = [...funciones.matchAll(/case "([^"]+)":/g)]
      .flatMap((m) => (m[1] ? [m[1]] : []))
      .sort();
    assert.deepEqual(dibujados, atendidos);
  });

  test("toda acción de botón que dibuja el formulario tiene su manejador", () => {
    const dibujadas = valoresDeAtributo(formulario, "data-accion");
    assert.ok(dibujadas.length > 0, "el formulario no dibuja ningún botón con data-accion");
    for (const accion of dibujadas) {
      assert.ok(
        funciones.includes(`data-accion='${accion}'`) || funciones.includes(`data-accion="${accion}"`),
        `la acción ${accion} no se maneja en funciones.ts`
      );
    }
  });
});
