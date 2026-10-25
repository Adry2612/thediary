# Spec Delta

## ADDED Requirements

### Requirement: The timer and metronome cards keep matching heights

On wide viewports the system SHALL place the timer and the metronome in the same row with the same height, SHALL let the timer card fill its column instead of ending above the metronome, and SHALL stack both cards at full width on narrow viewports.

#### Scenario: Wide viewport
- **WHEN** the practice screen is shown on a wide viewport
- **THEN** the timer and metronome cards start at the same height and end at the same height, with no empty gap below either card

#### Scenario: Narrow viewport
- **WHEN** the practice screen is shown on a narrow viewport
- **THEN** the two cards stack, each taking the full available width without horizontal overflow

#### Scenario: The timer grows
- **WHEN** the timer shows a longer title, the song picker or another extra row
- **THEN** the metronome card keeps matching the timer's height instead of staying shorter

## MODIFIED Requirements

### Requirement: The home practice plan lists block details without repeated labels

The system SHALL list each block's detail entries in the home screen's practice plan without repeating the "Detalle del bloque" label, SHALL show a linked repertoire part on its own line without a "Parte:" prefix, and SHALL keep the material label.

#### Scenario: A block with details
- **WHEN** the home plan shows a block with several detail entries
- **THEN** each entry appears on its own line and no entry is preceded by "Detalle del bloque"

#### Scenario: A repertoire block with a part
- **WHEN** the block is linked to a repertoire song with a part
- **THEN** the part appears on its own line with no "Parte:" prefix

#### Scenario: Material
- **WHEN** the block has attached material
- **THEN** the material keeps its "Material:" label

#### Scenario: No details
- **WHEN** the block has no detail entries, part or material
- **THEN** the plan shows the existing empty state for that block

### Requirement: A saved practice shows its block details and resolved links

The system SHALL show each saved block's detail entries and SHALL resolve a repertoire link to the song title, with the part when present on its own line without a "Parte:" prefix, and a lick link to the lick title, including when the block names only the item.

#### Scenario: A block linked only to a song
- **WHEN** a saved block names a song but no part
- **THEN** the completed practice shows the song title for that block

#### Scenario: A block linked to a song and a part
- **WHEN** a saved block names a song and a part
- **THEN** the completed practice shows both the song and the part, with the part on its own line and no "Parte:" prefix

#### Scenario: A block linked to a lick
- **WHEN** a saved block names a lick
- **THEN** the completed practice shows the lick title for that block

#### Scenario: A block with details
- **WHEN** a saved block has detail entries
- **THEN** the completed practice lists them in the "Qué se practicó" column
