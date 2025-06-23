function mostrarResultado() {
  var resultadosSection = document.getElementById("resultados"); //asigna a resultadosSection el elemento con id "resultados";
  resultadosSection.style.display =
    resultadosSection.style.display === "none" ? "block" : "none";
    
  var resultados = calcularSalario();
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

function calcularSalario() {
  let cantHs = parseInt(document.getElementById("cantHs").value);
  
  let calculoBasico = (() => {
    switch (document.getElementById("cargo").value) {
      case "1":
        return { pagoXHs: 12756.59 };
      case "2":
        return { pagoXHs: 10 };
      default:
        return { pagoXHs: 0 };
    }
  })();

  function calculoZona() {
    switch (document.getElementById("zona").value) {
      case "1":
        return  0;
      case "2":
        return  0.2;
      case "3":
        return  0.4;
      case "4":
        return  0.6;
      case "5":
        return  0.8;
      case "6":
        return  1;
      default:
        return  0;
    }
  }
  function calculoAntiguedad(){
    switch (document.getElementById("antiguedad").value) {
      case "0":
        return  0;
      case "1":
        return  0.1;
      case "2":
        return  0.15;
      case "3":
        return  0.30;
      case "4":
        return  0.40;
      case "5":
        return  0.50;
      case "6":
        return  0.60;
      case "7":
        return  0.70;
      case "8":
        return  0.80;
      case "9":
        return  1.0;
      case "10":
        return  1.10;
      case "11":
        return  1.20;
      default:
        return  0;
    }
  }

  //   var montoGratificacion = 0;
  //   if (gratificacion != "no") {
  //     montoGratificacion = calcularGratificacion(sueldoBruto);
  //   }
  //   var bonoMov = parseInt(document.getElementById("bonoMovilizacion").value);
  //   var bonoCol = parseInt(document.getElementById("bonoColacion").value);
  //   var afp = parseFloat(document.getElementById("afp").value).toFixed(2) / 100;
  //   afp = (afp + 10) / 100;
  //   var prevision = document.getElementById("prevision").value;
  //   var contrato = document.getElementById("tipocontrato").value;

  let basicoXHs = cantHs * calculoBasico.pagoXHs;
  let bonificacionZona = basicoXHs * calculoZona();
  let bonificacionAntiguedad = basicoXHs * calculoAntiguedad();
  let complementoRemunerativo1 = basicoXHs * 1.11;
  let complementoNoRemunerativo1 = basicoXHs * 1.26;
  //   var descuentosLegales = basicoXHs * afp + basicoXHs * 0.07;
  //   var sueldoLiquido = parseInt(basicoXHs - descuentosLegales);
  //   if (sueldoLiquido < 100000) {
  //     alert(
  //       "Es posible que haya un Error en los datos Ingresados, favor verifique"
  //     );
  //   }

  return {
    imponible: basicoXHs,
    pagoDeZona: bonificacionZona,
    pagoAntiguedad: bonificacionAntiguedad,
    complementoRemunerativo: complementoRemunerativo1,
    complementoNoRemunerativo: complementoNoRemunerativo1
    // // descuentos: descuentosLegales,
    // liquido: sueldoLiquido
  };
}
// function calcularGratificacion(sueldoBruto) {
//   iMM = 450000; // Ingreso minimo mensual
//   topeIMM = iMM * 4.75;
//   topeSalarial = (sueldoBruto * 12) / 4;
//   if (topeSalarial > topeIMM) {
//     montoGratificacion = topeIMM / 12;
//   } else {
//     montoGratificacion = topeSalarial / 12;
//   }
//   return montoGratificacion;
// }
