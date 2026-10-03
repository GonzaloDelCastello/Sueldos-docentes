# Muestra de sitio web para UTEP San Luis

Propuesta de diseño y desarrollo para **UTEP-S.L., Unión de Trabajadoras y Trabajadores de la
Economía Popular de San Luis**.

> **Aclaración importante.** Este sitio no es oficial ni está autorizado por UTEP. Los textos,
> noticias, nombres y datos de contacto son de ejemplo y están marcados en el código para
> reemplazar. Lo único que funciona con datos reales es la calculadora y el comparador de
> inflación, que usan los valores de la liquidación de San Luis.

---

## 1. Qué se puede mostrar hoy

Abrí `demo-utep/index.html` con cualquier servidor estático y recorré las cinco páginas.

| Página | Archivo | Estado |
| --- | --- | --- |
| Inicio | `index.html` | Maqueta con contenido de ejemplo |
| Calculadora | `calculadora.html` | **Funciona**, calcula de verdad |
| Sueldo vs inflación | `inflacion.html` | **Funciona**, compara de verdad |
| Noticias | `noticias.html` | Maqueta con seis noticias de ejemplo |
| Afiliación y contacto | `afiliacion.html` | Formulario maqueta (abre el correo) |

La muestra es **autocontenida**: todo lo que necesita está dentro de `demo-utep/`, así que se puede
copiar esa carpeta a otro repositorio o servidor y sigue funcionando igual.

---

## 2. La identidad

El color y la tipografía salen del **logo de UTEP**, no de una paleta inventada:

| Color | Uso |
| --- | --- |
| `#0090d0` celeste | Color principal: cabecera, botones, portada, detalles |
| `#00527a` celeste profundo | Títulos y fondos oscuros |
| `#e8802f` naranja | Acento: bordes, categorías, acciones secundarias |
| `#303090` violeta | Detalle, tomado de la parte central del triángulo |
| `#10203a` azul tinta | Texto y pie |

**La tipografía imita la del logo**: sans geométrica, muy pesada, en mayúsculas y con espaciado
amplio entre letras. Se resuelve con fuentes del sistema (`Arial Black` y equivalentes), así que
no hay que descargar nada ni depende de un servicio externo. Si UTEP tiene una tipografía
institucional propia, se cambia la variable `--display` en `css/utep-base.css` y listo.

---

## 3. El logo

Se extrajo de la imagen que aportó la organización (`img/utep/`), con los recortes medidos sobre la
imagen original:

| Archivo | Para qué sirve |
| --- | --- |
| `img/logo-utep.png` | El bloque completo (triángulo + sigla), sin fondo. Encabezado y pie |
| `img/logo-utep-marca.png` | Sólo el triángulo, sin fondo. Base del favicon chico |
| `img/placa-original.jpg` | La imagen original, como respaldo |

Los blancos del logo se volvieron transparentes, así que el mismo archivo se apoya sobre el blanco
del encabezado y sobre el azul del pie sin dejar un rectángulo blanco.

**El original es un JPEG de 1224x1280.** Alcanza para el tamaño que se usa en el sitio (54 px de
alto en el encabezado), pero si UTEP consigue el logo en vectorial (SVG, AI o PDF), conviene
reemplazarlo: se vería nítido en cualquier pantalla y en impresión.

### El favicon

| Archivo | Contenido | Dónde se ve |
| --- | --- | --- |
| `favicon.ico` | El triángulo | Pestaña del navegador (16, 32 y 48 px adentro) |
| `img/favicon-16/32/48.png` | El triángulo | Pestaña |
| `img/apple-touch-icon.png` | El bloque completo | Guardar en la pantalla de inicio del iPhone |
| `img/favicon-192/512.png` | El bloque completo | Acceso directo y usos grandes |

El motivo: **probado a 16 px, la sigla U.T.E.P.-S.L. es ilegible**, mientras que el triángulo se
distingue con claridad. De 32 px para arriba, en cambio, el bloque completo se lee bien.

Las rutas se declaran **relativas** (`href="favicon.ico"`, sin barra inicial) a propósito: con barra
inicial el navegador busca el ícono en la raíz del dominio y muestra el de otro proyecto.

---

## 4. Qué reemplazar antes de mostrarlo como sitio real

Todo está marcado en el código con `<!-- Reemplazar -->`:

1. **Noticias y comunicados.** En `tools/contenido-noticias.html` y en la portada.
2. **Autoridades.** En `tools/contenido-afiliacion.html`, los cuatro bloques con «Nombre y
   apellido». No se inventaron nombres reales a propósito.
3. **Datos de contacto.** Sede, teléfono y correo, en `tools/contenido-afiliacion.html` y en
   `tools/plantilla.html`.
4. **Aporte gremial.** La calculadora aplica un valor de referencia. El monto real lo define el
   estatuto de UTEP y **no se publica en esta muestra**: el texto de ayuda lo aclara.
5. **Redes sociales.** Los enlaces del encabezado apuntan a `#redes`.
6. **Formulario de afiliación.** Hoy `action="mailto:..."`: abre el correo del visitante. Para que
   llegue a la organización hay que conectarlo a un servicio de envío o a su sistema.

---

## 5. Cómo está armado

```
demo-utep/
├── index.html            Portada
├── calculadora.html      Calculadora + comparador en pestañas
├── inflacion.html        Comparador en página propia
├── noticias.html         Listado de noticias
├── afiliacion.html       Afiliación, contacto y autoridades
├── css/
│   ├── utep-base.css         Colores, tipografía y espaciados
│   ├── utep-layout.css       Cabecera, portada, noticias, paneles, pie
│   └── utep-calculadora.css  Calculadora, comparador, tablas y acordes
├── js/
│   ├── utep-ui.js        Menú móvil, pestañas y estados vacíos
│   └── app/              Motor de cálculo (ver punto 6)
└── tools/
    ├── plantilla.html            Esqueleto común de las páginas internas
    ├── contenido-*.html          Contenido de cada página interna
    └── generar-paginas.mjs       Genera noticias.html, afiliacion.html e inflacion.html
```

**Para editar una página interna**: se toca `tools/contenido-*.html` y se regenera:

```bash
node demo-utep/tools/generar-paginas.mjs
```

Así la cabecera y el pie se mantienen iguales en todas las páginas.

---

## 6. El motor de cálculo

`js/app/` es el código compilado del motor de liquidación que ya está verificado contra recibos
reales de la provincia. **No se toca a mano**: se compila desde `src/` con `npm run build` y se
copia.

Las páginas le pasan el control a ese motor a través de identificadores fijos que no se pueden
renombrar (`contenedorPuestos`, `btnCalcularSueldo`, `mesCalculo`, `antiguedad`,
`afiliacionSindical`, `mesInicio`, `mesFin`, `btnComparar` y los de cada fila de resultado). El
contrato está documentado arriba de `css/utep-calculadora.css`.

**Advertencia para el sitio definitivo:** el motor calcula cargos docentes, con la escala salarial
de la provincia. Si UTEP quiere calcular haberes de la economía popular (salario social
complementario, cooperativas, programas), eso es un desarrollo aparte: hay que cargar otra escala
de valores, que hoy no está relevada.

---

## 7. Qué faltaría para un sitio definitivo

- **Gestión de contenidos** para que UTEP publique solo, sin depender del desarrollador.
- **Envío real del formulario** de afiliación y su circuito interno de aprobación.
- **Registro de la base de datos de afiliados** ante la AAIP, según la Ley 25.326, y su texto de
  consentimiento. Aplica igual que para cualquier organización que guarde datos de personas.
- **Dominio, correo institucional y analítica.**
- **Actualización mensual de los valores** de la liquidación, si se publica la calculadora.
