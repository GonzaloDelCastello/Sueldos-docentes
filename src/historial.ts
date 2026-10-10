/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
// Este archivo es solo datos: las escalas salariales mes a mes.
//
// Los coeficientes de cada cargo y los descuentos fijos se mudaron a cargos.ts,
// que es donde se usan. Los coeficientes se habían duplicado en los dos lados,
// y ya habían empezado a divergir en los decimales.

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
    fonid: number;          // Valor por hora/cargo
    sumaNoRemunerativa: number;   // Valor por hora/cargo;
    bonoExtraordinario: number;   // Valor por hora/cargo;
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
    bonoExtraordinario: number; // Monto fijo de Bono Extraordinario (por ahora solo para Mayo 2026, por única vez)
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
    fonid: number;           // Monto fijo de FONID
    sumaNoRemunerativa: number; // Monto fijo de Suma No Remunerativa
    bonoExtraordinario: number; // Monto fijo de Bono Extraordinario (por ahora solo para Mayo 2026, por única vez)
}



// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN DE INICIAL PRIMARIA Y MEDIA
export function obtenerConfiguracionActual1(fecha: string): ConfiguracionBase {
    // Si no pasan fecha, devolvemos la última por defecto
    if (!fecha) {
        return HISTORIAL_BASICA[HISTORIAL_BASICA.length - 1]!;
    }

    // Usamos .find() para buscar la configuración que coincida exactamente con la fecha pedida
    const configEncontrada = HISTORIAL_BASICA.find(config => config.fecha === fecha);

    // Si la encontró, la devuelve. Si por algún error no la encuentra, devuelve la última por seguridad.
    return configEncontrada || HISTORIAL_BASICA[HISTORIAL_BASICA.length - 1]!;
}

// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN IFDC
export function obtenerConfiguracionActual2(fecha?: string): ConfiguracionBase {
    if (!fecha) {
        return HISTORIAL_IFDC[HISTORIAL_IFDC.length - 1]!;
    }

    const configEncontrada = HISTORIAL_IFDC.find(config => config.fecha === fecha);

    return configEncontrada || HISTORIAL_IFDC[HISTORIAL_IFDC.length - 1]!;
}

// HISTORIAL DE AUMENTOS SALARIALES - CARGOS (Primaria y Media)
export const HISTORIAL_BASICA: ConfiguracionSalarial1[] = [
    {
        fecha: "2025-01", // ENERO 2025
        descripcion: "Inicio 2025",
        basicoCargo_Hora: 11339.19, // 
        porcentajes: {
            remunerativo: 1.04,      // 104% 
            noRemunerativo: 1.33,    // 133% 
            adicionalCargo: 0.33
        },
        // El recibo de enero 2025 muestra 5.740 por 3 horas cátedra, o sea que
        // este valor ya venía expresado por hora (28.700 / 15).
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2025-11",
        descripcion: "Actualización Noviembre",
        basicoCargo_Hora: 15421.30, // Valor de hora secundaria en Noviembre 2025
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-01",
        descripcion: "Actualización Enero 2026",
        basicoCargo_Hora: 15421.30, // [Se mantiene el mismo básico que en Noviembre 2025, pero se actualizan los porcentajes]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-02",
        descripcion: "Actualización Febrero 2026",
        basicoCargo_Hora: 16192.37, // [calculo basado en aumento del 5% sobre 15421.30]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-03",
        descripcion: "Actualización Marzo 2026",
        basicoCargo_Hora: 16192.37, // [calculo basado en aumento del 5% sobre 15421.30]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-04",
        descripcion: "Actualización Abril 2026",
        basicoCargo_Hora: 16963.44, // [calculo basado en aumento del 10% sobre 15421.30]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-05",
        descripcion: "Actualización Mayo 2026",
        basicoCargo_Hora: 16963.44, // [calculo basado en aumento del 10% sobre 15421.30]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 0 //Por hs cátedra - suma extraordinaria por única vez
    },
    {
        fecha: "2026-05-B",
        descripcion: "Actualización Mayo 2026",
        basicoCargo_Hora: 16963.44, // [calculo basado en aumento del 10% sobre 15421.30]
        porcentajes: {
            remunerativo: 1.30,      // 130% [cite: 538]
            noRemunerativo: 1.07,    // 107% [cite: 554]
            adicionalCargo: 0.33
        },
        fonid: 1913.3333, // Por hs cátedra
        sumaNoRemunerativa: 4667.48333, //Por hs cátedra
        bonoExtraordinario: 20000 //Por hs cátedra - suma extraordinaria por única vez
    },
    
    {
    fecha: "2026-06",
    descripcion: "Actualización Junio 2026",
    basicoCargo_Hora: 16963.44, 
    porcentajes: {
        remunerativo: 1.30, 
        noRemunerativo: 1.07, 
        adicionalCargo: 0.33
    },
    fonid: 1913.3333,
    sumaNoRemunerativa: 4667.48333,
    bonoExtraordinario: 0 
},
{
    fecha: "2026-07",
    descripcion: "Actualización Julio 2026",
    basicoCargo_Hora: 17734.50, 
    porcentajes: {
        remunerativo: 1.40, 
        noRemunerativo: 0.97, 
        adicionalCargo: 0.33
    },
    fonid: 1913.3333,
    sumaNoRemunerativa: 4667.48333,
    bonoExtraordinario: 0 
},
{
    fecha: "2026-08",
    descripcion: "Actualización Agosto 2026",
    basicoCargo_Hora: 18505.56, 
    porcentajes: {
        remunerativo: 1.40, 
        noRemunerativo: 0.97, 
        adicionalCargo: 0.33
    },
    fonid: 1913.3333,
    sumaNoRemunerativa: 4667.48333,
    bonoExtraordinario: 0 
},
{
    fecha: "2026-09",
    // Quinto tramo del 5% sobre los haberes de enero 2026: 15.421,30 x 1,25.
    // El Decreto N° 8583-MHIP-2026 (25/07/2026) ponía este tramo en octubre,
    // pero un decreto posterior movió los tramos de octubre y noviembre a
    // septiembre y octubre, que es como está cargado acá.
    descripcion: "Actualización Septiembre 2026 (5% de los haberes de enero)",
    // El valor exacto es 15.421,30 x 1,25 = 19.276,625, pero el recibo usa
    // 19.276,63 y calcula desde ahí: con la milésima de más, cada ítem queda un
    // centavo abajo y el total remunerativo 6 centavos abajo. Se usa el valor
    // del recibo para reproducirlo exacto.
    basicoCargo_Hora: 19276.63, 
    // El reparto de los complementos pasa de 140/97 a 145/92: lo muestra el
    // recibo de septiembre 2026 (3 hs cátedra, zona 80%, 10 años de antigüedad).
    // El total sigue siendo 237% del básico, así que cambia el reparto entre
    // remunerativo y no remunerativo, no la plata. Sin este cambio el total
    // remunerativo queda 4.891,55 abajo y el no remunerativo 2.892,55 arriba.
    porcentajes: {
        remunerativo: 1.45, 
        noRemunerativo: 0.92, 
        adicionalCargo: 0.33
    },
    fonid: 1913.3333,
    sumaNoRemunerativa: 4667.48333,
    bonoExtraordinario: 0 
},
{
    fecha: "2026-10",
    // Sexto tramo del 5% sobre los haberes de enero 2026: 15.421,30 x 1,30.
    descripcion: "Actualización Octubre 2026 (5% de los haberes de enero)",
    basicoCargo_Hora: 20047.69, 
    // Se mantiene el reparto 145/92 de septiembre: el total sigue siendo 237%,
    // así que la estructura no cambió, sólo el valor del básico. OJO: todavía no
    // hay recibo de octubre que lo confirme.
    porcentajes: {
        remunerativo: 1.45, 
        noRemunerativo: 0.92, 
        adicionalCargo: 0.33
    },
    fonid: 1913.3333,
    sumaNoRemunerativa: 4667.48333,
    bonoExtraordinario: 0 
}
];

// HISTORIAL DE AUMENTOS SALARIALES - IFDC
export const HISTORIAL_IFDC: ConfiguracionSalarial2[] = [

    {
        fecha: "2025-11", // NOVIEMBRE 2025
        descripcion: "Actualización Noviembre",
        basicoCargo_Hora: 560038.73, // (Cargo tiempo completo IFDC tomado como referencia)
        porcentajes: {
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-01", // Enero 2026
        descripcion: "Actualización Enero 2026",
        basicoCargo_Hora: 560038.73, // (Tu valor de hora secundaria)
        porcentajes: {
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        bonoExtraordinario: 0 // No aplica
    },
    
    {
        fecha: "2026-02", // Febrero 2026
        descripcion: "Actualización Febrero 2026",
        basicoCargo_Hora: 588040.66, // (Tu valor de hora secundaria)
        porcentajes: {
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-04", // Abril 2026
        descripcion: "Actualización Abril 2026",
        basicoCargo_Hora: 616042.59, // (Tu valor de hora secundaria)
        porcentajes: {
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        bonoExtraordinario: 0 // No aplica
    },
    {
        fecha: "2026-05", // Mayo 2026
        descripcion: "Actualización Mayo 2026",
        basicoCargo_Hora: 616042.59, // (Tu valor de hora secundaria)
        porcentajes: {
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        bonoExtraordinario: 0 // suma extraordinaria por única vez
    },
    {
        fecha: "2026-05-B", // Mayo 2026
        descripcion: "Actualización Mayo 2026",
        basicoCargo_Hora: 616042.59, // (Tu valor de hora secundaria)
        porcentajes: {
            remunerativo: 0.65,    // 65% (Item 100-24)
            noRemunerativo: 0.30,   // 30% (Item 100-25)
            adicionalCargo: 0.34999 // 34.996%
        },
        fonid: 57400,  // FONID Noviembre (según recibo)
        sumaNoRemunerativa: 157894.07, // No aplica
        bonoExtraordinario: 300000 // suma extraordinaria por única vez
    },

    {
    fecha: "2026-06", 
    descripcion: "Actualización Junio 2026 (Cálculo SAC)",
    basicoCargo_Hora: 616042.59, 
    porcentajes: {
        remunerativo: 0.65, 
        noRemunerativo: 0.30, 
        adicionalCargo: 0.34999 
    },
    fonid: 57400, 
    sumaNoRemunerativa: 157894.07, 
    bonoExtraordinario: 0 
},
    {
    fecha: "2026-07", 
    descripcion: "Actualización Julio 2026",
    basicoCargo_Hora: 644044.53, 
    porcentajes: {
        remunerativo: 0.70, //Nueva estructura
        noRemunerativo: 0.25, //Nueva estructura 
        adicionalCargo: 0.34999 
    },
    fonid: 57400, 
    sumaNoRemunerativa: 157894.07, 
    bonoExtraordinario: 0 
},
{
     fecha: "2026-08", 
    descripcion: "Actualización Agosto 2026",
    basicoCargo_Hora: 672046.47, 
    porcentajes: {
        remunerativo: 0.70, 
        noRemunerativo: 0.25,  
        // El recibo de dedicación simple de agosto da 100.269,17 sobre un básico
        // de 286.483,33: es el 35% exacto, no el 34,999% de los meses anteriores.
        adicionalCargo: 0.35 
    },
    fonid: 57400, 
    sumaNoRemunerativa: 157894.07, 
    bonoExtraordinario: 0 

},
{
     fecha: "2026-09", 
    // Sep-2026 es el quinto tramo del 5% sobre los haberes de enero.
    // Los complementos pasan de 70/25 a 75/20: el recibo de dedicación simple de
    // septiembre 2026 muestra 75% de remunerativo y 20% de no remunerativo.
    // El total sigue siendo 95%, así que cambia el reparto, no la plata.
    descripcion: "Actualización Septiembre 2026 (5% de los haberes de enero)",
    basicoCargo_Hora: 700048.41, 
    porcentajes: {
        remunerativo: 0.75, 
        noRemunerativo: 0.20,  
        adicionalCargo: 0.35 
    },
    fonid: 57400, 
    sumaNoRemunerativa: 157894.07, 
    bonoExtraordinario: 0 

},
{
     fecha: "2026-10", 
   // OJO: los porcentajes de octubre son los mismos que tenía septiembre (70/25)
   // porque todavía no hay recibo de octubre que muestre el reparto de ese mes.
   descripcion: "Actualización Octubre 2026 (5% de los haberes de enero)",
    basicoCargo_Hora: 728050.34, 
    porcentajes: {
        remunerativo: 0.70, 
        noRemunerativo: 0.25,  
        adicionalCargo: 0.34999 
    },
    fonid: 57400, 
    sumaNoRemunerativa: 157894.07, 
    bonoExtraordinario: 0 

}

];

export interface MesBasico {
    valorHora: number;
    nota?: string; 
}
// Historial de sueldo básico de hs de secundaria, para referencia de cálculos y comparaciones
export const HISTORIAL_BASICO: Record<string, MesBasico> = {
    "2023-06": { valorHora: 4899.23 },
    "2023-07": { valorHora: 5262.14 },
    "2023-08": { valorHora: 5625.04 },
    "2023-09": { valorHora: 6713.76 },
    "2023-10": { valorHora: 7258.12 },
    "2023-11": { valorHora: 7584.74 },
    "2023-12": { valorHora: 7584.74 },
    "2024-01": { valorHora: 7584.74 },
    "2024-02": { valorHora: 7584.74 },
    "2024-03": { valorHora: 7584.74 },
    "2024-04": { valorHora: 7584.74 },
    "2024-05": { valorHora: 8722.45 },
    "2024-06": { valorHora: 8722.45 },
    "2024-07": { valorHora: 9594.70 },
    "2024-08": { valorHora: 10118.04 },
    "2024-09": { valorHora: 10554.16 },
    "2024-10": { valorHora: 10990.29 },
    "2024-11": { valorHora: 11339.19 },
    "2024-12": { valorHora: 11339.19 },
    "2025-01": { valorHora: 11339.19 },
    "2025-02": { valorHora: 12756.59 },
    "2025-03": { valorHora: 12756.59 },
    "2025-04": { valorHora: 14173.99 },
    "2025-05": { valorHora: 14173.99 },
    "2025-06": { valorHora: 14173.99 },
    "2025-07": { valorHora: 14854.34 },
    "2025-08": { valorHora: 14854.34 },
    "2025-09": { valorHora: 14854.34 },
    "2025-10": { valorHora: 14854.34 },
    "2025-11": { valorHora: 15421.30 },
    "2025-12": { valorHora: 15421.30 },
    "2026-01": { valorHora: 15421.30 },
    "2026-02": { valorHora: 16192.37 },
    "2026-03": { valorHora: 16192.37 },
    "2026-04": { valorHora: 16963.43 },
    "2026-05": { valorHora: 16963.43 },
    "2026-06": { valorHora: 16963.43 },
    "2026-07": { valorHora: 17734.50 },
    "2026-08": { valorHora: 18505.56 },
    "2026-09": { valorHora: 19276.62 },
    "2026-10": { valorHora: 20047.69 }
};

// ---------------------------------------------------------------------------
// Seguros fijos del recibo
// ---------------------------------------------------------------------------

// El seguro social y el mutual valen lo mismo en todos los recibos cargados
// (2024 a 2026), así que no hace falta repetirlos mes a mes.
export const SEGUROS_FIJOS = {
    social: 100,
    mutual: 10,
};

// SEGURO OBLIGATORIO TITULAR, POR MES
//
// Es un monto fijo del recibo que sube con los aumentos, pero no todos los
// meses: cambia en los meses en que hay tramo de aumento (febrero, abril, julio,
// agosto, septiembre y octubre de 2026). Antes estaba escrito una sola vez en el
// código y quedaba viejo sin que nadie lo notara.
//
// Valores verificados contra recibos de docs/Recibos/:
//   2025-01   3.292,16   recibo propio de enero 2025
//   2025-11   4.477,34   recibos de noviembre 2025 (tres distintos)
//   2026-01   4.477,34   recibo propio de enero 2026
//   2026-02   4.701,21   recibo propio de febrero 2026
//   2026-06   4.925,07   recibo del IFDC de junio 2026
//   2026-08   5.372,81   recibo de dedicación simple de agosto 2026
//   2026-09   5.596,68   recibo de dedicación simple de septiembre 2026
//
// Valores deducidos (falta el recibo del mes para confirmarlos):
//   2026-03   4.701,21   no hay tramo en marzo: sigue valiendo el de febrero
//   2026-04   4.925,07   sube en el tramo de abril y sigue igual en junio
//   2026-05   4.925,07   sin tramo
//   2026-07   5.148,94   tramo de julio: 223,87 más
//   2026-10   5.820,55   tramo de octubre: 223,87 más
//
// El incremento de 223,87 por tramo es el que muestran los recibos de 2026: de
// febrero a junio sube una vez (tramo de abril) y de junio a agosto, dos veces
// (tramos de julio y agosto).
export const SEGURO_OBLIGATORIO_POR_MES: Readonly<Record<string, number>> = {
    "2025-01": 3292.16,
    "2025-11": 4477.34,
    "2026-01": 4477.34,
    "2026-02": 4701.21,
    "2026-03": 4701.21,
    "2026-04": 4925.07,
    "2026-05": 4925.07,
    "2026-05-B": 4925.07,
    "2026-06": 4925.07,
    "2026-07": 5148.94,
    "2026-08": 5372.81,
    "2026-09": 5596.68,
    "2026-10": 5820.55,
};
