# Spec Delta

## ADDED Requirements

### Requirement: A practice can record the specific guitar used

The system SHALL store an optional guitar identifier with a practice, SHALL preserve it across reload and sync, and SHALL keep the type-only choice available when no specific guitar is recorded.

#### Scenario: Storing the guitar
- **WHEN** a practice is saved with a specific guitar
- **THEN** the saved practice keeps that guitar

#### Scenario: Running practice shows the guitar
- **WHEN** the running session has a specific guitar
- **THEN** the practice shows its name as read-only context and offers no control to change it there

#### Scenario: A deleted guitar
- **WHEN** a saved practice references a guitar that no longer exists
- **THEN** the practice loads normally and keeps its recorded time and type

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no specific guitar
- **THEN** it loads normally and remains attributed only to its type

#### Scenario: Stored guitar survives reload and sync
- **WHEN** a practice with a specific guitar is reloaded or merged from another device
- **THEN** the guitar identifier is preserved

### Requirement: A new practice inherits the guitar instead of asking

The system SHALL attribute a new practice to the user's only guitar without asking, SHALL otherwise inherit the last guitar used on the device, SHALL show the guitar selector only when the user has more than one guitar, and SHALL NOT add a guitar to an existing practice when it is edited.

#### Scenario: One guitar
- **WHEN** the user has a single guitar and starts a practice
- **THEN** the practice is attributed to that guitar without showing a selector

#### Scenario: Several guitars
- **WHEN** the user has more than one guitar and starts a practice
- **THEN** the last guitar used on the device is preselected and the selector is available

#### Scenario: Changing the guitar
- **WHEN** the user chooses another guitar for the practice
- **THEN** the practice stores it and it becomes the guitar inherited by the next practice

#### Scenario: The inherited guitar no longer exists
- **WHEN** the last guitar used was deleted
- **THEN** the practice falls back to the only remaining guitar or to the type-only choice without failing

#### Scenario: Editing an existing practice
- **WHEN** the user edits a practice that recorded no guitar
- **THEN** no guitar is added to it

#### Scenario: No guitars
- **WHEN** the user has no guitars
- **THEN** the practice keeps the electric or acoustic choice and remains valid
