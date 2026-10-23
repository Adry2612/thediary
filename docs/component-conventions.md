# Convenciones de componentes

Reglas de organización del código de `thediary`. Nacen de la refactorización
`refactor-component-separation` y su `design.md` (decisiones D1–D3 y D8). La
separación entre `services` y `utils` se añadió en
`refactor-service-utils-layers`.

## Qué puede contener un archivo de componente

Sí:

- La interfaz de props que declara el propio componente.
- Lecturas de contexto o de i18n (`useI18nSection`, `useAppData`, …).
- Llamadas a sus propios hooks.
- JSX y el paso directo de props a primitivas.

No:

- Manejadores de eventos con ramas, flujos asíncronos, validación ni formateo.
- Cálculo de fechas, geometría o posiciones.
- Mapas, enums o listas de constantes a nivel de módulo.
- Cuerpos de `useEffect` que van más allá de un enlace con una primitiva.
- Grupos de `useState` que funcionan como una máquina de estados.

Dos preguntas resuelven cualquier duda:

1. ¿Podría llamarse a esta función con `node --test` si se exportara y no toca
   red, IndexedDB, Web Audio ni eventos del navegador? Entonces vive en
   `utils`.
2. ¿Habla con el exterior (Supabase, proveedores cloud, almacenamiento,
   audio/eventos del navegador)? Entonces vive en `services`.
3. ¿Necesita estado, refs o ciclo de vida de React? Entonces vive en un hook.

## Dirección de dependencias

`types` ← `utils` ← `services` ← `hooks` ← `components/ui` ← `components/<dominio>` ← `app`

Cada capa puede importar de las que tiene a su izquierda; nunca al contrario.
`tests/architecture-layers.test.mjs` comprueba mecánicamente que `utils` no
importa `services`, hooks ni componentes, y que `services` no importa hooks ni
componentes. Ningún archivo puede volver a importar `@/lib`.

| Qué necesita el código | Dónde va |
| --- | --- |
| Sin React, determinista, testeable | `src/utils/<dominio>.ts` |
| Comunicación externa: API, base de datos, IndexedDB, Web Audio o eventos del navegador | `src/services/<dominio>.ts` |
| Estado, refs, efectos, ciclo de vida | `src/hooks/use<Cosa>.ts` (`"use client"`) |
| `"use client"` + `createContext` | `src/hooks/`, junto al patrón de `useMetronome` |
| Forma de datos del dominio (unión, enum, kind, borrador, valor de contexto) | `src/types/<área>.ts` |
| Props del propio componente | Se quedan en el archivo del componente |

**Las props del propio componente se quedan con el componente**: son su API
pública. Solo se mueven fuera los tipos que se exportan y consume más de un
archivo (por ejemplo `PracticeTooltipDay`).

**Datos vs. funciones**: un tipo que describe datos se va a `src/types`; un tipo
que solo describe los argumentos de una función se queda junto a esa función en
`src/utils` (`SelectOption` vive con `buildSelectEntries`). Los tipos que usa la
capa pura y que antes vivían en un servicio o en un store (`PracticeAudioRecording`,
`PersistedPracticeState`, cloud-sync) viven en `src/types` para no invertir la
dirección de dependencias.

**i18n**: la lógica extraída no llama a `useI18nSection`. Si produce texto,
recibe la sección o los textos ya resueltos como argumento, como
`getDifficultyLabel(text, difficulty)`.

**`"use client"` es una restricción de corrección, no de estilo**: las primitivas
de `ui/` se escriben sin directiva para poder usarse desde componentes de
servidor; los hooks llevan `"use client"`. Si una primitiva necesita
interactividad, se parte en una cáscara sin directiva y un hijo cliente.

## Variantes en lugar de copias

Los componentes compartidos reciben uniones cerradas (`variant`, `size`, `tone`,
`padding`, `as`) y mantienen un `className` de paso para composición.

- Una variante solo se añade cuando al menos **dos** usos la necesitan. Si no, el
  uso conserva su `className`.
- Una variante solo es aceptable si reproduce **exactamente** la cadena de clases
  que sustituye. Si el HTML renderizado cambia una clase, la migración es
  incorrecta.

## Catálogo de primitivas

| Primitiva | Variantes | Cadena de clases propia |
| --- | --- | --- |
| `Card` | `tone: light \| dark \| danger`, `padding: none \| tight \| compact \| cozy \| roomy \| wide`, `as`, `bare` | `rounded-xl border` + tinte + relleno. Por defecto: `border-line bg-surface p-8 sm:p-10` |
| `Block` | `tone`, `padding`, `as` (`article \| div \| fieldset \| section`) | `rounded-lg border` + tinte + relleno; por defecto `compact` (`p-4 sm:p-6`) |
| `Button` | `variant: primary \| ghost \| icon \| link \| danger`, `size: default \| field \| icon` | primary `bg-ink text-canvas hover:bg-white`; ghost e icon `border border-line text-ink hover:bg-white/5`; danger `border border-red-400/40 text-red-300 hover:border-red-400/70 hover:bg-red-500/10 focus-visible:outline-red-400` |
| `ButtonLink` | `variant: primary \| ghost` | `inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm transition active:scale-[0.98]` + primary `bg-ink font-medium text-canvas hover:opacity-90` u ghost `border border-line text-ink hover:bg-white/5` |
| `IconButton` | `variant: bordered \| ghost \| danger`, `size: sm \| md \| lg` | base `inline-flex items-center justify-center transition` + `size-9`/`size-10`/`size-11`; bordered `border border-line hover:bg-white/5 hover:text-ink`; ghost `hover:bg-white/10`; danger `text-red-300 hover:bg-red-400/10 hover:text-red-200` |
| `ToggleChip` | `selected: boolean \| "mixed"`, `tone: accent \| soft`, `size: xs \| sm` | base `inline-flex items-center border transition`; `xs: rounded px-2 py-1 text-xs`, `sm: rounded-md px-2 py-1.5 text-[11px]`; seleccionado `border-accent-green-fg bg-accent-green-bg/40 text-ink` (soft y `"mixed"`: `/60` y `/20`); sin seleccionar `border-line text-muted` |
| `ToggleGroup` | `aria-label`, layout `wrap \| row` | `flex` (+ `flex-wrap`); el hueco lo pone el sitio |
| `CheckboxField` | `label`, `className` (del `<label>`) | caja `flex size-4 items-center justify-center border border-muted text-transparent transition` + `peer-checked:border-accent-green-fg peer-checked:bg-accent-green-fg peer-checked:text-canvas` |
| `Field` | `label`, `htmlFor`, `error`, `className` | etiqueta `block text-xs text-muted` + control + `FormMessage` de error |
| `FormMessage` | `tone: error \| success` | error `text-sm text-red-300` con `role="alert"`; success `text-sm text-accent-green-fg` con `role="status"` |
| `EmptyState` | `variant: dashed \| plain`, `size: default \| compact`, `as: div \| section \| p`, `title`, `description`, `action` | dashed `border border-dashed border-line`; default: título `font-sans text-2xl font-semibold`, descripción `mx-auto mt-2 max-w-lg text-sm text-muted`, acción `mt-6`; compact: título `text-lg font-semibold text-ink`, descripción `mt-2 text-sm text-muted`, acción `mt-4` |
| `RemovableChip` / `ChipList` | `onRemove`, `removeLabel` (`×` o texto), `removeAriaLabel`; `ChipList: layout: wrap \| stack` | fila `flex items-center border border-line`; botón `text-muted hover:text-ink`; lista `flex flex-wrap gap-2` o `space-y-2` |
| `ModalDialog` | `variant: md \| lg \| confirm`, `dialogRef`, `open`, `labelledBy` | `m-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70` + `md: w-[calc(100%-2rem)] max-w-md`, `lg: max-h-[90dvh] … max-w-lg overflow-y-auto`, `confirm: fixed inset-0 … max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]` |
| `PortalModal` | `open`, `title`, `description`, `busy`, `onClose` | `role="dialog"`, `aria-modal`, `fixed inset-0 z-50 grid place-items-center bg-black/60 p-4`, panel `w-full max-w-md rounded-xl border border-line bg-surface p-6` |
| `ConfirmDialog` | `labelledBy`, `title`, `description`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel` | `ModalDialog` confirm + `p-6 sm:p-8` y botones `flex flex-col-reverse gap-3 sm:flex-row sm:justify-end` |
| `DialogHeader` | `eyebrow`, `title`, `titleId`, `description`, `onClose`, `closeLabel` | `flex items-start justify-between gap-4`; ceja `font-mono text-[10px] uppercase tracking-[0.14em] text-muted`; cierre `size-7 rounded border border-line` |
| `SectionHeader` | pendiente: se construye al adoptarlo en 6.6 | — |

`ui/ModalDialog` no abre ni cierra nada: la ref y los efectos viven en
`useDialogModal` (`"use client"`), que hace `showModal`/`close`, bloquea el
scroll del cuerpo y convierte Escape en `onClose`. `ui/PortalModal` es la única
primitiva cliente: necesita `createPortal` y un efecto de Escape.

Donde el catálogo no fija radio, color de texto o posición (por ejemplo en
`IconButton`), esas clases llegan por `className` porque cada sitio de origen
usa una distinta. Un tono o tamaño solo se añade cuando lo piden dos sitios.

Las primitivas de `ui/` se documentan con su conjunto **cerrado** de variantes:
no se añaden clases sueltas cuando una variante existente ya cubre el caso.

## Verificación

- `npm run typecheck` y `npm test` tras cada paso.
- `npm run build` en cada frontera de oleada (`"use client"` y fronteras
  servidor/cliente no las detecta el typecheck).
- Los atributos que son contrato (`data-tour-target`, `aria-*`, `role`, `id`)
  se quedan en el mismo elemento renderizado tras cualquier extracción.
