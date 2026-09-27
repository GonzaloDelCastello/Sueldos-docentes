"""Extrae el texto de un PDF a un .txt, para poder leerlo con comodidad.

Uso: python tools/leer-pdf.py "docs/Decretos/INSTRUCTIVO JULIO 2026.pdf" salida.txt
Es una herramienta de trabajo: no la usa el sitio.
"""
import sys
from pathlib import Path

from pypdf import PdfReader


def main() -> int:
    if len(sys.argv) < 2:
        print("falta la ruta del PDF")
        return 1

    origen = Path(sys.argv[1])
    destino = Path(sys.argv[2]) if len(sys.argv) > 2 else origen.with_suffix(".txt")

    lector = PdfReader(str(origen))
    partes = []
    for numero, pagina in enumerate(lector.pages, start=1):
        partes.append(f"\n===== PAGINA {numero} =====\n")
        partes.append(pagina.extract_text() or "(sin texto extraíble)")

    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text("".join(partes), encoding="utf-8")
    print(f"{origen.name}: {len(lector.pages)} páginas -> {destino} ({destino.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
