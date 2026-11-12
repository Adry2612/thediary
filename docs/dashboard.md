# Evolución

El panel de evolución muestra la constancia, el tiempo y las habilidades de práctica. Los gráficos son DOM normal: barras, celdas de calendario y barras de habilidad.

## Periodos móviles

- La **semana** son los 7 días que terminan hoy. Un martes empieza el miércoles anterior.
- El **mes** son los 30 días que terminan hoy.
- El **año** son los 12 meses naturales que terminan con el mes actual. El primer y el último mes se recortan a los días del rango.
- Ningún periodo incluye días posteriores a hoy.
- Cada comparación usa el tramo inmediatamente anterior de la misma longitud. La semana compara con los 7 días anteriores, el mes con los 30 anteriores y el año con los mismos meses un año antes.
- El resumen semanal superior es la excepción: sigue mostrando la semana natural —de lunes a domingo por defecto, o de domingo a sábado si así se elige en Configuración— y no responde a los selectores de periodo.

## Tarjetas y rankings

El resumen final se divide en dos grupos con títulos propios, con el periodo arriba y el histórico debajo:

- **En el periodo** reúne tiempo practicado, BPM medio y apartado más practicado. Tiene su **propio selector** (semana, 30 días o año), independiente del gráfico de ritmo, y arranca en **30 días**. Al cambiarlo solo se recalculan esas tres tarjetas.
- **Resumen histórico** reúne los totales de todo el historial: días practicados, racha, sesiones registradas y horas de práctica. No cambia al mover ningún periodo.
  - **Días practicados** cuenta días únicos, no sesiones: varias sesiones el mismo día suman una. Debajo muestra cuántos son del año natural actual y cuántos de años anteriores.
  - **Racha actual** muestra el tramo consecutivo que sigue vivo. Si es la mejor racha del historial, la tarjeta lo dice y muestra una medalla en lugar del récord anterior; si no, debajo aparece la mejor racha como referencia.
  - **Horas de práctica totales** deja claro que suma todo el historial, no el periodo.

El ranking de canción, técnica y teoría tiene su **propio selector** de periodo (semana, 30 días o año), independiente del ritmo, y arranca en **30 días**. Cambiar el ritmo no lo mueve.

El ranking de canciones cuenta tanto las canciones enlazadas al repertorio como las referencias al catálogo que todavía no se han añadido.

El balance de habilidades y el balance de guitarras tienen cada uno su propio selector de periodo, ambos con 30 días por defecto: cambiar uno no altera el otro.
- El calendario anual muestra el año natural actual. Cuando el historial incluye años anteriores, el año del título se convierte en un menú discreto con los años disponibles; el año actual aparece marcado como «Este año».
- Al elegir un año anterior, el panel pasa a una **vista anual**: resumen del año, calendario completo, ritmo por meses, balances, ranking de contenido, bienestar y un cierre compacto con BPM medio y apartado más practicado, calculados solo con las sesiones de ese año. El cierre no repite las sesiones, el tiempo, los días practicados ni la mejor racha que ya muestra el resumen anual. Los selectores de periodo se ocultan porque la ventana es el año completo. El año actual conserva el panel de siempre.
- La vista anual compara el tempo con el año anterior y permite volver al año actual desde la cabecera.
- El gráfico de bienestar solo aparece cuando ánimo o foco están activados en Configuración y hay datos de esa métrica; si no, no se muestra.

## Animación de los gráficos

- Las barras del ritmo de práctica crecen desde la línea base con `scaleY` y un retardo escalonado.
- Las barras del balance de habilidades crecen desde la izquierda con `scaleX`, sin cambiar el ancho de su hueco.
- Las celdas del mapa de calor entran con opacidad y un pequeño `scale`.
- El calendario anual entra como una sola rejilla con opacidad y un desplazamiento mínimo. No se animan sus más de 300 celdas una a una para no multiplicar el trabajo del compositor.
- La animación se repite solo al cambiar el periodo o el año; no se reinicia al pasar el ratón, al enfocar una barra ni al volver a renderizar el panel por otro motivo.
- La duración máxima es de 500 ms, contando el retardo escalonado, que nunca empieza más tarde de 140 ms.
- Todo el movimiento usa solo `opacity` y `transform`, así que no mueve el layout ni desplaza las etiquetas.
- Un periodo o año sin práctica no anima sus celdas: muestra directamente su estado vacío.
- Con **reducir movimiento** activado en el sistema, los gráficos aparecen directamente en su estado final, sin transición ni escalonado.
