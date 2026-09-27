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
// Coeficientes y descuentos fijos
// ---------------------------------------------------------------------------

// Relación entre cada cargo y una hora cátedra (1 hora = 15 puntos).
// Calculados en base a Noviembre 2025. Se asume que esta relación es estable.
export const COEFICIENTES_CARGOS = {
  horaSecundaria: 1.0, // Base referencia
  preceptor: 14.1347, // ($217,975 / $15,421)
  maestroGrado: 14.997378, // ($231,279 / $15,421)
  maestroJardin: 15.1964, // ($234,349 / $15,421)
  maestroCelador: 17.1871, // ($252,909 / $15,421)
  ifdcSemiExclusivo: 0.83333,
  ifdcFullTime: 1.166668931,
};

// Descuentos fijos del recibo: no dependen del mes ni del cargo.
// Se descuentan UNA sola vez por recibo, no una vez por cargo.
export const DESCUENTOS_FIJOS = {
  seguroObligatorio: 4312.73,
  seguroSocial: 110,
};

// ---------------------------------------------------------------------------
// Catálogo de cargos
// ---------------------------------------------------------------------------

export type Nivel = "inicial" | "primario" | "secundario" | "superior";

export type TipoCargo =
  | "maestroJardin"
  | "maestroCelador"
  | "maestroGrado"
  | "horaSecundaria"
  | "preceptor"
  | "ifdcTiempoCompleto"
  | "ifdcSemiExclusivo"
  | "ifdcFullTime";

export interface DefinicionCargo {
  tipo: TipoCargo;
  nivel: Nivel;
  etiqueta: string;
  /** Si se carga una cantidad de horas (hoy solo las horas cátedra). */
  usaHoras: boolean;
  /** Si corresponde la bonificación por zona (el nivel superior no la cobra). */
  usaZona: boolean;
  /** Si corresponde el ítem de enseñanza en el aula (inicial y primaria). */
  usaPresencialidad: boolean;
}

export const CARGOS: readonly DefinicionCargo[] = [
  {
    tipo: "maestroJardin",
    nivel: "inicial",
    etiqueta: "Maestrx Jardín / Maestrx aux. de Jardín",
    usaHoras: false,
    usaZona: true,
    usaPresencialidad: true,
  },
  {
    tipo: "maestroCelador",
    nivel: "primario",
    etiqueta: "Cargo Maestrx Celador (259p)",
    usaHoras: false,
    usaZona: true,
    usaPresencialidad: true,
  },
  {
    tipo: "maestroGrado",
    nivel: "primario",
    etiqueta: "Maestrx de grado",
    usaHoras: false,
    usaZona: true,
    usaPresencialidad: true,
  },
  {
    tipo: "horaSecundaria",
    nivel: "secundario",
    etiqueta: "Hs. en Secundario",
    usaHoras: true,
    usaZona: true,
    usaPresencialidad: false,
  },
  {
    tipo: "preceptor",
    nivel: "secundario",
    etiqueta: "Cargo Preceptor (213p)",
    usaHoras: false,
    usaZona: true,
    usaPresencialidad: false,
  },
  {
    tipo: "ifdcTiempoCompleto",
    nivel: "superior",
    etiqueta: "Prof. tiempo completo, 30 hs.",
    usaHoras: false,
    usaZona: false,
    usaPresencialidad: false,
  },
  {
    tipo: "ifdcSemiExclusivo",
    nivel: "superior",
    etiqueta: "Prof. semiexclusivo, 25 hs.",
    usaHoras: false,
    usaZona: false,
    usaPresencialidad: false,
  },
  {
    tipo: "ifdcFullTime",
    nivel: "superior",
    etiqueta: "Prof. full time, 40 hs.",
    usaHoras: false,
    usaZona: false,
    usaPresencialidad: false,
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
  return CARGOS.filter((cargo) => cargo.nivel === nivel);
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
 * Las dos escalas del mes elegido, ya resueltas.
 * Quien llama las busca en historial.ts (ver configuracion.ts); el motor solo
 * decide cuál le corresponde a cada cargo.
 */
export interface ConfiguracionesDelMes {
  basica: ConfiguracionBase;
  ifdc: ConfiguracionBase;
}

// ---------------------------------------------------------------------------
// Conceptos
// ---------------------------------------------------------------------------

/**
 * Los ítems del recibo que se suman. Se separan de los totales a propósito:
 * los totales se calculan SIEMPRE a partir de estos, así la tabla nunca
 * puede mostrar una suma que no coincida con su total.
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
];

export interface ConceptosCargo extends ComponentesCargo {
  totalRemunerativo: number;
  totalNoRemunerativo: number;
  totalBruto: number;
}

/** Valor del ítem "enseñanza en el aula" (presentismo), por cargo. */
export const ENSEÑANZA_EN_AULA = 125000;

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
  };
}

/** Cierra los totales a partir de los componentes (siempre por suma). */
export function cerrarTotales(componentes: ComponentesCargo): ConceptosCargo {
  const totalRemunerativo =
    componentes.basico +
    componentes.complementoRemunerativo +
    componentes.adicionalPorCargo +
    componentes.adicionalPorDedicacion +
    componentes.pagoDeZona +
    componentes.pagoAntiguedad +
    componentes.enseñanzaEnAula;

  const totalNoRemunerativo =
    componentes.complementoNoRemunerativo +
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
    definicion.nivel === "superior" ? configuraciones.ifdc : configuraciones.basica;

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

    case "preceptor": {
      const coeficiente = COEFICIENTES_CARGOS.preceptor;
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
    case "maestroJardin": {
      const coeficiente =
        puesto.tipo === "maestroCelador"
          ? COEFICIENTES_CARGOS.maestroCelador
          : puesto.tipo === "maestroGrado"
            ? COEFICIENTES_CARGOS.maestroGrado
            : COEFICIENTES_CARGOS.maestroJardin;

      componentes.basico = config.basicoCargo_Hora * coeficiente;
      componentes.complementoRemunerativo = componentes.basico * config.porcentajes.remunerativo;
      componentes.complementoNoRemunerativo = componentes.basico * config.porcentajes.noRemunerativo;
      componentes.adicionalPorCargo = componentes.basico * config.porcentajes.adicionalCargo;
      componentes.sumaNoRemunerativa = config.sumaNoRemunerativa * coeficiente;
      componentes.incentivoDocente = config.fonid * 15;
      componentes.bonoExtraordinario = config.bonoExtraordinario * 15;

      // OJO: el jardín venía cobrando el ítem completo sin mirar el selector de
      // presentismo. Se mantiene igual para no cambiar los importes publicados.
      componentes.enseñanzaEnAula =
        puesto.tipo === "maestroJardin"
          ? ENSEÑANZA_EN_AULA
          : puesto.presencialidad
            ? ENSEÑANZA_EN_AULA
            : 0;
      break;
    }

    case "ifdcTiempoCompleto":
    case "ifdcSemiExclusivo":
    case "ifdcFullTime": {
      const coeficiente =
        puesto.tipo === "ifdcTiempoCompleto"
          ? 1
          : puesto.tipo === "ifdcSemiExclusivo"
            ? COEFICIENTES_CARGOS.ifdcSemiExclusivo
            : COEFICIENTES_CARGOS.ifdcFullTime;

      componentes.basico = config.basicoCargo_Hora * coeficiente;
      componentes.complementoRemunerativo = componentes.basico * config.porcentajes.remunerativo;
      componentes.complementoNoRemunerativo = componentes.basico * config.porcentajes.noRemunerativo;
      // En el nivel superior el adicional se llama "por dedicación" y es el que
      // se suma al total (el "por cargo" quedaba solo en la tabla, sin sumarse).
      componentes.adicionalPorDedicacion = componentes.basico * config.porcentajes.adicionalCargo;
      componentes.sumaNoRemunerativa = config.sumaNoRemunerativa * coeficiente;
      componentes.incentivoDocente = config.fonid;
      componentes.bonoExtraordinario = config.bonoExtraordinario;
      break;
    }
  }

  componentes.pagoDeZona = componentes.basico * coefZona;
  componentes.pagoAntiguedad = componentes.basico * coefAntiguedad;

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
  total: number;
}

/**
 * Descuentos de ley sobre el total remunerativo.
 * Los dos seguros son fijos y se descuentan UNA sola vez, por eso se calculan
 * sobre el total y no por puesto.
 */
export function calcularDescuentos(
  totalRemunerativo: number,
  afiliacion: Afiliacion
): Descuentos {
  const jubilacion = totalRemunerativo * 0.11;
  const jubilacionRegEsp = totalRemunerativo * 0.02;
  const obraSocial = totalRemunerativo * 0.06;
  const sindical = afiliacion === "no" ? 0 : totalRemunerativo * 0.015;
  const seguroObligatorio = DESCUENTOS_FIJOS.seguroObligatorio;
  const seguroSocial = DESCUENTOS_FIJOS.seguroSocial;

  return {
    jubilacion,
    jubilacionRegEsp,
    obraSocial,
    sindical,
    seguroObligatorio,
    seguroSocial,
    total:
      jubilacion + jubilacionRegEsp + obraSocial + sindical + seguroObligatorio + seguroSocial,
  };
}

export interface Aguinaldo {
  bruto: number;
  descuentos: number;
  neto: number;
}

/**
 * Aguinaldo (SAC): la mitad del remunerativo del semestre, con los descuentos
 * de ley pero sin los seguros fijos (esos no se descuentan del aguinaldo).
 */
export function calcularAguinaldo(
  totalRemunerativo: number,
  afiliacion: Afiliacion
): Aguinaldo {
  const bruto = totalRemunerativo / 2;
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
  totalBolsillo: number;
}

/**
 * Calcula todos los puestos y devuelve el recibo consolidado.
 * Los descuentos se aplican una sola vez sobre la suma, no puesto por puesto.
 */
export function calcularPluriempleo(
  puestos: readonly Puesto[],
  configuraciones: ConfiguracionesDelMes,
  opciones: OpcionesCalculo
): ResultadoPluriempleo {
  const calculados: PuestoCalculado[] = puestos.map((puesto) => ({
    puesto,
    conceptos: calcularConceptosDePuesto(puesto, configuraciones, opciones),
  }));

  const componentes = sumarComponentes(calculados.map((c) => c.conceptos));
  const conceptos = cerrarTotales(componentes);
  const descuentos = calcularDescuentos(conceptos.totalRemunerativo, opciones.afiliacion);
  const aguinaldo = calcularAguinaldo(conceptos.totalRemunerativo, opciones.afiliacion);

  let totalBolsillo = conceptos.totalBruto - descuentos.total;
  if (opciones.incluirSAC) totalBolsillo += aguinaldo.neto;

  return { puestos: calculados, conceptos, descuentos, aguinaldo, totalBolsillo };
}
