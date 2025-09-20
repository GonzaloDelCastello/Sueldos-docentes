let cargo = 0; // Variable global para el cargo seleccionado
let calculoBasicoHsSecundario = 14854.34; //07/25
//let calculoBasicoHsSecundario = 14173.99; Básico hs secundaria 05/25

//Función cálculo Zona
export function calculoZona() {
  switch (document.getElementById("zona").value) {
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
export function calcularAsignacionXHijxs() {
  const cantHijxs = parseInt(document.getElementById("cantHijxs").value);
  let asignacionXHijxs = 0;
  if (cantHijxs > 0) {
    asignacionXHijxs = cantHijxs * 51280; //Asignación por hijx
  }
  //document.getElementById("asignacionXHijxs").textContent = aPesos(asignacionXHijxs1);
  return asignacionXHijxs;
}

//Cálculo Antiguedad
function calculoAntiguedad() {
  switch (document.getElementById("antiguedad").value) {
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
function calculoDescuentos(totalRemunerativo) {

  let descuentoJubilacion1 = totalRemunerativo * 0.11;
  let descuentoJubilacionRegEsp1 = totalRemunerativo * 0.02;
  let descuentoObraSocial1 = totalRemunerativo * 0.06;
  const seguroObligatorio1 = 4312.73;
  let descuentoSindical1;
  const seguroSocial = 110;
  switch (document.getElementById("afiliacionSindical").value) {
    case "0":
      descuentoSindical1 = 0;
      break;
    case "1": //Amet
      descuentoSindical1 = totalRemunerativo * 0.015
      break;
    case "2": //Uda
      descuentoSindical1 = totalRemunerativo * 0.015
      break;
    default: descuentoJubilacion1 = 0;
  }

  let totalDescuentos1 = descuentoJubilacion1 + descuentoJubilacionRegEsp1 + descuentoObraSocial1 + descuentoSindical1 + seguroObligatorio1 + seguroSocial;
  return {
    descuentoJubilacion: descuentoJubilacion1,
    descuentoJubilacionRegEsp: descuentoJubilacionRegEsp1,
    descuentoObraSocial: descuentoObraSocial1,
    totalDescuentos: totalDescuentos1,
    seguroObligatorio: seguroObligatorio1,
    descuentoSindical: descuentoSindical1
  }
}
// Función para formatear números como moneda en pesos argentinos
export function aPesos(valor) {
  return "$\u00A0" + valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function mostrarResultado() {
  const cantHsInput = document.getElementById("cantHs");
  const cantHs = parseInt(cantHsInput.value);
  const cantHijxs = parseInt(document.getElementById("cantHijxs").value);

  const resultadosSection = document.getElementById("resultados");
  //Mostrar sección de resultados
  resultadosSection.style.display = "block";

  // Ocultar todas las filas antes de mostrar resultados nuevos
  document.querySelectorAll("#tablaResultados tr").forEach(fila => {
    fila.style.display = "none";
  });

  // Borrar mensaje anterior si existiera (ia)
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


    // Reiniciar todos los resultados a $0.00 (puede extraerse en una función auxiliar)
    resetearResultados();

    return;
  }

  // Si pasó la validación, ejecutar cálculo según cargo seleccionado
  cargo = parseInt(document.getElementById("cargo").value);

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
    default:
      //Por si selecciona otro valor no calculado
      alert("Este tipo de cargo aún no tiene cálculo implementado.");
  }
}

function mostrarCalculoSecundario() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  const totalBolsillo = resultados.totalBruto - descuentos.totalDescuentos;

  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaZona", "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem", "filaSumaNoRem", "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalCargo"]      // ocultar
  );
}

//Función para el cálculo de hs de secundaria
function calcularSalarioHsSecundario() {

  let cantHs = parseInt(document.getElementById("cantHs").value);
  let calculoBasico = calculoBasicoHsSecundario;
  let basicoXHs = cantHs * calculoBasico;
  let bonificacionZona = basicoXHs * calculoZona();
  let bonificacionAntiguedad = basicoXHs * calculoAntiguedad();
  //let complementoRemunerativo1 = basicoXHs * 1.185; //el 1185% del básico 05/25
  let complementoRemunerativo1 = basicoXHs * 1.25; //el 1125% del básico 07/25
  //let complementoNoRemunerativo1 = basicoXHs * 1.185; //el 1185% del básico 05/25
  let complementoNoRemunerativo1 = basicoXHs * 1.12; //el 1120% del básico 07/25
  let sumaNoRemunerativa = cantHs * 4667.483; //Pago de suma no remunerativa
  let incentivoDocente = cantHs * 1913.3325; //Pago por incentivo docente
  let asignacionXHijxs1 = calcularAsignacionXHijxs();
  let totalRemunerativo1 =
    basicoXHs +
    complementoRemunerativo1 +
    bonificacionZona +
    bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa +
    incentivoDocente + asignacionXHijxs1;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
    asignacionXHijxs: asignacionXHijxs1
  };
}

// Mostrar calculo de preceptor
function mostrarCalculoPreceptor() {
  const resultados = calcularSalarioPreceptor();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);

  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"]      // ocultar    
  );
}
//Función para el cálculo de preceptor
function calcularSalarioPreceptor() {

  //let basico1 = 200345.1; //Basico preceptor 05/25
  let basico1 = 209961.66; //Basico preceptor 07/25
  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();
  //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25
  let complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
  let adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo preceptor
  //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25
  let complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
  let sumaNoRemunerativa = 65973.47; //Pago de suma no remunerativa 0.3292% del básico
  let incentivoDocente = 28700; //Pago por incentivo docente
  let asignacionXHijxs = calcularAsignacionXHijxs();
  let totalRemunerativo1 =
    basico1 +
    complementoRemunerativo1 + adicionalXCargo1 +
    bonificacionZona +
    bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa +
    incentivoDocente + asignacionXHijxs;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
    asignacionXHijxs: asignacionXHijxs
  };
}

// Cargo de maestra/o celador
function mostrarCalculoMaestrCelador() {
  const resultados = calcularSalarioMaestrCelador();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
      "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"]      // ocultar    
  );
}


//Función para el cálculo de maestrx celador
function calcularSalarioMaestrCelador() {
  //let basico1 = 243611.01; //Basico Maestrx Celador 05/25
  let basico1 = 243611.01; //Basico Maestrx Celador 07/25
  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();
  //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25
  let complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
  let adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo maestrx celador
  //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25
  let complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
  let sumaNoRemunerativa = 80220.9; //Pago de suma no remunerativa 0.3292% del básico
  let incentivoDocente = 28700; //Pago por incentivo docente
  let asignacionXHijxs1 = calcularAsignacionXHijxs();
  let totalRemunerativo1 =
    basico1 +
    complementoRemunerativo1 + adicionalXCargo1 +
    bonificacionZona +
    bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa +
    incentivoDocente + asignacionXHijxs1;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
  console.log(bonificacionZona);
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
    asignacionXHijxs: asignacionXHijxs1
  };
}

// Cargo de maestra/o de grado
function mostrarCalculoMaestrGrado() {
  const resultados = calcularSalarioMaestrGrado();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo",
      "filaZona", "filaComplementoNoRem", "filaAntiguedad",
      "filaComplementoRem", "filaSumaNoRem", "filaDescuentoSindical",
      "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"]      // ocultar    
  );
}

//Función para el cálculo de maestrx de grado
function calcularSalarioMaestrGrado() {
  //let basico1 = 243611.01; //Basico Maestrx de grado 05/25 (No es seguro)
  let basico1 = 222776.16; //Basico Maestrx de grado 07/25 
  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();
  //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25 (No es seguro)
  let complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
  let adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo maestrx de grado
  //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25 
  let complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
  let sumaNoRemunerativa = 70000.0; //Pago de suma no remunerativa 0.3292% del básico (Fija)
  let incentivoDocente = 28700; //Pago por incentivo docente
  let asignacionXHijxs1 = calcularAsignacionXHijxs();
  let totalRemunerativo1 =
    basico1 + complementoRemunerativo1 + adicionalXCargo1
    + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa +
    incentivoDocente + asignacionXHijxs1;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
  //let asignacionXHijxs1 = calcularAsignacionXHijxs();
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
    asignacionXHijxs: asignacionXHijxs1
  };
}
// Nivel Inicial
// Cargo maestrx jardín
// Función mostrar maestrx jardín
function mostrarCalculoMaestrxJardin() {
  const resultados = calcularSalarioMaestrxJardin();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  // Mostrar resultados en la tabla
  mostrarResultados(
    resultados,
    descuentos,
    ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
      "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
      "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
      "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"]      // ocultar    
  );
}
// Función calcular maestrx jardín
function calcularSalarioMaestrxJardin() {
  //let basico1 = ---; //Basico Maestrx Jardín 05/25 (No es seguro)
  let basico1 = 225733.456; //Basico Maestrx Jardín 07/25 
  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();
  //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25 (No es seguro)
  let complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
  let adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo maestrx de grado
  //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25 
  let complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
  let sumaNoRemunerativa = 70929.23; //Pago de suma no remunerativa 0.3292% del básico (Fija)
  let incentivoDocente = 28700; //Pago por incentivo docente
  let asignacionXHijxs1 = calcularAsignacionXHijxs();
  let totalRemunerativo1 =
    basico1 + complementoRemunerativo1 + adicionalXCargo1
    + bonificacionZona + bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa +
    incentivoDocente + asignacionXHijxs1;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
  //let asignacionXHijxs1 = calcularAsignacionXHijxs();
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
    asignacionXHijxs: asignacionXHijxs1
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
}
function mostrarResultados(resultados, descuentos, filasMostrar, filasOcultar) {
  document.getElementById("resultadoSueldo").textContent = aPesos(resultados.basico ?? 0);
  document.getElementById("pagoZona").textContent = aPesos(resultados.pagoDeZona ?? 0);
  document.getElementById("pagoAntiguedad").textContent = aPesos(resultados.pagoAntiguedad ?? 0);
  document.getElementById("complementoRemunerativo").textContent = aPesos(resultados.complementoRemunerativo ?? 0);
  document.getElementById("adicionalPorCargo").textContent = aPesos(resultados.adicionalXCargo ?? 0);
  document.getElementById("complementoNoRemunerativo").textContent = aPesos(resultados.complementoNoRemunerativo ?? 0);
  document.getElementById("sumaNoRemunerativa").textContent = aPesos(resultados.pagoSumaNoRemunerativa ?? 0);
  document.getElementById("incentivoDocente").textContent = aPesos(resultados.pagoIncentivoDocente ?? 0);
  document.getElementById("totalCAportes").textContent = aPesos(resultados.totalRemunerativo ?? 0);
  document.getElementById("totalSAportes").textContent = aPesos(resultados.totalNRemunerativo ?? 0);
  document.getElementById("totalBruto").textContent = aPesos(resultados.totalBruto ?? 0);
  document.getElementById("aporteJubilatorio").textContent = aPesos(descuentos.descuentoJubilacion ?? 0);
  document.getElementById("aporteJubilatorioEsp").textContent = aPesos(descuentos.descuentoJubilacionRegEsp ?? 0);
  document.getElementById("obraSocial").textContent = aPesos(descuentos.descuentoObraSocial ?? 0);
  document.getElementById("totalDescuentos").textContent = aPesos(descuentos.totalDescuentos ?? 0);
  document.getElementById("seguroObligatorio").textContent = aPesos(descuentos.seguroObligatorio ?? 0);
  document.getElementById("totalBolsillo").textContent = aPesos((resultados.totalBruto ?? 0) - (descuentos.totalDescuentos ?? 0));
  document.getElementById("descuentoSindical").textContent = aPesos(descuentos.descuentoSindical ?? 0);
  document.getElementById("asignacionXHijxs").textContent = aPesos(resultados.asignacionXHijxs ?? 0);

  mostrarFilas(filasMostrar, filasOcultar);
}
function calculoTotalNeto() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  let totalBolsillo1 = calcularSalarioHsSecundario().totalBruto - descuentos.totalDescuentos;
  return {
    totalBolsillo: totalBolsillo1
  }
}

// Mostrar u ocultar filas de la tabla de resultados
function mostrarFilas(filasMostrar = [], filasOcultar = []) {
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