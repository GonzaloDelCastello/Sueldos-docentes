import { calculoZona, calcularAsignacionXHijxs, resetearResultados, mostrarResultado } from './funcionesCalculo.js';

let cargo = 0; // Variable global para el cargo seleccionado
let nivel = 0; // Variable global para el nivel seleccionado
//let calculoBasicoHsSecundario = 14173.99; Básico hs secundaria 05/25
let calculoBasicoHsSecundario = 14854.34; //07/25
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const navegacion = document.querySelector('.navegacion');

  if (menuToggle && navegacion) {
    // Un solo lugar que abre y cierra, para que no queden estados a medias
    // (antes cada rama repetía el classList.add/remove del botón).
    function cerrarMenu() {
      if (!navegacion.classList.contains('activo')) return; // nada que hacer
      navegacion.classList.remove('activo');
      // El botón YA NO se oculta: si se ocultaba, el menú quedaba imposible de cerrar.
      menuToggle.classList.remove('abierto');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    function abrirMenu() {
      navegacion.classList.add('activo');
      menuToggle.classList.add('abierto');
      menuToggle.setAttribute('aria-expanded', 'true');
    }

    // Accesibilidad: el lector de pantalla necesita saber que este botón
    // controla el menú y si está abierto o cerrado.
    menuToggle.setAttribute('aria-controls', 'navegacion');
    menuToggle.setAttribute('aria-expanded', 'false');

    // Abre/cierra con el botón hamburguesa
    menuToggle.addEventListener('click', function (event) {
      event.stopPropagation(); // evita que se dispare el click global de cierre
      if (navegacion.classList.contains('activo')) {
        cerrarMenu();
      } else {
        abrirMenu();
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function (event) {
      if (
        navegacion.classList.contains('activo') &&
        !navegacion.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        cerrarMenu();
      }
    });

    // Cerrar con Escape (se puede usar el menú solo con teclado)
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navegacion.classList.contains('activo')) {
        cerrarMenu();
        menuToggle.focus();
      }
    });

    // Cerrar al hacer scroll
    window.addEventListener('scroll', function () {
      cerrarMenu();
    });
  }
  const cargosPorNivel = {
    1: [ // Inicial
      { value: 0, text: "Selecciona un cargo" },
      { value: 6, text: "Maestrx Jardín" },
    ],
    
    2: [ // Primaria
      { value: 0, text: "Selecciona un cargo" },
      { value: 3, text: "Cargo Maestrx Celador" },
      { value: 4, text: "Maestrx de grado" },
      { value: 5, text: "Cargo Maestrx Especial (Proximamente)" },
    ],
    3: [ // Secundaria
      { value: 0, text: "Selecciona un cargo" },
      { value: 1, text: "Hs. en Secundario" },
      { value: 2, text: "Cargo Preceptor" },
    ],
    4: [ // Superior
      { value: 0, text: "Cargo no disponible" }] // Nivel superior no tiene cargos implementados
  };

  
    const selectNivel = document.getElementById("nivel"); 
    const selectCargo = document.getElementById("cargo");
    const formSecundario = document.getElementById("formSecundario");
    const formFijo = document.getElementById("formFijo");  
    
    if (!selectNivel || !selectCargo) return;
     // Función para actualizar las opciones del select de cargo según el nivel seleccionado
    function actualizarOpcionesCargo(nivelSeleccionado) {
      // Limpiar opciones actuales
      selectCargo.innerHTML = "";
      // Agregar nuevas opciones basadas en el nivel seleccionado
      (cargosPorNivel[nivel] || [{ value: 0, text: "Selecciona un Nivel ⬆ ⬆" }]).forEach(opcion => {
      const opt = document.createElement("option");
      opt.value = opcion.value;
      opt.textContent = opcion.text;
      selectCargo.appendChild(opt);
      });
    }
    // Evento al cambiar el nivel
    selectNivel.addEventListener("change", function () {
      const nivelSeleccionado = this.value;
      nivel = parseInt(nivelSeleccionado);
      actualizarOpcionesCargo(nivelSeleccionado);
      resetearResultados(); // Reiniciar resultados al cambiar nivel
    });
     
    // Muestra el formulario correspondiente al cargo seleccionado
  selectCargo.addEventListener("change", function () {
    cargo = parseInt(this.value);
    // Ocultar todos
    formSecundario.classList.add("oculto");
    
    // Resetear resultados al cambiar cargo
    resetearResultados();
    // Mostrar según selección
    switch (cargo) {
      case 1:
        formSecundario.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 2:
        //formPreceptor.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 3:
        //formMaestrCelador.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 4:
        //formMaestrGrado.classList.remove("oculto");
        formFijo.classList.remove("oculto");
        break;
      case 6:
        formFijo.classList.remove("oculto");
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

// La fecha del encabezado se sacó: no se muestra en ninguna página.