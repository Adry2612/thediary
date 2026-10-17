# Tasks

## 1. Contraste del texto secundario

- [x] 1.1 Replace `text-zinc-500` and `text-zinc-600` with the app's muted tone in the start, the dashboard and the materials loader, and check every surface those texts sit on keeps 4.5:1 or more. Verify with `npm run typecheck` and by computing the ratios.
- [x] 1.2 Confirm no muted text ends up over a solid `zinc-800`, the one fill where the tone would fall short.

## 2. Nombre accesible del desplegable

- [x] 2.1 Compose the accessible name of `SelectField` from the name of the field and the label of the shown value, falling back to the field's name alone when there is no value. Verify with `npm run typecheck`.

## 3. Etiqueta del indicador de pulso

- [x] 3.1 Give the dot of each beat of the metronome a role that accepts its label. Verify with `npm run typecheck` and `npm run build`.

## 4. Verification

- [x] 4.1 Run `npm run build`, `npm run typecheck` and `npm test` together and verify all pass.
- [x] 4.2 Measure the contrast of every pair of tone and surface involved, and cross-check the formula against the 3.67:1 the audit had reported for the failing pair.
- [ ] 4.3 Re-run the accessibility audit on `/`, `/dashboard`, `/repertoire`, `/repertoire/new` and `/metronome` and verify they reach 100. **Pending**: the browser tool was not available in the session that implemented this.

## Workflow follow-up

- After the tasks pass, review the diff and validate with `openspec validate "improve-accessibility" --strict`.
