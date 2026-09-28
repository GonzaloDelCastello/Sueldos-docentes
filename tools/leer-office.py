"""Extrae el texto de un .docx (o .xlsx) a un .txt, para poder leerlo cómodo.

Uso: python tools/leer-office.py "docs/Recibos/Boletín ... .docx" salida.txt
Es una herramienta de trabajo: no la usa el sitio.
"""
import sys
from pathlib import Path

from docx import Document


def main() -> int:
    origen = Path(sys.argv[1])
    destino = Path(sys.argv[2]) if len(sys.argv) > 2 else origen.with_suffix(".txt")

    documento = Document(str(origen))
    partes = []
    for parrafo in documento.paragraphs:
        partes.append(parrafo.text)
    for tabla in documento.tables:
        partes.append("\n--- TABLA ---")
        for fila in tabla.rows:
            partes.append(" | ".join(celda.text.strip() for celda in fila.cells))

    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text("\n".join(partes), encoding="utf-8")
    print(f"{origen.name} -> {destino} ({destino.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
