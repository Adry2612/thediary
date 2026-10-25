# Spec Delta

## ADDED Requirements

### Requirement: Catalog results lead with the best match

The system SHALL present catalog candidates in the order the provider ranks them, SHALL collapse candidates that share a normalized title and artist, and SHALL NOT reorder the answer by release year or by a computed similarity score.

#### Scenario: The original recording comes first
- **WHEN** the user searches for a well-known song such as "master of puppets"
- **THEN** the first candidate is the version by the band that recorded it, ahead of covers, tributes and later re-recordings

#### Scenario: One row per song
- **WHEN** the catalog returns the same title more than once for the same artist
- **THEN** only the first of those candidates is listed

#### Scenario: Different artists keep their turns
- **WHEN** several artists recorded the same title
- **THEN** each artist is listed once, in the provider's order

#### Scenario: The fallback keeps its own order
- **WHEN** the primary catalog answers with no candidates and the fallback answers with some
- **THEN** those candidates are listed in the fallback's order

#### Scenario: A narrow limit
- **WHEN** more candidates survive than the requested number of results
- **THEN** the first ones in provider order are kept and the rest are dropped

## MODIFIED Requirements

### Requirement: A song can be created from a catalog result

The system SHALL let the user search an external music catalog while creating a repertoire item, SHALL open that lookup in its own dialog from a labelled search button on the creation form, SHALL refresh the candidates while the user types without waiting for a submit, and SHALL fill the creation form with the chosen candidate's title, artist, album, release year and artwork.

#### Scenario: Opening the lookup
- **WHEN** the user activates the search button on the creation form
- **THEN** a dialog opens with the query field focused and the form underneath left as it was

#### Scenario: Results follow the typing
- **WHEN** the user types at least two characters in the query
- **THEN** the candidates refresh by themselves after a short pause, without pressing a button or Enter

#### Scenario: One request per burst
- **WHEN** the user types several characters in quick succession
- **THEN** the catalog is queried once for the finished text, not once per keystroke

#### Scenario: Clearing the query
- **WHEN** the user deletes the query down to one character
- **THEN** candidates already listed disappear and no search is made

#### Scenario: Choosing a candidate
- **WHEN** the user picks one of the candidates
- **THEN** the creation form holds that candidate's title, artist, album, release year and artwork, the dialog closes, and every field can still be edited before saving

#### Scenario: No candidate is applied on its own
- **WHEN** the search returns candidates
- **THEN** the form changes only after the user picks one

#### Scenario: Closing without choosing
- **WHEN** the user closes the dialog without picking a candidate
- **THEN** the creation form is left as it was and can still be saved

#### Scenario: Creating by hand
- **WHEN** the user ignores the catalog and types a title
- **THEN** the item is created exactly as it is today

#### Scenario: Nothing found
- **WHEN** the search finds no candidate for the query
- **THEN** the user is told that there are no matches and can still create the song by hand

### Requirement: An existing song can be completed from the catalog

The system SHALL offer the same lookup from an existing song's edit form, in its own dialog, pre-filled with that song's title and artist and searched as soon as it opens, SHALL fill only the empty metadata fields of the song from the chosen candidate, and SHALL NOT change its title, artist, tuning, capo, parts, chord chart or tablature.

#### Scenario: Filling the gaps
- **WHEN** the user searches from a song that has no album, no release year and no artwork and picks a candidate
- **THEN** those three fields are filled from the candidate

#### Scenario: Opening from a saved song
- **WHEN** the user opens the lookup from a saved song
- **THEN** the dialog is already searching for that song's title and artist and shows the results without a further action

#### Scenario: Keeping what the song already has
- **WHEN** the song already has an album or a release year and the user picks a candidate
- **THEN** the values the song already had are kept

#### Scenario: Practice data is never touched
- **WHEN** a candidate is applied to an existing song
- **THEN** its title, artist, tuning, capo, parts, chord chart and tablature stay exactly as they were

#### Scenario: Closing without choosing
- **WHEN** the user opens the lookup and closes it without picking a candidate
- **THEN** the song is left unchanged
