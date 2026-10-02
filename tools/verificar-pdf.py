"""Verifica un PDF generado por tools/texto-a-pdf.py sin abrirlo.

Hace tres cosas:
  1. Valida la estructura: cabecera, tabla xref y que cada offset apunte a su objeto.
  2. Reconstruye el texto de cada página leyendo los operadores del content stream,
     con la posición y el ancho de cada línea.
  3. Avisa si alguna línea se sale de los márgenes o si hay texto fuera de la hoja.

Uso: python tools/verificar-pdf.py docs/resumen-calculadora.pdf [--texto]
"""
import importlib.util
import re
import sys
from pathlib import Path

ANCHO, ALTO = 595.28, 841.89
MARGEN_X, MARGEN_SUP, MARGEN_INF = 52.0, 58.0, 58.0

# El medidor del generador, para calcular el ancho de lo dibujado.
especificacion = importlib.util.spec_from_file_location(
    "texto_a_pdf", Path(__file__).with_name("texto-a-pdf.py")
)
modulo = importlib.util.module_from_spec(especificacion)
especificacion.loader.exec_module(modulo)
MEDIDOR = modulo.Medidor()

ESTILOS = {"/F1": "normal", "/F2": "bold", "/F3": "italic"}


def validar_estructura(datos: bytes) -> list[str]:
    problemas = []
    if not datos.startswith(b"%PDF-"):
        problemas.append("no empieza con %PDF-")
    if not datos.rstrip().endswith(b"%%EOF"):
        problemas.append("no termina con %%EOF")

    coincidencia = re.search(rb"startxref\s+(\d+)", datos)
    if not coincidencia:
        problemas.append("no encontré startxref")
        return problemas

    tabla = datos[int(coincidencia.group(1)):]
    filas = re.findall(rb"(\d{10}) (\d{5}) ([nf])", tabla)
    if not filas:
        problemas.append("la tabla xref no tiene filas")
        return problemas

    for indice, (offset, _, tipo) in enumerate(filas):
        if tipo == b"f":
            continue
        posicion = int(offset)
        if datos[posicion:posicion + len(f"{indice} 0 obj".encode())] != f"{indice} 0 obj".encode():
            problemas.append(f"el offset del objeto {indice} no apunta a su objeto")
        cuerpo = datos[posicion:posicion + 400]
        marcas = (b"/Catalog", b"/Type /Pages", b"/Type /Page ", b"/Font", b"/Length", b"/Title")
        if not any(marca in cuerpo for marca in marcas):
            problemas.append(f"el objeto {indice} no parece un objeto válido")
    return problemas


def paginas(datos: bytes) -> list[bytes]:
    """Devuelve el content stream de cada página, en orden."""
    flujos = []
    for coincidencia in re.finditer(rb"/Type /Page ", datos):
        fin_objeto = datos.find(b"endobj", coincidencia.start())
        objeto = datos[max(0, coincidencia.start() - 200):fin_objeto]
        numero = re.search(rb"/Contents (\d+) 0 R", objeto)
        if not numero:
            continue
        patron = rb"\n" + numero.group(1) + rb" 0 obj\r?\n<< /Length \d+ >>\r?\nstream\r?\n(.*?)\r?\nendstream"
        encontrado = re.search(patron, datos, re.S)
        if encontrado:
            flujos.append(encontrado.group(1))
    return flujos


def reconstruir(flujo: bytes) -> list[tuple[float, float, float, str, str]]:
    """Devuelve (y, x, ancho, texto, estilo) de cada tramo dibujado."""
    texto = flujo.decode("cp1252", errors="replace")
    patron = re.compile(r"BT (/\w+) ([\d.]+) Tf ([\d.]+) ([\d.]+) Td \(((?:[^()\\]|\\.)*)\) Tj ET")
    tramos = []
    for fuente, tamano, x, y, contenido in patron.findall(texto):
        limpio = contenido.replace(r"\(", "(").replace(r"\)", ")").replace(r"\\", "\\")
        estilo = ESTILOS.get(fuente, "normal")
        tramos.append((float(y), float(x), MEDIDOR.ancho(limpio, estilo, float(tamano)), limpio, float(tamano)))
    tramos.sort(key=lambda fila: (-fila[0], fila[1]))
    return tramos


def agrupar_en_lineas(tramos):
    """Junta los tramos que están a la misma altura (misma línea visual)."""
    lineas: list[list[tuple[float, float, float, str, float]]] = []
    for tramo in tramos:
        if lineas and abs(lineas[-1][0][0] - tramo[0]) < 0.6:
            lineas[-1].append(tramo)
        else:
            lineas.append([tramo])
    return lineas


def main() -> int:
    ruta = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/resumen-calculadora.pdf")
    datos = ruta.read_bytes()
    print(f"--- {ruta} ({len(datos)} bytes) ---")

    problemas = validar_estructura(datos)
    if problemas:
        print("PROBLEMAS DE ESTRUCTURA:")
        for problema in problemas:
            print("  -", problema)
    else:
        print("estructura: cabecera, xref y offsets OK")

    flujos = paginas(datos)
    print(f"páginas: {len(flujos)}")

    total_lineas = 0
    for numero, flujo in enumerate(flujos, start=1):
        tramos = reconstruir(flujo)
        lineas = agrupar_en_lineas(tramos)
        total_lineas += len(lineas)
        print(f"\n===== PÁGINA {numero}: {len(lineas)} líneas =====")

        borde_derecho = 0.0
        for linea in lineas:
            fin = max(x + ancho for _, x, ancho, _, _ in linea)
            borde_derecho = max(borde_derecho, fin)
            if fin > ANCHO - MARGEN_X + 1:
                contenido = " ".join(t for _, _, _, t, _ in linea)
                print(f"  OJO: línea pasada de ancho ({fin:.1f} > {ANCHO - MARGEN_X:.1f}): {contenido[:70]}")
        ys = [linea[0][0] for linea in lineas]
        print(f"  borde derecho máximo: {borde_derecho:.1f} (margen {ANCHO - MARGEN_X:.1f})")
        if ys:
            print(f"  y entre {min(ys):.1f} y {max(ys):.1f} (margen superior {ALTO - MARGEN_SUP:.1f})")
            if min(ys) < 20:
                print("  OJO: hay texto muy abajo en la hoja")

        if "--texto" in sys.argv:
            for linea in lineas:
                contenido = "".join(t for _, _, _, t, _ in linea)
                print(f"  {linea[0][0]:7.1f} | {contenido}")
        else:
            for linea in lineas[:5]:
                print("   ", "".join(t for _, _, _, t, _ in linea)[:100])
            print("    ...")

    print(f"\ntotal de líneas dibujadas: {total_lineas}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
