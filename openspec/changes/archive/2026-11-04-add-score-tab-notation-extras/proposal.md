# Proposal

## Why

`add-score-tab-editor` cubre el núcleo del editor: pulsos con duración, silencios, ligaduras, compases, técnicas, deshacer y reproducción. El vídeo de referencia (Songsterr) va más lejos: dinámicas, crescendo, repeticiones con finales, secciones, texto, diagramas de acorde, dirección de púa, rasgueo, apoyaturas y calderón. Sin ellos no se puede transcribir una canción completa con su expresión, que es lo que se pidió («poder hacer los tabs y editarlos tal cual»). Se separa del cambio base para que el editor pueda cerrarse y usarse sin esperar a estas marcas.

## What Changes

- **Dinámicas** (pp, p, mp, mf, f, ff) en un pulso, con efecto en el volumen de la reproducción.
- **Crescendo y decrescendo** sobre un rango de pulsos, dibujados como reguladores y con efecto gradual en el sonido.
- **Repeticiones** que se abren y se cierran con número de veces, y **finales alternativos** (1.ª, 2.ª vez); la reproducción las respeta.
- **Marcas de sección** con nombre sobre un compás.
- **Texto libre** sobre un pulso.
- **Diagrama de acorde** asociado a un pulso, tomado de la biblioteca de acordes cuando el nombre se conoce.
- **Dirección de púa** (abajo/arriba) y **rasgueo** sobre un pulso.
- **Apoyatura** antes del tiempo o sobre el tiempo, con su traste.
- **Calderón** sobre un pulso, que alarga su reproducción.
- **Compás anacrúsico** que no se marca como incompleto.
- La paleta añade estos grupos, explica por qué una opción no está disponible (por ejemplo, una apoyatura sobre un silencio) y las marcas se copian, pegan, deshacen y se leen en la alternativa textual.
- Las partituras guardadas por `add-score-tab-editor` siguen abriéndose sin cambios: los campos nuevos son opcionales.

Fuera del alcance: varias voces o pistas, letra, armadura, palanca de vibrato, octavaciones (8va), importar o exportar Guitar Pro y otras marcas de articulación no incluidas arriba (staccato, ritardando).

## Capabilities

### New Capabilities

- `tab-score-notation`: las marcas de expresión y de estructura de una tablatura por compases: dinámicas, reguladores, repeticiones y finales, secciones, texto, diagramas de acorde, dirección de púa, rasgueo, apoyaturas, calderón y compás anacrúsico, su edición, su dibujo y su efecto en la reproducción.

### Modified Capabilities

Ninguna. Depende de que `add-score-tab-editor` esté aplicado y archivado, y no redefine requisitos de `tab-score-editor`.

## Impact

- **Código:** extiende `src/utils/tab-score/` (modelo, operaciones, AlphaTex, texto alternativo), el catálogo y el estado de la paleta, y los diálogos de texto, sección, acorde y repeticiones en `src/components/tab-score/`.
- **Datos:** campos opcionales nuevos en `TabBar` y `TabBeat` dentro de `score`; sin subir `version`. No toca `tab` ni el contrato con la app iOS.
- **Dependencias:** ninguna nueva; usa alphaTab y la biblioteca de acordes ya presentes.
- **Tests:** nuevos para normalización, operaciones, mapeo a AlphaTex e ida y vuelta por cada marca, y ampliación de los del cambio base.
- **Orden:** se aplica y archiva después de `add-score-tab-editor`.
