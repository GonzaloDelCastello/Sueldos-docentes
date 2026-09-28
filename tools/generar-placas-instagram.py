"""
Genera las placas de Instagram para difundir el sitio de ATEBA - Lista Roja.

Por qué existe este archivo: las placas son 20 imágenes de 1080x1350 que
comparten la misma identidad visual (pizarra, rojo óxido, la tipografía del
sitio). Hacerlas a mano en Canva significa rehacer todo cada vez que cambia un
texto. Acá el contenido está escrito una sola vez, arriba de todo, y el diseño
se aplica solo.

Uso:
    python tools/preparar-assets-placas.py        # una sola vez (baja fuentes y qrcode)
    python tools/generar-placas-instagram.py

Salida:
    marketing/instagram/carrusel-0N-nombre/placa-0M.png
    marketing/instagram/carrusel-0N-nombre/_vista-previa.png
    marketing/instagram/_vista-general.png

Requiere Pillow (y numpy, que ya viene con Pillow en este entorno).
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "tools" / "placas" / "fuentes"
DEPS = RAIZ / "tools" / "placas" / "deps"
SALIDA = RAIZ / "marketing" / "instagram"

sys.path.insert(0, str(DEPS))
import qrcode  # noqa: E402  (vive en tools/placas/deps)

# --------------------------------------------------------------------------
# Identidad visual (los colores salen de css/variables.css)
# --------------------------------------------------------------------------

ANCHO, ALTO = 1080, 1350
MARGEN = 88
ANCHO_UTIL = ANCHO - 2 * MARGEN

CREMA = (249, 247, 242)        # --primarioClaro
ROJO = (163, 59, 50)           # --primario
ROJO_VIVO = (211, 86, 70)      # el rojo, aclarado para que se lea sobre pizarra
ROJO_OSCURO = (126, 42, 35)
GRAFITO = (52, 58, 64)         # --secundarioOscuro
GRIS = (108, 113, 118)
TIZA = (240, 238, 231)
TIZA_APAGADA = (176, 179, 178)
NEGRO = (33, 37, 41)
ARENA = (217, 197, 178)        # --secundario

SITIO = "trabajadoresedu-sanluis.ar"
URL_COMPLETA = "https://www.trabajadoresedu-sanluis.ar/"
FIRMA = "ATEBA · LISTA ROJA N°4"

_cache_fuentes: dict = {}
_cache_fondos: dict = {}


# --------------------------------------------------------------------------
# Tipografías
# --------------------------------------------------------------------------

def fredericka(tam: int) -> ImageFont.FreeTypeFont:
    """La tipografía del título del sitio: pizarra, dibujada a mano."""
    if ("fr", tam) not in _cache_fuentes:
        _cache_fuentes[("fr", tam)] = ImageFont.truetype(
            str(FUENTES / "FrederickaTheGreat-Regular.ttf"), tam
        )
    return _cache_fuentes[("fr", tam)]


def montserrat(tam: int, peso: int = 600, cursiva: bool = False) -> ImageFont.FreeTypeFont:
    """Montserrat variable: `peso` va de 100 (Thin) a 900 (Black)."""
    clave = ("ms", tam, peso, cursiva)
    if clave not in _cache_fuentes:
        archivo = "Montserrat-Italic[wght].ttf" if cursiva else "Montserrat[wght].ttf"
        f = ImageFont.truetype(str(FUENTES / archivo), tam)
        f.set_variation_by_axes([peso])
        _cache_fuentes[clave] = f
    return _cache_fuentes[clave]


def bebas(tam: int) -> ImageFont.FreeTypeFont:
    if ("bb", tam) not in _cache_fuentes:
        _cache_fuentes[("bb", tam)] = ImageFont.truetype(
            str(FUENTES / "BebasNeue-Regular.ttf"), tam
        )
    return _cache_fuentes[("bb", tam)]


# --------------------------------------------------------------------------
# Fondos
# --------------------------------------------------------------------------

def _cubrir(im: Image.Image, ancho: int, alto: int) -> Image.Image:
    """Escala recortando, como `background-size: cover` de CSS."""
    escala = max(ancho / im.width, alto / im.height)
    im = im.resize((max(ancho, round(im.width * escala)), max(alto, round(im.height * escala))), Image.LANCZOS)
    x = (im.width - ancho) // 2
    y = (im.height - alto) // 2
    return im.crop((x, y, x + ancho, y + alto))


def _vineta(forma: tuple[int, int], fuerza: float = 0.45, potencia: float = 1.7) -> np.ndarray:
    """Máscara radial que oscurece las esquinas. Devuelve valores 0..1."""
    alto, ancho = forma
    yy, xx = np.mgrid[0:alto, 0:ancho]
    cx, cy = ancho / 2, alto / 2
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2) / np.sqrt(2)
    return np.clip(1 - fuerza * r ** potencia, 0, 1)[..., None]


def fondo_pizarra() -> Image.Image:
    """Pizarra oscura: la foto real del sitio, apagada y con viñeta."""
    if "pizarra" not in _cache_fondos:
        base = _cubrir(Image.open(RAIZ / "img" / "pizarra-negra.webp").convert("RGB"), ANCHO, ALTO)
        a = np.asarray(base).astype(np.float32) * 0.60
        rng = np.random.default_rng(7)
        a += rng.normal(0, 2.4, a.shape)
        a *= _vineta((ALTO, ANCHO), fuerza=0.5)
        _cache_fondos["pizarra"] = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return _cache_fondos["pizarra"].copy()


def fondo_crema() -> Image.Image:
    """Papel: crema con la textura de la pizarra apenas insinuada."""
    if "crema" not in _cache_fondos:
        textura = _cubrir(Image.open(RAIZ / "img" / "pizarra-negra.webp").convert("L"), ANCHO, ALTO)
        textura = ImageOps.colorize(textura, black=(228, 223, 213), white=(255, 255, 255))
        base = Image.blend(Image.new("RGB", (ANCHO, ALTO), CREMA), textura, 0.16)
        a = np.asarray(base).astype(np.float32)
        a *= _vineta((ALTO, ANCHO), fuerza=0.12)
        _cache_fondos["crema"] = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return _cache_fondos["crema"].copy()


def fondo_rojo() -> Image.Image:
    """Rojo de marca con textura, para las placas de cierre."""
    if "rojo" not in _cache_fondos:
        textura = _cubrir(Image.open(RAIZ / "img" / "pizarra-negra.webp").convert("L"), ANCHO, ALTO)
        textura = ImageOps.colorize(textura, black=ROJO_OSCURO, white=(206, 96, 82))
        base = Image.blend(Image.new("RGB", (ANCHO, ALTO), ROJO), textura, 0.34)
        a = np.asarray(base).astype(np.float32)
        a *= _vineta((ALTO, ANCHO), fuerza=0.4)
        _cache_fondos["rojo"] = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return _cache_fondos["rojo"].copy()


def _recortar_tiza(im: Image.Image) -> np.ndarray:
    """Devuelve el logo como capa RGBA lista para recolorear."""
    return np.asarray(im.convert("RGBA")).astype(np.float32)


def logo(modo: str = "tiza", alto: int = 300) -> Image.Image:
    """
    El logo original es tinta negra sobre fondo transparente: no se ve sobre la
    pizarra. Acá se recolorea según el fondo:

        tiza    -> tinta color tiza y cintas rojas (para pizarra)
        crema   -> todo color crema (para el fondo rojo, donde el rojo se pierde)
        original-> se usa tal cual (para fondos claros)
    """
    original = Image.open(RAIZ / "img" / "logo.webp")
    if modo == "original":
        im = original.convert("RGBA")
    else:
        a = _recortar_tiza(original)
        r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        tinta = np.clip((150 - lum) / 45, 0, 1)
        rojo = np.clip((r - g) / 45, 0, 1) * np.clip((r - b) / 45, 0, 1)
        tinta = tinta * (1 - rojo)
        if modo == "tiza":
            color_tinta = np.array(TIZA, np.float32)
            color_rojo = np.array(ROJO_VIVO, np.float32)
        else:
            color_tinta = np.array(CREMA, np.float32)
            color_rojo = np.array(CREMA, np.float32)
        capa = tinta[..., None] * color_tinta + rojo[..., None] * color_rojo
        cobertura = np.clip(tinta + rojo, 0, 1)
        salida = np.dstack([capa, al * cobertura])
        im = Image.fromarray(np.clip(salida, 0, 255).astype(np.uint8), "RGBA")

    return im.resize((round(im.width * alto / im.height), alto), Image.LANCZOS)


def pegar(im: Image.Image, capa: Image.Image, caja: tuple, ancla: str = "la") -> None:
    """Pega `capa` sobre `im`. `ancla` usa las convenciones de Pillow (la, ma, ra...)."""
    x, y = caja
    if ancla[0] == "m":
        x -= capa.width // 2
    elif ancla[0] == "r":
        x -= capa.width
    if ancla[1] == "m":
        y -= capa.height // 2
    elif ancla[1] == "b":
        y -= capa.height
    im.paste(capa, (round(x), round(y)), capa)


# --------------------------------------------------------------------------
# Texto
# --------------------------------------------------------------------------

def ajustar_titulo(lineas: list[str], tam: int, ancho_max: float, interlinea: float = 1.13) -> tuple[int, int]:
    """
    Achica el título hasta que la línea más larga entre en `ancho_max`.

    Fredericka the Great es ancha y cambia mucho de tamaño según la frase: sin
    esto, un título largo se sale del margen o pisa el logo.
    """
    while tam > 46 and max(fredericka(tam).getlength(linea) for linea in lineas) > ancho_max:
        tam -= 4
    return tam, round(tam * interlinea)


def envolver(texto: str, fuente: ImageFont.FreeTypeFont, ancho: int) -> list[str]:
    """Corta el texto en líneas que entren en `ancho` (sin cortar palabras)."""
    lineas: list[str] = []
    for parrafo in texto.split("\n"):
        actual = ""
        for palabra in parrafo.split():
            prueba = f"{actual} {palabra}".strip()
            if actual and fuente.getlength(prueba) > ancho:
                lineas.append(actual)
                actual = palabra
            else:
                actual = prueba
        lineas.append(actual)
    return lineas


def parrafo(
    d: ImageDraw.ImageDraw,
    texto: str,
    fuente: ImageFont.FreeTypeFont,
    relleno,
    xy: tuple,
    ancho: int,
    interlinea: float = 1.32,
    alineacion: str = "l",
) -> int:
    """Dibuja un párrafo y devuelve la coordenada Y donde termina."""
    x, y = xy
    paso = round(fuente.size * interlinea)
    anclas = {"l": "la", "c": "ma", "r": "ra"}
    for linea in envolver(texto, fuente, ancho):
        d.text((x, y), linea, font=fuente, fill=relleno, anchor=anclas[alineacion])
        y += paso
    return y


def texto_espaciado(
    d: ImageDraw.ImageDraw,
    xy: tuple,
    texto: str,
    fuente: ImageFont.FreeTypeFont,
    relleno,
    tracking: float = 0,
    alineacion: str = "l",
) -> float:
    """Dibuja texto con espaciado extra entre letras (lo que en CSS es letter-spacing)."""
    ancho_total = sum(fuente.getlength(c) for c in texto) + tracking * max(0, len(texto) - 1)
    x, y = xy
    if alineacion == "c":
        x -= ancho_total / 2
    elif alineacion == "r":
        x -= ancho_total
    for c in texto:
        d.text((x, y), c, font=fuente, fill=relleno, anchor="la")
        x += fuente.getlength(c) + tracking
    return ancho_total


# --------------------------------------------------------------------------
# Recursos de dibujo: íconos, subrayados, cintas
# --------------------------------------------------------------------------

def icono(d: ImageDraw.ImageDraw, tipo: str, cx: float, cy: float, color, tam: float = 44) -> None:
    """Íconos de línea, dibujados a mano. Reemplazan a los emojis (Pillow no los dibuja)."""
    g = tam / 2
    w = max(3, round(tam * 0.09))

    if tipo == "calculadora":
        d.rounded_rectangle([cx - g * 0.75, cy - g, cx + g * 0.75, cy + g], radius=g * 0.22, outline=color, width=w)
        d.rectangle([cx - g * 0.45, cy - g * 0.72, cx + g * 0.45, cy - g * 0.2], outline=color, width=w)
        for fila in range(2):
            for col in range(3):
                px = cx - g * 0.45 + col * g * 0.45
                py = cy + g * 0.12 + fila * g * 0.45
                d.ellipse([px - w, py - w, px + w, py + w], fill=color)

    elif tipo == "grafico":
        base = cy + g
        for i, alto in enumerate((0.45, 0.75, 1.0)):
            x = cx - g + i * g * 0.72
            d.rounded_rectangle([x, base - g * 1.7 * alto, x + g * 0.44, base], radius=w, fill=color)

    elif tipo == "documento":
        d.rounded_rectangle([cx - g * 0.78, cy - g, cx + g * 0.78, cy + g], radius=g * 0.18, outline=color, width=w)
        for i in range(3):
            y = cy - g * 0.32 + i * g * 0.38
            d.line([cx - g * 0.45, y, cx + g * 0.45, y], fill=color, width=w)

    elif tipo == "globo":
        d.ellipse([cx - g, cy - g, cx + g, cy + g], outline=color, width=w)
        d.ellipse([cx - g * 0.45, cy - g, cx + g * 0.45, cy + g], outline=color, width=w)
        d.line([cx - g, cy, cx + g, cy], fill=color, width=w)

    elif tipo == "sobre":
        d.rounded_rectangle([cx - g, cy - g * 0.72, cx + g, cy + g * 0.72], radius=g * 0.18, outline=color, width=w)
        d.line([cx - g * 0.92, cy - g * 0.6, cx, cy + g * 0.12, cx + g * 0.92, cy - g * 0.6], fill=color, width=w, joint="curve")

    elif tipo == "reloj":
        d.ellipse([cx - g, cy - g, cx + g, cy + g], outline=color, width=w)
        d.line([cx, cy, cx, cy - g * 0.55], fill=color, width=w)
        d.line([cx, cy, cx + g * 0.45, cy + g * 0.3], fill=color, width=w)

    elif tipo == "calendario":
        d.rounded_rectangle([cx - g, cy - g * 0.82, cx + g, cy + g], radius=g * 0.18, outline=color, width=w)
        d.line([cx - g, cy - g * 0.3, cx + g, cy - g * 0.3], fill=color, width=w)
        for i in range(3):
            d.ellipse([cx - g * 0.6 + i * g * 0.6 - w, cy + g * 0.2 - w, cx - g * 0.6 + i * g * 0.6 + w, cy + g * 0.2 + w], fill=color)

    elif tipo == "check":
        d.line([cx - g * 0.8, cy + g * 0.05, cx - g * 0.2, cy + g * 0.65], fill=color, width=w, joint="curve")
        d.line([cx - g * 0.2, cy + g * 0.65, cx + g * 0.85, cy - g * 0.6], fill=color, width=w, joint="curve")

    elif tipo == "sueldo":
        d.ellipse([cx - g, cy - g, cx + g, cy + g], outline=color, width=w)
        d.line([cx, cy - g * 0.5, cx, cy + g * 0.5], fill=color, width=w)
        d.line([cx - g * 0.36, cy - g * 0.18, cx + g * 0.36, cy - g * 0.18], fill=color, width=w)
        d.line([cx - g * 0.36, cy + g * 0.2, cx + g * 0.36, cy + g * 0.2], fill=color, width=w)

    elif tipo == "balanza":
        d.line([cx, cy - g, cx, cy + g * 0.85], fill=color, width=w)
        d.line([cx - g * 0.85, cy - g * 0.55, cx + g * 0.85, cy - g * 0.55], fill=color, width=w)
        for lado in (-1, 1):
            d.arc([cx + lado * g * 0.85 - g * 0.38, cy - g * 0.55, cx + lado * g * 0.85 + g * 0.38, cy + g * 0.2], 0, 180, fill=color, width=w)
        d.line([cx - g * 0.5, cy + g * 0.85, cx + g * 0.5, cy + g * 0.85], fill=color, width=w)


def subrayado_tiza(d: ImageDraw.ImageDraw, x0: float, x1: float, y: float, color, grosor: int = 9) -> None:
    """Subrayado hecho a mano: dos trazos apenas desfasados, con las puntas redondeadas."""
    d.line([x0, y - 2, x1, y - 5], fill=color, width=grosor, joint="curve")
    d.line([x0 + 6, y + 3, x1 - 10, y + 1], fill=color, width=max(3, grosor - 4), joint="curve")
    for x, yy in ((x0, y - 2), (x1, y - 5), (x0 + 6, y + 3), (x1 - 10, y + 1)):
        r = grosor / 2
        d.ellipse([x - r, yy - r, x + r, yy + r], fill=color)


def bloque_items(
    d: ImageDraw.ImageDraw,
    items: list[dict],
    y_inicio: float,
    y_limite: float,
    numeros: bool = False,
) -> None:
    """
    Dibuja una lista de ítems (ícono o número + título + explicación).

    Lo importante: mide primero y elige el tamaño más grande que entra en el
    espacio disponible. Sin eso, una lista de cuatro ítems se monta encima del
    pie de la placa.
    """
    escalas = [1.0, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68]
    disponible = y_limite - y_inicio
    filas = []
    for escala in escalas:
        radio = round(46 * escala)
        x_texto = MARGEN + 2 * radio + 36
        ancho_texto = ANCHO - MARGEN - x_texto
        sep = round(46 * escala)
        armado, total = [], 0
        for item in items:
            f_titulo = montserrat(round(40 * escala), 800)
            f_texto = montserrat(round(33 * escala), 500)
            lineas = envolver(item["texto"], f_texto, ancho_texto)
            alto_titulo = round(f_titulo.size * 1.22)
            alto_texto = len(lineas) * round(f_texto.size * 1.34)
            armado.append(
                {
                    "item": item,
                    "radio": radio,
                    "x_texto": x_texto,
                    "f_titulo": f_titulo,
                    "f_texto": f_texto,
                    "lineas": lineas,
                    "alto": max(2 * radio, alto_titulo + alto_texto + 8),
                    "alto_titulo": alto_titulo,
                    "interlinea": round(f_texto.size * 1.34),
                }
            )
            total += armado[-1]["alto"]
        total += sep * (len(items) - 1)
        filas = armado
        if total <= disponible or escala == escalas[-1]:
            break

    y = y_inicio + max(0, (disponible - total) // 2)  # centrado vertical en su espacio
    for fila in filas:
        radio = fila["radio"]
        cx, cy = MARGEN + radio, y + radio
        icono_item = fila["item"].get("icono", "check")
        if numeros:
            d.ellipse([cx - radio, cy - radio, cx + radio, cy + radio], fill=ROJO)
            d.text((cx, cy - round(radio * 0.06)), fila["item"]["numero"], font=bebas(round(66 * radio / 46)),
                   fill=CREMA, anchor="mm")
        else:
            d.ellipse([cx - radio, cy - radio, cx + radio, cy + radio], fill=ROJO)
            icono(d, icono_item, cx, cy, CREMA, 2 * radio * 0.5)

        x = fila["x_texto"]
        d.text((x, y + 10), fila["item"]["titulo"], font=fila["f_titulo"], fill=GRAFITO, anchor="la")
        ty = y + 10 + fila["alto_titulo"]
        for linea in fila["lineas"]:
            d.text((x, ty), linea, font=fila["f_texto"], fill=GRIS, anchor="la")
            ty += fila["interlinea"]
        y += fila["alto"] + sep


def qr_imagen(tam: int = 300) -> Image.Image:
    """Código QR del sitio, con corrección de errores alta (se banca una foto de celular)."""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=2)
    qr.add_data(URL_COMPLETA)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGB").resize((tam, tam), Image.NEAREST)


# --------------------------------------------------------------------------
# Piezas comunes de las placas
# --------------------------------------------------------------------------

def encabezado(d: ImageDraw.ImageDraw, kicker: str, indice: int, total: int, claro: bool) -> None:
    color = TIZA_APAGADA if claro else GRIS
    texto_espaciado(d, (MARGEN, 78), kicker.upper(), bebas(38), color, tracking=5)
    texto_espaciado(
        d,
        (ANCHO - MARGEN, 78),
        f"{indice:02d}/{total:02d}",
        bebas(38),
        color,
        tracking=4,
        alineacion="r",
    )
    regla = (80, 86, 92) if claro else (196, 190, 182)
    d.line([MARGEN, 132, ANCHO - MARGEN, 132], fill=regla, width=2)


def pie(d: ImageDraw.ImageDraw, indice: int, total: int, claro: bool) -> None:
    color = TIZA_APAGADA if claro else GRIS
    d.line([MARGEN, 1188, ANCHO - MARGEN, 1188], fill=color, width=2)
    texto_espaciado(d, (MARGEN, 1216), FIRMA, montserrat(24, 600), color, tracking=2)
    texto_espaciado(d, (ANCHO - MARGEN, 1216), SITIO, montserrat(24, 700), color, tracking=0, alineacion="r")
    puntos(d, indice, total, 1288, ROJO_VIVO if claro else ROJO, color)


def puntos(d: ImageDraw.ImageDraw, indice: int, total: int, y: float, activo, inactivo) -> None:
    """Los puntitos de "estás en la placa 3 de 5"."""
    r = 9
    sep = 34
    ancho_total = (total - 1) * sep
    x0 = ANCHO / 2 - ancho_total / 2
    for i in range(total):
        x = x0 + i * sep
        if i == indice - 1:
            d.rounded_rectangle([x - 22, y - r, x + 22, y + r], radius=r, fill=activo)
        else:
            d.ellipse([x - r, y - r, x + r, y + r], outline=inactivo, width=2)


def senal_deslizar(d: ImageDraw.ImageDraw, y: float, color) -> None:
    """El "deslizá" con la flechita, abajo a la derecha de las portadas."""
    fuente = montserrat(32, 700)
    texto = "Deslizá"
    ancho = fuente.getlength(texto)
    x = ANCHO - MARGEN - ancho - 66
    d.text((x, y), texto, font=fuente, fill=color, anchor="la")
    ax = x + ancho + 26
    d.line([ax, y + 20, ax + 34, y + 20], fill=color, width=5)
    d.line([ax + 20, y + 8, ax + 34, y + 20, ax + 20, y + 32], fill=color, width=5, joint="curve")


# --------------------------------------------------------------------------
# Tipos de placa
# --------------------------------------------------------------------------

def placa_portada(p: dict, indice: int, total: int) -> Image.Image:
    """La primera placa: logo grande, título y una bajada. Fondo de pizarra."""
    im = fondo_pizarra()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=True)

    pegar(im, logo("tiza", 300), (ANCHO / 2, 168), ancla="ma")

    tam, interlinea = ajustar_titulo(p["titulo"], p.get("tam_titulo", 96), ANCHO_UTIL)
    f_bajada = montserrat(38, 500)
    lineas_bajada = envolver(p["bajada"], f_bajada, ANCHO_UTIL - 40) if p.get("bajada") else []
    alto = len(p["titulo"]) * interlinea + (26 + len(lineas_bajada) * round(f_bajada.size * 1.34) if lineas_bajada else 0)

    # El bloque se centra entre el logo (termina cerca de 470) y el "deslizá" (1108).
    y = 470 + max(0, (1080 - 470 - alto) // 2)
    for i, linea in enumerate(p["titulo"]):
        color = ROJO_VIVO if i == p.get("destacado", -1) else TIZA
        d.text((ANCHO / 2, y), linea, font=fredericka(tam), fill=color, anchor="ma")
        y += interlinea

    if lineas_bajada:
        y += 26
        for linea in lineas_bajada:
            d.text((ANCHO / 2, y), linea, font=f_bajada, fill=TIZA_APAGADA, anchor="ma")
            y += round(f_bajada.size * 1.34)

    senal_deslizar(d, 1108, TIZA_APAGADA)
    pie(d, indice, total, claro=True)
    return im


def placa_lista(p: dict, indice: int, total: int) -> Image.Image:
    """Placa clara con título e ítems (ícono + título + explicación)."""
    im = fondo_crema()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=False)

    tam, interlinea = ajustar_titulo(p["titulo"], p.get("tam_titulo", 84), ANCHO_UTIL)
    y = 190
    for i, linea in enumerate(p["titulo"]):
        color = ROJO if i == p.get("destacado", -1) else GRAFITO
        d.text((MARGEN, y), linea, font=fredericka(tam), fill=color, anchor="la")
        y += interlinea
    if p.get("destacado", -1) >= 0:
        ancho_linea = fredericka(tam).getlength(p["titulo"][p["destacado"]])
        subrayado_tiza(d, MARGEN + 4, MARGEN + ancho_linea, y + 6, ROJO, grosor=8)

    if p.get("bajada"):
        y = parrafo(d, p["bajada"], montserrat(34, 500), GRIS, (MARGEN, y + 22), ANCHO_UTIL, interlinea=1.34)

    bloque_items(d, p["items"], max(y + 54, 520), 1140)
    pie(d, indice, total, claro=False)
    return im


def placa_destacada(p: dict, indice: int, total: int) -> Image.Image:
    """Placa oscura con una frase grande y, si hace falta, un gráfico o datos."""
    im = fondo_pizarra()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=True)

    y = 250
    tam, interlinea = ajustar_titulo(p["titulo"], p.get("tam_titulo", 74), ANCHO_UTIL - 20, interlinea=1.16)
    f_bajada = montserrat(36, 500)
    lineas_bajada = envolver(p["bajada"], f_bajada, ANCHO_UTIL - 30) if p.get("bajada") else []
    alto = (90 if p.get("etiqueta") else 0) + len(p["titulo"]) * interlinea
    if lineas_bajada:
        alto += 40 + len(lineas_bajada) * round(f_bajada.size * 1.36)
    if p.get("dibujo") == "grafico":
        alto += 300 + interlinea

    # Si sobra lugar, el bloque baja para quedar centrado entre el encabezado y el pie.
    y = 200 + max(0, (940 - alto) // 2)

    if p.get("etiqueta"):
        texto_espaciado(d, (ANCHO / 2, y), p["etiqueta"].upper(), bebas(40), ROJO_VIVO, tracking=6, alineacion="c")
        y += 90

    for i, linea in enumerate(p["titulo"]):
        color = ROJO_VIVO if i == p.get("destacado", -1) else TIZA
        d.text((ANCHO / 2, y), linea, font=fredericka(tam), fill=color, anchor="ma")
        y += interlinea
    if p.get("destacado", -1) >= 0:
        ancho_linea = fredericka(tam).getlength(p["titulo"][p["destacado"]])
        subrayado_tiza(d, ANCHO / 2 - ancho_linea / 2, ANCHO / 2 + ancho_linea / 2, y + 4, ROJO_VIVO, grosor=8)

    y += 40
    if lineas_bajada:
        for linea in lineas_bajada:
            d.text((ANCHO / 2, y), linea, font=f_bajada, fill=TIZA_APAGADA, anchor="ma")
            y += round(f_bajada.size * 1.36)

    if p.get("dibujo") == "grafico":
        dibujar_grafico(d, y + 40)

    pie(d, indice, total, claro=True)
    return im


def dibujar_grafico(d: ImageDraw.ImageDraw, arriba: float) -> None:
    """
    Ilustración de la comparación sueldo vs inflación: barras que suben (salario
    nominal) y una línea roja que baja (poder de compra).
    """
    x0, x1 = MARGEN + 40, ANCHO - MARGEN - 40
    base = arriba + 330
    alto_max = 280
    d.text((x0 - 10, arriba), "Salario nominal", font=montserrat(30, 700), fill=TIZA_APAGADA, anchor="la")
    d.line([x0 - 20, base, x1 + 20, base], fill=TIZA_APAGADA, width=3)

    n = 5
    paso = (x1 - x0) / n
    for i in range(n):
        alto = alto_max * (0.34 + 0.62 * i / (n - 1))
        x = x0 + i * paso + 12
        ancho = paso - 34
        d.rounded_rectangle([x, base - alto, x + ancho, base], radius=8, fill=(126, 130, 133))

    linea = []
    for i in range(n):
        x = x0 + i * paso + 12 + (paso - 34) / 2
        linea.append((x, base - alto_max * (0.95 - 0.72 * i / (n - 1))))
    d.line([c for punto in linea for c in punto], fill=ROJO_VIVO, width=9, joint="curve")
    for x, py in linea:
        d.ellipse([x - 10, py - 10, x + 10, py + 10], fill=ROJO_VIVO)

    d.text((x0 - 10, base + 30), "Poder de compra real", font=montserrat(30, 700), fill=ROJO_VIVO, anchor="la")


def placa_pasos(p: dict, indice: int, total: int) -> Image.Image:
    """Placa clara con pasos numerados."""
    im = fondo_crema()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=False)

    tam, interlinea = ajustar_titulo(p["titulo"], p.get("tam_titulo", 84), ANCHO_UTIL)
    y = 190
    for i, linea in enumerate(p["titulo"]):
        color = ROJO if i == p.get("destacado", -1) else GRAFITO
        d.text((MARGEN, y), linea, font=fredericka(tam), fill=color, anchor="la")
        y += interlinea

    if p.get("bajada"):
        y = parrafo(d, p["bajada"], montserrat(34, 500), GRIS, (MARGEN, y + 22), ANCHO_UTIL, interlinea=1.34)

    pasos = [dict(paso, numero=str(i)) for i, paso in enumerate(p["pasos"], start=1)]
    bloque_items(d, pasos, max(y + 64, 540), 1140, numeros=True)
    pie(d, indice, total, claro=False)
    return im


def placa_recibo(p: dict, indice: int, total: int) -> Image.Image:
    """Placa oscura con un recibo simbólico: muestra qué desglosa la calculadora."""
    im = fondo_pizarra()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=True)

    tam, interlinea = ajustar_titulo(p["titulo"], p.get("tam_titulo", 84), ANCHO_UTIL, interlinea=1.16)
    y = 200
    for i, linea in enumerate(p["titulo"]):
        color = ROJO_VIVO if i == p.get("destacado", -1) else TIZA
        d.text((MARGEN, y), linea, font=fredericka(tam), fill=color, anchor="la")
        y += interlinea

    if p.get("bajada"):
        y = parrafo(d, p["bajada"], montserrat(33, 500), TIZA_APAGADA, (MARGEN, y + 20), ANCHO_UTIL, interlinea=1.32)

    # El recibo: una tarjeta clara con renglones y valores tapados.
    alto_tarjeta = 470
    arriba = max(y + 56, 620)
    tarjeta = Image.new("RGBA", (ANCHO_UTIL, alto_tarjeta), (0, 0, 0, 0))
    dt = ImageDraw.Draw(tarjeta)
    dt.rounded_rectangle([0, 0, ANCHO_UTIL - 1, alto_tarjeta - 1], radius=22, fill=CREMA + (247,))
    dt.rectangle([0, 0, ANCHO_UTIL - 1, 14], fill=ROJO)

    dt.text((40, 46), "TOTAL DE BOLSILLO", font=montserrat(30, 800), fill=ROJO, anchor="la")
    dt.text((40, 78), "$ ••••••", font=bebas(96), fill=GRAFITO, anchor="la")
    dt.line([40, 210, ANCHO_UTIL - 40, 210], fill=(200, 196, 190), width=2)

    filas = [
        ("Sueldo básico", ""),
        ("Zona y antigüedad", ""),
        ("Enseñanza en aula (presentismo)", ""),
        ("Descuentos de ley", "−"),
        ("SAC / aguinaldo estimado", ""),
    ]
    fy = 236
    for etiqueta, signo in filas:
        dt.text((40, fy), etiqueta, font=montserrat(31, 600), fill=GRAFITO, anchor="la")
        valor = ("− " if signo else "") + "•••"
        ancho_valor = montserrat(31, 700).getlength(valor)
        x_ini = 40 + montserrat(31, 600).getlength(etiqueta) + 14
        x_fin = ANCHO_UTIL - 40 - ancho_valor - 14
        x = x_ini
        while x < x_fin:  # línea punteada hasta el valor
            dt.line([x, fy + 22, x + 6, fy + 22], fill=(206, 201, 195), width=3)
            x += 14
        dt.text((ANCHO_UTIL - 40, fy), valor, font=montserrat(31, 700),
                fill=ROJO if signo else GRIS, anchor="ra")
        fy += 44

    im.paste(tarjeta, (MARGEN, arriba), tarjeta)

    if p.get("nota"):
        parrafo(d, p["nota"], montserrat(30, 600, cursiva=True), TIZA_APAGADA,
                (ANCHO / 2, arriba + alto_tarjeta + 34), ANCHO_UTIL, interlinea=1.3, alineacion="c")

    pie(d, indice, total, claro=True)
    return im


def placa_enlaces(p: dict, indice: int, total: int) -> Image.Image:
    """Placa oscura con tarjetas de enlaces: nombre + para qué sirve."""
    im = fondo_pizarra()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=True)

    tam, interlinea = ajustar_titulo(p["titulo"], p.get("tam_titulo", 84), ANCHO_UTIL, interlinea=1.16)
    y = 200
    for i, linea in enumerate(p["titulo"]):
        color = ROJO_VIVO if i == p.get("destacado", -1) else TIZA
        d.text((MARGEN, y), linea, font=fredericka(tam), fill=color, anchor="la")
        y += interlinea

    if p.get("bajada"):
        y = parrafo(d, p["bajada"], montserrat(33, 500), TIZA_APAGADA, (MARGEN, y + 20), ANCHO_UTIL, interlinea=1.32)

    y = max(y + 56, 520)
    for item in p["items"]:
        x_texto = MARGEN + 76 + 78
        f_titulo = montserrat(37, 800)
        f_texto = montserrat(30, 500)
        lineas = envolver(item["texto"], f_texto, ANCHO - MARGEN - 34 - x_texto)
        alto = max(150, 62 + len(lineas) * 40)
        d.rounded_rectangle([MARGEN, y, ANCHO - MARGEN, y + alto], radius=18,
                            fill=(58, 63, 68), outline=TIZA_APAGADA, width=2)
        cx, cy = MARGEN + 76, y + alto / 2
        d.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], fill=ROJO)
        icono(d, item.get("icono", "globo"), cx, cy, CREMA, 46)
        ty = y + 30
        d.text((x_texto, ty), item["titulo"], font=f_titulo, fill=TIZA, anchor="la")
        ty += 46
        for linea in lineas:
            d.text((x_texto, ty), linea, font=f_texto, fill=TIZA_APAGADA, anchor="la")
            ty += 40
        y += alto + 28

    pie(d, indice, total, claro=True)
    return im


def placa_cierre(p: dict, indice: int, total: int) -> Image.Image:
    """
    Última placa: fondo rojo, llamado a la acción, dirección y QR.

    El QR se ancla desde abajo, no desde arriba: así nunca se monta sobre el pie
    de la placa cuando el texto de arriba ocupa más lugar.
    """
    im = fondo_rojo()
    d = ImageDraw.Draw(im)
    encabezado(d, p.get("kicker", FIRMA), indice, total, claro=True)

    abajo_qr = 1140
    lado = 250
    tarjeta_lado = lado + 44
    arriba_qr = abajo_qr - tarjeta_lado
    y_url = arriba_qr - 108
    limite_texto = y_url - 46  # el título y la bajada tienen que terminar antes de la dirección

    pegar(im, logo("crema", 190), (ANCHO / 2, 168), ancla="ma")

    # Se mide primero y se dibuja una sola vez: el tamaño más grande que entra.
    arriba_texto = 400
    lineas_bajada: list[str] = []
    tam_titulo, tam_bajada, alto = 92, 35, 0
    tam_max, _ = ajustar_titulo(p["titulo"], 92, ANCHO_UTIL - 30)
    for tam_titulo in [t for t in (92, 86, 80, 74, 68, 62) if t <= tam_max]:
        tam_bajada = max(27, round(tam_titulo * 0.38))
        f_bajada = montserrat(tam_bajada, 600)
        lineas_bajada = envolver(p["bajada"], f_bajada, ANCHO_UTIL - 40) if p.get("bajada") else []
        alto = len(p["titulo"]) * round(tam_titulo * 1.13)
        if lineas_bajada:
            alto += 20 + len(lineas_bajada) * round(tam_bajada * 1.32)
        if alto <= limite_texto - arriba_texto:
            break

    y = arriba_texto + max(0, (limite_texto - arriba_texto - alto) // 2)
    for linea in p["titulo"]:
        d.text((ANCHO / 2, y), linea, font=fredericka(tam_titulo), fill=CREMA, anchor="ma")
        y += round(tam_titulo * 1.13)
    if lineas_bajada:
        y += 20
        f_bajada = montserrat(tam_bajada, 600)
        for linea in lineas_bajada:
            d.text((ANCHO / 2, y), linea, font=f_bajada, fill=(250, 236, 230), anchor="ma")
            y += round(tam_bajada * 1.32)

    # La dirección, grande, como para leerla desde el celular.
    fuente_url = montserrat(50, 800)
    while fuente_url.getlength(SITIO) > ANCHO_UTIL and fuente_url.size > 34:
        fuente_url = montserrat(fuente_url.size - 3, 800)
    ancho_url = fuente_url.getlength(SITIO)
    d.text((ANCHO / 2, y_url), SITIO, font=fuente_url, fill=CREMA, anchor="ma")
    subrayado_tiza(d, ANCHO / 2 - ancho_url / 2, ANCHO / 2 + ancho_url / 2, y_url + 70, CREMA, grosor=7)

    # QR sobre una tarjeta blanca, para que se lea sobre el rojo.
    tarjeta = Image.new("RGBA", (tarjeta_lado, tarjeta_lado), (0, 0, 0, 0))
    dt = ImageDraw.Draw(tarjeta)
    dt.rounded_rectangle([0, 0, tarjeta_lado - 1, tarjeta_lado - 1], radius=26, fill=(255, 255, 255, 255))
    tarjeta.paste(qr_imagen(lado), (22, 22))
    pegar(im, tarjeta, (ANCHO / 2, arriba_qr), ancla="ma")

    d.line([MARGEN, 1188, ANCHO - MARGEN, 1188], fill=(250, 235, 230), width=2)
    texto_espaciado(d, (MARGEN, 1216), FIRMA, montserrat(24, 600), (250, 235, 230), tracking=2)
    texto_espaciado(d, (ANCHO - MARGEN, 1216), "Gratis y sin fines de lucro", montserrat(24, 700),
                    (250, 235, 230), tracking=0, alineacion="r")
    puntos(d, indice, total, 1288, CREMA, (250, 235, 230))
    return im


RENDERIZADORES = {
    "portada": placa_portada,
    "lista": placa_lista,
    "destacada": placa_destacada,
    "pasos": placa_pasos,
    "recibo": placa_recibo,
    "enlaces": placa_enlaces,
    "cierre": placa_cierre,
}


# --------------------------------------------------------------------------
# Hojas de contacto (para ver el carrusel como unidad)
# --------------------------------------------------------------------------

def hoja_de_contacto(archivos: list[Path], destino: Path, ancho_placa: int = 400) -> None:
    """Pone las placas de un carrusel en fila, como se ven al deslizar."""
    margen, separacion = 40, 24
    miniaturas = []
    for archivo in archivos:
        im = Image.open(archivo).convert("RGB")
        alto = round(im.height * ancho_placa / im.width)
        miniaturas.append(im.resize((ancho_placa, alto), Image.LANCZOS))

    ancho = margen * 2 + len(miniaturas) * ancho_placa + (len(miniaturas) - 1) * separacion
    alto_mini = miniaturas[0].height
    hoja = Image.new("RGB", (ancho, alto_mini + margen * 2), (233, 236, 239))
    x = margen
    for mini in miniaturas:
        hoja.paste(mini, (x, margen))
        x += ancho_placa + separacion
    destino.parent.mkdir(parents=True, exist_ok=True)
    hoja.save(destino, "PNG", optimize=True)


def hoja_general(carpetas: list[tuple[str, list[Path]]], destino: Path) -> None:
    """Todas las publicaciones en una grilla: la vista de conjunto."""
    ancho_placa = 260
    margen, separacion, alto_titulo = 34, 16, 46
    fuente = montserrat(26, 700)

    filas = []
    for titulo, archivos in carpetas:
        fila = []
        for archivo in archivos:
            im = Image.open(archivo).convert("RGB")
            fila.append(im.resize((ancho_placa, round(im.height * ancho_placa / im.width)), Image.LANCZOS))
        filas.append((titulo, fila))

    ancho = margen * 2 + 5 * ancho_placa + 4 * separacion
    alto_fila = filas[0][1][0].height + alto_titulo
    hoja = Image.new("RGB", (ancho, margen * 2 + len(filas) * alto_fila + (len(filas) - 1) * separacion),
                     (233, 236, 239))
    d = ImageDraw.Draw(hoja)
    y = margen
    for titulo, fila in filas:
        d.text((margen, y), titulo, font=fuente, fill=GRAFITO, anchor="la")
        y += alto_titulo
        x = margen
        for mini in fila:
            hoja.paste(mini, (x, y))
            x += ancho_placa + separacion
        y += fila[0].height + separacion
    hoja.save(destino, "PNG", optimize=True)


# --------------------------------------------------------------------------
# Render
# --------------------------------------------------------------------------

def render(carruseles: list[dict]) -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    indice_general = []

    for numero, carrusel in enumerate(carruseles, start=1):
        carpeta = SALIDA / f"carrusel-{numero:02d}-{carrusel['slug']}"
        carpeta.mkdir(parents=True, exist_ok=True)
        total = len(carrusel["placas"])
        archivos = []

        for posicion, placa in enumerate(carrusel["placas"], start=1):
            renderizador = RENDERIZADORES[placa["tipo"]]
            im = renderizador(placa, posicion, total)
            archivo = carpeta / f"placa-{posicion:02d}.png"
            im.save(archivo, "PNG", optimize=True)
            archivos.append(archivo)
            print(f"  {archivo.relative_to(RAIZ)}  {archivo.stat().st_size / 1024:6.0f} KB")

        hoja_de_contacto(archivos, carpeta / "_vista-previa.png")
        indice_general.append((f"{numero:02d}. {carrusel['titulo']}", archivos))

    hoja_general(indice_general, SALIDA / "_vista-general.png")
    print(f"  {SALIDA.relative_to(RAIZ) / '_vista-general.png'}")


# --------------------------------------------------------------------------
# Contenido
# --------------------------------------------------------------------------

CARRUSELES = [
    {
        "slug": "que-es-ateba",
        "titulo": "Qué es ATEBA y qué hay en la web",
        "placas": [
            {
                "tipo": "portada",
                "kicker": "ATEBA · LISTA ROJA N°4 · AMET",
                "titulo": ["Docentes de San Luis:", "estas herramientas", "son nuestras"],
                "destacado": 1,
                "bajada": "Calculadora de sueldos, comparativa con la inflación y recursos, "
                          "en un solo lugar. Gratis y sin fines de lucro.",
            },
            {
                "tipo": "lista",
                "kicker": "Quiénes somos",
                "titulo": ["Una agrupación", "de base"],
                "destacado": 1,
                "bajada": "ATEBA es la Agrupación de Trabajadores de la Educación de Base, "
                          "dentro de AMET. Somos la Lista Roja N°4.",
                "items": [
                    {"icono": "check", "titulo": "Docentes, no dirigentes",
                     "texto": "Integrada por docentes de toda la provincia, con los pies en la escuela."},
                    {"icono": "documento", "titulo": "Años de trabajo territorial",
                     "texto": "Analizamos recibos en las salas de profesores y dimos la discusión técnica en cada asamblea."},
                    {"icono": "calculadora", "titulo": "Herramientas digitales propias",
                     "texto": "Convertimos ese trabajo en instrumentos para que cada colega entienda y defienda lo que le corresponde."},
                ],
            },
            {
                "tipo": "destacada",
                "kicker": "Por qué lo hacemos",
                "etiqueta": "Transparencia sindical",
                "titulo": ["Entender el recibo", "es un paso para", "defender el salario"],
                "destacado": 1,
                "tam_titulo": 76,
                "bajada": "Este sitio no es solo una página web: es una herramienta de organización. "
                          "La información deja de ser un misterio y pasa a ser un argumento.",
            },
            {
                "tipo": "lista",
                "kicker": "Qué encontrás",
                "titulo": ["Tres herramientas,", "una sola web"],
                "destacado": 0,
                "items": [
                    {"icono": "calculadora", "titulo": "Calculadora de sueldos",
                     "texto": "Elegís nivel, cargo, zona, antigüedad y el mes: te muestra el total de bolsillo y el detalle ítem por ítem."},
                    {"icono": "grafico", "titulo": "Sueldo vs. inflación",
                     "texto": "Compara la evolución de la hora cátedra contra el IPC del INDEC y te dice si ganaste o perdiste poder de compra."},
                    {"icono": "documento", "titulo": "Recursos y normativa",
                     "texto": "Estatuto Docente, calendario escolar, D.J. 02, L.R. 01 y los portales oficiales, todos reunidos."},
                ],
            },
            {
                "tipo": "cierre",
                "kicker": "Entrá ahora",
                "titulo": ["Todo esto,", "en tu celular"],
                "bajada": "Andá a la web y guardala en favoritos. Es gratis y la construimos entre todxs.",
            },
        ],
    },
    {
        "slug": "calculadora-de-sueldos",
        "titulo": "Calculadora de sueldos",
        "placas": [
            {
                "tipo": "portada",
                "kicker": "Calculadora de sueldos · San Luis",
                "titulo": ["¿Cuánto deberías", "cobrar este mes?"],
                "destacado": 1,
                "bajada": "Cargá tu cargo y tus datos: la calculadora te muestra el total de bolsillo "
                          "y de dónde sale cada peso.",
            },
            {
                "tipo": "lista",
                "kicker": "Para qué cargos funciona",
                "titulo": ["Cubrimos", "todos los niveles"],
                "destacado": 1,
                "items": [
                    {"icono": "check", "titulo": "Nivel Medio",
                     "texto": "Horas en secundaria y cargo de Preceptor (213p)."},
                    {"icono": "check", "titulo": "Nivel Primario",
                     "texto": "Maestra/o de grado y Maestra/o Celador (259p)."},
                    {"icono": "check", "titulo": "Nivel Inicial",
                     "texto": "Maestra/o de jardín y auxiliar de jardín."},
                    {"icono": "check", "titulo": "Nivel Superior (IFDC)",
                     "texto": "Cargo full time, tiempo completo de 30 hs y semiexclusivo de 25 hs."},
                ],
                "bajada": "",
            },
            {
                "tipo": "recibo",
                "kicker": "Qué te muestra",
                "titulo": ["Tu recibo,", "ítem por ítem"],
                "destacado": 1,
                "bajada": "Total de bolsillo, bruto y descuentos, conceptos remunerativos y no remunerativos, "
                          "SAC estimado y un gráfico de proporciones.",
                "nota": "Los valores los ponés vos: la herramienta hace el cálculo.",
            },
            {
                "tipo": "pasos",
                "kicker": "Cómo se usa",
                "titulo": ["Tres pasos,", "un minuto"],
                "destacado": 1,
                "pasos": [
                    {"titulo": "Elegí nivel y cargo",
                     "texto": "Inicial, Primario, Secundario o Superior (IFDC). Después, el tipo de cargo."},
                    {"titulo": "Cargá tus datos y el mes",
                     "texto": "Zona, antigüedad, afiliación sindical y el mes que querés calcular."},
                    {"titulo": "Mirá el detalle",
                     "texto": "Total de bolsillo, bruto, descuentos de ley y el desglose concepto por concepto."},
                ],
            },
            {
                "tipo": "cierre",
                "kicker": "Probalo",
                "titulo": ["Calculá", "tu sueldo ahora"],
                "bajada": "Actualizada a valores de agosto–septiembre 2026. Si tu cargo no aparece, escribinos.",
            },
        ],
    },
    {
        "slug": "sueldo-vs-inflacion",
        "titulo": "Sueldo vs inflación",
        "placas": [
            {
                "tipo": "portada",
                "kicker": "Salario vs. inflación",
                "titulo": ["¿Tu sueldo", "le ganó", "a la inflación?"],
                "destacado": 1,
                "bajada": "Elegís dos meses y la herramienta compara el aumento salarial "
                          "contra el IPC. El resultado, en porcentaje.",
            },
            {
                "tipo": "lista",
                "kicker": "Cómo se calcula",
                "titulo": ["Tres datos,", "ninguna opinión"],
                "destacado": 0,
                "items": [
                    {"icono": "sueldo", "titulo": "El valor de la hora cátedra",
                     "texto": "Se toma el valor histórico porque es la base sobre la que se calculan los demás ítems del recibo."},
                    {"icono": "grafico", "titulo": "El IPC del INDEC",
                     "texto": "La inflación oficial, mes a mes, a nivel nacional."},
                    {"icono": "check", "titulo": "La diferencia del período",
                     "texto": "Cruce entre aumento acumulado e inflación acumulada: la pérdida o ganancia exacta de poder de compra."},
                ],
            },
            {
                "tipo": "destacada",
                "kicker": "Lo que se ve cuando hay datos",
                "titulo": ["Las barras suben,", "el poder de compra no"],
                "destacado": 1,
                "tam_titulo": 72,
                "dibujo": "grafico",
                "bajada": "",
            },
            {
                "tipo": "lista",
                "kicker": "Por qué importa",
                "titulo": ["Sin números,", "la discusión", "se pierde"],
                "destacado": 2,
                "bajada": "Durante años estudiamos la composición de nuestros haberes para denunciar "
                          "el achatamiento de la pirámide salarial.",
                "items": [
                    {"icono": "check", "titulo": "Para reclamar con fundamento",
                     "texto": "Saber qué pedimos y por qué, en cada asamblea y en cada escuela."},
                    {"icono": "check", "titulo": "Para no discutir de memoria",
                     "texto": "El dato reemplaza a la anécdota: cada docente puede verificarlo con su propio período."},
                ],
            },
            {
                "tipo": "cierre",
                "kicker": "Compará tu período",
                "titulo": ["¿Ganaste", "o perdiste?"],
                "bajada": "Entrá, elegí desde qué mes hasta qué mes y mirá el resultado.",
            },
        ],
    },
    {
        "slug": "recursos-y-colaboracion",
        "titulo": "Recursos y colaboración",
        "placas": [
            {
                "tipo": "portada",
                "kicker": "Recursos para docentes",
                "titulo": ["Normativa,", "formularios y", "portales oficiales"],
                "destacado": 1,
                "bajada": "Todo lo que suele estar disperso, reunido en un solo lugar. "
                          "Y si falta algo, lo sumamos entre todxs.",
            },
            {
                "tipo": "lista",
                "kicker": "Normativa y formularios",
                "titulo": ["Los papeles", "a mano"],
                "destacado": 0,
                "items": [
                    {"icono": "documento", "titulo": "Estatuto Docente de San Luis",
                     "texto": "El texto reglamentado, para consultar derechos y obligaciones sin intermediarios."},
                    {"icono": "calendario", "titulo": "Calendario Escolar 2026",
                     "texto": "Fechas, recesos y períodos de inscripción del ciclo lectivo."},
                    {"icono": "documento", "titulo": "D.J. 02 y L.R. 01",
                     "texto": "Declaración jurada vigente y licencias menores a 30 días, listas para descargar."},
                ],
            },
            {
                "tipo": "enlaces",
                "kicker": "Portales oficiales",
                "titulo": ["Los trámites,", "sin vueltas"],
                "destacado": 1,
                "bajada": "Accesos directos a los sitios donde de verdad se resuelven las cosas.",
                "items": [
                    {"icono": "globo", "titulo": "Ministerio de Educación de San Luis",
                     "texto": "Novedades, resoluciones y comunicados del sistema educativo provincial."},
                    {"icono": "documento", "titulo": "Agentes de la Administración Pública",
                     "texto": "Recibos de sueldo, trámites y consultas del agente provincial."},
                    {"icono": "calendario", "titulo": "Junta de Clasificación Docente",
                     "texto": "Inscripciones, listados y movimientos del escalafón."},
                ],
            },
            {
                "tipo": "lista",
                "kicker": "El proyecto es colectivo",
                "titulo": ["Construido", "entre todxs"],
                "destacado": 1,
                "bajada": "El sitio es gratuito y sin fines de lucro. Se sostiene con el aporte de quienes lo usan.",
                "items": [
                    {"icono": "sobre", "titulo": "Mandanos tu recibo",
                     "texto": "Si tu cargo no aparece o ves diferencias, mandá una foto o PDF. Podés tachar nombre y CUIL."},
                    {"icono": "check", "titulo": "Compartilo con tus colegas",
                     "texto": "Mientras más docentes lo usen, más rápido crece y más cargos se van sumando."},
                    {"icono": "sueldo", "titulo": "Bancá el proyecto",
                     "texto": "Hay una colaboración voluntaria para mantener la web activa y actualizada."},
                ],
            },
            {
                "tipo": "cierre",
                "kicker": "Sumate",
                "titulo": ["La web", "es de todxs"],
                "bajada": "Entrá, usala, compartila. Y si podés, sumá tu aporte para que siga creciendo.",
            },
        ],
    },
]


def main() -> int:
    for archivo in (
        FUENTES / "FrederickaTheGreat-Regular.ttf",
        FUENTES / "Montserrat[wght].ttf",
        DEPS / "qrcode",
    ):
        if not archivo.exists():
            print("Faltan los assets. Corré primero:  python tools/preparar-assets-placas.py")
            return 1

    print(f"Generando placas en {SALIDA.relative_to(RAIZ)}")
    render(CARRUSELES)
    print("Listo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
