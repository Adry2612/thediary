# Spec Delta

## ADDED Requirements

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
