/**
 * Convierte documentos Markdown a texto plano, pensado para escuchar.
 *
 * Por qué existe: los sintetizadores de voz leen los símbolos de Markdown.
 * Dicen "numeral", "asterisco asterisco", "backtick". También leen el código
 * carácter por carácter, que es insoportable. Este script limpia todo eso.
 *
 * Uso:
 *   node tools/apuntes-a-texto.mjs                      (procesa docs/*.md)
 *   node tools/apuntes-a-texto.mjs docs/backlog.md      (procesa uno solo)
 *
 * Por cada archivo .md escribe un .txt al lado, con el mismo nombre.
 *
 * Criterio de escritura que aplica al .md, no al .txt: el cuerpo tiene que
 * poder escucharse. Frases cortas, sin tablas, sin símbolos en medio del
 * texto, y el código separado en un anexo al final que este script corta.
 */
import fs from "node:fs";
import path from "node:path";

const PALABRAS_POR_MINUTO = 150; // ritmo aproximado de lectura en voz alta

function limpiar(markdown) {
  let texto = markdown;

  // 1. Cortar el anexo de código: es para leer, no para escuchar.
  const corte = texto.search(/^#\s*Anexo\./m);
  if (corte !== -1) {
    texto = texto.slice(0, corte);
    texto +=
      "Fin del documento.\n\n" +
      "El anexo con el codigo quedo solo en la version escrita, para leer con los ojos.\n";
  }

  // 2. Sacar los bloques de código, por si quedó alguno.
  texto = texto.replace(/```[\s\S]*?```/g, "\n");

  // 3. Títulos: el numeral no se lee, así que se elimina.
  texto = texto.replace(/^#{1,6}\s+/gm, "");

  // 4. Casillas de tareas: los corchetes se leerían "corchete".
  texto = texto.replace(/^\s*[-*]\s+\[[ xX]\]\s+/gm, "  ");

  // 5. Viñetas simples.
  texto = texto.replace(/^\s*[-*]\s+/gm, "  ");

  // 6. Énfasis y código en línea: se quitan los símbolos, se conserva el texto.
  texto = texto.replace(/\*\*(.+?)\*\*/g, "$1");
  texto = texto.replace(/\*(.+?)\*/g, "$1");
  texto = texto.replace(/`(.+?)`/g, "$1");

  // 7. Enlaces: se conserva el texto y la dirección entre paréntesis.
  texto = texto.replace(/\[(.+?)\]\((.+?)\)/g, "$1, en $2");

  // 8. Líneas divisorias: el sintetizador las leería "guion guion guion".
  texto = texto.replace(/^\s*-{3,}\s*$/gm, "");

  // 9. Espacios sobrantes.
  texto = texto.replace(/[ \t]+$/gm, "");
  texto = texto.replace(/\n{3,}/g, "\n\n");

  return texto.trim() + "\n";
}

function procesar(archivoMd) {
  const texto = limpiar(fs.readFileSync(archivoMd, "utf8"));
  const destino = archivoMd.replace(/\.md$/, ".txt");
  fs.writeFileSync(destino, texto, "utf8");

  const palabras = texto.split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));
  console.log(`  ${destino}`);
  console.log(`    ${palabras} palabras, unos ${minutos} minutos de audio`);
}

const argumentos = process.argv.slice(2);
const archivos =
  argumentos.length > 0
    ? argumentos
    : fs
        .readdirSync("docs")
        .filter((n) => n.endsWith(".md"))
        .map((n) => path.join("docs", n));

console.log("Generando versiones para escuchar...");
for (const archivo of archivos) {
  if (!fs.existsSync(archivo)) {
    console.log(`  ${archivo}: no existe, se saltea`);
    continue;
  }
  procesar(archivo);
}
console.log("Listo.");
