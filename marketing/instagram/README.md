# Placas de Instagram

Cuatro carruseles listos para publicar en la cuenta de ATEBA - Lista Roja N°4,
difundiendo el sitio `trabajadoresedu-sanluis.ar`.

Cada carpeta es **una publicación** y cada `placa-0N.png` es **una imagen de esa
publicación**: se suben juntas, en orden, y se ven deslizando. `_vista-previa.png`
es solo para mirar el carrusel completo de un vistazo (no se publica).

## Qué hay

| Publicación | Placas | De qué habla |
| --- | --- | --- |
| `carrusel-01-que-es-ateba` | 5 | Quiénes somos y qué herramientas hay en la web |
| `carrusel-02-calculadora-de-sueldos` | 5 | La calculadora: cargos, qué muestra y cómo se usa |
| `carrusel-03-sueldo-vs-inflacion` | 5 | La comparación del salario contra el IPC |
| `carrusel-04-recursos-y-colaboracion` | 5 | Normativa, portales oficiales y cómo colaborar |

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

### 1. Qué es ATEBA y qué hay en la web

> Entender el recibo de sueldo es un paso para defender nuestras condiciones
> laborales.
>
> Por eso construimos esta web: una calculadora de sueldos docentes de San Luis,
> una comparación del salario contra la inflación y un espacio de recursos y
> normativa. Todo gratis, sin fines de lucro y hecho por docentes.
>
> Entrá y guardala en favoritos 👉 trabajadoresedu-sanluis.ar
>
> #DocentesDeSanLuis #ATEBA #ListaRoja #AMET #SueldosDocentes #EducaciónPública
> #SanLuis #TrabajadoresDeLaEducación #TransparenciaSindical

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

## Una idea de calendario

Se pueden publicar uno por semana, en este orden: primero la presentación, después
la calculadora (que es la herramienta que más engancha), luego la comparación con
la inflación y al final recursos + convocatoria a colaborar.
