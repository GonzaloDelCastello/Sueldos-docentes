/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
import {
  obtenerConfiguracionActual1,
  obtenerConfiguracionActual2,
  SEGURO_OBLIGATORIO_POR_MES,
  SEGUROS_FIJOS,
} from "./historial.js";
import type { ConfiguracionesDelMes } from "./cargos.js";

/**
 * Busca en el historial todo lo que necesita el mes que se quiere calcular: las
 * dos escalas salariales y los seguros fijos del recibo.
 *
 * Vive separado del motor de cálculo a propósito: el motor recibe los valores
 * ya resueltos (y por eso se puede probar sin datos), y este archivo es el único
 * que sabe de dónde sacar cada cosa.
 */
export function configuracionesDelMes(periodo: string): ConfiguracionesDelMes {
  return {
    basica: obtenerConfiguracionActual1(periodo),
    ifdc: obtenerConfiguracionActual2(periodo),
    seguros: {
      seguroObligatorio: seguroObligatorioDelMes(periodo),
      seguroSocial: SEGUROS_FIJOS.social,
      seguroMutual: SEGUROS_FIJOS.mutual,
    },
  };
}

/**
 * El seguro obligatorio del mes. Como cambia cada tanto y no todos los meses,
 * se usa el último valor cargado que no sea posterior al mes pedido (el monto
 * sigue valiendo hasta que aparece el próximo aumento).
 */
export function seguroObligatorioDelMes(periodo: string): number {
  const meses = Object.keys(SEGURO_OBLIGATORIO_POR_MES).sort();
  if (meses.length === 0) return 0;

  let elegido = meses[0]!;
  for (const mes of meses) {
    if (mes <= periodo) elegido = mes;
  }
  return SEGURO_OBLIGATORIO_POR_MES[elegido]!;
}

/**
 * Los meses del semestre al que pertenece el período que todavía no tienen el
 * básico cargado (están en 0).
 *
 * Sirve para la base del aguinaldo: si un mes del semestre no tiene básico, su
 * remuneración es 0 y no puede ser la mejor, así que la base del SAC se calcula
 * con los meses que sí tienen datos. Pero eso hay que avisarlo, porque cuando se
 * cargue el básico de ese mes la base podría cambiar.
 */
export function mesesSinBasicoDelSemestre(periodo: string): string[] {
  const [anioTexto, mesTexto] = periodo.split("-");
  const anio = Number(anioTexto);
  const mes = Number(mesTexto);
  if (!Number.isFinite(anio) || !Number.isFinite(mes)) return [];

  // El segundo semestre va de julio a diciembre; el primero, de enero a junio.
  const arranque = mes >= 7 ? 7 : 1;
  const sinBasico: string[] = [];
  for (let m = arranque; m <= mes; m++) {
    const clave = `${anio}-${String(m).padStart(2, "0")}`;
    if (obtenerConfiguracionActual1(clave).basicoCargo_Hora <= 0) sinBasico.push(clave);
  }
  return sinBasico;
}
