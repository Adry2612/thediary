# Proposal

## Why

Al enfocar algunos campos de texto en móvil —sobre todo en horizontal, donde los estilos de escritorio reducen la tipografía a 14 px o menos— el navegador amplía la página sola y la app deja de comportarse como una aplicación nativa. Además, cada pantalla define sus propios márgenes, anchos y espaciados, así que el contenido salta al navegar entre Inicio, Dashboard, Metrónomo y el resto; los subtítulos en mayúsculas sobre cada encabezado añaden ruido, y "Tu práctica" titula tres secciones distintas sin decir en qué se diferencian.

Por separado, al registrar una práctica anterior desde el Dashboard no existe ningún buscador de repertorio: el bloque solo admite un nombre libre, así que el tiempo practicado de una canción no se acredita a ese elemento del repertorio.

## What Changes

- **BREAKING** (comportamiento de la app): el documento deja de permitir cualquier zoom. El viewport fija `maximum-scale=1` y `user-scalable=no`, y los controles de texto mantienen al menos 16 px en todos los breakpoints, no solo en móvil. Se elimina el zoom por pinch que hoy exige la spec de la shell móvil.
- Todas las pantallas de la app comparten una única shell de página: misma columna de contenido, mismos márgenes laterales, mismo ritmo vertical y mismos estados de carga, de modo que los bordes no se mueven al cambiar de pantalla.
- Los encabezados dejan de mostrar el subtítulo en mayúsculas sobre el título, tanto en las páginas como en los diálogos.
- Cada sección pasa a tener un nombre propio: Inicio es "Tu diario", Dashboard es "Tu evolución" y Práctica mantiene "Tu práctica"; en el menú, la primera entrada sigue siendo "Inicio" —para no repetir el nombre de la app, que ya está en la cabecera— y la segunda pasa a "Evolución".
- El registro de una práctica anterior ofrece el buscador de canciones del repertorio en los bloques de tipo Repertoire. Enlazar una canción toma su título como nombre del bloque y hace que el tiempo acredite al elemento; enlazar sigue siendo opcional para no bloquear prácticas antiguas.

Out of scope:

- Rediseño de la landing de marketing, que conserva su propio encabezado y su ancho.
- Cambiar el cálculo de estadísticas, la fusión de datos o el formato de los registros guardados: el enlace de repertorio reutiliza los campos que ya existen en cada bloque.
- Añadir el buscador de canciones al editor de prácticas guardadas; ese editor ya conserva los enlaces actuales aunque no los edite.
- Reordenar o rediseñar el contenido interno de cada pantalla más allá de la shell y el encabezado.
- Tocar la tipografía del editor de tablaturas, que no usa campos de texto nativos.

## Capabilities

### New Capabilities

- `app-layout`: la shell común de las pantallas de la app, el encabezado de página sin subtítulo y el nombre propio de cada sección, incluida su etiqueta de navegación.

### Modified Capabilities

- `pwa-mobile-shell`: el requisito de no ampliar la página al enfocar un control pasa a prohibir cualquier zoom y a exigir 16 px en todos los breakpoints.
- `practice-session-management`: el registro manual de una práctica permite enlazar cada bloque de repertorio con una canción del repertorio y acreditar así su tiempo.

## Impact

- `src/app/layout.tsx` para el viewport sin zoom.
- `src/app/globals.css` para la tipografía mínima de los controles y el comportamiento táctil.
- `src/components/ui/Field.tsx`, `src/components/ui/AdjustableNumber.tsx` y los títulos editables de `src/components/repertoire/RepertoireItemCard.tsx`, que hoy reducen la tipografía en escritorio.
- Nueva primitiva de shell/encabezado en `src/components/ui/` y su adopción en `HomeView`, `DashboardView`, `PracticeWorkspace`, `MetronomePage`, `LicksView`, `RepertoireView`, `RecordingsLibrary`, `SettingsView`, `AccountView`, `PracticeDayDetail` y las páginas de detalle.
- `src/components/ui/Skeletons.tsx` para que los estados de carga midan igual que la pantalla final.
- `src/i18n/es.ts` y `src/i18n/en.ts` para los títulos, las etiquetas de navegación y la retirada de los textos de subtítulo que queden sin uso.
- `src/utils/manual-practice.ts`, `src/utils/practice-session-editing.ts`, `src/components/dashboard/ManualPracticeEntry.tsx` y el repertorio del store para el buscador de canciones del registro manual.
- Tests de Node para la validación del registro manual y para la configuración de los campos y de los textos.
