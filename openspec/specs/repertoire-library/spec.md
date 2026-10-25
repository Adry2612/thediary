# repertoire-library Specification

## Purpose
Lists the pieces the user practices and describes each one with what they need to choose it: its difficulty, the practice time actually spent on it, and the type it belongs to.

## Requirements

### Requirement: An item carries its difficulty

The system SHALL let the user choose, when creating or editing an item, one of three difficulties — beginner, intermediate, or advanced —, SHALL keep the choice optional so an item without one stays valid, SHALL show the chosen difficulty with the item, and SHALL keep it when any other field of the item changes.

#### Scenario: Choosing a difficulty when creating
- **WHEN** the user picks a difficulty while creating an item
- **THEN** the app stores it with the item and shows it in the library

#### Scenario: Changing it later
- **WHEN** the user changes the difficulty of a saved item
- **THEN** the app stores the new value

#### Scenario: A difficulty is optional
- **WHEN** the user does not pick a difficulty
- **THEN** the item is saved without one and shows none

#### Scenario: The difficulty survives other edits
- **WHEN** the user changes the title, the artist, or any other field of an item that has a difficulty
- **THEN** the app keeps the difficulty

### Requirement: The type label is singular and steps aside when the list is filtered by type

The system SHALL label each item with its type in the singular — "Canción" for a song and "Lick" for a lick —, and SHALL hide that label while the list is filtered by a single type.

#### Scenario: A song shows the singular label
- **WHEN** the list shows a song
- **THEN** the item is labelled "Canción", not "Canciones"

#### Scenario: Filtering by songs hides the label
- **WHEN** the user filters the list by songs
- **THEN** the items no longer show their type label

#### Scenario: Filtering by licks hides the label
- **WHEN** the user filters the list by licks
- **THEN** the items no longer show their type label

#### Scenario: Showing every type brings the label back
- **WHEN** the user filters by all types
- **THEN** each item shows its type label again

### Requirement: The practice time of an item is the time practiced on it

The system SHALL count, for each item, the time of every completed practice phase linked to that item, whether or not the phase also names one of its parts, SHALL show that time on the item, SHALL add it to the library total, SHALL order the library by it, and SHALL link the item when a practice is started directly from it.

#### Scenario: A phase linked to the item and to a part counts
- **WHEN** a completed phase names an item and one of its parts
- **THEN** its time counts for that item and for that part

#### Scenario: A phase linked only to the item counts
- **WHEN** a completed phase names an item but no part
- **THEN** its time counts for that item

#### Scenario: A phase with no item link does not count
- **WHEN** a completed phase names no item
- **THEN** its time counts for no item

#### Scenario: Starting a practice from an item links it
- **WHEN** the user starts a practice directly from an item
- **THEN** the phase that practice creates names that item, so the time will count when the practice is completed

#### Scenario: The library total adds up
- **WHEN** the items hold practice time
- **THEN** the library total is the sum of those times

### Requirement: The library ranks artists by practised time

The system SHALL show a "most practiced artists" ranking in the repertoire that groups the time of completed phases linked to repertoire songs by the song's artist, sorts the groups from most to least practised, and shows at most five artists with their practised time and song count. The ranking SHALL be derived from existing history, SHALL require no manual favourite mark, and SHALL NOT add storage.

#### Scenario: Ranking by time
- **WHEN** one artist's songs hold more practised time than another's
- **THEN** the artist with more time appears first

#### Scenario: Several songs by one artist
- **WHEN** the user has practised two songs by the same artist
- **THEN** the artist appears once with both songs' time added together

#### Scenario: Same name with different case or spacing
- **WHEN** songs store the same artist name with different capitalisation or surrounding spaces
- **THEN** they appear as one artist in the ranking

#### Scenario: Only songs
- **WHEN** an item is a lick or a phase is not linked to a repertoire item
- **THEN** its time does not enter the artist ranking

#### Scenario: Songs without an artist
- **WHEN** a song has no artist name
- **THEN** its practised time is excluded instead of appearing under an empty artist

#### Scenario: A deleted song
- **WHEN** a phase refers to a repertoire item that no longer exists
- **THEN** its time cannot be attributed and is excluded

#### Scenario: Ties
- **WHEN** two artists have the same practised time
- **THEN** they keep a stable alphabetical order by name

#### Scenario: Top five
- **WHEN** more than five artists have practised time
- **THEN** the ranking shows the five with the most time and no others

#### Scenario: No artist data
- **WHEN** no repertoire song with an artist has practised time
- **THEN** the repertoire shows no artist ranking

#### Scenario: The ranking follows new practice
- **WHEN** the user completes a practice linked to one of an artist's songs
- **THEN** that artist's time and position update without any manual favourite action

### Requirement: The repertoire header offers adding an item

The repertoire SHALL show "Añadir nuevo elemento" as its main header action, SHALL open the creation form in a dialog over the repertoire instead of navigating to a separate page, and SHALL NOT show a "Preparar práctica" action or a separate block that repeats the add action with descriptive text.

#### Scenario: Header action
- **WHEN** the user opens the repertoire
- **THEN** the header shows an "Añadir nuevo elemento" action that opens the creation dialog over the library

#### Scenario: Closing without saving
- **WHEN** the user closes the creation dialog without completing the form
- **THEN** the repertoire is unchanged and the library is visible again

#### Scenario: Saving from the dialog
- **WHEN** the user completes the form and saves
- **THEN** the dialog closes, the item joins the library and the app opens its detail

#### Scenario: No practice shortcut in the header
- **WHEN** the user opens the repertoire
- **THEN** no "Preparar práctica" action appears in the repertoire header

#### Scenario: No duplicate add block
- **WHEN** the repertoire page renders
- **THEN** the add action appears only in the header, without a second block above the saved items that repeats it and explains how to fill the form

#### Scenario: Rest of the repertoire stays unchanged
- **WHEN** the header action changes
- **THEN** the summary, rankings, search, filters and saved items keep their content and position

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

### Requirement: The home screen previews recent songs as cards

The system SHALL show up to four recently updated songs on the home screen as cards, each with its artwork or the neutral placeholder, its title, its artist and album/year when known, its learned-parts progress, and a link to the song's detail. The section SHALL keep its existing loading and empty states.

#### Scenario: A song with artwork
- **WHEN** a recent song has artwork
- **THEN** its card shows the cover next to the title and progress

#### Scenario: A song without artwork
- **WHEN** a recent song has no artwork or the image cannot load
- **THEN** the neutral placeholder occupies the same space and the rest of the card looks unchanged

#### Scenario: Showing progress
- **WHEN** a song has parts
- **THEN** its card shows how many parts are learned out of the total and a progress bar with the same value

#### Scenario: A song without parts
- **WHEN** a song has no parts yet
- **THEN** its card shows the no-parts message instead of an empty progress bar

#### Scenario: Album and year
- **WHEN** a song stores an album or a release year
- **THEN** the card shows that information with the artist, and omits whatever is not stored

#### Scenario: Opening a card
- **WHEN** the user activates a song card
- **THEN** the song's detail opens

#### Scenario: No recent songs
- **WHEN** the repertoire has no songs
- **THEN** the section keeps its existing empty state and its link to the repertoire

#### Scenario: Long text
- **WHEN** a title or artist is longer than the card
- **THEN** the text wraps inside the card without overflowing it

#### Scenario: Narrow viewport
- **WHEN** the home screen is shown on a narrow viewport
- **THEN** the cards keep a readable grid inside the viewport without horizontal scrolling

### Requirement: The library can be grouped by artist or album

The library SHALL offer a grouping choice of none, artist or album, SHALL render each non-empty group as a section with its name and the number of songs it holds, SHALL order the named groups alphabetically ignoring case and accents, and SHALL place the songs without that value in a final group labelled "Sin artista" or "Sin álbum".

#### Scenario: Grouping by artist
- **WHEN** the user chooses to group by artist
- **THEN** each artist with songs in the filtered list gets a section named after the artist, with its song count, and the groups appear in alphabetical order

#### Scenario: Grouping by album
- **WHEN** the user chooses to group by album
- **THEN** each album with songs in the filtered list gets a section named after the album, with its song count, in alphabetical order

#### Scenario: Songs without the value
- **WHEN** some songs have no artist or no album and the list is grouped by that field
- **THEN** those songs appear together in a last section labelled "Sin artista" or "Sin álbum"

#### Scenario: Filters and order survive the grouping
- **WHEN** the list is filtered, searched or sorted and the user turns grouping on
- **THEN** the same songs appear and keep the same order inside each section

#### Scenario: Back to the flat list
- **WHEN** the user chooses not to group
- **THEN** the library renders the flat list again, without section headings

#### Scenario: Grouping is only a view
- **WHEN** the user groups the library and reloads the page
- **THEN** no song has been modified and the grouping is not persisted

#### Scenario: Clearing the filters
- **WHEN** the user activates "Limpiar filtros"
- **THEN** the grouping returns to none along with the other filters and the sort

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
