"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funciones_1 = require("./funciones");
var cargo = 0; // Variable global para el cargo seleccionado
var nivel = 0; // Variable global para el nivel seleccionado
//let calculoBasicoHsSecundario = 14173.99; Básico hs secundaria 05/25
var calculoBasicoHsSecundario = 14854.34; //07/25
document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var navegacion = document.querySelector('.navegacion');
    if (menuToggle && navegacion) {
        // Abre/cierra con el botón hamburguesa
        menuToggle.addEventListener('click', function (event) {
            event.stopPropagation(); // evita que se dispare el click global
            navegacion.classList.toggle('activo');
            if (navegacion.classList.contains('activo')) {
                menuToggle.classList.add('oculto');
            }
            else {
                menuToggle.classList.remove('oculto');
            }
        });
        // Cerrar al hacer click fuera
        document.addEventListener('click', function (event) {
            if (navegacion.classList.contains('activo') &&
                !navegacion.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                navegacion.classList.remove('activo');
                menuToggle.classList.remove('oculto');
            }
        });
        // Cerrar al hacer scroll
        window.addEventListener('scroll', function () {
            if (navegacion.classList.contains('activo')) {
                navegacion.classList.remove('activo');
                menuToggle.classList.remove('oculto');
            }
        });
    }
    var cargosPorNivel = {
        1: [
            { value: 0, text: "Selecciona un cargo" },
            { value: 6, text: "Maestrx Jardín" },
        ],
        2: [
            { value: 0, text: "Selecciona un cargo" },
            { value: 3, text: "Cargo Maestrx Celador" },
            { value: 4, text: "Maestrx de grado" },
            { value: 5, text: "Cargo Maestrx Especial (Proximamente)" },
        ],
        3: [
            { value: 0, text: "Selecciona un cargo" },
            { value: 1, text: "Hs. en Secundario" },
            { value: 2, text: "Cargo Preceptor" },
        ],
        4: [
            { value: 0, text: "Cargo no disponible" }
        ] // Nivel superior no tiene cargos implementados
    };
    var selectNivel = document.getElementById("nivel");
    var selectCargo = document.getElementById("cargo");
    var formSecundario = document.getElementById("formSecundario");
    var formFijo = document.getElementById("formFijo");
    if (!selectNivel || !selectCargo)
        return;
    // Función para actualizar las opciones del select de cargo según el nivel seleccionado
    function actualizarOpcionesCargo(nivelSeleccionado) {
        // Limpiar opciones actuales
        selectCargo.innerHTML = "";
        // Agregar nuevas opciones basadas en el nivel seleccionado
        (cargosPorNivel[nivel] || [{ value: 0, text: "Selecciona un Nivel ⬆ ⬆" }]).forEach(function (opcion) {
            var opt = document.createElement("option");
            opt.value = opcion.value.toString();
            opt.textContent = opcion.text;
            selectCargo.appendChild(opt);
        });
    }
    // Evento al cambiar el nivel
    selectNivel.addEventListener("change", function () {
        var nivelSeleccionado = this.value;
        nivel = parseInt(this.value);
        actualizarOpcionesCargo(nivel); // Actualizar cargos
        (0, funciones_1.resetearResultados)(); // Reiniciar resultados al cambiar nivel
    });
    // Muestra el formulario correspondiente al cargo seleccionado
    selectCargo.addEventListener("change", function () {
        cargo = parseInt(this.value);
        // Ocultar todos
        if (formSecundario)
            formSecundario.classList.add("oculto");
        if (formFijo)
            formFijo.classList.add("oculto");
        // Resetear resultados al cambiar cargo
        (0, funciones_1.resetearResultados)();
        // Mostrar según selección
        switch (cargo) {
            case 1:
                if (formSecundario)
                    formSecundario.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                break;
            case 2:
                //formPreceptor.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                break;
            case 3:
                //formMaestrCelador.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                break;
            case 4:
                //formMaestrGrado.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                break;
            case 6:
                if (formFijo)
                    formFijo.classList.remove("oculto");
                break;
        }
        (0, funciones_1.resetearResultados)(); // Reiniciar resultados al cambiar cargo
    });
    // Inicializar opciones de cargo al cargar la página
    actualizarOpcionesCargo(parseInt(selectNivel.value));
});
var btnMostrarResultado = document.getElementById("btnMostrarResultado");
if (btnMostrarResultado) {
    btnMostrarResultado.addEventListener("click", funciones_1.mostrarResultado);
}
// Mostrar fecha actual en formato legible
// document.addEventListener("DOMContentLoaded", function () {
//   const fecha = new Date();
//   const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
//   document.getElementById("fechaActual").textContent = fecha.toLocaleDateString("es-AR", opciones);
// });
document.addEventListener("DOMContentLoaded", function () {
    var fechaActualEl = document.getElementById("fechaActual");
    if (fechaActualEl) {
        var fecha = new Date();
        var opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        fechaActualEl.textContent = fecha.toLocaleDateString("es-AR", opciones);
    }
});
