import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { htmlPuesto, resumenPuesto } from "../src/formulario.ts";
import type { CatalogoFormulario, PuestoFormulario } from "../src/formulario.ts";
import {
  ETIQUETA_NIVEL,
  ZONAS,
  cargosDelNivel,
  definicionDe,
} from "../src/cargos.ts";

/**
 * El armado de las tarjetas de cargo es texto puro, así que se puede revisar
 * acá sin abrir un navegador. Lo que se prueba es que cada cargo muestre los
 * controles que le corresponden y que los datos viajen en los atributos que
 * después lee la capa de la página (data-campo y data-puesto).
 */

const CATALOGO: CatalogoFormulario = {
  niveles: ["inicial", "primario", "secundario", "superior"],
  etiquetaNivel: ETIQUETA_NIVEL,
  zonas: ZONAS,
  cargosDelNivel,
  definicionDe,
};

function puesto(extra: Partial<PuestoFormulario> = {}): PuestoFormulario {
  return {
    id: 7,
    nivel: "secundario",
    tipo: "horaSecundaria",
    cantHoras: 15,
    zonaPct: 0,
    presencialidad: true,
    ...extra,
  };
}

/** Atajo: el HTML de una tarjeta con los datos que interesan en cada test. */
function tarjeta(extra: Partial<PuestoFormulario> = {}, indice = 0, puedeQuitar = false): string {
  return htmlPuesto(puesto(extra), indice, puedeQuitar, CATALOGO);
}

/** Cuenta cuántas veces aparece un texto en el HTML armado. */
function contar(html: string, texto: string): number {
  return html.split(texto).length - 1;
}

describe("tarjeta de un cargo", () => {
  test("las horas de secundaria muestran cantidad de horas y zona, pero no presentismo", () => {
    const html = tarjeta();
    assert.ok(html.includes('data-campo="cantHoras"'));
    assert.ok(html.includes('data-campo="zona"'));
    assert.ok(!html.includes('data-campo="presencialidad"'));
  });

  test("el preceptor no muestra cantidad de horas ni presentismo", () => {
    const html = tarjeta({ tipo: "preceptor" });
    assert.ok(!html.includes('data-campo="cantHoras"'));
    assert.ok(html.includes('data-campo="zona"'));
    assert.ok(!html.includes('data-campo="presencialidad"'));
  });

  test("primaria e inicial muestran el ítem de presentismo", () => {
    for (const tipo of ["maestroGrado", "maestroCelador", "maestroJardin"] as const) {
      const html = tarjeta({ tipo, nivel: tipo === "maestroJardin" ? "inicial" : "primario" });
      assert.ok(html.includes('data-campo="presencialidad"'), `${tipo} no muestra el presentismo`);
    }
  });

  test("el nivel superior no muestra zona (no la cobra)", () => {
    for (const tipo of ["ifdcTiempoCompleto", "ifdcSemiExclusivo", "ifdcFullTime"] as const) {
      const html = tarjeta({ tipo, nivel: "superior" });
      assert.ok(!html.includes('data-campo="zona"'), `${tipo} no debería mostrar zona`);
    }
  });

  test("los controles llevan el id del puesto en data-puesto", () => {
    // Nivel, tipo de cargo, cantidad de horas y zona: cuatro controles con el id 42.
    assert.equal(contar(tarjeta({ id: 42 }), 'data-puesto="42"'), 4);
  });

  test("el número de cargo es el que se ve en pantalla", () => {
    assert.ok(tarjeta({}, 2).includes("Cargo 3"));
  });

  test("el botón de quitar aparece solo si hay más de un cargo", () => {
    assert.ok(tarjeta({}, 0, true).includes('data-accion="quitar"'));
    assert.ok(!tarjeta({}, 0, false).includes('data-accion="quitar"'));
  });

  test("los cargos que se ofrecen son los del nivel elegido", () => {
    const html = tarjeta({ nivel: "superior", tipo: "ifdcFullTime" });
    for (const cargo of cargosDelNivel("superior")) {
      assert.ok(html.includes(`value="${cargo.tipo}"`), `falta ${cargo.tipo}`);
    }
    // Un cargo de otro nivel no puede aparecer en la lista.
    assert.ok(!html.includes('value="horaSecundaria"'));
  });

  test("cada control queda con una sola opción seleccionada", () => {
    // La tarjeta de maestrx de grado tiene cuatro controles (nivel, cargo,
    // zona y presentismo), así que tiene que haber exactamente cuatro "selected".
    const html = tarjeta({ nivel: "primario", tipo: "maestroGrado" });
    assert.equal(contar(html, "selected"), contar(html, 'data-campo="'));
  });

  test("la zona y el presentismo reflejan lo que ya estaba cargado", () => {
    const html = tarjeta({ tipo: "maestroGrado", nivel: "primario", zonaPct: 40, presencialidad: false });
    assert.ok(html.includes('<option value="40" selected>40%</option>'));
    assert.ok(html.includes('<option value="0" selected>No</option>'));
  });
});

describe("resumen del cargo", () => {
  test("nombra el cargo, las horas y la zona", () => {
    const texto = resumenPuesto(puesto({ cantHoras: 12, zonaPct: 20 }), CATALOGO);
    assert.ok(texto.includes("Hs. en Secundario"));
    assert.ok(texto.includes("12 hs"));
    assert.ok(texto.includes("zona 20%"));
  });

  test("no agrega horas ni zona en los cargos que no las usan", () => {
    // El nombre del cargo ya dice "40 hs.", pero el resumen no debe agregar nada
    // más: ni cantidad de horas ni zona.
    const texto = resumenPuesto(puesto({ tipo: "ifdcFullTime", nivel: "superior", zonaPct: 100 }), CATALOGO);
    assert.equal(texto, definicionDe("ifdcFullTime").etiqueta);
  });
});
