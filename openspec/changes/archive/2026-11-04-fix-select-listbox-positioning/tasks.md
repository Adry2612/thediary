# Tasks

## 1. Geometría de la lista

- [x] 1.1 Add `src/utils/select-position.ts` with `getListboxPlacement`: absolute coordinates against the dialog's padding box (including `clientLeft`, `clientTop` and scroll), fixed coordinates when the portal is the body, upward flip when the estimated list height does not fit below, and `maxHeight` clamped to the available side; verify `npm run typecheck` passes.
- [x] 1.2 Add `tests/select-position.test.mjs` covering a dialog offset by a transform, a control near the bottom that opens upward, an available space smaller than the estimate, a page-level select with fixed coordinates, and a 375 px viewport; verify the suite passes.

## 2. Selector

- [x] 2.1 Update `openListbox` in `src/components/ui/SelectField.tsx` to collect the trigger rect, the portal container metrics and the viewport, and to use `getListboxPlacement` instead of the inline viewport math.
- [x] 2.2 Apply the returned `position`, `left`, `width`, `top`/`bottom` and `maxHeight` to the listbox style, keeping the existing classes, portal target and close-on-scroll behaviour.

## 3. Verificación

- [x] 3.1 In the metronome settings dialog at 1280, 768 and 375 px, open Compás, Sonido and the tempo-ramp unit: verify each list keeps the width of its control, shows its right border and every option inside the dialog.
- [x] 3.2 Open the selects of `ManualPracticeEntry` and `LickEditorModal`: verify the list is aligned and fully visible in both dialogs.
- [x] 3.3 Open a select that is not inside a dialog (repertoire filters or the tuner): verify it is still aligned with its control and inside the viewport.
- [x] 3.4 With the keyboard, open a listbox with Arrow Down, move with the arrows, choose with Enter, close with Escape: verify focus returns to the control and the value changes as before.
- [x] 3.5 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish without failures.

## Workflow follow-up

- Archive the change once the verification tasks pass.
- When archiving, confirm `app-accessibility` keeps its six existing requirements and gains the new one.
- `refactor-component-separation`'s task 5.6.2 claimed this check; leave it as is and note that this change covers it.
