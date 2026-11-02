# Spec Delta

## ADDED Requirements

### Requirement: A tab can be saved without finishing the lick

The system SHALL offer a **Save tab** action inside the tab editor that persists the current score and the fields that are already valid, SHALL use the provisional title “Sin título” when the title is empty, SHALL keep the user in the editor after saving, and SHALL update the same lick on the next save. Saving the whole lick SHALL keep validating the title and the target BPM as before.

#### Scenario: Saving an unfinished new lick
- **WHEN** the user writes a tab in a new lick, leaves the title empty and presses Save tab
- **THEN** a lick titled “Sin título” is stored and listed in the library, the editor stays open and the tab is kept

#### Scenario: Continuing after a draft save
- **WHEN** the user edits the tab again and presses Save tab a second time
- **THEN** the same lick is updated, not a second one

#### Scenario: Finishing the lick
- **WHEN** the user writes a title and presses Save lick after a draft save
- **THEN** the same lick is updated with the title and the full form, and the user returns to the lick page

#### Scenario: Invalid optional fields do not block the tab
- **WHEN** the target BPM is empty or out of range and the user presses Save tab
- **THEN** the tab is saved and the invalid BPM is not stored

#### Scenario: Saving an existing lick's tab
- **WHEN** the user edits the tab of an existing lick and presses Save tab
- **THEN** the score is updated and the editor stays open

#### Scenario: Feedback after saving
- **WHEN** a tab save finishes
- **THEN** the editor announces “Tablatura guardada” without moving the focus out of the editor

### Requirement: The key is detected from the visual score

The system SHALL estimate the key from the notes, strings and tuning of the score being edited, SHALL ignore dead notes, SHALL require at least three notes and three different pitch classes, and SHALL NOT guess when there are not enough notes.

#### Scenario: Detecting from a visual tab
- **WHEN** the user writes a phrase with enough notes in the visual tab
- **THEN** the editor shows the detected key even if the lick has no legacy grid tab

#### Scenario: A tuning other than standard
- **WHEN** the tab uses an alternative tuning
- **THEN** the detection uses the pitches of that tuning

#### Scenario: Not enough notes
- **WHEN** the tab has one or two notes or fewer than three pitch classes
- **THEN** no key is shown as detected

### Requirement: The detected key is applied while the field is automatic

The system SHALL apply the detected key to the key field while the field is automatic, SHALL stop applying it when the user chooses a key by hand, and SHALL let the user return to automatic with “Usar esta tonalidad”.

#### Scenario: Writing with the key in automatic
- **WHEN** the user keeps writing notes and the detected key changes
- **THEN** the key field follows the detected key

#### Scenario: Choosing a key by hand
- **WHEN** the user selects a key in the field
- **THEN** the field keeps that key even if the detected key changes

#### Scenario: Returning to automatic
- **WHEN** the user presses “Usar esta tonalidad”
- **THEN** the field shows the detected key and follows it again

#### Scenario: Removing the key
- **WHEN** the user chooses “Sin tonalidad”
- **THEN** the field stays empty until the user returns to automatic
