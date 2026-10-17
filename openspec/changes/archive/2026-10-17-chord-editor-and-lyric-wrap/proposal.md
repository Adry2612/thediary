# Proposal

## Why

La letra con acordes y el selector ya existen, pero al usarlos aparecen dos límites que echan a perder lo más útil: una línea larga obliga a hacer scroll horizontal (una letra no se lee así), y la caja del acorde es una lista plana de 55 formas con el nombre en un campo aparte, sin estructura y sin forma de guardar posiciones propias. Eso empuja a salir de la app justo para entender y anotar la armonía.

## What Changes

- **La letra se envuelve**: cuando una frase no cabe, se parte por palabra y continúa en la línea siguiente, sin scroll horizontal. Un salto de línea marca la frase y una línea en blanco marca el cambio de estrofa; varias en blanco seguidas cuentan como un solo salto. Es solo vista: el texto y el anclaje de los acordes no cambian.
- **La caja del acorde se reestructura**: el nombre pasa a ser un campo **editable y en grande** que es la fuente única de verdad; los selectores y el dibujo se derivan de él cuando se puede interpretar.
- **Selectores Nota + Tipo**: la fundamental y el tipo se eligen por separado. El selector de Tipo trae dos bloques: **Acordes** (librería y formas generadas) y **Personalizados** (los acordes del usuario, señalizados). Los acordes sin fundamental interpretable caen en un grupo "Personalizados" general.
- **Generador de formas**: para las combinaciones que no están en la librería, la forma se calcula con formas movibles por tipo. Prioridad al resolver: personalizado → librería → generador.
- **Acordes propios del usuario**: se pueden guardar, reutilizar entre canciones y borrar. Se persisten con los datos del usuario (campo nuevo, sin migración) y se sincronizan como el resto.
- **Botones `Asignar` / `Quitar`**: `Quitar` solo se activa cuando la posición seleccionada ya tiene un acorde.
- **Etiqueta de procedencia**: la caja muestra "personalizado" cuando la forma sale de los acordes guardados del usuario.
- `SelectField` aprende **grupos con cabecera** para separar los bloques del selector de Tipo.

No hay cambios rotundos: los campos nuevos son opcionales y los datos siguen viajando como JSON, así que las canciones y acordes ya existentes siguen funcionando.

## Capabilities

### New Capabilities

- `user-chord-library`: biblioteca de acordes propia del usuario (guardar, reutilizar entre canciones y borrar), persistida y sincronizada junto a sus datos y acotada a su cuenta.

### Modified Capabilities

- `repertoire-song-editor`: la letra se envuelve por palabra y separa estrofas; el selector de acordes gana un nombre editable como fuente de verdad, selectores estructurados de nota y tipo con bloque de personalizados, formas generadas para las combinaciones que faltan, etiqueta de procedencia y la regla de activación de `Quitar`.

## Impact

- Lógica pura nueva: envoltura de la letra (`wrapLyricLine` y el cálculo de columnas por ancho) y resolución de formas por prioridad; el vocabulario estructurado y el generador en la librería de acordes.
- Modelo y persistencia: `UserChord` y el campo `customChords` en el estado por usuario, con su merge local/Supabase.
- Componentes: `ChordChartEditor` (envoltura), `ChordPicker` (caja), `FretboardDiagram` (etiqueta), `SelectField` (grupos).
- Primitiva compartida: los grupos del `SelectField` afectan a cualquier uso del desplegable.
- i18n en español e inglés y pruebas nuevas para las librerías puras.

## Notes

Se puede abordar por fases (caja → generador → acordes propios); los dos primeros ya dan la experiencia completa y el tercero añade la colección del usuario. La envoltura de la letra es independiente del resto.
