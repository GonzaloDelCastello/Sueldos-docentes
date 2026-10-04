# Calculadora de sueldos docentes de San Luis

Sitio estático con una calculadora de liquidación docente para la provincia de San Luis y un comparador
de sueldo contra la inflación. Es la herramienta que usa la agrupación **ATEBA – Lista Roja**.

Los valores salariales salen de los decretos provinciales y se verifican contra recibos de sueldo reales.
El IPC lo toma del INDEC.

## Herramientas

```bash
python -m http.server 4321     # ver el sitio en http://127.0.0.1:4321
node tests/calculos.test.ts    # un test suelto
npm test                       # toda la suite
npm run typecheck              # chequeo de tipos
npm run build                  # compila src/ a dist/
```

Los tests corren con `node:test`, sin dependencias de testing, y no necesitan navegador.

## Cómo está armado

- `src/` — el motor de cálculo, en TypeScript. Es la única fuente de verdad de los números.
- `dist/` — el motor compilado. Es lo que carga la página.
- `css/` y `js/` — el sitio.
- `demo-asde/` y `demo-utep/` — **propuestas de sitio** para dos organizaciones, como material de
  trabajo comercial. Cada una es autocontenida y lleva su propia copia del motor.
- `docs/` — apuntes, normativa y respaldos de recibos.

## Licencia

El repositorio no tiene una sola licencia, porque no es una sola cosa:

- El **motor de cálculo** (`src/`, `dist/`, `js/app/` de las muestras) está bajo **licencia ISC**: se
  puede usar, copiar y modificar, conservando el aviso de copyright.
- Las **muestras de sitio**, la **propuesta comercial** y el material de difusión quedan **con todos
  los derechos reservados**.

El detalle de qué alcanza a cada parte está en [`NOTICE.md`](NOTICE.md).
