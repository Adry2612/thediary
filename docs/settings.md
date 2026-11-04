# Configuración

La pantalla de Configuración reúne la cuenta, el idioma, las preferencias de presentación, el bienestar, la sincronización de grabaciones y los datos locales.

## Preferencias de presentación

Son preferencias **por dispositivo**: se guardan en `localStorage` (`thediary.display-preferences`) y no se sincronizan con la cuenta ni con el almacenamiento en la nube. Un cambio se aplica al instante en la pestaña actual y en las demás pestañas abiertas.

### Nombres de las técnicas

- **Español**: muestra el nombre español del catálogo de técnicas, aunque la interfaz esté en inglés.
- **Original**: muestra el nombre original (inglés) del catálogo, aunque la interfaz esté en español. Los nombres que solo son una traducción, como `Strumming`, se muestran en español (`Rasgueo`) mientras la interfaz esté en español.
- Sin una elección guardada, se sigue el idioma de la interfaz: español si la app está en español y original si está en inglés.

La preferencia se aplica a las insignias y editores de licks, a los títulos de bloques de práctica, al detalle de una práctica guardada y a los análisis de técnicas.

### Afinaciones

- **Nombre**: muestra el nombre conocido de la afinación (`Drop D`, `Estándar`/`Standard`).
- **Por cuerdas**: muestra la notación de cada cuerda (`DADGBE`, `EADGBE`).
- Una afinación personalizada o desconocida se muestra tal como se guardó; la preferencia no inventa un nombre.
- Cambiar la preferencia no modifica la afinación guardada de ninguna canción ni los objetivos del afinador.
- La preferencia se aplica a los desplegables del formulario y la ficha de repertorio, a la nota de afinación del formulario y a las etiquetas de los presets del afinador. El catálogo de afinaciones vive en `src/utils/catalogs/tunings.ts`.
