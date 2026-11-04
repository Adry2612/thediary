# Evolución

El panel de evolución muestra la constancia, el tiempo y las habilidades de práctica. Los gráficos son DOM normal: barras, celdas de calendario y barras de habilidad.

## Animación de los gráficos

- Las barras del ritmo de práctica crecen desde la línea base con `scaleY` y un retardo escalonado.
- Las barras del balance de habilidades crecen desde la izquierda con `scaleX`, sin cambiar el ancho de su hueco.
- Las celdas del mapa de calor entran con opacidad y un pequeño `scale`.
- El calendario anual entra como una sola rejilla con opacidad y un desplazamiento mínimo. No se animan sus más de 300 celdas una a una para no multiplicar el trabajo del compositor.
- La animación se repite solo al cambiar el periodo, el mes o el año; no se reinicia al pasar el ratón, al enfocar una barra ni al volver a renderizar el panel por otro motivo.
- La duración máxima es de 500 ms, contando el retardo escalonado, que nunca empieza más tarde de 140 ms.
- Todo el movimiento usa solo `opacity` y `transform`, así que no mueve el layout ni desplaza las etiquetas.
- Un periodo o mes sin práctica no anima sus celdas: muestra directamente su estado vacío.
- Con **reducir movimiento** activado en el sistema, los gráficos aparecen directamente en su estado final, sin transición ni escalonado.
