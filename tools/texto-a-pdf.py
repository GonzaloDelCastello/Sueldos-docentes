"""Convierte un texto con marcas simples en un PDF prolijo, sin dependencias.

Por qué existe: el proyecto no tiene ninguna librería de PDF ni conversores, y
a veces hace falta un documento para compartir (un resumen, una lista de datos
por verificar). En vez de sumar una dependencia, acá se arma el PDF a mano con
la biblioteca estándar.

El texto de entrada usa cuatro marcas:

    # Título grande
    ## Sección (con línea de color)
    ### Subsección
    - un ítem de lista (admite **negrita**)
    > una nota destacada, en un recuadro
    | columna | otra columna |      (la primera fila es el encabezado)
    ---                                  (línea horizontal)
    (el resto son párrafos; las líneas vacías separan bloques)

Para medir el ancho del texto se usan las métricas de Arial (que son las mismas
que las de Helvetica), leídas con Pillow. Las fuentes del PDF son las tres
básicas (Helvetica, negrita y cursiva) con codificación WinAnsi, así que los
acentos y la eñe salen bien sin embeber ninguna fuente.

Uso:
    python tools/texto-a-pdf.py docs/resumen.md docs/resumen.pdf

Es una herramienta de trabajo: no la usa el sitio.
"""

import re
import sys
from pathlib import Path

from PIL import ImageFont

# ---------------------------------------------------------------------------
# Página y estilo
# ---------------------------------------------------------------------------

ANCHO, ALTO = 595.28, 841.89  # A4 en puntos
MARGEN_X, MARGEN_SUP, MARGEN_INF = 52.0, 58.0, 58.0
ANCHO_UTIL = ANCHO - 2 * MARGEN_X

COLOR_PRIMARIO = (0.639, 0.231, 0.196)  # el rojo óxido del sitio (#a33b32)
COLOR_TEXTO = (0.13, 0.15, 0.17)
COLOR_SUAVE = (0.42, 0.45, 0.48)
COLOR_LINEA = (0.85, 0.86, 0.87)
COLOR_FONDO_NOTA = (0.97, 0.95, 0.93)

FUENTES_TTF = {
    "normal": r"C:\Windows\Fonts\arial.ttf",
    "bold": r"C:\Windows\Fonts\arialbd.ttf",
    "italic": r"C:\Windows\Fonts\ariali.ttf",
}

# Tamaños de cada tipo de texto
TAM_TITULO, TAM_SECCION, TAM_SUB, TAM_TEXTO, TAM_PIE = 19.0, 13.5, 11.0, 9.8, 7.8
INTERLINEA = 1.3

# Un par de reemplazos para los caracteres que WinAnsi no entiende.
REEMPLAZOS = {
    "✓": "OK",
    "✗": "no",
    "→": "->",
    "≈": "~",
    "—": "-",
    "–": "-",
    "“": '"',
    "”": '"',
    "‘": "'",
    "’": "'",
    "•": "-",
}


class Medidor:
    """Mide el ancho de un texto con las métricas de Arial."""

    def __init__(self) -> None:
        self.fuentes = {}
        self.aproximado = False
        for clave, ruta in FUENTES_TTF.items():
            try:
                self.fuentes[clave] = ImageFont.truetype(ruta, 1000)
            except OSError:
                self.fuentes[clave] = None
                self.aproximado = True

    def ancho(self, texto: str, estilo: str, tamano: float) -> float:
        fuente = self.fuentes.get(estilo)
        if fuente is None:
            # Sin la fuente: se estima a 0,5 em por carácter.
            return len(texto) * tamano * 0.5
        return fuente.getlength(texto) * tamano / 1000.0


# ---------------------------------------------------------------------------
# Marcas del texto
# ---------------------------------------------------------------------------

def limpiar(texto: str) -> str:
    for original, reemplazo in REEMPLAZOS.items():
        texto = texto.replace(original, reemplazo)
    return texto


def partir_en_runs(texto: str) -> list[tuple[str, str]]:
    """Separa '**negrita**' del resto: devuelve [(texto, estilo), ...]."""
    runs: list[tuple[str, str]] = []
    partes = texto.split("**")
    for indice, parte in enumerate(partes):
        if parte == "":
            continue
        runs.append((parte, "bold" if indice % 2 == 1 else "normal"))
    return runs or [("", "normal")]


def envolver(runs: list[tuple[str, str]], medidor: Medidor, tamano: float, ancho: float) -> list[list[tuple[str, str]]]:
    """Corta los runs en líneas que entren en el ancho dado, sin partir palabras.

    Los espacios se copian del texto original (no se agregan de nuevo): el que
    separa dos palabras se pega a la palabra que sigue, así no aparecen espacios
    de más al pasar de un tramo en negrita a uno normal. Los espacios del final
    de una línea se descartan.
    """
    # Cada run se abre en palabras y espacios, para no perder la separación real.
    piezas: list[tuple[str, str]] = []
    for texto, estilo in runs:
        for pieza in re.findall(r"\S+|\s+", texto):
            piezas.append((pieza, estilo))

    lineas: list[list[tuple[str, str]]] = []
    actual: list[tuple[str, str]] = []
    ancho_actual = 0.0
    pendiente = ""  # espacios que esperan a la palabra que viene

    for pieza, estilo in piezas:
        if pieza.strip() == "":
            # Un espacio solo cuenta si la línea ya tiene contenido.
            if actual:
                pendiente += pieza
            continue

        texto_pieza = pendiente + pieza
        pendiente = ""
        ancho_pieza = medidor.ancho(texto_pieza, estilo, tamano)

        if ancho_actual + ancho_pieza > ancho and actual:
            lineas.append(actual)
            actual = []
            ancho_actual = 0.0
            # Al empezar una línea nueva no va el espacio de adelante.
            texto_pieza = pieza
            ancho_pieza = medidor.ancho(texto_pieza, estilo, tamano)

        if actual and actual[-1][1] == estilo:
            actual[-1] = (actual[-1][0] + texto_pieza, estilo)
        else:
            actual.append((texto_pieza, estilo))
        ancho_actual += ancho_pieza

    if actual:
        lineas.append(actual)
    return [linea for linea in lineas if "".join(t for t, _ in linea).strip() != ""]


# ---------------------------------------------------------------------------
# Bloques
# ---------------------------------------------------------------------------

def leer_bloques(texto: str) -> list[dict]:
    bloques: list[dict] = []
    lineas = texto.splitlines()
    indice = 0

    while indice < len(lineas):
        linea = limpiar(lineas[indice].rstrip())

        if linea.strip() == "":
            indice += 1
            continue

        if linea.startswith("### "):
            bloques.append({"tipo": "sub", "texto": linea[4:].strip()})
        elif linea.startswith("## "):
            bloques.append({"tipo": "seccion", "texto": linea[3:].strip()})
        elif linea.startswith("# "):
            bloques.append({"tipo": "titulo", "texto": linea[2:].strip()})
        elif linea.startswith("- "):
            items = []
            while indice < len(lineas) and lineas[indice].strip().startswith("- "):
                items.append(limpiar(lineas[indice].strip()[2:]))
                indice += 1
            bloques.append({"tipo": "lista", "items": items})
            continue
        elif linea.startswith("> "):
            notas = []
            while indice < len(lineas) and lineas[indice].strip().startswith("> "):
                notas.append(limpiar(lineas[indice].strip()[2:]))
                indice += 1
            bloques.append({"tipo": "nota", "texto": " ".join(notas)})
            continue
        elif linea.strip() == "---":
            bloques.append({"tipo": "linea"})
        elif linea.lstrip().startswith("|"):
            filas = []
            while indice < len(lineas) and lineas[indice].lstrip().startswith("|"):
                celdas = [limpiar(c.strip()) for c in lineas[indice].strip().strip("|").split("|")]
                if not all(set(c) <= set("-: ") for c in celdas):
                    filas.append(celdas)
                indice += 1
            bloques.append({"tipo": "tabla", "filas": filas})
            continue
        else:
            parrafo = []
            while indice < len(lineas) and lineas[indice].strip() != "" and not lineas[indice].lstrip().startswith(("#", "- ", "> ", "|", "---")):
                parrafo.append(limpiar(lineas[indice].strip()))
                indice += 1
            bloques.append({"tipo": "parrafo", "texto": " ".join(parrafo)})
            continue

        indice += 1

    return bloques


# ---------------------------------------------------------------------------
# Dibujo
# ---------------------------------------------------------------------------

class Pdf:
    def __init__(self, medidor: Medidor) -> None:
        self.medidor = medidor
        self.paginas: list[list[str]] = []
        self.actual: list[str] = []
        self.y = ALTO - MARGEN_SUP

    # --- primitivas ---
    def texto(self, x: float, y: float, runs: list[tuple[str, str]], tamano: float, color=COLOR_TEXTO) -> None:
        """Dibuja una línea. Cada tramo avanza el cursor, porque en una misma
        línea puede haber texto normal y texto en negrita."""
        partes = [f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} rg"]
        cursor = x
        for contenido, estilo in runs:
            if contenido == "":
                continue
            fuente = {"normal": "/F1", "bold": "/F2", "italic": "/F3"}[estilo]
            escapado = contenido.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")
            partes.append(f"BT {fuente} {tamano:.2f} Tf {cursor:.2f} {y:.2f} Td ({escapado}) Tj ET")
            cursor += self.medidor.ancho(contenido, estilo, tamano)
        self.actual.append("\n".join(partes))

    def rectangulo(self, x: float, y: float, ancho: float, alto: float, color) -> None:
        self.actual.append(
            f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} rg {x:.2f} {y:.2f} {ancho:.2f} {alto:.2f} re f"
        )

    def linea_horizontal(self, x: float, y: float, ancho: float, color=COLOR_LINEA, grosor: float = 0.6) -> None:
        self.actual.append(
            f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} RG {grosor} w {x:.2f} {y:.2f} m {x + ancho:.2f} {y:.2f} l S"
        )

    def circulo(self, x: float, y: float, radio: float, color=COLOR_PRIMARIO) -> None:
        k = radio * 0.5523
        self.actual.append(
            f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} rg "
            f"{x:.2f} {y:.2f} m "
            f"{x + k:.2f} {y + radio:.2f} {x + radio:.2f} {y + k:.2f} {x + radio:.2f} {y:.2f} c "
            f"{x + radio:.2f} {y - k:.2f} {x + k:.2f} {y - radio:.2f} {x:.2f} {y - radio:.2f} c "
            f"{x - k:.2f} {y - radio:.2f} {x - radio:.2f} {y - k:.2f} {x - radio:.2f} {y:.2f} c "
            f"{x - radio:.2f} {y + k:.2f} {x - k:.2f} {y + radio:.2f} {x:.2f} {y + radio:.2f} c f"
        )

    # --- páginas ---
    def nueva_pagina(self) -> None:
        self.paginas.append(self.actual)
        self.actual = []
        self.y = ALTO - MARGEN_SUP

    def asegurar(self, alto: float) -> None:
        if self.y - alto < MARGEN_INF:
            self.nueva_pagina()

    def espacio(self, alto: float) -> None:
        self.y -= alto

    # --- bloques ---
    def dibujar(self, bloques: list[dict]) -> None:
        for bloque in bloques:
            tipo = bloque["tipo"]

            if tipo == "titulo":
                self.asegurar(40)
                lineas = envolver(partir_en_runs(bloque["texto"]), self.medidor, TAM_TITULO, ANCHO_UTIL)
                for linea in lineas:
                    self.texto(MARGEN_X, self.y - TAM_TITULO, linea, TAM_TITULO, COLOR_PRIMARIO)
                    self.y -= TAM_TITULO * INTERLINEA
                self.espacio(6)

            elif tipo == "seccion":
                self.asegurar(46)
                self.espacio(10)
                lineas = envolver(partir_en_runs(bloque["texto"]), self.medidor, TAM_SECCION, ANCHO_UTIL)
                for linea in lineas:
                    self.texto(MARGEN_X, self.y - TAM_SECCION, linea, TAM_SECCION, COLOR_PRIMARIO)
                    self.y -= TAM_SECCION * INTERLINEA
                self.espacio(4)
                self.linea_horizontal(MARGEN_X, self.y, ANCHO_UTIL, COLOR_PRIMARIO, 1.1)
                self.espacio(9)

            elif tipo == "sub":
                self.asegurar(30)
                self.espacio(4)
                lineas = envolver(partir_en_runs(bloque["texto"]), self.medidor, TAM_SUB, ANCHO_UTIL)
                for linea in lineas:
                    self.texto(MARGEN_X, self.y - TAM_SUB, linea, TAM_SUB, COLOR_TEXTO)
                    self.y -= TAM_SUB * INTERLINEA
                self.espacio(5)

            elif tipo == "parrafo":
                runs = partir_en_runs(bloque["texto"])
                lineas = envolver(runs, self.medidor, TAM_TEXTO, ANCHO_UTIL)
                for linea in lineas:
                    self.asegurar(TAM_TEXTO * INTERLINEA)
                    self.texto(MARGEN_X, self.y - TAM_TEXTO, linea, TAM_TEXTO)
                    self.y -= TAM_TEXTO * INTERLINEA
                self.espacio(5.5)

            elif tipo == "lista":
                for item in bloque["items"]:
                    runs = partir_en_runs(item)
                    lineas = envolver(runs, self.medidor, TAM_TEXTO, ANCHO_UTIL - 14)
                    for numero, linea in enumerate(lineas):
                        self.asegurar(TAM_TEXTO * INTERLINEA)
                        if numero == 0:
                            self.circulo(MARGEN_X + 3.2, self.y - TAM_TEXTO * 0.62, 1.9)
                        self.texto(MARGEN_X + 14, self.y - TAM_TEXTO, linea, TAM_TEXTO)
                        self.y -= TAM_TEXTO * INTERLINEA
                    self.espacio(2)
                self.espacio(5)

            elif tipo == "nota":
                runs = partir_en_runs(bloque["texto"])
                lineas = envolver(runs, self.medidor, TAM_TEXTO, ANCHO_UTIL - 26)
                alto = len(lineas) * TAM_TEXTO * INTERLINEA + 14
                self.asegurar(alto + 6)
                base = self.y - alto
                self.rectangulo(MARGEN_X, base, ANCHO_UTIL, alto, COLOR_FONDO_NOTA)
                self.rectangulo(MARGEN_X, base, 3, alto, COLOR_PRIMARIO)
                cursor = self.y - 7
                for linea in lineas:
                    self.texto(MARGEN_X + 13, cursor - TAM_TEXTO, linea, TAM_TEXTO)
                    cursor -= TAM_TEXTO * INTERLINEA
                self.y = base - 9

            elif tipo == "tabla":
                self.dibujar_tabla(bloque["filas"])

            elif tipo == "linea":
                self.asegurar(14)
                self.espacio(6)
                self.linea_horizontal(MARGEN_X, self.y, ANCHO_UTIL)
                self.espacio(10)

    def dibujar_tabla(self, filas: list[list[str]]) -> None:
        if not filas:
            return
        columnas = max(len(fila) for fila in filas)
        # La primera columna más ancha si hay tres, repartiendo el resto.
        if columnas == 2:
            anchos = [ANCHO_UTIL * 0.38, ANCHO_UTIL * 0.62]
        elif columnas == 3:
            anchos = [ANCHO_UTIL * 0.32, ANCHO_UTIL * 0.30, ANCHO_UTIL * 0.38]
        else:
            anchos = [ANCHO_UTIL / columnas] * columnas

        for numero_fila, fila in enumerate(filas):
            es_encabezado = numero_fila == 0
            tamano = TAM_TEXTO
            celdas = []
            for indice in range(columnas):
                contenido = fila[indice] if indice < len(fila) else ""
                estilo = "bold" if es_encabezado else "normal"
                celdas.append(envolver([(contenido, estilo)], self.medidor, tamano, anchos[indice] - 10))

            alto = max(len(celda) for celda in celdas) * tamano * INTERLINEA + 8
            self.asegurar(alto)

            if es_encabezado:
                self.rectangulo(MARGEN_X, self.y - alto, ANCHO_UTIL, alto, (0.94, 0.93, 0.91))

            cursor_x = MARGEN_X
            for indice, celda in enumerate(celdas):
                cursor_y = self.y - 6
                for linea in celda:
                    self.texto(cursor_x + 5, cursor_y - tamano, linea, tamano)
                    cursor_y -= tamano * INTERLINEA
                cursor_x += anchos[indice]

            self.y -= alto
            self.linea_horizontal(MARGEN_X, self.y, ANCHO_UTIL)

        self.espacio(9)

    def cerrar(self, pie: str) -> None:
        self.paginas.append(self.actual)

        # Segunda pasada: el pie necesita saber cuántas páginas hay.
        total = len(self.paginas)
        for numero, contenido in enumerate(self.paginas, start=1):
            contenido.append(
                f"{COLOR_SUAVE[0]:.3f} {COLOR_SUAVE[1]:.3f} {COLOR_SUAVE[2]:.3f} rg "
                f"BT /F1 {TAM_PIE:.2f} Tf {MARGEN_X:.2f} {MARGEN_INF - 24:.2f} Td ({pie}) Tj ET"
            )
            etiqueta = f"Página {numero} de {total}"
            ancho = self.medidor.ancho(etiqueta, "normal", TAM_PIE)
            contenido.append(
                f"{COLOR_SUAVE[0]:.3f} {COLOR_SUAVE[1]:.3f} {COLOR_SUAVE[2]:.3f} rg "
                f"BT /F1 {TAM_PIE:.2f} Tf {ANCHO - MARGEN_X - ancho:.2f} {MARGEN_INF - 24:.2f} Td ({etiqueta}) Tj ET"
            )
        self.total_paginas = total


def escribir_pdf(paginas: list[list[str]], destino: Path, titulo: str) -> None:
    objetos: list[bytes] = []

    def agregar(cuerpo: bytes) -> int:
        objetos.append(cuerpo)
        return len(objetos)

    # 1: catálogo, 2: páginas, 3-5: fuentes. Se reservan los números primero.
    objetos.append(b"")  # 1 catálogo (se completa al final)
    objetos.append(b"")  # 2 páginas
    objetos.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    objetos.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    objetos.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>")

    numeros_pagina = []
    for contenido in paginas:
        flujo = "\n".join(contenido).encode("cp1252", errors="replace")
        numero_flujo = agregar(b"<< /Length " + str(len(flujo)).encode() + b" >>\nstream\n" + flujo + b"\nendstream")
        cuerpo_pagina = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {ANCHO:.2f} {ALTO:.2f}] "
            f"/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> "
            f"/Contents {numero_flujo} 0 R >>"
        ).encode()
        numeros_pagina.append(agregar(cuerpo_pagina))

    info = agregar(f"<< /Title ({titulo}) /Producer (Calculadora de sueldos docentes de San Luis) >>".encode())
    hijos = " ".join(f"{numero} 0 R" for numero in numeros_pagina)
    objetos[0] = b"<< /Type /Catalog /Pages 2 0 R >>"
    objetos[1] = f"<< /Type /Pages /Kids [{hijos}] /Count {len(paginas)} >>".encode()

    salida = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for numero, cuerpo in enumerate(objetos, start=1):
        offsets.append(len(salida))
        salida += f"{numero} 0 obj\n".encode() + cuerpo + b"\nendobj\n"

    inicio_xref = len(salida)
    total_objetos = len(objetos) + 1
    salida += f"xref\n0 {total_objetos}\n".encode()
    salida += b"0000000000 65535 f \n"
    for offset in offsets[1:]:
        salida += f"{offset:010d} 00000 n \n".encode()
    salida += (
        f"trailer\n<< /Size {total_objetos} /Root 1 0 R /Info {info} 0 R >>\n"
        f"startxref\n{inicio_xref}\n%%EOF\n"
    ).encode()

    destino.write_bytes(bytes(salida))


def main() -> int:
    if len(sys.argv) < 3:
        print("uso: python tools/texto-a-pdf.py entrada.md salida.pdf")
        return 1

    origen, destino = Path(sys.argv[1]), Path(sys.argv[2])
    bloques = leer_bloques(origen.read_text(encoding="utf-8"))
    medidor = Medidor()
    if medidor.aproximado:
        print("AVISO: no encontré alguna fuente de Windows, el ancho del texto es aproximado")

    pdf = Pdf(medidor)
    pdf.dibujar(bloques)
    titulo = bloques[0]["texto"] if bloques and bloques[0]["tipo"] == "titulo" else destino.stem
    pdf.cerrar("Calculadora de sueldos docentes de San Luis")
    escribir_pdf(pdf.paginas, destino, titulo)

    print(f"{origen} -> {destino} ({pdf.total_paginas} páginas, {destino.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
