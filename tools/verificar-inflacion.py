"""
Verifica los valores de inflacion cargados a mano contra la serie oficial del INDEC.

Por que existe: el comparador de salario contra inflacion se apoya en 39 numeros
escritos a mano en src/inflacion.ts. Un solo valor equivocado desvia todo el
resultado acumulado, y no habia ninguna forma de detectarlo. Ya nos paso: junio
de 2026 estaba cargado tres veces.

Este script baja la serie oficial del IPC nivel general nacional (base diciembre
de 2016) desde la API publica de datos.gob.ar, calcula la variacion mensual, y la
compara contra lo que dice el archivo del proyecto.

Uso:
    python tools/verificar-inflacion.py

Sale con codigo 1 si hay diferencias. Necesita conexion a internet.
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARCHIVO_INFLACION = RAIZ / "src" / "inflacion.ts"
ARCHIVO_CANASTA = RAIZ / "src" / "canastaBAte.ts"

# Serie oficial: IPC. Nivel General Nacional. Base diciembre 2016. Mensual.
URL_SERIE = (
    "https://apis.datos.gob.ar/series/api/series/"
    "?ids=148.3_INIVELNAL_DICI_M_26&format=json&limit=1000"
)

# Tolerancia en puntos porcentuales. Los valores del proyecto estan redondeados
# a un decimal, asi que medio punto de diferencia es razonable.
TOLERANCIA = 0.05


def bajar_serie_oficial() -> dict[str, float]:
    """Devuelve la variacion mensual del IPC por mes, en porcentaje."""
    # La API rechaza los pedidos sin User-Agent (devuelve 403).
    pedido = urllib.request.Request(
        URL_SERIE,
        headers={"User-Agent": "Mozilla/5.0 (verificador de datos del proyecto)"},
    )
    with urllib.request.urlopen(pedido, timeout=30) as respuesta:
        datos = json.load(respuesta)

    # La respuesta viene como lista de pares [fecha, indice].
    indices: list[tuple[str, float]] = [
        (fecha[:7], valor) for fecha, valor in datos["data"]
    ]

    variaciones: dict[str, float] = {}
    for anterior, actual in zip(indices, indices[1:]):
        mes_anterior, valor_anterior = anterior
        mes, valor = actual
        if valor_anterior:
            variaciones[mes] = (valor / valor_anterior - 1) * 100
    return variaciones


def leer_inflacion_del_proyecto() -> list[tuple[str, float]]:
    """Extrae los pares fecha/valor de src/inflacion.ts, en orden."""
    texto = ARCHIVO_INFLACION.read_text(encoding="utf-8")
    patron = re.compile(
        r'\{\s*fecha:\s*"(\d{4}-\d{2})"\s*,\s*inflacionMensual:\s*([\d.]+)\s*\}'
    )
    return [(m.group(1), float(m.group(2))) for m in patron.finditer(texto)]


def leer_canasta_del_proyecto() -> list[tuple[str, float]]:
    """Extrae los pares fecha/valor de src/canastaBAte.ts, en orden."""
    texto = ARCHIVO_CANASTA.read_text(encoding="utf-8")
    patron = re.compile(
        r'\{\s*fecha:\s*"(\d{4}-\d{2})"\s*,\s*canastaBasica:\s*([\d.]+)\s*\}'
    )
    return [(m.group(1), float(m.group(2))) for m in patron.finditer(texto)]


def control_cruzado_canasta(
    canasta: list[tuple[str, float]], oficial: dict[str, float]
) -> int:
    """
    La canasta basica es una serie distinta del IPC, asi que no se compara por
    igualdad. Se controla que su crecimiento sea razonable frente al IPC: si una
    canasta de consumo crece muy distinto que el indice general, alguna de las
    dos series esta mal.
    """
    if not canasta:
        print("  No se pudieron leer los valores de la canasta.")
        return 1

    meses = [mes for mes, _ in canasta if mes in oficial]
    if len(meses) < 2:
        print("  No hay suficientes meses de canasta dentro de la serie oficial.")
        return 1

    primero, ultimo = meses[0], meses[-1]
    valores = dict(canasta)

    crecimiento_canasta = (valores[ultimo] / valores[primero] - 1) * 100

    # Ojo: 'oficial' guarda variaciones mensuales, no niveles del indice.
    # Para comparar contra el crecimiento de la canasta hay que acumularlas.
    acumulado = 1.0
    for mes in meses[1:]:
        acumulado *= 1 + oficial[mes] / 100
    crecimiento_ipc = (acumulado - 1) * 100

    print(f"  meses de canasta: {len(canasta)}  ({primero} a {ultimo})")
    print()
    print(f"    crecimiento de la canasta {primero} a {ultimo}: {crecimiento_canasta:8.2f} %")
    print(f"    inflacion del IPC en el mismo periodo:        {crecimiento_ipc:8.2f} %")
    print(
        f"    diferencia:                                   "
        f"{crecimiento_canasta - crecimiento_ipc:+8.2f} puntos"
    )

    # Discrepancia mensual maxima entre la variacion de la canasta y la del IPC.
    peor_diferencia, peor_mes = 0.0, ""
    for (mes_a, valor_a), (mes_b, valor_b) in zip(canasta, canasta[1:]):
        if mes_a not in oficial or mes_b not in oficial:
            continue
        variacion_canasta = (valor_b / valor_a - 1) * 100
        variacion_ipc = oficial[mes_b]
        diferencia = variacion_canasta - variacion_ipc
        if abs(diferencia) > abs(peor_diferencia):
            peor_diferencia, peor_mes = diferencia, mes_b

    print()
    print(f"    mayor discrepancia mensual: {peor_diferencia:+.2f} puntos en {peor_mes}")
    print()

    if abs(crecimiento_canasta - crecimiento_ipc) > 15:
        print("  ATENCION: la canasta y el IPC se separaron mas de 15 puntos.")
        print("  Revisar de donde salieron los valores de la canasta.")
        return 1

    print("  La canasta se mueve de forma consistente con el IPC.")
    return 0


def main() -> int:
    print("Bajando la serie oficial del INDEC...")
    try:
        oficial = bajar_serie_oficial()
    except Exception as error:
        print(f"  No se pudo bajar la serie: {error}")
        return 2
    print(f"  {len(oficial)} meses de serie oficial disponibles.")

    proyecto = leer_inflacion_del_proyecto()
    print(f"  {len(proyecto)} meses cargados en {ARCHIVO_INFLACION.name}.")

    print()
    print("  MES      PROYECTO   INDEC    DIFERENCIA")
    print("  -------  ---------  -------  ----------")

    diferencias: list[str] = []
    for mes, valor_proyecto in proyecto:
        valor_oficial = oficial.get(mes)
        if valor_oficial is None:
            print(f"  {mes}  {valor_proyecto:8.1f}   {'sin dato':>7}   (fuera de la serie)")
            continue

        diferencia = valor_proyecto - valor_oficial
        marca = ""
        if abs(diferencia) > TOLERANCIA:
            marca = "  <-- REVISAR"
            diferencias.append(mes)
        print(
            f"  {mes}  {valor_proyecto:8.1f}   {valor_oficial:7.2f}  "
            f"{diferencia:+9.2f}{marca}"
        )

    # Inflacion acumulada de todo el rango, con cada conjunto de datos.
    def acumulada(pares) -> float:
        total = 1.0
        for _, valor in pares:
            total *= 1 + valor / 100
        return (total - 1) * 100

    proyecto_completo = acumulada(proyecto)
    oficial_completo = acumulada(
        [(mes, oficial[mes]) for mes, _ in proyecto if mes in oficial]
    )

    print()
    print("  Inflacion acumulada de todo el rango cargado:")
    print(f"    con los datos del proyecto: {proyecto_completo:8.2f} %")
    print(f"    con los datos oficiales:    {oficial_completo:8.2f} %")
    print(f"    desvio:                     {proyecto_completo - oficial_completo:+8.2f} puntos")
    print()

    if diferencias:
        print(f"  RESULTADO: {len(diferencias)} meses para revisar.")
        print(f"  Meses: {', '.join(diferencias)}")
        return 1

    print("  RESULTADO: todos los valores coinciden con la serie oficial.")

    print()
    print("Control cruzado de la canasta basica")
    print()
    return control_cruzado_canasta(leer_canasta_del_proyecto(), oficial)


if __name__ == "__main__":
    sys.exit(main())
