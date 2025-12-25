import { resetearResultados, mostrarResultado } from './funciones.js';
let cargo = 0; // Variable global para el cargo seleccionado
let nivel = 0; // Variable global para el nivel seleccionado
//let calculoBasicoHsSecundario = 14173.99; Básico hs secundaria 05/25
let calculoBasicoHsSecundario = 14854.34; //07/25
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
        resetearResultados(); // Reiniciar resultados al cambiar cargo
    });
    // Inicializar opciones de cargo al cargar la página
    actualizarOpcionesCargo(parseInt(selectNivel.value));
});
const btnMostrarResultado = document.getElementById("btnMostrarResultado");
if (btnMostrarResultado) {
    btnMostrarResultado.addEventListener("click", mostrarResultado);
}
// Mostrar fecha actual en formato legible (único listener, robusto)
document.addEventListener("DOMContentLoaded", () => {
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    // Obtener el elemento y asignar si existe (no usar optional chaining en LHS)
    const fechaEl = document.getElementById("fechaActual");
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString("es-AR", opciones);
    }
});
//# sourceMappingURL=main.js.map