# Placas de Instagram

Cinco carruseles listos para publicar en la cuenta de ATEBA - Lista Roja N°4,
difundiendo el sitio `trabajadoresedu-sanluis.ar`.

Cada carpeta es **una publicación** y cada `placa-0N.png` es **una imagen de esa
publicación**: se suben juntas, en orden, y se ven deslizando. `_vista-previa.png`
es solo para mirar el carrusel completo de un vistazo (no se publica).

## Qué hay

| Publicación | Placas | De qué habla |
| --- | --- | --- |
| `carrusel-01-calculadora-novedades` | 5 | Lo nuevo que ya se puede calcular: pauta del último trimestre, cargos nuevos y lo que viene |
| `carrusel-02-calculadora-de-sueldos` | 5 | La calculadora: cargos, qué muestra y cómo se usa |
| `carrusel-03-sueldo-vs-inflacion` | 5 | La comparación del salario contra el IPC |
| `carrusel-04-recursos-y-colaboracion` | 5 | Normativa, portales oficiales y cómo colaborar |
| `carrusel-05-dentro-de-la-calculadora` | 5 | Qué hace la calculadora más allá del total: varios cargos, descuentos y desglose |

El carrusel 01 anterior —"Qué es ATEBA y qué hay en la web"— está en
`_historico-carrusel-01-presentacion-ateba/`. Se sacó de la serie el 2026-10-11:
la presentación de la agrupación quedó cubierta por la firma de cada placa, y ese
lugar del calendario rinde más anunciando lo que la herramienta ya permite hacer.
Las placas se conservan ahí porque el script las pisa al regenerar.

Todas las imágenes son de **1080 x 1350 px** (4:5), el formato vertical que más
espacio ocupa en el feed. La placa 5 de cada carrusel tiene el código QR del sitio.

## Cómo volver a generarlas

Si cambia un texto, una fecha o un dato, se edita el contenido en
`tools/generar-placas-instagram.py` (está todo junto, arriba de todo) y se corre:

```bash
python tools/preparar-assets-placas.py     # solo la primera vez: baja fuentes y qrcode
python tools/generar-placas-instagram.py
```

El script pisa las imágenes de `marketing/instagram/`. Los archivos que se bajan
(tipografías y la librería `qrcode`) quedan en `tools/placas/` y no se versionan.

## Textos sugeridos para las publicaciones

Están escritos para copiar y pegar. Se puede (y conviene) cambiarles el tono.

### 1. Novedades de la calculadora

> Esto ya lo podés calcular.
>
> La calculadora está actualizada a las liquidaciones informadas al 09/10/2026 e
> incluye la pauta del último trimestre: la suma fija no remunerativa de $100.000
> desde el sueldo de noviembre, y el bono de fin de año de $500.000, que se paga
> el viernes 4 de diciembre.
>
> Ojo con un detalle que confunde a muchxs: la suma fija y el bono se cobran una
> sola vez, por el cargo más grande. Sumar cargos no los multiplica; un cargo de
> 12 horas cobra el 80%.
>
> También sumamos los cargos que faltaban: Asesor/a Pedagógico (417p), Auxiliar
> docente (217p), Inicial completo y todo el Nivel Superior (IFDC), de 10 a 40 hs.
>
> Calculá tu mes 👉 trabajadoresedu-sanluis.ar
>
> #SueldosDocentes #DocentesDeSanLuis #ATEBA #ListaRoja #AMET #SalarioDocente
> #ParitariaDocente #BonoDeFinDeAño #SanLuis #EducaciónPública

### 2. Calculadora de sueldos

> ¿Cuánto deberías cobrar este mes?
>
> Cargás nivel, cargo, zona, antigüedad y el mes: la calculadora te muestra el
> total de bolsillo, el bruto, los descuentos de ley y el desglose ítem por ítem
> (incluido el SAC estimado).
>
> Funciona para Nivel Medio, Primario, Inicial y Superior (IFDC).
> Actualizada a valores de agosto–septiembre 2026.
>
> Calculá el tuyo 👉 trabajadoresedu-sanluis.ar
>
> #SueldosDocentes #CalculadoraSalarial #DocentesDeSanLuis #ATEBA #AMET
> #ListaRoja #ParitariaDocente #SalarioDocente

### 3. Sueldo vs inflación

> ¿Tu sueldo le ganó a la inflación?
>
> La herramienta cruza el aumento de la hora cátedra contra el IPC del INDEC en
> el período que elijas y te dice, en porcentaje, cuánto poder de compra ganaste
> o perdiste.
>
> Sin datos, la discusión salarial se discute a ciegas. Con datos, se reclama
> con fundamento.
>
> Compará tu período 👉 trabajadoresedu-sanluis.ar
>
> #Inflación #IPC #INDEC #SalarioDocente #PoderAdquisitivo #DocentesDeSanLuis
> #ATEBA #ListaRoja #AMET

### 4. Recursos y colaboración

> Normativa, formularios y portales oficiales, en un solo lugar.
>
> Estatuto Docente de San Luis, calendario escolar 2026, D.J. 02, L.R. 01 y los
> accesos directos al Ministerio, a la Junta de Clasificación y al portal de
> agentes de la administración pública.
>
> El sitio es gratuito y sin fines de lucro: se sostiene con el aporte de quienes
> lo usan. Si tu cargo no aparece o ves diferencias en el cálculo, mandanos una
> foto o PDF de tu recibo (podés tachar nombre y CUIL).
>
> Entrá, usala y compartila 👉 trabajadoresedu-sanluis.ar
>
> #RecursosDocentes #EstatutoDocente #DocentesDeSanLuis #ATEBA #ListaRoja #AMET
> #EducaciónPública #SanLuis

### 5. Qué hay dentro de la calculadora

> La calculadora hace más de lo que parece.
>
> Podés cargar todos tus cargos juntos —de distintos niveles y de distintas
> zonas— y el cálculo sale en una sola cuenta. Los descuentos de ley y los
> seguros fijos se aplican una sola vez sobre el total, igual que en el recibo,
> no cargo por cargo.
>
> Además te muestra el desglose por cargo, los porcentajes de cada grupo de
> conceptos contra el neto y el bruto, el SAC estimado aparte y los meses con
> bono o suma fija.
>
> Entrá desde el celular y probala con tus propios cargos 👉 trabajadoresedu-sanluis.ar
>
> #SueldosDocentes #CalculadoraSalarial #DocentesDeSanLuis #ATEBA #ListaRoja
> #AMET #Pluriempleo #SalarioDocente #SanLuis

## Una idea de calendario

Se pueden publicar uno por semana, en este orden:

1. **Novedades de la calculadora** — es lo que la gente quiere saber hoy: la suma
   fija, el bono y los cargos nuevos.
2. **Calculadora de sueldos** — cómo se usa, para quien llegó con la primera.
3. **Recursos y colaboración** — los trámites y la convocatoria a aportar recibos.
4. **Sueldo vs. inflación** — el comparador, que es lo más técnico y sostiene el
   reclamo.
5. **Qué hay dentro de la calculadora** — funciona mejor cuando ya hay audiencia
   que conoce la herramienta.

Ojo con el 3 y el 4: el comparador todavía dice medir "sueldos" cuando en realidad
mide el valor de la hora cátedra (ver `docs/backlog.md`, bloque 2b). Conviene
publicarlos después de corregir ese texto.
