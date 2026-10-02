"""Lista, por recibo, el período y los seguros fijos (534-00, 540-00, 542-00).

Sirve para reconstruir la serie del seguro obligatorio mes a mes. Es una
herramienta de trabajo: no la usa el sitio.

Uso: python tools/listar-seguros.py .tmp-lectura/recibos
"""
import re
import sys
from pathlib import Path

PERIODO = re.compile(r"Per.odo Liquidado\s+(\S+)")
SEGURO = re.compile(r"^(?P<codigo>534-00|540-00|542-00)\s+(?P<nombre>.+?)\s+\d{2}-\d{4}\s+\$\s+1\s+-?(?P<importe>[\d\.,]+)\s*$")
TOTAL = re.compile(r"^Totales:.*?(?P<importe>-[\d\.,]+)\s*$")


def a_numero(texto: str) -> float:
    texto = texto.strip().lstrip("-")
    if re.fullmatch(r"\d{1,3}(\.\d{3})*,\d+", texto):
        return float(texto.replace(".", "").replace(",", "."))
    return float(texto.replace(",", ""))


def main() -> int:
    carpeta = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/Recibos/.lectura/todos")
    filas = []
    for ruta in sorted(carpeta.glob("*.txt")):
        if any(x in ruta.name for x in ("estatuto", "decreto", "Decreto", "INSTRUCTIVO", "Nuevos_Adicionales", "Boletin")):
            continue
        lineas = ruta.read_text(encoding="utf-8").splitlines()
        periodo = ""
        for linea in lineas:
            coincidencia = PERIODO.search(linea)
            if coincidencia:
                periodo = coincidencia.group(1)
                break
        seguros = {}
        for linea in lineas:
            coincidencia = SEGURO.match(linea.strip())
            if coincidencia:
                seguros[coincidencia.group("codigo")] = a_numero(coincidencia.group("importe"))
        if not seguros:
            continue
        filas.append((periodo or "?", ruta.stem[:42], seguros))

    filas.sort()
    print(f"{'período':<10} {'recibo':<44} {'seg. obligatorio':>16} {'social':>8} {'mutual':>8}")
    for periodo, nombre, seguros in filas:
        print(
            f"{periodo:<10} {nombre:<44} "
            f"{seguros.get('534-00', 0):>16,.2f} {seguros.get('540-00', 0):>8,.2f} {seguros.get('542-00', 0):>8,.2f}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
