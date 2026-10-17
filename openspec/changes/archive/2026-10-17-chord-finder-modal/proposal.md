# Proposal

## Why

El buscador de acordes funciona, pero su disparador es un botón a lo ancho de la caja que pesa más que todo lo demás y desentona con el resto del panel. Además, al abrirse **dentro** de la caja empuja hacia abajo el control de posición y el mástil: el mismo salto de siempre, ahora provocado por el buscador.

## What Changes

- **Disparador compacto**: el botón a lo ancho pasa a ser un botón pequeño con icono de lupa en la esquina del campo del nombre (con nombre accesible para lectores de pantalla).
- **El buscador se abre en una modal**: el filtro, los acordes estándar agrupados por nota y el grupo "Personalizados" se muestran en un diálogo centrado, reutilizando el patrón `<dialog>` que ya usa la app.
- **La caja no se mueve**: al abrir y cerrar el buscador, la caja del acorde conserva su tamaño y el mástil no se desplaza.

Sin cambios de datos ni de lógica: el buscador sigue escribiendo el nombre, que sigue siendo la fuente de verdad.

## Capabilities

### Modified Capabilities

- `repertoire-song-editor`: el buscador de acordes se abre desde un disparador compacto y se muestra sobre la página sin redimensionar la caja del acorde.

## Impact

- `ChordPicker`: el campo de nombre gana el botón de lupa; se retira el botón ancho.
- `ChordFinder` pasa a ser un diálogo controlado (`ChordFinderDialog`) con el mismo contenido que ya tenía.
- Nuevo icono de lupa en `src/components/ui/icons.tsx` y dos etiquetas nuevas de i18n.
- Cambia un requisito del spec del editor (el selector sobre el mástil); la lógica de acordes y el guardado no se tocan.

## Notes

Formato elegido al revisar la propuesta: **modal pequeño**. Se descartan el panel dentro de la caja (redimensiona la caja) y el panel flotante anclado (más trabajo de anclaje y z-index, sin primitiva en el kit).
