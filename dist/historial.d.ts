export declare const COEFICIENTES_CARGOS: {
    horaSecundaria: number;
    preceptor: number;
    maestroGrado: number;
    maestroJardin: number;
    maestroCelador: number;
};
export declare const COEFICIENTES_CARGOS1: {
    horaSecundaria: number;
    preceptor: number;
    maestroGrado: number;
    maestroJardin: number;
    maestroCelador: number;
    directorBase: number;
    viceDirectorBase: number;
};
export interface ConfiguracionSalarial {
    fecha: string;
    descripcion: string;
    basicoHoraCatedra: number;
    porcentajes: {
        remunerativo: number;
        noRemunerativo: number;
        adicionalCargo: number;
    };
    fonid: number;
    sumaNoRemunerativa: number;
}
export declare const HISTORIAL_AUMENTOS: ConfiguracionSalarial[];
export declare function obtenerConfiguracionActual(fecha?: string): ConfiguracionSalarial;
export declare function calcularBasicoCargo(tipoCargo: keyof typeof COEFICIENTES_CARGOS, config: ConfiguracionSalarial): number;
//# sourceMappingURL=historial.d.ts.map