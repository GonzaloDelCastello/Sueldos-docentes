function mostrarResultado() {
  var resultadosSection = document.getElementById("resultados"); //asigna a resultadosSection el elemento con id "resultados";
  resultadosSection.style.display =
    resultadosSection.style.display === "none" ? "block" : "none";

  var resultados = calcularSalario();
  document.getElementById("resultadoSueldo").textContent =
    "Sueldo básico por hs $" + resultados.imponible;
  document.getElementById("resultadoDescuentos").textContent = 
    "Pago por Zona: " + bonificacionZona;
  // document.getElementById("resultadoDescuentos").textContent = "Descuentos Legales: $" + resultados.descuentos
  // document.getElementById("resultadoLiquido").textContent = "Tu Sueldo líquido es de $" + resultados.liquido
}

function calcularSalario() {
  //var sueldoBruto = parseInt(document.getElementById("sueldoBase").value)
  let cantHs = parseInt(document.getElementById("cantHs").value);
  //var gratificacion = document.getElementById("gratificacion").value

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
        return { pagoXZona: 0 };
      case "2":
        return { pagoXZona: 20 };
      case "3":
        return { pagoXZona: 40 };
      case "4":
        return { pagoXZona: 60 };
      case "5":
        return { pagoXZona: 80 };
      default:
        return { pagoXHs: 0 };
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

  var basicoXHs = cantHs * calculoBasico.pagoXHs;
  let bonificacionZona = basicoXHs * calculoZona.bonificacionZona;
  //   var descuentosLegales = basicoXHs * afp + basicoXHs * 0.07;
  //   var sueldoLiquido = parseInt(basicoXHs - descuentosLegales);
  //   if (sueldoLiquido < 100000) {
  //     alert(
  //       "Es posible que haya un Error en los datos Ingresados, favor verifique"
  //     );
  //   }

  return {
    imponible: basicoXHs,
    // descuentos: descuentosLegales,
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
