# Práctica

El editor de una práctica guardada vive en `/dashboard/practice/[date]`, en el detalle del día. Cada sesión se puede abrir, editar y volver a guardar sin perder su identidad en el historial.

## Editar una práctica guardada

- **Tiempo real** de cada bloque y **duración** de una sesión sin bloques se muestran como reloj: `1:23` (minutos y segundos) o `1:02:03` (horas, minutos y segundos).
- Al escribir se aceptan las mismas formas: `83` segundos, `1:23` o `1:02:03`. El valor se guarda en segundos, sin redondear a minutos decimales.
- Un campo vacío de un bloque vale cero. Un texto inválido se marca junto al campo y el resto de cambios se conserva; no aparece el error nativo del navegador por el `step` de un `input[type=number]`.
- El total de la cabecera de bloques se deriva de los segundos editados y se muestra también como reloj.
- El tiempo planificado sigue siendo un número entero de minutos.
- Al guardar, la práctica conserva sus vínculos de repertorio, lick, material, BPM medio y tipo de guitarra.

## Formatos de tiempo compartidos

`src/utils/clock-time.ts` es la fuente única para interpretar y formatear tiempos. Lo usan la edición de prácticas y el vídeo de referencia de un lick, así que ambos aceptan los mismos formatos y rechazan negativos, decimales, partes de 60 o más y valores de 24 horas o más.

## Temporizador: tiempo extra, total y avisos

- Con **Seguir contando al terminar el bloque** activo, al llegar a cero el reloj grande deja de mostrar `0:00` y pasa a mostrar el tiempo extra con signo (`+0:12`) en verde. El bloque sigue corriendo hasta que se avanza.
- Con la opción desactivada, el reloj se queda en `0:00` y aparece el mismo aviso integrado.
- **Bloque terminado** y **Tiempo cumplido** se muestran como un aviso dentro de la tarjeta, debajo del distintivo de la categoría, en lugar de un toast flotante. El aviso se anuncia como estado y se cierra solo; no tapa el reloj ni los botones.
- El **tiempo total** de la sesión tiene su propia fila bajo el reloj, con el mismo formato `mm:ss` o `h:mm:ss`. En las prácticas de tiempo acumulado el reloj grande ya es el total, así que la fila no se repite.
- Al avanzar al siguiente bloque, el tiempo extra y el aviso desaparecen y el nuevo bloque empieza con su tiempo completo.

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


