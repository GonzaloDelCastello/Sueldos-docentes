# Backlog del proyecto

Lista de trabajo pendiente, escrita para pegar en Notion.

Cada línea es una tarea concreta que entra en un pomodoro. El símbolo del tomate indica cuántos pomodoros estimo que lleva. Los que tienen más de dos tomates conviene partirlos antes de empezar.

**Cómo pasarlo a Notion.** Creá una página nueva, seleccioná todo el texto de este archivo desde el título "Bloque 0" hasta el final, y pegalo. Notion convierte las líneas que empiezan con corchetes en casillas marcables. Las que no lo hacen quedan como texto normal, así que las secciones y los títulos se respetan.

---

## Cómo armar el tablero

Tres columnas, como ya tenés:

Pendiente. En proceso. Resuelto.

Con una regla nueva: **la columna En proceso puede tener una sola cosa.** Si querés empezar otra, primero terminás la que está.

Propiedades sugeridas para cada tarjeta, en este orden:

- **Tamaño**: 🍅1, 🍅2, o 🍅3.
- **Área**: Tests, Datos, Interfaz, Limpieza, Aprendizaje.
- **Tipo**: Bug, Mejora, Aprendizaje, Épica.

Y las cuatro condiciones para mover algo a Resuelto: los tests pasan, el chequeo de tipos pasa, está subido a GitHub, y lo verificaste en el sitio publicado.

---

## Bloque 0. Para hacer ahora

- [ ] **Hacer push de los commits locales** · 🍅½ · Limpieza · Hay cuatro commits sin subir: el favicon, los apuntes, la organización y este backlog. Sin el push no llegan al sitio.

- [ ] **Abrir el sitio en una ventana de incógnito y confirmar que el favicon aparece** · 🍅¼ · Interfaz · El ícono ya está publicado y se sirve bien. Lo que fallaba era el caché del navegador. En incógnito no hay caché, así que si aparece, el diagnóstico queda confirmado.

---

## Bloque 1. Aprendizaje: tests

Este bloque es tu objetivo principal. No lo saltees por avanzar con los bugs, porque los bugs van a seguir ahí y la capacidad de testear no.

- [ ] **Escuchar o leer los apuntes, Partes 2 y 3** · 🍅1 · Aprendizaje · Son las dos partes que explican funciones puras, inyección de dependencias y la anatomía de un test. Sin eso, el resto se memoriza sin entender.

- [ ] **Ejercicio 1: testear la función que arma el mensaje de comparación de inflación** · 🍅2 · Aprendizaje · Esa función usa la ventana de alerta del navegador, así que no se puede probar directamente. El ejercicio es pasarle una función de alerta falsa. Eso enseña qué es un doble de prueba, que es el concepto que te va a desbloquear todo lo demás.

- [ ] **Ejercicio 2: test de integridad entre el historial de básicos y el de inflación** · 🍅1 · Aprendizaje · Verificá que todo mes del historial de básicos tenga su mes en el de inflación. Vas a descubrir que los dos últimos meses no lo tienen.

- [ ] **Ejercicio 3: romper un test a propósito y leer el mensaje de error** · 🍅½ · Aprendizaje · Cambiá un valor esperado por uno equivocado a propósito, corré los tests, y leé con atención lo que te dice. Aprender a leer el mensaje de error de un test es una habilidad en sí misma.

- [ ] **Correr la cobertura de tests y mirar el mapa** · 🍅1 · Aprendizaje · Node puede medir qué líneas se ejecutan. El resultado te va a mostrar que el archivo de cálculo tiene cobertura casi nula. Ese mapa es, en sí mismo, el argumento para el refactor grande.

---

## Bloque 2. Bugs que hoy dan números mal

Estos afectan a gente real que confía en la calculadora. Van antes que la limpieza.

- [ ] **Corregir el orden de lectura del cargo en la validación de horas** · 🍅1 · Bug · En el archivo de cálculo, la validación lee una variable global que recién se asigna diecisiete líneas después. En el primer clic esa variable todavía vale cero, así que la validación se saltea y el usuario no ve el error. Se arregla leyendo el menú una sola vez, al principio de la función.

- [ ] **Hacer que el cargo Preceptor respete la cantidad de horas** · 🍅1 · Bug · Hoy se carga la cantidad de horas y el resultado no cambia, porque esa función nunca lee el dato. Hay que decidir si corresponde multiplicar o si el cargo es fijo, y en el primer caso implementarlo.

- [ ] **Decidir qué hacer con el adicional por cargo en el nivel superior** · 🍅1 · Bug · Se calcula y se muestra en la tabla, pero no se suma al total. Entonces la tabla no cierra consigo misma. Hay que decidir si se suma o si se deja de mostrar, y hacer una de las dos cosas.

- [ ] **Redondear a dos decimales los conceptos y los totales** · 🍅2 · Bug · Todo el cálculo es en decimales largos y solo se redondea al mostrar. Por eso el total de bolsillo puede diferir en centavos de la suma de los conceptos. La solución es redondear cada concepto y recalcular los totales a partir de los conceptos ya redondeados.

- [ ] **Mover los descuentos fijos al historial por mes** · 🍅2 · Bug · Hay dos descuentos con valores fijos escritos en el código. No se actualizan por mes como el resto, así que quedan viejos sin que nadie lo note. Deberían vivir en el historial, junto a los demás valores.

- [ ] **Unificar el historial de básicos con el de valores por mes** · 🍅2 · Datos · Hay dos listas de valores que ya divergieron en centavos. Una sola fuente de verdad. Antes de tocar nada, escribí un test que compare las dos y te muestre exactamente dónde difieren.

- [ ] **Impedir que la tecla Enter recargue la página** · 🍅1 · Bug · El campo de cantidad de horas está dentro de un formulario real. Apretar Enter dispara el envío del formulario y recarga la página, y el usuario pierde el nivel, el cargo y el mes elegidos. Se arregla interceptando el evento de envío.

---

## Bloque 3. Prevenir errores futuros

- [ ] **Que los ayudantes del historial dejen de devolver el último valor en silencio** · 🍅1 · Bug · Si pedís un mes que no existe, hoy devuelven la última configuración sin avisar. Un usuario puede ver un resultado con apariencia de correcto calculado con valores de otro mes. Deberían avisar o devolver el mes anterior, pero nunca mentir.

- [ ] **Derivar los límites del comparador de inflación del propio historial** · 🍅1 · Mejora · Las fechas mínima y máxima están escritas a mano, y ya quedaron desactualizadas. Si se derivan del historial, se actualizan solas cuando agregás meses.

- [ ] **Revisar los meses de septiembre y octubre de 2026** · 🍅½ · Datos · El historial de básicos llega hasta octubre, pero el de inflación hasta agosto. Falta cargar esos dos meses de inflación, o entender por qué no están.

---

## Bloque 4. Limpieza

- [ ] **Extraer el menú móvil y la fecha a un módulo propio** · 🍅2 · Limpieza · Hoy esas dos funciones viven dentro de un archivo viejo que arrastra todo el motor de cálculo obsoleto. Extraerlas es el paso previo para poder borrar el archivo.

- [ ] **Borrar los dos archivos de JavaScript viejo** · 🍅½ · Limpieza · Son una copia obsoleta del motor, con precios de julio de dos mil veinticinco y una tabla de zonas anterior a la que agregaste. No se usan, pero son una trampa: el día que alguien los reconecte, calculan mal sin que nadie lo note. Se borran recién después de la tarea anterior.

- [ ] **Sacar la carpeta compilada del seguimiento de Git** · 🍅1 · Limpieza · Está a la vez ignorada y versionada, que son dos cosas contradictorias. Se confirmó que Vercel compila sola, así que los archivos versionados son redundantes. La orden es sacar la carpeta del seguimiento, no borrarla.

- [ ] **Sacar la dependencia de Gulp del archivo de paquetes** · 🍅½ · Limpieza · Está declarada como dependencia de producción y no existe ningún archivo de configuración que la use. Son unos veintiséis megabytes de dependencias al pedo.

- [ ] **Borrar los registros de depuración que quedaron en el motor** · 🍅½ · Limpieza · Hay varias líneas que escriben mensajes en la consola del navegador. No molestan a los usuarios, pero ensucian y delatan que el código quedó a medio limpiar.

---

## Bloque 5. Interfaz, segunda pasada

- [ ] **Hacer accesibles las cuatro tablas de resultados** · 🍅1 · Interfaz · Les falta el título de tabla, la fila de encabezados, y la marca de alcance en las celdas de encabezado. Es lo que permite a un lector de pantalla entender la estructura.

- [ ] **Corregir la jerarquía de títulos de la página principal** · 🍅1 · Interfaz · Salta de título de nivel uno a nivel tres, y después a nivel cuatro. Un lector de pantalla usa esa jerarquía para navegar. Falta el nivel dos.

- [ ] **Segunda pasada de diseño adaptable** · 🍅2 · Interfaz · Hoy hay un solo punto de corte, en setecientos sesenta y ocho píxeles, y es un enfoque pensado desde la computadora hacia el celular. Falta un punto intermedio para tabletas, y revisar cómo se comportan las tablas de resultados en pantallas angostas.

- [ ] **Ordenar los colores y espaciados sueltos del CSS** · 🍅2 · Interfaz · Hay unos quince valores de color escritos directamente en las reglas, y tres variables que se usan pero nunca se definieron. Conviene juntarlos en el archivo de variables, que es el único lugar donde deberían vivir.

- [ ] **Unificar la navegación entre las tres páginas** · 🍅1 · Interfaz · La página principal no tiene menú de navegación, y tiene los enlaces del pie comentados. Desde el celular, alguien que llega a la calculadora no tiene forma de ir a Recursos ni a Sobre Nosotros.

---

## Bloque 6. Épicas

Estas no se empiezan hasta que los bloques anteriores estén razonablemente ordenados. No se ponen en la columna En proceso: se ponen en Pendiente como recordatorio, y lo que se hace son sus partes.

**Épica 1. Separar el cálculo puro de la manipulación de la página.** Es la más importante para tu objetivo de aprender, porque es el requisito para poder testear los números que ve la gente. Hoy el motor de cálculo lee los menús y escribe en la página, todo mezclado. El trabajo consiste en que las funciones de cálculo reciban los valores por parámetro y devuelvan números, y que otra capa se encargue de leer y escribir la página. Tus cinco funciones de cálculo de sueldo casi idénticas se unifican en el camino.

**Épica 2. Empaquetar los estilos.** Hoy la hoja de estilos principal son cinco importaciones encadenadas, así que el navegador hace siete pedidos antes de poder pintar nada. Un paso de empaquetado lo reduce a uno.

**Épica 3. Buscador de padrón.** La página de Sobre Nosotros lo menciona como parte de la misión, y es lo que motivó el archivo que tuvimos que borrar. Importante: **no se puede resolver con un archivo de JavaScript estático.** Todo lo que llega al navegador es público, y ahí adentro hay datos personales de terceros. Si se hace, necesita un servidor con autenticación. Mientras eso no exista, la respuesta correcta es no hacerlo.

---

## Una nota sobre el orden

Si tenés poco tiempo, el orden importa más que la velocidad.

Primero el aprendizaje, porque multiplica todo lo demás. Segundo los bugs que dan números mal, porque afectan a gente real. Tercero la limpieza, que no le sirve a nadie más que a vos pero te hace más rápido. Y último lo nuevo.

Hay una tentación muy fuerte de hacer lo divertido primero, que casi siempre es lo nuevo. Resistila. Lo nuevo construido sobre un motor sin tests es deuda que vas a pagar con intereses.
