let cargo = 0; // Variable global para el cargo seleccionado
let nivel = 0; // Variable global para el nivel seleccionado
//let calculoBasicoHsSecundario = 14173.99; Básico hs secundaria 05/25
let calculoBasicoHsSecundario = 14854.34; //07/25
document.addEventListener("DOMContentLoaded", function () {
  
  const cargosPorNivel = {
    1: [ // Inicial
      { value: 0, text: "Selecciona un cargo" }] // Nivel inicial no tiene cargos implementados
    ,
    2: [ // Primaria
      { value: 0, text: "Selecciona un cargo" },
      { value: 3, text: "Cargo Maestrx Celador" },
      { value: 4, text: "Maestrx de grado" } // Pendiente a cargar en cargo = 2
    ],
    3: [ // Secundaria
      { value: 0, text: "Selecciona un cargo" },
      { value: 1, text: "Hs. en Secundario" },
      { value: 2, text: "Cargo Preceptor" }
    ],
    4: [ // Superior
      { value: 0, text: "Selecciona un cargo" }] // Nivel superior no tiene cargos implementados
  };

  
    const selectNivel = document.getElementById("nivel"); 
    const selectCargo = document.getElementById("cargo");
    const formSecundario = document.getElementById("formSecundario");
    const formFijo = document.getElementById("formFijo");  

     // Función para actualizar las opciones del select de cargo según el nivel seleccionado
    function actualizarOpcionesCargo(nivelSeleccionado) {
      // Limpiar opciones actuales
      selectCargo.innerHTML = "";
      // Agregar nuevas opciones basadas en el nivel seleccionado
      (cargosPorNivel[nivel] || [{ value: 0, text: "Selecciona un cargo" }]).forEach(opcion => {
      const opt = document.createElement("option");
      opt.value = opcion.value;
      opt.textContent = opcion.text;
      selectCargo.appendChild(opt);
      });
    }
    // Evento al cambiar el nivel
    selectNivel.addEventListener("change", function () {
      const nivelSeleccionado = this.value;
      nivel = parseInt(nivelSeleccionado);
      actualizarOpcionesCargo(nivelSeleccionado);
      resetearResultados(); // Reiniciar resultados al cambiar nivel
    });
     
    // Muestra el formulario correspondiente al cargo seleccionado
  selectCargo.addEventListener("change", function () {
    cargo = parseInt(this.value);
    // Ocultar todos
    formSecundario.classList.add("oculto");
    
    // Resetear resultados al cambiar cargo
    resetearResultados();
    // Mostrar según selección
    switch (cargo) {
      case 1:
        formSecundario.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 2:
        //formPreceptor.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 3:
        //formMaestrCelador.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
    }
    resetearResultados(); // Reiniciar resultados al cambiar cargo
  });
  // Inicializar opciones de cargo al cargar la página
  actualizarOpcionesCargo(parseInt(selectNivel.value)); 
});

function mostrarResultado() {
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
  if (cargo === 1 && (!cantHsInput.value.trim() || isNaN(cantHs) || cantHs <= 0)){
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
    case 1:
      mostrarCalculoSecundario();
      break;
    case 2:
      mostrarCalculoPreceptor();
      break;
    case 3:
      mostrarCalculoMaestrCelador();
      break;
      default:
      //Por si selecciona otro valor no calculado
      alert("Este tipo de cargo aún no tiene cálculo implementado.");
  }
}

function mostrarCalculoSecundario() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  const totalBolsillo= calculoTotalNeto();
  
  // Rellenar valores
  document.getElementById("resultadoSueldo").textContent = aPesos(resultados.imponible);
  document.getElementById("pagoZona").textContent = aPesos(resultados.pagoDeZona);
  document.getElementById("pagoAntiguedad").textContent = aPesos(resultados.pagoAntiguedad);
  document.getElementById("complementoRemunerativo").textContent = aPesos(resultados.complementoRemunerativo);
  document.getElementById("complementoNoRemunerativo").textContent = aPesos(resultados.complementoNoRemunerativo);
  document.getElementById("sumaNoRemunerativa").textContent = aPesos(resultados.pagoSumaNoRemunerativa);
  document.getElementById("incentivoDocente").textContent = aPesos(resultados.pagoIncentivoDocente);
  document.getElementById("totalCAportes").textContent = aPesos(resultados.totalRemunerativo);
  document.getElementById("totalSAportes").textContent = aPesos(resultados.totalNRemunerativo);
  document.getElementById("totalBruto").textContent = aPesos(resultados.totalBruto);
  document.getElementById("aporteJubilatorio").textContent = aPesos(descuentos.descuentoJubilacion);
  document.getElementById("aporteJubilatorioEsp").textContent = aPesos(descuentos.descuentoJubilacionRegEsp);
  document.getElementById("obraSocial").textContent = aPesos(descuentos.descuentoObraSocial);
  document.getElementById("totalDescuentos").textContent = aPesos(descuentos.totalDescuentos);
  document.getElementById("seguroObligatorio").textContent = aPesos(descuentos.seguroObligatorio);
  document.getElementById("totalBolsillo").textContent = aPesos(totalBolsillo.totalBolsillo);
  document.getElementById("descuentoSindical").textContent = aPesos(descuentos.descuentoSindical);
  
  //Mostrar solo las filas necesarias
  mostrarFilas(
  ["filaTotalNeto", "filaSueldoBasico", "filaZona", "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem", "filaSumaNoRem"], // mostrar
  [ "filaTotalBolsillo1", "filaAdicionalCargoPrec"]      // ocultar
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
  let totalRemunerativo1 =
    basicoXHs +
    complementoRemunerativo1 +
    bonificacionZona +
    bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente;
  let totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
  return {
    imponible: basicoXHs,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    complementoNoRemunerativo: complementoNoRemunerativo1,
    pagoSumaNoRemunerativa: sumaNoRemunerativa,
    pagoIncentivoDocente: incentivoDocente,
    totalRemunerativo: totalRemunerativo1,
    totalNRemunerativo: totalNRemunerativo1,
    totalBruto: totalBruto1,
  };
}
// Mostrar calculo de preceptor
function mostrarCalculoPreceptor() {
  const resultados = calcularSalarioPreceptor();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
    
  // Rellenar valores
  document.getElementById("resultadoSueldo").textContent = aPesos(resultados.basico);
  document.getElementById("pagoZona").textContent = aPesos(resultados.pagoDeZona);
  document.getElementById("pagoAntiguedad").textContent = aPesos(resultados.pagoAntiguedad);
  document.getElementById("complementoRemunerativo").textContent = aPesos(resultados.complementoRemunerativo);
  document.getElementById("adicionalPorCargo").textContent = aPesos(resultados.adicionalXCargo);
  document.getElementById("complementoNoRemunerativo").textContent = aPesos(resultados.complementoNoRemunerativo);
  document.getElementById("sumaNoRemunerativa").textContent = aPesos(resultados.pagoSumaNoRemunerativa);
  document.getElementById("incentivoDocente").textContent = aPesos(resultados.pagoIncentivoDocente);
  document.getElementById("totalCAportes").textContent = aPesos(resultados.totalRemunerativo);
  document.getElementById("totalSAportes").textContent = aPesos(resultados.totalNRemunerativo);
  document.getElementById("totalBruto").textContent = aPesos(resultados.totalBruto);
  document.getElementById("aporteJubilatorio").textContent = aPesos(descuentos.descuentoJubilacion);
  document.getElementById("aporteJubilatorioEsp").textContent = aPesos(descuentos.descuentoJubilacionRegEsp);
  document.getElementById("obraSocial").textContent = aPesos(descuentos.descuentoObraSocial);
  document.getElementById("totalDescuentos").textContent = aPesos(descuentos.totalDescuentos);
  document.getElementById("seguroObligatorio").textContent = aPesos(descuentos.seguroObligatorio);
  document.getElementById("totalBolsillo").textContent = aPesos(resultados.totalBruto - calculoDescuentos(resultados.totalRemunerativo).totalDescuentos);
  document.getElementById("descuentoSindical").textContent = aPesos(descuentos.descuentoSindical);
  //Mostrar solo las filas necesarias
  mostrarFilas(
  ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargoPrec", "filaZona", "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem", "filaSumaNoRem", "filaDescuentoSindical"], // mostrar
  [ "filaTotalBolsillo1"]      // ocultar
);
  
}
//Función para el cálculo de preceptor
function calcularSalarioPreceptor() {

  //let basico1 = 200345.1; //Basico preceptor 05/25
  let basico1 = 209961.66; //Basico preceptor 07/25
  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();
  //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25
  let complementoRemunerativo1 = basico1* 1.25; //el 1125% del básico 07/25
  let adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo preceptor
  //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25
  let complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
  let sumaNoRemunerativa = 65973.47; //Pago de suma no remunerativa 0.3292% del básico
  let incentivoDocente = 28700; //Pago por incentivo docente
  let totalRemunerativo1 =
    basico1 +
    complementoRemunerativo1 + adicionalXCargo1 +
    bonificacionZona +
    bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente;
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
  };
}
// Cargo de maestra/o celador
function mostrarCalculoMaestrCelador() {
  const resultados = calcularSalarioMaestrCelador();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  //console.log("calculado salario maestr celador");
// Rellenar valores
  document.getElementById("resultadoSueldo").textContent = aPesos(resultados.basico);
  document.getElementById("pagoZona").textContent = aPesos(resultados.pagoDeZona);
  document.getElementById("pagoAntiguedad").textContent = aPesos(resultados.pagoAntiguedad);
  document.getElementById("complementoRemunerativo").textContent = aPesos(resultados.complementoRemunerativo);
  document.getElementById("adicionalPorCargo").textContent = aPesos(resultados.adicionalXCargo);
  document.getElementById("complementoNoRemunerativo").textContent = aPesos(resultados.complementoNoRemunerativo);
  document.getElementById("sumaNoRemunerativa").textContent = aPesos(resultados.pagoSumaNoRemunerativa);
  document.getElementById("incentivoDocente").textContent = aPesos(resultados.pagoIncentivoDocente);
  document.getElementById("totalCAportes").textContent = aPesos(resultados.totalRemunerativo);
  document.getElementById("totalSAportes").textContent = aPesos(resultados.totalNRemunerativo);
  document.getElementById("totalBruto").textContent = aPesos(resultados.totalBruto);
  document.getElementById("aporteJubilatorio").textContent = aPesos(descuentos.descuentoJubilacion);
  document.getElementById("aporteJubilatorioEsp").textContent = aPesos(descuentos.descuentoJubilacionRegEsp);
  document.getElementById("obraSocial").textContent = aPesos(descuentos.descuentoObraSocial);
  document.getElementById("totalDescuentos").textContent = aPesos(descuentos.totalDescuentos);
  document.getElementById("seguroObligatorio").textContent = aPesos(descuentos.seguroObligatorio);
  document.getElementById("totalBolsillo").textContent = aPesos(resultados.totalBruto - calculoDescuentos(resultados.totalRemunerativo).totalDescuentos);
  document.getElementById("descuentoSindical").textContent = aPesos(descuentos.descuentoSindical);
  //Mostrar solo las filas necesarias
  mostrarFilas(
  ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargoPrec", "filaZona", "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem", "filaSumaNoRem", "filaDescuentoSindical"], // mostrar
  [ "filaTotalBolsillo1"]      // ocultar
);
  
}
  
//Función para el cálculo de hs de secundaria
function calcularSalarioMaestrCelador() {
//let basico1 = 243611.01; //Basico Maestrx Celador 05/25
let basico1 = 243611.01; //Basico Maestrx Celador 07/25
  let bonificacionZona = basico1 * calculoZona();
  let bonificacionAntiguedad = basico1 * calculoAntiguedad();
  //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25
  let complementoRemunerativo1 = basico1* 1.25; //el 1125% del básico 07/25
  let adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo preceptor
  //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25
  let complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
  let sumaNoRemunerativa = 80220.9; //Pago de suma no remunerativa 0.3292% del básico
  let incentivoDocente = 28700; //Pago por incentivo docente
  let totalRemunerativo1 =
    basico1 +
    complementoRemunerativo1 + adicionalXCargo1 +
    bonificacionZona +
    bonificacionAntiguedad;
  let totalNRemunerativo1 =
    complementoNoRemunerativo1 + sumaNoRemunerativa + incentivoDocente;
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
  };
}
//Calculo Zona
function calculoZona() {
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
  let seguroObligatorio1 = 4115;
  let descuentoSindical1;
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
   
  let totalDescuentos1 = descuentoJubilacion1 + descuentoJubilacionRegEsp1 + descuentoObraSocial1 + descuentoSindical1 + seguroObligatorio1;
  return {
    descuentoJubilacion: descuentoJubilacion1,
    descuentoJubilacionRegEsp: descuentoJubilacionRegEsp1,
    descuentoObraSocial: descuentoObraSocial1,
    totalDescuentos: totalDescuentos1,
    seguroObligatorio:  seguroObligatorio1,
    descuentoSindical: descuentoSindical1
  }
}
function calculoTotalNeto() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentos(resultados.totalRemunerativo);
  let totalBolsillo1 = calcularSalarioHsSecundario().totalBruto - descuentos.totalDescuentos;
  return{
    totalBolsillo: totalBolsillo1
  }
}

//Botón hamburguesa (ia)
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const navegacion = document.querySelector('.navegacion');
  if (menuToggle && navegacion) {
    menuToggle.addEventListener('click', function() {
      navegacion.classList.toggle('activo');
    });
  }
});
// document.addEventListener("DOMContentLoaded", () => {
//   const toggle = document.getElementById("menu-toggle");
//   const nav = document.getElementById("navegacion");

//   toggle.addEventListener("click", () => {
//     nav.classList.toggle("activo");
//   });
// });
function aPesos(valor) {
  return "$\u00A0" + valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function resetearResultados() {
  const ids = [
    "resultadoSueldo", "pagoZona", "pagoAntiguedad", "complementoRemunerativo",
    "complementoNoRemunerativo", "sumaNoRemunerativa", "incentivoDocente",
    "totalSAportes", "totalCAportes", "totalBruto", "aporteJubilatorio",
    "aporteJubilatorioEsp", "obraSocial", "totalDescuentos", "seguroObligatorio",
    "totalBolsillo"
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "$0.00";
  });
}
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
document.addEventListener("DOMContentLoaded", function () {
  const fecha = new Date();
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById("fechaActual").textContent = fecha.toLocaleDateString("es-AR", opciones);
});
// Contador de visitas
document.addEventListener("DOMContentLoaded", function () {
  fetch('https://api.countapi.xyz/hit/gonzalodelcastello.github.io/Sueldos-Docentes/')
    .then(res => res.json())
    .then(res => {
      const contador = document.getElementById('contador');
      if (contador) contador.innerText = res.value;
    });
});

