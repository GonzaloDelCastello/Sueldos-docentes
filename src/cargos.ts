/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
import type { ConfiguracionBase } from "./historial.js";

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
// Pauta salarial del último trimestre de 2026
// ---------------------------------------------------------------------------
//
// Los dos conceptos que se agregan con los haberes de noviembre y diciembre de
// 2026 (ver PAUTA_TRIMESTRE_2026 en historial.ts, con las fuentes).
//
// Las dos banderas de abajo son el supuesto central de esta parte del cálculo:
// deciden si cada concepto integra la base de aportes (y por lo tanto si lo
// alcanzan el 11% de jubilación, el 2% de reg. esp. y el 6% de obra social) y si
// entra en la base del aguinaldo, que se calcula sobre el total remunerativo.
//
// Los dos están en false porque es lo que se anunció: el gobernador presentó la
// suma fija como "no remunerativa", y del bono no se informó el carácter. La
// ministra, en cambio, habló de un "nuevo ítem" sin repetir que sea no
// remunerativa, así que el carácter NO está confirmado.
//
// Pasar una a true tiene que ser esta sola línea. Si cambia, se mueve sola la
// base de aportes, el monto de los descuentos y la base del aguinaldo.
export const SUMA_FIJA_ES_REMUNERATIVA = false;
export const BONO_FIN_DE_ANIO_ES_REMUNERATIVO = false;

/** La suma fija rige desde este mes, y sigue en los meses sucesivos. */
export const MES_DESDE_SUMA_FIJA = "2026-11";

/** El bono se paga una sola vez, este mes. */
export const MES_DEL_BONO_FIN_DE_ANIO = "2026-12";

/**
 * Si la suma fija mensual se liquida en el mes pedido.
 *
 * Es permanente desde noviembre de 2026 ("de ahí en más queda instalada"), así
 * que alcanza con comparar los períodos como texto, que es el formato que usan
 * las series del historial.
 */
export function correspondeSumaFija(periodo: string): boolean {
  return periodo >= MES_DESDE_SUMA_FIJA;
}

/** Si el bono de fin de año se paga en el mes pedido. Es un pago único. */
export function correspondeBonoFinDeAnio(periodo: string): boolean {
  return periodo === MES_DEL_BONO_FIN_DE_ANIO;
}

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

/** Los descuentos del recibo que no dependen del sueldo ni del cargo. */
export interface DescuentosFijos {
  seguroObligatorio: number;
  seguroSocial: number;
  seguroMutual: number;
}

// ---------------------------------------------------------------------------
// Catálogo de cargos
// ---------------------------------------------------------------------------

export type Nivel = "inicial" | "primario" | "secundario" | "superior";

/** De qué escala salarial sale el cargo: la de primaria/media o la del superior. */
export type EscalaSalarial = "basica" | "ifdc";

export type TipoCargo =
  | "maestroJardin"
  | "educacionEspecialInicial"
  | "maestroEspecialInicial"
  | "auxiliarDocente"
  | "maestroCelador"
  | "maestroGrado"
  | "horaSecundaria"
  | "preceptor"
  | "asesorPedagogico"
  | "ifdcTiempoCompleto"
  | "ifdcSemiExclusivo"
  | "ifdcFullTime"
  | "ifdcDedicacionSimple10";

export interface DefinicionCargo {
  tipo: TipoCargo;
  /** En qué niveles se puede elegir. Un mismo cargo puede estar en dos. */
  niveles: readonly Nivel[];
  /** Qué historial de valores le corresponde. */
  escala: EscalaSalarial;
  etiqueta: string;
  /** Si se carga una cantidad de horas (hoy solo las horas cátedra). */
  usaHoras: boolean;
  /** Si corresponde la bonificación por zona (el nivel superior no la cobra). */
  usaZona: boolean;
  /** Si corresponde el ítem de enseñanza en el aula (ver montoEnseñanzaEnAula). */
  usaPresencialidad: boolean;
  /**
   * Parte del FONID provincial que le corresponde al cargo. El tiempo completo
   * cobra el FONID entero y la dedicación simple de 10 horas, el 48% (27.552
   * contra 57.400, según los recibos de agosto y septiembre 2026).
   */
  factorFonid?: number;
}

// El orden importa: al elegir un nivel queda seleccionado el primer cargo de la
// lista, así que el cargo más usado de cada nivel va primero (jardín en inicial,
// celador en primaria, horas en secundaria). Los que se comparten entre niveles
// van después de esos, para no cambiar cuál queda elegido por defecto.
export const CARGOS: readonly DefinicionCargo[] = [
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

export const ETIQUETA_NIVEL: Readonly<Record<Nivel, string>> = {
  inicial: "Inicial",
  primario: "Primario",
  secundario: "Secundario",
  superior: "Superior (I.F.D.C)",
};

/** Los cargos que se pueden elegir en un nivel, en el orden del catálogo. */
export function cargosDelNivel(nivel: Nivel): readonly DefinicionCargo[] {
  return CARGOS.filter((cargo) => cargo.niveles.includes(nivel));
}

/**
 * La definición de un cargo. Lanza si el tipo no existe: es un error de
 * programación, no un dato que pueda venir mal del formulario.
 */
export function definicionDe(tipo: TipoCargo): DefinicionCargo {
  const definicion = CARGOS.find((cargo) => cargo.tipo === tipo);
  if (!definicion) throw new Error(`Cargo desconocido: ${tipo}`);
  return definicion;
}

// ---------------------------------------------------------------------------
// Escalas que elige el docente
// ---------------------------------------------------------------------------

export interface TramoAntiguedad {
  etiqueta: string;
  porcentaje: number;
}

/** Escala de antigüedad (Art. 62 Ley XV-0387-2004), igual que el formulario viejo. */
export const ESCALA_ANTIGUEDAD: readonly TramoAntiguedad[] = [
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
export const ZONAS: readonly number[] = [0, 20, 30, 40, 60, 80, 100];

export type Afiliacion = "no" | "amet" | "uda";

export const AFILIACIONES: readonly { valor: Afiliacion; etiqueta: string }[] = [
  { valor: "no", etiqueta: "No afiliado" },
  { valor: "amet", etiqueta: "Amet" },
  { valor: "uda", etiqueta: "Uda" },
];

export function porcentajeAntiguedad(indice: number): number {
  return ESCALA_ANTIGUEDAD[indice]?.porcentaje ?? 0;
}

// ---------------------------------------------------------------------------
// Entrada del cálculo
// ---------------------------------------------------------------------------

/** Un cargo o puesto del docente, tal como sale del formulario. */
export interface Puesto {
  tipo: TipoCargo;
  /** Cuántas horas cátedra. Solo se usa en los cargos que se cobran por hora. */
  cantHoras: number;
  zonaPct: number;
  presencialidad: boolean;
}

/** Lo que es igual para todos los puestos: antigüedad, afiliación y si va el SAC. */
export interface OpcionesCalculo {
  antiguedadPct: number;
  afiliacion: Afiliacion;
  incluirSAC: boolean;
}

/**
 * Las dos escalas del mes elegido más los seguros fijos de ese mes, ya
 * resueltos. Quien llama los busca en historial.ts (ver configuracion.ts); el
 * motor solo decide qué escala le corresponde a cada cargo y usa los seguros
 * tal como vienen (cambian con el tiempo y viven en el historial).
 */
export interface ConfiguracionesDelMes {
  basica: ConfiguracionBase;
  ifdc: ConfiguracionBase;
  seguros: DescuentosFijos;
}

// ---------------------------------------------------------------------------
// Conceptos
// ---------------------------------------------------------------------------

/**
 * Los ítems del recibo que se suman. Se separan de los totales a propósito:
 * los totales se calculan SIEMPRE a partir de estos, así la tabla nunca
 * puede mostrar una suma que no coincida con su total.
 *
 * Los dos últimos son los conceptos de la pauta del último trimestre de 2026
 * (ver PAUTA_TRIMESTRE_2026 en historial.ts). A diferencia de los demás, son
 * montos fijos POR AGENTE: no se multiplican por horas ni por cargo.
 */
export interface ComponentesCargo {
  basico: number;
  pagoDeZona: number;
  pagoAntiguedad: number;
  complementoRemunerativo: number;
  adicionalPorCargo: number;
  adicionalPorDedicacion: number;
  enseñanzaEnAula: number;
  complementoNoRemunerativo: number;
  sumaNoRemunerativa: number;
  incentivoDocente: number;
  bonoExtraordinario: number;
  /** Suma fija mensual de la pauta del último trimestre de 2026. */
  sumaFijaTrimestre: number;
  /** Bono de fin de año, pago único y separado del haber del mes. */
  bonoFinDeAnio: number;
}

export const CAMPOS_COMPONENTES: readonly (keyof ComponentesCargo)[] = [
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
  "sumaFijaTrimestre",
  "bonoFinDeAnio",
];

export interface ConceptosCargo extends ComponentesCargo {
  totalRemunerativo: number;
  totalNoRemunerativo: number;
  totalBruto: number;
}

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
export const HORAS_RELOJ_FRENTE_A_ALUMNOS: Readonly<Partial<Record<TipoCargo, number>>> = {
  maestroGrado: 20, // 226p, "20/25 horas reloj"
  maestroJardin: 15, // 229p, "15 horas reloj" (igual para auxiliar de jardín)
  educacionEspecialInicial: 20, // 258p, "20 horas reloj"
  auxiliarDocente: 15, // 217p, "15 horas reloj"
  maestroEspecialInicial: 7, // 183p, "10 horas cátedra" = 7 horas reloj
};

/** Monto del ítem para un cargo: proporcional a sus horas frente a alumnos. */
export function montoEnseñanzaEnAula(tipo: TipoCargo): number {
  return (HORAS_RELOJ_FRENTE_A_ALUMNOS[tipo] ?? 0) * ENSEÑANZA_EN_AULA_POR_HORA_RELOJ;
}

export function componentesEnCero(): ComponentesCargo {
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
    sumaFijaTrimestre: 0,
    bonoFinDeAnio: 0,
  };
}

/**
 * Cierra los totales a partir de los componentes (siempre por suma).
 *
 * La suma fija y el bono van al subtotal que les corresponde según su carácter
 * (ver PAUTA_TRIMESTRE_2026): si son no remunerativos, no integran la base de
 * aportes ni la del aguinaldo, porque el aguinaldo se calcula sobre el total
 * remunerativo.
 */
export function cerrarTotales(componentes: ComponentesCargo): ConceptosCargo {
  // La suma fija y el bono pueden no venir (objetos armados antes de que
  // existieran, o meses sin esos conceptos): se tratan como cero. Sin esto, un
  // componente ausente contagiaba NaN a los tres totales.
  const sumaFija = componentes.sumaFijaTrimestre ?? 0;
  const bono = componentes.bonoFinDeAnio ?? 0;

  const sumaFijaRemunerativa = sumaFija * (SUMA_FIJA_ES_REMUNERATIVA ? 1 : 0);
  const bonoRemunerativo = bono * (BONO_FIN_DE_ANIO_ES_REMUNERATIVO ? 1 : 0);

  const totalRemunerativo =
    componentes.basico +
    componentes.complementoRemunerativo +
    componentes.adicionalPorCargo +
    componentes.adicionalPorDedicacion +
    componentes.pagoDeZona +
    componentes.pagoAntiguedad +
    componentes.enseñanzaEnAula +
    sumaFijaRemunerativa +
    bonoRemunerativo;

  const totalNoRemunerativo =
    componentes.complementoNoRemunerativo +
    componentes.sumaNoRemunerativa +
    componentes.incentivoDocente +
    componentes.bonoExtraordinario +
    (sumaFija - sumaFijaRemunerativa) +
    (bono - bonoRemunerativo);

  return {
    ...componentes,
    sumaFijaTrimestre: sumaFija,
    bonoFinDeAnio: bono,
    totalRemunerativo,
    totalNoRemunerativo,
    totalBruto: totalRemunerativo + totalNoRemunerativo,
  };
}

/** Suma los componentes de varios puestos y cierra los totales una sola vez. */
export function sumarComponentes(lista: readonly ComponentesCargo[]): ComponentesCargo {
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
export function calcularConceptosDePuesto(
  puesto: Puesto,
  configuraciones: ConfiguracionesDelMes,
  opciones: OpcionesCalculo
): ConceptosCargo {
  const definicion = definicionDe(puesto.tipo);
  const config: ConfiguracionBase =
    definicion.escala === "ifdc" ? configuraciones.ifdc : configuraciones.basica;

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

  // OJO: la suma fija y el bono NO se asignan acá. Son montos POR AGENTE, y este
  // método corre una vez por cargo: asignarlos acá los multiplicaría por la
  // cantidad de cargos. Se suman una sola vez en calcularPluriempleo.

  return cerrarTotales(componentes);
}

// ---------------------------------------------------------------------------
// Descuentos y aguinaldo
// ---------------------------------------------------------------------------

export interface Descuentos {
  jubilacion: number;
  jubilacionRegEsp: number;
  obraSocial: number;
  sindical: number;
  seguroObligatorio: number;
  seguroSocial: number;
  seguroMutual: number;
  total: number;
}

/**
 * Descuentos de ley sobre el total remunerativo.
 * Los seguros llegan por parámetro porque cambian con el tiempo (ver
 * SEGURO_OBLIGATORIO_POR_MES en historial.ts), y se descuentan UNA sola vez, por
 * eso se aplican sobre el total y no por puesto.
 */
export function calcularDescuentos(
  totalRemunerativo: number,
  afiliacion: Afiliacion,
  seguros: DescuentosFijos
): Descuentos {
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
    total:
      jubilacion +
      jubilacionRegEsp +
      obraSocial +
      sindical +
      seguroObligatorio +
      seguroSocial +
      seguroMutual,
  };
}

export interface Aguinaldo {
  bruto: number;
  descuentos: number;
  neto: number;
}

/**
 * Aguinaldo (SAC): la mitad de la MAYOR remuneración mensual del semestre, con
 * los descuentos de ley pero sin los seguros fijos (esos no se descuentan del
 * aguinaldo).
 *
 * La base NO es el sueldo del mes en que se cobra: el SAC se calcula sobre la
 * mejor remuneración devengada en el semestre. Para la segunda cuota de 2026 el
 * semestre es julio-diciembre, así que si octubre resultó la mejor remuneración,
 * la base es octubre. Por eso esta función recibe la base ya resuelta y quien
 * llama es el que la busca en el semestre (ver mejorRemuneracionDelSemestre).
 */
export function calcularAguinaldo(
  baseRemunerativa: number,
  afiliacion: Afiliacion
): Aguinaldo {
  const bruto = baseRemunerativa / 2;
  const descuentos = bruto * (0.19 + (afiliacion === "no" ? 0 : 0.015));
  return { bruto, descuentos, neto: bruto - descuentos };
}

// ---------------------------------------------------------------------------
// Cálculo de todos los puestos juntos
// ---------------------------------------------------------------------------

export interface PuestoCalculado {
  puesto: Puesto;
  conceptos: ConceptosCargo;
}

export interface ResultadoPluriempleo {
  puestos: PuestoCalculado[];
  conceptos: ConceptosCargo;
  descuentos: Descuentos;
  aguinaldo: Aguinaldo;
  /** La remuneración que se usó como base del SAC, y de qué mes salió. */
  baseDelAguinaldo: { monto: number; periodo: string | null };
  /**
   * Meses del semestre que todavía no tienen el básico cargado. Si hay alguno, la
   * base del SAC puede cambiar cuando se cargue: la mayor remuneración del
   * semestre podría ser uno de esos meses.
   */
  mesesSinBasico: string[];
  totalBolsillo: number;
}

/**
 * Calcula todos los puestos y devuelve el recibo consolidado.
 * Los descuentos se aplican una sola vez sobre la suma, no puesto por puesto.
 *
 * `baseDelAguinaldo` es la mayor remuneración del semestre. Si no se pasa, se
 * usa la del mes calculado, que es el comportamiento de antes de la pauta del
 * último trimestre de 2026; quien conoce el semestre (funciones.ts) la resuelve
 * y la pasa. Se deja opcional para no romper a los que llaman con un solo mes.
 */
export function calcularPluriempleo(
  puestos: readonly Puesto[],
  configuraciones: ConfiguracionesDelMes,
  opciones: OpcionesCalculo,
  baseDelAguinaldo?: { monto: number; periodo: string | null },
  mesesSinBasico: readonly string[] = []
): ResultadoPluriempleo {
  const calculados: PuestoCalculado[] = puestos.map((puesto) => ({
    puesto,
    conceptos: calcularConceptosDePuesto(puesto, configuraciones, opciones),
  }));

  const componentes = sumarComponentes(calculados.map((c) => c.conceptos));

  // La suma fija y el bono de fin de año son montos POR AGENTE y por única vez,
  // así que se suman una sola vez sobre el total y no en cada puesto: si se
  // sumaran por puesto, un docente con tres cargos cobraría los dos tres veces.
  if (correspondeSumaFija(configuraciones.basica.fecha)) {
    componentes.sumaFijaTrimestre += configuraciones.basica.sumaFijaPorAgente ?? 0;
  }
  if (correspondeBonoFinDeAnio(configuraciones.basica.fecha)) {
    componentes.bonoFinDeAnio += configuraciones.basica.bonoFinDeAnioPorAgente ?? 0;
  }

  const conceptos = cerrarTotales(componentes);
  const descuentos = calcularDescuentos(
    conceptos.totalRemunerativo,
    opciones.afiliacion,
    configuraciones.seguros
  );

  // Si el mes calculado todavía no tiene el básico cargado, su remuneración es 0
  // y no puede pisar la base que vino del semestre: por eso el máximo.
  //
  // El período se decide comparando, no por igualdad de montos: si el mes
  // calculado empata con el mejor del semestre (pasa con noviembre y diciembre,
  // que van con el básico de octubre), el que ganó la comparación es el del
  // semestre, que es el que se recorrió primero.
  const baseDelSemestre = baseDelAguinaldo?.monto ?? 0;
  const montoBase = Math.max(baseDelSemestre, conceptos.totalRemunerativo);
  const ganaElMesCalculado = conceptos.totalRemunerativo > baseDelSemestre;
  const periodoBase = ganaElMesCalculado
    ? configuraciones.basica.fecha
    : (baseDelAguinaldo?.periodo ?? configuraciones.basica.fecha);

  const aguinaldo = calcularAguinaldo(montoBase, opciones.afiliacion);

  let totalBolsillo = conceptos.totalBruto - descuentos.total;
  if (opciones.incluirSAC) totalBolsillo += aguinaldo.neto;

  return {
    puestos: calculados,
    conceptos,
    descuentos,
    aguinaldo,
    baseDelAguinaldo: { monto: montoBase, periodo: periodoBase },
    mesesSinBasico: [...mesesSinBasico],
    totalBolsillo,
  };
}
