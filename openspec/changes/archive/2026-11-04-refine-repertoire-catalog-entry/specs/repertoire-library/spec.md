# Spec Delta

## MODIFIED Requirements

### Requirement: An existing song can be completed from the catalog

The system SHALL offer the catalog lookup from a named edit action on an existing song: a pencil icon in the song card header, in both the repertoire list and the song detail, that identifies itself as editing the song's data on hover and focus and opens the lookup in its own dialog, pre-filled with that song's title and artist and searched as soon as it opens. It SHALL show a preview of the candidate's title, artist, album, release year and artwork before changing the song, SHALL on confirmation update those fields when the candidate provides them and set the catalog source and identifier, and SHALL NOT change its tuning, capo, parts, chord chart, tablature or study material.

#### Scenario: Filling the gaps
- **WHEN** the user searches from a song that has no album, no release year and no artwork, picks a candidate and confirms the preview
- **THEN** those three fields are filled from the candidate

#### Scenario: Opening from a saved song
- **WHEN** the user opens the lookup from a saved song
- **THEN** the dialog is already searching for that song's title and artist and shows the results without a further action

#### Scenario: The edit icon names its action
- **WHEN** the user points at or focuses the edit icon on a song card
- **THEN** the action says it edits the song's data and exposes the same name to assistive technology

#### Scenario: The icon does not open the song
- **WHEN** the user activates the edit icon on a card in the repertoire list
- **THEN** the lookup opens and the song detail page is not opened

#### Scenario: One entry point per song
- **WHEN** the user expands a song card
- **THEN** the card offers no second textual button that repeats the catalog lookup

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

#### Scenario: The artwork is shown, not its address
- **WHEN** the preview shows the current and the new artwork
- **THEN** it shows each one as an image and does not print its URL or file path
- **AND** a side without artwork shows a placeholder instead of an empty gap

#### Scenario: Applying the candidate
- **WHEN** the user confirms the preview
- **THEN** the song takes the candidate's title, artist and every optional field the candidate provides, and the catalog source and identifier are stored

#### Scenario: The title stays editable afterwards
- **WHEN** the user applies a candidate and then renames the song, for example to add "(acústico)"
- **THEN** the song keeps the new title and the rest of the catalog data

#### Scenario: Cancelling the preview
- **WHEN** the user closes the preview without confirming
- **THEN** the song keeps its current title, artist, album, release year and artwork
