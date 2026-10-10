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

### La composición del neto

Lo que se quiere visibilizar es **cuánto del neto es remunerativo y cuánto no remunerativo**. Como
los dos conceptos son valores **del bruto** y los descuentos salen del bruto, para compararlos
contra el neto se calcula la tasa de descuento y se le aplica pareja a los dos:

```
tasa = (bruto − neto) / bruto

remunerativo neto    = remunerativos     × (1 − tasa)
no remunerativo neto = no remunerativos  × (1 − tasa)
```

Así los dos importes que se muestran **suman el neto** y sus porcentajes dan **100%**. Y como la
tasa es la misma para los dos, la proporción entre ellos queda igual a la del bruto.

Con los datos de ejemplo (dos cargos, 18 y 12 hs, zona 20%, antigüedad 5 años, con aguinaldo de
junio):

| | Importe | |
|---|---|---|
| Remunerativos (bruto) | $ 1.170.477,36 | |
| No remunerativos (bruto) | $ 741.950,92 | |
| **Bruto** | **$ 1.912.428,28** | |
| Descuentos | $ 227.425,77 | tasa **11,9%** del bruto |
| **Neto del mes** | **$ 1.685.002,51** | |

| Concepto | Importe neto | Sobre el neto |
|---|---|---|
| Remunerativos | $ 1.031.284,32 | **61,2%** |
| No remunerativos | $ 653.718,20 | **38,8%** |
| **Suma** | **$ 1.685.002,52** | **100%** |
| Descuentos (repartidos arriba) | $ 227.425,77 | — |
| Aguinaldo (SAC), aparte | $ 474.043,33 | 28,1% |
| **Total de bolsillo (con aguinaldo)** | **$ 2.159.045,85** | |

(La suma da un centavo más que el neto por redondeo de los dos importes mostrados.)

El aguinaldo no integra el sueldo del mes, así que no entra en la composición: se informa aparte.

**Ojo con una cosa:** en el recibo real los descuentos de ley se calculan sobre el remunerativo, no
repartidos entre los dos. Acá se reparten a propósito, porque es la única forma de que los dos
importes mostrados sumen el neto y se puedan comparar contra él. La página lo aclara con una nota,
para que no parezca un error.

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
