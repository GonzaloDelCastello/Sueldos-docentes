/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
import { obtenerConfiguracionActual1, obtenerConfiguracionActual2, SEGURO_OBLIGATORIO_POR_MES, SEGUROS_FIJOS, } from "./historial.js";
/**
 * Busca en el historial todo lo que necesita el mes que se quiere calcular: las
 * dos escalas salariales y los seguros fijos del recibo.
 *
 * Vive separado del motor de cálculo a propósito: el motor recibe los valores
 * ya resueltos (y por eso se puede probar sin datos), y este archivo es el único
 * que sabe de dónde sacar cada cosa.
 */
export function configuracionesDelMes(periodo) {
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
export function seguroObligatorioDelMes(periodo) {
    const meses = Object.keys(SEGURO_OBLIGATORIO_POR_MES).sort();
    if (meses.length === 0)
        return 0;
    let elegido = meses[0];
    for (const mes of meses) {
        if (mes <= periodo)
            elegido = mes;
    }
    return SEGURO_OBLIGATORIO_POR_MES[elegido];
}
//# sourceMappingURL=configuracion.js.map