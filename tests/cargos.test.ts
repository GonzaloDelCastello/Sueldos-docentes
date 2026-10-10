import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  AFILIACIONES,
  CARGOS,
  COEFICIENTES_CARGOS,
  ESCALA_ANTIGUEDAD,
  calcularAguinaldo,
  calcularConceptosDePuesto,
  calcularDescuentos,
  calcularPluriempleo,
  cargosDelNivel,
  cerrarTotales,
  definicionDe,
  porcentajeAntiguedad,
} from "../src/cargos.ts";
import type {
  ConfiguracionesDelMes,
  DescuentosFijos,
  OpcionesCalculo,
  Puesto,
  TipoCargo,
} from "../src/cargos.ts";
import {
  SEGURO_OBLIGATORIO_POR_MES,
  SEGUROS_FIJOS,
  obtenerConfiguracionActual1,
  obtenerConfiguracionActual2,
} from "../src/historial.ts";

/**
 * Los mismos criterios que en calculos.test.ts: los números decimales se
 * comparan con tolerancia, y los valores de referencia se escriben a mano para
 * que el test falle si alguien toca una fórmula sin darse cuenta.
 */
function casiIgual(actual: number, esperado: number, tolerancia = 1e-6): void {
  assert.ok(
    Math.abs(actual - esperado) < tolerancia,
    `esperaba ${esperado} (± ${tolerancia}) pero obtuve ${actual}`
  );
}

// El mes que usan casi todos los tests. Las dos escalas y los seguros se buscan
// una sola vez (en el proyecto los resuelve configuracion.ts; acá se arman a
// mano para poder importar el motor sin los datos).
const MES = "2026-09";
const BASICA = obtenerConfiguracionActual1(MES);
const IFDC = obtenerConfiguracionActual2(MES);

function segurosDelMes(mes: string): DescuentosFijos {
  return {
    seguroObligatorio: SEGURO_OBLIGATORIO_POR_MES[mes] ?? 0,
    seguroSocial: SEGUROS_FIJOS.social,
    seguroMutual: SEGUROS_FIJOS.mutual,
  };
}

const SEGUROS: DescuentosFijos = segurosDelMes(MES);
const CONFIGS: ConfiguracionesDelMes = { basica: BASICA, ifdc: IFDC, seguros: SEGUROS };

/** Los tres seguros fijos, que se descuentan una sola vez por recibo. */
function segurosFijos(): number {
  return SEGUROS.seguroObligatorio + SEGUROS.seguroSocial + SEGUROS.seguroMutual;
}

function opciones(extra: Partial<OpcionesCalculo> = {}): OpcionesCalculo {
  return { antiguedadPct: 0, afiliacion: "no", incluirSAC: false, ...extra };
}

function puesto(tipo: TipoCargo, extra: Partial<Puesto> = {}): Puesto {
  return { tipo, cantHoras: 15, zonaPct: 0, presencialidad: true, ...extra };
}

/** Atajo: un puesto calculado con las opciones del mes de referencia. */
function calcular(
  tipo: TipoCargo,
  extra: Partial<Puesto> = {},
  opc: Partial<OpcionesCalculo> = {},
  configs: ConfiguracionesDelMes = CONFIGS
) {
  return calcularConceptosDePuesto(puesto(tipo, extra), configs, opciones(opc));
}

/** Atajo: varios puestos juntos. */
function reparto(
  puestos: readonly Puesto[],
  opc: Partial<OpcionesCalculo> = {},
  configs: ConfiguracionesDelMes = CONFIGS
) {
  return calcularPluriempleo(puestos, configs, opciones(opc));
}

describe("valores del mes que usan los tests", () => {
  test("septiembre 2026 está en los dos historiales", () => {
    // Si alguien renombra o borra el mes, los valores de referencia de abajo
    // dejan de tener sentido, y conviene enterarse por un test y no por un recibo.
    assert.equal(BASICA.fecha, MES);
    assert.equal(IFDC.fecha, MES);
    // Septiembre 2026 es el quinto tramo del 5% sobre los haberes de enero.
    assert.equal(BASICA.basicoCargo_Hora, 19276.63);
    assert.equal(IFDC.basicoCargo_Hora, 700048.41);
  });
});

describe("horas de secundaria", () => {
  test("el básico son las horas por el valor de la hora cátedra", () => {
    casiIgual(calcular("horaSecundaria", { cantHoras: 15 }).basico, 15 * 19276.63);
  });

  test("zona y antigüedad se calculan sobre el básico", () => {
    const r = calcular("horaSecundaria", { cantHoras: 15, zonaPct: 20 }, { antiguedadPct: 0.5 });
    casiIgual(r.pagoDeZona, r.basico * 0.2);
    casiIgual(r.pagoAntiguedad, r.basico * 0.5);
    // Total remunerativo a mano para este caso:
    // básico + complemento (145% desde septiembre 2026) + zona 20% + antigüedad 50%
    casiIgual(r.totalRemunerativo, r.basico * (1 + 1.45 + 0.2 + 0.5));
  });

  test("las sumas fijas se pagan por hora", () => {
    const r = calcular("horaSecundaria", { cantHoras: 10 });
    casiIgual(r.sumaNoRemunerativa, BASICA.sumaNoRemunerativa * 10);
    casiIgual(r.incentivoDocente, BASICA.fonid * 10);
  });

  test("el bono extraordinario se paga hasta 15 horas y de ahí para arriba es fijo", () => {
    const mayoB: ConfiguracionesDelMes = {
      basica: obtenerConfiguracionActual1("2026-05-B"),
      ifdc: obtenerConfiguracionActual2("2026-05-B"),
      seguros: segurosDelMes("2026-05-B"),
    };
    const diez = calcular("horaSecundaria", { cantHoras: 10 }, {}, mayoB);
    const veinte = calcular("horaSecundaria", { cantHoras: 20 }, {}, mayoB);
    casiIgual(diez.bonoExtraordinario, 20000 * 10);
    casiIgual(veinte.bonoExtraordinario, 20000 * 15);
  });

  test("más horas siempre dan un bruto mayor", () => {
    assert.ok(
      calcular("horaSecundaria", { cantHoras: 25 }).totalBruto >
        calcular("horaSecundaria", { cantHoras: 5 }).totalBruto
    );
  });
});

describe("cargos que no se cobran por hora", () => {
  test("el preceptor no cambia con la cantidad de horas", () => {
    // Comportamiento heredado del formulario viejo: el preceptor es un cargo
    // fijo y la cantidad de horas no lo modifica.
    casiIgual(
      calcular("preceptor", { cantHoras: 5 }).totalBruto,
      calcular("preceptor", { cantHoras: 30 }).totalBruto
    );
  });

  test("los cargos de primaria e inicial suman el adicional por cargo", () => {
    const tipos = [
      "maestroGrado",
      "maestroCelador",
      "maestroJardin",
      "educacionEspecialInicial",
      "maestroEspecialInicial",
      "auxiliarDocente",
      "asesorPedagogico",
    ] as const;
    for (const tipo of tipos) {
      const r = calcular(tipo);
      casiIgual(r.adicionalPorCargo, r.basico * BASICA.porcentajes.adicionalCargo);
      assert.ok(r.adicionalPorCargo > 0, `${tipo} no sumó el adicional por cargo`);
    }
  });

  test("el monto de aula de cada cargo sale de sus horas, no de un valor fijo", () => {
    // Decreto N° 3864-MHIP-2026: 6.250 por hora reloj frente a alumnos.
    const esperado: [TipoCargo, number][] = [
      ["maestroGrado", 125000], // 20 horas
      ["educacionEspecialInicial", 125000], // 20 horas
      ["maestroJardin", 93750], // 15 horas
      ["auxiliarDocente", 93750], // 15 horas
      ["maestroEspecialInicial", 43750], // 7 horas (10 horas cátedra)
    ];
    for (const [tipo, monto] of esperado) {
      const con = calcular(tipo, { presencialidad: true });
      const sin = calcular(tipo, { presencialidad: false });
      casiIgual(con.enseñanzaEnAula, monto, 1e-6, `${tipo}:`);
      casiIgual(sin.enseñanzaEnAula, 0, 1e-6, `${tipo} sin presentismo:`);
    }
  });

  test("enseñanza en el aula: depende del presentismo en grado", () => {
    const con = calcular("maestroGrado", { presencialidad: true });
    const sin = calcular("maestroGrado", { presencialidad: false });
    casiIgual(con.enseñanzaEnAula, 125000);
    casiIgual(sin.enseñanzaEnAula, 0);
    casiIgual(con.totalRemunerativo - sin.totalRemunerativo, 125000);
  });

  test("enseñanza en el aula: en jardín es más chico y también depende del presentismo", () => {
    // Decreto N° 3864-MHIP-2026: 93.750 para jardín (15 horas reloj) contra
    // 125.000 del maestro de grado (20 horas reloj). Antes la calculadora le
    // pagaba 125.000 siempre, sin mirar el presentismo.
    const con = calcular("maestroJardin", { presencialidad: true });
    const sin = calcular("maestroJardin", { presencialidad: false });
    casiIgual(con.enseñanzaEnAula, 93750);
    casiIgual(sin.enseñanzaEnAula, 0);
  });

  test("enseñanza en el aula: el maestro celador no cobra el ítem", () => {
    // El 259p no figura entre las funciones del Decreto N° 3864-MHIP-2026.
    casiIgual(calcular("maestroCelador", { presencialidad: true }).enseñanzaEnAula, 0);
  });

  test("el asesor pedagógico es un cargo, no horas: ni horas ni presentismo", () => {
    const r = calcular("asesorPedagogico");
    const definicion = definicionDe("asesorPedagogico");
    assert.equal(definicion.usaHoras, false);
    assert.equal(definicion.usaPresencialidad, false);
    assert.equal(definicion.usaZona, true);
    casiIgual(r.enseñanzaEnAula, 0);
    // Sí cobra el adicional por cargo del 33%, como el resto de los cargos.
    casiIgual(r.adicionalPorCargo, r.basico * BASICA.porcentajes.adicionalCargo);
  });

  test("el asesor pedagógico se puede elegir en primaria y en secundaria", () => {
    const definicion = definicionDe("asesorPedagogico");
    assert.deepEqual([...definicion.niveles], ["primario", "secundario"]);
    assert.ok(cargosDelNivel("primario").some((cargo) => cargo.tipo === "asesorPedagogico"));
    assert.ok(cargosDelNivel("secundario").some((cargo) => cargo.tipo === "asesorPedagogico"));
  });
});

describe("nivel superior (I.F.D.C.)", () => {
  test("tiempo completo usa el valor de la hora del historial del superior", () => {
    // Si el motor eligiera la escala de primaria y media, este test fallaría.
    casiIgual(calcular("ifdcTiempoCompleto").basico, IFDC.basicoCargo_Hora);
  });

  test("semi y full time se prorratean sobre las 30 horas", () => {
    // Los coeficientes salen del recibo, redondeados a mano (0,83333 y
    // 1,166668931), así que no dan exactamente 25/30 ni 35/30.
    casiIgual(
      calcular("ifdcSemiExclusivo").basico,
      IFDC.basicoCargo_Hora * COEFICIENTES_CARGOS.ifdcSemiExclusivo
    );
    casiIgual(
      calcular("ifdcFullTime").basico,
      IFDC.basicoCargo_Hora * COEFICIENTES_CARGOS.ifdcFullTime
    );
    const margen = IFDC.basicoCargo_Hora * 0.001;
    casiIgual(calcular("ifdcSemiExclusivo").basico, IFDC.basicoCargo_Hora * (25 / 30), margen);
    casiIgual(calcular("ifdcFullTime").basico, IFDC.basicoCargo_Hora * (35 / 30), margen);
  });

  test("el nivel superior no cobra zona", () => {
    casiIgual(calcular("ifdcFullTime", { zonaPct: 100 }).pagoDeZona, 0);
  });

  test("el adicional por dedicación sí se suma al total", () => {
    // Es el bug anotado en el backlog: antes se mostraba en la tabla pero no
    // entraba en el total, así que la tabla no cerraba consigo misma.
    const r = calcular("ifdcFullTime");
    casiIgual(r.adicionalPorDedicacion, r.basico * IFDC.porcentajes.adicionalCargo);
    casiIgual(
      r.totalRemunerativo,
      r.basico + r.complementoRemunerativo + r.adicionalPorDedicacion + r.pagoAntiguedad
    );
  });
});

describe("los totales siempre cierran", () => {
  const tipos: TipoCargo[] = CARGOS.map((cargo) => cargo.tipo);

  test("cada cargo suma sus partes y no devuelve valores raros", () => {
    for (const tipo of tipos) {
      const r = calcular(
        tipo,
        { cantHoras: 12, zonaPct: definicionDe(tipo).usaZona ? 40 : 0, presencialidad: true },
        { antiguedadPct: 0.7 }
      );

      casiIgual(
        r.totalRemunerativo,
        r.basico +
          r.complementoRemunerativo +
          r.adicionalPorCargo +
          r.adicionalPorDedicacion +
          r.pagoDeZona +
          r.pagoAntiguedad +
          r.enseñanzaEnAula
      );
      casiIgual(
        r.totalNoRemunerativo,
        r.complementoNoRemunerativo +
          r.sumaNoRemunerativa +
          r.incentivoDocente +
          r.bonoExtraordinario
      );
      casiIgual(r.totalBruto, r.totalRemunerativo + r.totalNoRemunerativo);

      for (const [nombre, valor] of Object.entries(r)) {
        assert.ok(Number.isFinite(valor), `${tipo}: ${nombre} no es un número finito`);
        assert.ok(valor >= 0, `${tipo}: ${nombre} dio negativo (${valor})`);
      }
      assert.ok(r.totalBruto > 0, `${tipo}: el bruto dio cero`);
    }
  });

  test("cerrarTotales no inventa plata", () => {
    const r = cerrarTotales({
      basico: 100,
      pagoDeZona: 20,
      pagoAntiguedad: 10,
      complementoRemunerativo: 140,
      adicionalPorCargo: 0,
      adicionalPorDedicacion: 0,
      enseñanzaEnAula: 0,
      complementoNoRemunerativo: 97,
      sumaNoRemunerativa: 5,
      incentivoDocente: 3,
      bonoExtraordinario: 0,
    });
    assert.equal(r.totalRemunerativo, 270);
    assert.equal(r.totalNoRemunerativo, 105);
    assert.equal(r.totalBruto, 375);
  });
});

describe("varios cargos juntos", () => {
  const secundaria = puesto("horaSecundaria", { cantHoras: 15, zonaPct: 20 });
  const preceptor = puesto("preceptor", { zonaPct: 0 });
  const comunes = { antiguedadPct: 0.3, afiliacion: "amet" } as const;

  test("los conceptos de dos puestos son la suma de cada uno por separado", () => {
    const uno = calcularConceptosDePuesto(secundaria, CONFIGS, opciones(comunes));
    const dos = calcularConceptosDePuesto(preceptor, CONFIGS, opciones(comunes));
    const juntos = reparto([secundaria, preceptor], comunes);

    casiIgual(juntos.conceptos.basico, uno.basico + dos.basico);
    casiIgual(juntos.conceptos.pagoDeZona, uno.pagoDeZona + dos.pagoDeZona);
    casiIgual(juntos.conceptos.pagoAntiguedad, uno.pagoAntiguedad + dos.pagoAntiguedad);
    casiIgual(juntos.conceptos.totalRemunerativo, uno.totalRemunerativo + dos.totalRemunerativo);
    casiIgual(juntos.conceptos.totalBruto, uno.totalBruto + dos.totalBruto);
  });

  test("devuelve el detalle de cada puesto, en orden", () => {
    const juntos = reparto([secundaria, preceptor], comunes);
    assert.equal(juntos.puestos.length, 2);
    assert.equal(juntos.puestos[0]?.puesto.tipo, "horaSecundaria");
    assert.equal(juntos.puestos[1]?.puesto.tipo, "preceptor");
  });

  test("los seguros fijos se descuentan una sola vez, no por cargo", () => {
    const uno = reparto([secundaria], comunes);
    const otro = reparto([preceptor], comunes);
    const juntos = reparto([secundaria, preceptor], comunes);

    assert.equal(juntos.descuentos.seguroObligatorio, SEGUROS.seguroObligatorio);
    casiIgual(juntos.descuentos.total, uno.descuentos.total + otro.descuentos.total - segurosFijos());
    assert.ok(juntos.descuentos.total < uno.descuentos.total + otro.descuentos.total);
  });

  test("el aguinaldo sale del remunerativo de todos los puestos", () => {
    const juntos = reparto([secundaria, preceptor], comunes);
    casiIgual(juntos.aguinaldo.bruto, juntos.conceptos.totalRemunerativo / 2);
    // 19% de ley + 1,5% sindical
    casiIgual(juntos.aguinaldo.neto, juntos.aguinaldo.bruto * (1 - 0.19 - 0.015));
  });

  test("el aguinaldo se suma al bolsillo solo si se pidió", () => {
    const sin = reparto([secundaria], { incluirSAC: false });
    const con = reparto([secundaria], { incluirSAC: true });
    casiIgual(con.totalBolsillo - sin.totalBolsillo, con.aguinaldo.neto);
  });

  test("con tres puestos tampoco se pierde ningún concepto", () => {
    const tres = reparto(
      [secundaria, preceptor, puesto("ifdcFullTime")],
      comunes
    );
    const sumaBrutos = tres.puestos.reduce((total, p) => total + p.conceptos.totalBruto, 0);
    casiIgual(tres.conceptos.totalBruto, sumaBrutos);
  });

  test("sin puestos no rompe (todo en cero)", () => {
    const vacio = reparto([]);
    assert.equal(vacio.puestos.length, 0);
    assert.equal(vacio.conceptos.totalBruto, 0);
    assert.equal(vacio.descuentos.total, segurosFijos());
    assert.ok(Number.isFinite(vacio.totalBolsillo));
  });

  test("un solo puesto da el mismo bolsillo que calcular ese puesto solo", () => {
    const solo = calcularConceptosDePuesto(secundaria, CONFIGS, opciones(comunes));
    const juntos = reparto([secundaria], comunes);
    casiIgual(juntos.conceptos.totalBruto, solo.totalBruto);
    casiIgual(
      juntos.totalBolsillo,
      solo.totalBruto - calcularDescuentos(solo.totalRemunerativo, "amet", SEGUROS).total
    );
  });
});

describe("descuentos y aguinaldo", () => {
  const remunerativo = 100000;

  test("los porcentajes de ley son 11 + 2 + 6", () => {
    const d = calcularDescuentos(remunerativo, "no", SEGUROS);
    casiIgual(d.jubilacion, 11000);
    casiIgual(d.jubilacionRegEsp, 2000);
    casiIgual(d.obraSocial, 6000);
    casiIgual(d.sindical, 0);
    casiIgual(d.total, 19000 + segurosFijos());
  });

  test("los seguros llegan por parámetro y son los del mes", () => {
    // El obligatorio cambia con el tiempo; el social y el mutual no.
    assert.equal(SEGUROS.seguroObligatorio, 5596.68); // septiembre 2026, según recibo
    assert.equal(SEGUROS.seguroSocial, 100);
    assert.equal(SEGUROS.seguroMutual, 10);
    const otroMes = calcularDescuentos(remunerativo, "no", segurosDelMes("2026-02"));
    assert.equal(otroMes.seguroObligatorio, 4701.21); // febrero 2026, según recibo
    assert.notEqual(otroMes.total, calcularDescuentos(remunerativo, "no", SEGUROS).total);
  });

  test("el descuento sindical aparece solo si está afiliado", () => {
    for (const afiliacion of ["amet", "uda"] as const) {
      casiIgual(calcularDescuentos(remunerativo, afiliacion, SEGUROS).sindical, 1500);
    }
    for (const afiliacion of AFILIACIONES) {
      const d = calcularDescuentos(remunerativo, afiliacion.valor, SEGUROS);
      assert.ok(Number.isFinite(d.sindical));
      assert.ok(d.total > 0);
    }
  });

  test("el aguinaldo es la mitad del remunerativo menos 19%", () => {
    const a = calcularAguinaldo(remunerativo, "no");
    casiIgual(a.bruto, 50000);
    casiIgual(a.neto, 50000 * 0.81);
  });

  test("el aguinaldo del afiliado descuenta también el sindical", () => {
    casiIgual(calcularAguinaldo(remunerativo, "uda").neto, 50000 * (1 - 0.19 - 0.015));
  });
});

describe("catálogo y escalas", () => {
  test("cada cargo aparece una sola vez y tiene al menos un nivel", () => {
    const tipos = CARGOS.map((cargo) => cargo.tipo);
    assert.equal(new Set(tipos).size, tipos.length, "hay un cargo repetido en el catálogo");
    for (const cargo of CARGOS) {
      assert.deepEqual(
        [...definicionDe(cargo.tipo).niveles],
        [...cargo.niveles],
        `${cargo.tipo} no coincide con su definición`
      );
      assert.ok(cargo.niveles.length > 0, `${cargo.tipo} no tiene ningún nivel`);
      assert.ok(cargo.etiqueta.length > 0);
      assert.ok(cargo.escala === "basica" || cargo.escala === "ifdc");
    }
  });

  test("solo los cargos del superior usan la escala del I.F.D.C.", () => {
    for (const cargo of CARGOS) {
      assert.equal(
        cargo.escala === "ifdc",
        cargo.niveles.includes("superior"),
        `${cargo.tipo} tiene la escala cruzada`
      );
    }
  });

  test("todos los niveles tienen al menos un cargo", () => {
    for (const nivel of ["inicial", "primario", "secundario", "superior"] as const) {
      assert.ok(cargosDelNivel(nivel).length > 0, `el nivel ${nivel} quedó vacío`);
    }
  });

  test("la escala de antigüedad es la del estatuto y no baja nunca", () => {
    assert.equal(ESCALA_ANTIGUEDAD.length, 12);
    assert.equal(porcentajeAntiguedad(0), 0);
    assert.equal(porcentajeAntiguedad(5), 0.5);
    assert.equal(porcentajeAntiguedad(11), 1.2);
    let anterior = -1;
    for (const tramo of ESCALA_ANTIGUEDAD) {
      assert.ok(tramo.porcentaje > anterior, `la escala no crece en ${tramo.etiqueta}`);
      anterior = tramo.porcentaje;
    }
  });

  test("un índice de antigüedad inexistente no rompe (devuelve 0)", () => {
    assert.equal(porcentajeAntiguedad(99), 0);
    assert.equal(porcentajeAntiguedad(-1), 0);
  });
});

describe("el motor reproduce el recibo de septiembre 2026", () => {
  // Recibo real de 3 hs cátedra de secundaria, zona 80% y 10 años de antigüedad
  // (dependencia 32669). Es el caso que destapó que el reparto de los
  // complementos había cambiado de 140/97 a 145/92 en septiembre: el valor del
  // historial estaba viejo y los importes no cerraban contra el recibo.
  const puesto: Puesto = {
    id: 1,
    tipo: "horaSecundaria" as TipoCargo,
    cantHoras: 3,
    zonaPct: 80,
    presencialidad: "sin",
  };
  const opciones: OpcionesCalculo = { antiguedadPct: 0.5, afiliacion: "amet", incluirSAC: false };
  const r = calcularConceptosDePuesto(puesto, CONFIGS, opciones);

  test("los ítems del recibo, uno por uno", () => {
    // La tolerancia es de un centavo: el motor calcula con toda la precisión y
    // el recibo muestra cada ítem ya redondeado. Con la tolerancia por defecto
    // (1e-6) fallaría por fracciones como 83.853,3405 contra 83.853,34.
    const c = 0.01;
    casiIgual(r.basico, 57829.89, c);                      // 007-20, 3 hs
    casiIgual(r.complementoRemunerativo, 83853.34, c);     // 100-22, 145%
    casiIgual(r.pagoDeZona, 46263.91, c);                  // 184-00, 80%
    casiIgual(r.pagoAntiguedad, 28914.95, c);              // 102-11, 50%
    casiIgual(r.complementoNoRemunerativo, 53203.50, c);   // 100-23, 92%
    casiIgual(r.sumaNoRemunerativa, 14002.45, c);          // 099-41
    casiIgual(r.incentivoDocente, 5740.00, c);             // 090-11
  });

  test("los subtotales del recibo", () => {
    const c = 0.06; // la suma de los redondeos de cada ítem
    casiIgual(r.totalRemunerativo, 216862.09, c);
    casiIgual(r.totalNoRemunerativo, 72945.95, c);
  });
});

describe("los porcentajes del encabezado suman 100% del neto", () => {
  // Junto al nombre de cada concepto se muestra qué parte del NETO aporta ese
  // concepto, y los dos suman 100% porque entre los dos forman el neto.
  //
  // La cuenta: a lo remunerativo se le restan los descuentos (que es como se
  // liquidan de verdad: las alícuotas se aplican sobre el total remunerativo) y
  // lo no remunerativo no tiene retenciones. Con R 60, NR 40 y un descuento de
  // 10 sobre un bruto de 100, el neto es 90 y del neto aportan 50 y 40, o sea
  // 55,6% y 44,4%.
  //
  // Prorratear los descuentos entre los dos sería un error: la cuenta se
  // cancelaría y devolvería el mismo número que el porcentaje del bruto.

  /** Los porcentajes del encabezado, como los calcula el motor. */
  function porcentajesDelNeto(puestos: readonly Puesto[], opc: OpcionesCalculo) {
    const r = calcularPluriempleo(puestos, CONFIGS, opc);
    const bruto = r.conceptos.totalBruto;
    const descuentos = r.descuentos.total;
    const neto = bruto - descuentos;
    const netoRemunerativo = r.conceptos.totalRemunerativo - descuentos;
    const netoNoRemunerativo = r.conceptos.totalNoRemunerativo;
    return {
      remunerativo: netoRemunerativo / neto * 100,
      noRemunerativo: netoNoRemunerativo / neto * 100,
      netoRemunerativo,
      netoNoRemunerativo,
      neto,
      bruto,
    };
  }

  /** Los porcentajes del bruto, que van dentro de cada desplegable. */
  function porcentajesDelBruto(puestos: readonly Puesto[], opc: OpcionesCalculo) {
    const r = calcularPluriempleo(puestos, CONFIGS, opc);
    const bruto = r.conceptos.totalBruto;
    return {
      remunerativo: r.conceptos.totalRemunerativo / bruto * 100,
      noRemunerativo: r.conceptos.totalNoRemunerativo / bruto * 100,
    };
  }

  const unPuesto: Puesto[] = [
    { id: 1, tipo: "horaSecundaria" as TipoCargo, cantHoras: 15, zonaPct: 20, presencialidad: "sin" },
  ];
  const opc: OpcionesCalculo = { antiguedadPct: 0.5, afiliacion: "amet", incluirSAC: false };

  test("remunerativos + no remunerativos = 100%", () => {
    const p = porcentajesDelNeto(unPuesto, opc);
    casiIgual(p.remunerativo + p.noRemunerativo, 100, 0.01);
  });

  test("las dos partes suman el neto del mes", () => {
    const p = porcentajesDelNeto(unPuesto, opc);
    casiIgual(p.netoRemunerativo + p.netoNoRemunerativo, p.neto, 0.01);
  });

  test("el remunerativo aporta menos al neto que al bruto", () => {
    // Es el punto de todo el criterio: como los descuentos salen del
    // remunerativo, su parte del neto es menor que su parte del bruto.
    const neto = porcentajesDelNeto(unPuesto, opc);
    const bruto = porcentajesDelBruto(unPuesto, opc);
    assert.ok(
      neto.remunerativo < bruto.remunerativo,
      `el remunerativo sobre el neto (${neto.remunerativo}) tendría que ser menor ` +
      `que sobre el bruto (${bruto.remunerativo})`
    );
    // Y el no remunerativo hace lo contrario, porque no tiene retenciones.
    assert.ok(neto.noRemunerativo > bruto.noRemunerativo);
  });

  test("el porcentaje del bruto no se usa para el encabezado", () => {
    // Deja documentado el error anterior: si se prorratean los descuentos entre
    // los dos conceptos, la cuenta se cancela y el resultado es idéntico al del
    // bruto. Por eso los dos valores coincidían.
    const r = calcularPluriempleo(unPuesto, CONFIGS, opc);
    const bruto = r.conceptos.totalBruto;
    const neto = bruto - r.descuentos.total;
    const tasa = (bruto - neto) / bruto;
    const prorrateado = (r.conceptos.totalRemunerativo * (1 - tasa)) / neto * 100;
    const directo = r.conceptos.totalRemunerativo / bruto * 100;
    casiIgual(prorrateado, directo, 0.01);
  });

  test("con aguinaldo incluido los dos siguen sumando 100", () => {
    const p = porcentajesDelNeto(unPuesto, { ...opc, incluirSAC: true });
    // El aguinaldo no entra en esta cuenta: es un pago aparte, no integra el
    // neto del mes. Así que la suma de los dos conceptos sigue dando 100.
    casiIgual(p.remunerativo + p.noRemunerativo, 100, 0.01);
  });

  test("con el recibo de septiembre: 69,6% y 30,4%", () => {
    // Comprobación contra el caso real de 3 hs cátedra, zona 80% y 10 años.
    const recibo: Puesto[] = [
      { id: 1, tipo: "horaSecundaria" as TipoCargo, cantHoras: 3, zonaPct: 80, presencialidad: "sin" },
    ];
    const p = porcentajesDelNeto(recibo, {
      antiguedadPct: 0.5,
      afiliacion: "amet",
      incluirSAC: false,
    });
    casiIgual(p.neto, 239644.63, 0.10);
    casiIgual(p.remunerativo, 69.6, 0.1);
    casiIgual(p.noRemunerativo, 30.4, 0.1);
  });
});
