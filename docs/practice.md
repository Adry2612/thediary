# Práctica

El editor de una práctica guardada vive en `/dashboard/practice/[date]`, en el detalle del día. Cada sesión se puede abrir, editar y volver a guardar sin perder su identidad en el historial.

## Editar una práctica guardada

- **Tiempo real** de cada bloque y **duración** de una sesión sin bloques se muestran como reloj: `1:23` (minutos y segundos) o `1:02:03` (horas, minutos y segundos).
- Al escribir se aceptan las mismas formas: `83` segundos, `1:23` o `1:02:03`. El valor se guarda en segundos, sin redondear a minutos decimales.
- Un campo vacío de un bloque vale cero. Un texto inválido se marca junto al campo y el resto de cambios se conserva; no aparece el error nativo del navegador por el `step` de un `input[type=number]`.
- El total de la cabecera de bloques se deriva de los segundos editados y se muestra también como reloj.
- El tiempo planificado sigue siendo un número entero de minutos.
- Al guardar, la práctica conserva sus vínculos de repertorio (o la canción del catálogo pendiente), lick, material, BPM medio y tipo de guitarra.
- Los bloques de técnica y de teoría usan el mismo buscador de catálogo que el editor de rutinas. Un nombre personalizado guardado antes sigue apareciendo como opción y se muestra tal como se guardó.
- Los bloques de repertorio mantienen el buscador de repertorio y de catálogo externo.

## Editar el bloque en curso

- Durante una práctica activa, el icono de edición junto al título del bloque abre el editor del bloque actual.
- Se pueden cambiar la categoría, el contenido vinculado (canción de repertorio o catálogo, técnica, teoría, lick o nombre libre), el tiempo planificado, el detalle del bloque y sus notas. Los demás bloques no cambian.
- Los cambios se aplican solo al guardar y **no detienen ni reinician** el temporizador: el tiempo transcurrido, el metronómetro y una grabación activa siguen funcionando.
- Si el nuevo tiempo planificado es menor que el tiempo ya transcurrido, el bloque sigue las reglas de espera o de tiempo extra que ya estuvieran configuradas.
- Las notas del bloque se guardan con la práctica y pre-rellenan el campo de notas del resumen final, donde todavía se pueden cambiar o borrar.
- Si un bloque cambia de categoría a mitad de práctica, todo su tiempo cuenta para la categoría con la que termina, tanto en el resumen por categoría como en el bloque guardado.
- La rutina de origen no se modifica por editar el bloque; sigue aplicándose la oferta de actualización de vínculos al terminar.

## Canciones del catálogo en una práctica

Los bloques de repertorio pueden buscar tanto en el repertorio guardado como en el catálogo externo, tanto al preparar la rutina como al editar una práctica guardada o cambiar la canción durante la sesión.

- Elegir una canción del catálogo guarda una referencia temporal con título y artista; no la añade al repertorio todavía.
- Al terminar la práctica, si algún bloque practicado usaba una canción del catálogo, el resumen ofrece añadirla al repertorio. Se puede desmarcar.
- Las canciones aceptadas se crean con los metadatos del catálogo y el bloque guardado queda vinculado al nuevo elemento. Si la canción ya se añadió mientras tanto, se reutiliza sin duplicarla.

## Formatos de tiempo compartidos

`src/utils/clock-time.ts` es la fuente única para interpretar y formatear tiempos. Lo usan la edición de prácticas y el vídeo de referencia de un lick, así que ambos aceptan los mismos formatos y rechazan negativos, decimales, partes de 60 o más y valores de 24 horas o más.

## Guardar una rutina

Guardar o actualizar una rutina confirma el resultado con un toast («Rutina guardada» o «Rutina actualizada», con su nombre) que se anuncia como estado y desaparece solo. Un fallo de guardado se muestra como error junto a las acciones y el editor conserva su contenido.

- Al **crear una rutina nueva**, elegir una plantilla guardada copia su nombre, bloques y guitarra en el plan nuevo. La plantilla no queda marcada como la rutina que se edita.
- Guardar ese plan crea una **rutina nueva** con identidad propia y deja la plantilla intacta. La plantilla y la rutina nueva aparecen las dos en la lista de rutinas guardadas.
- Mientras la rutina nueva no se ha guardado, no se ofrece eliminar la plantilla de origen.
- Al **editar una rutina existente**, guardar actualiza esa misma rutina. Un segundo guardado en el plan nuevo actualiza la rutina creada por el primero.
- El nombre de la plantilla se mantiene como punto de partida editable; no se añade ningún sufijo automático y se permiten dos rutinas con el mismo nombre.

## Temporizador: tiempo extra, total y avisos

- Con **Seguir contando al terminar el bloque** activo, al llegar a cero el reloj grande deja de mostrar `0:00` y pasa a mostrar el tiempo extra con signo (`+0:12`) en verde. El bloque sigue corriendo hasta que se avanza.
- Con la opción desactivada, el reloj se queda en `0:00`.
- **Bloque terminado** y **Tiempo cumplido** se muestran como un toast breve que se anuncia como estado y desaparece solo; no tapa el reloj ni los botones.
- El **tiempo total** de la sesión tiene su propia fila **encima** del reloj grande, con el mismo formato `mm:ss` o `h:mm:ss`. En las prácticas de tiempo acumulado el reloj grande ya es el total, así que la fila no se repite.
- Si el bloque sigue en tiempo extra con la tarjeta fuera de pantalla, la barra flotante muestra solo el tiempo sumado en verde (`+0:12`), sin el `0:00` blanco. Sin tiempo extra mantiene el tiempo restante normal.
- Al avanzar al siguiente bloque, el tiempo extra y el toast desaparecen y el nuevo bloque empieza con su tiempo completo.

## Rutina por día

- Las siete tarjetas de la planificación semanal comparten altura, relleno y ancho de selector en todos los tamaños de pantalla.
- Los días sin rutina asignada ocupan el mismo espacio que los días con rutina.
- Un nombre de rutina largo se recorta dentro del selector sin ensanchar la tarjeta ni romper la cuadrícula.
- En pantallas estrechas las tarjetas se reparten en menos columnas sin desbordamiento horizontal.

## Catálogos de técnica y teoría

- Las técnicas de lick y de bloque y los temas de teoría salen de catálogos únicos (`src/utils/catalogs/techniques.ts` y `src/utils/catalogs/theory.ts`). Cada entrada tiene un nombre en español y su nombre original.
- Un bloque nuevo guarda el **nombre original** como valor canónico; los bloques antiguos que guardaron el nombre en español se resuelven igual.
- Los bloques de técnica y de teoría usan un buscador. El buscador encuentra la entrada por cualquiera de los dos nombres, sin distinguir mayúsculas ni acentos.
- Un nombre personalizado de una rutina antigua sigue apareciendo como opción y se muestra tal como se guardó.
- La preferencia **Nombres de las técnicas** de Configuración decide si se muestra el nombre español o el original en el editor, la tabla del plan, los bloques siguientes, la práctica en curso y los análisis.
- El análisis agrupa la misma técnica o el mismo tema aunque unas prácticas lo guardaran en español y otras en el original.

## Tiempo objetivo

- El control **Fijar un tiempo objetivo** aparece solo en la práctica rápida de técnica, en la práctica rápida de repertorio y en la práctica libre que se confirma desde una canción del repertorio.
- Las **rutinas guardadas** y los planes construidos en el editor de rutinas no muestran el control, aunque se inicien desde la pantalla de práctica.
- Un objetivo que ya estuviera guardado en una rutina antigua se descarta al restaurar la sesión, para no dejar un temporizador con una cuenta atrás invisible.
- El objetivo sigue pausando el temporizador y mostrando el aviso **Tiempo cumplido** cuando se alcanza.


