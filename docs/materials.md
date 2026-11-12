# Material de estudio

La biblioteca guarda cada recurso una sola vez para reutilizarlo en cualquier
práctica, canción o lick. Vive en `/materials` y se abre desde **Herramientas** y
desde el menú **+** del panel de material de una práctica, de una ficha del
repertorio o de un lick.

## La pantalla

- **Añadir material** abre un formulario con nombre, tipo, fuente y notas. El
  nombre es obligatorio; las notas son opcionales.
- **Tipos**: Guitar Pro, PDF, imagen, YouTube, Spotify, Songsterr y enlace
  genérico. Guitar Pro, PDF e imagen se suben como archivo; los enlaces se pegan
  como URL HTTPS. Las tablaturas en texto pegado o `.txt` ya no existen: una
  tablatura es siempre un archivo Guitar Pro.
- **Buscar** filtra por título y notas sin distinguir mayúsculas ni acentos.
  **Tipo de material** filtra por el tipo guardado. Sin coincidencias se muestra
  un estado propio, distinto de la biblioteca vacía.
- Cada tarjeta permite **Ver**, **Editar** y **Eliminar**. Eliminar pide
  confirmación y avisa con un toast; un error de guardado se queda junto al
  formulario.
- La lista se ordena de más reciente a más antigua y funciona sin conexión
  porque sale del estado local.

## Adjuntar material guardado

- El menú **+** del panel de material incluye **Usar material guardado**. Abre
  un selector con la misma búsqueda y filtro y devuelve el material elegido.
- Al adjuntarlo se crea un recurso nuevo con su propio identificador: una
  **copia**. Renombrar, editar o borrar la entrada de la biblioteca no cambia
  las prácticas ya guardadas, y quitar un adjunto no borra la entrada.
- El bloque sigue mostrando solo su propio material y el de la canción
  vinculada; adjuntar desde la biblioteca no mezcla materiales de otros bloques.
- Un lick tiene su propio panel de material y también puede usar la biblioteca.

## Archivos y persistencia

- Los archivos se guardan con el mismo flujo que el material de una práctica:
  copia local en IndexedDB y, con cuenta, copia en Supabase Storage. Se aplican
  los mismos formatos y límites (por ejemplo, 10 MB para imágenes).
- Si la subida a la nube falla, la copia local se conserva y el material se
  guarda igualmente; el aviso aparece como toast.
- Borrar una entrada de la biblioteca **no** borra el archivo: puede seguir
  adjunto a una práctica. La limpieza de archivos sin referencias queda fuera de
  esta versión.
- `studyMaterials` viaja dentro de `practice_data.state`, bajo el espacio local
  activo (invitado o cuenta). Se mezcla por identificador y un estado antiguo
  sin la clave carga con la biblioteca vacía.
