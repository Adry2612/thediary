# Spec Delta

## Purpose

Gives the user a library for the technical fragments they want to drill — riffs, phrases and exercises — with plain-text tablature, a fixed musical vocabulary and a per-lick record of speed progress, kept apart from the songs they are learning.

## ADDED Requirements

### Requirement: Licks live in a library of their own

The system SHALL keep licks in their own collection, list them on a dedicated Licks page, and SHALL NOT show them in the repertoire list.

#### Scenario: A saved lick appears in the licks library
- **WHEN** the user saves a lick
- **THEN** the licks library lists it with its title, key, techniques and current BPM when known

#### Scenario: A lick does not appear in the repertoire
- **WHEN** the user opens the repertoire list after saving a lick
- **THEN** the lick is not among the repertoire items

#### Scenario: Starting a new lick
- **WHEN** the user activates the action to add a lick
- **THEN** the editor opens with empty tablature, no key, no techniques and no BPM history

### Requirement: A lick's tablature is plain text shown in a monospaced style

The system SHALL store the tablature of a lick exactly as the user typed it, preserving every space, line break and repeated space, SHALL show it in a monospaced typeface, and SHALL keep long lines readable by scrolling horizontally instead of collapsing the spacing.

#### Scenario: Alignment is preserved
- **WHEN** the user saves a tablature with spaces used to align the strings
- **THEN** the app shows the same characters in the same columns when the lick is reopened

#### Scenario: Empty tablature is valid
- **WHEN** the user saves a lick with a title but no tablature
- **THEN** the lick is saved and the editor shows its empty tablature area

#### Scenario: Long lines do not reflow
- **WHEN** a tablature line is wider than the available space
- **THEN** the app keeps the line on one row and lets the user scroll it

### Requirement: A lick carries a key from the fixed catalogue

The system SHALL let the user classify a lick with one musical key from a fixed catalogue of the twelve chromatic roots in major and minor, SHALL keep the key optional so a quick idea can be saved without one, SHALL show a lick without a key as unclassified, and SHALL discard a stored key that is not in the catalogue without discarding the lick.

#### Scenario: Choosing a key
- **WHEN** the user picks a key while editing a lick
- **THEN** the app stores it and shows it with the lick

#### Scenario: A key is optional
- **WHEN** the user saves a lick without choosing a key
- **THEN** the lick is saved and shown as unclassified

#### Scenario: An unknown stored key
- **WHEN** a stored lick has a key the catalogue does not contain
- **THEN** the app loads the lick without a key and keeps the rest of its content

### Requirement: Techniques come from a closed global catalogue

The system SHALL let the user classify a lick with any combination of techniques from a single global catalogue — alternate picking, sweep picking, legato, bending, tapping, hybrid picking, economy picking, fingerstyle, rhythm strumming and slide —, SHALL NOT accept a technique chosen as free text, SHALL keep the classification optional, and SHALL discard stored techniques outside the catalogue without discarding the lick.

#### Scenario: Choosing several techniques
- **WHEN** the user selects two or more techniques for a lick
- **THEN** the app stores all of them and shows each one with its name

#### Scenario: The catalogue is the only source
- **WHEN** the user classifies a lick
- **THEN** the app offers only the catalogue techniques and no field for a custom label

#### Scenario: Stored labels outside the catalogue
- **WHEN** a stored lick carries a technique the catalogue does not contain
- **THEN** the app drops that technique and keeps the valid ones and the lick

#### Scenario: Technique names are translated
- **WHEN** the user views the licks library in Spanish or in English
- **THEN** every technique is named in that language

### Requirement: A lick can be linked to one song

The system SHALL let the user link a lick to at most one song from the repertoire, SHALL keep the link optional, SHALL offer only songs and never other licks, and SHALL keep the lick when the linked song is deleted, removing only the link.

#### Scenario: Linking a lick to a song
- **WHEN** the user chooses a song for a lick
- **THEN** the app shows the song with the lick and keeps the link when the lick is edited

#### Scenario: Only songs can be linked
- **WHEN** the user opens the song selector while editing a lick
- **THEN** the app lists the repertoire songs and no licks

#### Scenario: The linked song disappears
- **WHEN** the user deletes the song linked to a lick
- **THEN** the lick keeps loading without a link

### Requirement: Speed progress is recorded per lick

The system SHALL keep, for each lick, an optional target BPM, a current BPM and a dated history of BPM entries with an optional note, SHALL accept BPM values from 40 to 240, and SHALL, when the user records a BPM, append an entry, set it as the current BPM, update the last-practised date and increase the practice count.

#### Scenario: Recording a new BPM
- **WHEN** the user records a BPM for a lick
- **THEN** the app adds an entry dated today with that BPM and the optional note, and shows it as the current BPM

#### Scenario: The history keeps its order
- **WHEN** the user records several BPM entries over time
- **THEN** the app keeps every entry with its date and shows them from oldest to newest

#### Scenario: A target is optional
- **WHEN** the user saves a lick without a target BPM
- **THEN** the lick tracks its current BPM and history without a target

#### Scenario: An out-of-range BPM
- **WHEN** the user enters a BPM lower than 40 or higher than 240
- **THEN** the app rejects it and does not add an entry

#### Scenario: One lick does not affect another
- **WHEN** the user records a BPM for one lick
- **THEN** the target, current BPM, history and practice dates of every other lick stay unchanged

### Requirement: A lick can be marked as practised without a BPM entry

The system SHALL let the user mark a lick as practised today without recording a BPM, updating its last-practised date and increasing its practice count while leaving its current BPM and BPM history unchanged.

#### Scenario: Marking a lick as practised
- **WHEN** the user marks a lick as practised today
- **THEN** its last-practised date becomes today and its practice count increases

#### Scenario: The BPM history is untouched
- **WHEN** the user marks a lick as practised without entering a BPM
- **THEN** no BPM entry is added and the current BPM stays the same

### Requirement: Deleting a lick removes its history

The system SHALL let the user delete a lick after confirming the action, and SHALL remove the lick with its BPM history from the library and from every metric.

#### Scenario: Confirming the deletion
- **WHEN** the user confirms the deletion of a lick
- **THEN** the lick no longer appears in the library, the metrics or the forgotten-lick selection

#### Scenario: Cancelling the deletion
- **WHEN** the user dismisses the confirmation without confirming
- **THEN** the lick and its history stay as they were

### Requirement: Licks persist and sync with the user's data

The system SHALL persist licks with the rest of the user's practice data in the browser and in the cloud, SHALL merge them by identity when local and remote data meet, and SHALL load data saved before this library existed without failing.

#### Scenario: Licks survive a reload
- **WHEN** the user reloads the app after saving licks
- **THEN** the licks, their BPM history and their links are still there

#### Scenario: Licks from another device arrive
- **WHEN** the user's cloud data contains licks this browser does not have
- **THEN** the app merges them into the library without duplicating the ones already present

#### Scenario: Data saved before the library existed
- **WHEN** the app loads practice data that has no licks collection
- **THEN** the app starts with an empty licks library and keeps the rest of the data intact

### Requirement: Repertoire licks migrate once into the new library

The system SHALL, when it loads practice data that still contains licks in the repertoire, convert each one into a lick with the same title and a plain-text tablature built from its stored tablature, leave its key, techniques and BPM history empty, remove it from the repertoire, and SHALL perform the migration only once even if the app is reloaded or the migration is interrupted.

#### Scenario: An existing repertoire lick is migrated
- **WHEN** the app loads data with a repertoire item of kind lick
- **THEN** the licks library contains a lick with that title and its tablature as text, and the repertoire no longer lists the item

#### Scenario: Missing classification is not invented
- **WHEN** a migrated lick has no key, techniques or BPM history
- **THEN** the app leaves those values empty and shows the lick as unclassified

#### Scenario: Running the migration again changes nothing
- **WHEN** the app loads data after the migration has run
- **THEN** no duplicate licks are created and no licks return to the repertoire

#### Scenario: A lick without tablature
- **WHEN** a repertoire lick has no stored tablature
- **THEN** the app migrates it with empty tablature and keeps its title
