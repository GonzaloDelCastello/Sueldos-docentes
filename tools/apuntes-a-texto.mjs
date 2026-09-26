/**
 * Convierte los apuntes en Markdown a texto plano, pensado para escuchar.
 *
 * Por qué existe: los sintetizadores de voz leen los símbolos de Markdown.
 * Dicen "numeral", "asterisco asterisco", "backtick". También leen el código
 * carácter por carácter, que es insoportable. Este script limpia todo eso y
 * corta el anexo de código, que solo tiene sentido para leer con los ojos.
 *
 * Uso:
 *   node tools/apuntes-a-texto.mjs
 *
 * Salida:
 *   docs/apuntes-para-estudiar.txt
 */
import fs from "node:fs";

const ORIGEN = "docs/apuntes-para-estudiar.md";
const DESTINO = "docs/apuntes-para-estudiar.txt";

let texto = fs.readFileSync(ORIGEN, "utf8");

// 1. Cortar el anexo de código: es para leer, no para escuchar.
const corte = texto.indexOf("# Anexo.");
if (corte !== -1) {
  texto = texto.slice(0, corte);
  texto +=
    "Fin de los apuntes.\n\n" +
    "El anexo con el codigo quedo solo en la version escrita, para leer con los ojos.\n";
}

// 2. Sacar los bloques de código, por si quedó alguno.
texto = texto.replace(/```[\s\S]*?```/g, "\n");

// 3. Títulos: el numeral no se lee, así que se elimina.
texto = texto.replace(/^#{1,6}\s+/gm, "");

// 4. Énfasis y código en línea: se quitan los símbolos, se conserva el texto.
texto = texto.replace(/\*\*(.+?)\*\*/g, "$1");
texto = texto.replace(/\*(.+?)\*/g, "$1");
texto = texto.replace(/`(.+?)`/g, "$1");

// 5. Enlaces: se conserva el texto y la dirección entre paréntesis.
texto = texto.replace(/\[(.+?)\]\((.+?)\)/g, "$1, en $2");

// 6. Viñetas: se convierten en un guion hablado.
texto = texto.replace(/^\s*[-*]\s+/gm, "  ");

// 7. Líneas divisorias: el sintetizador las leería como "guion guion guion".
texto = texto.replace(/^\s*-{3,}\s*$/gm, "");

// 8. Espacios sobrantes.
texto = texto.replace(/[ \t]+$/gm, "");
texto = texto.replace(/\n{3,}/g, "\n\n");
texto = texto.trim() + "\n";

fs.writeFileSync(DESTINO, texto, "utf8");

const palabras = texto.split(/\s+/).length;
const minutos = Math.round(palabras / 150); // ritmo de lectura en voz alta
console.log(`  ${DESTINO}`);
console.log(`  ${palabras} palabras, unos ${minutos} minutos de audio`);
