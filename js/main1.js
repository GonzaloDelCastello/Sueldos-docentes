let calculoBasicoHsSecundario = 14173.99;
document.addEventListener("DOMContentLoaded", function () {
  const selectCargo = document.getElementById("cargo");
  const formSecundario = document.getElementById("formSecundario");
  const formPreceptor = document.getElementById("formPreceptor");
  selectCargo.addEventListener("change", function () {
    const cargo = parseInt(this.value);
    // Ocultar todos
    formSecundario.classList.add("oculto");
    formPreceptor.classList.add("oculto");

    // Mostrar según selección
    switch (cargo) {
      case 1:
        formSecundario.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 2:
        formPreceptor.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
    }
  });

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
  if (!cantHsInput.value.trim() || isNaN(cantHs) || cantHs <= 0) {
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
  const cargo = parseInt(document.getElementById("cargo").value);

  switch (cargo) {
    case 1:
      mostrarCalculoSecundario();
      break;
    case 2:
      mostrarCalculoPreceptor();
      break;
      default:
      //Por si selecciona otro valor no calculado
      alert("Este tipo de cargo aún no tiene cálculo implementado.");
  }
}

function mostrarCalculoSecundario() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentosHsSecundario();
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
  //document.getElementById("totalBolsillo1").textContent = aPesos();

  // Mostrar solo las filas necesarias
  mostrarFilas(
  ["filaSueldoBasico", "filaZona", "filaAntiguedad", "filaSumaNoRem"], // mostrar
  ["filaTotalNeto", "filaComplementoRem", "filaComplementoNoRem", "filaTotalBolsillo1"]      // ocultar
);
  
}
  
//Función para el cálculo de hs de secundaria
function calcularSalarioHsSecundario() {

  let cantHs = parseInt(document.getElementById("cantHs").value);
  let calculoBasico = calculoBasicoHsSecundario;


  let basicoXHs = cantHs * calculoBasico;
  let bonificacionZona = basicoXHs * calculoZona();
  let bonificacionAntiguedad = basicoXHs * calculoAntiguedad();
  let complementoRemunerativo1 = basicoXHs * 1.185; //el 1185% del básico
  let complementoNoRemunerativo1 = basicoXHs * 1.185; //el 1185% del básico
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
function calculoDescuentosHsSecundario() {
  let descuentoJubilacion1 = calcularSalarioHsSecundario().totalRemunerativo * 0.11;
  let descuentoJubilacionRegEsp1 = calcularSalarioHsSecundario().totalRemunerativo * 0.02;
  let descuentoObraSocial1 = calcularSalarioHsSecundario().totalRemunerativo * 0.06;
  let seguroObligatorio1 = 4115;
  let totalDescuentos1 = descuentoJubilacion1 + descuentoJubilacionRegEsp1 + descuentoObraSocial1 + seguroObligatorio1;
  return {
    descuentoJubilacion: descuentoJubilacion1,
    descuentoJubilacionRegEsp: descuentoJubilacionRegEsp1,
    descuentoObraSocial: descuentoObraSocial1,
    totalDescuentos: totalDescuentos1,
    seguroObligatorio:  seguroObligatorio1,
  }
}
function calculoTotalNeto() {
  let totalBolsillo1 = calcularSalarioHsSecundario().totalBruto - calculoDescuentosHsSecundario().totalDescuentos;
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
