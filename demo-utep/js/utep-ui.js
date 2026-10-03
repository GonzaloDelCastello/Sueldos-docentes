/**
 * UTEP-S.L. · Interfaz de la muestra
 *
 * Se ocupa de lo que no es cálculo:
 *
 *   1. El menú móvil (abrir, cerrar al tocar afuera, cerrar con Escape).
 *   2. Las pestañas entre la calculadora y el comparador dentro de la misma
 *      página, y los estados vacíos que se ven antes de calcular.
 *
 * El motor de cálculo (js/app/main.js) hace el resto y no se toca.
 */
(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // Menú móvil
  // -------------------------------------------------------------------------
  var botonMenu = document.getElementById("botonMenu");
  var nav = document.getElementById("navPrincipal");

  if (botonMenu && nav) {
    function cerrarMenu() {
      nav.classList.remove("activo");
      botonMenu.setAttribute("aria-expanded", "false");
    }

    function abrirMenu() {
      nav.classList.add("activo");
      botonMenu.setAttribute("aria-expanded", "true");
    }

    botonMenu.addEventListener("click", function (evento) {
      evento.stopPropagation();
      if (nav.classList.contains("activo")) {
        cerrarMenu();
      } else {
        abrirMenu();
      }
    });

    document.addEventListener("click", function (evento) {
      if (
        nav.classList.contains("activo") &&
        !nav.contains(evento.target) &&
        !botonMenu.contains(evento.target)
      ) {
        cerrarMenu();
      }
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && nav.classList.contains("activo")) {
        cerrarMenu();
        botonMenu.focus();
      }
    });

    nav.addEventListener("click", function (evento) {
      if (evento.target.tagName === "A") cerrarMenu();
    });
  }

  // -------------------------------------------------------------------------
  // Pestañas y estados vacíos
  // -------------------------------------------------------------------------
  var tabCalculadora = document.getElementById("tab-calculadora");
  var tabInflacion = document.getElementById("tab-inflacion");
  var vistaCalculadora = document.getElementById("vista-calculadora");
  var vistaInflacion = document.getElementById("vista-inflacion");
  var estadoCalculo = document.getElementById("estadoVacioCalculo");
  var estadoInflacion = document.getElementById("estadoVacioInflacion");
  var resultados = document.getElementById("resultados");
  var resultadoInflacion = document.getElementById("resultadoInflacion");

  /** Muestra u oculta un bloque sin tocar el estilo que maneja el motor. */
  function visible(elemento, mostrar) {
    if (!elemento) return;
    // El motor usa style.display; el estado vacío se maneja con la clase.
    elemento.classList.toggle("oculto", !mostrar);
  }

  function actualizarEstadoCalculo() {
    var hayResultado = resultados && resultados.style.display !== "none";
    visible(estadoCalculo, !hayResultado);
  }

  function actualizarEstadoInflacion() {
    var hayResultado = resultadoInflacion && !resultadoInflacion.classList.contains("oculto");
    visible(estadoInflacion, !hayResultado);
  }

  if (resultados && estadoCalculo) {
    // El motor muestra y esconde los resultados sin avisar: se observa el
    // atributo para acompañar el cambio con el estado vacío.
    new MutationObserver(actualizarEstadoCalculo).observe(resultados, {
      attributes: true,
      attributeFilter: ["style"],
    });
    actualizarEstadoCalculo();
  }

  if (resultadoInflacion && estadoInflacion) {
    new MutationObserver(actualizarEstadoInflacion).observe(resultadoInflacion, {
      attributes: true,
      attributeFilter: ["class"],
    });
    actualizarEstadoInflacion();
  }

  function mostrarCalculadora() {
    vistaCalculadora && vistaCalculadora.classList.remove("oculto");
    vistaInflacion && vistaInflacion.classList.add("oculto");
    tabCalculadora && tabCalculadora.classList.add("activo");
    tabInflacion && tabInflacion.classList.remove("activo");
    actualizarEstadoCalculo();
  }

  function mostrarInflacion() {
    vistaCalculadora && vistaCalculadora.classList.add("oculto");
    vistaInflacion && vistaInflacion.classList.remove("oculto");
    tabCalculadora && tabCalculadora.classList.remove("activo");
    tabInflacion && tabInflacion.classList.add("activo");
    actualizarEstadoInflacion();
  }

  tabCalculadora && tabCalculadora.addEventListener("click", mostrarCalculadora);
  tabInflacion && tabInflacion.addEventListener("click", mostrarInflacion);
})();
