# Tasks

## 1. Home rows

- [x] 1.1 Replace the two-column wrapper in `HomeView` with two stacked full-width blocks, routines first and repertoire second; verification: at a wide viewport the two sections sit on separate rows with no side-by-side columns, and at 390 px both keep full width without horizontal overflow.
- [x] 1.2 Adapt the full-width grids: `RecentRepertoire` uses two columns on narrow, three on medium and four on wide screens, and `SavedRoutines` uses two on small and three on large screens; verification: cards stay readable and never stretch to an oversized single column at 390, 1024 and 1440 px.
- [x] 1.3 Check the loading, empty and link states of both sections inside their own rows; verification: each message and its "Ver repertorio" or routines link stays inside the corresponding full-width section.

## 2. Quick practice guitar type

- [x] 2.1 Copy the repertoire item's declared `guitarType` into `createQuickRepertoirePlan` only when it is set, and extend `tests/practice-launch.test.mjs` with the acoustic and no-type cases; verification: `node --test tests/practice-launch.test.mjs` and `npm run typecheck` pass, and a plan without a type keeps the property absent.
- [x] 2.2 Check in the browser that a quick practice from an acoustic song shows the acoustic type in the session header, saves it, and appears as acoustic in the dashboard balance; verification: the saved session's type and the chart share the song's type.
- [x] 2.3 Check the fallback for a song without a declared type; verification: the session starts from the last used type when there is one, and no type is invented when there is none.

## 3. Integration verification

- [x] 3.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: all pass with no new warnings.
- [x] 3.2 In the browser, check the two home rows at 390, 1024 and 1440 px, the acoustic quick practice, the no-type fallback, and the manual correction of the previously saved electric session; verification: the chart updates after the edit and no historical session is changed automatically.
- [x] 3.3 Record the verification results in this file and run `openspec validate separate-home-rows-and-guitar-type --strict`; verification: the change validates and the notes match what was observed.

## Verification notes

Fecha: 2026-10-25. Comprobado con Playwright contra `http://localhost:3000` en viewports de 390 × 844, 1024 × 900 y 1440 × 900, con contextos aislados.

- **3.1** `npm run typecheck` sin errores, `npm test` con 628/628 (626 anteriores + 2 nuevas de `practice-launch`) y `npm run build` correcto.
- **Inicio · filas separadas** a 390 px las rutinas ocupan 350 px y el repertorio otros 350 px en la fila siguiente; a 1024 px ambos miden 960 px y a 1440 px 1216 px. En los tres anchos `separateRows` es verdadero, no hay columnas laterales y `scrollWidth` coincide con el ancho del viewport.
- **Inicio · rejillas** el repertorio usa dos columnas a 390 px y cuatro a 1024 y 1440 px; las rutinas usan una columna a 390 px (300 px de ancho, sin tarjetas desproporcionadas), tres a 1024 y tres a 1440. No hay desbordamiento horizontal.
- **Inicio · estados** con el historial y el repertorio vacíos, cada sección muestra su mensaje y su enlace (`Crear o editar rutinas` → `/practice`, `Ver repertorio` → `/repertoire`) dentro de su propia fila de 960 px. Las ramas de carga siguen en ambos componentes; la página muestra el esqueleto de inicio hasta que el store está hidratado.
- **Práctica rápida acústica** con la preferencia guardada en eléctrica, una canción con `guitarType: 'acoustic'` arranca con la cabecera `SESIÓN LIBRE · ACÚSTICA`; al terminarla, la sesión guardada tiene `guitarType: 'acoustic'` (3 s) y el balance muestra `Eléctrica 0% / Acústica 100%`.
- **Canción sin tipo** con última preferencia eléctrica, la sesión activa arranca como `electric`; sin preferencia, la cabecera no muestra tipo, la sesión activa no tiene `guitarType` y la práctica guardada tampoco lo incluye. El balance muestra el estado vacío y `Sin tipo registrado`.
- **Corrección manual** una sesión guardada con `guitarType: 'electric'` sigue marcando 100 % eléctrica al cargar el dashboard. Al editarla y elegir `Acústica`, el store guarda `acoustic` y el balance pasa a `Eléctrica 0% / Acústica 100%`; ninguna sesión se corrige automáticamente.
- **Validación** `openspec validate separate-home-rows-and-guitar-type --strict` pasa.

## Workflow follow-up

- Archive `refine-practice-banner-and-calendar`, then `refine-home-calendar-and-next-blocks`, then `refine-calendar-and-home-cards`, then this change. The home cards this change adapts come from the third archive.
- Rebuild and restart the production server before testing from the phone.
