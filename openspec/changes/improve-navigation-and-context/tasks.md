# Tasks

## 1. Volver al inicio y volver atrás

- [x] 1.1 Add `ArrowLeftIcon` to the shared icons and a `BackLink` component that draws the label behind the arrow. Verify with `npm run typecheck`.
- [x] 1.2 Make the app name in the header a link to the start, keeping the guided tour target. Verify in the app.
- [x] 1.3 Use the way back with its arrow in the new repertoire item, the repertoire file, the practiced day and the routine designer. Verify in the app.

## 2. El artista durante la práctica

- [x] 2.1 Resolve the repertoire item of the block being practiced in `PracticeSession` and hand its artist to the timer card.
- [x] 2.2 Show the artist under the name of the block in the timer card, only when there is one. Verify in the app.

## 3. Verification

- [x] 3.1 Run `npm run build`, `npm run typecheck` and `npm test` together and verify all pass.
- [x] 3.2 In the app: the app name opens the start, the arrow is on the four ways back and returns where it says, and a practice of a repertoire item shows the artist under the song's name.

## Workflow follow-up

- After the tasks pass, review the diff and validate with `openspec validate "improve-navigation-and-context" --strict`.
