import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  calcularInflacionAcumulada,
  calcularVariacionSalarial,
  fechasDuplicadas,
} from "../src/calculos.ts";
import { HISTORIAL_INFLACION } from "../src/inflacion.ts";
import { HISTORIAL_BASICO } from "../src/historial.ts";

/**
 * Los cálculos son con números decimales (punto flotante), así que casi nunca
 * dan exactamente igual: 1.10 * 1.20 puede dar 1.3199999999999998.
 * Por eso se compara con una tolerancia en lugar de con ===.
 */
function casiIgual(actual: number, esperado: number, tolerancia = 1e-6): void {
  assert.ok(
    Math.abs(actual - esperado) < tolerancia,
    `esperaba ${esperado} (± ${tolerancia}) pero obtuve ${actual}`
  );
}

// Un historial de mentira, chiquito y fácil de verificar a mano.
const INFLACION_FIXTURE = [
  { fecha: "2024-01", inflacionMensual: 10 },
  { fecha: "2024-02", inflacionMensual: 20 },
  { fecha: "2024-03", inflacionMensual: 0 },
];

describe("calcularInflacionAcumulada", () => {
  test("acumula los meses del rango (10% y 20% dan 32%, no 30%)", () => {
    // 1.10 * 1.20 = 1.32 -> 32%. La inflación se compone, no se suma.
    casiIgual(calcularInflacionAcumulada(INFLACION_FIXTURE, "2024-01", "2024-02"), 32);
  });

  test("incluye ambos extremos del rango", () => {
    // Si el mes final no se incluyera, daría 10% en vez de 32%.
    casiIgual(calcularInflacionAcumulada(INFLACION_FIXTURE, "2024-01", "2024-02"), 32);
    // Un rango de un solo mes devuelve la inflación de ese mes.
    casiIgual(calcularInflacionAcumulada(INFLACION_FIXTURE, "2024-02", "2024-02"), 20);
  });

  test("ignora los meses fuera del rango", () => {
    casiIgual(calcularInflacionAcumulada(INFLACION_FIXTURE, "2024-02", "2024-03"), 20);
  });

  test("devuelve 0 si no hay ningún mes en el rango", () => {
    assert.equal(calcularInflacionAcumulada(INFLACION_FIXTURE, "2025-01", "2025-06"), 0);
  });

  test("no modifica el historial que recibe", () => {
    const copia = structuredClone(INFLACION_FIXTURE);
    calcularInflacionAcumulada(INFLACION_FIXTURE, "2024-01", "2024-03");
    assert.deepEqual(INFLACION_FIXTURE, copia, "la función mutó el array de entrada");
  });
});

describe("calcularVariacionSalarial", () => {
  const BASICO_FIXTURE = {
    "2024-01": { valorHora: 100 },
    "2024-02": { valorHora: 150 },
  };

  test("calcula el porcentaje de suba (100 -> 150 es +50%)", () => {
    casiIgual(
      calcularVariacionSalarial(BASICO_FIXTURE, "2024-01", "2024-02").diferenciaPorcentual,
      50
    );
  });

  test("calcula la diferencia en pesos", () => {
    casiIgual(
      calcularVariacionSalarial(BASICO_FIXTURE, "2024-01", "2024-02").diferenciaAbsoluta,
      50
    );
  });

  test("devuelve 0% (y no rompe) si el mes de inicio no existe", () => {
    // Acá está el guard contra la división por cero: sin él daría Infinity.
    const r = calcularVariacionSalarial(BASICO_FIXTURE, "2023-01", "2024-02");
    assert.equal(r.basicoInicio, 0);
    assert.equal(r.diferenciaPorcentual, 0);
  });
});

describe("integridad de los datos del proyecto", () => {
  test("HISTORIAL_INFLACION no tiene meses repetidos", () => {
    // ESTE ES EL TEST QUE ATRAPA EL BUG DE JUNIO 2026:
    // un mes cargado dos veces se acumula dos veces en el cálculo.
    assert.deepEqual(
      fechasDuplicadas(HISTORIAL_INFLACION),
      [],
      "hay fechas repetidas en HISTORIAL_INFLACION"
    );
  });

  test("HISTORIAL_INFLACION no tiene meses salteados", () => {
    const fechas = HISTORIAL_INFLACION.map((m) => m.fecha);
    const esperadas = mesesEntre(fechas[0]!, fechas[fechas.length - 1]!);
    assert.deepEqual(fechas, esperadas, "falta algún mes en el medio del historial");
  });

  test("todos los meses del historial tienen un valor de hora positivo", () => {
    for (const [fecha, mes] of Object.entries(HISTORIAL_BASICO)) {
      assert.ok(mes.valorHora > 0, `${fecha} tiene valorHora = ${mes.valorHora}`);
    }
  });
});

describe("comparador con los datos reales", () => {
  test("2023-06 a 2026-06 acumula 624,24% de inflación", () => {
    // Valor de referencia calculado a mano sobre HISTORIAL_INFLACION.
    casiIgual(
      calcularInflacionAcumulada(HISTORIAL_INFLACION, "2023-06", "2026-06"),
      624.244285,
      0.001
    );
  });

  test("la hora cátedra subió de 4899,23 a 16963,43 en ese período", () => {
    const r = calcularVariacionSalarial(HISTORIAL_BASICO, "2023-06", "2026-06");
    assert.equal(r.basicoInicio, 4899.23);
    assert.equal(r.basicoFin, 16963.43);
  });
});

/** Devuelve todos los meses "YYYY-MM" entre dos fechas, ambos inclusive. */
function mesesEntre(desde: string, hasta: string): string[] {
  const meses: string[] = [];
  let [anio, mes] = desde.split("-").map(Number) as [number, number];
  const [anioFin, mesFin] = hasta.split("-").map(Number) as [number, number];
  while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
    meses.push(`${anio}-${String(mes).padStart(2, "0")}`);
    mes++;
    if (mes > 12) {
      mes = 1;
      anio++;
    }
  }
  return meses;
}
