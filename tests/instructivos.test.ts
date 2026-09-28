import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  CARGOS,
  COEFICIENTES_CARGOS,
  DESCUENTOS_FIJOS,
  ENSEÑANZA_EN_AULA_POR_HORA_RELOJ,
  HORAS_RELOJ_FRENTE_A_ALUMNOS,
  calcularConceptosDePuesto,
  calcularDescuentos,
  cargosDelNivel,
  definicionDe,
  montoEnseñanzaEnAula,
} from "../src/cargos.ts";
import type { ConfiguracionesDelMes, OpcionesCalculo, Puesto, TipoCargo } from "../src/cargos.ts";
import { obtenerConfiguracionActual1, obtenerConfiguracionActual2 } from "../src/historial.ts";

/**
 * Verificación contra los documentos oficiales y los recibos reales.
 *
 * Cada número de acá está copiado de un papel que está en docs/:
 *   - Instructivo de julio 2026 (docs/Decretos/INSTRUCTIVO JULIO 2026.pdf)
 *   - Decreto N° 8583-MHIP-2026, del 25/07/2026 (docs/Recibos/Boletín 31_07_26 ...)
 *   - Decreto N° 3864-MHIP-2026, de abril 2026 (docs/Decretos/Nuevos Adicionales ...)
 *   - Recibos de sueldo (docs/Recibos/...)
 *
 * La idea es que si alguien toca una fórmula o un valor, este test falle y
 * obligue a volver al documento. Las diferencias de pocos pesos son normales:
 * los coeficientes de cargo están redondeados a mano.
 */

function casiIgual(actual: number, esperado: number, tolerancia = 1e-6, mensaje = ""): void {
  assert.ok(
    Math.abs(actual - esperado) < tolerancia,
    `${mensaje} esperaba ${esperado} (± ${tolerancia}) pero obtuve ${actual}`
  );
}

function configs(mes: string): ConfiguracionesDelMes {
  return { basica: obtenerConfiguracionActual1(mes), ifdc: obtenerConfiguracionActual2(mes) };
}

function sinAntiguedad(extra: Partial<OpcionesCalculo> = {}): OpcionesCalculo {
  return { antiguedadPct: 0, afiliacion: "no", incluirSAC: false, ...extra };
}

function basicoDe(tipo: TipoCargo, mes: string): number {
  const puesto: Puesto = { tipo, cantHoras: 15, zonaPct: 0, presencialidad: false };
  return calcularConceptosDePuesto(puesto, configs(mes), sinAntiguedad()).basico;
}

// ---------------------------------------------------------------------------
// Instructivo de julio 2026
// ---------------------------------------------------------------------------

describe("instructivo julio 2026: valor de la hora y de cada cargo", () => {
  test("la hora secundaria de julio 2026 es la del instructivo", () => {
    assert.equal(obtenerConfiguracionActual1("2026-07").basicoCargo_Hora, 17734.5);
  });

  test("los básicos de los cargos son los de la tabla de puntos de julio", () => {
    // Tabla "FUNCION DOCENTE / PUNTOS / jul-26" del instructivo.
    const tabla: [TipoCargo, number][] = [
      ["preceptor", 250671.79], // 213 puntos
      ["maestroGrado", 265970.93], // 226
      ["maestroJardin", 269501.61], // 229
      ["maestroCelador", 304806.1], // 259
      ["asesorPedagogico", 490745.35], // 417
      ["educacionEspecialInicial", 303625.63], // 258
      ["auxiliarDocente", 255376.75], // 217
      ["maestroEspecialInicial", 215365.36], // 183
    ];
    for (const [tipo, esperado] of tabla) {
      casiIgual(basicoDe(tipo, "2026-07"), esperado, 2, `${tipo} en julio:`);
    }
  });

  test("los cargos de inicial se pueden elegir en inicial (y el auxiliar también en primaria)", () => {
    const iniciales = cargosDelNivel("inicial").map((cargo) => cargo.tipo);
    for (const tipo of ["maestroJardin", "educacionEspecialInicial", "maestroEspecialInicial", "auxiliarDocente"] as const) {
      assert.ok(iniciales.includes(tipo), `${tipo} no aparece en inicial`);
      assert.equal(definicionDe(tipo).escala, "basica");
      assert.equal(definicionDe(tipo).usaHoras, false);
      assert.equal(definicionDe(tipo).usaZona, true);
    }
    // El decreto pone al auxiliar docente en inicial y en primario.
    assert.ok(cargosDelNivel("primario").some((cargo) => cargo.tipo === "auxiliarDocente"));
  });

  test("el jardín sigue siendo el primero de inicial, para no cambiar el que viene elegido", () => {
    assert.equal(cargosDelNivel("inicial")[0]?.tipo, "maestroJardin");
    assert.equal(cargosDelNivel("primario")[0]?.tipo, "maestroCelador");
    assert.equal(cargosDelNivel("secundario")[0]?.tipo, "horaSecundaria");
  });

  test("el asesor pedagógico tiene el coeficiente que sale del instructivo", () => {
    // 490.745,35 / 17.734,50 = 27,671789. Es el cargo nuevo.
    casiIgual(basicoDe("asesorPedagogico", "2026-07"), 490745.35, 0.1);
    const definicion = definicionDe("asesorPedagogico");
    assert.deepEqual([...definicion.niveles], ["primario", "secundario"]);
    assert.equal(definicion.escala, "basica");
    assert.equal(definicion.usaHoras, false);
  });

  test("el ejemplo de maestro de grado cierra ítem por ítem", () => {
    // Instructivo, punto 7: "Ejemplo CARGO MAESTRO DE GRADO SIN ANTIGÜEDAD".
    const puesto: Puesto = {
      tipo: "maestroGrado",
      cantHoras: 15,
      zonaPct: 0,
      // El ejemplo no incluye el ítem de enseñanza en el aula.
      presencialidad: false,
    };
    const r = calcularConceptosDePuesto(puesto, configs("2026-07"), sinAntiguedad());
    const tolerancia = 1.5; // el coeficiente del cargo está redondeado

    casiIgual(r.basico, 265970.93, tolerancia, "sueldo básico:");
    casiIgual(r.adicionalPorCargo, 87770.41, tolerancia, "adicional por cargo 33%:");
    casiIgual(r.complementoRemunerativo, 372359.3, tolerancia, "complemento remunerativo 140%:");
    casiIgual(r.totalRemunerativo, 726100.64, 2, "total bruto remunerativo:");
    casiIgual(r.sumaNoRemunerativa, 70000, 0.1, "suma no remunerativa:");
    casiIgual(r.complementoNoRemunerativo, 257991.8, tolerancia, "complemento no remunerativo 97%:");
    // El total no remunerativo del ejemplo no cuenta el FONID, pero el recibo
    // sí lo paga (es "haber sin aportes"), así que se descuenta para comparar.
    casiIgual(
      r.totalNoRemunerativo - r.incentivoDocente,
      327991.8,
      1,
      "total no remunerativo sin FONID:"
    );
    casiIgual(r.incentivoDocente, 28700, 0.01, "FONID:");

    // Los descuentos del ejemplo: 13% jubilatorio + 3% obra social + 3% ley 19032.
    const d = calcularDescuentos(r.totalRemunerativo, "no");
    casiIgual(d.jubilacion + d.jubilacionRegEsp, 94393.08, 2, "aportes jubilatorios 13%:");
    casiIgual(d.obraSocial / 2, 21783.02, 1, "obra social 3%:");
    casiIgual(
      d.total - (DESCUENTOS_FIJOS.seguroObligatorio + DESCUENTOS_FIJOS.seguroSocial + DESCUENTOS_FIJOS.seguroMutual),
      137959.12,
      2,
      "total de descuentos:"
    );
    // El neto del ejemplo no descuenta los seguros fijos ni cuenta el FONID,
    // así que se comparan las dos cosas aparte.
    casiIgual(r.totalBruto - r.incentivoDocente - 137959.12, 916133.32, 3, "total neto:");
  });

  test("el FONID provincial de julio son 28.700 por cargo", () => {
    // Instructivo, punto 8, y Decreto 8583-MHIP-2026 art. 4: "cargo testigo de
    // Maestro de Grado o quince horas cátedra".
    const maestra = calcularConceptosDePuesto(
      { tipo: "maestroGrado", cantHoras: 15, zonaPct: 0, presencialidad: false },
      configs("2026-07"),
      sinAntiguedad()
    );
    casiIgual(maestra.incentivoDocente, 28700, 0.01);

    const horas = calcularConceptosDePuesto(
      { tipo: "horaSecundaria", cantHoras: 15, zonaPct: 0, presencialidad: false },
      configs("2026-07"),
      sinAntiguedad()
    );
    casiIgual(horas.incentivoDocente, 28700, 0.01);
  });
});

// ---------------------------------------------------------------------------
// Decreto 8583-MHIP-2026 (25/07/2026)
// ---------------------------------------------------------------------------

describe("decreto de julio 2026: calendario de aumentos", () => {
  test("cada tramo del 5% se aplica sobre los haberes de enero 2026", () => {
    // El Decreto N° 8583-MHIP-2026 (art. 1) pone los tramos en febrero, abril,
    // julio, agosto, octubre y noviembre. Un decreto POSTERIOR, que no está en
    // este repositorio, movió los tramos de octubre y noviembre a septiembre y
    // octubre, que es como están cargados. No hay tramo en marzo, mayo ni junio.
    const ENERO = 15421.3;
    const esperado: Record<string, number> = {
      "2026-01": ENERO,
      "2026-02": ENERO * 1.05,
      "2026-03": ENERO * 1.05, // sin tramo
      "2026-04": ENERO * 1.1,
      "2026-05": ENERO * 1.1, // sin tramo
      "2026-06": ENERO * 1.1, // sin tramo
      "2026-07": ENERO * 1.15,
      "2026-08": ENERO * 1.2,
      "2026-09": ENERO * 1.25, // el tramo que el decreto de julio ponía en octubre
      "2026-10": ENERO * 1.3, // el que ponía en noviembre
    };
    for (const [mes, valor] of Object.entries(esperado)) {
      casiIgual(
        obtenerConfiguracionActual1(mes).basicoCargo_Hora,
        valor,
        0.01,
        `${mes}:`
      );
    }
  });

  test("los porcentajes de complementos desde julio son 140% y 97% en obligatoria", () => {
    // Art. 2.
    for (const mes of ["2026-07", "2026-08", "2026-09", "2026-10"]) {
      const config = obtenerConfiguracionActual1(mes);
      assert.equal(config.porcentajes.remunerativo, 1.4, `${mes} remunerativo`);
      assert.equal(config.porcentajes.noRemunerativo, 0.97, `${mes} no remunerativo`);
    }
  });

  test("en los institutos superiores son 70% y 25%", () => {
    // Art. 3: aplica a los Institutos de Educación Superior.
    for (const mes of ["2026-07", "2026-08", "2026-09", "2026-10"]) {
      const config = obtenerConfiguracionActual2(mes);
      assert.equal(config.porcentajes.remunerativo, 0.7, `${mes} remunerativo`);
      assert.equal(config.porcentajes.noRemunerativo, 0.25, `${mes} no remunerativo`);
      assert.equal(config.porcentajes.adicionalCargo, 0.34999, `${mes} adicional`);
    }
  });

  test("los dos complementos reparten el mismo total que antes del decreto", () => {
    // La modificación no cambia la plata: redistribuye entre remunerativo y no
    // remunerativo (1,30 + 1,07 = 1,40 + 0,97, y 0,65 + 0,30 = 0,70 + 0,25).
    const junio = obtenerConfiguracionActual1("2026-06");
    const julio = obtenerConfiguracionActual1("2026-07");
    casiIgual(
      junio.porcentajes.remunerativo + junio.porcentajes.noRemunerativo,
      julio.porcentajes.remunerativo + julio.porcentajes.noRemunerativo
    );

    const ifdcJunio = obtenerConfiguracionActual2("2026-06");
    const ifdcJulio = obtenerConfiguracionActual2("2026-07");
    casiIgual(
      ifdcJunio.porcentajes.remunerativo + ifdcJunio.porcentajes.noRemunerativo,
      ifdcJulio.porcentajes.remunerativo + ifdcJulio.porcentajes.noRemunerativo
    );
  });
});

// ---------------------------------------------------------------------------
// Decreto 3864-MHIP-2026 (abril 2026): ítem enseñanza en el aula
// ---------------------------------------------------------------------------

describe("decreto de abril 2026: enseñanza en el aula", () => {
  test("los básicos de abril coinciden con los de la tabla del decreto", () => {
    // Tabla de "Nuevos adicionales docentes - 04/2026".
    const tabla: [TipoCargo, number][] = [
      ["maestroGrado", 254406.98], // "Maestro/a de Grado (226p)"
      ["maestroJardin", 257784.15], // "Maestro/a de Jardin (229p)"
      ["educacionEspecialInicial", 290424.52], // "Maestra Educ Especial Nivel Inicial (258p)"
      ["auxiliarDocente", 244273.41], // "Auxiliar docente (217p)"
      ["maestroEspecialInicial", 206001.65], // "Maestro/a Esp Jdin (183p)"
    ];
    for (const [tipo, esperado] of tabla) {
      casiIgual(basicoDe(tipo, "2026-04"), esperado, 3.5, `${tipo} en abril:`);
    }
  });

  test("cada cargo cobra el monto que le corresponde, y el celador ninguno", () => {
    const montoDe = (tipo: TipoCargo): number =>
      calcularConceptosDePuesto(
        { tipo, cantHoras: 15, zonaPct: 0, presencialidad: true },
        configs("2026-07"),
        sinAntiguedad()
      ).enseñanzaEnAula;

    assert.equal(montoDe("maestroGrado"), 125000); // 226p, 20/25 horas reloj
    assert.equal(montoDe("maestroJardin"), 93750); // 229p, 15 horas reloj
    assert.equal(montoDe("educacionEspecialInicial"), 125000); // 258p, 20 horas reloj
    assert.equal(montoDe("auxiliarDocente"), 93750); // 217p, 15 horas reloj
    assert.equal(montoDe("maestroEspecialInicial"), 43750); // 183p, 10 horas cátedra
    assert.equal(montoDe("maestroCelador"), 0); // el 259p no está en el decreto
    assert.equal(montoDe("asesorPedagogico"), 0); // tampoco el asesor
  });

  test("el monto por hora del decreto es 6.250 y la tabla sale de multiplicarlo", () => {
    // La tabla del decreto tiene, para cada función, la carga horaria y el
    // monto del ítem. El monto es siempre horas reloj frente a alumnos x 6.250.
    assert.equal(ENSEÑANZA_EN_AULA_POR_HORA_RELOJ, 6250);
    const tabla: [number, number][] = [
      [35, 218750], // maestrx de grado jornada completa (327p)
      [25, 156250], // grado escuela asistencial (266p)
      [20, 125000], // maestrx de grado (226p), especiales de 20 horas
      [15, 93750], // jardín y auxiliar de jardín (229p)
      [10, 62500], // especiales con 15 horas cátedra
      [7, 43750], // especiales con 10 horas cátedra
    ];
    for (const [horasReloj, monto] of tabla) {
      assert.equal(horasReloj * ENSEÑANZA_EN_AULA_POR_HORA_RELOJ, monto, `${horasReloj} horas:`);
    }
  });

  test("las horas del ítem son las que el decreto le asigna a cada función", () => {
    assert.equal(HORAS_RELOJ_FRENTE_A_ALUMNOS.maestroGrado, 20);
    assert.equal(HORAS_RELOJ_FRENTE_A_ALUMNOS.maestroJardin, 15);
    assert.equal(HORAS_RELOJ_FRENTE_A_ALUMNOS.educacionEspecialInicial, 20);
    assert.equal(HORAS_RELOJ_FRENTE_A_ALUMNOS.auxiliarDocente, 15);
    assert.equal(HORAS_RELOJ_FRENTE_A_ALUMNOS.maestroEspecialInicial, 7); // 10 horas cátedra
    assert.equal(montoEnseñanzaEnAula("maestroGrado"), 20 * 6250);
    assert.equal(montoEnseñanzaEnAula("maestroJardin"), 15 * 6250);
    assert.equal(montoEnseñanzaEnAula("maestroEspecialInicial"), 7 * 6250);
  });

  test("ningún cargo cobra el ítem sin horas asignadas en el decreto", () => {
    // Vale para todos los niveles, no solo inicial: el ítem o sale de la tabla
    // del decreto, o no se cobra.
    for (const cargo of CARGOS) {
      const horas = HORAS_RELOJ_FRENTE_A_ALUMNOS[cargo.tipo];
      if (horas === undefined) {
        assert.equal(montoEnseñanzaEnAula(cargo.tipo), 0, `${cargo.tipo} no debería cobrar el ítem`);
        assert.equal(cargo.usaPresencialidad, false, `${cargo.tipo} no debería tener el selector`);
      } else {
        assert.ok(cargo.usaPresencialidad, `${cargo.tipo} debería tener el selector`);
        assert.equal(montoEnseñanzaEnAula(cargo.tipo), horas * ENSEÑANZA_EN_AULA_POR_HORA_RELOJ);
      }
    }
  });

  test("en inicial cada cargo cobra por sus horas, no un monto fijo", () => {
    // Es el caso que estaba mal: la calculadora le pagaba al jardín 125.000 (el
    // monto del maestro de grado) y el decreto le asigna 15 horas reloj, o sea
    // 93.750. Ahora sale de la tabla, así que cada función de inicial cobra lo
    // suyo y ninguno repite el monto de otro.
    const esperado: [TipoCargo, number][] = [
      ["maestroJardin", 93750],
      ["auxiliarDocente", 93750],
      ["educacionEspecialInicial", 125000],
      ["maestroEspecialInicial", 43750],
    ];
    for (const [tipo, monto] of esperado) {
      assert.equal(montoEnseñanzaEnAula(tipo), monto, `${tipo}:`);
      assert.ok(
        cargosDelNivel("inicial").some((cargo) => cargo.tipo === tipo),
        `${tipo} no está en inicial`
      );
    }
    assert.notEqual(montoEnseñanzaEnAula("maestroJardin"), montoEnseñanzaEnAula("maestroGrado"));
  });

  test("el ítem no se cobra si el docente no estuvo frente al aula", () => {
    // El instructivo de julio aclara que este concepto no se modifica; el monto
    // depende de las licencias y las faltas, que es lo que maneja el selector.
    const sinPresentismo = calcularConceptosDePuesto(
      { tipo: "maestroGrado", cantHoras: 15, zonaPct: 0, presencialidad: false },
      configs("2026-07"),
      sinAntiguedad()
    );
    assert.equal(sinPresentismo.enseñanzaEnAula, 0);
  });
});

// ---------------------------------------------------------------------------
// Recibos reales
// ---------------------------------------------------------------------------

describe("recibos: los ítems que se pagan por hora cátedra", () => {
  test("el recibo de febrero 2026 de 3 horas cátedra, ítem por ítem", () => {
    // docs/Recibos/Mios/ReciboSueldo- yo 26_2.pdf, dependencia Centro Educ. N° 22:
    // 3 horas, zona 80%, antigüedad de 10 años (50%).
    const r = calcularConceptosDePuesto(
      { tipo: "horaSecundaria", cantHoras: 3, zonaPct: 80, presencialidad: false },
      configs("2026-02"),
      { antiguedadPct: 0.5, afiliacion: "no", incluirSAC: false }
    );
    casiIgual(r.basico, 48577.11, 0.01, "básico 3 hs:");
    casiIgual(r.complementoRemunerativo, 63150.24, 0.01, "complemento remunerativo 130%:");
    casiIgual(r.pagoDeZona, 38861.69, 0.01, "zona 80%:");
    casiIgual(r.pagoAntiguedad, 24288.56, 0.01, "antigüedad 50%:");
    casiIgual(r.complementoNoRemunerativo, 51977.51, 0.01, "complemento no remunerativo 107%:");
    casiIgual(r.sumaNoRemunerativa, 14002.45, 0.01, "suma no remunerativa:");
    casiIgual(r.incentivoDocente, 5740, 0.01, "FONID:");
  });

  test("la suma no remunerativa es 4.667,48333 por hora cátedra", () => {
    // El mismo valor aparece en todos los recibos de 2025 y 2026 (3, 5 y 6 horas).
    const febrero = obtenerConfiguracionActual1("2026-02");
    casiIgual(febrero.sumaNoRemunerativa, 4667.48333, 1e-5);
    // Y en los recibos de cargo vale lo mismo por coeficiente del cargo.
    casiIgual(febrero.sumaNoRemunerativa * COEFICIENTES_CARGOS.preceptor, 65973.47, 0.05, "preceptor:");
    casiIgual(febrero.sumaNoRemunerativa * COEFICIENTES_CARGOS.maestroGrado, 70000, 0.05, "grado:");
    casiIgual(febrero.sumaNoRemunerativa * COEFICIENTES_CARGOS.maestroJardin, 70929.23, 0.4, "jardín:");
  });

  test("el recibo del preceptor de noviembre 2025", () => {
    // docs/Recibos/Silvi/Silvi 11-05.pdf: cargo 213p, sin antigüedad.
    const r = calcularConceptosDePuesto(
      { tipo: "preceptor", cantHoras: 15, zonaPct: 0, presencialidad: false },
      configs("2025-11"),
      sinAntiguedad()
    );
    casiIgual(r.basico, 217975.47, 1, "básico:");
    casiIgual(r.adicionalPorCargo, 71931.91, 0.5, "adicional por cargo 33%:");
    casiIgual(r.complementoRemunerativo, 283368.11, 1, "complemento remunerativo 130%:");
    casiIgual(r.complementoNoRemunerativo, 233233.76, 1, "complemento no remunerativo 107%:");
    casiIgual(r.sumaNoRemunerativa, 65973.47, 0.05, "suma no remunerativa:");
    casiIgual(r.incentivoDocente, 28700, 0.01, "FONID:");
  });
});

describe("recibos: nivel superior", () => {
  test("el recibo de junio 2026 del profesor full time, ítem por ítem", () => {
    // docs/Recibos/IFDC/ReciboSueldo-full-6-26 .pdf: 718.717,75 de básico,
    // 65% de complemento, antigüedad de 11 años (50%).
    const r = calcularConceptosDePuesto(
      { tipo: "ifdcFullTime", cantHoras: 15, zonaPct: 0, presencialidad: false },
      configs("2026-06"),
      { antiguedadPct: 0.5, afiliacion: "no", incluirSAC: false }
    );
    casiIgual(r.basico, 718717.75, 0.1, "básico:");
    casiIgual(r.complementoRemunerativo, 467166.54, 0.5, "complemento remunerativo 65%:");
    casiIgual(r.pagoAntiguedad, 359358.88, 0.5, "antigüedad 50%:");
    casiIgual(r.adicionalPorDedicacion, 251548.73, 6, "adicional por dedicación:");
    casiIgual(r.complementoNoRemunerativo, 215615.33, 0.5, "complemento no remunerativo 30%:");
    casiIgual(r.sumaNoRemunerativa, 184210.1, 0.1, "suma no remunerativa:");
    casiIgual(r.incentivoDocente, 57400, 0.01, "FONID:");
  });

  test("el recibo del semiexclusivo de noviembre 2025", () => {
    // docs/Recibos/IFDC/Lihu/Prof ded sem-25hs- 2025-11.pdf.
    const r = calcularConceptosDePuesto(
      { tipo: "ifdcSemiExclusivo", cantHoras: 15, zonaPct: 0, presencialidad: false },
      configs("2025-11"),
      sinAntiguedad()
    );
    casiIgual(r.basico, 466697.47, 2, "básico:");
    // El coeficiente del semiexclusivo está redondeado (0,83333), de ahí la holgura.
    casiIgual(r.sumaNoRemunerativa, 131577.98, 0.2, "suma no remunerativa:");
    casiIgual(r.incentivoDocente, 57400, 0.01, "FONID:");
  });
});

describe("recibos: descuentos", () => {
  test("los porcentajes de ley son los del recibo de febrero 2026", () => {
    // docs/Recibos/Mios/ReciboSueldo- yo 26_2.pdf: sobre 1.318.058,96 de haberes
    // con aportes.
    const conAportes = 1318058.96;
    const d = calcularDescuentos(conAportes, "no");
    casiIgual(d.jubilacion, 144986.49, 0.01, "jubilación 11%:");
    casiIgual(d.jubilacionRegEsp, 26361.18, 0.01, "ley 137/05 2%:");
    casiIgual(d.obraSocial, 79083.54, 0.01, "obra social DOSEP 6%:");
  });

  test("los seguros fijos son los del recibo de junio 2026", () => {
    // docs/Recibos/IFDC/ReciboSueldo-full-6-26 .pdf.
    assert.equal(DESCUENTOS_FIJOS.seguroObligatorio, 4925.07);
    assert.equal(DESCUENTOS_FIJOS.seguroSocial, 100);
    assert.equal(DESCUENTOS_FIJOS.seguroMutual, 10);
  });

  test("el descuento sindical del recibo de julio 2025 es del 1,5%", () => {
    // docs/Recibos/ReciboSueldo-Lucre 07-25.pdf: AMET sobre 608.178,91 = 9.122,68.
    casiIgual(calcularDescuentos(608178.91, "amet").sindical, 9122.68, 0.01);
  });
});
