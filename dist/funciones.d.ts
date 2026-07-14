export declare let periodoCalculo: string;
export declare function setPeriodoCalculo(periodo: string): void;
export declare let incluirSAC: boolean;
export declare function setIncluirSAC(valor: boolean): void;
interface Resultados {
    basico?: number;
    pagoDeZona?: number;
    pagoAntiguedad?: number;
    complementoRemunerativo?: number;
    adicionalXCargo?: number;
    complementoNoRemunerativo?: number;
    pagoSumaNoRemunerativa?: number;
    pagoIncentivoDocente?: number;
    totalRemunerativo: number;
    totalNRemunerativo?: number;
    adicionalPorDedicacion?: number;
    totalBruto: number;
    asignacionXHijxs?: number;
    aguinaldoBruto?: number;
    aguinaldoNeto?: number;
    bonoExtraordinario?: number;
    enseñanzaEnAula?: number;
}
interface Descuentos {
    descuentoJubilacion: number;
    descuentoJubilacionRegEsp: number;
    descuentoObraSocial: number;
    descuentoSindical?: number;
    seguroObligatorio: number;
    totalDescuentos: number;
}
export declare function calculoZona(): number;
export declare function calcularAsignacionXHijxs(): number;
export declare function aPesos(valor: number): string;
export declare function mostrarResultadoActual(): void;
export declare function resetearResultados(): void;
export declare function crearGraficoTorta(resultados: Resultados, descuentos: Descuentos): void;
export declare function ejecutarComparativa(mesInicio: string, mesFin: string): {
    inflacion: number;
} | undefined;
export declare function compararPeriodo(mesInicio: string, mesFin: string): {
    inflacionPorcentual: number;
    variacionSalarial: number;
    basicoInicio: number;
    basicoFin: number;
};
export {};
//# sourceMappingURL=funciones.d.ts.map