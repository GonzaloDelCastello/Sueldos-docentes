/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
/**
 * Motor de cálculo PURO del sueldo docente, pensado para varios cargos a la vez.
 *
 * "Puro" significa lo mismo que en calculos.ts: el resultado depende solo de los
 * argumentos (no lee formularios ni escribe en la página), no modifica nada de
 * afuera, y con la misma entrada devuelve siempre la misma salida.
 *
 * Los importes NO se van a buscar acá: llegan por parámetro desde historial.ts.
 * Eso se llama inyección de dependencias, y es lo que permite probar este motor
 * en Node sin navegador (ver tests/cargos.test.ts).
 *
 * Cada puesto se calcula por separado y después se suman los conceptos.
 * Eso es lo que permite calcular tantos cargos como tenga el docente.
 */
// ---------------------------------------------------------------------------
// Coeficientes y descuentos fijos
// ---------------------------------------------------------------------------
// Relación entre cada cargo y una hora cátedra (1 hora = 15 puntos).
// Calculados en base a Noviembre 2025. Se asume que esta relación es estable,
// y se verifica todos los meses contra el instructivo de pre-liquidación
// (ver tests/instructivos.test.ts).
//
// Los coeficientes de los cargos nuevos salen de la tabla de puntos del
// instructivo de julio 2026 (básico del cargo dividido el valor de la hora).
export const COEFICIENTES_CARGOS = {
    horaSecundaria: 1.0, // Base referencia
    preceptor: 14.1347, // ($217,975 / $15,421)
    maestroGrado: 14.997378, // ($231,279 / $15,421)
    maestroJardin: 15.1964, // ($234,349 / $15,421)
    maestroCelador: 17.1871, // ($252,909 / $15,421)
    educacionEspecialInicial: 17.12062, // 258 pts ($303.625,63 jul-26)
    auxiliarDocente: 14.399997, // 217 pts ($255.376,75 jul-26)
    maestroEspecialInicial: 12.143864, // 183 pts ($215.365,36 jul-26)
    asesorPedagogico: 27.671789, // 417 pts ($490.745,35 jul-26)
    ifdcTiempoCompleto: 1, // el cargo de 30 horas es la base del historial del superior
    ifdcSemiExclusivo: 0.83333,
    ifdcFullTime: 1.166668931,
    // Dedicación simple de 10 horas. No es 10/30: los recibos de agosto y
    // septiembre 2026 dan 286.483,33 / 672.046,47 = 0,426285 en los dos meses.
    ifdcDedicacionSimple10: 0.426285,
};
// El orden importa: al elegir un nivel queda seleccionado el primer cargo de la
// lista, así que el cargo más usado de cada nivel va primero (jardín en inicial,
// celador en primaria, horas en secundaria). Los que se comparten entre niveles
// van después de esos, para no cambiar cuál queda elegido por defecto.
export const CARGOS = [
    {
        tipo: "maestroJardin",
        niveles: ["inicial"],
        escala: "basica",
        etiqueta: "Maestrx Jardín / Maestrx aux. de Jardín",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: true,
    },
    {
        tipo: "maestroCelador",
        niveles: ["primario"],
        escala: "basica",
        etiqueta: "Cargo Maestrx Celador (259p)",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: false,
    },
    {
        tipo: "maestroGrado",
        niveles: ["primario"],
        escala: "basica",
        etiqueta: "Maestrx de grado",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: true,
    },
    {
        tipo: "horaSecundaria",
        niveles: ["secundario"],
        escala: "basica",
        etiqueta: "Hs. en Secundario",
        usaHoras: true,
        usaZona: true,
        usaPresencialidad: false,
    },
    {
        tipo: "preceptor",
        niveles: ["secundario"],
        escala: "basica",
        etiqueta: "Cargo Preceptor (213p)",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: false,
    },
    {
        tipo: "asesorPedagogico",
        niveles: ["primario", "secundario"],
        escala: "basica",
        etiqueta: "Asesor/a Pedagógico (417p)",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: false,
    },
    {
        // 258p, "Maestra Educ. Especial Nivel Inicial": 20 horas reloj, así que
        // cobra el ítem de aula completo (125.000).
        tipo: "educacionEspecialInicial",
        niveles: ["inicial"],
        escala: "basica",
        etiqueta: "Maestrx de Educación Especial Inicial (258p)",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: true,
    },
    {
        // 183p, "Maestro/a Esp. Jdin": 10 horas cátedra = 7 horas reloj (43.750).
        tipo: "maestroEspecialInicial",
        niveles: ["inicial"],
        escala: "basica",
        etiqueta: "Maestrx Especial de Jardín (183p)",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: true,
    },
    {
        // 217p, "Auxiliar docente": el decreto lo pone en inicial y en primario.
        tipo: "auxiliarDocente",
        niveles: ["inicial", "primario"],
        escala: "basica",
        etiqueta: "Auxiliar docente (217p)",
        usaHoras: false,
        usaZona: true,
        usaPresencialidad: true,
    },
    {
        tipo: "ifdcTiempoCompleto",
        niveles: ["superior"],
        escala: "ifdc",
        etiqueta: "Prof. tiempo completo, 30 hs.",
        usaHoras: false,
        usaZona: false,
        usaPresencialidad: false,
    },
    {
        tipo: "ifdcSemiExclusivo",
        niveles: ["superior"],
        escala: "ifdc",
        etiqueta: "Prof. semiexclusivo, 25 hs.",
        usaHoras: false,
        usaZona: false,
        usaPresencialidad: false,
    },
    {
        tipo: "ifdcFullTime",
        niveles: ["superior"],
        escala: "ifdc",
        etiqueta: "Prof. full time, 40 hs.",
        usaHoras: false,
        usaZona: false,
        usaPresencialidad: false,
    },
    {
        // Función 0835 del IFDC: el recibo dice "Profesor ded. Simple (10hs)".
        // El FONID no es el completo: cobra el 48% (27.552 contra 57.400).
        tipo: "ifdcDedicacionSimple10",
        niveles: ["superior"],
        escala: "ifdc",
        etiqueta: "Prof. dedicación simple, 10 hs.",
        usaHoras: false,
        usaZona: false,
        usaPresencialidad: false,
        factorFonid: 0.48,
    },
];
export const ETIQUETA_NIVEL = {
    inicial: "Inicial",
    primario: "Primario",
    secundario: "Secundario",
    superior: "Superior (I.F.D.C)",
};
/** Los cargos que se pueden elegir en un nivel, en el orden del catálogo. */
export function cargosDelNivel(nivel) {
    return CARGOS.filter((cargo) => cargo.niveles.includes(nivel));
}
/**
 * La definición de un cargo. Lanza si el tipo no existe: es un error de
 * programación, no un dato que pueda venir mal del formulario.
 */
export function definicionDe(tipo) {
    const definicion = CARGOS.find((cargo) => cargo.tipo === tipo);
    if (!definicion)
        throw new Error(`Cargo desconocido: ${tipo}`);
    return definicion;
}
/** Escala de antigüedad (Art. 62 Ley XV-0387-2004), igual que el formulario viejo. */
export const ESCALA_ANTIGUEDAD = [
    { etiqueta: "0 años (0%)", porcentaje: 0 },
    { etiqueta: "1 año (10%)", porcentaje: 0.1 },
    { etiqueta: "2 a 4 años (15%)", porcentaje: 0.15 },
    { etiqueta: "5 a 6 años (30%)", porcentaje: 0.3 },
    { etiqueta: "7 a 9 años (40%)", porcentaje: 0.4 },
    { etiqueta: "10 a 11 años (50%)", porcentaje: 0.5 },
    { etiqueta: "12 a 14 años (60%)", porcentaje: 0.6 },
    { etiqueta: "15 a 16 años (70%)", porcentaje: 0.7 },
    { etiqueta: "17 a 18 años (80%)", porcentaje: 0.8 },
    { etiqueta: "20 a 21 años (100%)", porcentaje: 1.0 },
    { etiqueta: "22 a 23 años (110%)", porcentaje: 1.1 },
    { etiqueta: "Más de 24 años (120%)", porcentaje: 1.2 },
];
/** Bonificaciones por zona que acepta el recibo. */
export const ZONAS = [0, 20, 30, 40, 60, 80, 100];
export const AFILIACIONES = [
    { valor: "no", etiqueta: "No afiliado" },
    { valor: "amet", etiqueta: "Amet" },
    { valor: "uda", etiqueta: "Uda" },
];
export function porcentajeAntiguedad(indice) {
    return ESCALA_ANTIGUEDAD[indice]?.porcentaje ?? 0;
}
export const CAMPOS_COMPONENTES = [
    "basico",
    "pagoDeZona",
    "pagoAntiguedad",
    "complementoRemunerativo",
    "adicionalPorCargo",
    "adicionalPorDedicacion",
    "enseñanzaEnAula",
    "complementoNoRemunerativo",
    "sumaNoRemunerativa",
    "incentivoDocente",
    "bonoExtraordinario",
];
/**
 * Ítem "enseñanza en el aula" (100-27), del Decreto N° 3864-MHIP-2026.
 *
 * El decreto NO publica un monto por cargo: publica cuántas horas reloj frente a
 * alumnos tiene cada función y cuánto se paga por hora. El ítem es proporcional
 * a esas horas, y el instructivo de julio 2026 aclara que el concepto no se
 * modifica. La tabla del decreto sale de multiplicar:
 *
 *   20 horas reloj -> 125.000  (maestrx de grado, 226p)
 *   15 horas reloj ->  93.750  (maestrx de jardín y auxiliar de jardín, 229p)
 *   10 horas reloj ->  62.500  (especiales con 15 horas cátedra)
 *    7 horas reloj ->  43.750  (especiales con 10 horas cátedra)
 *
 * Los cargos que no figuran en el decreto no lo cobran (el maestro celador, por
 * ejemplo, y el asesor pedagógico).
 */
export const ENSEÑANZA_EN_AULA_POR_HORA_RELOJ = 6250;
/** Horas reloj frente a alumnos de cada función, según la tabla del decreto. */
export const HORAS_RELOJ_FRENTE_A_ALUMNOS = {
    maestroGrado: 20, // 226p, "20/25 horas reloj"
    maestroJardin: 15, // 229p, "15 horas reloj" (igual para auxiliar de jardín)
    educacionEspecialInicial: 20, // 258p, "20 horas reloj"
    auxiliarDocente: 15, // 217p, "15 horas reloj"
    maestroEspecialInicial: 7, // 183p, "10 horas cátedra" = 7 horas reloj
};
/** Monto del ítem para un cargo: proporcional a sus horas frente a alumnos. */
export function montoEnseñanzaEnAula(tipo) {
    return (HORAS_RELOJ_FRENTE_A_ALUMNOS[tipo] ?? 0) * ENSEÑANZA_EN_AULA_POR_HORA_RELOJ;
}
export function componentesEnCero() {
    return {
        basico: 0,
        pagoDeZona: 0,
        pagoAntiguedad: 0,
        complementoRemunerativo: 0,
        adicionalPorCargo: 0,
        adicionalPorDedicacion: 0,
        enseñanzaEnAula: 0,
        complementoNoRemunerativo: 0,
        sumaNoRemunerativa: 0,
        incentivoDocente: 0,
        bonoExtraordinario: 0,
    };
}
/** Cierra los totales a partir de los componentes (siempre por suma). */
export function cerrarTotales(componentes) {
    const totalRemunerativo = componentes.basico +
        componentes.complementoRemunerativo +
        componentes.adicionalPorCargo +
        componentes.adicionalPorDedicacion +
        componentes.pagoDeZona +
        componentes.pagoAntiguedad +
        componentes.enseñanzaEnAula;
    const totalNoRemunerativo = componentes.complementoNoRemunerativo +
        componentes.sumaNoRemunerativa +
        componentes.incentivoDocente +
        componentes.bonoExtraordinario;
    return {
        ...componentes,
        totalRemunerativo,
        totalNoRemunerativo,
        totalBruto: totalRemunerativo + totalNoRemunerativo,
    };
}
/** Suma los componentes de varios puestos y cierra los totales una sola vez. */
export function sumarComponentes(lista) {
    const total = componentesEnCero();
    for (const componentes of lista) {
        for (const campo of CAMPOS_COMPONENTES) {
            total[campo] += componentes[campo];
        }
    }
    return total;
}
// ---------------------------------------------------------------------------
// Cálculo de un puesto
// ---------------------------------------------------------------------------
/**
 * Calcula un puesto con los valores del mes elegido.
 *
 * Las fórmulas son las mismas que usaba el cálculo de un solo cargo, así que con
 * un único puesto el resultado de bolsillo no cambia.
 */
export function calcularConceptosDePuesto(puesto, configuraciones, opciones) {
    const definicion = definicionDe(puesto.tipo);
    const config = definicion.escala === "ifdc" ? configuraciones.ifdc : configuraciones.basica;
    const componentes = componentesEnCero();
    const coefZona = definicion.usaZona ? puesto.zonaPct / 100 : 0;
    const coefAntiguedad = opciones.antiguedadPct;
    switch (puesto.tipo) {
        case "horaSecundaria": {
            const cantHs = puesto.cantHoras;
            componentes.basico = config.basicoCargo_Hora * cantHs;
            componentes.complementoRemunerativo = componentes.basico * config.porcentajes.remunerativo;
            componentes.complementoNoRemunerativo = componentes.basico * config.porcentajes.noRemunerativo;
            componentes.sumaNoRemunerativa = config.sumaNoRemunerativa * cantHs;
            componentes.incentivoDocente = config.fonid * cantHs;
            // El bono se paga hasta 15 horas: de ahí para arriba es un monto fijo.
            componentes.bonoExtraordinario =
                cantHs <= 15 ? config.bonoExtraordinario * cantHs : config.bonoExtraordinario * 15;
            break;
        }
        // El preceptor va aparte porque su bono extraordinario se multiplica por el
        // coeficiente del cargo y no por 15 (comportamiento heredado: no hay recibo
        // que confirme cuál de las dos reglas vale para los cargos).
        case "preceptor": {
            const coeficiente = COEFICIENTES_CARGOS[puesto.tipo];
            componentes.basico = config.basicoCargo_Hora * coeficiente;
            componentes.complementoRemunerativo = componentes.basico * config.porcentajes.remunerativo;
            componentes.complementoNoRemunerativo = componentes.basico * config.porcentajes.noRemunerativo;
            componentes.adicionalPorCargo = componentes.basico * config.porcentajes.adicionalCargo;
            componentes.sumaNoRemunerativa = config.sumaNoRemunerativa * coeficiente;
            componentes.incentivoDocente = config.fonid * 15;
            componentes.bonoExtraordinario = config.bonoExtraordinario * coeficiente;
            break;
        }
        case "maestroCelador":
        case "maestroGrado":
        case "maestroJardin":
        case "educacionEspecialInicial":
        case "maestroEspecialInicial":
        case "auxiliarDocente":
        case "asesorPedagogico": {
            const coeficiente = COEFICIENTES_CARGOS[puesto.tipo];
            componentes.basico = config.basicoCargo_Hora * coeficiente;
            componentes.complementoRemunerativo = componentes.basico * config.porcentajes.remunerativo;
            componentes.complementoNoRemunerativo = componentes.basico * config.porcentajes.noRemunerativo;
            componentes.adicionalPorCargo = componentes.basico * config.porcentajes.adicionalCargo;
            componentes.sumaNoRemunerativa = config.sumaNoRemunerativa * coeficiente;
            componentes.incentivoDocente = config.fonid * 15;
            componentes.bonoExtraordinario = config.bonoExtraordinario * 15;
            // El monto sale de las horas reloj frente a alumnos que el decreto le
            // asigna al cargo, y se cobra si el docente estuvo frente al aula ese mes
            // (el selector de presentismo).
            const montoEnAula = montoEnseñanzaEnAula(puesto.tipo);
            componentes.enseñanzaEnAula = puesto.presencialidad ? montoEnAula : 0;
            break;
        }
        case "ifdcTiempoCompleto":
        case "ifdcSemiExclusivo":
        case "ifdcFullTime":
        case "ifdcDedicacionSimple10": {
            const coeficiente = COEFICIENTES_CARGOS[puesto.tipo];
            componentes.basico = config.basicoCargo_Hora * coeficiente;
            componentes.complementoRemunerativo = componentes.basico * config.porcentajes.remunerativo;
            componentes.complementoNoRemunerativo = componentes.basico * config.porcentajes.noRemunerativo;
            // En el nivel superior el adicional se llama "por dedicación" y es el que
            // se suma al total (el "por cargo" quedaba solo en la tabla, sin sumarse).
            componentes.adicionalPorDedicacion = componentes.basico * config.porcentajes.adicionalCargo;
            componentes.sumaNoRemunerativa = config.sumaNoRemunerativa * coeficiente;
            // El FONID es el mismo para los cargos completos, pero la dedicación
            // simple cobra una parte (ver factorFonid en la definición del cargo).
            componentes.incentivoDocente = config.fonid * (definicion.factorFonid ?? 1);
            componentes.bonoExtraordinario = config.bonoExtraordinario;
            break;
        }
    }
    componentes.pagoDeZona = componentes.basico * coefZona;
    componentes.pagoAntiguedad = componentes.basico * coefAntiguedad;
    return cerrarTotales(componentes);
}
/**
 * Descuentos de ley sobre el total remunerativo.
 * Los seguros llegan por parámetro porque cambian con el tiempo (ver
 * SEGURO_OBLIGATORIO_POR_MES en historial.ts), y se descuentan UNA sola vez, por
 * eso se aplican sobre el total y no por puesto.
 */
export function calcularDescuentos(totalRemunerativo, afiliacion, seguros) {
    const jubilacion = totalRemunerativo * 0.11;
    const jubilacionRegEsp = totalRemunerativo * 0.02;
    const obraSocial = totalRemunerativo * 0.06;
    const sindical = afiliacion === "no" ? 0 : totalRemunerativo * 0.015;
    const { seguroObligatorio, seguroSocial, seguroMutual } = seguros;
    return {
        jubilacion,
        jubilacionRegEsp,
        obraSocial,
        sindical,
        seguroObligatorio,
        seguroSocial,
        seguroMutual,
        total: jubilacion +
            jubilacionRegEsp +
            obraSocial +
            sindical +
            seguroObligatorio +
            seguroSocial +
            seguroMutual,
    };
}
/**
 * Aguinaldo (SAC): la mitad del remunerativo del semestre, con los descuentos
 * de ley pero sin los seguros fijos (esos no se descuentan del aguinaldo).
 */
export function calcularAguinaldo(totalRemunerativo, afiliacion) {
    const bruto = totalRemunerativo / 2;
    const descuentos = bruto * (0.19 + (afiliacion === "no" ? 0 : 0.015));
    return { bruto, descuentos, neto: bruto - descuentos };
}
/**
 * Calcula todos los puestos y devuelve el recibo consolidado.
 * Los descuentos se aplican una sola vez sobre la suma, no puesto por puesto.
 */
export function calcularPluriempleo(puestos, configuraciones, opciones) {
    const calculados = puestos.map((puesto) => ({
        puesto,
        conceptos: calcularConceptosDePuesto(puesto, configuraciones, opciones),
    }));
    const componentes = sumarComponentes(calculados.map((c) => c.conceptos));
    const conceptos = cerrarTotales(componentes);
    const descuentos = calcularDescuentos(conceptos.totalRemunerativo, opciones.afiliacion, configuraciones.seguros);
    const aguinaldo = calcularAguinaldo(conceptos.totalRemunerativo, opciones.afiliacion);
    let totalBolsillo = conceptos.totalBruto - descuentos.total;
    if (opciones.incluirSAC)
        totalBolsillo += aguinaldo.neto;
    return { puestos: calculados, conceptos, descuentos, aguinaldo, totalBolsillo };
}
//# sourceMappingURL=cargos.js.map