# Design

## Context

Ver `proposal.md`. El lick ya tiene ficha propia (`/licks/[id]`), editor a pantalla completa y normalización al cargar. Ya existe `extractYoutubeVideoId` para validar enlaces de YouTube y `ResourcePreview` incrusta vídeos sin marcas de tiempo, pero el material de práctica pertenece a la canción, no al lick.

## Goals / Non-Goals

**Goals:**

- Guardar un único fragmento de YouTube por lick sin romper los licks existentes.
- Validar el enlace y los tiempos antes de guardar y también al cargar datos antiguos.
- Repetir exactamente el fragmento marcado en la ficha del lick.

**Non-Goals:**

- Varios vídeos por lick o vídeos compartidos con la canción.
- Elegir el fragmento reproduciendo el vídeo dentro de la app.
- Descargar, transcribir o extraer audio del vídeo.
- Mostrar el vídeo en la sesión de práctica o en el listado de licks.

## Decisions

### 1. El clip es un campo opcional del lick

`GuitarLick` gana `referenceVideo?: { url: string; startSeconds: number; endSeconds: number }`.

- Se guarda la URL tal como la pega el usuario y los segundos ya normalizados, no el `videoId` derivado: la URL sirve para el enlace externo y para mostrar el mismo texto que escribió.
- Alternativa descartada: guardar solo `videoId`, más compacto pero pierde el enlace original y obliga a reconstruirlo.
- Alternativa descartada: guardarlo en la canción y que cada lick herede el vídeo. El usuario quiere el fragmento en el lick y hay licks sin canción.

### 2. Validación y normalización compartidas

Un módulo nuevo, `src/utils/licks/reference-video.ts`, concentra:

- `parseClipTime`: acepta `83`, `1:23` y `1:02:03`, rechaza negativos, decimales y valores por encima de 24 horas.
- `formatClipTime`: devuelve `m:ss` o `h:mm:ss` para la ficha.
- `normalizeReferenceVideo`: valida la URL con `extractYoutubeVideoId`, exige `0 <= inicio < fin` y devuelve `undefined` si algo no encaja.
- `validateReferenceDraft`: la misma comprobación para los campos del editor, devolviendo un motivo para el mensaje.

`normalizeLick` usa `normalizeReferenceVideo` y descarta solo el clip inválido, igual que ya hace con la tonalidad o las técnicas. El editor bloquea el guardado con un mensaje si el borrador no vale.

- Alternativa descartada: validar en el editor y confiar en los datos guardados. Un lick antiguo o sincronizado podría traer un clip roto y romper la ficha.

### 3. Reproductor con la IFrame Player API

`LickReferenceVideo` es un componente cliente que carga `https://www.youtube.com/iframe_api` una sola vez y crea el reproductor con `playerVars.start` y `playerVars.end`.

- Al terminar (`YT.PlayerState.ENDED`) vuelve a `startSeconds` y reproduce: el parámetro `loop=1` de un iframe normal repite el vídeo entero, no el fragmento.
- Sin autoplay: los navegadores lo bloquean con sonido y el vídeo no debe sonar al abrir la ficha. El usuario pulsa play y el bucle funciona desde ahí.
- `playsinline: 1` para que iOS no abra el vídeo a pantalla completa.
- Si la API no carga (bloqueo, red o extensión), se pinta un iframe con `start` y `end` y el enlace externo; se pierde el bucle pero la ficha sigue siendo útil.
- El reproductor se destruye al desmontar y se recrea si cambian el vídeo o los tiempos.

- Alternativa descartada: iframe con `start`, `end`, `loop=1` y `playlist`: el bucle vuelve al principio del vídeo, no al inicio del fragmento.
- Alternativa descartada: cargar la API en el layout global. Solo se necesita en una ficha; cargarla allí evita coste en el resto de la app.

### 4. Sitio en la interfaz

- Editor: sección **Vídeo de referencia** con enlace, desde y hasta, debajo de los datos del lick y antes de la tablatura.
- Ficha: tarjeta entre la cabecera y la tablatura, con el reproductor, la línea “Del 1:23 al 1:35” y el enlace a YouTube en el segundo de inicio.
- El listado de licks y la sesión de práctica no cambian.

### 5. Seguridad y datos

- Solo se interpola en el iframe el `videoId` que pasa el patrón existente (`[\w-]{6,20}`); la URL solo se usa en el enlace externo después de validarla.
- No hay cambio de versión del modelo: el campo es opcional, la normalización tolera datos antiguos y la sincronización mezcla los licks por identidad sin tocar el resto.
- Los tiempos se guardan en segundos enteros, sin zona horaria ni formato local.

## Risks / Trade-offs

- [YouTube busca el fotograma clave más cercano al inicio] → El corte puede empezar unas décimas antes o después; se muestran los segundos exactos y se acepta como aproximación de referencia.
- [La API externa puede tardar o estar bloqueada] → Iframe de respaldo con `start`/`end` y enlace externo; la ficha nunca se queda en blanco.
- [El fin puede superar la duración real del vídeo] → El reproductor para al terminar el vídeo; no se valida contra la duración porque exigiría la API antes de guardar.
- [El bucle puede sorprender si el usuario quiere ver el vídeo completo] → El enlace “Abrir en YouTube” abre el vídeo normal; el bucle solo afecta al reproductor incrustado.

## Migration Plan

No hay migración: el campo es opcional. Los datos antiguos se cargan sin clip. Si se revierte la versión, los licks con clip se cargan ignorando el campo, sin perder el resto.

## Open Questions

Ninguna.
