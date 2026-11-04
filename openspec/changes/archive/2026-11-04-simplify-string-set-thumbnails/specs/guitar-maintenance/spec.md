# Spec Delta

## MODIFIED Requirements

### Requirement: A string set can show its packaging image

The system SHALL let each catalogue set reference an optional photo, SHALL show it as a thumbnail in the set picker, in the string-change history and in the strings row, and SHALL show nothing in its place when the set has no photo or the file cannot be loaded.

#### Scenario: Choosing a set
- **WHEN** the user opens the set picker
- **THEN** each set with a photo shows its thumbnail next to the brand and model, and a set without one shows only its text

#### Scenario: Reading the history
- **WHEN** the user opens the history of a guitar
- **THEN** each string change that has a photo shows its thumbnail

#### Scenario: The strings row
- **WHEN** a guitar has a string change with a photo
- **THEN** the row shows a small thumbnail of that set

#### Scenario: No image
- **WHEN** a set has no photo
- **THEN** no thumbnail and no empty box are shown, and the text does not move to fill a gap

#### Scenario: A decorative image
- **WHEN** a screen reader reaches a set with a photo
- **THEN** the image is not announced twice, because the brand and model already name the set

## REMOVED Requirements

### Requirement: Packaging images ship with the catalogue

**Reason**: El catálogo deja de incluir fotos de envase de terceros. La miniatura solo aparece cuando el usuario aporta una foto propia; sin ella no hay hueco que rellenar.

**Migration**: Ninguna. Un juego sin `image` se muestra con su texto; las entradas del historial que ya guardaban una ruta siguen funcionando mientras el archivo exista.
