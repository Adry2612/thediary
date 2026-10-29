# Design

## Context

- `GuitarEntry` guarda un historial único por guitarra con `kind: "strings" | "note"`, fecha y texto libre.
- `StringsPanel` registraba el cambio de cuerdas al instante, con la fecha de hoy y sin más datos.
- `GuitarHistoryDialog` permite añadir entradas de ambos tipos con fecha y notas.
- El bloque de cuerdas es local: no hay red ni servicios implicados.

## Goals / Non-Goals

**Goals:**

- Guardar qué cuerdas se montaron, no solo cuándo.
- Que añadir modelos sea editar un JSON.
- Que el historial siga siendo legible si el catálogo cambia.

**Non-Goals:**

- Editar calibres cuerda a cuerda.
- Sincronizar el catálogo.
- Cambiar el cálculo de recordatorios.

## Decisions

### 1. Un JSON con los modelos principales

`src/data/guitar-strings.json` contiene una lista de juegos:

```json
{
  "id": "daddario-exl110",
  "brand": "D'Addario",
  "model": "EXL110",
  "name": "Regular Light",
  "kind": "electric",
  "unit": "in",
  "gauges": [10, 13, 17, 26, 36, 46]
}
```

- `kind`: `electric`, `acoustic` o `classical`.
- `unit`: `in` para eléctrica y acústica, `mm` para española.
- `gauges`: seis calibres de grave a aguda.

El archivo se importa con atributo de tipo JSON, así que el bundler lo serializa en el build y no hay petición en tiempo de ejecución.

- Alternativa considerada: un módulo TypeScript con los datos. Rechazada: el usuario pidió un JSON para poder ampliarlo sin tocar código.
- Alternativa considerada: cargarlo con `fetch`. Rechazada: rompe el uso sin conexión y añade un estado de carga.

### 2. El historial guarda una copia, no una referencia

La entrada gana `stringSet`, una copia de marca, modelo, tipo, calibres y unidad. No guarda el `id` como única fuente: si el modelo desaparece del catálogo, la entrada sigue mostrando lo que se montó.

`normalizeStringSet` valida la copia al leer el almacenamiento: exige marca y modelo, descarta calibres no numéricos o negativos, y asume pulgadas si faltan.

- Alternativa considerada: guardar solo el id. Rechazada: un modelo retirado dejaría el historial sin nombre.

### 3. Un formulario compartido por los dos caminos

`StringSetFields` es el selector: tipo (tres botones), juego (lista filtrada por tipo) y, si se elige «Otro», marca, modelo y calibres a mano. Se usa en:

- `StringChangeDialog`, que abre el botón de cambio de cuerdas de cada guitarra y sustituye el registro instantáneo.
- `GuitarHistoryDialog`, cuando la entrada es de tipo cuerdas.

El borrador (`StringSetDraft`) se convierte con `draftToStringSet`, que devuelve `undefined` si no hay marca ni modelo: así «sin especificar» sigue siendo un cambio válido.

- Alternativa considerada: dos formularios distintos. Rechazada: duplican validación y textos.

### 4. El juego se muestra tal como se montó

`formatStringSet` compone «Marca Modelo · 10-46» o «Marca Modelo · 0.71-1.09 mm». En el historial, el juego ocupa la línea principal y las notas quedan debajo.

## Risks / Trade-offs

- **Catálogo desactualizado** → es un JSON: añadir o corregir un modelo es un cambio de datos, sin migración.
- **Copia duplicada en cada entrada** → unas decenas de bytes por cambio; a cambio, el historial no depende del catálogo.
- **Calibres en dos unidades** → la unidad se guarda con el juego y se muestra siempre, para no confundir 10-46 con 0,71-1,09.
- **Formulario más largo** → los campos son opcionales salvo la fecha; guardar sin juego sigue funcionando como antes.

## Migration Plan

Ninguna. Las entradas anteriores no tienen `stringSet` y se siguen leyendo; el campo es opcional.

## Open Questions

Ninguna.
