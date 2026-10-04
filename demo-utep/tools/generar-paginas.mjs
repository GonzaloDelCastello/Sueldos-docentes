/**
 * © 2026 Gonzalo J. Del Castello. Todos los derechos reservados.
 * Muestra de diseño y material comercial: ver NOTICE.md en la raíz del
 * repositorio para saber qué se puede hacer con este archivo.
 */
/**
 * Generador de las páginas internas de la muestra de UTEP-S.L.
 *
 * Las páginas comparten cabecera y pie. En vez de repetir ese marcado en cada
 * archivo (y tener que corregirlo cinco veces el día que cambie un enlace), el
 * marcado común vive en `plantilla.html` y el contenido propio de cada página,
 * en `contenido-*.html`.
 *
 * Cada archivo de contenido empieza con un bloque de metadatos:
 *
 *     <!--
 *     TITULO: ...
 *     DESCRIPCION: ...
 *     ACTIVO: noticias
 *     -->
 *
 * Uso:  node demo-utep/tools/generar-paginas.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aca = path.dirname(fileURLToPath(import.meta.url));
const demo = path.resolve(aca, "..");

const plantilla = fs.readFileSync(path.join(aca, "plantilla.html"), "utf8");

/** Las páginas que se generan y qué necesita cada una. */
const paginas = [
  { contenido: "contenido-noticias.html", salida: "noticias.html", scripts: [] },
  { contenido: "contenido-afiliacion.html", salida: "afiliacion.html", scripts: [] },
  {
    contenido: "contenido-inflacion.html",
    salida: "inflacion.html",
    scripts: [
      '  <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>',
      '  <script type="module" src="js/app/main.js"></script>',
    ],
  },
];

/** Lee los metadatos del encabezado del archivo de contenido. */
function leerMetadatos(texto) {
  const bloque = texto.match(/<!--([\s\S]*?)-->/);
  if (!bloque) throw new Error("el archivo de contenido no tiene bloque de metadatos");

  const datos = {};
  for (const linea of bloque[1].split("\n")) {
    const par = linea.match(/^\s*([A-Z]+):\s*(.+?)\s*$/);
    if (par) datos[par[1]] = par[2];
  }

  // El contenido es todo lo que viene después del bloque de metadatos.
  const contenido = texto.slice(bloque.index + bloque[0].length).trim();
  return { datos, contenido };
}

/** Deja el atributo aria-current sólo en el enlace de la página activa. */
function navActivo(activo, seccion) {
  return activo === seccion ? ' aria-current="page"' : "";
}

for (const pagina of paginas) {
  const archivo = path.join(aca, pagina.contenido);
  const { datos, contenido } = leerMetadatos(fs.readFileSync(archivo, "utf8"));

  const html = plantilla
    .replaceAll("{{TITULO}}", datos.TITULO ?? "UTEP San Luis")
    .replaceAll("{{DESCRIPCION}}", datos.DESCRIPCION ?? "")
    .replaceAll("{{ACTIVO_INICIO}}", navActivo(datos.ACTIVO, "inicio"))
    .replaceAll("{{ACTIVO_NOTICIAS}}", navActivo(datos.ACTIVO, "noticias"))
    .replaceAll("{{ACTIVO_AFILIACION}}", navActivo(datos.ACTIVO, "afiliacion"))
    .replaceAll("{{ACTIVO_CALCULADORA}}", navActivo(datos.ACTIVO, "calculadora"))
    .replaceAll("{{ACTIVO_INFLACION}}", navActivo(datos.ACTIVO, "inflacion"))
    .replaceAll("{{CONTENIDO}}", contenido)
    .replaceAll("{{SCRIPTS}}", pagina.scripts.join("\n"));

  const salida = path.join(demo, pagina.salida);
  fs.writeFileSync(salida, html, "utf8");
  console.log(`generado: ${pagina.salida} (${html.length} caracteres)`);
}
