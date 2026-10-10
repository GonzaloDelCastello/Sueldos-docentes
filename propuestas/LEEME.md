# Prototipo: dos formas de mostrar el resultado de la calculadora

Documento de trabajo. **No forma parte del sitio**: es una página suelta para comparar dos
propuestas de diseño antes de tocar la calculadora.

## Cómo verlo

```bash
python -m http.server 4321
```

Y abrir `http://127.0.0.1:4321/propuestas/opciones-resultado.html`. Se ve mejor en un ancho de
celular: las dos opciones están pensadas para 360-390 px.

El prototipo **usa el motor de cálculo real**: importa `inicializarCalculadora` de `dist/funciones.js`
y vuelca los importes en los dos diseños. No hay ningún número escrito a mano. El botón
«Recalcular con otros datos» vuelve a correr el cálculo, así se puede ver cómo se comportan los
diseños con otros montos.

## Opción A · Total protagonista + fichas

- El monto de bolsillo en grande, con el rótulo chico arriba.
- Cuatro fichas plegables con **el subtotal siempre a la vista**, sus porcentajes, y el detalle
  adentro.

Resuelve el problema de que hoy todas las secciones plegables tienen el mismo peso visual: con el
subtotal y sus porcentajes en el encabezado se entiende el armado sin abrir nada.

### El aguinaldo no integra el sueldo del mes

El aguinaldo es el **sueldo anual complementario**, que se paga en dos cuotas al año. **No forma
parte del neto del mes**: es un pago aparte. Por eso no entra en ninguna de las dos composiciones y
se informa sólo como porcentaje del neto, donde se lee bien porque equivale a medio sueldo.

Confundir esto fue el error que hubo que corregir dos veces, y conviene tenerlo presente:

- El **«total de bolsillo» que muestra la calculadora incluye el aguinaldo** en los meses en que se
  cobra ($ 2.159.045,85 con aguinaldo contra $ 1.685.002,51 de neto del mes). Usarlo como base para
  los porcentajes hacía que los tres conceptos del mes sumaran 78% en vez de 100%.
- El neto del mes es **bruto menos descuentos**, no el total de bolsillo.

### Qué se muestra

**Los importes no se tocan: son los del recibo** (valores brutos). Lo que se agrega son porcentajes
en dos niveles:

- **En el encabezado de cada concepto** (remunerativos, no remunerativos, aguinaldo): qué parte
  **del neto** aporta ese concepto, aclarado en el texto.
- **Dentro de cada desplegable**: el porcentaje de ese concepto **sobre el bruto**.
- **En el bloque de totales**: el **neto en su propia línea, arriba** del bruto y los descuentos.
  Aunque el neto ya esté en el total de bolsillo, verlo ahí le saca la duda a quien no sepa qué es
  neto y qué es bruto.

### Los dos porcentajes del encabezado suman 100%

Lo que se quiere mostrar es **qué parte del neto es remunerativa y qué parte no remunerativa**, y
las dos juntas tienen que dar 100%, porque entre las dos forman el neto.

La clave es **de dónde salen los descuentos**: salen del **remunerativo**, que es como se liquidan
de verdad (en `cargos.ts`, las alícuotas de jubilación, reg. esp., obra social y sindical se aplican
sobre el total remunerativo). Lo no remunerativo no tiene retenciones.

```
neto remunerativo    = remunerativos − descuentos
neto no remunerativo = no remunerativos            (sin retenciones)
porcentaje           = neto del concepto / neto del mes
```

Con un ejemplo simple se ve por qué da distinto que el porcentaje del bruto:

```
R: 60   NR: 40   descuento: 10 sobre un bruto de 100
Neto: 90, y de ese neto aportan 50 lo remunerativo y 40 lo no remunerativo
→ R = 55,6% del neto   y   NR = 44,4% del neto      (suman 100%)
```

Mientras que **sobre el bruto** la proporción es 60% y 40%. El remunerativo aporta **menos** al neto
que al bruto, justamente porque es el que paga los descuentos.

**Ojo con un error fácil de cometer:** si en vez de restarle los descuentos al remunerativo se los
prorratea entre los dos conceptos, la cuenta se cancela y devuelve exactamente el mismo número que
el porcentaje del bruto:

```
(importe × neto/bruto) / neto  =  importe / bruto
```

Los dos valores quedarían idénticos, que es justamente lo que no tiene que pasar.

**El aguinaldo queda afuera de esa cuenta.** Es el sueldo anual complementario y se paga aparte, no
integra el neto del mes, así que se mide contra el neto sin descontarle nada.

Con los datos de ejemplo (dos cargos, 18 y 12 hs, zona 20%, antigüedad 5 años, con aguinaldo de
junio):

| | Importe | Aporta al neto | Encabezado | Adentro |
|---|---|---|---|---|
| Remunerativos | $ 1.170.477,36 | $ 943.051,59 | **56,0% del neto** | 61,2% del bruto |
| No remunerativos | $ 741.950,92 | $ 741.950,92 | **44,0% del neto** | 38,8% del bruto |
| **Suma** | | **$ 1.685.002,51** | **100,0%** | **100,0%** |
| **Bruto** | **$ 1.912.428,28** | | | |
| Descuentos | $ 227.425,77 | (todos del remunerativo) | | |
| Aguinaldo (SAC) de bolsillo | $ 474.043,33 | | 28,1% del neto | — |
| **Total de bolsillo** | **$ 2.159.045,85** | | | (neto del mes + aguinaldo) |

Los dos porcentajes del encabezado suman 100% y los dos aportes suman el neto del mes exacto. El
remunerativo aporta **menos** al neto (56,0%) que al bruto (61,2%), porque es el que paga los
descuentos. En el recibo de septiembre 2026 la diferencia es más grande todavía, porque ahí los
descuentos pesan más: 69,6% del neto contra 74,8% del bruto.

Dentro de los desplegables, cada ítem lleva su porcentaje del bruto, y **esos sí suman 100%**:

| Ítem | Importe | Del bruto |
|---|---|---|
| Sueldo Básico | $ 508.903,20 | 26,6% |
| Complemento Remunerativo | $ 661.574,16 | 34,6% |
| Complemento No Remunerativo | $ 544.526,42 | 28,5% |
| Suma No Remunerativa | $ 140.024,50 | 7,3% |
| Incentivo Docente | $ 57.400,00 | 3,0% |
| **Suma** | | **100,0%** |

La ficha de Descuentos no lleva porcentaje: no es un concepto que componga el bruto.

### Por qué no hay barra de proporciones

La primera versión de la Opción A tenía una barra que decía «Queda en el recibo 88% · Descuentos
12%». Se sacó porque **medía otra cosa que las fichas**: ese 12% era sobre el bruto, mientras las
fichas dicen 13,5% sobre el neto y 11,9% sobre el bruto. Tres números distintos para lo mismo
confunden más de lo que explican.

Si más adelante se quiere una barra, conviene que muestre la composición del neto con los mismos
números que las fichas (69,5 + 30,5 = 100), y no una medida aparte.

## Opción B · Recibo minimalista

- Fondo blanco, sin sombras, líneas finas entre conceptos.
- Rótulos en gris y montos en tipografía monoespaciada, alineados a la derecha y con aire.
- El neto destacado abajo, con una línea gruesa que lo separa.

Es la más parecida a un recibo de verdad y la que menos cansa la vista.

## Un detalle de implementación

**Los conceptos en cero no se muestran.** El motor escribe `$ 0.00` en los conceptos que no
corresponden al cargo y al mes. El prototipo los filtra para que la lista no se llene de ceros.

## Historia de los errores de cálculo

Quedan anotados porque son fáciles de repetir al implementarlo en el sitio:

1. **Los porcentajes sumaban 127%.** Se usaba como referencia el neto menos el aguinaldo. Pero los
   descuentos sí incluyen los del aguinaldo, así que quedaban medidos contra una base ajena.
2. **Los porcentajes sumaban 100% pero con el aguinaldo adentro de la composición.** El aguinaldo no
   es parte del sueldo del mes.
3. **Los porcentajes sumaban 78%.** Se usaba el total de bolsillo (que incluye el aguinaldo) como
   neto del mes.
4. **Los porcentajes sumaban 100% del bruto, no del neto.** Se mostraban sobre el bruto
   (61,2% + 38,8%), pero lo pedido era que sumaran 100% del neto. Como remunerativos + no
   remunerativos es el bruto por definición, la única forma de que sumen 100% del neto sin falsear
   los importes es restarle los descuentos al no remunerativo.
5. **Los descuentos se restaban enteros del no remunerativo.** Los porcentajes daban 100%, pero el
   importe que se mostraba en el encabezado no era el número del que salía el porcentaje
   ($ 741.950,92 contra los $ 514.525,15 que se usaban). Se pasó a repartir la tasa de descuento
   entre los dos, así el importe y su porcentaje hablan del mismo monto y los dos suman el neto.
6. **Se repartieron los descuentos entre los dos conceptos.** Los importes mostrados dejaban de ser
   los del recibo, y eso no era lo pedido. Ahora los importes quedan como están en el recibo y lo
   que se agrega son porcentajes: del neto en el encabezado y del bruto en cada ítem.
7. **El porcentaje del encabezado se medía sobre el importe bruto.** Daba 113,5% entre los dos
   conceptos, cuando lo que se quiere mostrar es qué parte del neto aporta cada uno. Ahora se le
   descuenta a cada concepto su parte proporcional de las retenciones, y los dos suman 100%.
8. **Se prorrateaban los descuentos entre los dos conceptos.** La cuenta se cancelaba y devolvía el
   mismo número que el porcentaje del bruto, así que los dos valores coincidían. Los descuentos
   salen del remunerativo, no repartidos: restándoselos solo a él, su aporte al neto baja y los dos
   números pasan a ser distintos.
