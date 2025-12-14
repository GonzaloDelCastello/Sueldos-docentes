// historial.ts
// COEFICIENTES DE CARGOS (Relación fija respecto a 1 Hora Cátedra)
// Calculados en base a Noviembre 2025. Se asume que esta relación es estable.
export const COEFICIENTES_CARGOS = {
    horaSecundaria: 1.000, // Base referencia
    preceptor: 14.1347, // ($217,975 / $15,421)
    maestroGrado: 14.997378, // ($231,279 / $15,421)
    maestroJardin: 15.1964, // ($234,349 / $15,421)
    maestroCelador: 17.1871, // ($252,909 / $15,421)
    ifdcSemiExclusivo: 0.83333
};
// Relación matemática basada en los Puntos del Estatuto (Art. 64).
// Base: 1 Hora Cátedra (15 puntos) = 1.0
export const COEFICIENTES_CARGOS1 = {
    horaSecundaria: 1.000, // Base (15 pts)
    preceptor: 14.200, // 213 pts / 15
    maestroGrado: 15.067, // 226 pts / 15
    maestroJardin: 15.267, // 229 pts / 15
    maestroCelador: 17.267 // 259 pts / 15
    // directorBase: 18.000,    // 270 pts / 15
    // viceDirectorBase: 18.000 // 270 pts / 15
};
// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN DE INICIAL PRIMARIA Y MEDIA
export function obtenerConfiguracionActual1(fecha) {
    // Si no pasan fecha, devolvemos la última (la más reciente)
    if (!fecha) {
        return HISTORIAL_BASICA[HISTORIAL_BASICA.length - 1];
    }
    // Lógica para buscar por fecha (aquí simplificada para devolver la última por ahora)
    return HISTORIAL_BASICA[HISTORIAL_BASICA.length - 1];
}
// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN DE INICIAL PRIMARIA Y MEDIA
export function obtenerConfiguracionActual2(fecha) {
    // Si no pasan fecha, devolvemos la última (la más reciente)
    if (!fecha) {
        return HISTORIAL_IFDC[HISTORIAL_IFDC.length - 1];
    }
    // Lógica para buscar por fecha (aquí simplificada para devolver la última por ahora)
    return HISTORIAL_IFDC[HISTORIAL_IFDC.length - 1];
}
// FUNCIÓN PARA CALCULAR BÁSICO DE CUALQUIER CARGO
export function calcularBasicoCargo(tipoCargo, config) {
    return config.basicoCargo_Hora * COEFICIENTES_CARGOS[tipoCargo];
}
// HISTORIAL DE AUMENTOS SALARIALES - CARGOS (Primaria y Media)
export const HISTORIAL_BASICA = [
    {
        fecha: "2025-01",
        descripcion: "Inicio 2025",
        basicoCargo_Hora: 11339.19, // 
        porcentajes: {
            remunerativo: 1.04, // 104% 
            noRemunerativo: 1.33, // 133% 
            adicionalCargo: 0.33
        },
        fonid: 28700, // Por hs cátedra
        sumaNoRemunerativa: 4667.33333, //Por hs cátedra
    },
    {
        fecha: "2025-11",
        descripcion: "Actualización Noviembre",
        basicoCargo_Hora: 15421.30, // [cite: 534]
        porcentajes: {
            remunerativo: 1.30, // 130% [cite: 538]
            noRemunerativo: 1.07, // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.33333, //Por hs cátedra
    }
    // Aquí podrás agregar futuros aumentos simplemente copiando un bloque y cambiando fecha/valores.
];
// HISTORIAL DE AUMENTOS SALARIALES - IFDC
export const HISTORIAL_IFDC = [
    {
        fecha: "2025-11", // NOVIEMBRE 2025
        descripcion: "Actualización Noviembre",
        basicoCargo_Hora: 560038.73, // (Tu valor de hora secundaria)
        porcentajes: {
            remunerativo: 0.65, // 65% (Item 100-24)
            noRemunerativo: 0.30, // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400, // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
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
//# sourceMappingURL=historial.js.map