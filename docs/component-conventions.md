# Convenciones de componentes

Reglas de organización del código de `thediary`. Nacen de la refactorización
`refactor-component-separation` y su `design.md` (decisiones D1–D3 y D8).

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

1. ¿Podría llamarse a esta función con `node --test` si se exportara? Entonces
   vive en `lib`.
2. ¿Necesita estado, refs o ciclo de vida de React? Entonces vive en un hook.

## Dirección de dependencias

`types` ← `lib` ← `hooks` ← `components/ui` ← `components/<dominio>` ← `app`

Cada capa puede importar de las que tiene a su izquierda; nunca al contrario.

| Qué necesita el código | Dónde va |
| --- | --- |
| Sin React, determinista, testeable | `src/lib/<dominio>.ts` |
| Estado, refs, efectos, ciclo de vida | `src/hooks/use<Cosa>.ts` (`"use client"`) |
| `"use client"` + `createContext` | `src/hooks/`, junto al patrón de `useMetronome` |
| Forma de datos del dominio (unión, enum, kind, borrador, valor de contexto) | `src/types/<área>.ts` |
| Props del propio componente | Se quedan en el archivo del componente |

**Las props del propio componente se quedan con el componente**: son su API
pública. Solo se mueven fuera los tipos que se exportan y consume más de un
archivo (por ejemplo `PracticeTooltipDay`).

**Datos vs. funciones**: un tipo que describe datos se va a `src/types`; un tipo
que solo describe los argumentos de una función se queda junto a esa función en
`src/lib` (`SelectOption` vive con `buildSelectEntries`).

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
| `Card` | `tone: light \| dark \| danger`, `padding: sm \| md \| lg`, `as`, `bare` | light por defecto: `rounded-xl border border-line bg-surface p-8 sm:p-10` |
| `Block` | `tone`, `padding`, `as` (`article \| div \| fieldset \| section`) | `rounded-lg border border-line bg-surface p-4 sm:p-6` |
| `Button` | `variant: primary \| ghost \| icon \| link \| danger`, `size: default \| field \| icon` | base compartida + variante |
| `ButtonLink` | `variant: primary \| ghost`, `size` | Igual que `Button` sobre un `next/link` |
| `IconButton` | `variant: bordered \| ghost \| danger`, `size: sm \| md \| lg` | `flex items-center justify-center border border-line` |
| `ToggleChip` | `selected: boolean \| "mixed"`, `size`, `tone` | `border px-2 py-1 text-xs` + `aria-pressed` |
| `ToggleGroup` | `aria-label`, layout `wrap \| row` | agrupa `ToggleChip` |
| `CheckboxField` | `label`, `description` | `peer-checked:border-accent-green-fg` |
| `Field` | `label`, `htmlFor`, `error`, `hint` | etiqueta + ranura de error |
| `FormMessage` | `tone: error \| success`, `role="alert"` | `text-sm text-red-300` / `text-accent-red-fg` |
| `EmptyState` | `variant: dashed \| plain`, `title`, `description`, `action` | `rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center` |
| `RemovableChip` / `ChipList` | `onRemove`, `removeLabel` (`×` o texto) | `flex items-center gap-2 border border-line bg-canvas px-3 py-1.5 text-sm` |
| `ModalDialog` | `variant: lg \| md \| confirm`, `open`, `onClose`, `labelledBy` | `m-auto border border-line bg-surface p-0 text-ink` + `backdrop:bg-black/70` |
| `PortalModal` | `open`, `onClose`, `labelledBy`, `variant` | `role="dialog"`, `aria-modal`, cierre con Escape y clic en el fondo |
| `ConfirmDialog` | `title`, `description`, `confirmLabel`, `cancelLabel`, `onConfirm` | `m-auto w-[calc(100%-2rem)] max-w-md` |
| `DialogHeader` | `eyebrow`, `title`, `description`, `onClose` | ceja + título + botón de cierre |
| `SectionHeader` | `eyebrow`, `title`, `description`, `variant: page \| card`, `as` | `text-xs uppercase tracking-[0.12em] text-muted` + título |

Las primitivas de `ui/` se documentan con su conjunto **cerrado** de variantes:
no se añaden clases sueltas cuando una variante existente ya cubre el caso.

## Verificación

- `npm run typecheck` y `npm test` tras cada paso.
- `npm run build` en cada frontera de oleada (`"use client"` y fronteras
  servidor/cliente no las detecta el typecheck).
- Los atributos que son contrato (`data-tour-target`, `aria-*`, `role`, `id`)
  se quedan en el mismo elemento renderizado tras cualquier extracción.
