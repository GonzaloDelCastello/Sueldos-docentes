# Verificación de valores contra los documentos de julio 2026

Revisión de los importes de la calculadora contra los papeles oficiales y los
recibos reales. Se hizo al agregar el cargo de Asesor/a Pedagógico, para no
sumar un cargo nuevo sobre valores que no cerraban.

**Documentos usados** (están en `docs/Decretos/` y `docs/Recibos/`):

- Instructivo de pre-liquidación de julio 2026.
- Decreto N° 8583-MHIP-2026, del 25 de julio de 2026 (boletín del 31/07).
- Decreto N° 3864-MHIP-2026, de abril de 2026 (adicional "Enseñanza en Aula").
- Recibos de sueldo de 2024 a junio de 2026 (propios y compartidos).

Los valores de cada documento quedaron como test en `tests/instructivos.test.ts`.
Si alguien toca una fórmula, el test falla y obliga a volver al papel.

---

## Lo que está bien

- **Porcentajes de los complementos.** El Decreto 8583 fija, desde julio 2026,
  complemento remunerativo 140% y no remunerativo 97% para inicial, primaria y
  secundaria (art. 2), y 70% y 25% para los Institutos de Educación Superior
  (art. 3). La calculadora ya usaba esos valores, y el cambio no mueve la plata:
  reparte distinto el mismo total (1,30 + 1,07 = 1,40 + 0,97).
- **Adicional por cargo: 33% del básico.** Verificado al centavo en el recibo de
  maestrx de grado de julio 2025 y en el del preceptor de noviembre 2025.
- **FONID provincial: 28.700 por cargo y 1.913,3333 por hora cátedra** (28.700
  dividido 15), según el art. 4 del decreto. Coincide con todos los recibos.
- **Antigüedad y zona** se calculan como porcentaje del básico. El recibo de
  febrero 2026 lo confirma: 10 años = 50%, zona 80%.
- **Descuentos de ley: 11% + 2% + 6% = 19%** sobre el remunerativo. Los tres
  coinciden al centavo con los recibos (julio 2025, febrero 2026, junio 2026).
- **Coeficientes de los cargos.** Los básicos que calcula la calculadora se
  comparan contra la tabla de puntos del instructivo de julio y contra la tabla
  de abril del Decreto 3864. Las diferencias son de pocos pesos, por el redondeo
  de los coeficientes.
- **El ejemplo de maestrx de grado del instructivo cierra ítem por ítem**
  (básico, 33%, 140%, total remunerativo, 97%, total no remunerativo, 13%, 3%,
  3% y neto). Ojo: ese ejemplo no cuenta el FONID, pero el recibo sí lo paga.

## Lo que estaba mal, y se corrigió

1. **Suma no remunerativa.** Estaba cargada como 4.667,33333 y el valor de los
   recibos es **4.667,48333** (14.002,45 por 3 horas, igual en 2025 y 2026, y
   28.004,90 por 6 horas). Es el mismo número para todos los cargos porque se
   multiplica por hora o por coeficiente del cargo: con 4.667,48333 el preceptor
   da 65.973,47 y el maestrx de grado 70.000,01, que son los dos valores que
   muestran los recibos.

2. **Enseñanza en el aula.** El Decreto 3864 no le pone un monto a cada cargo:
   publica cuántas horas reloj frente a alumnos tiene cada función y cuánto se
   paga por hora. El ítem es proporcional a esas horas (ver la sección de abajo).
   Estaba mal:
   - Maestrx de grado: 20 horas reloj, 125.000. Estaba bien.
   - Maestrx de jardín: **15 horas reloj, 93.750**. La calculadora le pagaba
     125.000 siempre, sin mirar el selector de presentismo.
   - Maestrx celador: **no cobra el ítem** (el cargo 259p no figura en el
     decreto). La calculadora se lo pagaba.
   - Asesor/a pedagógico: tampoco lo cobra.

3. **Seguros de recibo.** El social son **100** (no 110), faltaba el **mutual de
   10**, y el obligatorio estaba con el valor de julio 2025 (4.312,73) cuando en
   febrero 2026 ya era 4.701,21 y en junio 2026, 4.925,07.

4. **FONID de enero 2025.** Estaba cargado como 28.700 "por hora", así que 3
   horas daban 86.100. El recibo muestra 5.740 para 3 horas: el valor siempre fue
   por hora (1.913,3333). Ese mes no se puede elegir desde la pantalla, pero el
   dato quedaba como trampa.

### Una corrección que no había que hacer

Durante esta revisión se bajaron los valores de septiembre y octubre de 2026
porque el Decreto N° 8583-MHIP-2026 pone los tramos del 5% en febrero, abril,
julio, agosto, octubre y noviembre, y septiembre no aparecía. **Estaba mal**:
hay un decreto posterior, que no está en este repositorio, que movió los tramos
de octubre y noviembre a septiembre y octubre. Los valores que ya estaban
cargados (19.276,625 y 20.047,69 la hora cátedra) eran los correctos, y quedaron
así.

Moraleja para la próxima: el decreto que fija un calendario de aumentos no
alcanza como fuente. Conviene guardar también el decreto que lo modifica.

## Enseñanza en el aula: es proporcional a las horas

El Decreto N° 3864-MHIP-2026 publica, para cada función, la carga horaria y el
monto del ítem 100-27. El monto es siempre **horas reloj frente a alumnos por
6.250**, y el instructivo de julio 2026 aclara que el concepto no se modifica.

| Horas reloj | Monto | Función de ejemplo |
| --- | --- | --- |
| 35 | 218.750 | Maestrx de grado jornada completa (327p) |
| 25 | 156.250 | Grado de escuela asistencial (266p) |
| 20 | 125.000 | Maestrx de grado (226p) |
| 15 | 93.750 | Jardín y auxiliar de jardín (229p) |
| 10 | 62.500 | Especiales con 15 horas cátedra |
| 7 | 43.750 | Especiales con 10 horas cátedra |

Las horas cátedra de 40 minutos se convierten a horas reloj: 15 horas cátedra son
10 horas reloj, y 10 horas cátedra son 7.

En el código, el monto no está escrito a mano por cargo: sale de
`montoEnseñanzaEnAula(tipo)`, que multiplica las horas de la tabla por el valor
de la hora. Así, si un cargo cambia de horas, el ítem acompaña.

### Revisión de los cargos de nivel inicial

Funciones de nivel inicial que aparecen en el decreto:

| Función | Puntos | Horas reloj | Ítem | ¿Está en la calculadora? |
| --- | --- | --- | --- | --- |
| Maestra Educ. Especial Nivel Inicial | 258 | 20 | 125.000 | No |
| Maestro/a de Jardín | 229 | 15 | 93.750 | Sí |
| Maestro/a Auxiliar de Jardín | 229 | 15 | 93.750 | Sí, en el mismo cargo: el decreto les da la misma función y el mismo monto |
| Auxiliar docente (inicial/primario) | 217 | 15 | 93.750 | No |
| Maestro/a Especial de Jardín | 183 | 7 | 43.750 | No |

Hoy la calculadora cubre solo el cargo de jardín (y su auxiliar, que comparte
valor). Las otras tres funciones quedan pendientes de agregar: los básicos están
en la tabla de puntos del instructivo de julio, así que se pueden sumar cuando
se quiera.

## Lo que queda por confirmar

- **Guardar el decreto que movió los tramos a septiembre y octubre.** El archivo
  no está en el repositorio y es la única fuente de esos dos meses.
- **El seguro obligatorio de julio a octubre 2026.** El último recibo disponible
  es de junio (4.925,07) y ese valor cambia con el tiempo. La otra calculadora
  usa 5.372,81, pero no se sabe de qué mes sale. Conviene actualizarlo con un
  recibo de julio o agosto.
- **El asesor/a pedagógico no tiene recibo de sueldo.** El instructivo de julio
  publica su básico (490.745,35 para 417 puntos) y de ahí sale el coeficiente
  27,671789. El resto de los ítems se calcularon con la misma estructura que el
  resto de los cargos, que es lo que muestran todos los recibos. Falta
  confirmarlo con un recibo real.
- **El aguinaldo.** El recibo de junio 2026 muestra 888.413,77 de SAC y la
  estimación de la calculadora da 898.396 (1,1% arriba). Sigue pendiente.
- **El "complemento compensador" (100-26)** que aparece en algunos recibos de
  horas cátedra no está modelado.

## Herramientas que se agregaron

- `tools/leer-pdf.py`: pasa un PDF a texto, para poder leerlo y compararlo.
- `tools/leer-office.py`: lo mismo para un `.docx`.
- `tools/leer-pdfs-carpeta.py`: pasa todos los PDF de una carpeta.
- `tools/comparar-recibos.py`: arma una tabla con los ítems de cada recibo.
  Ojo: el texto que sale de estos PDF trae los números al revés de como se ven
  (`278,470.20` en lugar de `278.470,20`), y el script contempla los dos formatos.
