/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
import type { MesInflacion } from "./inflacion.js";

/**
 * Cálculos puros de comparación salario vs. inflación.
 *
 * "Puro" quiere decir tres cosas:
 *   1. El resultado depende SOLO de los argumentos (no lee el DOM ni variables globales).
 *   2. No modifica nada de afuera (no escribe en el DOM, no muta los arrays que recibe).
 *   3. Dado el mismo input, devuelve siempre el mismo output.
 *
 * Por eso este archivo se puede importar y probar en Node, sin navegador.
 * Los datos llegan por parámetro: eso se llama inyección de dependencias.
 */

/** Forma mínima que necesita el cálculo: cualquier cosa con un valor de hora. */
export interface PuntoBasico {
  valorHora: number;
}

export interface VariacionSalarial {
  basicoInicio: number;
  basicoFin: number;
  diferenciaAbsoluta: number;
  diferenciaPorcentual: number;
}

/**
 * Inflación acumulada entre dos meses, ambos inclusive, en porcentaje.
 * Los meses se comparan como texto porque el formato "YYYY-MM" ordena
 * alfabéticamente igual que cronológicamente.
 */
export function calcularInflacionAcumulada(
  historial: readonly MesInflacion[],
  mesInicio: string,
  mesFin: string
): number {
  let acumulado = 1;
  for (const mes of historial) {
    if (mes.fecha >= mesInicio && mes.fecha <= mesFin) {
      acumulado *= 1 + mes.inflacionMensual / 100;
    }
  }
  return (acumulado - 1) * 100;
}

/**
 * Variación del valor de la hora cátedra entre dos meses.
 * Si falta el mes de inicio (o vale 0) devuelve 0% en vez de dividir por cero.
 */
export function calcularVariacionSalarial(
  historial: Readonly<Record<string, PuntoBasico>>,
  mesInicio: string,
  mesFin: string
): VariacionSalarial {
  const basicoInicio = historial[mesInicio]?.valorHora ?? 0;
  const basicoFin = historial[mesFin]?.valorHora ?? 0;

  return {
    basicoInicio,
    basicoFin,
    diferenciaAbsoluta: basicoFin - basicoInicio,
    diferenciaPorcentual:
      basicoInicio !== 0 ? (basicoFin / basicoInicio - 1) * 100 : 0,
  };
}

/**
 * Chequeo de integridad del historial de inflación.
 * Devuelve las fechas repetidas: un mes duplicado se acumula dos veces
 * y falsea el resultado. (Este chequeo existe por un bug real.)
 */
export function fechasDuplicadas(historial: readonly MesInflacion[]): string[] {
  const vistas = new Set<string>();
  const repetidas = new Set<string>();
  for (const mes of historial) {
    if (vistas.has(mes.fecha)) repetidas.add(mes.fecha);
    vistas.add(mes.fecha);
  }
  return [...repetidas];
}
