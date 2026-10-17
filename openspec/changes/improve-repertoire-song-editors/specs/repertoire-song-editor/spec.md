# Spec Delta

## ADDED Requirements

### Requirement: Song content editors start collapsed

The system SHALL present the lyrics-and-chords editor and the tab editor as separate collapsible sections that start collapsed, SHALL let the user expand or collapse each one independently, and SHALL keep the expanded state only for the current session without persisting it with the song.

#### Scenario: Opening a song shows both sections collapsed
- **WHEN** the user opens the detail page of a saved song or the creation form
- **THEN** the lyrics-and-chords section and the tab section both start collapsed and their editors are hidden

#### Scenario: Expanding one section keeps the other closed
- **WHEN** the user expands the tab section
- **THEN** the lyrics-and-chords section stays collapsed

#### Scenario: Collapsing an expanded section
- **WHEN** the user collapses an expanded section
- **THEN** its editor is hidden and the other section keeps its own state

#### Scenario: The expanded state is not persisted
- **WHEN** the user expands a section, leaves the song, and opens it again
- **THEN** both sections start collapsed again

### Requirement: Tab measures wrap into systems

The system SHALL lay the tab measures out in rows that fill the available width, SHALL continue the measures that do not fit on the next row as a new system, SHALL NOT scroll the tab horizontally, and SHALL label each system with the number of its first measure.

#### Scenario: Measures that do not fit wrap to the next system
- **WHEN** the measures of the tab do not fit the available width
- **THEN** the app continues them on the next row as a new system instead of scrolling horizontally

#### Scenario: The tab never scrolls horizontally
- **WHEN** the tab has more measures than fit in one row
- **THEN** the app provides no horizontal scrolling for the tab and every measure is reachable by scrolling the page vertically

#### Scenario: Each system is labelled with its first measure
- **WHEN** a system is drawn
- **THEN** the app shows the number of its first measure at the start of the system

#### Scenario: Resizing reflows the systems
- **WHEN** the available width changes
- **THEN** the app recomputes how many measures fit per system and redraws the rows

#### Scenario: A note keeps its measure after reflowing
- **WHEN** the systems reflow because the width changed
- **THEN** every note stays on the same string and time position

#### Scenario: Keyboard navigation crosses systems
- **WHEN** the user moves the selected cell past the last column of a system
- **THEN** the app continues the selection on the following system

#### Scenario: Measures added or removed update the systems
- **WHEN** the user adds or removes a measure
- **THEN** the app redraws the systems with the new measure count and keeps the notes that remain inside it
