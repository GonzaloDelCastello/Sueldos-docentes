# Muestra de sitio web para ASDE San Luis

Propuesta de diseño y desarrollo para **ASDE, Asociación Sindical de Docentes de San Luis**
(afiliada a CTERA y a la CTA). Es una **muestra de trabajo**: sirve para mostrar cómo se vería
el sitio del sindicato y qué herramientas ya están resueltas.

> **Aclaración importante.** Este sitio no es oficial ni está autorizado por ASDE. Los textos,
> noticias, nombres y datos de contacto son de ejemplo y están marcados en el código para
> reemplazar. Lo único que funciona con datos reales es la calculadora y el comparador de
> inflación, que usan los valores de la liquidación docente de San Luis.

---

## 1. Qué se puede mostrar hoy

Abrí `demo-asde/index.html` con cualquier servidor estático y recorré las cinco páginas.

| Página | Archivo | Estado |
| --- | --- | --- |
| Inicio | `index.html` | Maqueta con contenido de ejemplo |
| Calculadora salarial | `calculadora.html` | **Funciona**, calcula de verdad |
| Sueldo vs inflación | `inflacion.html` | **Funciona**, compara de verdad |
| Noticias | `noticias.html` | Maqueta con seis noticias de ejemplo |
| Afiliación y contacto | `afiliacion.html` | Formulario maqueta (abre el correo) |

Lo que ya está resuelto y no habría que volver a construir:

- **Calculadora de sueldo de bolsillo** con varios cargos a la vez, zonas distintas, antigüedad,
  afiliación sindical, aguinaldo y descuentos de ley. Muestra el desglose completo, igual que el
  recibo, y un gráfico de proporciones.
- **Comparador contra la inflación** por período, con el IPC del INDEC y el valor histórico de la
  hora cátedra, más un gráfico y una lectura del resultado.
- **Diseño adaptable**: se usa bien desde el celular, que es de donde entra la mayoría de las y
  los docentes. Nada se sale de la pantalla ni hay que hacer zoom.
- **Estructura de portal gremial**: portada con titulares, secciones de noticias, agenda,
  autoridades, afiliación y pie institucional.
- Una calculadora propia es, además, un motivo concreto para que el sindicato tenga sitio: se
  publica, se comparte en los grupos de WhatsApp y trae gente al sitio.

---

## 2. Cómo verlo

Desde la raíz del repositorio:

```bash
python -m http.server 4321
```

Y abrir `http://127.0.0.1:4321/demo-asde/index.html`.

La muestra es **autocontenida**: todo lo que necesita está dentro de `demo-asde/`. Se puede
copiar esa carpeta a otro repositorio o a otro servidor y sigue funcionando igual, sin depender
del resto del proyecto.

Si se publica en Vercel, la rama genera una URL de preview y la muestra queda en
`https://<url-de-preview>/demo-asde/`.

---

## 3. Qué reemplazar antes de mostrarlo como sitio real

Todo lo que hay que cambiar está marcado en el código con `<!-- Reemplazar -->` o con un
comentario que lo explica. La lista completa:

1. **Identidad.** El escudo es un cuadrado con las letras «ASDE» (`css/asde-layout.css`, clase
   `.marca__escudo`). Si ASDE tiene isotipo propio, se reemplaza por la imagen. Los colores están
   todos en `css/asde-base.css`: `--azul`, `--azul-oscuro`, `--dorado`.
2. **Noticias y comunicados.** Están en `tools/contenido-noticias.html` y en la portada
   (`index.html`, sección «Últimas noticias»).
3. **Autoridades.** En `tools/contenido-afiliacion.html`, los cuatro bloques con «Nombre y
   apellido». No se inventaron nombres reales a propósito.
4. **Datos de contacto.** Dirección, teléfono y correo, en `tools/contenido-afiliacion.html` y en
   el pie de `tools/plantilla.html`.
5. **Cuota sindical.** El porcentaje («2% del sueldo bruto») es un ejemplo; lo define el estatuto.
6. **Redes sociales.** Los enlaces del encabezado apuntan a `#redes`.
7. **Formulario de afiliación.** Hoy `action="mailto:..."`: abre el correo del visitante. Para que
   llegue al sindicato hay que conectarlo a un servicio de envío (Formspree, un endpoint propio,
   etc.).

---

## 4. Cómo está armado

```
demo-asde/
├── index.html            Portada
├── calculadora.html      Calculadora + comparador en pestañas
├── inflacion.html        Comparador en página propia
├── noticias.html         Listado de noticias
├── afiliacion.html       Afiliación, contacto y autoridades
├── css/
│   ├── asde-base.css         Colores, tipografía y espaciados
│   ├── asde-layout.css       Cabecera, portada, noticias, paneles, pie
│   └── asde-calculadora.css  Calculadora, comparador, tablas y acordes
├── js/
│   ├── asde-ui.js        Menú móvil, pestañas y estados vacíos
│   └── app/              Motor de cálculo (ver punto 5)
└── tools/
    ├── plantilla.html            Esqueleto común de las páginas internas
    ├── contenido-*.html          Contenido de cada página interna
    └── generar-paginas.mjs       Genera noticias.html, afiliacion.html e inflacion.html
```

**Para editar una página interna** (noticias, afiliación o inflación): se toca el archivo
`tools/contenido-*.html` y se vuelve a generar:

```bash
node demo-asde/tools/generar-paginas.mjs
```

Así la cabecera y el pie se mantienen iguales en las cinco páginas. La portada y la calculadora
tienen su propio HTML porque su estructura es distinta.

---

## 5. El motor de cálculo

`js/app/` es el código compilado del motor de liquidación docente de San Luis, el mismo que usa
la calculadora que ya está publicada. **No se toca a mano**: se compila desde `src/` con
`npm run build` y se copia.

Las páginas le pasan el control a ese motor a través de identificadores fijos que no se pueden
renombrar (`contenedorPuestos`, `btnCalcularSueldo`, `mesCalculo`, `antiguedad`,
`afiliacionSindical`, `mesInicio`, `mesFin`, `btnComparar` y los de cada fila de resultado). El
contrato está documentado arriba de `css/asde-calculadora.css`.

Si en algún momento se actualizan los valores de la liquidación, se recompila el motor del
proyecto y se vuelve a copiar la carpeta `dist/` a `demo-asde/js/app/`.

---

## 6. Qué faltaría para un sitio definitivo

Lo que esta muestra **no** incluye, y conviene tener presente antes de cotizar el trabajo:

- **Gestión de contenidos.** Las noticias hoy son archivos HTML. Para que el sindicato publique
  solo, hace falta un panel (WordPress, Decap CMS o similar).
- **Envío real del formulario** de afiliación y su circuito interno de aprobación.
- **Buscador de padrón.** No se puede resolver con un archivo estático: adentro hay datos
  personales de terceros y todo lo que llega al navegador es público. Necesita servidor con
  autenticación. Es la advertencia más importante si alguien lo pide.
- **Dominio, correo institucional, analítica y accesibilidad auditada.**
- **Actualización mensual de los valores** de la liquidación (es trabajo recurrente, no único).
