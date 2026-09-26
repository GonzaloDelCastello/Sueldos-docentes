# Cómo organizar el trabajo cuando el tiempo es poco y llega en pedazos

Una guía para ordenar las tareas del proyecto. Está escrita para leerse o escucharse, igual que los apuntes de estudio.

---

## Antes de empezar: lo que ya estás haciendo bien

Voy a arrancar por acá porque importa.

Decís que usás Notion con tres columnas: pendientes, en proceso y resueltas. Eso tiene un nombre. Se llama tablero Kanban, y es una de las dos metodologías ágiles más usadas del mundo. No te falta una herramienta, te falta el vocabulario para nombrar lo que ya hacés y dos o tres ajustes finos.

Decís también que medís tu trabajo en pomodoros y que te resulta entretenido. Eso también tiene nombre. Se llama Técnica Pomodoro, la inventó Francesco Cirillo a fines de los años ochenta, y es una de las herramientas de gestión del tiempo más efectivas que existen precisamente porque convierte una tarea difusa en una unidad con principio y fin.

Y decís que sos paciente, que construís conductas y disciplinas, y que sos consciente de tus tiempos. Eso es lo más importante de todo lo que contaste. La mayoría de la gente que fracasa con estos sistemas no fracasa por falta de herramientas, fracasa porque intenta instalar un sistema grande de golpe y lo abandona en tres semanas.

Entonces no te voy a proponer un sistema nuevo. Te voy a proponer ajustar el que ya tenés.

---

## Parte 1. Qué es esto de lo ágil, en dos minutos

En el año dos mil uno, un grupo de programadores publicó un documento corto llamado Manifiesto Ágil. La idea de fondo era una sola: los planes detallados fallan, porque los requisitos cambian mientras construís. En lugar de planificar todo de antemano y ejecutar, conviene trabajar en ciclos cortos, revisar, y ajustar.

De ahí salieron varias metodologías. Tres te interesan.

**Scrum.** Organiza el trabajo en ciclos de dos a cuatro semanas llamados sprints, con reuniones fijas: planificación, revisión diaria, retrospectiva. Está diseñado para equipos. Si lo aplicás solo, la mayoría de esas reuniones son teatro: te reunís con vos mismo.

**Kanban.** Viene de la fábrica Toyota. En lugar de ciclos, propone un flujo continuo. Sus tres ideas centrales son: visualizá el trabajo, limitá cuántas cosas hacés a la vez, y gestioná la cola de pendientes. No tiene reuniones ni roles ni ciclos. Funciona igual de bien con una persona que con cincuenta.

**Extreme Programming**, o XP. De acá vienen los tests automatizados, el desarrollo guiado por tests, y la idea de que el código se escribe de a dos personas. Es la metodología de la que ya estás tomando cosas sin saberlo.

Para tu situación, la respuesta es clara: **Kanban**. Scrum necesita un equipo y bloques de tiempo predecibles. Con un bebé de un año, no tenés ni una cosa ni la otra.

---

## Parte 2. El principio que más te va a cambiar el trabajo

Si te llevás una sola idea de toda esta guía, que sea esta.

**El problema no es la falta de tiempo. Es tener demasiadas cosas empezadas.**

Kanban lo llama limitar el trabajo en curso. La sigla en inglés es WIP, de work in progress. La regla es simple: poné un techo a la cantidad de tareas que podés tener en la columna de en proceso.

Suena obvio y es contraintuitivo. Cuando tenés poco tiempo, la tentación es arrancar muchas cosas, porque cada una te acerca a un objetivo distinto. El resultado es que ninguna avanza. Y peor: cada vez que volvés, tenés que reconstruir en tu cabeza dónde estabas parado, y esa reconstrucción consume justo el poco tiempo que tenías.

Con cuatro horas por semana, tener tres cosas empezadas significa perder media hora por sesión solo en reubicarte.

**Mi recomendación concreta: el límite es uno.** Una sola tarea en la columna de en proceso. Si querés empezar algo nuevo, primero terminás o devolvés lo que estaba.

Es duro al principio. Es lo que hace que las cosas se terminen.

---

## Parte 3. Cómo se escribe una tarea

Acá está el segundo cambio más importante, y es gratis.

**Una tarea se escribe como una acción concreta, no como un tema.**

Comparen estas dos formas de anotar lo mismo.

Forma uno: mejorar el header.

Forma dos: agregar color blanco a la clase header texto dos en el archivo layout punto css, y verificar en el celular.

La primera no se puede empezar. Cuando la mirás, no sabés por dónde arrancar, y esa indecisión es lo que hace que la tarea quede en pendientes durante tres semanas.

La segunda se puede empezar en el instante en que la leés. No hay nada que decidir.

El segundo ejemplo es literalmente una tarea que ya hicimos, y la forma en que te la conté al principio era la primera: "hay un problema de contraste en el header". La versión accionable la construimos recién cuando abrimos el archivo.

**La regla es: si no sabés cuál es el primer paso, la tarea todavía no está lista.**

### El tamaño

Una tarea que no entra en un pomodoro no es una tarea. Es un proyecto.

Si al leerla pensás "esto no lo termino en veinticinco minutos", la partís en dos o más. Y si las partes siguen siendo grandes, seguís partiendo.

Los proyectos grandes, los que no se pueden partir sin perder el sentido, se llaman épicas. Una épica no se pone en la columna de en proceso. Se pone en pendientes como recordatorio, y lo que se pone en el tablero son sus partes.

Ejemplo real de tu proyecto. La épica es: separar los cálculos de sueldo de la manipulación del navegador. No la empezás. Lo que empezás es: extraer la función que calcula el descuento sindical para que reciba la afiliación por parámetro en lugar de leerla del formulario.

Eso entra en un pomodoro.

---

## Parte 4. La definición de terminado

Esta es una herramienta que casi nadie usa y que resuelve un problema muy concreto: la sensación de que nunca terminás nada.

Consiste en escribir, de antemano y una sola vez, qué significa que una tarea esté terminada. No para cada tarea: para el proyecto.

Para tu proyecto propongo estas cuatro condiciones.

Uno. Los tests pasan. Se corre la orden de test y está todo en verde.

Dos. El chequeo de tipos pasa. No hay errores de TypeScript.

Tres. Está subido. El cambio está en GitHub, no solo en tu máquina.

Cuatro. Está verificado en el sitio publicado. No alcanza con que funcione en tu servidor local. Lo abriste en el sitio real y funciona.

La cuarta es la que te hubiera ahorrado el episodio del favicon. El favicon funcionaba en local y no en producción, y esa diferencia era información. Sin la cuarta condición, uno cierra la tarea y el problema aparece después.

De ahora en más, cuando una tarea cumple las cuatro, se mueve a resueltas. Antes no.

---

## Parte 5. La bitácora

Decís que no sabés dejar registro de las tareas por hacer ni de las hechas. El tablero resuelve lo primero. Lo segundo necesita otra cosa.

Una bitácora es un archivo, una página, donde anotás una o dos líneas al terminar cada sesión. Qué hiciste, qué aprendiste, qué te trabó.

Es corta y parece trivial. No lo es.

Primero, porque con poco tiempo, la sensación de no avanzar es constante. La bitácora es la prueba objetiva de que sí avanzaste. Cuando en un mes te parezca que no hiciste nada, leés treinta líneas y te enterás de que aprendiste a escribir tests, corregiste un error de cálculo, y optimizaste las imágenes del sitio.

Segundo, porque escribir lo que te trabó te obliga a formular la pregunta. Y una pregunta bien formulada se responde sola la mitad de las veces, o se convierte en algo que podés preguntar en lugar de quedarte atascado.

Tercero, y esto es específico de alguien que está aprendiendo: la bitácora es tu registro de aprendizaje. Los tests de hoy no te van a parecer gran cosa en un año. La bitácora te va a mostrar el camino.

Formato sugerido, una línea por sesión:

Fecha. Qué hice. Qué aprendí o qué me trabó.

Nada más. Si escribís más, no lo vas a mantener.

---

## Parte 6. La revisión semanal

Una vez por semana, quince minutos, siempre el mismo día y a la misma hora. Es la única ceremonia que te voy a recomendar, y es la que hace que el resto funcione.

Qué mirás en esos quince minutos.

Primero, pasás las tareas terminadas de la columna en proceso a resueltas. Y confirmás que cumplen las cuatro condiciones.

Segundo, mirás qué quedó trabado y por qué. Si algo lleva tres semanas en pendientes sin moverse, hay dos posibilidades: o no es una acción concreta, o no te interesa de verdad. Las dos respuestas son útiles. La primera se arregla reescribiéndola. La segunda se arregla borrándola, y borrar tareas es una actividad legítima y saludable.

Tercero, elegís la única tarea que va a estar en proceso la semana siguiente. Una.

Cuarto, si querés, escribís una línea de bitácora sobre la semana.

Quince minutos. Poné una alarma y tratalo como una tarea más.

---

## Parte 7. Cuándo trabajar, y en qué

Contaste algo muy concreto: tenés cuatro de las cinco mañanas a cargo del bebé, y él duerme hasta las diez u once. Si te acostás temprano y te levantás temprano, tenés un bloque de trabajo antes de que se despierte.

Ese bloque es tu recurso más valioso, y hay una regla para protegerlo.

**En el bloque bueno va el trabajo difícil. El trabajo fácil va en los huecos.**

El aprendizaje y la escritura de tests necesitan atención continua. Si el bebé se despierta a mitad de camino, perdiste el hilo y probablemente la sesión. Ese trabajo va en el bloque protegido, cuando la casa duerme.

Las tareas mecánicas, como actualizar un valor en el historial, corregir un texto, o comprimir una imagen, toleran interrupciones. Esas van en los ratos muertos, o con el bebé despierto jugando al lado.

Si invertís el orden y usás el bloque bueno para tareas mecánicas, vas a terminar la semana con la sensación de haber trabajado mucho y no haber aprendido nada.

### El objetivo no son horas, son pomodoros

No te pongas metas en horas. Con un bebé, las horas son ficción.

Ponete metas en pomodoros terminados. Decir "esta semana hago cuatro pomodoros" es una meta que podés cumplir o no, y que depende de vos. Decir "esta semana le dedico cinco horas" depende de que el bebé tenga una buena semana.

Empezá con una meta chica y realista. Dos pomodoros por semana, tres semanas seguidas, es mejor que ocho pomodoros una semana y cero las dos siguientes.

---

## Parte 8. Advertencias honestas

**Esto es una temporada, no un fracaso.** Un bebé de un año demanda lo que demanda. Estás en la parte más exigente. Que el proyecto avance lento no es un problema de organización, es la realidad de tu vida ahora.

**No armes un sistema grande ahora.** Con cuatro horas por semana, el sistema tiene que ocupar cinco minutos de mantenimiento. Un tablero de tres columnas con un límite de uno, una bitácora de una línea por sesión, y quince minutos de revisión semanal. Nada más. Si dentro de seis meses tenés más tiempo, ahí lo ampliás.

**No te compares con gente que tiene veinte horas semanales.** Comparate con vos de hace un mes. Para eso está la bitácora.

**Aceptá que vas a romper el sistema.** Vas a tener semanas de cero. La respuesta correcta no es abandonar, es retomar sin culpa. La disciplina que decís tener se mide en cuántas veces volvés, no en cuántas veces no fallás.

---

## Resumen en seis puntos

Uno. Ya hacés Kanban. El único cambio estructural es limitar a uno el trabajo en curso.

Dos. Las tareas se escriben como acciones concretas y entran en un pomodoro. Lo que no entra, se parte.

Tres. Cuatro condiciones para que algo esté terminado: tests verdes, tipos sin error, subido, y verificado en el sitio real.

Cuatro. Una bitácora de una línea por sesión, para tener registro de lo que hacés y de lo que aprendés.

Cinco. Una revisión semanal de quince minutos, siempre el mismo día.

Seis. El bloque bueno de la mañana es para lo difícil. Metas en pomodoros, no en horas.
