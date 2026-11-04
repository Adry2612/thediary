# Spec Delta

## MODIFIED Requirements

### Requirement: An existing song can be completed from the catalog

The system SHALL offer the same lookup from an existing song's edit form, in its own dialog, pre-filled with that song's title and artist and searched as soon as it opens, SHALL show a preview of the candidate's title, artist, album, release year and artwork before changing the song, SHALL on confirmation update those fields when the candidate provides them and set the catalog source and identifier, and SHALL NOT change its tuning, capo, parts, chord chart, tablature or study material.

#### Scenario: Filling the gaps
- **WHEN** the user searches from a song that has no album, no release year and no artwork, picks a candidate and confirms the preview
- **THEN** those three fields are filled from the candidate

#### Scenario: Opening from a saved song
- **WHEN** the user opens the lookup from a saved song
- **THEN** the dialog is already searching for that song's title and artist and shows the results without a further action

#### Scenario: Keeping what the song already has
- **WHEN** the song already has an album or a release year and the candidate does not provide that value
- **THEN** the value the song already had is kept

#### Scenario: Practice data is never touched
- **WHEN** a candidate is applied to an existing song
- **THEN** its tuning, capo, parts, chord chart, tablature and study material stay exactly as they were

#### Scenario: Closing without choosing
- **WHEN** the user opens the lookup and closes it without picking a candidate
- **THEN** the song is left unchanged

#### Scenario: Previewing the changes
- **WHEN** the user picks a candidate for an existing song
- **THEN** a preview shows the current and the new title, artist, album, release year and artwork before anything is saved

#### Scenario: Applying the candidate
- **WHEN** the user confirms the preview
- **THEN** the song takes the candidate's title, artist and every optional field the candidate provides, and the catalog source and identifier are stored

#### Scenario: Cancelling the preview
- **WHEN** the user closes the preview without confirming
- **THEN** the song keeps its current title, artist, album, release year and artwork
