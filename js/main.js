function mostrarResultado() {
    var resultadosSection = document.getElementById("resultados")
    resultadosSection.style.display = resultadosSection.style.display === "none" ? "block" : "none"
    
    var resultados = calcularSalario()
    document.getElementById("resultadoSueldo").textContent = "Siendo tu sueldo imponible de $" + resultados.imponible
    document.getElementById("resultadoDescuentos").textContent = "Descuentos Legales: $" + resultados.descuentos
    document.getElementById("resultadoLiquido").textContent = "Tu Sueldo líquido es de $" + resultados.liquido
}
function calcularSalario () {
    var sueldoBruto = parseInt(document.getElementById("sueldoBase").value)
    var gratificacion = document.getElementById("gratificacion").value
    var montoGratificacion = 0
    if (gratificacion != "no") {
        montoGratificacion = calcularGratificacion(sueldoBruto)
    }
    var bonoMov = parseInt(document.getElementById("bonoMovilizacion").value)
    var bonoCol = parseInt(document.getElementById("bonoColacion").value)
    var afp = parseFloat(document.getElementById("afp").value).toFixed(2) / 100
        afp = (afp+10)/100
    var prevision = document.getElementById("prevision").value
    var contrato = document.getElementById("tipocontrato").value

    var sueldoImponible = sueldoBruto + montoGratificacion + bonoMov + bonoCol
    var descuentosLegales = (sueldoImponible * afp + sueldoImponible * 0.07 )
    var sueldoLiquido = parseInt(sueldoImponible - descuentosLegales)
    if (sueldoLiquido < 100000) {
        alert("Es posible que haya un Error en los datos Ingresados, favor verifique")
    }

    return {
        imponible: sueldoImponible,
        descuentos: descuentosLegales,
        liquido: sueldoLiquido
    }
}
function calcularGratificacion (sueldoBruto) {
    iMM =  450000     // Ingreso minimo mensual
    topeIMM = iMM * 4.75
    topeSalarial = (sueldoBruto * 12) / 4
    if (topeSalarial > topeIMM) {
        montoGratificacion = topeIMM / 12
    }
    else {
        montoGratificacion = topeSalarial / 12
    }
    return montoGratificacion   
}