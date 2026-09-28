import type { DefinicionCargo, Nivel, Puesto, TipoCargo } from "./cargos.js";

/**
 * Armado del HTML de cada tarjeta de cargo.
 *
 * Está separado de funciones.ts a propósito: acá solo se arma texto, así que se
 * puede probar en Node (ver tests/formulario.test.ts) sin abrir un navegador.
 * Toda la manipulación de la página queda del otro lado.
 *
 * El catálogo de cargos llega por parámetro y no por import: así este archivo no
 * depende de los datos y se puede probar con un catálogo de mentira.
 */

/** Un cargo del formulario: los datos de cálculo más lo que necesita la pantalla. */
export interface PuestoFormulario extends Puesto {
  id: number;
  nivel: Nivel;
}

/** Lo que el formulario necesita saber de los cargos para dibujarse. */
export interface CatalogoFormulario {
  niveles: readonly Nivel[];
  etiquetaNivel: Readonly<Record<Nivel, string>>;
  zonas: readonly number[];
  cargosDelNivel: (nivel: Nivel) => readonly DefinicionCargo[];
  definicionDe: (tipo: TipoCargo) => DefinicionCargo;
  /** Cuánto paga el ítem de enseñanza en el aula para ese cargo. */
  montoEnAula: (tipo: TipoCargo) => number;
}

/** Formatea un monto para mostrarlo dentro del formulario (ej: $ 93.750). */
function pesos(valor: number): string {
  return "$ " + valor.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

/** El texto corto que resume el cargo en el encabezado de la tarjeta. */
export function resumenPuesto(puesto: PuestoFormulario, catalogo: CatalogoFormulario): string {
  const definicion = catalogo.definicionDe(puesto.tipo);
  const partes = [definicion.etiqueta];
  if (definicion.usaHoras) partes.push(`${puesto.cantHoras} hs`);
  if (definicion.usaZona) partes.push(`zona ${puesto.zonaPct}%`);
  return partes.join(" · ");
}

/**
 * La tarjeta completa de un cargo. Solo muestra los controles que ese cargo
 * necesita: cantidad de horas, zona y presentismo se agregan según corresponda.
 */
export function htmlPuesto(
  puesto: PuestoFormulario,
  indice: number,
  puedeQuitar: boolean,
  catalogo: CatalogoFormulario
): string {
  const definicion = catalogo.definicionDe(puesto.tipo);

  const opcionesNivel = catalogo.niveles
    .map(
      (nivel) =>
        `<option value="${nivel}" ${nivel === puesto.nivel ? "selected" : ""}>${catalogo.etiquetaNivel[nivel]}</option>`
    )
    .join("");

  const opcionesCargo = catalogo
    .cargosDelNivel(puesto.nivel)
    .map(
      (cargo) =>
        `<option value="${cargo.tipo}" ${cargo.tipo === puesto.tipo ? "selected" : ""}>${cargo.etiqueta}</option>`
    )
    .join("");

  const campoHoras = definicion.usaHoras
    ? `<span class="campo-horas">
         <label for="cantHs-${puesto.id}">Cantidad de hs cátedra
           <input type="number" min="1" max="60" id="cantHs-${puesto.id}" value="${puesto.cantHoras}"
                  data-campo="cantHoras" data-puesto="${puesto.id}">
         </label>
       </span>`
    : "";

  const campoZona = definicion.usaZona
    ? `<span class="campo-zona">
         <label for="zona-${puesto.id}">Bonificación por zona
           <select id="zona-${puesto.id}" data-campo="zona" data-puesto="${puesto.id}">
             ${catalogo.zonas
               .map(
                 (zona) =>
                   `<option value="${zona}" ${zona === puesto.zonaPct ? "selected" : ""}>${zona}%</option>`
               )
               .join("")}
           </select>
         </label>
       </span>`
    : "";

  // El monto depende del cargo (el decreto le asigna horas frente a alumnos a
  // cada función), así que se muestra en la opción para que no haya sorpresas.
  const montoEnAula = catalogo.montoEnAula(puesto.tipo);
  const campoPresencialidad = definicion.usaPresencialidad
    ? `<span class="campo-presencialidad">
         <label for="presencialidad-${puesto.id}">Ítem presencialidad (enseñanza en el aula)
           <select id="presencialidad-${puesto.id}" data-campo="presencialidad" data-puesto="${puesto.id}">
             <option value="1" ${puesto.presencialidad ? "selected" : ""}>Sí (${pesos(montoEnAula)})</option>
             <option value="0" ${puesto.presencialidad ? "" : "selected"}>No</option>
           </select>
         </label>
       </span>`
    : "";

  const botonQuitar = puedeQuitar
    ? `<button type="button" class="btn-quitar-puesto" data-accion="quitar" data-puesto="${puesto.id}">
           ✕ Quitar
         </button>`
    : "";

  return `
    <div class="card-puesto">
      <div class="card-puesto__header">
        <h4 class="card-puesto__titulo">
          <span class="badge-puesto">Cargo ${indice + 1}</span>
          <span class="resumen-puesto" data-resumen="${puesto.id}">${resumenPuesto(puesto, catalogo)}</span>
        </h4>
        ${botonQuitar}
      </div>
      <fieldset class="grid-form">
        <span><label for="nivel-${puesto.id}">Nivel educativo
          <select id="nivel-${puesto.id}" data-campo="nivel" data-puesto="${puesto.id}">
            ${opcionesNivel}
          </select>
        </label></span>
        <span><label for="cargo-${puesto.id}">Tipo de cargo
          <select id="cargo-${puesto.id}" data-campo="tipo" data-puesto="${puesto.id}">
            ${opcionesCargo}
          </select>
        </label></span>
        ${campoHoras}
        ${campoZona}
        ${campoPresencialidad}
      </fieldset>
    </div>
  `;
}
