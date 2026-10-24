# Spec Delta

## ADDED Requirements

### Requirement: A practice plan carries an optional guitar type

The system SHALL let the user choose electric, acoustic or unspecified while designing a practice plan, SHALL store the choice with a saved routine, SHALL carry it into the session when the plan or routine starts, and SHALL show the chosen type as context in the plan header.

#### Scenario: Choosing the type while designing a plan
- **WHEN** the user designs a new practice plan
- **THEN** the plan offers "Eléctrica", "Acústica" and "Sin especificar" and keeps the choice while the user edits the blocks

#### Scenario: Saving a routine
- **WHEN** the user saves a routine with a guitar type
- **THEN** the routine stores that type and shows it again when the routine is selected for editing

#### Scenario: Starting a plan or saved routine
- **WHEN** the user starts a plan or a saved routine that has a guitar type
- **THEN** the session starts with that type without asking for it again

#### Scenario: Repeating a saved practice
- **WHEN** the user repeats a saved practice that has a guitar type
- **THEN** the new session keeps that type

#### Scenario: Unspecified type
- **WHEN** the user leaves the guitar type unspecified
- **THEN** the plan remains valid and does not display a type in its header

#### Scenario: Older routines
- **WHEN** a routine saved before this change has no guitar type
- **THEN** it opens and starts normally without requiring a type

### Requirement: The running timer does not offer the guitar-type control

The system SHALL NOT offer a control to change the guitar type on the running timer, SHALL show the chosen type as read-only context when one is set, and SHALL keep the choice available while preparing the plan, registering a manual practice and editing a saved practice.

#### Scenario: Running practice
- **WHEN** a practice is running
- **THEN** the timer shows no guitar-type selector

#### Scenario: Showing the chosen type
- **WHEN** the running session has a guitar type
- **THEN** the practice shows it as text and offers no way to change it there

#### Scenario: No type
- **WHEN** the running session has no guitar type
- **THEN** no guitar-type text or control is shown

#### Scenario: Other entry points
- **WHEN** the user prepares a plan, registers a manual practice or edits a saved practice
- **THEN** each of those flows still offers the guitar-type choice

### Requirement: A saved practice keeps its guitar type editable

Editing a saved practice SHALL let the user set, change or clear its guitar type, SHALL store it with that practice only, and SHALL leave the rest of the practice and its source routine unchanged.

#### Scenario: Changing the type
- **WHEN** the user changes the guitar type of a saved practice and saves
- **THEN** that practice shows the new type after a reload

#### Scenario: Clearing the type
- **WHEN** the user chooses "Sin especificar" for a saved practice and saves
- **THEN** the practice is stored without a guitar type

#### Scenario: Other fields survive
- **WHEN** the user changes only the guitar type of a saved practice
- **THEN** its title, notes, completion state, duration and blocks keep their previous values

#### Scenario: The source routine is untouched
- **WHEN** the user changes the guitar type of a practice started from a saved routine
- **THEN** the saved routine keeps its own guitar type
