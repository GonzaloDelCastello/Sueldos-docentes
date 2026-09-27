"""Extrae a texto todos los PDF de una carpeta, para poder compararlos.

Uso: python tools/leer-pdfs-carpeta.py docs/Recibos .tmp-lectura/recibos
Es una herramienta de trabajo: no la usa el sitio.
"""
import sys
from pathlib import Path

from pypdf import PdfReader


def main() -> int:
    origen = Path(sys.argv[1])
    destino = Path(sys.argv[2])
    destino.mkdir(parents=True, exist_ok=True)

    fallidos = []
    for pdf in sorted(origen.rglob("*.pdf")):
        salida = destino / (pdf.stem.replace(" ", "_") + ".txt")
        try:
            lector = PdfReader(str(pdf))
            partes = []
            for numero, pagina in enumerate(lector.pages, start=1):
                partes.append(f"\n===== PAGINA {numero} =====\n")
                partes.append(pagina.extract_text() or "(sin texto)")
            salida.write_text("".join(partes), encoding="utf-8")
        except Exception as error:  # PDF roto o con stream truncado
            fallidos.append(f"{pdf.name}: {type(error).__name__}")

    print(f"extraídos: {len(list(destino.glob('*.txt')))}")
    for fallido in fallidos:
        print(f"  FALLÓ -> {fallido}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
