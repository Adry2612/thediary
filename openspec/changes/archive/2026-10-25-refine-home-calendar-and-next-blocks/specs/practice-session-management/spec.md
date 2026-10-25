# Spec Delta

## ADDED Requirements

### Requirement: The floating practice bar animates when it appears and disappears

The system SHALL animate the floating practice bar as it enters and leaves, SHALL keep it non-interactive while it is leaving, and SHALL skip the animation when the user prefers reduced motion.

#### Scenario: The bar appears
- **WHEN** the bar becomes visible because the user leaves the practice screen or because the timer card leaves the viewport
- **THEN** the bar fades in with a short upward movement instead of appearing abruptly

#### Scenario: The bar disappears
- **WHEN** the bar stops being needed because the user returns to the practice screen or because the timer card is visible again
- **THEN** it fades out and can no longer be activated while it leaves

#### Scenario: Reduced motion
- **WHEN** the user has reduced motion enabled
- **THEN** the bar appears and disappears without movement and without the enter or exit delay

### Requirement: The home practice plan lists block details without repeated labels

The system SHALL list each block's detail entries in the home screen's practice plan without repeating the "Detalle del bloque" label, SHALL keep a short "Parte:" prefix for a linked repertoire part, and SHALL keep the material label.

#### Scenario: A block with details
- **WHEN** the home plan shows a block with several detail entries
- **THEN** each entry appears on its own line and no entry is preceded by "Detalle del bloque"

#### Scenario: A repertoire block with a part
- **WHEN** the block is linked to a repertoire song with a part
- **THEN** the part appears on its own line preceded by "Parte:"

#### Scenario: Material
- **WHEN** the block has attached material
- **THEN** the material keeps its "Material:" label

#### Scenario: No details
- **WHEN** the block has no detail entries, part or material
- **THEN** the plan shows the existing empty state for that block

### Requirement: The home practice plan breaks long text with hyphens

The system SHALL wrap long block titles, detail entries and labels inside their cells, SHALL break long words with a hyphen when they do not fit, and SHALL NOT replace or hide the text.

#### Scenario: A long word in a narrow cell
- **WHEN** a title or detail contains a word wider than its cell
- **THEN** the word continues on the next line after a hyphen instead of overflowing the table

#### Scenario: Narrow screen
- **WHEN** the home plan is viewed on a narrow screen
- **THEN** the table stays within the viewport and every detail remains readable

### Requirement: The running practice lists every remaining block

While a practice is running, the system SHALL show every block that remains after the current one in plan order, with its name, skill, planned duration and detail entries, SHALL mark the immediate next block, and SHALL update the list when the timer advances.

#### Scenario: Several blocks remain
- **WHEN** the current block is not the last one
- **THEN** the practice screen shows the next block and every block after it, with the immediate next block marked

#### Scenario: The timer advances
- **WHEN** the practice moves to the next block
- **THEN** that block leaves the list and the following blocks remain in order

#### Scenario: The last block
- **WHEN** no blocks remain after the current one
- **THEN** the section shows an empty state instead of an empty list

#### Scenario: Practice completed
- **WHEN** the practice is completed and the completion dialog is shown
- **THEN** the remaining-blocks section is not shown

#### Scenario: Long block text
- **WHEN** a block name or detail does not fit
- **THEN** it wraps inside its card without overflowing
