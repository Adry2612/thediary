# Repertorio

El repertorio guarda canciones y sus partes. Cada canción puede llevar afinación, capo, tipo de guitarra, dificultad, material, cifrado y datos de catálogo (álbum, año y carátula).

## Buscar datos de catálogo

- La búsqueda de catálogo está disponible al crear una canción y también al editar una que ya existe. En una canción guardada, el icono de lápiz de la cabecera abre la búsqueda; al pasar el ratón o al enfocarlo con el teclado muestra **Editar datos del tema**. El icono no abre la ficha de la canción cuando se pulsa desde la lista.
- Al elegir un resultado se abre una **vista previa** con los valores actuales y los nuevos de título, artista, álbum y año. Las filas que cambian se destacan.
- La carátula actual y la nueva se muestran como imágenes, sin enseñar su URL. Si un lado no tiene carátula aparece un marcador **Sin carátula** en lugar de un hueco vacío.
- Solo se guarda al confirmar **Aplicar cambios**. Si se cancela o se cierra la vista previa, la canción queda exactamente como estaba.
- Al aplicar, el título y el artista se toman del candidato y los campos opcionales solo se actualizan si el candidato los trae. Un álbum, año o carátula que el candidato no proporcione no se vacía.
- El título sigue siendo editable después de aplicar, así que se puede renombrar la canción (por ejemplo, para añadir «(acústico)») sin perder el resto de datos del catálogo.
- La afinación, el capo, las partes, el cifrado y el material de estudio nunca se tocan desde el buscador.
- La creación de una canción nueva sigue aplicando el candidato directamente al formulario, porque todavía es un borrador editable.

## Afinaciones

- Las afinaciones conocidas salen de un catálogo único (`src/utils/catalogs/tunings.ts`): estándar, Drop D, Drop C, estándar en Re, estándar en Do, Open G, Open D, Open E, DADGAD y medio tono abajo.
- Los formularios y la ficha muestran la afinación según la preferencia **Afinaciones** de Configuración: por nombre (`Drop D`, `Estándar`) o por cuerdas (`DADGBE`, `EADGBE`).
- La etiqueta cambia, pero el valor guardado de la canción no. Una afinación personalizada o desconocida se muestra tal como se escribió.
- El afinador usa el mismo catálogo para las etiquetas de sus presets, así que el nombre y las cuerdas que se ven coinciden con los del repertorio.

