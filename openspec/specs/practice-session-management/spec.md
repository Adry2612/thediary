# practice-session-management Specification

## Purpose
Permite practicar de dos maneras —retomar una rutina guardada o lanzar una práctica rápida libre con cronómetro— y gestionar después las sesiones del historial consultándolas, editándolas y eliminándolas.

## Requirements

### Requirement: Practice screen surfaces saved routines

The system SHALL present the saved practice routines as the primary content of the practice screen, before any routine design flow, and SHALL offer a shortcut to start each routine and to edit it.

#### Scenario: User opens the practice screen with saved routines
- **WHEN** the user opens the practice screen and at least one routine is saved
- **THEN** the app lists the saved routines first, each with a way to start it and to edit it

#### Scenario: User starts a saved routine from the list
- **WHEN** the user chooses to start a saved routine
- **THEN** the app begins a practice session with the blocks of that routine without asking for confirmation

### Requirement: User can create a new routine or start a quick practice

The system SHALL offer both creating a new practice that opens the full routine design flow and starting a quick practice that begins a free timed session without designing blocks.

#### Scenario: User creates a new practice
- **WHEN** the user chooses to create a new practice
- **THEN** the app opens the full routine design flow with the option to save the routine and to start the session

#### Scenario: User starts a quick practice
- **WHEN** the user starts a quick practice
- **THEN** the app begins a session that counts up freely with no designed blocks and lets the user finish at any time

#### Scenario: Quick practice is saved
- **WHEN** the user finishes a quick practice and saves it
- **THEN** the app records a practice session in the history that the user can edit afterwards like any other

### Requirement: Saved practices can be edited

The system SHALL let the user edit a saved practice session, including its title, notes, completion state, duration and its blocks, and SHALL keep the reported totals consistent with the edited blocks.

#### Scenario: User edits the blocks of a saved practice
- **WHEN** the user changes a block's name, category, real time or planned time and saves
- **THEN** the app stores the edited blocks and reports a total duration and a per-category split consistent with them

#### Scenario: User removes every block
- **WHEN** the user removes all the blocks of a saved practice and saves
- **THEN** the app stores the practice without blocks and uses the duration provided directly

#### Scenario: Edited practice keeps its identity
- **WHEN** a saved practice is edited
- **THEN** the app updates that same practice in the history instead of adding a new one

### Requirement: Saved practices can be deleted

The system SHALL let the user delete a saved practice session, requiring a confirmation, and SHALL NOT delete the recordings associated with it.

#### Scenario: User deletes a saved practice
- **WHEN** the user confirms the deletion of a saved practice
- **THEN** the app removes the practice from the history

#### Scenario: Recordings survive the deletion
- **WHEN** a saved practice with recordings is deleted
- **THEN** the app keeps the recordings available instead of deleting them

### Requirement: Practice day detail always shows that day's recordings

The system SHALL associate each of the day's recordings with a saved practice of that day when possible and SHALL still show the remaining recordings of the day instead of hiding them.

#### Scenario: Recording matches its practice
- **WHEN** a recording belongs to a saved practice of the day
- **THEN** the app shows it inside that practice

#### Scenario: Recording has no matching practice
- **WHEN** a recording of the day cannot be associated with any saved practice of that day and the day has several practices
- **THEN** the app shows it in a dedicated section of the day's recordings instead of dropping it

#### Scenario: Only one practice that day
- **WHEN** the day has exactly one saved practice
- **THEN** the app shows the recordings of that day that are not linked to it under that practice

#### Scenario: Recordings still loading
- **WHEN** the day detail is still loading the recordings
- **THEN** the app indicates that the recordings are loading instead of reporting that there are none

### Requirement: Loading states cover remote recording catalog

The system SHALL keep showing a loading state on the recordings library until the attempt to load the remote catalog has finished, not only the local read.

#### Scenario: Connected provider with slow catalog
- **WHEN** the user has a connected storage provider and the remote catalog is still loading
- **THEN** the app shows the loading state instead of an incomplete list

#### Scenario: Remote catalog fails
- **WHEN** the remote catalog cannot be loaded
- **THEN** the app stops the loading state and shows the locally available recordings
