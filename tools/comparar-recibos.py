"""Arma una tabla comparativa de los recibos ya extraídos a texto.

Lee .tmp-lectura/recibos/*.txt y muestra, por recibo: período, cargo, básico,
y los ítems que la calculadora modela (complementos, adicional, suma no
remunerativa, FONID). Sirve para verificar relaciones, no lo usa el sitio.

Uso: python tools/comparar-recibos.py .tmp-lectura/recibos
"""
import re
import sys
from pathlib import Path

# "099-41  SUMA NO REMUNERATIVA 02-2026 $ 1 14,002.45"
# Ojo: el texto que devuelve el PDF trae los números al revés de como se ven
# (278,470.20 en lugar de 278.470,20), así que se aceptan los dos formatos.
LINEA_CONCEPTO = re.compile(
    r"^(?P<codigo>\d{3}-\d{2})\s+(?P<nombre>.+?)\s+(?P<periodo>\d{2}-\d{4})\s+"
    r"(?P<um>%|\$|H|A)\s+(?P<uc>[\d\.,]+?)\s+(?P<importe>-?[\d\.,]+)\s*$"
)
SUELDO_BASICO = re.compile(r"Sueldo B.sico:\s*([\d\.,]+)")
# El texto extraído pierde las tildes (aparecen como �), así que se usa . en su lugar.
FUNCION = re.compile(r"Funci.n:\s*([^\s]+)\s+(.+?)\s{2,}")
PERIODO = re.compile(r"Per.odo Liquidado\s+(\S+)")


def a_numero(texto: str) -> float:
    """Acepta 14.002,45 (Argentina) y 14,002.45 (como sale del PDF)."""
    texto = texto.strip()
    if re.fullmatch(r"-?\d{1,3}(\.\d{3})*,\d+", texto):  # 1.234.567,89
        return float(texto.replace(".", "").replace(",", "."))
    return float(texto.replace(",", ""))  # 1,234,567.89


def leer(ruta: Path) -> dict:
    lineas = ruta.read_text(encoding="utf-8").splitlines()
    datos: dict = {"archivo": ruta.stem, "conceptos": []}

    for linea in lineas:
        if "Funci" in linea and "Sueldo B" in linea:
            coincidencia = FUNCION.search(linea)
            if coincidencia:
                datos["funcion"] = coincidencia.group(2).strip()
            basico = SUELDO_BASICO.search(linea)
            if basico:
                datos["sueldo_basico"] = a_numero(basico.group(1))
        if "Per" in linea and "odo Liquidado" in linea:
            coincidencia = PERIODO.search(linea)
            if coincidencia:
                datos["periodo"] = coincidencia.group(1)
        coincidencia = LINEA_CONCEPTO.match(linea.strip())
        if coincidencia:
            datos["conceptos"].append(
                {
                    "codigo": coincidencia.group("codigo"),
                    "nombre": coincidencia.group("nombre").strip(),
                    "um": coincidencia.group("um"),
                    "uc": a_numero(coincidencia.group("uc")),
                    "importe": a_numero(coincidencia.group("importe")),
                }
            )
    return datos


def resumen(datos: dict) -> None:
    conceptos = datos["conceptos"]
    if not conceptos:
        return
    buscar = lambda codigo: next((c for c in conceptos if c["codigo"] == codigo), None)
    basico = buscar("007-20") or buscar("005-20")
    print(f"\n=== {datos['archivo']} | {datos.get('periodo', '?')} | {datos.get('funcion', '?')}")
    if datos.get("sueldo_basico"):
        print(f"    sueldo básico por hora/cargo: {datos['sueldo_basico']:>14,.2f}")
    if basico:
        print(
            f"    {basico['nombre'][:34]:<34} uc={basico['uc']:<5} importe={basico['importe']:>14,.2f}"
            f"  (por unidad {basico['importe'] / basico['uc']:>12,.2f})"
        )
    for codigo in ("100-22", "100-20", "100-23", "099-41", "090-11", "100-26", "100-24", "100-25"):
        concepto = buscar(codigo)
        if not concepto:
            continue
        print(
            f"    {codigo} {concepto['nombre'][:34]:<34} um={concepto['um']} uc={concepto['uc']:<6}"
            f" importe={concepto['importe']:>14,.2f}"
        )


def main() -> int:
    carpeta = Path(sys.argv[1] if len(sys.argv) > 1 else ".tmp-lectura/recibos")
    for ruta in sorted(carpeta.glob("*.txt")):
        if any(x in ruta.name for x in ("estatuto", "decreto", "Decreto", "INSTRUCTIVO", "Nuevos_Adicionales", "Boletin")):
            continue
        resumen(leer(ruta))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
