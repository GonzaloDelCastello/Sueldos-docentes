import { setPeriodoCalculo, resetearResultados, mostrarResultadoActual as mostrarResultadoActual } from './funciones.js';
let cargo = 0; // Variable global para el cargo seleccionado
let nivel = 0; // Variable global para el nivel seleccionado
const contenedorResultados = document.getElementById('resultados');
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');
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
    const cargosPorNivel = {
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
            { value: 0, text: "Selecciona un cargo" },
            { value: 7, text: "Prof. tiempo completo, 30 hs." },
            { value: 8, text: "Prof. semiexclusivo, 25 hs." },
        ] // Nivel superior no tiene cargos implementados
    };
    const selectNivel = document.getElementById("nivel");
    const selectCargo = document.getElementById("cargo");
    const formSecundario = document.getElementById("formSecundario");
    const formFijo = document.getElementById("formFijo");
    const zona = document.getElementById("zona1");
    if (!selectNivel || !selectCargo)
        return;
    // Función para actualizar las opciones del select de cargo según el nivel seleccionado
    function actualizarOpcionesCargo(nivelSeleccionado) {
        // Limpiar opciones actuales
        selectCargo.innerHTML = "";
        // Agregar nuevas opciones basadas en el nivel seleccionado
        (cargosPorNivel[nivel] || [{ value: 0, text: "Selecciona un Nivel ⬆ ⬆" }]).forEach(opcion => {
            const opt = document.createElement("option");
            opt.value = opcion.value.toString();
            opt.textContent = opcion.text;
            selectCargo.appendChild(opt);
        });
    }
    // Evento al cambiar el nivel
    selectNivel.addEventListener("change", function () {
        const nivelSeleccionado = this.value;
        nivel = parseInt(this.value);
        actualizarOpcionesCargo(nivel); // Actualizar cargos
        resetearResultados(); // Reiniciar resultados al cambiar nivel
        contenedorResultados.style.display = "none"; // Ocultar resultados al cambiar nivel
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
        resetearResultados();
        // Mostrar según selección
        switch (cargo) {
            case 1: // Hs. Secundaria
                if (formSecundario)
                    formSecundario.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                break;
            case 2: // Preceptor
                //formPreceptor.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                break;
            case 3: // Maestrx Celador
                //formMaestrCelador.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                break;
            case 4: // Maestrx de grado
                //formMaestrGrado.classList.remove("oculto");
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                break;
            case 6: // Maestrx Jardín
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                break;
            case 7: // IFDC Prof. tiempo completo, 30 hs.
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.add("oculto");
                break;
            case 8: // IFDC Prof. semiexclusivo, 25 hs.
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.add("oculto");
                break;
        }
        // ... aquí termina tu switch(cargo) { ... }
        // Damos un pequeño respiro (150ms) para que el navegador dibuje los formularios nuevos
        setTimeout(() => {
            if (formFijo && !formFijo.classList.contains("oculto")) {
                formFijo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            if (cargo === 1) {
                const inputHoras = document.getElementById("cantHs");
                if (inputHoras) {
                    inputHoras.focus();
                }
            }
        }, 150);
        resetearResultados(); // Reiniciar resultados al cambiar cargo
        contenedorResultados.style.display = "none";
    });
    // Inicializar opciones de cargo al cargar la página
    actualizarOpcionesCargo(parseInt(selectNivel.value));
    // Función que oculta resultados y borra el gráfico si tocamos algo
    function limpiarPantallaAlEscribir() {
        // Asumiendo que contenedorResultados está declarado al principio de tu main.ts
        if (typeof contenedorResultados !== 'undefined' && contenedorResultados) {
            contenedorResultados.style.display = "none";
        }
        resetearResultados(); // Esto borra el texto y destruye el gráfico
    }
    // Le decimos a los formularios (que ya buscaste arriba) que escuchen los cambios
    if (formSecundario) {
        formSecundario.addEventListener("input", limpiarPantallaAlEscribir);
        formSecundario.addEventListener("change", limpiarPantallaAlEscribir);
    }
    if (formFijo) {
        formFijo.addEventListener("input", limpiarPantallaAlEscribir);
        formFijo.addEventListener("change", limpiarPantallaAlEscribir);
    }
});
const btnMostrarResultadoActual = document.getElementById("btnMostrarResultadoActual");
if (btnMostrarResultadoActual) {
    btnMostrarResultadoActual.addEventListener("click", () => {
        setPeriodoCalculo("2026-02"); //Periodo actual 02/26
        mostrarResultadoActual();
        setTimeout(() => {
            contenedorResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
    });
}
const btnMostrarResultado1 = document.getElementById("btnMostrarResultado1");
if (btnMostrarResultado1) {
    btnMostrarResultado1.addEventListener("click", () => {
        setPeriodoCalculo("2026-04"); //Periodo actual 04/26
        mostrarResultadoActual();
        setTimeout(() => {
            contenedorResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
    });
}
// Mostrar fecha actual en formato legible 
document.addEventListener("DOMContentLoaded", () => {
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    // Obtener el elemento y asignar si existe (no usar optional chaining en LHS)
    const fechaEl = document.getElementById("fechaActual");
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString("es-AR", opciones);
    }
});
//# sourceMappingURL=main.js.map