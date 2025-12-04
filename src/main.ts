import { resetearResultados, mostrarResultado } from './funciones.js';

let cargo: number = 0; // Variable global para el cargo seleccionado
let nivel: number = 0; // Variable global para el nivel seleccionado
//let calculoBasicoHsSecundario = 14173.99; Básico hs secundaria 05/25
let calculoBasicoHsSecundario: number = 14854.34; //07/25
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector('.menu-toggle') as HTMLElement | null;
  const navegacion = document.querySelector('.navegacion') as HTMLElement | null;
  
   if (menuToggle && navegacion) {
    // Abre/cierra con el botón hamburguesa
    menuToggle.addEventListener('click', function (event: MouseEvent) {
      event.stopPropagation(); // evita que se dispare el click global
      navegacion.classList.toggle('activo');
      if (navegacion.classList.contains('activo')) {
        menuToggle.classList.add('oculto');  
      } else {
        menuToggle.classList.remove('oculto');  
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function (event: MouseEvent) {
      if (
        navegacion.classList.contains('activo') &&
        !navegacion.contains(event.target as Node) &&
        !menuToggle.contains(event.target as Node)
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
  interface Opcion {
    value: number;
    text: string;
  }
  const cargosPorNivel: Record<number, Opcion[]> = {
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

  
    const selectNivel = document.getElementById("nivel") as HTMLSelectElement | null; 
    const selectCargo = document.getElementById("cargo")  as HTMLSelectElement | null;
    const formSecundario = document.getElementById("formSecundario") as HTMLSelectElement | null;
    const formFijo = document.getElementById("formFijo")  as HTMLSelectElement | null;  
    
    if (!selectNivel || !selectCargo) return;
     // Función para actualizar las opciones del select de cargo según el nivel seleccionado
    function actualizarOpcionesCargo(nivelSeleccionado: number) {
      // Limpiar opciones actuales
      selectCargo!.innerHTML = "";
      // Agregar nuevas opciones basadas en el nivel seleccionado
      (cargosPorNivel[nivel] || [{ value: 0, text: "Selecciona un Nivel ⬆ ⬆" }]).forEach(opcion => {
      const opt = document.createElement("option");
      opt.value = opcion.value.toString();
      opt.textContent = opcion.text;
      selectCargo!.appendChild(opt);
      });
    }
    // Evento al cambiar el nivel
    selectNivel.addEventListener("change", function (this: HTMLSelectElement) {
      const nivelSeleccionado = this.value;
      nivel = parseInt(this.value);
      actualizarOpcionesCargo(nivel); // Actualizar cargos
      resetearResultados(); // Reiniciar resultados al cambiar nivel
    });
     
    // Muestra el formulario correspondiente al cargo seleccionado
  selectCargo.addEventListener("change", function (this: HTMLSelectElement) {
    cargo = parseInt(this.value);
    // Ocultar todos
    if (formSecundario) formSecundario.classList.add("oculto");
    if (formFijo) formFijo.classList.add("oculto");

    // Resetear resultados al cambiar cargo
    resetearResultados();
    // Mostrar según selección
    switch (cargo) {
      case 1:
        if (formSecundario) formSecundario.classList.remove("oculto");
        if (formFijo) formFijo.classList.remove("oculto");
        break;
      case 2:
        //formPreceptor.classList.remove("oculto");
        if (formFijo) formFijo.classList.remove("oculto");
        break;
      case 3:
        //formMaestrCelador.classList.remove("oculto");
        if (formFijo) formFijo.classList.remove("oculto");
        break;
      case 4:
        //formMaestrGrado.classList.remove("oculto");
        if (formFijo) formFijo.classList.remove("oculto");
        break;
      case 6:
        if (formFijo) formFijo.classList.remove("oculto");
        break;
    }
    resetearResultados(); // Reiniciar resultados al cambiar cargo
  });
  // Inicializar opciones de cargo al cargar la página
  actualizarOpcionesCargo(parseInt(selectNivel.value)); 
});
const btnMostrarResultado = document.getElementById("btnMostrarResultado") as HTMLButtonElement | null;
if (btnMostrarResultado) {
  btnMostrarResultado.addEventListener("click", mostrarResultado);
}

// Mostrar fecha actual en formato legible (único listener, robusto)
document.addEventListener("DOMContentLoaded", () => {
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // Obtener el elemento y asignar si existe (no usar optional chaining en LHS)
  const fechaEl = document.getElementById("fechaActual") as HTMLElement | null;
  if (fechaEl) {
    fechaEl.textContent = new Date().toLocaleDateString("es-AR", opciones);
  }
});