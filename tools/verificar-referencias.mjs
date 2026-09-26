// Verifica que todos los recursos locales referenciados desde el HTML y el CSS
// existan realmente. Sirve para detectar rutas rotas (por ejemplo, si se
// renombra una imagen y queda una referencia vieja).
import fs from "node:fs";
import path from "node:path";

const paginas = ["index.html", "recursos.html", "sobreNosotros.html"];
const faltantes = [];
const refs = new Set();

for (const pagina of paginas) {
  const html = fs.readFileSync(pagina, "utf8");
  for (const m of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|#|\/\/)/.test(url)) continue;
    refs.add(url.replace(/^\//, ""));
  }
}

for (const ref of [...refs].sort()) {
  if (!fs.existsSync(ref)) faltantes.push(`HTML: ${ref}`);
}
console.log(`  recursos locales referenciados desde el HTML: ${refs.size}`);

const hojas = [
  "css/style.css", "css/base.css", "css/calculadora.css",
  "css/layout.css", "css/componentes.css", "css/variables.css",
];

for (const hoja of hojas) {
  const css = fs.readFileSync(hoja, "utf8");
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    const url = m[1].trim();
    if (/^(https?:|data:)/.test(url)) continue;
    const ruta = path.join(path.dirname(hoja), url);
    if (!fs.existsSync(ruta)) faltantes.push(`CSS: ${hoja} -> ${url}`);
  }
}

if (faltantes.length > 0) {
  console.log("  REFERENCIAS ROTAS:");
  for (const f of faltantes) console.log(`    - ${f}`);
  process.exitCode = 1;
} else {
  console.log("  todas las referencias resuelven. OK");
}
