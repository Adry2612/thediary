# Design

## Context

El cambio anterior dejó, sin archivar, una miniatura con tres estados: foto, tarjeta generada y marcador con la inicial. La muestra de la tarjeta se probó a 28, 32 y 40 px y no convenció: sin color ni forma de paquete no distingue un juego de otro. Ver `proposal.md` para el motivo.

El catálogo ya lleva marca, modelo y calibre en el texto de cada opción y de cada entrada del historial, así que la miniatura nunca fue la única fuente del dato.

## Goals / Non-Goals

**Goals:**
- Que la interfaz no enseñe un sustituto cuando no hay foto.
- Que desaparezca todo el código del experimento, no solo su uso.
- Que el repositorio quede sin fotos de envase de terceros.

**Non-Goals:**
- Diseñar otro icono, silueta o color.
- Cambiar cómo se guarda o se sincroniza una foto propia.
- Tocar el catálogo de juegos o sus calibres.

## Decisions

### 1. El texto es el identificador

La marca, el modelo y el calibre ya están escritos en el selector, en el historial y en la fila. La miniatura solo aporta cuando es una foto real del paquete que el usuario tiene delante; cualquier dibujo intermedio es decoración que compite con el texto.

- Alternativa considerada: seguir iterando la tarjeta. Rechazada: el problema no es la composición, es que sin color ni forma no hay nada que reconocer.
- Alternativa considerada: dejar el marcador con la inicial. Rechazada: ocupa el mismo hueco sin aportar información.

### 2. Sin foto, el componente no pinta nada

`StringSetThumb` devuelve `null` cuando no hay `image` o cuando la imagen falla. No hay caja vacía, ni borde, ni reserva de espacio. Los contenedores ya usan `gap` condicionado a que el hijo exista, así que la fila se recoloca sola.

- Alternativa considerada: mantener un hueco fijo para que la lista quede alineada. Rechazada: alinea columnas que ya no existen.
- Alternativa considerada: devolver un `span` vacío con el tamaño. Rechazada: es el marcador con otro nombre.

### 3. El fallo de una foto se trata como ausencia

Se conserva el estado `failed`: si el archivo no carga, el componente pasa a `null` en vez de mostrar el icono roto del navegador. Es el único caso en que hace falta estado.

### 4. Se borra el experimento, no se deja aparcado

La utilidad `string-set-card.ts`, sus pruebas, la ruta `/dev/string-set-card` y la variante del componente se eliminan. El cambio `add-generated-string-set-cards` también: mantenerlo sin archivar duplicaría el trabajo y confundiría el siguiente `apply`.

### 5. Fuera los textos que hablaban del hueco

`stringImagePlaceholder` y `stringImageHint` se quedan sin uso al desaparecer el marcador y la pista de la carpeta. Se retiran de los dos idiomas en vez de dejarlos como deuda.

### 6. Orden de archivado con el cambio anterior

`refine-metronome-spacing-and-string-images` sigue sin archivar y su delta añade la miniatura y el envío de fotos. Este cambio lo modifica y retira el envío. Hay que archivar aquel **antes** que este; al revés, el archivado falla porque no encuentra los requisitos que este cambio modifica.

## Risks / Trade-offs

- **Filas más cortas al desaparecer la miniatura** → la fila ya se dimensiona por el texto; se comprueba la altura a 320, 375, 768 y 1280 px.
- **El selector pierde el anclaje visual** → es el objetivo; el texto sigue siendo inequívoco y la lista se lee más rápido sin ruido.
- **Entradas antiguas con `image` a un archivo borrado** → el componente cae a `null` con `onError`; no aparece el icono roto.
- **Alguien esperaba el marcador** → el `README.md` de la carpeta explica que una foto es opcional y que sin ella no se muestra nada.
- **Confusión entre los dos cambios abiertos** → el `tasks.md` deja el orden de archivado como paso explícito.

## Migration Plan

No hay migración de datos: `image` sigue siendo opcional en el catálogo y en las instantáneas guardadas. Si un archivo ya no está, la miniatura simplemente no se pinta. Revertir el cambio consiste en recuperar las fotos y el componente anterior desde git.
