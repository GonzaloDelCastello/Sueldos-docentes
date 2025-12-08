// historial.ts
// 1. COEFICIENTES DE CARGOS (Relación fija respecto a 1 Hora Cátedra)
// Calculados en base a Noviembre 2025. Se asume que esta relación es estable.
export const COEFICIENTES_CARGOS = {
    horaSecundaria: 1.000, // Base referencia
    preceptor: 14.1347, // ($217,975 / $15,421)
    maestroGrado: 14.997378, // ($231,279 / $15,421)
    maestroJardin: 15.1964, // ($234,349 / $15,421)
    maestroCelador: 17.1871 // ($252,909 / $15,421)
};
// Relación matemática basada en los Puntos del Estatuto (Art. 64).
// Base: 1 Hora Cátedra (15 puntos) = 1.0
export const COEFICIENTES_CARGOS1 = {
    horaSecundaria: 1.000, // Base (15 pts)
    preceptor: 14.200, // 213 pts / 15
    maestroGrado: 15.067, // 226 pts / 15
    maestroJardin: 15.267, // 229 pts / 15
    maestroCelador: 17.267, // 259 pts / 15
    directorBase: 18.000, // 270 pts / 15
    viceDirectorBase: 18.000 // 270 pts / 15
    // Puedes agregar más cargos aquí dividiendo sus puntos por 15
};
// 2. EL HISTORIAL DE AUMENTOS (Tu base de datos temporal)
export const HISTORIAL_AUMENTOS = [
    {
        fecha: "2025-01",
        descripcion: "Inicio 2025",
        basicoHoraCatedra: 11339.19, // 
        porcentajes: {
            remunerativo: 1.04, // 104% 
            noRemunerativo: 1.33, // 133% 
            adicionalCargo: 0.33
        },
        fonid: 28700, // Por hs cátedra
        sumaNoRemunerativa: 4667.33333 //Por hs cátedra
    },
    {
        fecha: "2025-11",
        descripcion: "Actualización Noviembre",
        basicoHoraCatedra: 15421.30, // [cite: 534]
        porcentajes: {
            remunerativo: 1.30, // 130% [cite: 538]
            noRemunerativo: 1.07, // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.33333 //Por hs cátedra
    }
    // Aquí podrás agregar futuros aumentos simplemente copiando un bloque y cambiando fecha/valores.
];
// 3. FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN
export function obtenerConfiguracionActual(fecha) {
    // Si no pasan fecha, devolvemos la última (la más reciente)
    if (!fecha) {
        return HISTORIAL_AUMENTOS[HISTORIAL_AUMENTOS.length - 1];
    }
    // Lógica para buscar por fecha (aquí simplificada para devolver la última por ahora)
    return HISTORIAL_AUMENTOS[HISTORIAL_AUMENTOS.length - 1];
}
// 4. FUNCIÓN PARA CALCULAR BÁSICO DE CUALQUIER CARGO
export function calcularBasicoCargo(tipoCargo, config) {
    return config.basicoHoraCatedra * COEFICIENTES_CARGOS[tipoCargo];
}
// Calculo con valores de estatuto 2004
// historial.ts
// 1. COEFICIENTES (LA LEY)
// Relación matemática basada en los Puntos del Estatuto (Art. 64).
// Base: 1 Hora Cátedra (15 puntos) = 1.0
// export const COEFICIENTES_CARGOS = {
//     horaSecundaria: 1.000,   // Base (15 pts)
//     preceptor: 14.200,       // 213 pts / 15
//     maestroGrado: 15.067,    // 226 pts / 15
//     maestroJardin: 15.267,   // 229 pts / 15
//     maestroCelador: 17.267,  // 259 pts / 15
//     directorBase: 18.000,    // 270 pts / 15
//     viceDirectorBase: 18.000 // 270 pts / 15
//     // Puedes agregar más cargos aquí dividiendo sus puntos por 15
// };
// // Definimos la estructura de datos (Interface)
// export interface ConfiguracionSalarial {
//     fecha: string;
//     descripcion: string;
//     basicoHoraCatedra: number; // EL VALOR "DOLAR" DEL SISTEMA
//     porcentajes: {
//         remunerativo: number;    // Ítem 100-22 (ej: 1.30)
//         noRemunerativo: number;  // Ítem 100-23 (ej: 1.07)
//         adicionalCargo: number;  // Generalmente 0.33
//     };
//     fijos: {
//         fonid: number;           // Incentivo Docente
//         conectividad: number;    // Suma No Remunerativa
//     };
// }
// // 2. EL HISTORIAL (LA MÁQUINA DEL TIEMPO)
// // Aquí agregas los aumentos mes a mes.
// export const HISTORIAL_AUMENTOS: ConfiguracionSalarial[] = [
//     {
//         fecha: "2025-01-01",
//         descripcion: "Enero 2025",
//         basicoHoraCatedra: 11339.19, 
//         porcentajes: {
//             remunerativo: 1.04,   
//             noRemunerativo: 1.33, 
//             adicionalCargo: 0.33
//         },
//         fijos: { 
//             fonid: 5740.00,
//             conectividad: 14002.45
//         }
//     },
//     {
//         fecha: "2025-11-01",
//         descripcion: "Noviembre 2025 (Vigente)",
//         basicoHoraCatedra: 15421.30, // <--- ESTE NÚMERO ACTUALIZA TODO
//         porcentajes: {
//             remunerativo: 1.30,      // Subió al 130%
//             noRemunerativo: 1.07,    // Bajó al 107%
//             adicionalCargo: 0.33
//         },
//         fijos: { 
//             fonid: 14002.45,         
//             conectividad: 5740.00    
//         }
//     }
// ];
// // 3. FUNCIONES DE AYUDA
// // Devuelve la configuración más reciente automáticamente
// export function obtenerConfiguracionActual(): ConfiguracionSalarial {
//     return HISTORIAL_AUMENTOS[HISTORIAL_AUMENTOS.length - 1];
// }
// // Calcula el básico de cualquier cargo automáticamente
// export function calcularBasico(cargo: keyof typeof COEFICIENTES_CARGOS, config: ConfiguracionSalarial): number {
//     return config.basicoHoraCatedra * COEFICIENTES_CARGOS[cargo];
// }
//# sourceMappingURL=historial.js.map