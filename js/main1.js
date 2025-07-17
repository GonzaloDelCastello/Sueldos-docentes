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
  const resultadosSection = document.getElementById("resultados");
  resultadosSection.style.display = "block";

  // Borrar mensaje anterior si existiera (ia)
  const mensajeExistente = document.getElementById("mensajeError");
  if (mensajeExistente) mensajeExistente.remove();

  // Validación clara (ia)
  if (!cantHsInput.value.trim() || isNaN(cantHs) || cantHs <= 0) {
    const mensaje = document.createElement("p");
    mensaje.id = "mensajeError";
    mensaje.style.color = "red";
    mensaje.style.fontSize = "1.6rem";
    mensaje.style.marginTop = "1rem";
    mensaje.textContent = "⚠️ Por favor, ingresá una cantidad válida de horas.";
    //(ia)
    cantHsInput.insertAdjacentElement("afterend", mensaje);

    document.getElementById("resultadoSueldo").textContent = "$0.00";
    document.getElementById("pagoZona").textContent = "$0.00";
    document.getElementById("pagoAntiguedad").textContent =
      "$0.00";
    document.getElementById("complementoRemunerativo").textContent =
      "$0.00";
    document.getElementById("complementoNoRemunerativo").textContent =
      "$0.00";
    document.getElementById("sumaNoRemunerativa").textContent =
      "$0.00";
    document.getElementById("incentivoDocente").textContent =
      "$0.00";
    document.getElementById("totalSAportes").textContent =
      "$0.00";
    document.getElementById("totalCAportes").textContent =
      "$0.00";

    return;
  }


  // Si pasa la validación, mostrar resultados
  //Depende del cargo MODIFICAR
  let cargo = parseInt(document.getElementById("cargo").value);

  switch (cargo) {
    case 1:
      mostrarCalculoSecundario();
      break;
    case 2:
      mostrarCalculoPreceptor();
      break;
  }
}

function mostrarCalculoSecundario() {
  const resultados = calcularSalarioHsSecundario();
  const descuentos = calculoDescuentosHsSecundario();
  const totalBolsillo= calculoTotalNeto();
  document.getElementById("resultadoSueldo").textContent = aPesos(
    resultados.imponible
  );
  document.getElementById("pagoZona").textContent = aPesos(
    resultados.pagoDeZona
  );
  document.getElementById("pagoAntiguedad").textContent = aPesos(
    resultados.pagoAntiguedad
  );
  document.getElementById("complementoRemunerativo").textContent = aPesos(
    resultados.complementoRemunerativo
  );
  document.getElementById("complementoNoRemunerativo").textContent = aPesos(
    resultados.complementoNoRemunerativo
  );
  document.getElementById("sumaNoRemunerativa").textContent = aPesos(
    resultados.pagoSumaNoRemunerativa
  );
  document.getElementById("incentivoDocente").textContent = aPesos(
    resultados.pagoIncentivoDocente
  );
  document.getElementById("totalCAportes").textContent = aPesos(
    resultados.totalRemunerativo
  );
  document.getElementById("totalSAportes").textContent = aPesos(
    resultados.totalNRemunerativo
  );
  document.getElementById("totalBruto").textContent = aPesos(
    resultados.totalBruto
  );
  //descuentos
  document.getElementById("aporteJuvilatorio").textContent = aPesos(descuentos.descuentoJuvilacion);
  document.getElementById("aporteJuvilatorioEsp").textContent = aPesos(descuentos.descuentoJuvilacionRegEsp);
  document.getElementById("obraSocial").textContent = aPesos(descuentos.descuentoObraSocial);
  document.getElementById("totalDescuentos").textContent = aPesos(descuentos.totalDescuentos);
  //Total Neto
  document.getElementById("totalBolsillo").textContent = aPesos(totalBolsillo.totalBolsillo);
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
  let descuentoJuvilacion1 = calcularSalarioHsSecundario().totalRemunerativo * 0.11;
  let descuentoJuvilacionRegEsp1 = calcularSalarioHsSecundario().totalBruto * 0.02;
  let descuentoObraSocial1 = calcularSalarioHsSecundario().totalBruto * 0.06;
  let totalDescuentos1 = descuentoJuvilacion1 + descuentoJuvilacionRegEsp1 + descuentoObraSocial1;
  return {
    descuentoJuvilacion: descuentoJuvilacion1,
    descuentoJuvilacionRegEsp: descuentoJuvilacionRegEsp1,
    descuentoObraSocial: descuentoObraSocial1,
    totalDescuentos: totalDescuentos1,
  }
}
function calculoTotalNeto() {
  let totalBolsillo1 = calcularSalarioHsSecundario().totalBruto - calculoDescuentosHsSecundario().totalDescuentos;
  return{
    totalBolsillo: totalBolsillo1
  }
}

//Botón hamburguesa (ia)
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("navegacion");

  toggle.addEventListener("click", () => {
    nav.classList.toggle("activo");
  });
});
function aPesos(valor) {
  return "$ " + valor.toFixed(2);
}


