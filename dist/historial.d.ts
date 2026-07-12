export declare const COEFICIENTES_CARGOS: {
    horaSecundaria: number;
    preceptor: number;
    maestroGrado: number;
    maestroJardin: number;
    maestroCelador: number;
    ifdcSemiExclusivo: number;
};
export declare const COEFICIENTES_CARGOS1: {
    horaSecundaria: number;
    preceptor: number;
    maestroGrado: number;
    maestroJardin: number;
    maestroCelador: number;
};
export interface ConfiguracionBase {
    fecha: string;
    descripcion: string;
    basicoCargo_Hora: number;
    porcentajes: {
        remunerativo: number;
        noRemunerativo: number;
        adicionalCargo: number;
    };
    fonid: number;
    sumaNoRemunerativa: number;
    bonoExtraordinario: number;
}
export interface ConfiguracionSalarial1 extends ConfiguracionBase {
    fecha: string;
    descripcion: string;
    basicoCargo_Hora: number;
    porcentajes: {
        remunerativo: number;
        noRemunerativo: number;
        adicionalCargo: number;
    };
    fonid: number;
    sumaNoRemunerativa: number;
    bonoExtraordinario: number;
}
export interface ConfiguracionSalarial2 extends ConfiguracionBase {
    fecha: string;
    descripcion: string;
    basicoCargo_Hora: number;
    porcentajes: {
        remunerativo: number;
        noRemunerativo: number;
        adicionalCargo: number;
    };
    fonid: number;
    sumaNoRemunerativa: number;
    bonoExtraordinario: number;
}
export declare function obtenerConfiguracionActual1(fecha: string): ConfiguracionBase;
export declare function obtenerConfiguracionActual2(fecha?: string): ConfiguracionBase;
export declare function calcularBasicoCargo(tipoCargo: keyof typeof COEFICIENTES_CARGOS, config: ConfiguracionSalarial1): number;
export declare const HISTORIAL_BASICA: ConfiguracionSalarial1[];
export declare const HISTORIAL_IFDC: ConfiguracionSalarial2[];
export interface MesBasico {
    valorHora: number;
    nota?: string;
}
export declare const HISTORIAL_BASICO: Record<string, MesBasico>;
//# sourceMappingURL=historial.d.ts.map