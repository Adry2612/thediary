# Proposal

## Why

La caja del acorde tiene dos roces de uso. El control de posición vive **debajo** del dibujo, así que cuando la forma pisa trastes altos el diagrama crece y el control salta de sitio justo cuando lo vas a pulsar. Y en la parte de abajo quedan dos selectores (Nota y Tipo) que compiten con el nombre del acorde de arriba: el nombre ya es la fuente de verdad, así que tener otra vez nota y tipo en desplegables separados se siente redundante y deja los acordes guardados escondidos dentro del selector de tipo.

## What Changes

- **Control de posición por encima del dibujo**: el `‹ Posición k/n ›` pasa a ir entre el nombre y el mástil, de forma que no se mueve aunque la ventana de trastes cambie.
- **Un buscador de acordes en lugar de los dos selectores**: se quita Nota + Tipo y en su lugar hay un botón que abre un buscador con campo de texto, los acordes estándar agrupados por nota y un grupo "Personalizados"; al elegir un acorde se escribe el nombre y se actualiza el dibujo.
- **El nombre sigue siendo la fuente de verdad**: el buscador solo escribe el nombre; teclearlo a mano sigue funcionando igual, y un nombre que no se reconoce se conserva tal cual.

Sin cambios de datos ni de migración: es una reordenación de la caja y una sustitución de los dos selectores.

## Capabilities

### Modified Capabilities

- `repertoire-song-editor`: el selector de acorde pasa a ser un buscador (en vez de los selectores de nota y tipo), el control de posición se coloca encima del dibujo y los acordes guardados se agrupan dentro del buscador.

## Impact

- `ChordPicker`: se reordena (posición arriba) y se sustituyen los `SelectField` de Nota/Tipo por el buscador.
- Etiquetas nuevas de i18n en español e inglés.
- Cambian tres requisitos del spec del editor (selector sobre el mástil, nombre editable que manda, acordes guardados agrupados); la lógica de acordes no se toca.

## Notes

El buscador es un panel desplegable dentro de la propia caja, cerrado por defecto y con altura máxima con scroll (decisión tomada al revisar el proposal).
