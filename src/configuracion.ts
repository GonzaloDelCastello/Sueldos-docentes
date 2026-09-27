import { obtenerConfiguracionActual1, obtenerConfiguracionActual2 } from "./historial.js";
import type { ConfiguracionesDelMes } from "./cargos.js";

/**
 * Busca en el historial las dos escalas del mes que se quiere calcular.
 *
 * Vive separado del motor de cálculo a propósito: el motor recibe los valores
 * ya resueltos (y por eso se puede probar sin datos), y este archivo es el único
 * que sabe de qué mes sacar qué escala.
 */
export function configuracionesDelMes(periodo: string): ConfiguracionesDelMes {
  return {
    basica: obtenerConfiguracionActual1(periodo),
    ifdc: obtenerConfiguracionActual2(periodo),
  };
}
