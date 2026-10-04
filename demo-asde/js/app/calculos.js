/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
/**
 * Inflación acumulada entre dos meses, ambos inclusive, en porcentaje.
 * Los meses se comparan como texto porque el formato "YYYY-MM" ordena
 * alfabéticamente igual que cronológicamente.
 */
export function calcularInflacionAcumulada(historial, mesInicio, mesFin) {
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
export function calcularVariacionSalarial(historial, mesInicio, mesFin) {
    const basicoInicio = historial[mesInicio]?.valorHora ?? 0;
    const basicoFin = historial[mesFin]?.valorHora ?? 0;
    return {
        basicoInicio,
        basicoFin,
        diferenciaAbsoluta: basicoFin - basicoInicio,
        diferenciaPorcentual: basicoInicio !== 0 ? (basicoFin / basicoInicio - 1) * 100 : 0,
    };
}
/**
 * Chequeo de integridad del historial de inflación.
 * Devuelve las fechas repetidas: un mes duplicado se acumula dos veces
 * y falsea el resultado. (Este chequeo existe por un bug real.)
 */
export function fechasDuplicadas(historial) {
    const vistas = new Set();
    const repetidas = new Set();
    for (const mes of historial) {
        if (vistas.has(mes.fecha))
            repetidas.add(mes.fecha);
        vistas.add(mes.fecha);
    }
    return [...repetidas];
}
//# sourceMappingURL=calculos.js.map