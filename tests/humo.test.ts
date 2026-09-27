import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Test de humo de la interfaz, sin navegador.
 *
 * Carga el código COMPILADO (dist/) con un DOM de mentira que anota todo lo que
 * le pasan, simula cargar dos cargos, apretar "Calcular" y revisa lo que quedó
 * escrito en pantalla.
 *
 * No reemplaza la prueba en un navegador de verdad: no hay HTML real, ni foco,
 * ni estilos. Pero sí verifica lo que más se rompe, que es el cableado entre los
 * controles y el motor de cálculo.
 *
 * Si todavía no se compiló el proyecto, el test se saltea solo.
 */

const distFunciones = new URL("../dist/funciones.js", import.meta.url);
const hayBuild = fs.existsSync(distFunciones);

/** Un elemento de mentira: lo mínimo que usa la capa de interfaz. */
function crearElemento(id: string) {
  const elemento: any = {
    id,
    value: "",
    textContent: "",
    innerHTML: "",
    dataset: {},
    options: [],
    style: {},
    scrollIntoView: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    appendChild: () => {},
    insertAdjacentElement: () => {},
    classList: {
      _clases: new Set<string>(),
      add(clase: string) {
        this._clases.add(clase);
      },
      remove(clase: string) {
        this._clases.delete(clase);
      },
      contains(clase: string) {
        return this._clases.has(clase);
      },
      toggle(clase: string, activo?: boolean) {
        if (activo === undefined ? !this.contains(clase) : activo) this.add(clase);
        else this.remove(clase);
      },
    },
    _manejadores: new Map<string, ((evento: any) => void)[]>(),
    addEventListener(tipo: string, fn: (evento: any) => void) {
      const lista = this._manejadores.get(tipo) ?? [];
      lista.push(fn);
      this._manejadores.set(tipo, lista);
    },
    /** Llama a los manejadores anotados, como haría el navegador. */
    disparar(tipo: string, evento: any) {
      for (const fn of this._manejadores.get(tipo) ?? []) fn(evento);
    },
  };
  return elemento;
}

describe(
  "humo de la interfaz con el código compilado",
  { skip: hayBuild ? false : "falta dist/: corré el build antes de los tests" },
  () => {
    test("se cargan dos cargos, se calcula y el resultado sale en pantalla", async () => {
      const elementos = new Map<string, any>();
      const avisos: string[] = [];
      const tomarElemento = (id: string) => {
        if (!elementos.has(id)) elementos.set(id, crearElemento(id));
        return elementos.get(id);
      };

      globalThis.document = {
        getElementById: (id: string) => tomarElemento(id),
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: (etiqueta: string) => crearElemento(etiqueta),
        addEventListener: () => {},
      } as any;
      globalThis.window = { location: { href: "" }, addEventListener: () => {} } as any;
      globalThis.alert = (mensaje: string) => avisos.push(String(mensaje));

      // 1. main.js tiene que poder cargarse entero (verifica el grafo de módulos)
      await import(new URL("../dist/main.js", import.meta.url).href);

      // 2. Arranca la calculadora
      const { inicializarCalculadora, calcularYMostrar } = await import(distFunciones.href);
      inicializarCalculadora();

      const contenedor = tomarElemento("contenedorPuestos");
      assert.equal(contenedor.innerHTML.split('class="card-puesto"').length - 1, 1, "debería arrancar con un cargo");
      assert.ok(tomarElemento("antiguedad").innerHTML.includes("Más de 24 años"), "no se llenó la antigüedad");
      assert.ok(tomarElemento("afiliacionSindical").innerHTML.includes("Amet"), "no se llenó la afiliación");

      // 3. Cargo 1: 15 hs de secundaria en zona 20
      contenedor.disparar("change", {
        type: "change",
        target: { tagName: "SELECT", dataset: { campo: "zona", puesto: "1" }, value: "20" },
      });

      // 4. Se agrega un segundo cargo y se elige preceptor
      tomarElemento("btnAgregarPuesto").disparar("click", { type: "click", target: null });
      assert.equal(contenedor.innerHTML.split('class="card-puesto"').length - 1, 2, "no se agregó el segundo cargo");
      contenedor.disparar("change", {
        type: "change",
        target: { tagName: "SELECT", dataset: { campo: "tipo", puesto: "2" }, value: "preceptor" },
      });

      // 5. Antigüedad de 10 a 11 años, afiliación a Amet y mes de septiembre
      tomarElemento("antiguedad").value = "5";
      tomarElemento("antiguedad").disparar("change", { type: "change", target: { value: "5" } });
      tomarElemento("afiliacionSindical").value = "amet";
      tomarElemento("afiliacionSindical").disparar("change", { type: "change", target: { value: "amet" } });
      tomarElemento("mesCalculo").value = "2026-09";

      // 6. Calcular
      calcularYMostrar();

      assert.deepEqual(avisos, [], `la calculadora avisó algo inesperado: ${avisos.join(" / ")}`);
      assert.equal(tomarElemento("resultados").style.display, "block");
      assert.ok(!tomarElemento("botonGraficos").classList.contains("oculto"), "el gráfico quedó oculto");
      assert.equal(tomarElemento("cantidadPuestos").textContent, "2 cargos cargados y sumados");

      // 7. El total de pantalla tiene que ser el que devuelve el motor con esos datos
      const { calcularPluriempleo } = await import(new URL("../dist/cargos.js", import.meta.url).href);
      const { configuracionesDelMes } = await import(new URL("../dist/configuracion.js", import.meta.url).href);
      const esperado = calcularPluriempleo(
        [
          { tipo: "horaSecundaria", cantHoras: 15, zonaPct: 20, presencialidad: true },
          { tipo: "preceptor", cantHoras: 15, zonaPct: 0, presencialidad: true },
        ],
        configuracionesDelMes("2026-09"),
        { antiguedadPct: 0.5, afiliacion: "amet", incluirSAC: false }
      );
      const aPesos = (valor: number) =>
        "$ " + valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      assert.equal(tomarElemento("totalBolsillo").textContent, aPesos(esperado.totalBolsillo));
      assert.equal(tomarElemento("totalBruto").textContent, aPesos(esperado.conceptos.totalBruto));
      assert.equal(tomarElemento("totalCAportes").textContent, aPesos(esperado.conceptos.totalRemunerativo));
      assert.equal(tomarElemento("pagoZona").textContent, aPesos(esperado.conceptos.pagoDeZona));

      // 8. El desglose tiene una fila por cargo y una de total
      const filas = tomarElemento("cuerpoDesglose").innerHTML.split("<tr").length - 1;
      assert.equal(filas, 3, "el desglose debería tener dos cargos y el total");
      assert.ok(tomarElemento("cuerpoDesglose").innerHTML.includes("Preceptor"));

      // 9. Tocar el formulario esconde el resultado viejo
      contenedor.disparar("change", {
        type: "change",
        target: { tagName: "SELECT", dataset: { campo: "zona", puesto: "1" }, value: "0" },
      });
      assert.equal(tomarElemento("resultados").style.display, "none", "el resultado viejo quedó a la vista");
    });
  }
);
