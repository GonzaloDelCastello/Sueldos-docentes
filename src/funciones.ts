import { obtenerConfiguracionActual2, obtenerConfiguracionActual1, calcularBasicoCargo, COEFICIENTES_CARGOS, HISTORIAL_IFDC, COEFICIENTES_CARGOS1 } from "./historial.js";

declare const Chart: any; // Declaración para usar Chart.js sin errores de TypeScript
let miGraficoSueldo: any = null; // Variable global para almacenar la instancia del gráfico

// Variable que guarda el mes que el usuario quiere calcular (por defecto Febrero 26)
export let periodoCalculo: string = "2026-02"; 

// Función para cambiar el mes desde los botones
export function setPeriodoCalculo(periodo: string) {
  periodoCalculo = periodo;
}
let cargo: number = 0; // Variable global para el cargo seleccionado
//let calculoBasicoHsSecundario: number = 15421.3; //11/25
//let calculoBasicoHsSecundario: number = 14854.34; 07/25
//let calculoBasicoHsSecundario: number = 14173.99; Básico hs secundaria 04/25
//let calculoBasicoHsSecundario: number = 12756.59; Básico hs secundaria 02/25
//let calculoBasicoHsSecundario: number = 11339.19; Básico hs secundaria 01/25

// Defino la interfaz para los resultados
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
  aguinaldoBruto?: number; // La mitad del remunerativo
  aguinaldoNeto?: number;  // Lo que te queda en mano
} 

// Interfaz para los descuentos
interface Descuentos {
  descuentoJubilacion: number;
  descuentoJubilacionRegEsp: number;
  descuentoObraSocial: number;
  descuentoSindical?: number;
  seguroObligatorio: number;
  totalDescuentos: number;
}

//Función cálculo Zona
export function calculoZona(): number {
  const zona = document.getElementById("zona") as HTMLSelectElement | null;
  if (!zona) return 0;
  switch (zona.value) {
    case "1":
      return 0;
    case "2":
      return 0.2;
    case "3":
      return 0.4;
    case "4":
      return 0.6;
    case "5":
      return 0.8;
    case "6":
      return 1;
    default:
      return 0;
  }
}
// Función asignación x hijxs
export function calcularAsignacionXHijxs(): number {
  const cantHijxs = document.getElementById("cantHijxs") as HTMLInputElement | null;
  if (!cantHijxs) return 0;
  const cantHijxsValue = parseInt(cantHijxs.value);
  let asignacionXHijxs = 0;
  if (cantHijxsValue > 0) {
    asignacionXHijxs = cantHijxsValue * 51280; //Asignación por hijx
  }
  //document.getElementById("asignacionXHijxs").textContent = aPesos(asignacionXHijxs1);
  return asignacionXHijxs;
}

//Cálculo Antiguedad
function calculoAntiguedad(): number {
  const antiguedad = document.getElementById("antiguedad") as HTMLSelectElement | null;
  if (!antiguedad) return 0;
  switch (antiguedad.value) {
    case "0":
      return 0;
    case "1":
      return 0.1;
    case "2":
      return 0.15;
    case "3":
      return 0.3;
    case "4":
      return 0.4;
    case "5":
      return 0.5;
    case "6":
      return 0.6;
    case "7":
      return 0.7;
    case "8":
      return 0.8;
    case "9":
      return 1.0;
    case "10":
      return 1.1;
    case "11":
      return 1.2;
    default:
      return 0;
  }
}
//Cálculo descuentos
function calculoDescuentos(totalRemunerativo: number): Descuentos {
  const descuentoJubilacion1 = totalRemunerativo * 0.11;
  const descuentoJubilacionRegEsp1 = totalRemunerativo * 0.02;
  const descuentoObraSocial1 = totalRemunerativo * 0.06;
  const seguroObligatorio1 = 4312.73;
  const seguroSocial = 110;

  let descuentoSindical1 = 0;

  const afiliacion = document.getElementById("afiliacionSindical") as HTMLSelectElement | null;

  if (afiliacion) {
    switch (afiliacion.value) {
      case "1": // AMET
      case "2": // UDA
        descuentoSindical1 = totalRemunerativo * 0.015;
        break;
      default:
        descuentoSindical1 = 0;
    }
  }

  const totalDescuentos1 =
    descuentoJubilacion1 +
    descuentoJubilacionRegEsp1 +
    descuentoObraSocial1 +
    descuentoSindical1 +
    seguroObligatorio1 +
    seguroSocial;

  return {
    descuentoJubilacion: descuentoJubilacion1,
    descuentoJubilacionRegEsp: descuentoJubilacionRegEsp1,
    descuentoObraSocial: descuentoObraSocial1,
    totalDescuentos: totalDescuentos1,
    seguroObligatorio: seguroObligatorio1,
    descuentoSindical: descuentoSindical1,
  };
}
// Función para formatear números como moneda en pesos argentinos
export function aPesos(valor: number): string {
  return "$\u00A0" + valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function mostrarResultadoActual(): void {
  const cantHsInput = document.getElementById("cantHs") as HTMLInputElement | null;
  if (!cantHsInput) return;
  const cantHs = parseInt(cantHsInput.value);

  //Mostrar sección de resultados
  const resultadosSection = document.getElementById("resultados") as HTMLElement | null;
  if (resultadosSection) resultadosSection.style.display = "block";
    
  // Ocultar todas las filas antes de mostrar resultados nuevos
  document.querySelectorAll<HTMLTableRowElement>("#tablaResultados tr").forEach(fila => {
    fila.style.display = "none";
  });

  // Borrar mensaje anterior si existiera
  const mensajeExistente = document.getElementById("mensajeError");
  if (mensajeExistente) mensajeExistente.remove();

  // Validación: campo vacío, no numérico o menor o igual a cero (ia)
  if (cargo === 1 && (!cantHsInput.value.trim() || isNaN(cantHs) || cantHs <= 0)) {
    const mensaje = document.createElement("p");
    mensaje.id = "mensajeError";
    mensaje.style.color = "red";
    mensaje.style.fontSize = "1.6rem";
    mensaje.style.marginTop = "1rem";
    mensaje.textContent = "⚠️ Por favor, ingresá una cantidad válida de horas.";
    cantHsInput.insertAdjacentElement("afterend", mensaje);

    // Reiniciar todos los resultados a $0.00
    resetearResultados();

    return;
  }

  // Si pasó la validación, ejecutar cálculo según cargo seleccionado
  const cargoEl = document.getElementById("cargo") as HTMLSelectElement | null;
  cargo = parseInt(cargoEl?.value ?? "0");

  switch (cargo) {
    case 0:
      // Si no se seleccionó un cargo válido, mostrar mensaje de error
      alert("Por favor, selecciona un cargo válido.");
      resetearResultados();
      return;
    case 1:
      mostrarCalculoSecundario();
      break;
    case 2:
      mostrarCalculoPreceptor();
      break;
    case 3:
      mostrarCalculoMaestrCelador();
      break;
    case 4:
      mostrarCalculoMaestrGrado();
      break;
    case 6:
      mostrarCalculoMaestrxJardin();
      break;
    case 7:
      mostrarCalculoIfdcExclusivo();
      break;
    case 8:
      mostrarCalculoIfdcSemiExclusivo();
      break;
    default:
      //Por si selecciona otro valor no calculado
      alert("Este tipo de cargo aún no tiene cálculo implementado.");
  }
}

function mostrarCalculoSecundario(): void {
  const resultados: Resultados = calcularSalarioHsSecundario();
  const descuentos: Descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;
  let totalBolsillo = resultados.totalBruto - descuentos.totalDescuentos;
  
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaZona", "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem", "filaSumaNoRem", "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalCargo", "filaAdicionalPorDedicacion"]      // ocultar
  );
  
}

// Función para el cálculo de hs de secundaria
function calcularSalarioHsSecundario(): Resultados {
  let cantHsV = document.getElementById("cantHs") as HTMLInputElement | null;
  if (!cantHsV) return 0 as unknown as Resultados; 
  const cantHs = parseInt(cantHsV.value);

  // OBTENER CONFIGURACIÓN VIGENTE 
  const config1 = obtenerConfiguracionActual1(periodoCalculo);
  console.log("Configuración seleccionada para cálculo:", periodoCalculo); //Prueba error
  // OBTENER EL VALOR DE LA HORA (Del historial)
  let valorHora = config1.basicoCargo_Hora;
  console.log("Valor de la hora según configuración:", valorHora); //Prueba error

  // CALCULAR BÁSICO (Valor Hora * Cantidad)
  let basicoXHs = cantHs * valorHora;

    
  let bonificacionZona = basicoXHs * calculoZona();
  let bonificacionAntiguedad = basicoXHs * calculoAntiguedad();

  // USAR PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basicoXHs * config1.porcentajes.remunerativo;
  let complementoNoRemunerativo1 = basicoXHs * config1.porcentajes.noRemunerativo;

  // USAR FIJOS DEL HISTORIAL
  // Nota: Asumimos que el incentivo y conectividad son por cargo (proporcional a 15hs)
  // Si en tu recibo es un monto fijo sin importar las horas, borra la división.
  let sumaNoRemunerativa = (config1.sumaNoRemunerativa) * cantHs; 
  let incentivoDocente = (config1.fonid) * cantHs; 
  
  let asignacionXHijxs1 = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basicoXHs + complementoRemunerativo1 + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs1;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

  
  // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basicoXHs,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs1,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto    
  };
}

// Mostrar calculo de preceptor
function mostrarCalculoPreceptor(): void{
  const resultados = calcularSalarioPreceptor();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;

  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalPorDedicacion"]      // ocultar    
  );
}
//Función para el cálculo de preceptor
function calcularSalarioPreceptor() {
  const config = obtenerConfiguracionActual1(periodoCalculo);
  

  // CALCULAR BÁSICO AUTOMÁTICO
  // El código busca "preceptor" en COEFICIENTES_CARGOS y lo multiplica por el básico de la hora.
  let basico1 = calcularBasicoCargo('preceptor', config); 

  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();

  // PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basico1 * config.porcentajes.remunerativo;
  let adicionalXCargo1 = basico1 * config.porcentajes.adicionalCargo;
  let complementoNoRemunerativo1 = basico1 * config.porcentajes.noRemunerativo;

  // COMPLEMENTOS NO REMUNERATIVOS FIJOS
  let sumaNoRemunerativa = config.sumaNoRemunerativa * COEFICIENTES_CARGOS.preceptor; // Valor entero
  let incentivoDocente = config.fonid * 15;          // Valor entero

  let asignacionXHijxs = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalXCargo1 + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

  // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basico1,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    adicionalXCargo: adicionalXCargo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto    
  };
}

// Cargo de maestra/o celador
function mostrarCalculoMaestrCelador() {
  const resultados = calcularSalarioMaestrCelador();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
      "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalPorDedicacion"]      // ocultar    
  );
}


//Función para el cálculo de maestrx celador
function calcularSalarioMaestrCelador() {
  // TRAE CONFIGURACIÓN SALARIAL SELECCIONADA
  const config = obtenerConfiguracionActual1(periodoCalculo);

  // CALCULAR BÁSICO AUTOMÁTICO
  // El código busca "preceptor" en COEFICIENTES_CARGOS y lo multiplica por el básico de la hora.
  let basico1 = calcularBasicoCargo('maestroCelador', config); 

  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();

  // PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basico1 * config.porcentajes.remunerativo;
  let adicionalXCargo1 = basico1 * config.porcentajes.adicionalCargo;
  let complementoNoRemunerativo1 = basico1 * config.porcentajes.noRemunerativo;

  // COMPLEMENTOS NO REMUNERATIVOS FIJOS
  let sumaNoRemunerativa = config.sumaNoRemunerativa * COEFICIENTES_CARGOS.maestroCelador; 
  let incentivoDocente = config.fonid ;          

  let asignacionXHijxs = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalXCargo1 + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

    // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basico1,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    adicionalXCargo: adicionalXCargo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto    
  };
}


// Cargo de maestra/o de grado
function mostrarCalculoMaestrGrado(): void {
  const resultados = calcularSalarioMaestrGrado();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;
  
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo",
      "filaZona", "filaComplementoNoRem", "filaAntiguedad",
      "filaComplementoRem", "filaSumaNoRem", "filaDescuentoSindical",
      "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalPorDedicacion"]      // ocultar    
  );
}

//Función para el cálculo de maestrx de grado
function calcularSalarioMaestrGrado() {
  // TRAE CONFIGURACIÓN SALARIAL SELECCIONADA
  const config = obtenerConfiguracionActual1(periodoCalculo);

  // CALCULAR BÁSICO AUTOMÁTICO
  // El código busca "preceptor" en COEFICIENTES_CARGOS y lo multiplica por el básico de la hora.
  let basico1 = calcularBasicoCargo('maestroGrado', config); 

  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();

  // PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basico1 * config.porcentajes.remunerativo;
  let adicionalXCargo1 = basico1 * config.porcentajes.adicionalCargo;
  let complementoNoRemunerativo1 = basico1 * config.porcentajes.noRemunerativo;

  // COMPLEMENTOS NO REMUNERATIVOS FIJOS
  let sumaNoRemunerativa = config.sumaNoRemunerativa * COEFICIENTES_CARGOS.maestroGrado; 
  let incentivoDocente = config.fonid;          

  let asignacionXHijxs = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalXCargo1 + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

    // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basico1,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    adicionalXCargo: adicionalXCargo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto    
  };
}
// Nivel Inicial
// Cargo maestrx jardín
// Función mostrar maestrx jardín
function mostrarCalculoMaestrxJardin(): void {
  const resultados: Resultados = calcularSalarioMaestrxJardin();
  const descuentos: Descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    [
      "filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
      "filaAsignacionXHijxs"
    ], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalPorDedicacion"]      // ocultar    
  );
}
// Función calcular maestrx jardín
function calcularSalarioMaestrxJardin() {
  // TRAE CONFIGURACIÓN SALARIAL SELECCIONADA
  const config = obtenerConfiguracionActual1(periodoCalculo);

  // CALCULAR BÁSICO AUTOMÁTICO
  // El código busca "preceptor" en COEFICIENTES_CARGOS y lo multiplica por el básico de la hora.
  let basico1 = calcularBasicoCargo('maestroJardin', config); 

  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();

  // PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basico1 * config.porcentajes.remunerativo;
  let adicionalXCargo1 = basico1 * config.porcentajes.adicionalCargo;
  let complementoNoRemunerativo1 = basico1 * config.porcentajes.noRemunerativo;

  // COMPLEMENTOS NO REMUNERATIVOS FIJOS
  let sumaNoRemunerativa = config.sumaNoRemunerativa * COEFICIENTES_CARGOS.maestroJardin; 
  let incentivoDocente = config.fonid;          

  let asignacionXHijxs = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalXCargo1 + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

  
  // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basico1,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    adicionalXCargo: adicionalXCargo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto
  };
}

// Función mostrar resultados IFDC
function mostrarCalculoIfdcExclusivo(): void {
  const resultados: Resultados = calcularSalarioIfdcExclusivo();
  const descuentos: Descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    [
      "filaTotalNeto", "filaSueldoBasico", 
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
      "filaAsignacionXHijxs", "filaAdicionalCargo"
    ], // mostrar
    ["filaZona","filaTotalBolsillo1" ]      // ocultar    
  );
}
// Función calcular IFDC
// Función calcular maestrx jardín
function calcularSalarioIfdcExclusivo() {
  // TRAE CONFIGURACIÓN SALARIAL SELECCIONADA
  const config = obtenerConfiguracionActual2(periodoCalculo);

  // CALCULAR BÁSICO AUTOMÁTICO
  // El código busca "preceptor" en COEFICIENTES_CARGOS y lo multiplica por el básico de la hora.
  let basico1 = config.basicoCargo_Hora; 
  
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();

  // PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basico1 * config.porcentajes.remunerativo;
  let adicionalXCargo1 = basico1 * config.porcentajes.adicionalCargo;
  let complementoNoRemunerativo1 = basico1 * config.porcentajes.noRemunerativo;

  // COMPLEMENTOS NO REMUNERATIVOS FIJOS
  let sumaNoRemunerativa = config.sumaNoRemunerativa; 
  let incentivoDocente = config.fonid;          
  let adicionalPorDedicacion1 = config.porcentajes.adicionalCargo * basico1;
  let asignacionXHijxs = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalPorDedicacion1 + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

  
  // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basico1,
    //pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    adicionalXCargo: adicionalXCargo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs,
    adicionalPorDedicacion: adicionalPorDedicacion1,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto
  };
}

// Función mostrar resultados IFDC semi exclusivo
function mostrarCalculoIfdcSemiExclusivo(): void {
  const resultados: Resultados = calcularSalarioIfdcSemiExclusivo();
  const descuentos: Descuentos = calculoDescuentos(resultados.totalRemunerativo) as Descuentos;
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    [
      "filaTotalNeto", "filaSueldoBasico", 
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
      "filaAsignacionXHijxs", "filaAdicionalCargo"
    ], // mostrar
    ["filaZona","filaTotalBolsillo1" ]      // ocultar    
  );
}
// Función calcular IFDC
// Función calcular maestrx jardín
function calcularSalarioIfdcSemiExclusivo() {
  // TRAE CONFIGURACIÓN SALARIAL SELECCIONADA
  const config = obtenerConfiguracionActual2(periodoCalculo);

  // CALCULAR BÁSICO AUTOMÁTICO
  // El código busca "preceptor" en COEFICIENTES_CARGOS y lo multiplica por el básico de la hora.
  let basico1 = config.basicoCargo_Hora * COEFICIENTES_CARGOS.ifdcSemiExclusivo; 
  
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();

  // PORCENTAJES DEL HISTORIAL
  let complementoRemunerativo1 = basico1 * config.porcentajes.remunerativo;
  let adicionalXCargo1 = basico1 * config.porcentajes.adicionalCargo;
  let complementoNoRemunerativo1 = basico1 * config.porcentajes.noRemunerativo;

  // COMPLEMENTOS NO REMUNERATIVOS FIJOS
  let sumaNoRemunerativa = config.sumaNoRemunerativa * COEFICIENTES_CARGOS.ifdcSemiExclusivo; 
  let incentivoDocente = config.fonid;          
  let adicionalPorDedicacion1 = config.porcentajes.adicionalCargo * basico1;
  let asignacionXHijxs = calcularAsignacionXHijxs();

  // Suma y resultados finales
  let totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalPorDedicacion1 + bonificacionAntiguedad;
  let totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;

  
  // --- CÁLCULO SAC ---
  let sacBruto = totalRemunerativo1 / 2;
  let descuentosSAC = calcularDescuentosSAC(sacBruto);
  let sacNeto = sacBruto - descuentosSAC;

  return {
    basico: basico1,
    //pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    adicionalXCargo: adicionalXCargo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
    asignacionXHijxs: asignacionXHijxs,
    adicionalPorDedicacion: adicionalPorDedicacion1,
    aguinaldoBruto: sacBruto, 
    aguinaldoNeto: sacNeto
  };
}

export function resetearResultados(): void {
  const ids = [
    "resultadoSueldo", "pagoZona", "pagoAntiguedad", "complementoRemunerativo",
    "complementoNoRemunerativo", "sumaNoRemunerativa", "incentivoDocente",
    "totalSAportes", "totalCAportes", "totalBruto", "aporteJubilatorio",
    "aporteJubilatorioEsp", "obraSocial", "totalDescuentos", "seguroObligatorio",
    "totalBolsillo", "adicionalPorCargo", "descuentoSindical", "asignacionXHijxs"
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "$0.00";
  });

  // Borrar el gráfico si existe
  if (typeof miGraficoSueldo !== 'undefined' && miGraficoSueldo !== null) {
    miGraficoSueldo.destroy();
    miGraficoSueldo = null;
  }
}
function mostrarResultados(
  resultados: Resultados, 
  descuentos: Descuentos,
  filasMostrar: string[],
  filasOcultar: string[]
): void {
  const setText = (id: string, value: number | undefined) => {
    const el = document.getElementById(id);
    if (el) el.textContent = aPesos(value ?? 0);
  };

  setText("resultadoSueldo", resultados.basico);
  setText("pagoZona", resultados.pagoDeZona);
  setText("pagoAntiguedad", resultados.pagoAntiguedad);
  setText("complementoRemunerativo", resultados.complementoRemunerativo);
  setText("adicionalPorCargo", resultados.adicionalXCargo);
  setText("complementoNoRemunerativo", resultados.complementoNoRemunerativo);
  setText("sumaNoRemunerativa", resultados.pagoSumaNoRemunerativa);
  setText("incentivoDocente", resultados.pagoIncentivoDocente);
  setText("totalCAportes", resultados.totalRemunerativo);
  setText("totalSAportes", resultados.totalNRemunerativo);
  setText("totalBruto", resultados.totalBruto);
  setText("aporteJubilatorio", descuentos.descuentoJubilacion);
  setText("aporteJubilatorioEsp", descuentos.descuentoJubilacionRegEsp);
  setText("obraSocial", descuentos.descuentoObraSocial);
  setText("totalDescuentos", descuentos.totalDescuentos);
  setText("seguroObligatorio", descuentos.seguroObligatorio);
  setText("totalBolsillo", (resultados.totalBruto ?? 0) - (descuentos.totalDescuentos ?? 0));
  setText("descuentoSindical", descuentos.descuentoSindical);
  setText("asignacionXHijxs", resultados.asignacionXHijxs);
  setText("totalDescuentosTexto", descuentos.totalDescuentos);
  


  // Aguinaldo
  const sacB = resultados.aguinaldoBruto ?? 0;
  const sacN = resultados.aguinaldoNeto ?? 0;
  const sacDesc = sacB - sacN;

  setText("sacBruto", sacB);
  setText("sacDescuentos", sacDesc); // Mostramos cuánto se descontó
  setText("sacNeto", sacN);
  mostrarFilas(filasMostrar, filasOcultar);
  
  // Gráfico de torta
  crearGraficoTorta(resultados, descuentos);
}
function calculoTotalNeto() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  let totalBolsillo1 = calcularSalarioHsSecundario().totalBruto - descuentos.totalDescuentos;
  return {
    totalBolsillo: totalBolsillo1
  }
}

//Aguinaldo
// Función auxiliar para descuentos de SAC (Solo porcentajes, sin fijos)
function calcularDescuentosSAC(brutoSAC: number): number {
    // 1. Jubilación (11%) + Ley Esp. (2%) + Obra Social (6%) = 19%
    // Nota: Si la Obra Social varía, puedes leer el select, pero por defecto suele ser el total.
    let porcentajeLey = 0.19; 

    // 2. Sindicato (Si está afiliado)
    let porcentajeSindical = 0;
    const afiliacion = document.getElementById("afiliacionSindical") as HTMLSelectElement | null;
    if (afiliacion && (afiliacion.value === "1" || afiliacion.value === "2")) {
        porcentajeSindical = 0.015; // 1.5%
    }

    // Total de descuento
    return brutoSAC * (porcentajeLey + porcentajeSindical);
}

// Función para el gráfico de torta Chart.js
export function crearGraficoTorta(resultados: Resultados, descuentos: Descuentos): void {
  const lienzo = document.getElementById('miGrafico') as HTMLCanvasElement;
  if (!lienzo) return; 

  if (typeof miGraficoSueldo !== 'undefined' && miGraficoSueldo !== null) {
    miGraficoSueldo.destroy();
  }

  // 1. DICCIONARIO DE DATOS: Preparamos todas las posibles porciones de la torta
  // Agrupamos en tonos de VERDE (Remunerativo) y AZUL/VIOLETA (No Remunerativo)
  const conceptos = [
    // --- REMUNERATIVOS ---
    { etiqueta: 'Básico', valor: resultados.basico ?? 0, color: '#046205' },
    { etiqueta: 'Zona', valor: resultados.pagoDeZona ?? 0, color: '#05ff04' },
    { etiqueta: 'Antigüedad', valor: resultados.pagoAntiguedad ?? 0, color: '#28a745' },
    { etiqueta: 'Adicional Cargo', valor: resultados.adicionalXCargo ?? 0, color: '#a3d139' },
    { etiqueta: 'Comp. Remunerativo', valor: resultados.complementoRemunerativo ?? 0, color: '#1fde4c' },
    
    // --- NO REMUNERATIVOS ---
    { etiqueta: 'Comp. No Remunerativo', valor: resultados.complementoNoRemunerativo ?? 0, color: '#0dcaf0' },
    { etiqueta: 'Suma No Remunerativa', valor: resultados.pagoSumaNoRemunerativa ?? 0, color: '#0d6efd' },
    { etiqueta: 'Incentivo Docente', valor: resultados.pagoIncentivoDocente ?? 0, color: '#6610f2' },
    { etiqueta: 'Asig. por Hijxs', valor: resultados.asignacionXHijxs ?? 0, color: '#e83e8c' }
  ];

  // 2. EL FILTRO MÁGICO: Nos quedamos SOLO con los conceptos que sean mayores a $0
  const conceptosActivos = conceptos.filter(item => item.valor > 0);

  // 3. SEPARAMOS LOS DATOS: Chart.js necesita listas separadas para textos, números y colores
  const etiquetasGrafico = conceptosActivos.map(item => item.etiqueta);
  const valoresGrafico = conceptosActivos.map(item => item.valor);
  const coloresGrafico = conceptosActivos.map(item => item.color);

  // 4. ¡DIBUJAMOS EL GRÁFICO!
  miGraficoSueldo = new Chart(lienzo, {
    type: 'doughnut',
    data: {
      labels: etiquetasGrafico, // Usamos la lista filtrada
      datasets: [{
        data: valoresGrafico,   // Usamos la lista filtrada
        backgroundColor: coloresGrafico, // Usamos la lista filtrada
        borderColor: '#ffffff', 
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#333',
            font: { size: 11 } // Achicamos un poco la letra para que entren todas las etiquetas
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const etiqueta = context.label || '';
              const valorEnPesos = context.raw;
              // Calculamos el porcentaje sobre el total bruto
              const total = context.chart._metasets[context.datasetIndex].total;
              const porcentaje = ((valorEnPesos / total) * 100).toFixed(1);
              
              const valorFormateado = valorEnPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 });
              return `${etiqueta}: $${valorFormateado} (${porcentaje}%)`;
            }
          }
        }
      }
    }
  }); 
}

// Mostrar u ocultar filas de la tabla de resultados
function mostrarFilas(filasMostrar: string[] = [], filasOcultar: string[] = []): void {
  // Mostrar las filas indicadas
  filasMostrar.forEach(id => {
    const fila = document.getElementById(id);
    if (fila) fila.style.display = "table-row";
  });
  // Ocultar las filas indicadas
  filasOcultar.forEach(id => {
    const fila = document.getElementById(id);
    if (fila) fila.style.display = "none";
  });
}