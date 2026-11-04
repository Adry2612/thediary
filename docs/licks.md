# Licks

Un lick es una idea corta —una frase, un ejercicio o un fragmento de una canción— con su propia tablatura, tempo y técnicas. Vive en `/licks`, se edita a pantalla completa en `/licks/new` y `/licks/[id]/edit`, y se lee en `/licks/[id]`.

## Guardar sin terminar la ficha

El editor tiene dos guardados:

- **Guardar lick** valida el título y el BPM objetivo, guarda todo y vuelve a la ficha.
- **Guardar tablatura** guarda la partitura y los campos que ya sean válidos, sin exigir BPM, canción ni técnicas, y **se queda en el editor**.

Si el título está vacío, el borrador se guarda como «Sin título» (`licks.untitled`) y aparece en la biblioteca como un lick normal. El primer guardado de un lick nuevo fija su id; los siguientes actualizan el mismo registro, y el «Guardar lick» final completa la ficha. Un BPM vacío o fuera de 40–240 no bloquea el guardado de la tablatura: se ignora y se conserva el que ya tuviera el lick.

El aviso «Tablatura guardada» se anuncia con `role="status"` y desaparece en cuanto se toca cualquier campo.

## Tonalidad

La tonalidad es opcional. Se detecta con el estimador de Krumhansl-Schmuckler a partir de las alturas de la partitura visual que se está editando:

- usa la afinación de la partitura (`tuningToMidi`), también con afinaciones alternativas de 4 a 8 cuerdas;
- ignora las notas muertas;
- pondera más la primera y la última nota de la frase;
- necesita al menos tres notas y tres clases distintas; si no, no adivina.

Mientras el campo está en automático, la tonalidad detectada se copia al campo según se escribe. Elegir una tonalidad a mano (incluida «Sin tonalidad») desactiva el automático; **Usar esta tonalidad** lo vuelve a activar. La detección no se guarda hasta que se guarda el lick.

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

- El modelo no sube de versión: el vídeo y la tonalidad son opcionales y la normalización tolera datos antiguos.
- `tests/licks-reference-video.test.mjs` cubre tiempos, validación, normalización y URLs.
- `tests/licks-key-detection.test.mjs` cubre la detección desde la rejilla y desde la partitura, afinaciones alternativas, notas muertas y mínimos.
- `tests/licks-normalize.test.mjs` comprueba que un clip inválido se descarta sin perder el lick.
