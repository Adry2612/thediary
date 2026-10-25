# Spec Delta

## ADDED Requirements

### Requirement: A song can be created from a catalog result

The system SHALL let the user search an external music catalog while creating a repertoire item, SHALL present several candidates with enough data to tell them apart — title, artist, album, release year and artwork —, and SHALL fill the creation form with the chosen candidate's title, artist, album, release year and artwork.

#### Scenario: Choosing a candidate
- **WHEN** the user searches the catalog and picks one of the candidates
- **THEN** the creation form holds that candidate's title, artist, album, release year and artwork, and every field can still be edited before saving

#### Scenario: No candidate is applied on its own
- **WHEN** the search returns candidates
- **THEN** the form changes only after the user picks one

#### Scenario: Creating by hand
- **WHEN** the user ignores the catalog and types a title
- **THEN** the item is created exactly as it is today

#### Scenario: Nothing found
- **WHEN** the search finds no candidate for the query
- **THEN** the user is told that there are no matches and can still create the song by hand

### Requirement: Catalog metadata is optional and editable

The system SHALL store album, release year, artwork and the catalog source and identifier as optional fields of a repertoire item, SHALL keep an item without them valid and renderable, and SHALL let the user edit or clear them like any other field.

#### Scenario: An item without metadata
- **WHEN** the user creates a song by hand and picks no catalog result
- **THEN** the item is saved and shown with no album, no release year and a placeholder in place of the artwork

#### Scenario: Editing the metadata later
- **WHEN** the user changes or clears the album, the release year or the artwork of a saved item
- **THEN** the app stores the new values and shows them

#### Scenario: Surviving a reload
- **WHEN** the user reopens the app after saving an item with catalog metadata
- **THEN** the album, release year and artwork are still there

#### Scenario: Practice data is not affected
- **WHEN** the album, the release year or the artwork of an item changes
- **THEN** its tuning, capo, parts, chord chart and tablature stay as they were

### Requirement: An existing song can be completed from the catalog

The system SHALL offer the same lookup from an existing song's edit form, pre-filled with that song's title and artist, SHALL fill only the empty metadata fields of the song from the chosen candidate, and SHALL NOT change its title, artist, tuning, capo, parts, chord chart or tablature.

#### Scenario: Filling the gaps
- **WHEN** the user searches from a song that has no album, no release year and no artwork and picks a candidate
- **THEN** those three fields are filled from the candidate

#### Scenario: Keeping what the song already has
- **WHEN** the song already has an album or a release year and the user picks a candidate
- **THEN** the values the song already had are kept

#### Scenario: Practice data is never touched
- **WHEN** a candidate is applied to an existing song
- **THEN** its title, artist, tuning, capo, parts, chord chart and tablature stay exactly as they were

#### Scenario: Closing without choosing
- **WHEN** the user opens the lookup and closes it without picking a candidate
- **THEN** the song is left unchanged

### Requirement: The library shows artwork without depending on the network

The system SHALL show an item's artwork in the library and in its detail when the item has one, SHALL show a neutral placeholder when it has none or the image cannot load, SHALL reserve the artwork's space so the list does not jump, and SHALL render every other field even when the artwork is missing.

#### Scenario: A song with artwork
- **WHEN** the library lists a song that has artwork
- **THEN** the cover is shown next to its title

#### Scenario: A song without artwork
- **WHEN** the library lists a song with no artwork
- **THEN** a placeholder occupies the same space and the rest of the card looks unchanged

#### Scenario: The image cannot load
- **WHEN** the artwork URL fails to load, for example with no connection
- **THEN** the placeholder is shown instead, with no broken-image icon

#### Scenario: A mixed list
- **WHEN** the library shows songs with artwork next to songs without it
- **THEN** the rows stay aligned and scrolling does not shift the layout

### Requirement: The lookup never blocks manual creation

The system SHALL keep manual creation, offline creation and every existing read working when the catalog is unavailable, SHALL report an unavailable catalog differently from an empty result, and SHALL keep what the user has already typed after a failed search.

#### Scenario: The catalog is unavailable
- **WHEN** the catalog answers with an error
- **THEN** the app says the catalog cannot be reached, keeps the values already in the form and still lets the user save the song

#### Scenario: No connection
- **WHEN** the device is offline
- **THEN** the user can still create and edit items by hand and the search reports that the catalog cannot be reached

#### Scenario: A slow catalog
- **WHEN** the catalog takes too long to answer
- **THEN** the search gives up after a bounded wait instead of leaving the form blocked

#### Scenario: An empty result is not an error
- **WHEN** the catalog answers correctly with no candidates
- **THEN** the app reports that there are no matches, not that the catalog is unavailable
