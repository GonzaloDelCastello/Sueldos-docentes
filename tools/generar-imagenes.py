"""
Genera los recursos de imagen optimizados del sitio.

Por qué existe este archivo: las imágenes originales pesaban ~1,8 MB y se
servían sin comprimir (el fondo del header solo pesaba 1,35 MB, unos 7 segundos
en una conexión 4G lenta). Este script deja versiones equivalentes mucho más
livianas y deja registrado cómo se generaron, para poder repetirlo.

Uso:
    python tools/generar-imagenes.py

Requiere Pillow. Si algo cambia en las imágenes originales, volvé a correrlo.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
IMG = RAIZ / "img"
# Las imágenes originales de alta resolución se guardan acá: no las usa el sitio,
# pero son la fuente a partir de la cual se generan las versiones optimizadas.
ORIGINALES = IMG / "originales"

# Colores de marca (los mismos de css/variables.css)
CREMA = (249, 247, 242)  # --primarioClaro
ROJO = (163, 59, 50)     # --primario
GRIS = (52, 58, 64)      # --secundarioOscuro


def kb(ruta: Path) -> float:
    return ruta.stat().st_size / 1024


def fondo_header() -> None:
    """
    Fondo del header: JPG 1920x1311 y 1347 KB -> WebP 1600px, 60 KB (-95%).

    El desenfoque de 1,5 px es lo que hace la diferencia: una foto de pizarra
    tiene mucho ruido y comprime pésimo. Como va detrás de texto, el blur no se
    nota y encima mejora la legibilidad del título.
    """
    original = ORIGINALES / "PizarraNegra.jpg"
    im = Image.open(original).convert("RGB")
    ancho = 1600
    im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(1.5))
    destino = IMG / "pizarra-negra.webp"
    im.save(destino, "WEBP", quality=72, method=6)
    print(f"  {destino.name:24} {im.width}x{im.height}  {kb(destino):5.0f} KB  (era {kb(original):.0f} KB)")


def logo() -> None:
    """Logo: PNG 1024x1280 y 455 KB -> WebP 400px, 28 KB (-94%)."""
    original = ORIGINALES / "1000158611-Photoroom.png"
    im = Image.open(original).convert("RGBA")
    ancho = 400
    im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    destino = IMG / "logo.webp"
    im.save(destino, "WEBP", quality=85, method=6)
    print(f"  {destino.name:24} {im.width}x{im.height}  {kb(destino):5.0f} KB  (era {kb(original):.0f} KB)")


def favicons() -> None:
    """
    Favicons a partir del logo, recortado a un cuadrado centrado.

    Se generan tres formatos a propósito:
      - favicon.ico  : el clásico, que los navegadores buscan por convención.
      - PNG 32 y 192 : algunos navegadores prefieren PNG, y el de 192 lo usa
                       Android cuando el sitio se agrega a la pantalla de inicio.
    """
    im = Image.open(ORIGINALES / "1000158611-Photoroom.png").convert("RGBA")
    lado = max(im.size)
    cuadro = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    cuadro.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2), im)

    icono = RAIZ / "favicon.ico"
    cuadro.resize((48, 48), Image.LANCZOS).save(
        icono, "ICO", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print(f"  {icono.name:24} 16/32/48  {kb(icono):5.0f} KB")

    for tam in (32, 192):
        destino = IMG / f"favicon-{tam}.png"
        cuadro.resize((tam, tam), Image.LANCZOS).save(destino, "PNG", optimize=True)
        print(f"  {destino.name:24} {tam}x{tam}    {kb(destino):5.0f} KB")

    apple = IMG / "apple-touch-icon.png"
    cuadro.resize((180, 180), Image.LANCZOS).save(apple, "PNG", optimize=True)
    print(f"  {apple.name:24} 180x180   {kb(apple):5.0f} KB")


def imagen_social() -> None:
    """Tarjeta 1200x630 para compartir el link en WhatsApp, Facebook, etc."""
    ancho, alto = 1200, 630
    img = Image.new("RGB", (ancho, alto), CREMA)
    d = ImageDraw.Draw(img)

    d.rectangle([0, alto - 90, ancho, alto], fill=ROJO)

    marca = Image.open(ORIGINALES / "1000158611-Photoroom.png").convert("RGBA")
    alto_marca = 330
    marca = marca.resize(
        (round(marca.width * alto_marca / marca.height), alto_marca), Image.LANCZOS
    )
    img.paste(marca, ((ancho - marca.width) // 2, 50), marca)

    def fuente(nombre: str, tam: int):
        return ImageFont.truetype(f"C:/Windows/Fonts/{nombre}", tam)

    def centrar(texto: str, y: int, f, color) -> None:
        caja = d.textbbox((0, 0), texto, font=f)
        d.text(((ancho - (caja[2] - caja[0])) // 2, y), texto, font=f, fill=color)

    centrar("Trabajadorxs de la Educaci\u00f3n - San Luis", 395, fuente("arialbd.ttf", 40), ROJO)
    centrar("Calculadora de sueldos docentes", 452, fuente("arial.ttf", 32), GRIS)
    centrar(
        "Herramienta gratuita y sin fines de lucro",
        alto - 63,
        fuente("arial.ttf", 28),
        (255, 255, 255),
    )

    destino = IMG / "og-image.png"
    img.save(destino, "PNG", optimize=True)
    print(f"  {destino.name:24} {ancho}x{alto}  {kb(destino):5.0f} KB")


if __name__ == "__main__":
    print("Generando recursos de imagen...")
    fondo_header()
    logo()
    favicons()
    imagen_social()
    print("Listo.")
