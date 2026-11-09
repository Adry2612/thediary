# Evolución

El panel de evolución muestra la constancia, el tiempo y las habilidades de práctica. Los gráficos son DOM normal: barras, celdas de calendario y barras de habilidad.

## Periodos móviles

- La **semana** son los 7 días que terminan hoy. Un martes empieza el miércoles anterior.
- El **mes** son los 30 días que terminan hoy.
- El **año** son los 12 meses naturales que terminan con el mes actual. El primer y el último mes se recortan a los días del rango.
- Ningún periodo incluye días posteriores a hoy.
- Cada comparación usa el tramo inmediatamente anterior de la misma longitud. La semana compara con los 7 días anteriores, el mes con los 30 anteriores y el año con los mismos meses un año antes.
- El resumen semanal superior es la excepción: sigue mostrando la semana natural de lunes a domingo y no responde a los selectores de periodo.

## Tarjetas y rankings

- Las tarjetas de tiempo, sesiones, BPM medio, horas y apartado más practicado usan el mismo periodo que el gráfico de ritmo.
- Al cambiar el periodo del ritmo, esas tarjetas se recalculan con la nueva ventana.
- El ranking de canción, técnica y teoría también usa la ventana del ritmo.
- **Racha actual** y **racha más larga** son históricas: no cambian al cambiar el periodo. La racha más larga es el mejor tramo de días consecutivos de todo el historial.
- El calendario anual sigue mostrando el año natural actual.
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
