import { setPeriodoCalculo, resetearResultados, setIncluirSAC, mostrarResultadoActual as mostrarResultadoActual, ejecutarComparativa } from './funciones.js';
let cargo = 0; // Variable global para el cargo seleccionado
let nivel = 0; // Variable global para el nivel seleccionado
const btnMostrarResultadoActual = document.getElementById("btnMostrarResultadoActual");
const btnMostrarResultadoActualBono = document.getElementById("btnMostrarResultadoActualBono");
const btnGraficos = document.getElementById("botonGraficos");
const contenedorResultados = document.getElementById('resultados');
//Vistas calculadora y comparador
const tabCalculadora = document.getElementById("tab-calculadora");
const tabInflacion = document.getElementById("tab-inflacion");
const vistaCalculadora = document.getElementById("vista-calculadora");
const vistaInflacion = document.getElementById("vista-inflacion");
tabInflacion?.addEventListener("click", () => {
    vistaCalculadora?.classList.add("oculto");
    vistaInflacion?.classList.remove("oculto");
    tabCalculadora?.classList.remove("activo");
    tabInflacion?.classList.add("activo");
});
tabCalculadora?.addEventListener("click", () => {
    vistaInflacion?.classList.add("oculto");
    vistaCalculadora?.classList.remove("oculto");
    tabInflacion?.classList.remove("activo");
    tabCalculadora?.classList.add("activo");
});
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');
    btnMostrarResultadoActual?.classList.add("oculto"); // Ocultamos el botón de resultado actual al cargar la página, se mostrará solo para cargos con datos cargados
    btnMostrarResultadoActualBono?.classList.add("oculto"); // Ocultamos el botón de resultado actual con bonoal cargar la página, se mostrará solo para cargos con datos cargados
    btnGraficos?.classList.add("oculto"); // Ocultamos el botón de gráficos al cargar la página, se mostrará solo para cargos con datos cargados
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
    const presencialidad = document.getElementById("presencialidadCont");
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
                if (presencialidad)
                    presencialidad.classList.add("oculto"); // Ocualtamos el ítem de presencialidad
                break;
            case 2: // Preceptor
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                if (presencialidad)
                    presencialidad.classList.add("oculto"); // Ocualtamos el ítem de presencialidad
                break;
            case 3: // Maestrx Celador
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                if (presencialidad)
                    presencialidad.classList.remove("oculto"); // Agregamos el ítem de presencialidad
                break;
            case 4: // Maestrx de grado
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                if (presencialidad)
                    presencialidad.classList.remove("oculto"); // Agregamos el ítem de presencialidad
                break;
            case 6: // Maestrx Jardín
                if (formFijo)
                    formFijo.classList.remove("oculto");
                if (zona)
                    zona.classList.remove("oculto");
                if (presencialidad)
                    presencialidad.classList.remove("oculto"); // Agregamos el ítem de presencialidad
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
            btnCalcularSueldo?.classList.remove("oculto");
            btnGraficos?.classList.remove("oculto");
            btnGraficos?.classList.remove("oculto"); // Mostramos el botón de gráficos solo después de que el usuario haya seleccionado un cargo, para evitar confusiones
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
const selectMesCalculo = document.getElementById("mesCalculo");
const btnCalcularSueldo = document.getElementById("btnCalcularSueldo");
// Motor centralizado de cálculo
if (btnCalcularSueldo && selectMesCalculo) {
    btnCalcularSueldo.addEventListener("click", () => {
        // Leemos qué eligió el docente
        const valorSeleccionado = selectMesCalculo.value;
        // ¿El valor elegido incluye la palabra SAC?
        if (valorSeleccionado.includes("-SAC")) {
            // Le quitamos el "-SAC" para que historial.ts entienda la fecha (ej: queda "2026-06")
            setPeriodoCalculo(valorSeleccionado.replace("-SAC", ""));
            setIncluirSAC(true); // Prendemos la suma del aguinaldo
        }
        else {
            // Es un mes normal o con bono (ej: "2026-05" o "2026-05-B")
            setPeriodoCalculo(valorSeleccionado);
            setIncluirSAC(false); // Apagamos el aguinaldo
        }
        // Ejecutamos la matemática y deslizamos la pantalla
        mostrarResultadoActual();
        setTimeout(() => { contenedorResultados.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
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
// Comparativa de inflación
const btnComparar = document.getElementById("btnComparar");
const inputInicio = document.getElementById("mesInicio");
const inputFin = document.getElementById("mesFin");
btnComparar.addEventListener("click", () => {
    const inicio = inputInicio.value;
    const fin = inputFin.value;
    if (!inicio || !fin) {
        alert("Por favor, seleccioná ambos meses.");
        return;
    }
    const resultado = ejecutarComparativa(inicio, fin);
    if (resultado) {
        const divRes = document.getElementById("resultadoInflacion");
        const pTexto = document.getElementById("textoResultado");
        pTexto.innerText = `En este periodo, la inflación acumulada fue del ${resultado.inflacion.toFixed(1)}%`;
        divRes.classList.remove("oculto");
    }
    else {
        // Opcional: manejar el caso donde el resultado fue undefined
        console.error("No se pudo realizar el cálculo");
    }
    const divRes = document.getElementById("resultadoInflacion");
    const pTexto = document.getElementById("textoResultado");
    pTexto.innerText = `En este periodo, la inflación acumulada fue del ${resultado?.inflacion.toFixed(1)}%`;
    divRes.classList.remove("oculto");
});
//# sourceMappingURL=main.js.map