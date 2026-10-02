import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { htmlPuesto, resumenPuesto } from "../src/formulario.ts";
import type { CatalogoFormulario, PuestoFormulario } from "../src/formulario.ts";
import {
  ETIQUETA_NIVEL,
  ZONAS,
  cargosDelNivel,
  definicionDe,
  montoEnseñanzaEnAula,
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
  montoEnAula: montoEnseñanzaEnAula,
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

  test("primaria e inicial muestran el ítem de presentismo donde corresponde", () => {
    // El maestro celador no cobra el ítem (no figura en el Decreto 3864-MHIP-2026),
    // así que su tarjeta no tiene el selector.
    const conPresentismo: [PuestoFormulario["tipo"], PuestoFormulario["nivel"]][] = [
      ["maestroGrado", "primario"],
      ["maestroJardin", "inicial"],
      ["educacionEspecialInicial", "inicial"],
      ["maestroEspecialInicial", "inicial"],
      ["auxiliarDocente", "inicial"],
    ];
    for (const [tipo, nivel] of conPresentismo) {
      const html = tarjeta({ tipo, nivel });
      assert.ok(html.includes('data-campo="presencialidad"'), `${tipo} no muestra el presentismo`);
    }
    const celador = tarjeta({ tipo: "maestroCelador", nivel: "primario" });
    assert.ok(!celador.includes('data-campo="presencialidad"'), "el celador no debería tener presentismo");
    assert.ok(celador.includes('value="maestroCelador"'));
  });

  test("los cargos nuevos de inicial se ofrecen en ese nivel", () => {
    for (const tipo of ["educacionEspecialInicial", "maestroEspecialInicial", "auxiliarDocente"] as const) {
      const html = tarjeta({ nivel: "inicial", tipo });
      assert.ok(html.includes(`value="${tipo}"`), `falta ${tipo} en inicial`);
    }
    // El auxiliar docente también está en primaria (lo pone ahí el decreto).
    const auxiliarEnPrimaria = tarjeta({ nivel: "primario", tipo: "auxiliarDocente" });
    assert.ok(auxiliarEnPrimaria.includes('value="auxiliarDocente"'));
  });

  test("el asesor pedagógico se ofrece en primaria y en secundaria, sin horas ni presentismo", () => {
    for (const nivel of ["primario", "secundario"] as const) {
      const html = tarjeta({ nivel, tipo: "asesorPedagogico" });
      assert.ok(html.includes('value="asesorPedagogico"'), `falta el asesor en ${nivel}`);
      assert.ok(!html.includes('data-campo="cantHoras"'));
      assert.ok(!html.includes('data-campo="presencialidad"'));
      assert.ok(html.includes('data-campo="zona"'));
    }
  });

  test("el selector de presentismo muestra el monto que paga ese cargo", () => {
    // Los montos salen de las horas reloj de cada función, así que no son el
    // mismo número: conviene que se vea antes de calcular.
    const montos: [PuestoFormulario["tipo"], PuestoFormulario["nivel"], string][] = [
      ["maestroJardin", "inicial", "Sí ($ 93.750)"],
      ["auxiliarDocente", "inicial", "Sí ($ 93.750)"],
      ["educacionEspecialInicial", "inicial", "Sí ($ 125.000)"],
      ["maestroEspecialInicial", "inicial", "Sí ($ 43.750)"],
      ["maestroGrado", "primario", "Sí ($ 125.000)"],
    ];
    for (const [tipo, nivel, texto] of montos) {
      const html = tarjeta({ tipo, nivel });
      assert.ok(html.includes(texto), `${tipo} no muestra "${texto}"`);
    }
  });

  test("el nivel superior no muestra zona, horas ni presentismo", () => {
    const superiores = [
      "ifdcTiempoCompleto",
      "ifdcSemiExclusivo",
      "ifdcFullTime",
      "ifdcDedicacionSimple10",
    ] as const;
    for (const tipo of superiores) {
      const html = tarjeta({ tipo, nivel: "superior" });
      assert.ok(!html.includes('data-campo="zona"'), `${tipo} no debería mostrar zona`);
      assert.ok(!html.includes('data-campo="presencialidad"'), `${tipo} no debería mostrar presentismo`);
      assert.ok(!html.includes('data-campo="cantHoras"'), `${tipo} no debería pedir horas`);
      assert.ok(html.includes(`value="${tipo}"`), `falta ${tipo} en la lista del superior`);
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
