# Fotos de los juegos de cuerdas

Esta carpeta es opcional. El catálogo **no incluye fotos de paquetes**: las de
los fabricantes tienen derechos y no se distribuyen con la app.

Si quieres una miniatura para un juego, usa una foto tuya del paquete que
tienes en casa y guárdala aquí.

## Formato

- WebP o JPG, 400 × 400 px, fondo neutro.
- El paquete entero dentro del encuadre, con margen.
- Nombre igual que el `id` del juego: `daddario-exl110.webp`.

## Cómo se enlaza

Añade `image` al juego en `src/data/guitar-strings.json`:

```json
{
  "id": "daddario-exl110",
  "brand": "D'Addario",
  "model": "EXL110",
  "name": "Regular Light",
  "kind": "electric",
  "unit": "in",
  "gauges": [10, 13, 17, 26, 36, 46],
  "image": "/string-sets/daddario-exl110.webp"
}
```

## Sin foto

Un juego sin `image` se muestra solo con su marca, modelo y calibre. No hay
marcador, ni hueco, ni icono de reserva: la miniatura aparece únicamente
cuando existe la foto. Si el archivo falta o no carga, la miniatura
desaparece y el texto no se mueve.
