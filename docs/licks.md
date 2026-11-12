# Licks

Un lick es una idea corta —una frase, un ejercicio o un fragmento de una canción— con su propio material de estudio, tempo y técnicas. Vive en `/licks`, se edita a pantalla completa en `/licks/new` y `/licks/[id]/edit`, y se lee en `/licks/[id]`.

La tablatura ya no se dibuja dentro del lick: se adjunta como material, igual que en una práctica o una canción. El editor de partitura antiguo se retiró y los datos de texto que guardaba se descartan al normalizar el estado.

## Material de estudio

- Cada lick puede llevar uno o varios recursos: archivos Guitar Pro (`.gp`, `.gpx`, `.gp3`–`.gp5`), PDF, imagen, Songsterr, YouTube, Spotify o un enlace HTTPS.
- El editor reutiliza `PracticeResourceEditor`: permite subir un archivo, pegar un enlace o elegir una entrada de la biblioteca de materiales.
- Al adjuntar desde la biblioteca se guarda una copia con su propio identificador; editar o borrar la entrada original no cambia el lick.
- La ficha y la práctica muestran `LickMaterials`, con una lista de recursos y el visor que corresponde a cada uno (`ResourcePreview`).
- Las tarjetas de la biblioteca resumen hasta tres materiales del lick.
- Un recurso con un tipo retirado o sin identidad se descarta al cargar; el resto del lick se conserva.

## Guardar sin terminar la ficha

El editor tiene dos guardados:

- **Guardar lick** valida el título y el BPM objetivo, guarda todo y vuelve a la ficha.
- **Guardar borrador** guarda el material y los campos que ya sean válidos, sin exigir BPM, canción ni técnicas, y **se queda en el editor**.

Si el título está vacío, el borrador se guarda como «Sin título» (`licks.untitled`) y aparece en la biblioteca como un lick normal. El primer guardado de un lick nuevo fija su id; los siguientes actualizan el mismo registro, y el «Guardar lick» final completa la ficha. Un BPM vacío o fuera de 40–240 no bloquea el borrador: se ignora y se conserva el que ya tuviera el lick.

El aviso «Borrador guardado» se anuncia con `role="status"` y desaparece en cuanto se toca cualquier campo.

## Tonalidad

La tonalidad es opcional y se elige a mano entre las doce raíces mayores y menores. El editor ya no la deduce de la tablatura porque no hay una partitura editable; el campo se guarda tal cual y se muestra en la ficha y en las tarjetas.

## Técnicas

Las técnicas de un lick salen de un catálogo único compartido con los bloques de práctica (`src/utils/catalogs/techniques.ts`). Cada entrada tiene un id estable, un nombre en español, su nombre original y una marca corta para las tarjetas.

- Un lick guarda el id de la técnica, no el texto visible, así que cambiar el idioma de presentación no altera sus datos.
- En Configuración se elige si las técnicas se muestran en español o con su nombre original. La preferencia se aplica a las tarjetas, la ficha, el editor, los bloques de práctica y la distribución de técnicas.
- Con la interfaz en español, el modo original respeta los nombres propios (`Sweep picking`, `Palm mute`) pero mantiene en español los que solo son una traducción, como `Strumming` → `Rasgueo`. Si la interfaz está en inglés, se usa siempre el nombre original.
- Sin una elección guardada, se sigue el idioma de la interfaz.
- Los nombres personalizados de bloques de rutinas antiguas no forman parte del catálogo y se muestran tal como se guardaron.

## Vídeo de referencia

Un lick puede llevar **un** fragmento de YouTube opcional:

```ts
referenceVideo?: {
  url: string;
  startSeconds: number;
  endSeconds: number;
}
```

- Se guarda la URL tal como se escribe y los segundos ya normalizados, no el `videoId` derivado.
- El editor pide enlace, desde y hasta. Acepta segundos (`83`) y `m:ss`/`h:mm:ss` (`1:23`, `1:02:03`), rechaza negativos, decimales, más de 24 horas y un final igual o anterior al inicio. El clip y la edición de prácticas comparten este parser (`src/utils/clock-time.ts`), así que los formatos y el límite son los mismos en toda la app.
- El enlace tiene que ser de YouTube (`extractYoutubeVideoId`); cualquier otro se rechaza.
- `normalizeLick` descarta solo el clip inválido: un lick antiguo o sincronizado con un vídeo roto se sigue abriendo sin la tarjeta.

En la ficha, `LickReferenceVideo` carga la IFrame Player API una sola vez y crea el reproductor con `start` y `end`. Sin autoplay, con `playsinline` para iOS y bucle manual: al recibir `ENDED` vuelve a `startSeconds` y reproduce, porque `loop=1` repetiría el vídeo entero. Si la API no carga o el vídeo falla, se pinta un iframe con el fragmento y el enlace «Abrir en YouTube» en el segundo de inicio; se pierde el bucle pero la ficha sigue siendo útil. El reproductor se destruye al desmontar y se recrea si cambian el vídeo o los tiempos.

## Datos y pruebas

- El modelo no sube de versión: el material, el vídeo y la tonalidad son opcionales y la normalización tolera datos antiguos.
- `tests/licks-reference-video.test.mjs` cubre tiempos, validación, normalización y URLs.
- `tests/licks-normalize.test.mjs` comprueba que el material inválido y los campos de tablatura retirados se descartan sin perder el lick.
- `tests/licks-migration.test.mjs` cubre el traslado de licks antiguos desde el repertorio y la retirada de su tablatura.
