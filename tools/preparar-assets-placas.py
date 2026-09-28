"""
Descarga los assets que necesitan las placas de Instagram.

Por qué existe este archivo: las placas usan dos tipografías que no vienen con
Windows (Fredericka the Great, que es la del título del sitio, y Montserrat,
para el texto) y la librería `qrcode` para el código QR de la última placa.
En vez de meter todo eso a mano en el repo, este script lo baja una sola vez y
lo deja cacheado: si el archivo ya está, no vuelve a pedirlo.

Uso:
    python tools/preparar-assets-placas.py

Requiere conexión a internet la primera vez. Después ya no.
"""

from __future__ import annotations

import io
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "tools" / "placas" / "fuentes"
DEPS = RAIZ / "tools" / "placas" / "deps"

# Tipografías de Google Fonts (licencia OFL, se pueden usar libremente).
# Bebas Neue se usa para números grandes, tipo "1 / 5" o "20%".
TIPOGRAFIAS = {
    "FrederickaTheGreat-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/frederickathegreat/FrederickatheGreat-Regular.ttf",
    "Montserrat[wght].ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf",
    "Montserrat-Italic[wght].ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Italic%5Bwght%5D.ttf",
    "BebasNeue-Regular.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf",
}


def descargar(url: str, destino: Path) -> None:
    """Baja `url` a `destino`, creando las carpetas que falten."""
    destino.parent.mkdir(parents=True, exist_ok=True)
    pedido = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(pedido, timeout=60) as respuesta:
        destino.write_bytes(respuesta.read())
    print(f"  {destino.name:34} {destino.stat().st_size / 1024:7.0f} KB")


def fuentes() -> None:
    print("Tipografías:")
    for nombre, url in TIPOGRAFIAS.items():
        destino = FUENTES / nombre
        if destino.exists() and destino.stat().st_size > 1000:
            print(f"  {nombre:34} ya estaba")
            continue
        descargar(url, destino)


def qrcode_libreria() -> None:
    """
    Instala `qrcode` a mano.

    No se usa pip a propósito: pip necesita escribir en una carpeta temporal
    fuera del proyecto y en este entorno esa escritura está restringida. Bajar
    el wheel y descomprimirlo hace exactamente lo mismo y no depende de pip.
    """
    print("Librería qrcode:")
    if (DEPS / "qrcode").exists():
        print("  qrcode                                 ya estaba")
        return

    with urllib.request.urlopen("https://pypi.org/pypi/qrcode/json", timeout=60) as r:
        datos = json.load(r)

    wheel = next(
        u
        for u in datos["urls"]
        if u["packagetype"] == "bdist_wheel" and u["filename"].endswith("py3-none-any.whl")
    )
    with urllib.request.urlopen(wheel["url"], timeout=120) as r:
        contenido = r.read()

    DEPS.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(contenido)) as z:
        z.extractall(DEPS)
    print(f"  qrcode {datos['info']['version']:31} {len(contenido) / 1024:7.0f} KB")


def main() -> int:
    print(f"Preparando assets en {RAIZ / 'tools' / 'placas'}")
    fuentes()
    qrcode_libreria()
    sys.path.insert(0, str(DEPS))
    import qrcode  # noqa: F401  (import tardío: recién ahora existe)

    print("Listo: fuentes y qrcode disponibles.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
