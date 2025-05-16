function mostrarResultado() {
  let resultadosSection = document.getElementById("resultados"); //asigna a resultadosSection el elemento con id "resultados";
  resultadosSection.style.display =
    resultadosSection.style.display === "none" ? "block" : "none";

  let resultados = calcularSalario();
  document.getElementById("resultadoSueldo").textContent =
    "Sueldo básico por hs $" + resultados.imponible;
  document.getElementById("pagoZona").textContent =
    "Pago por Zona: " + resultados.pagoDeZona;
  document.getElementById("pagoAntiguedad").textContent =
    "Pago por Antiguedad: " + resultados.pagoAntiguedad;
  document.getElementById("complementoRemunerativo").textContent =
    "Complemento Remunerativo: " + resultados.complementoRemunerativo;
  document.getElementById("complementoNoRemunerativo").textContent =
    "Complemento No Remunerativo: " + resultados.complementoNoRemunerativo;
}


let cantHs = parseInt(document.getElementById("cantHs").value); //Extrae hs del doc
let sueldoBasicoXH = 12756.59; //Valor de marzo 2025
let bonificacionBasico = sueldoBasicoXH * cantHs; //Sueldo basico x el cargo 


const porcentajeNoRemunerativo = 1.26; //el 126% del básico
const porcentajeRemunerativo = 1.11; //el 111% del básico
function fPorcentajeZona() {
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
let porcentajeZona = fPorcentajeZona(); //Porcentaje de bonificación en decimales, ej 0.2 
let bonificacionZona = porcentajeZona * cantHs;
function fPorcentajeAntiguedad() {
  switch (document.getElementById("antiguedad").value) {
    case "0":
      return 0;
    case "1":
      return 0.1;
    case "2":
      return 0.15;
    case "3":
      return 0.30;
    case "4":
      return 0.40;
    case "5":
      return 0.50;
    case "6":
      return 0.60;
    case "7":
      return 0.70;
    case "8":
      return 0.80;
    case "9":
      return 1.0;
    case "10":
      return 1.10;
    case "11":
      return 1.20;
    default:
      return 0;
  }
}


let porcentajeAntiguedad = fPorcentajeAntiguedad();
let bonificacionAntiguedad = porcentajeAntiguedad * cantHs;
function calcularSalario() {

  let complementoRemunerativo1 = porcentajeNoRemunerativo * cantHs;
  // let calculoBasico = (() => {
  //   switch (document.getElementById("cargo").value) {
  //     case "1":
  //       return { pagoXHs: 12756.59 };
  //     case "2":
  //       return { pagoXHs: 10 };
  //     default:
  //       return { pagoXHs: 0 };
  //   }
  // })();



  // let basicoXHs = cantHs * calculoBasico.pagoXHs;
  // let bonificacionZona = basicoXHs * calculoZona();
  // let bonificacionAntiguedad = basicoXHs * calculoAntiguedad();
  // let complementoRemunerativo1 = basicoXHs * 1.11;
  // let complementoNoRemunerativo1 = basicoXHs * 1.26;

  return {
    imponible: bonificacionBasico,
    pagoDeZona: bonificacionzona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    complementoNoRemunerativo: complementoNoRemunerativo1
    // descuentos: descuentosLegales,
    // liquido: sueldoLiquido
  };
}
