# Licencias y propiedad de este repositorio

Este repositorio no es una sola cosa, así que no tiene una sola licencia. Acá se explica qué se puede
hacer con cada parte.

Autor de todo el contenido de este repositorio: **Gonzalo J. Del Castello**.
Los 229 commits del historial son suyos; no hay código de terceros más allá de las dependencias
declaradas.

---

## 1. Motor de cálculo → licencia ISC (abierta)

Alcanza a:

- `src/` (el código fuente del motor de liquidación y del comparador)
- `dist/` (ese mismo código compilado)
- `demo-asde/js/app/` y `demo-utep/js/app/` (copias del compilado para las muestras)

**Podés:** usarlo, copiarlo, modificarlo y redistribuirlo, incluso con fines comerciales.
**Condición:** conservar el aviso de copyright y el texto de la licencia (ver [`LICENSE`](LICENSE)).

Se deja abierto a propósito: es la parte técnica y verificable, y cualquiera puede auditar cómo se
calcula un sueldo. La licencia no cubre los **valores** de la liquidación, que salen de decretos
provinciales y del IPC del INDEC: esos son datos públicos, no propiedad de nadie.

## 2. Muestras de sitio y material comercial → todos los derechos reservados

Alcanza a:

- `demo-asde/` y `demo-utep/` **excepto** `js/app/`
- `propuesta-asde/`
- `marketing/`
- Las imágenes de `img/`

O sea: el diseño, la hoja de estilos, el armado de las páginas, los textos, el favicon, la propuesta
comercial y las piezas de difusión.

**No se autoriza** su copia, adaptación ni uso para presentar servicios propios, ni para armar el
sitio de otra organización. Es material de trabajo comercial.

Los logos de **ASDE** y de **UTEP-S.L.** que aparecen en las muestras pertenecen a esas
organizaciones. Se usan acá con carácter de propuesta y sin autorización formal: no son parte de
este repositorio ni se ceden con él.

## 3. Dependencias de terceros

| Dependencia | Licencia |
| --- | --- |
| `normalize.css` (en `css/normalize.css`) | MIT — conserva su propio aviso en la cabecera del archivo |
| Chart.js (por CDN, no está en el repositorio) | MIT |
| TypeScript, `@types/node` | Apache 2.0 / MIT |
| `@vercel/analytics` | MIT |

---

## Aviso

Este texto describe la intención del autor sobre su propio trabajo. **No es asesoramiento legal.**
Ante una disputa concreta, corresponde consultar a un abogado.
