# Calculadora de sueldos docentes de San Luis

Resumen de cambios, dudas pendientes y estado del código. 2 de octubre de 2026.

## En dos palabras

La calculadora es una herramienta gratuita y sin fines de lucro que estima el
sueldo de bolsillo de un docente de la provincia y lo compara contra la
inflación. Hoy calcula **varios cargos a la vez** (los suma en un solo recibo,
con el descuento de ley aplicado una sola vez, como en la liquidación real),
cubre **quince cargos** de inicial, primaria, secundaria y nivel superior, y
muestra el **desglose por cargo**.

Todos los valores salen de los decretos, los instructivos de pre-liquidación y
los recibos de sueldo, no de estimaciones. Cada número importante tiene un test
que lo compara contra el papel del que salió: si alguien toca una fórmula, el
test falla y obliga a volver al documento. Hoy son 105 tests y todos pasan.

## Qué se hizo en estas semanas

- **Varios cargos juntos.** El formulario pasó de un cargo a una lista: se agregan
  y se quitan puestos, cada uno con su nivel, su tipo, su zona, sus horas y su
  presentismo. Los descuentos de ley y los seguros se aplican una sola vez sobre
  el total, y hay una tabla de desglose que muestra cuánto aporta cada cargo.

- **Cinco cargos nuevos.** Asesor/a Pedagógico (417 puntos, 490.745,35 de básico
  en julio 2026), Maestrx de Educación Especial Inicial (258p), Auxiliar docente
  (217p, va en inicial y en primario), Maestrx Especial de Jardín (183p) y Prof.
  Dedicación Simple de 10 horas del IFDC.

- **Enseñanza en el aula, con la regla del decreto.** El ítem es proporcional a
  las horas reloj frente a alumnos: 6.250 por hora. Eso da 125.000 para maestrx
  de grado (20 horas), 93.750 para jardín (15) y 43.750 para especial de jardín
  (7). Antes el jardín cobraba 125.000 (el monto de grado) y el maestro celador
  lo cobraba sin que le corresponda.

- **Valores corregidos contra los recibos.** La suma no remunerativa
  (4.667,48333 por unidad, con la que el preceptor da exacto 65.973,47 y grado
  70.000), el FONID de enero 2025, el seguro social (100) y el mutual (10) que
  faltaba, el adicional por dedicación del superior (35% en agosto y septiembre),
  y los porcentajes de septiembre del IFDC (75/20 en lugar de 70/25).

- **Los seguros dejaron de ser un número fijo.** El seguro obligatorio cambia con
  los aumentos, así que ahora está cargado mes a mes. Se armó con 37 recibos de
  2024 a 2026.

## Lo que no estamos seguros y necesitamos recibos

| Qué falta confirmar | Por qué importa | Qué recibo lo resuelve |
| --- | --- | --- |
| Los porcentajes de los complementos del IFDC en octubre 2026 | Hoy usa 70/25. En septiembre pasaron a 75/20 (el total sigue siendo 95%, cambia el reparto entre remunerativo y no remunerativo, y eso mueve el bolsillo) | Un recibo del IFDC de octubre 2026 (cualquier cargo) |
| Los porcentajes de primaria y secundaria de septiembre y octubre 2026 | Hoy usa 140/97 desde julio. Si el mismo decreto que cambió el reparto en el superior también lo cambió en obligatoria, los números de esos meses están mal | Un recibo de maestrx de grado o de horas cátedra de septiembre u octubre |
| El seguro obligatorio de marzo, abril, mayo, julio y octubre 2026 | Están deducidos, no leídos: el valor sube 223,87 en los meses de aumento. Los verificados son enero, febrero, junio, agosto y septiembre | Un recibo de cualquiera de esos meses |
| El cargo de Asesor/a Pedagógico | No tenemos ningún recibo. El básico sale del instructivo, pero el resto de los ítems (FONID, suma no remunerativa, adicional) se asumieron iguales a los del resto de los cargos | Un recibo de asesor/a pedagógico |
| Otras dedicaciones simples del IFDC (6, 12 o 20 horas) | Cada una necesita su propio coeficiente: para 10 horas la relación con el cargo de 30 horas no es la de las horas, así que no se puede deducir | Recibos de esos cargos |
| El aguinaldo estimado | La estimación da 1,1% arriba del recibo de junio 2026 (898.396 contra 888.413,77) | Un recibo con aguinaldo (junio o diciembre) |
| El bono de mayo 2026 en los cargos | Hoy el preceptor lo multiplica por su coeficiente y el resto de los cargos por 15. Una de las dos reglas está mal | Un recibo de mayo 2026 de un cargo (no de horas) |
| El "complemento compensador" (código 100-26) | Aparece en algunos recibos de horas cátedra (544,67 por 3 horas) y no está modelado | Un recibo de horas cátedra que lo traiga |
| Los decretos que no están en la carpeta | Son la única fuente de dos cambios ya cargados | El decreto que movió los tramos de aumento a septiembre y octubre, y el que cambió los complementos del superior en septiembre |
| La etiqueta "Prof. full time, 40 hs." | El coeficiente del cargo es 35/30 y el recibo de junio lo confirma, así que el cargo sería de 35 horas | El nombre de la función en un recibo de full time |
| La asignación por hijxs | No está habilitada porque faltan los parámetros provinciales | Un recibo con asignación por hijxs de distinta cantidad de hijos |
| Otros cargos que faltan | Jornada completa (327p), escuela especial (258p y 272p), secretario, bibliotecario, director y vicedirector, regente, y las horas del nivel terciario | Recibos de esos cargos |

## Cómo está el código, en simple

El proyecto está separado en cuatro partes, y esa separación es lo que permite
verificar los números:

- **Los datos** (**src/historial.ts**): los valores de cada mes (básico de la hora
  cátedra, porcentajes de los complementos, FONID, sumas fijas, seguros). Es una
  tabla: cada mes tiene su fila y su fuente.

- **El motor de cálculo** (**src/cargos.ts**), y es puro: recibe los valores del mes
  por parámetro y devuelve números, sin leer ni escribir la pantalla. Por eso se
  puede probar solo, sin navegador, y por eso los tests pueden comparar cada ítem
  contra un recibo.

- **La pantalla** (**src/funciones.ts** y **src/formulario.ts**): lee el formulario,
  dibuja las tarjetas de cada cargo y muestra los resultados. Ahí no hay cuentas.

- **La red de seguridad** (la carpeta **tests/**): 105 tests en seis archivos. Los
  que más sirven son los de **tests/instructivos.test.ts**, que replican ítem por
  ítem los ejemplos de los instructivos y los recibos reales.

**Agregar un cargo es cargar dos cosas**: su coeficiente (el básico del cargo
dividido el básico de la hora cátedra) y su definición (nivel, etiqueta, si lleva
horas, zona y presentismo). El motor y la pantalla se acomodan solos.

**Lo que falta de limpieza**, en orden de importancia:

- **Redondear a dos decimales** cada concepto antes de sumar. Hoy los totales
  pueden diferir en centavos de la suma de los ítems mostrados.

- **Los ayudantes del historial mienten en silencio**: si se pide un mes que no
  existe, devuelven el último cargado sin avisar. Deberían avisar.

- **Borrar los dos archivos sueltos de JavaScript viejo** (js/main1.js y
  js/funcionesCalculo.js): son una copia obsoleta del motor, con precios de 2025.
  No se usan, pero son una trampa.

- **Sacar del repositorio la carpeta compilada** (dist/) y la dependencia de Gulp,
  que no se usa.

- **Los límites del comparador de inflación** están escritos a mano y ya quedaron
  viejos: conviene derivarlos del historial.

## Cómo se corre y se verifica

- npm test (105 tests)
- npm run typecheck
- npm run build

Y para verla en la computadora hace falta un servidor local (por ejemplo
`python -m http.server`), porque los módulos no cargan abriendo el archivo
directamente.

## Cómo ayudar

Si tenés un recibo de alguno de los cargos o meses de la lista de arriba, sirve
muchísimo. Se puede mandar con el nombre y el CUIL tachados: lo que importa son
los conceptos y los importes. Cada recibo que llega se convierte en un test, así
que el número queda verificado para siempre.
