import { calculoZona, calcularAsignacionXHijxs, resetearResultados, mostrarResultado } from './funcionesCalculo.js';

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
      } else {
        menuToggle.classList.remove('oculto');  
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function (event) {
      if (
        navegacion.classList.contains('activo') &&
        !navegacion.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
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
    1: [ // Inicial
      { value: 0, text: "Cargo no disponible" }] // Nivel inicial no tiene cargos implementados
    ,
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
    }
    resetearResultados(); // Reiniciar resultados al cambiar cargo
  });
  // Inicializar opciones de cargo al cargar la página
  actualizarOpcionesCargo(parseInt(selectNivel.value)); 
});
document.getElementById("btnMostrarResultado").addEventListener("click", mostrarResultado); 


// Mostrar fecha actual en formato legible
document.addEventListener("DOMContentLoaded", function () {
  const fecha = new Date();
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById("fechaActual").textContent = fecha.toLocaleDateString("es-AR", opciones);
});


