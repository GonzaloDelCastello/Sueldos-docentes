// historial.ts

// COEFICIENTES DE CARGOS (Relación fija respecto a 1 Hora Cátedra)
// Calculados en base a Noviembre 2025. Se asume que esta relación es estable.
export const COEFICIENTES_CARGOS = {
    horaSecundaria: 1.000,   // Base referencia
    preceptor: 14.1347,       // ($217,975 / $15,421)
    maestroGrado: 14.997378,    // ($231,279 / $15,421)
    maestroJardin: 15.1964,   // ($234,349 / $15,421)
    maestroCelador: 17.1871   // ($252,909 / $15,421)
};

// Relación matemática basada en los Puntos del Estatuto (Art. 64).
// Base: 1 Hora Cátedra (15 puntos) = 1.0
export const COEFICIENTES_CARGOS1 = {
    horaSecundaria: 1.000,   // Base (15 pts)
    preceptor: 14.200,       // 213 pts / 15
    maestroGrado: 15.067,    // 226 pts / 15
    maestroJardin: 15.267,   // 229 pts / 15
    maestroCelador: 17.267,  // 259 pts / 15
    directorBase: 18.000,    // 270 pts / 15
    viceDirectorBase: 18.000 // 270 pts / 15
    // Puedes agregar más cargos aquí dividiendo sus puntos por 15
};

// Definimos la estructura de datos para TypeScript
export interface ConfiguracionBase {
    fecha: string;
    descripcion: string;
    basicoCargo_Hora: number; // EL VALOR CLAVE
    porcentajes: {
        remunerativo: number;    // Ítem 100-22
        noRemunerativo: number;  // Ítem 100-23
        adicionalCargo: number;  // Por defecto 0.33
    };
    adicionalPorDedicacion: number;  
    fonid: number;          // Valor por hora/cargo
    sumaNoRemunerativa: number;   // Valor por hora/cargo;
}
// Configuración Salarial Inicial, primaria y media
export interface ConfiguracionSalarial1 extends ConfiguracionBase {
    fecha: string;            // Formato YYYY-MM
    descripcion: string;      // Nombre del aumento (ej: "Enero 2025")
    basicoCargo_Hora: number; // EL VALOR CLAVE
    porcentajes: {
        remunerativo: number;    // Ítem 100-22 (ej: 1.30 para 130%)
        noRemunerativo: number;  // Ítem 100-23 (ej: 1.07 para 107%)
        adicionalCargo: number;  // Por defecto 0.33
    };
    fonid: number;           // Monto fijo de FONID
    sumaNoRemunerativa: number; // Monto fijo de Suma No Remunerativa
   
}
// Configuración Salarial IFDC
export interface ConfiguracionSalarial2 extends ConfiguracionBase {
    fecha: string;            // Formato YYYY-MM
    descripcion: string;      // Nombre del aumento (ej: "Enero 2025")
    basicoCargo_Hora: number; // EL VALOR CLAVE
    porcentajes: {
        remunerativo: number;    // Ítem 100-22 (ej: 1.30 para 130%)
        noRemunerativo: number;  // Ítem 100-23 (ej: 1.07 para 107%)
        adicionalCargo: number;  // Por defecto 0.33
    };
    adicionalPorDedicacion: number;  // Por defecto 0.33
    fonid: number;           // Monto fijo de FONID
    sumaNoRemunerativa: number; // Monto fijo de Suma No Remunerativa
   
}



// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN DE INICIAL PRIMARIA Y MEDIA
export function obtenerConfiguracionActual1(fecha?: string): ConfiguracionBase {
    // Si no pasan fecha, devolvemos la última (la más reciente)
    if (!fecha) {
        return HISTORIAL_BASICA[HISTORIAL_BASICA.length - 1]!;
    }
    
    // Lógica para buscar por fecha (aquí simplificada para devolver la última por ahora)
    return HISTORIAL_BASICA[HISTORIAL_BASICA.length - 1]!;
}

// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN DE INICIAL PRIMARIA Y MEDIA
export function obtenerConfiguracionActual2(fecha?: string): ConfiguracionBase {
    // Si no pasan fecha, devolvemos la última (la más reciente)
    if (!fecha) {
        return HISTORIAL_IFDC[HISTORIAL_IFDC.length - 1]!;
    }
    
    // Lógica para buscar por fecha (aquí simplificada para devolver la última por ahora)
    return HISTORIAL_IFDC[HISTORIAL_IFDC.length - 1]!;
}

// FUNCIÓN PARA CALCULAR BÁSICO DE CUALQUIER CARGO
export function calcularBasicoCargo(tipoCargo: keyof typeof COEFICIENTES_CARGOS, config: ConfiguracionSalarial1): number {
    return config.basicoCargo_Hora * COEFICIENTES_CARGOS[tipoCargo];
}

// HISTORIAL DE AUMENTOS SALARIALES - CARGOS (Primaria y Media)
export const HISTORIAL_BASICA: ConfiguracionSalarial1[] = [
    {
        fecha: "2025-01",
        descripcion: "Inicio 2025",
        basicoCargo_Hora: 11339.19, // 
        porcentajes: {
            remunerativo: 1.04,      // 104% 
            noRemunerativo: 1.33,    // 133% 
            adicionalCargo: 0.33
        },
        fonid: 28700, // Por hs cátedra
        sumaNoRemunerativa: 4667.33333, //Por hs cátedra
        adicionalPorDedicacion: 0
    },
    {
        fecha: "2025-11",
        descripcion: "Actualización Noviembre",
        basicoCargo_Hora: 15421.30, // [cite: 534]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.33333, //Por hs cátedra
        adicionalPorDedicacion: 0
    }
    // Aquí podrás agregar futuros aumentos simplemente copiando un bloque y cambiando fecha/valores.
];
// HISTORIAL DE AUMENTOS SALARIALES - IFDC
export const HISTORIAL_IFDC: ConfiguracionSalarial2[] = [

    {
        fecha: "2025-11", // NOVIEMBRE 2025
        descripcion: "Actualización Noviembre",
        basicoCargo_Hora: 560038.73, // (Tu valor de hora secundaria)
        porcentajes: { 
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        adicionalPorDedicacion: 195991.33 // Corregir
    }
    // },
    // {
    //     fechaVigencia: "2025-07-01", // JULIO 2025
    //     basicoCargo_Hora: 0, 
    //     basicoIFDC: 540859.32, // <--- Básico del recibo Jul
    //     porcentajes: { remunerativo: 0, noRemunerativo: 0, adicionalCargo: 0 },
    //     porcentajesIFDC: { 
    //         remunerativo: 0.60,    // 60%
    //         noRemunerativo: 0.35   // 35%
    //     },
    //     fijos: { conectividad: 0, fonid: 28700 }
    // },
    // {
    //     fechaVigencia: "2025-02-01", // FEBRERO 2025
    //     basicoCargo_Hora: 0, 
    //     basicoIFDC: 431536.69, // <--- Básico del recibo Feb
    //     porcentajes: { remunerativo: 0, noRemunerativo: 0, adicionalCargo: 0 },
    //     porcentajesIFDC: { 
    //         remunerativo: 0.54,    // 54%
    //         noRemunerativo: 0.41   // 41%
    //     },
    //     fijos: { conectividad: 0, fonid: 28700 }
    // }
    // // ...
];
