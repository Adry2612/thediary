# Design

## Context

- `MetronomeCard` dibuja hoy los pulsos en un `flex` con `w-12` por pulso y `gap-2`. Antes eran cuatro columnas iguales (`grid-cols-4 gap-2`): cada celda medía un cuarto del ancho menos los huecos. Ese cambio compactó la fila y es lo que el usuario quiere revertir.
- El catálogo de juegos vive en `src/data/guitar-strings.json` y se lee en `src/utils/guitar-strings.ts`.
- La entrada del historial guarda una copia del juego (`stringSet`), no una referencia al catálogo.
- Las fotos de guitarra usan el servicio de assets en IndexedDB; las imágenes del catálogo son distintas: son datos de la app, no del usuario.
- `SelectField` es el desplegable compartido y hoy solo admite texto.

## Goals / Non-Goals

**Goals:**

- Recuperar el reparto de cuatro columnas y centrar los compases cortos sin cambiar el tamaño de los puntos.
- Que la imagen del paquete ayude a reconocer un juego en el selector, el historial y la fila.
- Que el repositorio siga sin material de terceros.

**Non-Goals:**

- Descargar fotos de la web del fabricante.
- Subir imágenes desde la interfaz.
- Cambiar el modelo de sincronización.

## Decisions

### 1. Ancho de columna de 4/4 con `flex-basis`

La fila pasa a `flex flex-wrap justify-center gap-2` y cada pulso a:

```css
flex: 0 0 calc((100% - 1.5rem) / 4);
```

El descuento es el de los tres huecos de 8 px de una fila de cuatro. Con 4 pulsos la fila ocupa el ancho completo, igual que antes; con 2 o 3, cada celda conserva ese ancho y el grupo se centra.

- Alternativa considerada: `grid-cols-4` con desplazamiento de columnas. Rechazada: centrar 3 pulsos exige media columna, que la rejilla no permite.
- Alternativa considerada: mantener `w-12` y añadir `justify-center`. Rechazada: es lo que compactó el reparto.

### 2. La imagen es un campo opcional del catálogo

Cada juego puede declarar `image`, una ruta pública como `/string-sets/daddario-exl110.webp`. El campo es opcional y no bloquea nada.

La copia que se guarda en la entrada del historial incluye también `image`, por la misma razón que guarda marca y modelo: si el catálogo cambia, el historial sigue mostrando lo que se montó.

- Alternativa considerada: resolver la imagen por `id` al leer. Rechazada: un modelo retirado perdería la foto.
- Alternativa considerada: guardar el binario en IndexedDB. Rechazada: es una imagen de catálogo, no un archivo del usuario, y multiplicaría el peso.

### 3. Fotos embarcadas en `public/string-sets/`

Las fotos son las oficiales de cada fabricante y se versionan con el catálogo:

- `public/string-sets/<id>.webp`, 400 × 400 px, fondo `#121211` y el paquete entero dentro del encuadre.
- Se descargan de la web de cada marca, se recortan y se convierten a WebP; el total ronda los 300 KB.
- El `README.md` documenta el formato, el origen de cada archivo y que publicar a gran escala exige permiso del fabricante.

Si un fabricante pide retirar su foto, se borra el archivo y su campo `image`: la app cae en el marcador sin tocar código.

- Alternativa considerada: enlazar la foto desde el CDN del fabricante. Rechazada: depende de su web, mezcla contenido externo y no resuelve la licencia.
- Alternativa considerada: subirlas desde la interfaz. Rechazada por alcance; ya existe el patrón de assets si se pide más adelante.

### 4. Marcador sin salto de maquetación

Sin imagen se muestra un cuadrado con la inicial de la marca, en el mismo tamaño que la miniatura: 40 px en el selector, 32 px en el historial y 28 px en la fila. El contenedor tiene tamaño fijo y `object-cover`, así que una imagen que falla no mueve nada.

La imagen lleva `alt=""` y `aria-hidden`, porque el nombre del juego ya se anuncia justo al lado; repetirlo sería ruido para un lector de pantalla.

### 5. `SelectField` gana una miniatura opcional

`SelectOption` añade `image?: string`. El componente pinta la miniatura en la opción y en el botón cerrado, sin cambiar el resto del comportamiento (teclado, posiciones, foco).

- Alternativa considerada: un selector propio solo para cuerdas. Rechazada: duplicaría la lógica de listbox y de colocación que ya costó un cambio propio.
- Alternativa considerada: mostrar la imagen solo del juego elegido. Rechazada: el usuario necesita comparar los paquetes dentro de la lista.

### 6. La fila de cuerdas muestra el último juego

`GuitarRow` ya recibe el mantenimiento con `latestChange`; si esa entrada trae `stringSet.image`, pinta la miniatura a la izquierda del nombre. Si no, deja el hueco con el marcador.

## Risks / Trade-offs

- **Derechos de las fotos** → se versionan las oficiales de cada marca; el `README` deja claro que publicar a gran escala exige su permiso y que se pueden retirar sin tocar código.
- **Peso** → 20 imágenes de 400 px en WebP suman unos 300 KB, servidas como estáticos y nunca dentro del bundle de JS.
- **Etiquetas** → las fotos destaparon tres nombres que no coincidían con el producto real (EJ15, 2146 y Fender 250L) y se corrigieron en el catálogo.
- **Rutas rotas** → el marcador sustituye a la imagen con `onError`, sin romper la fila.
- **Regresión en `SelectField`** → el campo es opcional y las pruebas actuales del desplegable deben seguir pasando sin cambios.
- **Compases de 4 en pantallas de 320 px** → el `calc` usa porcentajes, así que cada celda se encoge con la tarjeta; la prueba de anchos lo cubre.

## Migration Plan

Ninguna. `image` es opcional en el catálogo y en la copia guardada; las entradas anteriores se leen igual y muestran el marcador.

## Open Questions

Ninguna.
