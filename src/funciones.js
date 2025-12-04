"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculoZona = calculoZona;
exports.calcularAsignacionXHijxs = calcularAsignacionXHijxs;
exports.aPesos = aPesos;
exports.mostrarResultado = mostrarResultado;
exports.resetearResultados = resetearResultados;
var cargo = 0; // Variable global para el cargo seleccionado
var calculoBasicoHsSecundario = 14854.34; //07/25
//Función cálculo Zona
function calculoZona() {
    var zona = document.getElementById("zona");
    if (!zona)
        return 0;
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
function calcularAsignacionXHijxs() {
    var cantHijxs = document.getElementById("cantHijxs");
    if (!cantHijxs)
        return 0;
    var cantHijxsValue = parseInt(cantHijxs.value);
    var asignacionXHijxs = 0;
    if (cantHijxsValue > 0) {
        asignacionXHijxs = cantHijxsValue * 51280; //Asignación por hijx
    }
    //document.getElementById("asignacionXHijxs").textContent = aPesos(asignacionXHijxs1);
    return asignacionXHijxs;
}
//Cálculo Antiguedad
function calculoAntiguedad() {
    var antiguedad = document.getElementById("antiguedad");
    if (!antiguedad)
        return 0;
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
function calculoDescuentos(totalRemunerativo) {
    var descuentoJubilacion1 = totalRemunerativo * 0.11;
    var descuentoJubilacionRegEsp1 = totalRemunerativo * 0.02;
    var descuentoObraSocial1 = totalRemunerativo * 0.06;
    var seguroObligatorio1 = 4312.73;
    var seguroSocial = 110;
    var descuentoSindical1 = 0;
    var afiliacion = document.getElementById("afiliacionSindical");
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
    var totalDescuentos1 = descuentoJubilacion1 +
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
function aPesos(valor) {
    return "$\u00A0" + valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function mostrarResultado() {
    var _a;
    var cantHsInput = document.getElementById("cantHs");
    if (!cantHsInput)
        return;
    var cantHs = parseInt(cantHsInput.value);
    //const cantHijxs = parseInt(document.getElementById("cantHijxs").value);
    //Mostrar sección de resultados
    var resultadosSection = document.getElementById("resultados");
    if (resultadosSection)
        resultadosSection.style.display = "block";
    // Ocultar todas las filas antes de mostrar resultados nuevos
    document.querySelectorAll("#tablaResultados tr").forEach(function (fila) {
        fila.style.display = "none";
    });
    // Borrar mensaje anterior si existiera (ia)
    var mensajeExistente = document.getElementById("mensajeError");
    if (mensajeExistente)
        mensajeExistente.remove();
    // Validación: campo vacío, no numérico o menor o igual a cero (ia)
    if (cargo === 1 && (!cantHsInput.value.trim() || isNaN(cantHs) || cantHs <= 0)) {
        var mensaje = document.createElement("p");
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
    var cargoEl = document.getElementById("cargo");
    cargo = parseInt((_a = cargoEl === null || cargoEl === void 0 ? void 0 : cargoEl.value) !== null && _a !== void 0 ? _a : "0");
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
    var resultados = calcularSalarioHsSecundario();
    var descuentos = calculoDescuentos(resultados.totalRemunerativo);
    var totalBolsillo = resultados.totalBruto - descuentos.totalDescuentos;
    // Mostrar resultados en la tabla
    mostrarResultados(resultados, descuentos, ["filaTotalNeto", "filaSueldoBasico", "filaZona", "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem", "filaSumaNoRem", "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1", "filaAdicionalCargo"] // ocultar
    );
}
//Función para el cálculo de hs de secundaria
function calcularSalarioHsSecundario() {
    var cantHsV = document.getElementById("cantHs");
    if (!cantHsV)
        return 0;
    var cantHs = parseInt(cantHsV.value);
    var calculoBasico = calculoBasicoHsSecundario;
    var basicoXHs = cantHs * calculoBasico;
    var bonificacionZona = basicoXHs * calculoZona();
    var bonificacionAntiguedad = basicoXHs * calculoAntiguedad();
    //let complementoRemunerativo1 = basicoXHs * 1.185; //el 1185% del básico 05/25
    var complementoRemunerativo1 = basicoXHs * 1.25; //el 1125% del básico 07/25
    //let complementoNoRemunerativo1 = basicoXHs * 1.185; //el 1185% del básico 05/25
    var complementoNoRemunerativo1 = basicoXHs * 1.12; //el 1120% del básico 07/25
    var sumaNoRemunerativa = cantHs * 4667.483; //Pago de suma no remunerativa
    var incentivoDocente = cantHs * 1913.3325; //Pago por incentivo docente
    var asignacionXHijxs1 = calcularAsignacionXHijxs();
    var totalRemunerativo1 = basicoXHs +
        complementoRemunerativo1 +
        bonificacionZona +
        bonificacionAntiguedad;
    var totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa +
        incentivoDocente + asignacionXHijxs1;
    var totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
    var resultados = calcularSalarioPreceptor();
    var descuentos = calculoDescuentos(resultados.totalRemunerativo);
    mostrarResultados(resultados, descuentos, ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
        "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
        "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"] // ocultar    
    );
}
//Función para el cálculo de preceptor
function calcularSalarioPreceptor() {
    //let basico1 = 200345.1; //Basico preceptor 05/25
    var basico1 = 209961.66; //Basico preceptor 07/25
    var bonificacionZona = basico1 * calculoZona();
    var bonificacionAntiguedad = basico1 * calculoAntiguedad();
    //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25
    var complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
    var adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo preceptor
    //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25
    var complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
    var sumaNoRemunerativa = 65973.47; //Pago de suma no remunerativa 0.3292% del básico
    var incentivoDocente = 28700; //Pago por incentivo docente
    var asignacionXHijxs = calcularAsignacionXHijxs();
    var totalRemunerativo1 = basico1 +
        complementoRemunerativo1 + adicionalXCargo1 +
        bonificacionZona +
        bonificacionAntiguedad;
    var totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa +
        incentivoDocente + asignacionXHijxs;
    var totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
    var resultados = calcularSalarioMaestrCelador();
    var descuentos = calculoDescuentos(resultados.totalRemunerativo);
    // Mostrar resultados en la tabla
    mostrarResultados(resultados, descuentos, ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
        "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
        "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
        "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"] // ocultar    
    );
}
//Función para el cálculo de maestrx celador
function calcularSalarioMaestrCelador() {
    //let basico1 = 243611.01; //Basico Maestrx Celador 05/25
    var basico1 = 243611.01; //Basico Maestrx Celador 07/25
    var bonificacionZona = basico1 * calculoZona();
    var bonificacionAntiguedad = basico1 * calculoAntiguedad();
    //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25
    var complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
    var adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo maestrx celador
    //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25
    var complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
    var sumaNoRemunerativa = 80220.9; //Pago de suma no remunerativa 0.3292% del básico
    var incentivoDocente = 28700; //Pago por incentivo docente
    var asignacionXHijxs1 = calcularAsignacionXHijxs();
    var totalRemunerativo1 = basico1 +
        complementoRemunerativo1 + adicionalXCargo1 +
        bonificacionZona +
        bonificacionAntiguedad;
    var totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa +
        incentivoDocente + asignacionXHijxs1;
    var totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
    var resultados = calcularSalarioMaestrGrado();
    var descuentos = calculoDescuentos(resultados.totalRemunerativo);
    // Mostrar resultados en la tabla
    mostrarResultados(resultados, descuentos, ["filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo",
        "filaZona", "filaComplementoNoRem", "filaAntiguedad",
        "filaComplementoRem", "filaSumaNoRem", "filaDescuentoSindical",
        "filaAsignacionXHijxs"], // mostrar
    ["filaTotalBolsillo1"] // ocultar    
    );
}
//Función para el cálculo de maestrx de grado
function calcularSalarioMaestrGrado() {
    //let basico1 = 243611.01; //Basico Maestrx de grado 05/25 (No es seguro)
    var basico1 = 222776.16; //Basico Maestrx de grado 07/25 
    var bonificacionZona = basico1 * calculoZona();
    var bonificacionAntiguedad = basico1 * calculoAntiguedad();
    //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25 (No es seguro)
    var complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
    var adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo maestrx de grado
    //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25 
    var complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
    var sumaNoRemunerativa = 70000.0; //Pago de suma no remunerativa 0.3292% del básico (Fija)
    var incentivoDocente = 28700; //Pago por incentivo docente
    var asignacionXHijxs1 = calcularAsignacionXHijxs();
    var totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalXCargo1
        + bonificacionZona + bonificacionAntiguedad;
    var totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa +
        incentivoDocente + asignacionXHijxs1;
    var totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
    var resultados = calcularSalarioMaestrxJardin();
    var descuentos = calculoDescuentos(resultados.totalRemunerativo);
    // Mostrar resultados en la tabla
    mostrarResultados(resultados, descuentos, [
        "filaTotalNeto", "filaSueldoBasico", "filaAdicionalCargo", "filaZona",
        "filaComplementoNoRem", "filaAntiguedad", "filaComplementoRem",
        "filaSumaNoRem", "filaDescuentoSindical", "filaAsignacionXHijxs",
        "filaAsignacionXHijxs"
    ], // mostrar
    ["filaTotalBolsillo1"] // ocultar    
    );
}
// Función calcular maestrx jardín
function calcularSalarioMaestrxJardin() {
    //let basico1 = ---; //Basico Maestrx Jardín 05/25 (No es seguro)
    var basico1 = 225733.456; //Basico Maestrx Jardín 07/25 
    var bonificacionZona = basico1 * calculoZona();
    var bonificacionAntiguedad = basico1 * calculoAntiguedad();
    //let complementoRemunerativo1 = basico1* 1.185; //el 1185% del básico 05/25 (No es seguro)
    var complementoRemunerativo1 = basico1 * 1.25; //el 1125% del básico 07/25
    var adicionalXCargo1 = basico1 * 0.33; //Adicional por cargo maestrx de grado
    //let complementoNoRemunerativo1 = basico1 * 1.185; //el 1185% del básico 05/25 
    var complementoNoRemunerativo1 = basico1 * 1.12; // el 1120% del básico 07/25
    var sumaNoRemunerativa = 70929.23; //Pago de suma no remunerativa 0.3292% del básico (Fija)
    var incentivoDocente = 28700; //Pago por incentivo docente
    var asignacionXHijxs1 = calcularAsignacionXHijxs();
    var totalRemunerativo1 = basico1 + complementoRemunerativo1 + adicionalXCargo1
        + bonificacionZona + bonificacionAntiguedad;
    var totalNRemunerativo1 = complementoNoRemunerativo1 + sumaNoRemunerativa +
        incentivoDocente + asignacionXHijxs1;
    var totalBruto1 = totalNRemunerativo1 + totalRemunerativo1;
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
function resetearResultados() {
    var ids = [
        "resultadoSueldo", "pagoZona", "pagoAntiguedad", "complementoRemunerativo",
        "complementoNoRemunerativo", "sumaNoRemunerativa", "incentivoDocente",
        "totalSAportes", "totalCAportes", "totalBruto", "aporteJubilatorio",
        "aporteJubilatorioEsp", "obraSocial", "totalDescuentos", "seguroObligatorio",
        "totalBolsillo", "adicionalPorCargo", "descuentoSindical", "asignacionXHijxs"
    ];
    ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el)
            el.textContent = "$0.00";
    });
}
function mostrarResultados(resultados, descuentos, filasMostrar, filasOcultar) {
    var _a, _b;
    var setText = function (id, value) {
        var el = document.getElementById(id);
        if (el)
            el.textContent = aPesos(value !== null && value !== void 0 ? value : 0);
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
    setText("totalBolsillo", ((_a = resultados.totalBruto) !== null && _a !== void 0 ? _a : 0) - ((_b = descuentos.totalDescuentos) !== null && _b !== void 0 ? _b : 0));
    setText("descuentoSindical", descuentos.descuentoSindical);
    setText("asignacionXHijxs", resultados.asignacionXHijxs);
    mostrarFilas(filasMostrar, filasOcultar);
}
function calculoTotalNeto() {
    var resultados = calcularSalarioHsSecundario();
    var descuentos = calculoDescuentos(resultados.totalRemunerativo);
    var totalBolsillo1 = calcularSalarioHsSecundario().totalBruto - descuentos.totalDescuentos;
    return {
        totalBolsillo: totalBolsillo1
    };
}
// Mostrar u ocultar filas de la tabla de resultados
function mostrarFilas(filasMostrar, filasOcultar) {
    if (filasMostrar === void 0) { filasMostrar = []; }
    if (filasOcultar === void 0) { filasOcultar = []; }
    // Mostrar las filas indicadas
    filasMostrar.forEach(function (id) {
        var fila = document.getElementById(id);
        if (fila)
            fila.style.display = "table-row";
    });
    // Ocultar las filas indicadas
    filasOcultar.forEach(function (id) {
        var fila = document.getElementById(id);
        if (fila)
            fila.style.display = "none";
    });
}
