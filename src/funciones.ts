/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
import {
  AFILIACIONES,
  ESCALA_ANTIGUEDAD,
  ETIQUETA_NIVEL,
  ZONAS,
  calcularPluriempleo,
  cargosDelNivel,
  definicionDe,
  montoEnseñanzaEnAula,
  porcentajeAntiguedad,
} from "./cargos.js";
import type { Afiliacion, Nivel, ResultadoPluriempleo, TipoCargo } from "./cargos.js";
import { htmlPuesto, resumenPuesto } from "./formulario.js";
import type { CatalogoFormulario, PuestoFormulario } from "./formulario.js";
import { configuracionesDelMes } from "./configuracion.js";
import { HISTORIAL_BASICO } from "./historial.js";
import { HISTORIAL_INFLACION } from "./inflacion.js";
import { calcularInflacionAcumulada, calcularVariacionSalarial } from "./calculos.js";

/**
 * Capa de interfaz de la calculadora.
 *
 * Acá vive todo lo que toca la página: leer los formularios, dibujar las
 * tarjetas de cada cargo y mostrar los resultados. Las cuentas las hace
 * cargos.ts, que es puro y se puede testear.
 *
 * El formulario funciona con una lista de puestos en memoria. Cada cambio en
 * un control actualiza esa lista, y cuando el usuario pide el cálculo se
 * mandan todos los puestos juntos al motor.
 */

declare const Chart: any; // Chart.js llega por CDN, no tiene tipos acá
let miGraficoSueldo: any = null;

/** El catálogo real de cargos, para que lo use el armador de tarjetas. */
const CATALOGO: CatalogoFormulario = {
  niveles: ["inicial", "primario", "secundario", "superior"],
  etiquetaNivel: ETIQUETA_NIVEL,
  zonas: ZONAS,
  cargosDelNivel,
  definicionDe,
  montoEnAula: montoEnseñanzaEnAula,
};

let puestos: PuestoFormulario[] = [];
let proximoId = 1;
let afiliacion: Afiliacion = "no";
let antiguedadIndice = 0;

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

export function inicializarCalculadora(): void {
  const contenedor = document.getElementById("contenedorPuestos");
  if (!contenedor) return; // No estamos en la página de la calculadora

  completarSelectores();
  conectarEventos(contenedor);

  // El gráfico recién aparece cuando hay un resultado para mostrar.
  document.getElementById("botonGraficos")?.classList.add("oculto");

  if (puestos.length === 0) agregarPuesto();
}

/** Un puesto nuevo, con valores razonables para que se pueda calcular de una. */
function agregarPuesto(): void {
  puestos.push({
    id: proximoId++,
    nivel: "secundario",
    tipo: "horaSecundaria",
    cantHoras: 15,
    zonaPct: 0,
    presencialidad: true,
  });
  renderizarPuestos();
  ocultarResultados();
}

function quitarPuesto(id: number): void {
  if (puestos.length <= 1) {
    alert("Necesitás al menos un cargo para calcular.");
    return;
  }
  puestos = puestos.filter((puesto) => puesto.id !== id);
  renderizarPuestos();
  ocultarResultados();
}

/**
 * Esconde el resultado cuando se toca el formulario.
 *
 * Es a propósito que sea tan agresivo: si el usuario cambia un cargo, una zona
 * o el mes, los números que quedaron en pantalla ya no son los de su situación.
 * Más vale que tenga que apretar "Calcular" de nuevo.
 */
function ocultarResultados(): void {
  const seccion = document.getElementById("resultados");
  if (seccion) seccion.style.display = "none";
  document.getElementById("botonGraficos")?.classList.add("oculto");

  if (miGraficoSueldo !== null) {
    miGraficoSueldo.destroy();
    miGraficoSueldo = null;
  }
}

function completarSelectores(): void {
  const selectAntiguedad = document.getElementById("antiguedad") as HTMLSelectElement | null;
  if (selectAntiguedad) {
    selectAntiguedad.innerHTML = ESCALA_ANTIGUEDAD.map(
      (tramo, indice) => `<option value="${indice}">${tramo.etiqueta}</option>`
    ).join("");
    selectAntiguedad.value = String(antiguedadIndice);
  }

  const selectAfiliacion = document.getElementById("afiliacionSindical") as HTMLSelectElement | null;
  if (selectAfiliacion) {
    selectAfiliacion.innerHTML = AFILIACIONES.map(
      (opcion) => `<option value="${opcion.valor}">${opcion.etiqueta}</option>`
    ).join("");
    selectAfiliacion.value = afiliacion;
  }
}

function conectarEventos(contenedor: HTMLElement): void {
  document.getElementById("btnAgregarPuesto")?.addEventListener("click", agregarPuesto);
  document.getElementById("btnCalcularSueldo")?.addEventListener("click", calcularYMostrar);

  document.getElementById("antiguedad")?.addEventListener("change", (evento) => {
    antiguedadIndice = Number((evento.target as HTMLSelectElement).value) || 0;
    ocultarResultados();
  });

  document.getElementById("afiliacionSindical")?.addEventListener("change", (evento) => {
    afiliacion = (evento.target as HTMLSelectElement).value as Afiliacion;
    ocultarResultados();
  });

  document.getElementById("mesCalculo")?.addEventListener("change", ocultarResultados);

  // Delegación: los controles de cada tarjeta se identifican con data-puesto.
  contenedor.addEventListener("change", manejarCambio);
  contenedor.addEventListener("input", manejarCambio);
  contenedor.addEventListener("click", manejarClick);
}

function manejarCambio(evento: Event): void {
  const control = evento.target as HTMLSelectElement | HTMLInputElement;

  // En los <select> el navegador dispara input y change: procesamos uno solo.
  if (evento.type === "input" && control.tagName === "SELECT") return;

  const campo = control.dataset.campo;
  const puesto = puestos.find((p) => p.id === Number(control.dataset.puesto));
  if (!puesto || !campo) return;

  switch (campo) {
    case "nivel": {
      // Al cambiar el nivel hay que rearmar la lista de cargos y la tarjeta.
      puesto.nivel = control.value as Nivel;
      puesto.tipo = cargosDelNivel(puesto.nivel)[0]?.tipo ?? "horaSecundaria";
      renderizarPuestos();
      break;
    }
    case "tipo":
      puesto.tipo = control.value as TipoCargo;
      renderizarPuestos();
      break;
    case "cantHoras":
      puesto.cantHoras = Number(control.value) || 0;
      actualizarResumenPuesto(puesto);
      break;
    case "zona":
      puesto.zonaPct = Number(control.value) || 0;
      actualizarResumenPuesto(puesto);
      break;
    case "presencialidad":
      puesto.presencialidad = control.value === "1";
      break;
  }

  ocultarResultados();
}

function manejarClick(evento: Event): void {
  const boton = (evento.target as HTMLElement).closest("button[data-accion='quitar']");
  if (!boton) return;
  quitarPuesto(Number((boton as HTMLElement).dataset.puesto));
}

// ---------------------------------------------------------------------------
// Dibujo de las tarjetas de cargo
// ---------------------------------------------------------------------------

function renderizarPuestos(): void {
  const contenedor = document.getElementById("contenedorPuestos");
  if (!contenedor) return;
  const puedeQuitar = puestos.length > 1;
  contenedor.innerHTML = puestos
    .map((puesto, indice) => htmlPuesto(puesto, indice, puedeQuitar, CATALOGO))
    .join("");
}

function actualizarResumenPuesto(puesto: PuestoFormulario): void {
  const resumen = document.querySelector(`[data-resumen="${puesto.id}"]`);
  if (resumen) resumen.textContent = resumenPuesto(puesto, CATALOGO);
}

// ---------------------------------------------------------------------------
// Cálculo
// ---------------------------------------------------------------------------

/**
 * Lee el mes elegido, calcula todos los puestos y muestra el recibo consolidado.
 * La cantidad de horas se valida acá y no en el medio del cálculo.
 */
export function calcularYMostrar(): void {
  const selectMes = document.getElementById("mesCalculo") as HTMLSelectElement | null;
  if (!selectMes) return;

  const elegido = selectMes.value;
  const incluirSAC = elegido.includes("-SAC");
  const periodo = elegido.replace("-SAC", "");

  const problema = validarPuestos();
  if (problema) {
    alert(problema);
    return;
  }

  const resultado = calcularPluriempleo(
    puestos.map(({ tipo, cantHoras, zonaPct, presencialidad }) => ({
      tipo,
      cantHoras,
      zonaPct,
      presencialidad,
    })),
    configuracionesDelMes(periodo),
    { antiguedadPct: porcentajeAntiguedad(antiguedadIndice), afiliacion, incluirSAC }
  );

  mostrarResultados(resultado, incluirSAC);

  const seccion = document.getElementById("resultados");
  if (seccion) seccion.style.display = "block";
  document.getElementById("botonGraficos")?.classList.remove("oculto");

  setTimeout(() => {
    seccion?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 250);
}

/** Devuelve el mensaje de error, o null si está todo bien. */
function validarPuestos(): string | null {
  if (puestos.length === 0) return "Cargá al menos un cargo antes de calcular.";

  for (const [indice, puesto] of puestos.entries()) {
    if (definicionDe(puesto.tipo).usaHoras) {
      if (!Number.isFinite(puesto.cantHoras) || puesto.cantHoras <= 0) {
        return `En el cargo ${indice + 1} ingresá una cantidad válida de horas.`;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Resultados
// ---------------------------------------------------------------------------

export function aPesos(valor: number): string {
  return "$ " + valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setTexto(id: string, valor: number): void {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = aPesos(valor);
}

/** Muestra la fila solo si el concepto tiene importe (si no, no ensucia la tabla). */
function mostrarFilaSi(id: string, valor: number): void {
  const fila = document.getElementById(id);
  if (fila) fila.style.display = valor > 0 ? "table-row" : "none";
}

function mostrarResultados(resultado: ResultadoPluriempleo, incluirSAC: boolean): void {
  const conceptos = resultado.conceptos;
  const descuentos = resultado.descuentos;
  const aguinaldo = resultado.aguinaldo;

  setTexto("resultadoSueldo", conceptos.basico);
  setTexto("pagoZona", conceptos.pagoDeZona);
  setTexto("pagoAntiguedad", conceptos.pagoAntiguedad);
  setTexto("complementoRemunerativo", conceptos.complementoRemunerativo);
  setTexto("adicionalPorCargo", conceptos.adicionalPorCargo);
  setTexto("adicionalPorDedicacion", conceptos.adicionalPorDedicacion);
  setTexto("enseñanzaEnAula", conceptos.enseñanzaEnAula);
  setTexto("complementoNoRemunerativo", conceptos.complementoNoRemunerativo);
  setTexto("sumaNoRemunerativa", conceptos.sumaNoRemunerativa);
  setTexto("incentivoDocente", conceptos.incentivoDocente);
  setTexto("bonoExtraordinario", conceptos.bonoExtraordinario);
  setTexto("totalCAportes", conceptos.totalRemunerativo);
  setTexto("totalSAportes", conceptos.totalNoRemunerativo);
  setTexto("totalBruto", conceptos.totalBruto);

  setTexto("aporteJubilatorio", descuentos.jubilacion);
  setTexto("aporteJubilatorioEsp", descuentos.jubilacionRegEsp);
  setTexto("obraSocial", descuentos.obraSocial);
  setTexto("descuentoSindical", descuentos.sindical);
  setTexto("seguroObligatorio", descuentos.seguroObligatorio);
  setTexto("seguroSocial", descuentos.seguroSocial);
  setTexto("seguroMutual", descuentos.seguroMutual);
  setTexto("totalDescuentosTexto", descuentos.total);
  setTexto("totalDescuentos", descuentos.total);

  setTexto("sacBruto", aguinaldo.bruto);
  setTexto("sacDescuentos", aguinaldo.descuentos);
  setTexto("sacNeto", aguinaldo.neto);

  setTexto("totalBolsillo", resultado.totalBolsillo);

  mostrarFilaSi("filaSueldoBasico", conceptos.basico);
  mostrarFilaSi("filaZona", conceptos.pagoDeZona);
  mostrarFilaSi("filaAntiguedad", conceptos.pagoAntiguedad);
  mostrarFilaSi("filaComplementoRem", conceptos.complementoRemunerativo);
  mostrarFilaSi("filaAdicionalCargo", conceptos.adicionalPorCargo);
  mostrarFilaSi("filaAdicionalPorDedicacion", conceptos.adicionalPorDedicacion);
  mostrarFilaSi("filaEnseñanzaEnAula", conceptos.enseñanzaEnAula);
  mostrarFilaSi("filaComplementoNoRem", conceptos.complementoNoRemunerativo);
  mostrarFilaSi("filaSumaNoRem", conceptos.sumaNoRemunerativa);
  mostrarFilaSi("filaIncentivoDocente", conceptos.incentivoDocente);
  mostrarFilaSi("filaBonoExtraordinario", conceptos.bonoExtraordinario);
  mostrarFilaSi("filaDescuentoSindical", descuentos.sindical);

  const cantidad = document.getElementById("cantidadPuestos");
  if (cantidad) {
    cantidad.textContent =
      resultado.puestos.length === 1
        ? "1 cargo cargado"
        : `${resultado.puestos.length} cargos cargados y sumados`;
  }

  renderizarDesglose(resultado);
  mostrarPorcentajes(resultado);
  dibujarGrafico(resultado, incluirSAC);
}

// ---------------------------------------------------------------------------
// Porcentajes por tipo de concepto
// ---------------------------------------------------------------------------

/** Formatea un porcentaje al estilo argentino, con un decimal. */
function aPorcentaje(valor: number): string {
  return valor.toLocaleString("es-AR", { maximumFractionDigits: 1 }) + "%";
}

/**
 * Muestra cuánto del neto del mes es remunerativo y cuánto no remunerativo.
 *
 * Los descuentos salen del bruto, así que para comparar los dos conceptos
 * contra el neto se calcula la tasa de descuento y se le aplica pareja a los
 * dos:
 *
 *   tasa = (bruto − neto) / bruto
 *   neto de cada concepto = importe × (1 − tasa)
 *
 * Así los dos importes mostrados suman el neto del mes y sus porcentajes dan
 * 100%. Como la tasa es la misma para los dos, la proporción entre ellos queda
 * igual a la del bruto.
 *
 * Ojo, esto es distinto de cómo se liquida de verdad: en el recibo los
 * descuentos de ley se calculan sobre el remunerativo, no repartidos. Acá se
 * reparten a propósito, porque lo que se quiere mostrar es la composición del
 * neto. Por eso la página lo aclara con una nota.
 *
 * El neto del mes es el bruto menos los descuentos. No se usa el total de
 * bolsillo porque ese total incluye el aguinaldo, y el aguinaldo no integra el
 * sueldo del mes.
 */
function mostrarPorcentajes(resultado: ResultadoPluriempleo): void {
  const { conceptos, descuentos, aguinaldo } = resultado;

  const bruto = conceptos.totalBruto;
  const netoDelMes = bruto - descuentos.total;

  function escribir(id: string, contenido: string): void {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = contenido;
  }

  if (bruto <= 0 || netoDelMes <= 0) {
    ["pctRemunerativos", "pctNoRemunerativos", "pctDescuentos", "pctAguinaldo"].forEach((id) =>
      escribir(id, "")
    );
    return;
  }

  // El neto del mes va en su propia línea, arriba del bruto y los descuentos.
  setTexto("netoDelMes", netoDelMes);

  const porcentajeSobre = (valor: number, base: number, etiqueta: string): string =>
    valor > 0 && base > 0 ? `${aPorcentaje((valor / base) * 100)} ${etiqueta}` : "";

  // ANTES de desplegar, en el encabezado de cada ficha: el porcentaje del NETO.
  escribir("pctNetoRemunerativos",
    porcentajeSobre(conceptos.totalRemunerativo, netoDelMes, "del neto"));
  escribir("pctNetoNoRemunerativos",
    porcentajeSobre(conceptos.totalNoRemunerativo, netoDelMes, "del neto"));
  escribir("pctNetoAguinaldo",
    porcentajeSobre(aguinaldo.neto, netoDelMes, "del neto"));

  // Ya desplegada la ficha, debajo del importe: el porcentaje del BRUTO.
  escribir("pctBrutoRemunerativos",
    porcentajeSobre(conceptos.totalRemunerativo, bruto, "del bruto"));
  escribir("pctBrutoNoRemunerativos",
    porcentajeSobre(conceptos.totalNoRemunerativo, bruto, "del bruto"));
  // El aguinaldo no integra el bruto del mes, así que no lleva porcentaje
  // sobre él. Se deja vacío a propósito.
  escribir("pctBrutoAguinaldo", "");
}

/** Tabla con lo que aporta cada cargo al total. */
function renderizarDesglose(resultado: ResultadoPluriempleo): void {
  const cuerpo = document.getElementById("cuerpoDesglose");
  if (!cuerpo) return;

  const filas = resultado.puestos.map((calculado, indice) => {
    const definicion = definicionDe(calculado.puesto.tipo);
    const horas = definicion.usaHoras ? String(calculado.puesto.cantHoras) : "—";
    const zona = definicion.usaZona ? `${calculado.puesto.zonaPct}%` : "—";
    return `
      <tr>
        <td>Cargo ${indice + 1}: ${definicion.etiqueta}</td>
        <td>${horas}</td>
        <td>${zona}</td>
        <td>${aPesos(calculado.conceptos.totalRemunerativo)}</td>
        <td>${aPesos(calculado.conceptos.totalNoRemunerativo)}</td>
        <td>${aPesos(calculado.conceptos.totalBruto)}</td>
      </tr>
    `;
  });

  filas.push(`
    <tr class="fila-subtotal">
      <th>Total</th>
      <th></th>
      <th></th>
      <th>${aPesos(resultado.conceptos.totalRemunerativo)}</th>
      <th>${aPesos(resultado.conceptos.totalNoRemunerativo)}</th>
      <th>${aPesos(resultado.conceptos.totalBruto)}</th>
    </tr>
  `);

  cuerpo.innerHTML = filas.join("");
}

// ---------------------------------------------------------------------------
// Gráfico
// ---------------------------------------------------------------------------

function dibujarGrafico(resultado: ResultadoPluriempleo, incluirSAC: boolean): void {
  const lienzo = document.getElementById("miGrafico") as HTMLCanvasElement | null;
  if (!lienzo || typeof Chart === "undefined") return;

  if (miGraficoSueldo !== null) miGraficoSueldo.destroy();

  const conceptos = resultado.conceptos;
  const conceptosPosibles: { etiqueta: string; valor: number; color: string }[] = [
    // Remunerativos (verdes)
    { etiqueta: "Básico", valor: conceptos.basico, color: "#046205" },
    { etiqueta: "Zona", valor: conceptos.pagoDeZona, color: "#05ff04" },
    { etiqueta: "Antigüedad", valor: conceptos.pagoAntiguedad, color: "#28a745" },
    {
      etiqueta: "Adicional por cargo",
      valor: conceptos.adicionalPorCargo + conceptos.adicionalPorDedicacion,
      color: "#a3d139",
    },
    { etiqueta: "Comp. Remunerativo", valor: conceptos.complementoRemunerativo, color: "#1fde4c" },
    { etiqueta: "Enseñanza en Aula", valor: conceptos.enseñanzaEnAula, color: "#198754" },
    {
      etiqueta: "Aguinaldo",
      valor: incluirSAC ? resultado.aguinaldo.bruto : 0,
      color: "#0f5132",
    },
    // No remunerativos (azules y violetas)
    { etiqueta: "Comp. No Remunerativo", valor: conceptos.complementoNoRemunerativo, color: "#0dcaf0" },
    { etiqueta: "Suma No Remunerativa", valor: conceptos.sumaNoRemunerativa, color: "#0d6efd" },
    { etiqueta: "Incentivo Docente", valor: conceptos.incentivoDocente, color: "#a27ae3" },
    { etiqueta: "Bono Extraordinario", valor: conceptos.bonoExtraordinario, color: "#6f42c1" },
  ];

  const activos = conceptosPosibles.filter((concepto) => concepto.valor > 0);

  miGraficoSueldo = new Chart(lienzo, {
    type: "doughnut",
    data: {
      labels: activos.map((concepto) => concepto.etiqueta),
      datasets: [
        {
          data: activos.map((concepto) => concepto.valor),
          backgroundColor: activos.map((concepto) => concepto.color),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "#333", font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const etiqueta = context.label || "";
              const valor = context.raw as number;
              const total = context.chart._metasets[context.datasetIndex].total;
              const porcentaje = ((valor / total) * 100).toFixed(1);
              return `${etiqueta}: ${aPesos(valor)} (${porcentaje}%)`;
            },
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Comparador de inflación
// ---------------------------------------------------------------------------

export function compararPeriodo(mesInicio: string, mesFin: string) {
  // Validación de fechas
  if (mesInicio === mesFin) {
    alert("Para calcular una variación, el mes de inicio y el mes final deben ser diferentes.");
    return;
  }
  if (mesInicio > mesFin) {
    alert("El mes de inicio debe ser anterior al mes final");
    return;
  }
  if (mesInicio < "2023-06") {
    alert("Existen datos a partir de Junio de 2023. Seleccione una fecha posterior a este periodo.");
    return;
  }
  if (mesFin > "2026-08") {
    alert("Existen datos hasta de Agosto de 2026. Seleccione una fecha anterior a este periodo.");
    return;
  }

  const inflacionPorcentual = calcularInflacionAcumulada(HISTORIAL_INFLACION, mesInicio, mesFin);
  const datosSalariales = calcularVariacionSalarial(HISTORIAL_BASICO, mesInicio, mesFin);

  return {
    inflacionPorcentual,
    variacionSalarial: datosSalariales.diferenciaPorcentual,
    diferenciaAbsoluta: datosSalariales.diferenciaAbsoluta,
    basicoInicio: datosSalariales.basicoInicio,
    basicoFin: datosSalariales.basicoFin,
  };
}

// ---------------------------------------------------------------------------
// Mail de contacto
// ---------------------------------------------------------------------------

const btnEnviarRecibo = document.getElementById("btnEnviarRecibo") as HTMLButtonElement | null;

if (btnEnviarRecibo) {
  btnEnviarRecibo.addEventListener("click", () => {
    // El correo se arma en dos partes para engañar a los bots de spam.
    const usuario = "gonzafokito";
    const dominio = "gmail.com";
    const asunto = "Consulta o aporte para la calculadora de sueldos docentes";
    const cuerpo = " ";
    window.location.href = `mailto:${usuario}@${dominio}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  });
}
